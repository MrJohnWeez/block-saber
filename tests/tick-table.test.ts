import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  beatToSeconds,
  beatToTick,
  buildSpawnEvents,
  DEFAULT_SONG_BPM,
  normalizeBpmSegments,
  TICKS_PER_SECOND,
} from '../src/converter/tick-table';
import type { BpmChangeEvent, SpawnEvent, SpawnNoteEvent, SpawnWallEvent } from '../src/converter/types';
import { parseFixture } from './helpers';

const BPM_CHANGE_EVENTS: BpmChangeEvent[] = [
  { beat: 0, bpm: 120 },
  { beat: 8, bpm: 180 },
];

test('beatToTick matches hand-computed math across a 120 to 180 change at beat 8', () => {
  assert.equal(beatToTick(4, BPM_CHANGE_EVENTS, 0), 40);
  assert.equal(beatToTick(8, BPM_CHANGE_EVENTS, 0), 80);
  assert.equal(beatToTick(12, BPM_CHANGE_EVENTS, 0), 107);
  assert.equal(beatToTick(16, BPM_CHANGE_EVENTS, 0), 133);
  assert.equal(beatToTick(20, BPM_CHANGE_EVENTS, 0), 160);
});

test('beatToTick applies a positive offset seconds shift earlier against the audio', () => {
  assert.equal(beatToTick(4, BPM_CHANGE_EVENTS, 0.5), 30);
  assert.equal(beatToTick(20, BPM_CHANGE_EVENTS, 0.5), 150);
});

test('beatToSeconds integrates tempo piecewise', () => {
  assert.equal(beatToSeconds(8, BPM_CHANGE_EVENTS), 4);
  assert.ok(Math.abs(beatToSeconds(12, BPM_CHANGE_EVENTS) - 16 / 3) < 1e-9);
  assert.equal(beatToSeconds(20, BPM_CHANGE_EVENTS), 8);
  assert.ok(Math.abs(beatToSeconds(-4, BPM_CHANGE_EVENTS) + 2) < 1e-9);
});

test('beatToTick falls back to 120 BPM for empty event lists', () => {
  assert.equal(beatToTick(2, [], 0), 20);
});

test('normalizeBpmSegments sorts, dedupes, and anchors beat 0', () => {
  assert.deepEqual(normalizeBpmSegments([], 150), [{ beat: 0, bpm: 150 }]);
  assert.deepEqual(normalizeBpmSegments([{ beat: 8, bpm: 180 }], 120), [
    { beat: 0, bpm: 120 },
    { beat: 8, bpm: 180 },
  ]);
  assert.deepEqual(
    normalizeBpmSegments(
      [
        { beat: 4, bpm: 100 },
        { beat: 4, bpm: 140 },
        { beat: 2, bpm: -5 },
      ],
      120,
    ),
    [
      { beat: 0, bpm: 120 },
      { beat: 4, bpm: 140 },
    ],
  );
});

test('fixture syn-v3-bpm Easy notes land on hand-computed ticks', () => {
  const map = parseFixture('synthetic/syn-v3-bpm.zip');
  const events = buildSpawnEvents(map.beatmaps[0], map.info);
  const noteTicks = events.filter((event): event is SpawnNoteEvent => event.kind === 'note').map((event) => event.tick);
  assert.deepEqual(noteTicks, [35, 75, 102, 128, 155]);
});

test('spawn events are sorted by tick with control boundaries bracketing the map', () => {
  const map = parseFixture('synthetic/syn-v3-bpm.zip');
  const events = buildSpawnEvents(map.beatmaps[0], map.info);
  for (let i = 1; i < events.length; i += 1) {
    assert.ok(events[i - 1].tick <= events[i].tick, `tick order broken at index ${i}`);
  }
  const start = events[0];
  assert.ok(start.kind === 'control' && start.control === 'start');
  assert.equal(start.tick, -5);
  const end = events.find((event) => event.kind === 'control' && event.control === 'end');
  assert.ok(end !== undefined, 'end control event missing');
  assert.equal(end.tick, 155);
});

test('wall end ticks preserve fractional durations (Unity bug B5)', () => {
  const map = parseFixture('synthetic/syn-v2-basic.zip');
  const events = buildSpawnEvents(map.beatmaps[1], map.info);
  const walls = events.filter((event): event is SpawnWallEvent => event.kind === 'wall');
  assert.equal(walls.length, 4);
  assert.deepEqual(
    walls.map((wall) => wall.endTick - wall.tick),
    [15, 5, 23, 18],
  );
  assert.ok(walls.every((wall) => wall.endTick > wall.tick));
});

test('same-tick ties keep a stable kind order', () => {
  const map = parseFixture('synthetic/syn-v2-basic.zip');
  const events = buildSpawnEvents(map.beatmaps[1], map.info);
  const atBeat8 = events.filter((event: SpawnEvent) => event.tick === 70 && event.kind !== 'control');
  assert.ok(atBeat8.length >= 2);
  assert.deepEqual(
    atBeat8.map((event) => event.kind),
    ['light', 'note'],
  );
});

test('tick constants are the engine contract', () => {
  assert.equal(TICKS_PER_SECOND, 20);
  assert.equal(DEFAULT_SONG_BPM, 120);
});
