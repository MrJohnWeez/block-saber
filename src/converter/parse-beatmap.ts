import { v2, v3, v4, type IWrapBeatmap } from 'bsmap/schema';

import { ConversionError, ConversionErrorKind } from './conversion-error';
import { decodeEntryText, lookupMapPath, type OpenedMapZip } from './read-map-zip';
import type {
  Beatmap,
  BeatmapFormatVersion,
  BeatmapRef,
  BombModel,
  BpmChangeEvent,
  LightEventModel,
  NoteModel,
  ObstacleModel,
  ParsedMap,
  SongInfo,
} from './types';

/** Any JSON object read from a map file before schema validation. */
type RawData = Record<string, unknown>;

/**
 * Parse an opened map zip into the internal model, throwing typed errors for broken maps.
 *
 * The info file decides the format version: v2 has `_version`/`_difficultyBeatmapSets`, v3 has
 * `version: 3.x` with short-key `difficultyBeatmapSets`, and v4 has `version: 4.x` with a flat
 * `difficultyBeatmaps` array plus separate `.lightshow.dat` files.
 *
 * @param zip Opened zip from {@link readMapZip}.
 * @returns Normalized song info, per-difficulty objects, and binary assets.
 * @throws ConversionError With `InvalidBeatMap`, `UnsupportedVersion`, `NoMapData`, `MissingSongFile`,
 *   `MissingCover`, or `MissingSongData` depending on what the map lacks.
 */
export function parseBeatmap(zip: OpenedMapZip): ParsedMap {
  const info = normalizeInfo(parseJson(zip.infoText, 'Info file'));
  const songHit = requireSongAsset(zip, info.songFilename);
  const coverHit = requireAsset(zip, info.coverFilename, ConversionErrorKind.MissingCover, 'Cover image file');
  const audioBpmChanges = info.audioDataFilename === null ? [] : bpmChangesFromAudioData(zip, info.audioDataFilename);
  const lightshowCache = new Map<string, LightEventModel[]>();
  const beatmaps: Beatmap[] = [];
  for (const ref of info.beatmapRefs) {
    const dataHit = requireAsset(
      zip,
      ref.beatmapDataFilename,
      ConversionErrorKind.MissingSongData,
      'Beatmap data file',
    );
    const wrap = deserializeBeatmapFile(decodeEntryText(zip.entries, dataHit), info.formatVersion);
    const lightEvents = lightEventsFor(zip, info.formatVersion, ref, wrap, lightshowCache);
    const bpmChanges = wrap.difficulty.bpmEvents.map((event) => ({ beat: event.time, bpm: event.bpm }));
    beatmaps.push({
      characteristic: ref.characteristic,
      difficulty: ref.difficulty,
      difficultyRank: ref.difficultyRank,
      noteJumpMovementSpeed: ref.noteJumpMovementSpeed,
      noteJumpStartBeatOffset: ref.noteJumpStartBeatOffset,
      offsetSeconds: ref.offsetSeconds ?? info.timeOffsetSeconds,
      bpmChanges: bpmChanges.length > 0 ? bpmChanges : audioBpmChanges,
      notes: wrap.difficulty.colorNotes.map(toNoteModel),
      bombs: wrap.difficulty.bombNotes.map(toBombModel),
      obstacles: wrap.difficulty.obstacles.map(toObstacleModel),
      lightEvents,
    });
  }
  return {
    info,
    beatmaps,
    assets: {
      songBytes: zip.entries.get(songHit) as Uint8Array,
      songEntryPath: songHit,
      coverBytes: zip.entries.get(coverHit) as Uint8Array,
      coverEntryPath: coverHit,
    },
  };
}

function normalizeInfo(raw: RawData): SongInfo {
  const rawVersion = raw['_version'] ?? raw['version'];
  const major = detectMajor(raw, rawVersion);
  if (major !== 2 && major !== 3 && major !== 4) {
    throw new ConversionError(
      ConversionErrorKind.UnsupportedVersion,
      `Map version ${String(rawVersion)} is not a supported v2/v3/v4 info file`,
    );
  }
  const info: SongInfo = {
    formatVersion: major,
    schemaVersion: typeof rawVersion === 'string' ? rawVersion : '',
    title: major === 4 ? str(rec(raw, 'song'), 'title', '') : str(raw, key(major, 'songName'), ''),
    subTitle: major === 4 ? str(rec(raw, 'song'), 'subTitle', '') : str(raw, key(major, 'songSubName'), ''),
    songAuthorName: major === 4 ? str(rec(raw, 'song'), 'author', '') : str(raw, key(major, 'songAuthorName'), ''),
    levelAuthorName: major === 4 ? str(raw, 'beatmapAuthor', '') : str(raw, key(major, 'levelAuthorName'), ''),
    bpm: major === 4 ? num(rec(raw, 'audio'), 'bpm', 0) : num(raw, major === 2 ? '_beatsPerMinute' : 'bpm', 0),
    timeOffsetSeconds: resolveInfoOffset(raw, major),
    previewStartSeconds:
      major === 4 ? num(rec(raw, 'audio'), 'previewStartTime', 0) : num(raw, key(major, 'previewStartTime'), 0),
    previewDurationSeconds:
      major === 4 ? num(rec(raw, 'audio'), 'previewDuration', 10) : num(raw, key(major, 'previewDuration'), 10),
    songFilename: major === 4 ? str(rec(raw, 'audio'), 'songFilename', '') : str(raw, key(major, 'songFilename'), ''),
    coverFilename:
      major === 4
        ? str(rec(raw, 'audio'), 'coverImageFilename', str(raw, 'coverImageFilename', ''))
        : str(raw, key(major, 'coverImageFilename'), ''),
    audioDataFilename: major === 4 ? nullableStr(rec(raw, 'audio'), 'audioDataFilename') : null,
    environmentNames: arrOf(raw, key(major, 'environmentNames')).map((name) => String(name)),
    allDirectionsEnvironmentName: str(raw, key(major, 'allDirectionsEnvironmentName'), ''),
    beatmapRefs: [],
  };
  if (!(info.bpm > 0)) {
    throw new ConversionError(ConversionErrorKind.InvalidBeatMap, 'Info file has no positive BPM');
  }
  if (info.songFilename === '' || info.coverFilename === '') {
    throw new ConversionError(ConversionErrorKind.InvalidBeatMap, 'Info file does not reference a song and cover');
  }
  info.beatmapRefs = readBeatmapRefs(raw, major);
  if (info.beatmapRefs.length === 0) {
    throw new ConversionError(ConversionErrorKind.NoMapData, 'Info file declares no playable difficulties');
  }
  return info;
}

function readBeatmapRefs(raw: RawData, major: BeatmapFormatVersion): BeatmapRef[] {
  if (major === 4) {
    return arrOf(raw, 'difficultyBeatmaps').map((entry) => {
      const data = asRecord(entry);
      return {
        characteristic: str(data, 'characteristic', 'Standard'),
        difficulty: str(data, 'difficulty', 'Expert'),
        difficultyRank: num(data, 'difficultyRank', 0),
        beatmapDataFilename: str(data, 'beatmapDataFilename', str(data, 'beatmapFilename', '')),
        lightshowDataFilename: nullableStr(data, 'lightshowDataFilename'),
        noteJumpMovementSpeed: num(data, 'noteJumpMovementSpeed', 0),
        noteJumpStartBeatOffset: num(data, 'noteJumpStartBeatOffset', 0),
        offsetSeconds: customDataOffset(data),
      };
    });
  }
  const refs: BeatmapRef[] = [];
  for (const set of arrOf(raw, key(major, 'difficultyBeatmapSets'))) {
    const setData = asRecord(set);
    const characteristic = str(setData, key(major, 'beatmapCharacteristicName'), 'Standard');
    for (const entry of arrOf(setData, key(major, 'difficultyBeatmaps'))) {
      const data = asRecord(entry);
      refs.push({
        characteristic,
        difficulty: str(data, key(major, 'difficulty'), 'Expert'),
        difficultyRank: num(data, key(major, 'difficultyRank'), 0),
        beatmapDataFilename: str(data, key(major, 'beatmapFilename'), ''),
        lightshowDataFilename: null,
        noteJumpMovementSpeed: num(data, key(major, 'noteJumpMovementSpeed'), 0),
        noteJumpStartBeatOffset: num(data, key(major, 'noteJumpStartBeatOffset'), 0),
        offsetSeconds: customDataOffset(data),
      });
    }
  }
  return refs;
}

function detectMajor(raw: RawData, rawVersion: unknown): number {
  if (typeof rawVersion === 'string') {
    const major = Number.parseInt(rawVersion, 10);
    return Number.isNaN(major) ? 0 : major;
  }
  if (Array.isArray(raw['_difficultyBeatmapSets'])) return 2;
  if (Array.isArray(raw['difficultyBeatmapSets'])) return 3;
  if (Array.isArray(raw['difficultyBeatmaps'])) return 4;
  return 0;
}

function resolveInfoOffset(raw: RawData, major: BeatmapFormatVersion): number {
  if (major === 2 && typeof raw['_timeOffset'] === 'number') return raw['_timeOffset'];
  return customDataOffset(raw) ?? (typeof raw['_timeOffset'] === 'number' ? raw['_timeOffset'] : 0);
}

function customDataOffset(data: RawData): number | null {
  const custom = rec(data, 'customData') ?? rec(data, '_customData');
  if (custom === null) return null;
  return typeof custom['offset'] === 'number' ? custom['offset'] : null;
}

function deserializeBeatmapFile(text: string, mapMajor: BeatmapFormatVersion): IWrapBeatmap {
  const data = parseJson(text, 'Beatmap data file');
  const fileMajor = versionMajor(data['_version'] ?? data['version'], mapMajor);
  if (fileMajor === 2) return v2.deserializeDifficulty(untyped(data));
  if (fileMajor === 3) {
    sanitizeV3FxReferences(data);
    return v3.deserializeDifficulty(untyped(data));
  }
  if (fileMajor === 4) {
    sanitizeV4BeatmapIndexRefs(data);
    return v4.deserializeDifficulty(untyped(data));
  }
  throw new ConversionError(
    ConversionErrorKind.InvalidBeatMap,
    `Beatmap data file version ${String(data['_version'] ?? data['version'])} is unsupported`,
  );
}

function lightEventsFor(
  zip: OpenedMapZip,
  formatVersion: BeatmapFormatVersion,
  ref: BeatmapRef,
  wrap: IWrapBeatmap,
  cache: Map<string, LightEventModel[]>,
): LightEventModel[] {
  if (formatVersion !== 4 || ref.lightshowDataFilename === null) {
    return wrap.lightshow.basicEvents.map(toLightModel);
  }
  const lightshowPath = lookupMapPath(zip.entries, ref.lightshowDataFilename);
  if (lightshowPath === null) return [];
  const cached = cache.get(lightshowPath);
  if (cached !== undefined) return cached;
  const events = deserializeLightshowFile(
    decodeEntryText(zip.entries, lightshowPath),
    formatVersion,
  ).lightshow.basicEvents.map(toLightModel);
  cache.set(lightshowPath, events);
  return events;
}

function deserializeLightshowFile(text: string, mapMajor: BeatmapFormatVersion): IWrapBeatmap {
  const data = parseJson(text, 'Lightshow file');
  const fileMajor = versionMajor(data['version'], mapMajor);
  if (fileMajor === 3) {
    sanitizeV3FxReferences(data);
    return v3.deserializeLightshow(untyped(data));
  }
  sanitizeV4LightshowIndexRefs(data);
  return v4.deserializeLightshow(untyped(data));
}

function bpmChangesFromAudioData(zip: OpenedMapZip, filename: string): BpmChangeEvent[] {
  const path = lookupMapPath(zip.entries, filename);
  if (path === null) return [];
  try {
    const data = parseJson(decodeEntryText(zip.entries, path), 'Audio data file');
    const wrap = v4.deserializeAudioData(untyped(data));
    const changes: BpmChangeEvent[] = [];
    let currentBpm = Number.NaN;
    for (const segment of wrap.bpmData) {
      const samples = segment.endSampleIndex - segment.startSampleIndex;
      if (!(samples > 0) || !(wrap.frequency > 0)) continue;
      const bpm = ((segment.endBeat - segment.startBeat) * wrap.frequency * 60) / samples;
      if (!(bpm > 0)) continue;
      if (Number.isNaN(currentBpm) || Math.abs(bpm - currentBpm) > 0.01) {
        changes.push({ beat: segment.startBeat, bpm: Number(bpm.toFixed(4)) });
        currentBpm = bpm;
      }
    }
    return changes;
  } catch {
    return [];
  }
}

/**
 * Repair the off-by-version `_fxEventsCollections` key and clamp out-of-range v3 vfx float references.
 *
 * The official BSMG v3 schema sample names the collection `_fxEventsCollections` while bsmap reads
 * `_fxEventsCollection`, and a dangling index there would make bsmap throw instead of parse.
 */
function sanitizeV3FxReferences(data: RawData): void {
  if (data['_fxEventsCollection'] === undefined) data['_fxEventsCollection'] = data['_fxEventsCollections'];
  const rawFloats = asRecord(data['_fxEventsCollection'])['_fl'];
  const floats = Array.isArray(rawFloats) ? rawFloats : null;
  const groups = data['vfxEventBoxGroups'];
  if (!Array.isArray(groups)) return;
  for (const group of groups) {
    const boxes = asRecord(group)['e'];
    if (!Array.isArray(boxes)) continue;
    for (const box of boxes) {
      const boxData = asRecord(box);
      if (!Array.isArray(boxData['l'])) continue;
      if (floats === null || floats.length === 0) delete boxData['l'];
      else boxData['l'] = (boxData['l'] as unknown[]).map((index) => clampIndex(index, floats.length));
    }
  }
}

function sanitizeV4BeatmapIndexRefs(data: RawData): void {
  clampRefs(data, 'colorNotes', ['i'], 'colorNotesData');
  clampRefs(data, 'bombNotes', ['i'], 'bombNotesData');
  clampRefs(data, 'obstacles', ['i'], 'obstaclesData');
  clampRefs(data, 'arcs', ['ai'], 'arcsData');
  clampRefs(data, 'arcs', ['hi', 'ti'], 'colorNotesData');
  clampRefs(data, 'chains', ['i', 'hi', 'ti'], 'colorNotesData');
  clampRefs(data, 'chains', ['ci'], 'chainsData');
  clampRefs(data, 'spawnRotations', ['i'], 'spawnRotationsData');
  clampRefs(data, 'njsEvents', ['i'], 'njsEventData');
}

function sanitizeV4LightshowIndexRefs(data: RawData): void {
  clampRefs(data, 'waypoints', ['i'], 'waypointsData');
  clampRefs(data, 'basicEvents', ['i'], 'basicEventsData');
  clampRefs(data, 'colorBoostEvents', ['i'], 'colorBoostEventsData');
  const groups = data['eventBoxGroups'];
  if (!Array.isArray(groups)) return;
  for (const group of groups) {
    const type = asRecord(group)['t'];
    const names = EVENT_BOX_ARRAYS[typeof type === 'number' ? type : 0];
    const boxes = asRecord(group)['e'];
    if (names === undefined || !Array.isArray(boxes)) continue;
    for (const box of boxes) {
      clampRefObjects([box], 'e', data, names.boxes);
      clampRefObjects([box], 'f', data, 'indexFilters');
      if (Array.isArray(asRecord(box)['l'])) clampRefObjects(asRecord(box)['l'] as unknown[], 'i', data, names.events);
    }
  }
}

const EVENT_BOX_ARRAYS: Record<number, { boxes: string; events: string }> = {
  1: { boxes: 'lightColorEventBoxes', events: 'lightColorEvents' },
  2: { boxes: 'lightRotationEventBoxes', events: 'lightRotationEvents' },
  3: { boxes: 'lightTranslationEventBoxes', events: 'lightTranslationEvents' },
  4: { boxes: 'fxEventBoxes', events: 'floatFxEvents' },
};

function clampRefs(data: RawData, refArrayField: string, indexFields: string[], dataField: string): void {
  const refs = data[refArrayField];
  if (!Array.isArray(refs)) return;
  for (const field of indexFields) clampRefObjects(refs, field, data, dataField);
}

function clampRefObjects(refs: unknown[], indexField: string, data: RawData, dataField: string): void {
  const rawArray = data[dataField];
  const valid = Array.isArray(rawArray) && rawArray.length > 0 ? rawArray : undefined;
  if (valid === undefined && rawArray !== undefined) delete data[dataField];
  for (const ref of refs) {
    const refData = asRecord(ref);
    if (!(indexField in refData)) continue;
    if (valid === undefined) delete refData[indexField];
    else refData[indexField] = clampIndex(refData[indexField], valid.length);
  }
}

function clampIndex(index: unknown, length: number): number {
  const value = typeof index === 'number' && Number.isFinite(index) ? Math.trunc(index) : 0;
  return Math.min(Math.max(value, 0), length - 1);
}

function requireAsset(zip: OpenedMapZip, filename: string, kind: ConversionErrorKind, label: string): string {
  const path = lookupMapPath(zip.entries, filename);
  if (path === null) {
    throw new ConversionError(kind, `${label} "${filename}" referenced by the info file is missing from the zip`);
  }
  return path;
}

/**
 * Resolve the referenced audio file, accepting the legacy `.egg`/`.ogg` extension swap of the same stem.
 *
 * @throws ConversionError With `MissingSongFile` when neither extension exists in the zip.
 */
function requireSongAsset(zip: OpenedMapZip, filename: string): string {
  const direct = lookupMapPath(zip.entries, filename);
  if (direct !== null) return direct;
  const lower = filename.trim().toLowerCase();
  const swapped = lower.endsWith('.egg')
    ? `${lower.slice(0, -4)}.ogg`
    : lower.endsWith('.ogg')
      ? `${lower.slice(0, -4)}.egg`
      : null;
  const fallback = swapped === null ? null : lookupMapPath(zip.entries, swapped);
  if (fallback === null) {
    throw new ConversionError(
      ConversionErrorKind.MissingSongFile,
      `Song audio file "${filename}" referenced by the info file is missing from the zip`,
    );
  }
  return fallback;
}

function parseJson(text: string, label: string): RawData {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch (error: unknown) {
    throw new ConversionError(ConversionErrorKind.InvalidBeatMap, `${label} is not valid JSON: ${describe(error)}`);
  }
  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    throw new ConversionError(ConversionErrorKind.InvalidBeatMap, `${label} must contain a JSON object`);
  }
  return parsed as RawData;
}

function versionMajor(rawVersion: unknown, fallback: number): number {
  if (typeof rawVersion !== 'string') return fallback;
  const major = Number.parseInt(rawVersion, 10);
  return Number.isNaN(major) ? fallback : major;
}

function key(major: BeatmapFormatVersion, name: string): string {
  return major === 2 ? `_${name}` : name;
}

function toNoteModel(note: IWrapBeatmap['difficulty']['colorNotes'][number]): NoteModel {
  return {
    beat: note.time,
    x: note.posX,
    y: note.posY,
    color: note.color,
    cutDirection: note.direction,
    angleOffset: note.angleOffset,
  };
}

function toBombModel(bomb: IWrapBeatmap['difficulty']['bombNotes'][number]): BombModel {
  return { beat: bomb.time, x: bomb.posX, y: bomb.posY };
}

function toObstacleModel(wall: IWrapBeatmap['difficulty']['obstacles'][number]): ObstacleModel {
  return {
    beat: wall.time,
    durationBeats: wall.duration,
    x: wall.posX,
    y: wall.posY,
    width: wall.width,
    height: wall.height,
  };
}

function toLightModel(light: IWrapBeatmap['lightshow']['basicEvents'][number]): LightEventModel {
  return { beat: light.time, type: light.type, value: light.value, floatValue: light.floatValue };
}

function asRecord(value: unknown): RawData {
  return typeof value === 'object' && value !== null && !Array.isArray(value) ? (value as RawData) : {};
}

function untyped<T>(data: RawData): T {
  return data as unknown as T;
}

function rec(data: RawData, name: string): RawData | null {
  const value = data[name];
  return typeof value === 'object' && value !== null && !Array.isArray(value) ? (value as RawData) : null;
}

function str(data: RawData | null, name: string, fallback: string): string {
  const value = data?.[name];
  return typeof value === 'string' ? value : fallback;
}

function nullableStr(data: RawData | null, name: string): string | null {
  const value = data?.[name];
  return typeof value === 'string' && value !== '' ? value : null;
}

function num(data: RawData | null, name: string, fallback: number): number {
  const value = data?.[name];
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function arrOf(data: RawData, name: string): unknown[] {
  const value = data[name];
  return Array.isArray(value) ? value : [];
}

function describe(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
