/**
 * Song datapack emitter — implements `docs/song-pack-contract.md` §1–§7 exactly.
 *
 * Turns a parsed map plus a resolved slug into the complete zip content of one song datapack: lifecycle
 * functions, per-difficulty dispatchers, note/wall/light level files, `pack.mcmeta`, `pack.png` and the
 * install README. All numbers go through {@link fmtCoord}/{@link fmtInt} so locale bugs (B2) cannot occur.
 */

import { ConversionError, ConversionErrorKind } from './conversion-error';
import { expandChainsToDots } from './chain-expansion';
import { beatToSeconds, buildSpawnEvents, normalizeBpmSegments, TICKS_PER_SECOND } from './tick-table';
import type {
  Beatmap,
  LightEventModel,
  NoteModel,
  ObstacleModel,
  ParsedMap,
  SpawnBombEvent,
  SpawnLightEvent,
  SpawnNoteEvent,
  SpawnWallEvent,
  SongInfo,
} from './types';

/** Song contract version embedded in markers, mcmeta and the handshake (`BS_API_VERSION`). */
export const BS_API_VERSION = 1;

/** Maximum counted commands per level file (port of `Globals.COMMAND_LIMIT`). */
export const COMMAND_LIMIT = 10000;

/** Ticks between a flash-on and its converter-emitted off command (contract §3.5). */
export const FLASH_OFF_TICKS = 40;

/** Lane spacing in meters for note cursor offsets (contract §3.3). */
const GRID_STEP = 0.3;

/** One wall segment length in meters, 24 per beat (contract §3.1/§3.4). */
const WALL_SEGMENT_METERS = 0.21;

/** Walls reaching this many beats get split so no single wall entry can flood a level file (§7). */
const WALL_CHUNK_TRIGGER_BEATS = 16;

/** Duration of each chunk a long wall is cut into (a chunk stays far below `COMMAND_LIMIT`). */
const WALL_CHUNK_BEATS = 12;

/** Hard tick-range cap before a map is rejected as absurd (§7 `SongTooLong`). */
const MAX_SONG_TICK_RANGE = 2 ** 31;

/** The `bs_node_origin` selector every cursor teleport positions from (§3.3). */
const ORIGIN_SELECTOR = '@e[type=marker,tag=bs_node_origin,limit=1]';

/** The `bs_node_cursor` selector every dispatch runs as (§3.3). */
const CURSOR_SELECTOR = '@e[type=marker,tag=bs_node_cursor,limit=1]';

/** Converts arbitrary cover image bytes into a real PNG, fixing Unity bug B1; implemented by the caller. */
export interface CoverImageConverter {
  /**
   * Re-encode a cover image to PNG bytes.
   *
   * @param coverBytes Raw cover bytes from the map zip.
   * @returns Real PNG file bytes (never a renamed JPEG).
   */
  toPng(coverBytes: Uint8Array): Promise<Uint8Array>;
}

/** A fully parsed map plus the caller-resolved namespace slug, ready for emission. */
export interface ParsedSong extends ParsedMap {
  /** Namespace slug from `slug.ts` (lowercase hex, without the `bs_` prefix), contract §1.2. */
  slug: string;
}

/** Options for {@link emitSongPack}. */
export interface EmitDataPackOptions {
  /** Cover-to-PNG converter; the browser worker supplies an OffscreenCanvas one. */
  coverConverter: CoverImageConverter;
}

/** Emission summary for one difficulty actually shipped in the pack. */
export interface EmittedDifficulty {
  /** `<difficulty>_<characteristic>` token and function-name prefix (§1.3). */
  token: string;
  /** Raw Beat Saber characteristic name. */
  characteristic: string;
  /** Raw Beat Saber difficulty name. */
  difficulty: string;
  /** Note-stream entries emitted (notes including chain dots, plus bombs). */
  notes: number;
  /** Wall obstacles emitted. */
  walls: number;
  /** Light events emitted (after §3.5 drops). */
  lights: number;
  /** Per-difficulty lead-in ticks before audio start (§3.1). */
  leadTicks: number;
  /** Lead distance in meters, `clamp(bpm/6, 7, 20)` (§3.1, marker `lead_m`). */
  leadMeters: number;
  /** `metersPerTick × 1e6` rounded to an integer (§3.1, marker `mpt_millionths`). */
  mptMillionths: number;
  /** Absolute tick of the last emitted command for this difficulty (§2.1 `end_tick`). */
  endTick: number;
}

/** A whole emitted song datapack keyed at the zip root. */
export interface EmittedDataPack {
  /** All files keyed by zip-root-relative path; string values are UTF-8 text. */
  files: Map<string, string | Uint8Array>;
  /** Full namespace, e.g. `bs_443f3a1b`. */
  namespace: string;
  /** One entry per shipped difficulty, in info-file order. */
  difficulties: EmittedDifficulty[];
}

/**
 * Format a coordinate per contract §6: six decimal places, trailing zeros kept, never scientific.
 *
 * @param value Coordinate value in blocks.
 * @returns Invariant fixed-point string such as `0.300000` or `-0.126000`.
 */
export function fmtCoord(value: number): string {
  const text = Number(value).toFixed(6);
  return text === '-0.000000' ? '0.000000' : text;
}

/**
 * Format an integer tick or score per contract §6: truncated, no leading plus.
 *
 * @param value Value to truncate.
 * @returns Plain decimal string.
 */
export function fmtInt(value: number): string {
  return Math.trunc(value).toString();
}

/**
 * Emit the complete song datapack content for one parsed map per the song-pack contract.
 *
 * @param song Parsed map plus resolved slug (see `slug.ts`).
 * @param options Cover image converter used for `pack.png`.
 * @returns Zip-ready file map plus emission summary.
 * @throws ConversionError With `SlugCollision` (malformed/oversized namespace), `DuplicateDifficulty`,
 *   or `SongTooLong` per contract §7.
 */
export async function emitSongPack(song: ParsedSong, options: EmitDataPackOptions): Promise<EmittedDataPack> {
  const namespace = validateSlug(song.slug);
  const nsFunctions = `data/${namespace}/function`;
  const files = new Map<string, string | Uint8Array>();
  const tokens = resolveTokens(song.beatmaps);
  const shipped = tokens
    .map((token, index) => ({ token, beatmap: song.beatmaps[index] }))
    .filter(
      ({ beatmap }) =>
        beatmap.notes.length + beatmap.chains.length + beatmap.bombs.length > 0 || beatmap.obstacles.length > 0,
    );
  const difficulties: EmittedDifficulty[] = [];
  for (const { token, beatmap } of shipped) {
    const result = emitDifficulty(namespace, token, beatmap, song.info);
    for (const [name, text] of result.files) files.set(`${nsFunctions}/${name}`, text);
    difficulties.push(result.summary);
  }
  files.set(`${nsFunctions}/probe.mcfunction`, probeFile(song.slug, song.info));
  files.set(`${nsFunctions}/install.mcfunction`, installFile(namespace, song.slug, song.info, difficulties));
  files.set(`${nsFunctions}/auto_install.mcfunction`, autoInstallFile(namespace, song.slug, song.info, difficulties));
  files.set(`${nsFunctions}/register.mcfunction`, registerFile(namespace));
  files.set(`${nsFunctions}/uninstall.mcfunction`, uninstallFile(namespace, song.slug, difficulties));
  files.set(
    'data/minecraft/tags/function/load.json',
    `${JSON.stringify({ values: [`${namespace}:register`] }, null, 2)}\n`,
  );
  files.set('pack.mcmeta', songMcMeta(song.info, song.slug));
  files.set('README-install.txt', readmeInstall(namespace, song.info, song.slug, difficulties));
  files.set('pack.png', await options.coverConverter.toPng(song.assets.coverBytes));
  return { files, namespace, difficulties };
}

interface DifficultyEmission {
  files: Map<string, string>;
  summary: EmittedDifficulty;
}

function emitDifficulty(namespace: string, token: string, beatmap: Beatmap, info: SongInfo): DifficultyEmission {
  const chainDots = expandChainsToDots(beatmap, info);
  const expanded: Beatmap = {
    ...beatmap,
    notes: [...beatmap.notes, ...chainDots],
    obstacles: beatmap.obstacles.flatMap(chunkWall),
  };
  const events = buildSpawnEvents(expanded, info);
  const range = events.reduce(
    (span, event) => Math.max(span, event.tick, event.kind === 'wall' ? event.endTick : event.tick),
    Number.NEGATIVE_INFINITY,
  );
  const floor = events.reduce((min, event) => Math.min(min, event.tick), Number.POSITIVE_INFINITY);
  if (range - floor > MAX_SONG_TICK_RANGE) {
    throw new ConversionError(
      ConversionErrorKind.SongTooLong,
      `${beatmap.characteristic}/${beatmap.difficulty} spans ${fmtInt(range - floor)} game ticks, beyond the ${MAX_SONG_TICK_RANGE}-tick limit`,
    );
  }
  const segments = normalizeBpmSegments(beatmap.bpmChanges, info.bpm);
  const bpm = segments[0].bpm;
  const metersPerTick = ((bpm / 60) * 24 * WALL_SEGMENT_METERS) / TICKS_PER_SECOND;
  const leadMeters = Math.min(Math.max(bpm / 6, 7), 20);
  const leadTicks = Math.trunc(leadMeters / metersPerTick);
  const exactTick = (beat: number): number =>
    (beatToSeconds(beat, segments) - beatmap.offsetSeconds) * TICKS_PER_SECOND;
  const noteEntries = events
    .filter((event): event is SpawnNoteEvent | SpawnBombEvent => event.kind === 'note' || event.kind === 'bomb')
    .map((event) =>
      event.kind === 'note'
        ? noteEntry(event.tick, event.note, exactTick(event.note.beat), metersPerTick)
        : bombEntry(event.tick, event.bomb.x, event.bomb.y, exactTick(event.bomb.beat), metersPerTick),
    );
  const wallEntries = events
    .filter((event): event is SpawnWallEvent => event.kind === 'wall')
    .map((event) => wallEntry(event.tick, event.wall, exactTick(event.wall.beat), metersPerTick));
  const lightEntries = events
    .filter((event): event is SpawnLightEvent => event.kind === 'light')
    .flatMap((event) => {
      const entry = lightEntry(event.tick, event.light);
      return entry === null ? [] : [entry];
    });

  const notes = buildStream(noteEntries, leadTicks, 'bs_notes');
  const walls = buildStream(wallEntries, leadTicks, 'bs_walls');
  const lights = buildStream(lightEntries, leadTicks, 'bs_lights');

  const files = new Map<string, string>();
  const streamSpecs: Array<{ kind: string; stream: StreamBuild }> = [
    { kind: 'notes', stream: notes },
    { kind: 'walls', stream: walls },
    { kind: 'lights', stream: lights },
  ];
  for (const { kind, stream } of streamSpecs) {
    stream.files.forEach((lines, index) => {
      files.set(`${token}_${kind}_lvl_${index + 1}.mcfunction`, `${lines.join('\n')}\n`);
    });
  }
  files.set(`${token}_play.mcfunction`, playFile(namespace, token, leadTicks, streamSpecs));
  const endTick = Math.max(notes.doneTick, walls.doneTick, lights.doneTick);
  const summary: EmittedDifficulty = {
    token,
    characteristic: beatmap.characteristic,
    difficulty: beatmap.difficulty,
    notes: noteEntries.length,
    walls: wallEntries.length,
    lights: lightEntries.length,
    leadTicks,
    leadMeters,
    mptMillionths: Math.round(metersPerTick * 1_000_000),
    endTick,
  };
  return { files, summary };
}

interface StreamEntry {
  /** Tick of the first command; orders the stream and anchors splits. */
  tick: number;
  /** Highest `matches` tick used by any command in this entry (flash-off included). */
  maxTick: number;
  lines: string[];
}

interface StreamBuild {
  files: string[][];
  /** Gate ranges per level file, parallel to `files`. */
  gates: Array<{ min: number; max: number }>;
  /** Done-flag tick of this stream (§3.7). */
  doneTick: number;
}

function buildStream(entries: StreamEntry[], leadTicks: number, doneTarget: string): StreamBuild {
  const files: string[][] = [];
  const firstTicks: number[] = [];
  const lastTicks: number[] = [];
  let current: string[] = [];
  let currentCount = 0;
  let currentFirst = 0;
  let currentMax = 0;
  const flush = (): void => {
    files.push(current);
    firstTicks.push(currentFirst);
    lastTicks.push(currentMax);
    current = [];
    currentCount = 0;
    currentFirst = 0;
    currentMax = 0;
  };
  for (const entry of entries) {
    if (currentCount > 0 && currentCount + entry.lines.length > COMMAND_LIMIT) flush();
    if (currentCount === 0) currentFirst = entry.tick;
    current.push(...entry.lines);
    currentCount += entry.lines.length;
    currentMax = Math.max(currentMax, entry.maxTick);
  }
  let doneTick: number;
  if (currentCount === 0) {
    doneTick = leadTicks + 1;
    files.push([doneLine(doneTick, doneTarget)]);
    firstTicks.push(doneTick);
    lastTicks.push(doneTick);
  } else {
    flush();
    doneTick = lastTicks[lastTicks.length - 1] + leadTicks + 1;
    files[files.length - 1].push(doneLine(doneTick, doneTarget));
  }
  const gates = files.map((_, index) => {
    const min = index === 0 ? Math.min(0, firstTicks[index]) : firstTicks[index];
    const max = index === files.length - 1 ? doneTick : lastTicks[index];
    return { min, max: Math.max(min, max) };
  });
  return { files, gates, doneTick };
}

function doneLine(doneTick: number, doneTarget: string): string {
  return `execute if score @s curr_tick matches ${fmtInt(doneTick)} run scoreboard players set #${doneTarget} bs_finished 1`;
}

function playFile(
  namespace: string,
  token: string,
  leadTicks: number,
  specs: Array<{ kind: string; stream: StreamBuild }>,
): string {
  // The music origin is the fixed End stage anchor (§2.3), matching the old converter's template. The `in`
  // clause is mandatory: positional playsound resolves in the executing dimension, and the dispatcher's tick
  // chain runs at the overworld origin, so the run would be audible only to players standing in the overworld.
  const lines = [
    `execute if score @s curr_tick matches ${fmtInt(leadTicks)} in minecraft:the_end run playsound bsong_${namespace.slice(3)} music @a 0.0 150.0 500.0 1 1`,
  ];
  for (const { kind, stream } of specs) {
    stream.gates.forEach((gate, index) => {
      const lightGate = kind === 'lights' ? ' if score #CONST bs_lightshow matches 1' : '';
      lines.push(
        `execute if score @s curr_tick matches ${fmtInt(gate.min)}..${fmtInt(gate.max)}${lightGate} run function ${namespace}:${token}_${kind}_lvl_${index + 1}`,
      );
    });
  }
  return `${lines.join('\n')}\n`;
}

function cursorTeleport(tick: number, x: number, y: number, z: number): string {
  return `execute if score @s curr_tick matches ${fmtInt(tick)} at ${ORIGIN_SELECTOR} run teleport ${CURSOR_SELECTOR} ~${fmtCoord(x)} ~${fmtCoord(y)} ~${fmtCoord(z)}`;
}

function cursorDispatch(tick: number, engineFunction: string): string {
  return `execute if score @s curr_tick matches ${fmtInt(tick)} as ${CURSOR_SELECTOR} run function ${engineFunction}`;
}

function noteEntry(tick: number, note: NoteModel, exact: number, metersPerTick: number): StreamEntry {
  const lines = [
    cursorTeleport(
      tick,
      (note.x - 1) * GRID_STEP,
      (note.y - 1) * GRID_STEP,
      -subTickMeters(exact, tick, metersPerTick),
    ),
    cursorDispatch(tick, `block_saber:notes/${noteFunction(note)}`),
  ];
  return { tick, maxTick: tick, lines };
}

function bombEntry(tick: number, x: number, y: number, exact: number, metersPerTick: number): StreamEntry {
  const lines = [
    cursorTeleport(tick, (x - 1) * GRID_STEP, (y - 1) * GRID_STEP, -subTickMeters(exact, tick, metersPerTick)),
    cursorDispatch(tick, 'block_saber:notes/bomb'),
  ];
  return { tick, maxTick: tick, lines };
}

function subTickMeters(exact: number, tick: number, metersPerTick: number): number {
  const frac = exact - tick;
  return Math.abs(frac) < 1e-9 ? 0 : frac * metersPerTick;
}

function noteFunction(note: NoteModel): string {
  const color = note.color === 1 ? 'blue' : note.color === 2 ? 'white' : 'red';
  const cut =
    Number.isInteger(note.cutDirection) && note.cutDirection >= 0 && note.cutDirection <= 8 ? note.cutDirection : 8;
  return `${color}_${CUT_NAMES[cut]}`;
}

const CUT_NAMES = ['up', 'down', 'left', 'right', 'up_left', 'up_right', 'down_left', 'down_right', 'dot'];

/**
 * Cut a wall at or past the trigger duration into equal consecutive chunks (§7).
 *
 * A wall emits one segment pair per 0.21 m of its length and `buildStream` can only split level files
 * between entries, so an unchunked 31-beat crouch tunnel would pile ~1500 lines into a single entry.
 *
 * @param wall The parsed obstacle.
 * @returns The wall itself, or equal-duration consecutive copies tiling the same span.
 */
function chunkWall(wall: ObstacleModel): ObstacleModel[] {
  if (wall.durationBeats < WALL_CHUNK_TRIGGER_BEATS) return [wall];
  const parts = Math.ceil(wall.durationBeats / WALL_CHUNK_BEATS);
  const duration = wall.durationBeats / parts;
  return Array.from({ length: parts }, (_, index) => ({
    ...wall,
    beat: wall.beat + duration * index,
    durationBeats: duration,
  }));
}

function wallEntry(tick: number, wall: ObstacleModel, exact: number, metersPerTick: number): StreamEntry {
  // Contract §3.4 (amended): a wall is tall iff it starts at row 0-1 AND spans >= 3 rows; bsmap maps v2
  // crouch walls to {y: 2, height: 3}, so the y check is what separates crouch from full-height walls.
  const tall = wall.y <= 1 && wall.height >= 3;
  const wallY = tall ? 0.3 : 0.6;
  const width = Math.min(Math.max(Math.trunc(wall.width), 1), 4);
  const pieces: Array<{ lane: number; fn: string }> =
    width === 1
      ? [{ lane: wall.x, fn: tall ? 'wall_1x1' : 'wall_1x3' }]
      : width === 2
        ? [{ lane: wall.x, fn: 'wall_2x1' }]
        : width === 3
          ? [
              { lane: wall.x, fn: 'wall_2x1' },
              { lane: wall.x + 2, fn: tall ? 'wall_1x1' : 'wall_1x3' },
            ]
          : [
              { lane: wall.x, fn: 'wall_2x1' },
              { lane: wall.x + 2, fn: 'wall_2x1' },
            ];
  const segments = Math.max(1, Math.trunc(wall.durationBeats * 24));
  const fractionMeters = subTickMeters(exact, tick, metersPerTick);
  const lines: string[] = [];
  let maxTick = tick;
  for (let index = 0; index < segments; index += 1) {
    const meters = fractionMeters + WALL_SEGMENT_METERS * index;
    const tickOffset = meters !== 0 ? Math.trunc(meters / metersPerTick) : 0;
    const remainder = meters - tickOffset * metersPerTick;
    const segmentTick = tick + tickOffset;
    maxTick = Math.max(maxTick, segmentTick);
    for (const piece of pieces) {
      lines.push(cursorTeleport(segmentTick, piece.lane * GRID_STEP, wallY, -remainder));
      lines.push(cursorDispatch(segmentTick, `block_saber:walls/${piece.fn}`));
    }
  }
  return { tick, maxTick, lines };
}

const LIGHT_GROUPS: Record<number, string> = {
  0: 'back_lasers',
  1: 'rings',
  2: 'rotating_left',
  3: 'rotating_right',
  4: 'center',
  5: 'boost',
  6: 'extra_left',
  7: 'extra_right',
  10: 'side_lasers_left',
  11: 'side_lasers_right',
};

const BLUE_SIDE_GROUPS = new Set(['center', 'rotating_right', 'extra_right', 'side_lasers_right']);

interface LightAction {
  on: boolean;
  color: number;
  flash: boolean;
}

function lightEntry(tick: number, light: LightEventModel): StreamEntry | null {
  const group = LIGHT_GROUPS[light.type];
  if (group === undefined) return null;
  const sideColor = BLUE_SIDE_GROUPS.has(group) ? 16 : 24;
  const action = decodeLightValue(light.value, sideColor);
  if (action === null) return null;
  const lines = [
    lightSet(tick, group, 'bs_light_on', action.on ? 1 : 0),
    lightSet(tick, group, 'bs_light_color', action.color),
  ];
  let maxTick = tick;
  if (action.flash) {
    maxTick = tick + FLASH_OFF_TICKS;
    lines.push(lightSet(maxTick, group, 'bs_light_on', 0), lightSet(maxTick, group, 'bs_light_color', 0));
  }
  return { tick, maxTick, lines };
}

/**
 * Decode an event value through the single §3.5 value table (port of `EventDataToCommands`).
 *
 * The parser normalizes every non-v2 format into this v2 value domain before the event reaches the
 * emitter (see `v4-lights.ts`), so this decoder never sees a raw v3/v4 field.
 */
function decodeLightValue(value: number, sideColor: number): LightAction | null {
  if (!Number.isInteger(value) || value < 0 || value > 11) return null;
  if (value === 0 || value === 4) return { on: false, color: 0, flash: false };
  if (value === 3) return { on: true, color: sideColor, flash: true };
  if (value === 1 || value === 2) return { on: true, color: sideColor, flash: false };
  return { on: true, color: 24, flash: false };
}

function lightSet(tick: number, group: string, objective: string, value: number): string {
  return `execute if score @s curr_tick matches ${fmtInt(tick)} run scoreboard players set #${group} ${objective} ${fmtInt(value)}`;
}

const DIFFICULTY_TOKENS: Record<string, string> = {
  Easy: 'easy',
  Normal: 'normal',
  Hard: 'hard',
  Expert: 'expert',
  ExpertPlus: 'expert_plus',
};

const CHARACTERISTIC_TOKENS: Record<string, string> = {
  Standard: 'standard',
  Lawless: 'lawless',
  AllDirection: 'all_direction',
  Extended: 'extended',
  OneSaber: 'one_saber',
  NoArrows: 'no_arrows',
  '360Degree': 'degree_360',
  VerticalSingle: 'vertical_single',
  Legacy: 'legacy',
};

const TABLE_CHARACTERISTIC_TOKENS = new Set(Object.values(CHARACTERISTIC_TOKENS));

function resolveTokens(beatmaps: readonly Beatmap[]): string[] {
  const seenPairs = new Set<string>();
  const seenTokens = new Map<string, string>();
  const tokens: string[] = [];
  for (const beatmap of beatmaps) {
    const pair = `${beatmap.characteristic}\u0000${beatmap.difficulty}`;
    if (seenPairs.has(pair)) {
      throw new ConversionError(
        ConversionErrorKind.DuplicateDifficulty,
        `Info file lists "${beatmap.characteristic}" / "${beatmap.difficulty}" more than once`,
      );
    }
    seenPairs.add(pair);
    const token = `${difficultyToken(beatmap.difficulty)}_${characteristicToken(beatmap.characteristic)}`;
    const previous = seenTokens.get(token);
    if (previous !== undefined) {
      throw new ConversionError(
        ConversionErrorKind.DuplicateDifficulty,
        `Difficulties "${previous}" and "${beatmap.characteristic} ${beatmap.difficulty}" both map to name "${token}"`,
      );
    }
    seenTokens.set(token, `${beatmap.characteristic} ${beatmap.difficulty}`);
    tokens.push(token);
  }
  return tokens;
}

function difficultyToken(difficulty: string): string {
  return DIFFICULTY_TOKENS[difficulty] ?? sanitizeToken(difficulty) ?? 'unknown';
}

function characteristicToken(characteristic: string): string {
  const known = CHARACTERISTIC_TOKENS[characteristic];
  if (known !== undefined) return known;
  const sanitized = sanitizeToken(characteristic);
  if (sanitized === null || TABLE_CHARACTERISTIC_TOKENS.has(sanitized)) return 'unknown';
  return sanitized;
}

function sanitizeToken(raw: string): string | null {
  const cleaned = raw
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
  return cleaned === '' ? null : cleaned;
}

function validateSlug(slug: string): string {
  const namespace = `bs_${slug}`;
  if (slug === '' || !/^[0-9a-z_]+$/.test(slug) || namespace.length > 16) {
    throw new ConversionError(
      ConversionErrorKind.SlugCollision,
      `Slug "${slug}" is not usable as bs_<slug> (lowercase [0-9a-f_], namespace at most 16 characters); grow it per contract §1.2 or report a slug collision`,
    );
  }
  return namespace;
}

function probeFile(slug: string, info: SongInfo): string {
  const lines = [
    `# bs_${slug} — ${info.title} (${info.songAuthorName}) — probe file (contract §2.4): its presence marks the song`,
    '# installed. 26.3 `execute unless function` runs the probe and tests its result, so it must return nonzero.',
    'return 1',
  ];
  return `${lines.join('\n')}\n`;
}

function installFile(namespace: string, slug: string, info: SongInfo, difficulties: EmittedDifficulty[]): string {
  const lines = [
    `# ${namespace} — ${info.title} (${info.songAuthorName}) — Block Saber song contract ${BS_API_VERSION}`,
    `execute unless score #CONST song_contract matches ${BS_API_VERSION} run tellraw @s {text:"[BlockSaber] Install the base BlockSaber datapack first.",color:"red"}`,
    `execute unless score #CONST song_contract matches ${BS_API_VERSION} run return 0`,
    `function ${namespace}:uninstall`,
    'scoreboard objectives add bs_complete dummy',
    `data modify storage bs:songs ${slug} set value ${songRecord(slug, info, difficulties)}`,
    orderUpsert(slug),
    ...difficulties.map((diff) => `scoreboard players set #${slug}_${diff.token} bs_complete 0`),
    `tellraw @s [{text:"[BlockSaber] ",color:"green"},{text:${JSON.stringify(`${truncate64(info.title)} installed (${difficulties.length} difficulties).`)},color:"white"}]`,
  ];
  return `${lines.join('\n')}\n`;
}

function registerFile(namespace: string): string {
  const lines = [
    `# ${namespace} — minecraft:load tag hook (contract §2.4): stage this pack's auto-install for the engine's`,
    "# tick drain. The engine owns the shared bs:songs registry and does its writes outside this pack's load",
    '# context, one queue entry per tick (and a later tick also survives pack-order uncertainty at load).',
    '# The call is direct: 26.3 `execute if function` would EXECUTE register_stage inside its condition, so an',
    '# existence guard around it is impossible (and pointless when the direct call is one line shorter).',
    `data modify storage bs:engine reg_slot.installer set value "${namespace}:auto_install"`,
    'function block_saber:song/register_stage with storage bs:engine reg_slot',
  ];
  return `${lines.join('\n')}\n`;
}

function autoInstallFile(namespace: string, slug: string, info: SongInfo, difficulties: EmittedDifficulty[]): string {
  const lines = [
    `# ${namespace} — auto-install run by the base engine on the tick after load (contract §2.4): rewrite this`,
    '# song\u2019s bs:songs registry record (§2.1: 26.3 dropped free-form entity NBT, so the registry is storage).',
    '# Completion records survive reloads, so scores are defaulted to 0 with add - never reset; a genuine fresh',
    '# install is the manual ns:install path. The marker kill only cleans up pre-storage-registry installs.',
    `kill @e[type=minecraft:marker,tag=${namespace}]`,
    'scoreboard objectives add bs_complete dummy',
    `data modify storage bs:songs ${slug} set value ${songRecord(slug, info, difficulties)}`,
    orderUpsert(slug),
    ...difficulties.map((diff) => `scoreboard players add #${slug}_${diff.token} bs_complete 0`),
  ];
  return `${lines.join('\n')}\n`;
}

function uninstallFile(namespace: string, slug: string, difficulties: EmittedDifficulty[]): string {
  const lines = [
    `# ${namespace} — removes the bs:songs registry record, order entry, legacy marker, and completion entries`,
    `# installed by ${namespace}:install.`,
    `kill @e[type=minecraft:marker,tag=${namespace}]`,
    `data remove storage bs:songs ${slug}`,
    `data remove storage bs:songs order[{slug:"${slug}"}]`,
    ...difficulties.map((diff) => `scoreboard players reset #${slug}_${diff.token} bs_complete`),
  ];
  return `${lines.join('\n')}\n`;
}

function songRecord(slug: string, info: SongInfo, difficulties: EmittedDifficulty[]): string {
  const diffs = difficulties
    .map(
      (diff) =>
        `{id:${snbt(diff.token)},diff:${snbt(diff.difficulty)},char:${snbt(diff.characteristic)},notes:${fmtInt(diff.notes)},end_tick:${fmtInt(diff.endTick)},mpt_millionths:${fmtInt(diff.mptMillionths)},lead_m:${fmtInt(diff.leadMeters)}}`,
    )
    .join(',');
  return (
    `{slug:${snbt(slug)},contract:${BS_API_VERSION},sound:${snbt(`bsong_${slug}`)},` +
    `title:${snbt(truncate64(info.title))},artist:${snbt(truncate64(info.songAuthorName))},` +
    `level:${snbt(levelSummary(difficulties))},diffs:[${diffs}]}`
  );
}

function orderUpsert(slug: string): string {
  return `execute unless data storage bs:songs order[{slug:"${slug}"}] run data modify storage bs:songs order append value {slug:"${slug}"}`;
}

function levelSummary(difficulties: EmittedDifficulty[]): string {
  const byCharacteristic = new Map<string, string[]>();
  for (const diff of difficulties) {
    const list = byCharacteristic.get(diff.characteristic) ?? [];
    list.push(diff.difficulty);
    byCharacteristic.set(diff.characteristic, list);
  }
  return Array.from(byCharacteristic, ([characteristic, list]) => `${characteristic} ${list.join(' / ')}`).join(', ');
}

function truncate64(text: string): string {
  return Array.from(text).slice(0, 64).join('');
}

function snbt(text: string): string {
  let cleaned = '';
  for (const char of text) {
    const code = char.codePointAt(0) as number;
    cleaned += code <= 0x1f || code === 0x7f ? ' ' : char;
  }
  return `"${cleaned.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
}

function songMcMeta(info: SongInfo, slug: string): string {
  const description = `Block Saber song: ${info.title} by ${info.songAuthorName} [bs_${slug} / song contract ${BS_API_VERSION}]`;
  return `{
  "pack": {
    "pack_format": 121.0,
    "min_format": 121.0,
    "max_format": 121.99,
    "description": ${JSON.stringify(description)}
  }
}
`;
}

function readmeInstall(namespace: string, info: SongInfo, slug: string, difficulties: EmittedDifficulty[]): string {
  return `Block Saber song pack — ${info.title} (${info.songAuthorName})
Namespace: ${namespace} — song contract ${BS_API_VERSION} — ${difficulties.length} difficulty entries

1. Keep this file's .zip intact and drop it into your world's datapacks folder:
   .minecraft/saves/<world>/datapacks/
2. The world must also run the BlockSaber base datapack (game/template-world) — song packs are data only.
3. Start Minecraft 26.3+ (data pack format 121), load the world, then run /reload.
4. The song registers itself automatically on that reload — no command needed. To force a fresh
   registration (this also wipes this song's completion records), run:

   /function ${namespace}:install

5. Audio lives in the cumulative "Block Saber Songs" resource pack, not here. Put that zip into
   .minecraft/resourcepacks/ and enable it in Video Settings -> Resource Packs.

To uninstall: run /function ${namespace}:uninstall, then delete this zip from datapacks/.
`;
}
