import assert from 'node:assert/strict';
import { test } from 'node:test';

import { expandChainsToDots } from '../src/converter/chain-expansion';
import type { Beatmap, SongInfo } from '../src/converter/types';
import { parseFixture } from './helpers';

const INFO: SongInfo = {
  formatVersion: 3,
  schemaVersion: '3.6.0',
  title: 't',
  subTitle: '',
  songAuthorName: 'a',
  levelAuthorName: 'a',
  bpm: 120,
  timeOffsetSeconds: 0,
  previewStartSeconds: 0,
  previewDurationSeconds: 10,
  songFilename: 's.ogg',
  coverFilename: 'c.png',
  audioDataFilename: null,
  environmentNames: [],
  allDirectionsEnvironmentName: '',
  beatmapRefs: [],
};

function emptyBeatmap(overrides: Partial<Beatmap>): Beatmap {
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

test('a chain with free endpoints expands into exactly two dot notes at head and tail', () => {
  const beatmap = emptyBeatmap({
    chains: [{ beat: 10, x: 1, y: 2, color: 1, tailBeat: 10.5, tailX: 2, tailY: 0 }],
  });
  const dots = expandChainsToDots(beatmap, INFO);
  assert.equal(dots.length, 2);
  assert.deepEqual(dots[0], { beat: 10, x: 1, y: 2, color: 1, cutDirection: 8, angleOffset: 0 });
  assert.deepEqual(dots[1], { beat: 10.5, x: 2, y: 0, color: 1, cutDirection: 8, angleOffset: 0 });
});

test('chain endpoints sharing tick and grid cell with a real note are deduped, the other endpoint survives', () => {
  const beatmap = emptyBeatmap({
    notes: [{ beat: 10, x: 1, y: 2, color: 1, cutDirection: 3, angleOffset: 0 }],
    chains: [{ beat: 10, x: 1, y: 2, color: 1, tailBeat: 10.5, tailX: 2, tailY: 0 }],
  });
  const dots = expandChainsToDots(beatmap, INFO);
  assert.equal(dots.length, 1);
  assert.deepEqual(
    dots.map((dot) => dot.beat),
    [10.5],
  );
});

test('two chains sharing an endpoint emit that dot only once', () => {
  const beatmap = emptyBeatmap({
    chains: [
      { beat: 10, x: 0, y: 0, color: 0, tailBeat: 12, tailX: 3, tailY: 2 },
      { beat: 11, x: 1, y: 1, color: 0, tailBeat: 12, tailX: 3, tailY: 2 },
    ],
  });
  const dots = expandChainsToDots(beatmap, INFO);
  assert.equal(dots.length, 3);
});

test('a nearby-but-different tick does not dedupe (dedup is exact tick plus cell)', () => {
  const beatmap = emptyBeatmap({
    notes: [{ beat: 10.1, x: 1, y: 2, color: 1, cutDirection: 8, angleOffset: 0 }],
    chains: [{ beat: 10, x: 1, y: 2, color: 1, tailBeat: 10.5, tailX: 1, tailY: 2 }],
  });
  const dots = expandChainsToDots(beatmap, INFO);
  assert.equal(dots.length, 2);
});

test('syn-v3-basic fixture carries its burst slider end-to-end into the chain model', () => {
  const map = parseFixture('synthetic/syn-v3-basic.zip');
  const chains = map.beatmaps[0].chains;
  assert.equal(chains.length, 1);
  assert.deepEqual(chains[0], { beat: 54, x: 2, y: 1, color: 1, tailBeat: 54.5, tailX: 2, tailY: 1 });
});

test('syn-v4-basic fixture carries its v4 chain head from colorNotesData and tail from chainsData', () => {
  const map = parseFixture('synthetic/syn-v4-basic.zip');
  const chains = map.beatmaps[0].chains;
  assert.equal(chains.length, 1);
  assert.deepEqual(chains[0], { beat: 56, x: 2, y: 0, color: 0, tailBeat: 56.5, tailX: 0, tailY: 2 });
});
