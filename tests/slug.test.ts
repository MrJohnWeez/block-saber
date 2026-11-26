import assert from 'node:assert/strict';
import { test } from 'node:test';

import { makeSlug, sha1Hex, sha1Hex8, sha256Hex, slugForMap } from '../src/converter/slug';

function utf8(text: string): Uint8Array {
  return new TextEncoder().encode(text);
}

const FULL_SHA1_ABC = 'a9993e364706816aba3e25717850c26c9cd0d89d';

test('sha1Hex matches the published SHA-1 test vector for "abc"', async () => {
  assert.equal(await sha1Hex('abc'), FULL_SHA1_ABC);
});

test('sha256Hex matches the published SHA-256 test vector for "abc"', async () => {
  assert.equal(await sha256Hex(utf8('abc')), 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
});

test('sha1Hex8 is stable, 8 lowercase hex chars, and differs across inputs', async () => {
  const first = await sha1Hex8('443f3');
  const again = await sha1Hex8('443f3');
  const other = await sha1Hex8('6a07c1d2');
  assert.equal(first, again);
  assert.match(first, /^[0-9a-f]{8}$/);
  assert.notEqual(first, other);
});

test('makeSlug takes 8 hex by default, 12 hex plus suffix when grown', () => {
  assert.equal(makeSlug(FULL_SHA1_ABC), 'a9993e36');
  assert.equal(makeSlug(FULL_SHA1_ABC, ''), 'a9993e364706');
  assert.equal(makeSlug(FULL_SHA1_ABC, 'z'), 'a9993e364706z');
});

test('makeSlug output stays within the 16-char namespace budget with the bs_ prefix', () => {
  assert.ok(makeSlug(FULL_SHA1_ABC).length <= 13);
  assert.ok(makeSlug(FULL_SHA1_ABC, 'z').length <= 13);
});

test('slugForMap uses the BeatSaver key verbatim as hash input when known', async () => {
  const slug = await slugForMap({ beatsaverKey: '443f3', infoBytes: utf8('anything'), firstBeatmapFilename: 'x.dat' });
  assert.equal(slug, await sha1Hex8('443f3'));
  assert.ok(`bs_${slug}`.length <= 16);
});

test('slugForMap falls back to sha256(info)|firstFilename for hand-dropped zips', async () => {
  const infoBytes = utf8('{"_songName":"t"}');
  const slug = await slugForMap({ beatsaverKey: null, infoBytes, firstBeatmapFilename: 'ExpertStandard.dat' });
  const digest = await sha256Hex(infoBytes);
  assert.equal(slug, (await sha1Hex(`${digest}|ExpertStandard.dat`)).slice(0, 8));
  const otherFile = await slugForMap({ beatsaverKey: null, infoBytes, firstBeatmapFilename: 'EasyStandard.dat' });
  assert.notEqual(slug, otherFile);
});

test('slugForMap collision growth yields 12 hex', async () => {
  const slug = await slugForMap({
    beatsaverKey: '443f3',
    infoBytes: utf8('x'),
    firstBeatmapFilename: 'a.dat',
    collisionSuffix: '',
  });
  assert.match(slug, /^[0-9a-f]{12}$/);
});
