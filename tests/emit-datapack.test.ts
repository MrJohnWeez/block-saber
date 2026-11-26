import assert from 'node:assert/strict';
import { test } from 'node:test';

import { ConversionError, ConversionErrorKind } from '../src/converter/conversion-error';
import {
  emitSongPack,
  type EmittedDataPack,
  type EmittedDifficulty,
  type ParsedSong,
} from '../src/converter/emit-datapack';
import { normalizeBpmSegments } from '../src/converter/tick-table';
import type { Beatmap, NoteModel, SongInfo } from '../src/converter/types';
import { datapackSnapshotText, emitFixture, FAKE_COVER_CONVERTER, FAKE_PNG_BYTES, matchSnapshot } from './helpers';

const SNAPSHOT_FIXTURES = [
  'synthetic/syn-v2-basic.zip',
  'synthetic/syn-v3-basic.zip',
  'synthetic/syn-v3-bpm.zip',
  'synthetic/syn-v3-walls.zip',
  'synthetic/syn-v3-two-characteristics.zip',
  'synthetic/syn-v4-basic.zip',
  'synthetic/syn-info-lowercase.zip',
  'maps/bsmg-v3-official-sample.zip',
  'maps/beatsaver-v4-443f3.zip',
];

const NAMESPACE_PATTERN = /^bs_[0-9a-f]{8}$/;

function snapshotName(fixturePath: string): string {
  return `emit-datapack.${fixturePath.slice(fixturePath.lastIndexOf('/') + 1).replace(/\.zip$/, '')}`;
}

function textOf(pack: EmittedDataPack, suffix: string): string {
  const name = Array.from(pack.files.keys()).find((key) => key.endsWith(suffix));
  assert.ok(name !== undefined, `no emitted file ends with ${suffix}`);
  const value = pack.files.get(name) as string;
  return value;
}

function lineCount(text: string, needle: string): number {
  return text.split('\n').filter((line) => line.includes(needle)).length;
}

interface WallPiece {
  tick: number;
  x: string;
  y: string;
  z: string;
  fn: string;
}

function wallPieces(text: string): WallPiece[] {
  const teleports = Array.from(
    text.matchAll(
      /matches (\d+) at @e\[type=marker,tag=bs_node_origin,limit=1\] run teleport @e\[type=marker,tag=bs_node_cursor,limit=1\] ~(-?\d+\.\d{6}) ~(-?\d+\.\d{6}) ~(-?\d+\.\d{6})/g,
    ),
  );
  const dispatches = Array.from(
    text.matchAll(
      /matches (\d+) as @e\[type=marker,tag=bs_node_cursor,limit=1\] run function block_saber:walls\/(wall_\dx\d)/g,
    ),
  );
  assert.equal(dispatches.length, teleports.length, 'every wall teleport carries exactly one dispatch');
  for (const [index, teleport] of teleports.entries()) {
    assert.equal(dispatches[index][1], teleport[1], 'dispatch shares its teleport tick');
  }
  return teleports.map((teleport, index) => ({
    tick: Number(teleport[1]),
    x: teleport[2],
    y: teleport[3],
    z: teleport[4],
    fn: dispatches[index][2],
  }));
}

function pieceLabel(piece: WallPiece): string {
  return `${piece.fn} ~${piece.x} ~${piece.y}`;
}

function piecesAt(pieces: WallPiece[], tick: number): string[] {
  return [...new Set(pieces.filter((piece) => piece.tick === tick).map(pieceLabel))];
}

function baseInfo(overrides: Partial<SongInfo> = {}): SongInfo {
  return {
    formatVersion: 3,
    schemaVersion: '3.6.0',
    title: 'In Memory',
    subTitle: '',
    songAuthorName: 'Tester',
    levelAuthorName: 'Tester',
    bpm: 120,
    timeOffsetSeconds: 0,
    previewStartSeconds: 0,
    previewDurationSeconds: 10,
    songFilename: 'song.egg',
    coverFilename: 'cover.png',
    audioDataFilename: null,
    environmentNames: [],
    allDirectionsEnvironmentName: '',
    beatmapRefs: [],
    ...overrides,
  };
}

function expertBeatmap(overrides: Partial<Beatmap> = {}): Beatmap {
  return {
    characteristic: 'Standard',
    difficulty: 'Expert',
    difficultyRank: 5,
    noteJumpMovementSpeed: 16,
    noteJumpStartBeatOffset: 0,
    offsetSeconds: 0,
    bpmChanges: [],
    notes: [],
    bombs: [],
    chains: [],
    obstacles: [],
    lightEvents: [],
    ...overrides,
  };
}

function dot(beat: number, x: number, y: number, color = 0): NoteModel {
  return { beat, x, y, color, cutDirection: 8, angleOffset: 0 };
}

function inMemorySong(info: SongInfo, beatmaps: Beatmap[]): ParsedSong {
  return {
    info,
    beatmaps,
    assets: {
      songBytes: new Uint8Array([1]),
      songEntryPath: 'song.egg',
      coverBytes: new Uint8Array([2]),
      coverEntryPath: 'cover.png',
    },
    slug: 'aabbccdd',
  };
}

async function emitMemory(song: ParsedSong): Promise<EmittedDataPack> {
  return emitSongPack(song, { coverConverter: FAKE_COVER_CONVERTER });
}

async function expectEmitError(song: ParsedSong, kind: ConversionErrorKind): Promise<void> {
  await assert.rejects(
    () => emitSongPack(song, { coverConverter: FAKE_COVER_CONVERTER }),
    (error: unknown) => error instanceof ConversionError && error.kind === kind,
    `expected ConversionError ${kind}`,
  );
}

for (const fixture of SNAPSHOT_FIXTURES) {
  test(`golden datapack snapshot: ${fixture}`, async () => {
    const { pack } = await emitFixture(fixture);
    assert.match(pack.namespace, NAMESPACE_PATTERN, fixture);
    matchSnapshot(snapshotName(fixture), datapackSnapshotText(pack));
  });
}

test('syn fixtures at 120 BPM carry lead 39 and the §3.1 marker constants', async () => {
  const { pack, song } = await emitFixture('synthetic/syn-v2-basic.zip');
  for (const difficulty of pack.difficulties) {
    assert.equal(difficulty.leadTicks, 39, difficulty.token);
    assert.equal(difficulty.mptMillionths, Math.round(0.504 * 1_000_000), difficulty.token);
    assert.equal(difficulty.leadMeters, 20, difficulty.token);
  }
  const install = textOf(pack, 'install.mcfunction');
  assert.ok(install.includes('mpt_millionths:504000,lead_m:20'), install);
  const play = textOf(pack, 'easy_standard_play.mcfunction');
  assert.match(
    play.split('\n')[0],
    new RegExp(
      `^execute if score @s curr_tick matches 39 run playsound bsong_${song.slug} music @a 0\\.0 0\\.0 0\\.0 1 1$`,
    ),
  );
});

test('marker diff entries carry mpt_millionths and lead_m matching the §3.1 formulas for every fixture', async () => {
  for (const fixture of SNAPSHOT_FIXTURES) {
    const { pack, song } = await emitFixture(fixture);
    const summon = textOf(pack, 'install.mcfunction')
      .split('\n')
      .find((line) => line.startsWith('summon ')) as string;
    for (const difficulty of pack.difficulties) {
      const beatmap = song.beatmaps.find(
        (candidate) =>
          candidate.characteristic === difficulty.characteristic && candidate.difficulty === difficulty.difficulty,
      ) as Beatmap;
      const bpm = normalizeBpmSegments(beatmap.bpmChanges, song.info.bpm)[0].bpm;
      const metersPerTick = (bpm / 60) * 24 * 0.21 * 0.05;
      const leadMeters = Math.min(Math.max(bpm / 6, 7), 20);
      assert.equal(
        difficulty.mptMillionths,
        Math.round(metersPerTick * 1_000_000),
        `${fixture} ${difficulty.token} mpt`,
      );
      assert.equal(difficulty.leadMeters, leadMeters, `${fixture} ${difficulty.token} lead_m`);
      assert.equal(
        difficulty.leadTicks,
        Math.trunc(leadMeters / metersPerTick),
        `${fixture} ${difficulty.token} lead ticks`,
      );
      assert.ok(summon.includes(`id:"${difficulty.token}"`), `${fixture} ${difficulty.token} id`);
      assert.ok(
        summon.includes(
          `end_tick:${difficulty.endTick},mpt_millionths:${difficulty.mptMillionths},lead_m:${difficulty.leadMeters}`,
        ),
        `${fixture} ${difficulty.token} marker constants`,
      );
    }
  }
});

test('syn-v3-basic burst slider emits one extra dot pair at the chain endpoints', async () => {
  const { pack } = await emitFixture('synthetic/syn-v3-basic.zip');
  const expert = pack.difficulties.find((difficulty) => difficulty.token === 'expert_standard') as EmittedDifficulty;
  assert.equal(expert.notes, 21);
  const notes = textOf(pack, 'expert_standard_notes_lvl_1.mcfunction');
  assert.match(
    notes,
    /matches 535 at @e\[type=marker,tag=bs_node_origin,limit=1\] run teleport .* ~0\.300000 ~0\.000000 ~0\.000000/,
  );
  assert.match(
    notes,
    /matches 535 as @e\[type=marker,tag=bs_node_cursor,limit=1\] run function block_saber:notes\/blue_dot/,
  );
  assert.match(
    notes,
    /matches 540 at @e\[type=marker,tag=bs_node_origin,limit=1\] run teleport .* ~0\.300000 ~0\.000000 ~0\.000000/,
  );
  assert.match(
    notes,
    /matches 540 as @e\[type=marker,tag=bs_node_cursor,limit=1\] run function block_saber:notes\/blue_dot/,
  );
});

test('syn-v4-basic v4 chain expands to red head dot and tail dot at distinct cells', async () => {
  const { pack } = await emitFixture('synthetic/syn-v4-basic.zip');
  const expert = pack.difficulties.find((difficulty) => difficulty.token === 'expert_standard') as EmittedDifficulty;
  assert.equal(expert.notes, 21);
  const notes = textOf(pack, 'expert_standard_notes_lvl_1.mcfunction');
  assert.match(notes, /matches 560 .* run teleport .* ~0\.300000 ~-0\.300000 ~0\.000000/);
  assert.match(notes, /matches 560 .* run function block_saber:notes\/red_dot/);
  assert.match(notes, /matches 565 .* run teleport .* ~-0\.300000 ~0\.300000 ~0\.000000/);
  assert.match(notes, /matches 565 .* run function block_saber:notes\/red_dot/);
});

test('syn-v4 emitted lights carry normalized groups, flash off at T+40, and explicit offs', async () => {
  const { pack } = await emitFixture('synthetic/syn-v4-basic.zip');
  const lights = textOf(pack, 'expert_standard_lights_lvl_1.mcfunction');
  assert.match(lights, /matches 80 run scoreboard players set #rings bs_light_on 1/);
  assert.match(lights, /matches 80 run scoreboard players set #rings bs_light_color 24/);
  assert.match(lights, /matches 80 run scoreboard players set #rotating_left bs_light_on 1/);
  assert.match(lights, /matches 80 run scoreboard players set #rotating_right bs_light_color 16/);
  assert.match(lights, /matches 100 run scoreboard players set #side_lasers_left bs_light_on 1/);
  assert.match(lights, /matches 100 run scoreboard players set #side_lasers_right bs_light_color 16/);
  assert.match(lights, /matches 120 run scoreboard players set #rings bs_light_on 0/);
  assert.match(lights, /matches 120 run scoreboard players set #center bs_light_on 1/, 'center flash on');
  assert.match(lights, /matches 160 run scoreboard players set #center bs_light_on 0/, 'flash off at T+40');
  assert.match(lights, /matches 160 run scoreboard players set #rings bs_light_on 1/, 'rings flash on');
  assert.match(lights, /matches 200 run scoreboard players set #rings bs_light_color 0/);
  assert.match(lights, /matches 200 run scoreboard players set #center bs_light_on 0/, 'explicit center off');
  assert.match(lights, /matches 200 run scoreboard players set #rotating_right bs_light_on 0/);
  assert.match(lights, /matches 240 run scoreboard players set #boost bs_light_on 1/);
});

test('fractional wall durations run the §3.4 segment loop', async () => {
  const { pack } = await emitFixture('synthetic/syn-v3-basic.zip');
  const walls = textOf(pack, 'expert_standard_walls_lvl_1.mcfunction');
  assert.equal(lineCount(walls, 'block_saber:walls/'), 36 + 12 + 54 + 42);
  assert.equal(lineCount(walls, 'run teleport'), 36 + 12 + 54 + 42);
  assert.match(walls, /matches 615 at @e.* run teleport .* ~0\.300000 ~0\.600000 ~0\.000000/);
  assert.match(walls, /matches 619 .* run function block_saber:walls\/wall_1x3/);
  assert.ok(walls.includes('block_saber:walls/wall_1x1'));
  assert.ok(walls.includes('block_saber:walls/wall_2x1'));
});

test('syn-v3-walls emits the full §3.4 band + width matrix including the short (crouch) band', async () => {
  const { pack } = await emitFixture('synthetic/syn-v3-walls.zip');
  const walls = textOf(pack, 'expert_standard_walls_lvl_1.mcfunction');
  const expert = pack.difficulties.find((difficulty) => difficulty.token === 'expert_standard') as EmittedDifficulty;
  assert.equal(expert.walls, 12);
  const pieces = wallPieces(walls);
  // Band classification: tall ⇔ y ≤ 1 && h ≥ 3 anchors at ~0.300000, everything else is short at ~0.600000.
  assert.deepEqual(piecesAt(pieces, 595), ['wall_1x1 ~0.000000 ~0.300000']); // b60 full {y:0,h:5}
  assert.deepEqual(piecesAt(pieces, 615), ['wall_1x3 ~0.300000 ~0.600000']); // b62 crouch {y:2,h:3} — the checklist gap
  assert.deepEqual(piecesAt(pieces, 635), ['wall_1x1 ~0.300000 ~0.300000']); // b64 tall boundary {y:1,h:3}
  assert.deepEqual(piecesAt(pieces, 675), ['wall_2x1 ~0.000000 ~0.600000']); // b68 crouch w2
  assert.deepEqual(piecesAt(pieces, 775), ['wall_1x3 ~0.900000 ~0.600000']); // b78 floor strip {h:1} — collapses to short
  assert.deepEqual(piecesAt(pieces, 795), ['wall_1x3 ~0.600000 ~0.600000']); // b80 {h:2} wall — collapses to short
  // Width decomposition: 2 = one wall_2x1, 3 = 2x1 + 1x-tall/short at lane+2, 4 = two wall_2x1.
  assert.deepEqual(piecesAt(pieces, 655), ['wall_2x1 ~0.000000 ~0.300000']); // b66 tall w2
  assert.deepEqual(piecesAt(pieces, 695), ['wall_2x1 ~0.300000 ~0.300000', 'wall_1x1 ~0.900000 ~0.300000']); // b70 tall w3
  assert.deepEqual(piecesAt(pieces, 715), ['wall_2x1 ~0.000000 ~0.600000', 'wall_1x3 ~0.600000 ~0.600000']); // b72 short w3
  assert.deepEqual(piecesAt(pieces, 735), ['wall_2x1 ~0.000000 ~0.300000', 'wall_2x1 ~0.600000 ~0.300000']); // b74 w4
  // Width ≥ 5 clamps to the w:4 rule: b76 w5 emits the exact piece/z pattern of b74 w4.
  const pattern = (from: number) =>
    pieces
      .filter((piece) => piece.tick >= from && piece.tick <= from + 2)
      .map((piece) => `${pieceLabel(piece)} ~${piece.z}`);
  assert.deepEqual(pattern(755), pattern(735), 'w5 wall clamps to the w4 piece pattern');
  // B5: segment count is trunc(duration x 24) with per-segment z fractions preserved, never integer-truncated duration.
  assert.deepEqual(
    pieces.filter((piece) => piece.tick >= 595 && piece.tick <= 597).map((piece) => `${piece.tick}:${piece.z}`),
    ['595:0.000000', '595:-0.210000', '595:-0.420000', '596:-0.126000', '596:-0.336000', '597:-0.042000'],
    'per-segment wall z fractions (B5)',
  );
  const segmentCounts = new Map<string, number>();
  for (const piece of pieces) {
    const key = pieceLabel(piece);
    segmentCounts.set(key, (segmentCounts.get(key) ?? 0) + 1);
  }
  assert.deepEqual(Object.fromEntries(segmentCounts), {
    'wall_1x1 ~0.000000 ~0.300000': 6, // b60 d0.25 -> 6 segments
    'wall_1x3 ~0.300000 ~0.600000': 6, // b62 d0.25
    'wall_1x1 ~0.300000 ~0.300000': 6, // b64 d0.25
    'wall_2x1 ~0.000000 ~0.300000': 18, // b66 d0.25 + b74 + b76 w4/clamped w5
    'wall_2x1 ~0.300000 ~0.300000': 6, // b70 w3 first piece
    'wall_1x1 ~0.900000 ~0.300000': 6, // b70 w3 second piece
    'wall_2x1 ~0.000000 ~0.600000': 42, // b68 d0.25 + b72 w3 + b82 d1.25 -> 30 segments (B5)
    'wall_1x3 ~0.600000 ~0.600000': 18, // b72 w3 second piece + b80 d0.5
    'wall_2x1 ~0.600000 ~0.300000': 12, // b74 + b76 second pieces
    'wall_1x3 ~0.900000 ~0.600000': 3, // b78 d0.125 -> trunc(3) segments, not 1 (B5)
  });
});

test('done flags sit at last stream tick plus LEAD plus one, empty streams stub at LEAD plus one', async () => {
  const song = inMemorySong(baseInfo(), [
    expertBeatmap({
      notes: [dot(4, 1, 1)],
      lightEvents: [{ beat: 16, type: 1, value: 3, floatValue: 1 }],
    }),
  ]);
  const pack = await emitMemory(song);
  const notes = textOf(pack, 'expert_standard_notes_lvl_1.mcfunction');
  assert.match(notes, /matches 80 run scoreboard players set #bs_notes bs_finished 1/);
  const lights = textOf(pack, 'expert_standard_lights_lvl_1.mcfunction');
  assert.match(lights, /matches 240 run scoreboard players set #bs_lights bs_finished 1/);
  const walls = textOf(pack, 'expert_standard_walls_lvl_1.mcfunction');
  assert.equal(walls, 'execute if score @s curr_tick matches 40 run scoreboard players set #bs_walls bs_finished 1\n');
  const play = textOf(pack, 'expert_standard_play.mcfunction');
  assert.match(play, /matches 0\.\.80 run function bs_aabbccdd:expert_standard_notes_lvl_1/);
  assert.match(play, /matches 0\.\.40 run function bs_aabbccdd:expert_standard_walls_lvl_1/);
  assert.match(
    play,
    /matches 0\.\.240 if score #CONST bs_lightshow matches 1 run function bs_aabbccdd:expert_standard_lights_lvl_1/,
  );
});

test('flash light value 3 emits on at T and an explicit off at T+40 with the side color', async () => {
  const song = inMemorySong(baseInfo(), [
    expertBeatmap({
      notes: [dot(4, 1, 1)],
      lightEvents: [{ beat: 16, type: 1, value: 3, floatValue: 1 }],
    }),
  ]);
  const pack = await emitMemory(song);
  const lights = textOf(pack, 'expert_standard_lights_lvl_1.mcfunction');
  assert.match(lights, /matches 160 run scoreboard players set #rings bs_light_on 1/);
  assert.match(lights, /matches 160 run scoreboard players set #rings bs_light_color 24/);
  assert.match(lights, /matches 200 run scoreboard players set #rings bs_light_on 0/);
  assert.match(lights, /matches 200 run scoreboard players set #rings bs_light_color 0/);
  const center = inMemorySong(baseInfo(), [
    expertBeatmap({ notes: [dot(4, 1, 1)], lightEvents: [{ beat: 16, type: 4, value: 1, floatValue: 1 }] }),
  ]);
  const centerLights = textOf(await emitMemory(center), 'expert_standard_lights_lvl_1.mcfunction');
  assert.match(centerLights, /matches 160 run scoreboard players set #center bs_light_color 16/);
});

test('B3: two Expert characteristics emit expert_standard and expert_lawless files plus marker ids without collision', async () => {
  const { pack } = await emitFixture('synthetic/syn-v3-two-characteristics.zip');
  const names = Array.from(pack.files.keys());
  assert.ok(names.some((name) => name.endsWith('/expert_standard_notes_lvl_1.mcfunction')));
  assert.ok(names.some((name) => name.endsWith('/expert_lawless_notes_lvl_1.mcfunction')));
  const install = textOf(pack, 'install.mcfunction');
  assert.ok(install.includes('id:"expert_standard"'));
  assert.ok(install.includes('id:"expert_lawless"'));
  assert.ok(install.includes('scoreboard players set #'));
});

test('lowercase-info fixture still emits the full lifecycle set', async () => {
  const { pack } = await emitFixture('synthetic/syn-info-lowercase.zip');
  const names = Array.from(pack.files.keys());
  for (const suffix of ['probe.mcfunction', 'install.mcfunction', 'uninstall.mcfunction']) {
    assert.ok(
      names.some((name) => name.endsWith(suffix)),
      suffix,
    );
  }
});

test('B2: emitted text keeps six-decimal coordinates and never uses scientific notation', async () => {
  for (const fixture of ['synthetic/syn-v3-basic.zip', 'maps/beatsaver-v4-443f3.zip']) {
    const { pack } = await emitFixture(fixture);
    for (const [name, value] of pack.files) {
      if (typeof value !== 'string') continue;
      assert.doesNotMatch(value, /[0-9][eE][-+]?[0-9]/, `${fixture} ${name} scientific notation`);
    }
    const notes = textOf(pack, 'expert_standard_notes_lvl_1.mcfunction');
    assert.match(notes, /~0\.300000/);
    assert.match(notes, /~-?\d+\.\d{6} ~-?\d+\.\d{6} ~-?\d+\.\d{6}/);
    assert.doesNotMatch(notes, /~[0-9.]+e/i);
  }
});

test('pack.mcmeta has the exact §4.1 shape with literal 121.0 formats', async () => {
  const { pack, song } = await emitFixture('synthetic/syn-v2-basic.zip');
  const meta = textOf(pack, 'pack.mcmeta');
  assert.ok(meta.includes('"pack_format": 121.0'), meta);
  assert.ok(meta.includes('"min_format": 121.0'), meta);
  assert.ok(meta.includes('"max_format": 121.99'), meta);
  assert.ok(meta.includes(`Block Saber song: Synthetic v2 by make-fixtures [bs_${song.slug} / song contract 1]`), meta);
  assert.deepEqual(JSON.parse(meta), {
    pack: {
      pack_format: 121,
      min_format: 121,
      max_format: 121.99,
      description: `Block Saber song: Synthetic v2 by make-fixtures [bs_${song.slug} / song contract 1]`,
    },
  });
});

test('pack.png is the converted cover bytes and README carries the install command', async () => {
  const { pack } = await emitFixture('synthetic/syn-v2-basic.zip');
  assert.deepEqual(pack.files.get('pack.png'), FAKE_PNG_BYTES);
  const readme = textOf(pack, 'README-install.txt');
  assert.ok(readme.includes(`/function ${pack.namespace}:install`), readme);
  assert.ok(readme.includes('datapacks'), readme);
  assert.ok(readme.includes('resourcepacks'), readme);
});

test('a difficulty with zero notes and zero walls is omitted entirely (§7)', async () => {
  const song = inMemorySong(baseInfo(), [
    expertBeatmap({ lightEvents: [{ beat: 8, type: 1, value: 1, floatValue: 1 }] }),
    expertBeatmap({ characteristic: 'Lawless', notes: [dot(4, 1, 1)] }),
  ]);
  const pack = await emitMemory(song);
  assert.deepEqual(
    pack.difficulties.map((difficulty) => difficulty.token),
    ['expert_lawless'],
  );
  assert.ok(!Array.from(pack.files.keys()).some((name) => name.includes('expert_standard')));
});

test('duplicate characteristic/difficulty pairs and colliding tokens raise DuplicateDifficulty', async () => {
  await expectEmitError(
    inMemorySong(baseInfo(), [expertBeatmap({ notes: [dot(4, 1, 1)] }), expertBeatmap({ notes: [dot(5, 1, 1)] })]),
    ConversionErrorKind.DuplicateDifficulty,
  );
  await expectEmitError(
    inMemorySong(baseInfo(), [
      expertBeatmap({ characteristic: 'Chroma-R', notes: [dot(4, 1, 1)] }),
      expertBeatmap({ characteristic: 'Chroma R', notes: [dot(5, 1, 1)] }),
    ]),
    ConversionErrorKind.DuplicateDifficulty,
  );
});

test('walls of 16 beats or more raise WallTooLong', async () => {
  await expectEmitError(
    inMemorySong(baseInfo(), [
      expertBeatmap({
        notes: [dot(4, 1, 1)],
        obstacles: [{ beat: 8, durationBeats: 16, x: 0, y: 0, width: 1, height: 3 }],
      }),
    ]),
    ConversionErrorKind.WallTooLong,
  );
});

test('tick ranges beyond 2^31 raise SongTooLong', async () => {
  await expectEmitError(
    inMemorySong(baseInfo(), [expertBeatmap({ notes: [dot(4_000_000_000, 1, 1)] })]),
    ConversionErrorKind.SongTooLong,
  );
});

test('a malformed or oversized slug raises SlugCollision', async () => {
  const bad = inMemorySong(baseInfo(), [expertBeatmap({ notes: [dot(4, 1, 1)] })]);
  await expectEmitError({ ...bad, slug: 'Not-Hex!' }, ConversionErrorKind.SlugCollision);
  await expectEmitError({ ...bad, slug: 'a'.repeat(14) }, ConversionErrorKind.SlugCollision);
});
