import assert from 'node:assert/strict';
import { test } from 'node:test';

import { zipSync } from 'fflate';

import { ConversionErrorKind } from '../src/converter/conversion-error';
import { parseBeatmap } from '../src/converter/parse-beatmap';
import { readMapZip } from '../src/converter/read-map-zip';
import type { BeatmapFormatVersion } from '../src/converter/types';
import { expectConversionError, openFixture, parseFixture } from './helpers';

const SYNTHETIC_SPREAD_COUNTS = { notes: 18, bombs: 1, walls: 4, lights: 4 };

const SPREAD_WALL_DURATIONS = [1.5, 0.5, 2.25, 1.75];

interface CountableBeatmap {
  notes: unknown[];
  bombs: unknown[];
  obstacles: unknown[];
  lightEvents: unknown[];
}

function assertSpreadBeatmap(beatmap: CountableBeatmap): void {
  assert.equal(beatmap.notes.length, SYNTHETIC_SPREAD_COUNTS.notes);
  assert.equal(beatmap.bombs.length, SYNTHETIC_SPREAD_COUNTS.bombs);
  assert.equal(beatmap.obstacles.length, SYNTHETIC_SPREAD_COUNTS.walls);
  assert.equal(beatmap.lightEvents.length, SYNTHETIC_SPREAD_COUNTS.lights);
}

function syntheticZip(info: Record<string, unknown>): Uint8Array {
  const encoder = new TextEncoder();
  return zipSync({
    'Info.dat': encoder.encode(JSON.stringify(info)),
    'cover.png': encoder.encode('x'),
    'song.egg': encoder.encode('y'),
  });
}

test('syn-v2-basic parses as v2 with full spread counts and fractional walls', () => {
  const map = parseFixture('synthetic/syn-v2-basic.zip');
  assert.equal(map.info.formatVersion, 2 satisfies BeatmapFormatVersion);
  assert.equal(map.info.schemaVersion, '2.1.0');
  assert.equal(map.info.bpm, 120);
  assert.equal(map.info.timeOffsetSeconds, 0.5);
  assert.equal(map.info.title, 'Synthetic v2');
  assert.equal(map.info.beatmapRefs.length, 2);
  assert.equal(map.beatmaps.length, 2);
  assert.deepEqual(
    map.beatmaps.map((beatmap) => `${beatmap.characteristic}/${beatmap.difficulty}`),
    ['Standard/Easy', 'Standard/Expert'],
  );
  assert.equal(map.beatmaps[0].difficultyRank, 3);
  for (const beatmap of map.beatmaps) {
    assertSpreadBeatmap(beatmap);
    assert.deepEqual(
      beatmap.obstacles.map((wall) => wall.durationBeats),
      SPREAD_WALL_DURATIONS,
    );
    assert.equal(beatmap.bombs[0]?.beat, 40);
    assert.deepEqual(
      beatmap.lightEvents.map((light) => light.beat),
      [8, 12, 16, 20],
    );
    assert.deepEqual(
      beatmap.lightEvents.map((light) => [light.type, light.value]),
      [
        [1, 1],
        [1, 0],
        [9, 3],
        [9, 0],
      ],
    );
  }
});

test('v2 bombs with _type 3 become Bombs, never Notes', () => {
  const map = parseFixture('synthetic/syn-v2-basic.zip');
  const expert = map.beatmaps[1];
  assert.ok(expert.bombs.every((bomb) => !expert.notes.some((note) => note.beat === bomb.beat && note.x === bomb.x)));
  assert.ok(expert.notes.every((note) => note.color === 0 || note.color === 1));
});

test('syn-v3-basic parses short-key v3 info with customData offset', () => {
  const map = parseFixture('synthetic/syn-v3-basic.zip');
  assert.equal(map.info.formatVersion, 3);
  assert.equal(map.info.schemaVersion, '3.6.0');
  assert.equal(map.info.timeOffsetSeconds, 0.25);
  assert.equal(map.beatmaps.length, 2);
  for (const beatmap of map.beatmaps) {
    assertSpreadBeatmap(beatmap);
    assert.equal(beatmap.offsetSeconds, 0.25);
    assert.deepEqual(
      beatmap.obstacles.map((wall) => wall.durationBeats),
      SPREAD_WALL_DURATIONS,
    );
  }
});

test('syn-v3-bpm keeps bpm change events through normalization', () => {
  const map = parseFixture('synthetic/syn-v3-bpm.zip');
  assert.equal(map.info.formatVersion, 3);
  const easy = map.beatmaps[0];
  assert.equal(easy.difficulty, 'Easy');
  assert.deepEqual(easy.bpmChanges, [
    { beat: 0, bpm: 120 },
    { beat: 8, bpm: 180 },
  ]);
  assert.deepEqual(
    easy.notes.map((note) => note.beat),
    [4, 8, 12, 16, 20],
  );
  assertSpreadBeatmap(map.beatmaps[1]);
});

test('syn-v3-walls keeps raw v3 wall geometry and fractional durations through normalization', () => {
  const map = parseFixture('synthetic/syn-v3-walls.zip');
  assert.equal(map.info.formatVersion, 3 satisfies BeatmapFormatVersion);
  assert.equal(map.beatmaps.length, 1);
  const beatmap = map.beatmaps[0];
  assert.equal(beatmap.characteristic, 'Standard');
  assert.equal(beatmap.difficulty, 'Expert');
  assert.equal(beatmap.obstacles.length, 12);
  assert.deepEqual(
    beatmap.obstacles.map(
      (wall) => `b${wall.beat} d${wall.durationBeats} x${wall.x} y${wall.y} ${wall.width}x${wall.height}`,
    ),
    [
      'b60 d0.25 x0 y0 1x5',
      'b62 d0.25 x1 y2 1x3',
      'b64 d0.25 x1 y1 1x3',
      'b66 d0.25 x0 y0 2x4',
      'b68 d0.25 x0 y2 2x3',
      'b70 d0.25 x1 y0 3x5',
      'b72 d0.25 x0 y2 3x3',
      'b74 d0.25 x0 y0 4x4',
      'b76 d0.25 x0 y0 5x4',
      'b78 d0.125 x3 y0 1x1',
      'b80 d0.5 x2 y0 1x2',
      'b82 d1.25 x0 y2 2x3',
    ],
  );
});

test('syn-v3-two-characteristics keeps both Expert entries distinct', () => {
  const map = parseFixture('synthetic/syn-v3-two-characteristics.zip');
  assert.equal(map.beatmaps.length, 2);
  assert.deepEqual(
    map.beatmaps.map((beatmap) => `${beatmap.characteristic}/${beatmap.difficulty}`),
    ['Standard/Expert', 'Lawless/Expert'],
  );
  for (const beatmap of map.beatmaps) assertSpreadBeatmap(beatmap);
});

test('syn-v4-basic uses flat info entries and loads the separate lightshow', () => {
  const map = parseFixture('synthetic/syn-v4-basic.zip');
  assert.equal(map.info.formatVersion, 4);
  assert.equal(map.info.schemaVersion, '4.0.0');
  assert.equal(map.info.bpm, 120);
  assert.equal(map.info.title, 'Synthetic v4');
  assert.equal(map.beatmaps.length, 1);
  const expert = map.beatmaps[0];
  assert.equal(expert.characteristic, 'Standard');
  assert.equal(expert.difficulty, 'Expert');
  assert.equal(expert.notes.length, 18);
  assert.equal(expert.bombs.length, 1);
  assert.deepEqual(
    expert.obstacles.map((wall) => wall.durationBeats),
    SPREAD_WALL_DURATIONS,
  );
  assert.equal(expert.lightEvents.length, 11);
  assert.deepEqual(
    expert.lightEvents.map((light) => [light.beat, light.type, light.value]),
    [
      [8, 1, 1],
      [8, 2, 1],
      [8, 3, 1],
      [10, 10, 1],
      [10, 11, 1],
      [12, 1, 0],
      [12, 4, 3],
      [16, 1, 3],
      [20, 4, 0],
      [20, 3, 0],
      [24, 5, 1],
    ],
  );
});

test('syn-v4 light normalization: env light-id groups, flash via strobe, skips honored', () => {
  const map = parseFixture('synthetic/syn-v4-basic.zip');
  const expert = map.beatmaps[0];
  assert.deepEqual(
    expert.lightEvents.filter((light) => light.type === 2).map((light) => [light.beat, light.value]),
    [[8, 1]],
    'rotating_left only from laser ids 0-11 (id 5); the Extend event at beat 16 and rotation/translation/FX groups are skipped',
  );
  assert.deepEqual(
    expert.lightEvents.filter((light) => light.type === 3).map((light) => [light.beat, light.value]),
    [
      [8, 1],
      [20, 0],
    ],
    'rotating_right from laser ids 12-23 (id 17); its white `c` channel reads as on (§3.5 color exclusion)',
  );
  assert.deepEqual(
    expert.lightEvents
      .filter((light) => light.type === 10 || light.type === 11)
      .map((light) => [light.beat, light.type]),
    [
      [10, 10],
      [10, 11],
    ],
    'side_lasers_left from ids 44-47, side_lasers_right from 48-51',
  );
  assert.ok(
    expert.lightEvents.every((light) => light.beat !== 9 && light.beat !== 13 && light.beat !== 28),
    'basicEvents at 9/13 and the white-id 90 / pseudo-id 132 groups at 28 never emit',
  );
  assert.deepEqual(
    expert.lightEvents.filter((light) => light.type === 5).map((light) => [light.beat, light.value]),
    [[24, 1]],
    'boost only from ids 52-63, never from colorBoostEvents at beat 8',
  );
  assert.ok(
    expert.lightEvents.every((light) => [0, 1, 3].includes(light.value)),
    'normalized values only',
  );
});

test('v3 basicBeatmapEvents keep v2 LightWithId semantics through bsmap', () => {
  const observed = new Map<string, Array<[number, number]>>();
  for (const fixture of ['synthetic/syn-v3-basic.zip', 'maps/bsmg-v3-official-sample.zip']) {
    for (const beatmap of parseFixture(fixture).beatmaps) {
      observed.set(
        fixture,
        beatmap.lightEvents.map((light) => [light.type, light.value]),
      );
    }
  }
  assert.deepEqual(observed.get('synthetic/syn-v3-basic.zip'), [
    [1, 1],
    [1, 0],
    [9, 3],
    [9, 0],
  ]);
  assert.deepEqual(observed.get('maps/bsmg-v3-official-sample.zip'), [[1, 3]]);
  for (const pairs of observed.values()) {
    for (const [type, value] of pairs) {
      assert.ok(
        [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].includes(type),
        'type within the D6 group enum (8/9 dropped later)',
      );
      assert.ok(Number.isInteger(value) && value >= 0 && value <= 12, 'value in the v2 light-value domain');
    }
  }
});

test('syn-info-lowercase parses identically to its Info.dat twin', () => {
  const map = parseFixture('synthetic/syn-info-lowercase.zip');
  assert.equal(map.info.formatVersion, 2);
  assert.equal(map.info.title, 'Synthetic lowercase info.dat');
  assert.equal(map.beatmaps.length, 2);
  for (const beatmap of map.beatmaps) assertSpreadBeatmap(beatmap);
});

test('v2 maps carry an empty chain array while arcs stay dropped (decision D5)', () => {
  const map = parseFixture('synthetic/syn-v2-basic.zip');
  for (const beatmap of map.beatmaps) assert.deepEqual(beatmap.chains, []);
});

test('audio and cover assets resolve from the zip, .egg audio accepted', () => {
  const map = parseFixture('synthetic/syn-v2-basic.zip');
  assert.equal(map.assets.songEntryPath, 'song.egg');
  assert.ok(map.assets.songBytes.length > 0);
  assert.equal(map.assets.coverEntryPath, 'cover.png');
  assert.ok(map.assets.coverBytes.length > 0);
});

test('Unity-era v2 fixtures parse with expected counts', () => {
  const cases: Array<[string, BeatmapFormatVersion, Array<[number, number, number]>]> = [
    [
      'maps/DifficultyTestSong.zip',
      2,
      [
        [25, 12, 4],
        [5, 6, 6],
      ],
    ],
    ['maps/EndShort.zip', 2, [[21, 12, 0]]],
    ['maps/HotBeat2.zip', 2, [[25, 24, 4]]],
    ['maps/RedWallTest.zip', 2, [[0, 0, 6]]],
  ];
  for (const [fixture, formatVersion, perBeatmap] of cases) {
    const map = parseFixture(fixture);
    assert.equal(map.info.formatVersion, formatVersion, fixture);
    assert.equal(map.beatmaps.length, perBeatmap.length, fixture);
    for (const [index, [notes, bombs, walls]] of perBeatmap.entries()) {
      const beatmap = map.beatmaps[index];
      assert.equal(beatmap.notes.length, notes, `${fixture}[${index}] notes`);
      assert.equal(beatmap.bombs.length, bombs, `${fixture}[${index}] bombs`);
      assert.equal(beatmap.obstacles.length, walls, `${fixture}[${index}] walls`);
    }
  }
});

test('bsmg official v3 schema sample parses with its vfx quirk repaired', () => {
  const map = parseFixture('maps/bsmg-v3-official-sample.zip');
  assert.equal(map.info.formatVersion, 3);
  assert.equal(map.info.schemaVersion, '3.3.0');
  assert.equal(map.beatmaps.length, 1);
  const expert = map.beatmaps[0];
  assert.equal(expert.characteristic, 'Standard');
  assert.equal(expert.difficulty, 'Expert');
  assert.ok(expert.notes.length >= 1);
  assert.ok(expert.obstacles.length >= 1);
  assert.ok(expert.lightEvents.length >= 1);
});

test('real BeatSaver v4 fixture parses all five difficulties with lightshows', () => {
  const map = parseFixture('maps/beatsaver-v4-443f3.zip');
  assert.equal(map.info.formatVersion, 4);
  assert.equal(map.info.schemaVersion, '4.0.1');
  assert.equal(map.info.bpm, 132);
  assert.equal(map.beatmaps.length, 5);
  assert.deepEqual(
    map.beatmaps.map((beatmap) => beatmap.difficulty),
    ['Easy', 'Normal', 'Hard', 'Expert', 'ExpertPlus'],
  );
  for (const beatmap of map.beatmaps) {
    assert.ok(beatmap.notes.length > 0, `${beatmap.difficulty} notes`);
    assert.ok(beatmap.obstacles.length > 0, `${beatmap.difficulty} walls`);
    assert.ok(beatmap.lightEvents.length > 0, `${beatmap.difficulty} light events`);
  }
  assert.ok(map.beatmaps[4].notes.length > map.beatmaps[0].notes.length, 'ExpertPlus exceeds Easy');
  const fractional = map.beatmaps.flatMap((beatmap) => beatmap.obstacles).find((wall) => wall.durationBeats % 1 !== 0);
  assert.ok(fractional !== undefined, 'real v4 walls keep fractional durations (B5)');
});

test('v4 map derives its bpm curve from AudioData when beatmaps carry none', () => {
  const map = parseFixture('maps/beatsaver-v4-443f3.zip');
  const easy = map.beatmaps[0];
  assert.ok(easy.bpmChanges.length > 0, 'AudioData.dat should provide the bpm curve');
  assert.ok(easy.bpmChanges.every((event) => event.bpm > 0 && Number.isFinite(event.beat)));
});

test('MissingCover.zip fails with MissingCover', () => {
  const error = expectConversionError(() => parseFixture('maps/MissingCover.zip'), ConversionErrorKind.MissingCover);
  assert.match(error.message, /cover\.jpg/);
});

test('MissingSong.zip fails with MissingSongFile', () => {
  expectConversionError(() => parseFixture('maps/MissingSong.zip'), ConversionErrorKind.MissingSongFile);
});

test('MissingSongData.zip fails with MissingSongData', () => {
  expectConversionError(() => parseFixture('maps/MissingSongData.zip'), ConversionErrorKind.MissingSongData);
});

test('a malformed info file fails with InvalidBeatMap', () => {
  const brokenZip = zipSync({
    'Info.dat': new TextEncoder().encode('{"_songName": '),
    'cover.png': new TextEncoder().encode('x'),
    'song.egg': new TextEncoder().encode('y'),
  });
  expectConversionError(() => parseBeatmap(readMapZip(brokenZip)), ConversionErrorKind.InvalidBeatMap);
});

test('an unsupported info version fails with UnsupportedVersion', () => {
  const zip = syntheticZip({
    version: '1.5.0',
    bpm: 120,
    songFilename: 'song.egg',
    coverImageFilename: 'cover.png',
    difficultyLevels: [],
  });
  expectConversionError(() => parseBeatmap(readMapZip(zip)), ConversionErrorKind.UnsupportedVersion);
});

test('an info file with no difficulties fails with NoMapData', () => {
  const zip = syntheticZip({
    _version: '2.1.0',
    _beatsPerMinute: 120,
    _songFilename: 'song.egg',
    _coverImageFilename: 'cover.png',
    _difficultyBeatmapSets: [],
  });
  expectConversionError(() => parseBeatmap(readMapZip(zip)), ConversionErrorKind.NoMapData);
});

test('openFixture hands out a parsed-open zip for reuse by later golden tests', () => {
  const opened = openFixture('synthetic/syn-v2-basic.zip');
  assert.equal(opened.infoPath, 'info.dat');
  assert.equal(opened.entries.size, 5);
});
