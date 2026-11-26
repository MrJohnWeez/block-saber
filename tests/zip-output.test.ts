import assert from 'node:assert/strict';
import { test } from 'node:test';

import { strFromU8, unzipSync } from 'fflate';

import { packZipName, sanitizeFileName, zipPackFiles } from '../src/converter/zip-output';

test('packZipName follows the contract examples and keeps spaces and hyphens', () => {
  const info = { title: 'Blueberry Dream', songAuthorName: 'QooBee' };
  assert.equal(packZipName(info, 'datapack'), 'BlockSaber - QooBee - Blueberry Dream (datapack).zip');
  assert.equal(packZipName(info, 'resourcepack'), 'Block Saber Songs (resourcepack).zip');
});

test('sanitizeFileName drops path-hostile characters and trailing dots', () => {
  assert.equal(sanitizeFileName('A/B:C "q" <x>|y|z*?'), 'A B C q x y z');
  assert.equal(sanitizeFileName('  spaced..out...  '), 'spaced..out');
  assert.equal(sanitizeFileName('Plain - Name 123'), 'Plain - Name 123');
});

test('zipPackFiles sorts entries so identical maps zip to identical bytes', () => {
  const forward = new Map<string, string | Uint8Array>([
    ['a.txt', 'first'],
    ['b/c.txt', 'second'],
    ['z.bin', new Uint8Array([1, 2, 3])],
  ]);
  const backward = new Map<string, string | Uint8Array>([
    ['z.bin', new Uint8Array([1, 2, 3])],
    ['b/c.txt', 'second'],
    ['a.txt', 'first'],
  ]);
  const zipA = zipPackFiles(forward);
  const zipB = zipPackFiles(backward);
  assert.deepEqual(Array.from(zipA), Array.from(zipB));
  const unzipped = unzipSync(zipA);
  assert.deepEqual(Object.keys(unzipped).sort(), ['a.txt', 'b/c.txt', 'z.bin']);
  assert.equal(strFromU8(unzipped['b/c.txt']), 'second');
  assert.deepEqual(Array.from(unzipped['z.bin']), [1, 2, 3]);
});
