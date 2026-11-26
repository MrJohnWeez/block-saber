import assert from 'node:assert/strict';
import { test } from 'node:test';

import { strFromU8, zipSync } from 'fflate';

import { ConversionErrorKind } from '../src/converter/conversion-error';
import { decodeEntryText, lookupMapFile, lookupMapPath, readMapZip, stripBom } from '../src/converter/read-map-zip';
import { expectConversionError, readFixtureZip } from './helpers';

function text(content: string): Uint8Array {
  return new TextEncoder().encode(content);
}

test('finds Info.dat with any casing at the zip root', () => {
  const zip = zipSync({ 'Info.dat': text('{}'), 'cover.png': text('x'), 'song.egg': text('y') });
  assert.equal(readMapZip(zip).infoPath, 'info.dat');
});

test('finds lowercase info.dat (Unity bug B6)', () => {
  const opened = readMapZip(readFixtureZip('synthetic/syn-info-lowercase.zip'));
  assert.equal(opened.infoPath, 'info.dat');
  assert.match(opened.infoText, /Synthetic lowercase info\.dat/);
});

test('finds the info file one folder deep but not deeper', () => {
  const oneDeep = zipSync({ 'Artist - Song/Info.dat': text('{}') });
  assert.equal(readMapZip(oneDeep).infoPath, 'artist - song/info.dat');
  const twoDeep = zipSync({ 'a/b/Info.dat': text('{}') });
  expectConversionError(() => readMapZip(twoDeep), ConversionErrorKind.MissingInfo);
});

test('prefers a root info file over a nested one', () => {
  const zip = zipSync({ 'Info.dat': text('{"_from":"root"}'), 'pack/Info.dat': text('{"_from":"nested"}') });
  const opened = readMapZip(zip);
  assert.equal(opened.infoPath, 'info.dat');
  assert.match(opened.infoText, /root/);
});

test('rejects bytes that are not a zip', () => {
  expectConversionError(() => readMapZip(text('not a zip file')), ConversionErrorKind.InvalidZipFile);
});

test('reports MissingInfo when the zip has no info file', () => {
  expectConversionError(() => readMapZip(readFixtureZip('maps/InvalidData.zip')), ConversionErrorKind.MissingInfo);
});

test('strips byte-order marks from decoded entries', () => {
  const zip = zipSync({ 'Info.dat': text('\uFEFF{"_version":"2.1.0"}') });
  const opened = readMapZip(zip);
  assert.ok(!opened.infoText.startsWith('\uFEFF'));
  assert.equal(JSON.parse(opened.infoText)._version, '2.1.0');
  assert.equal(stripBom('\uFEFFabc'), 'abc');
});

test('entry keys are lowercase full paths', () => {
  const opened = readMapZip(readFixtureZip('synthetic/syn-v2-basic.zip'));
  assert.ok(opened.entries.has('easystandard.dat'));
  assert.ok(opened.entries.has('cover.png'));
  assert.ok(opened.entries.has('song.egg'));
});

test('referenced files resolve case-insensitively by name', () => {
  const zip = zipSync({ 'Songs/Cover.PNG': text('bytes'), 'Info.dat': text('{}') });
  const opened = readMapZip(zip);
  assert.equal(lookupMapPath(opened.entries, 'cover.png'), 'songs/cover.png');
  assert.equal(strFromU8(lookupMapFile(opened.entries, 'COVER.pnG') as Uint8Array), 'bytes');
  assert.equal(lookupMapFile(opened.entries, 'nope.ogg'), null);
  assert.equal(lookupMapFile(opened.entries, '   '), null);
});

test('decodeEntryText returns empty for missing paths and decodes known ones', () => {
  const opened = readMapZip(readFixtureZip('synthetic/syn-v3-basic.zip'));
  assert.equal(decodeEntryText(opened.entries, 'does-not-exist.dat'), '');
  assert.equal(JSON.parse(decodeEntryText(opened.entries, opened.infoPath)).version, '3.6.0');
});

test('unzipped real fixtures keep their files', () => {
  const opened = readMapZip(readFixtureZip('maps/beatsaver-v4-443f3.zip'));
  assert.ok(opened.entries.get('info.dat')!.length > 0);
  assert.ok(opened.entries.has('expertplus.lightshow.dat'));
  assert.ok(opened.entries.has('audiodata.dat'));
});

test('ConversionError carries its kind', () => {
  try {
    readMapZip(text('junk'));
    assert.fail('should have thrown');
  } catch (error) {
    assert.ok(error instanceof Error);
    assert.equal((error as { kind?: string }).kind, ConversionErrorKind.InvalidZipFile);
    assert.ok(error.message.includes('Could not unzip'));
  }
});
