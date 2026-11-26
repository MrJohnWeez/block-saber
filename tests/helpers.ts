import assert from 'node:assert/strict';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  emitSongPack,
  type CoverImageConverter,
  type EmittedDataPack,
  type ParsedSong,
} from '../src/converter/emit-datapack';
import { parseBeatmap } from '../src/converter/parse-beatmap';
import { ConversionError, type ConversionErrorKind } from '../src/converter/conversion-error';
import { readMapZip, type OpenedMapZip } from '../src/converter/read-map-zip';
import { slugForMap } from '../src/converter/slug';
import type { ParsedMap } from '../src/converter/types';

/** Repository root; this file lives one level below it, as does the bundled `.tmp-tests/` copy. */
export const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

/**
 * Read a fixture zip from `test-data/`.
 *
 * @param fixturePath Path relative to `test-data/`, e.g. `maps/EndShort.zip`.
 * @returns The raw zip bytes.
 */
export function readFixtureZip(fixturePath: string): Uint8Array {
  const bytes = readFileSync(path.join(REPO_ROOT, 'test-data', fixturePath));
  return new Uint8Array(bytes.buffer, bytes.byteOffset, bytes.byteLength);
}

/**
 * Run the full read stage on a fixture zip.
 *
 * @param fixturePath Path relative to `test-data/`.
 * @returns The opened zip.
 */
export function openFixture(fixturePath: string): OpenedMapZip {
  return readMapZip(readFixtureZip(fixturePath));
}

/**
 * Run read plus parse on a fixture zip.
 *
 * @param fixturePath Path relative to `test-data/`.
 * @returns The fully parsed map.
 */
export function parseFixture(fixturePath: string): ParsedMap {
  return parseBeatmap(openFixture(fixturePath));
}

/**
 * Assert a call fails with a specific {@link ConversionErrorKind}.
 *
 * @param fn Call expected to throw.
 * @param kind The conversion error kind to expect.
 * @returns The thrown conversion error for further inspection.
 */
export function expectConversionError(fn: () => unknown, kind: ConversionErrorKind): ConversionError {
  let thrown: unknown;
  try {
    fn();
  } catch (error) {
    thrown = error;
  }
  assert.ok(thrown instanceof ConversionError, `expected a ConversionError, got ${String(thrown)}`);
  assert.equal(thrown.kind, kind, `expected ${kind}, got ${thrown.kind}: ${thrown.message}`);
  return thrown;
}

/** Minimal real 1x1 transparent PNG standing in for a canvas-converted cover in tests. */
export const FAKE_PNG_BYTES: Uint8Array = Uint8Array.from(
  atob('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='),
  (char) => char.charCodeAt(0),
);

/** Cover converter returning {@link FAKE_PNG_BYTES}; real conversions are M5 worker territory. */
export const FAKE_COVER_CONVERTER: CoverImageConverter = {
  toPng: async (): Promise<Uint8Array> => FAKE_PNG_BYTES,
};

/**
 * Run read, parse, fallback-slug resolution, and datapack emission on a fixture zip.
 *
 * @param fixturePath Path relative to `test-data/`.
 * @returns The emitted pack plus the parsed song it was emitted from.
 */
export async function emitFixture(fixturePath: string): Promise<{ pack: EmittedDataPack; song: ParsedSong }> {
  const opened = openFixture(fixturePath);
  const map = parseBeatmap(opened);
  const infoBytes = opened.entries.get(opened.infoPath) as Uint8Array;
  const slug = await slugForMap({
    beatsaverKey: null,
    infoBytes,
    firstBeatmapFilename: map.info.beatmapRefs[0].beatmapDataFilename,
  });
  const song: ParsedSong = { ...map, slug };
  const pack = await emitSongPack(song, { coverConverter: FAKE_COVER_CONVERTER });
  return { pack, song };
}

/**
 * Compare text against a file in `tests/__snapshots__/`, regenerating when `UPDATE_SNAPSHOTS=1`.
 *
 * @param snapshotName Snapshot base name; the file gets `.snap.txt`.
 * @param content Full snapshot text to compare or write.
 */
export function matchSnapshot(snapshotName: string, content: string): void {
  const snapshotPath = path.join(REPO_ROOT, 'tests', '__snapshots__', `${snapshotName}.snap.txt`);
  if (process.env.UPDATE_SNAPSHOTS === '1') {
    mkdirSync(path.dirname(snapshotPath), { recursive: true });
    writeFileSync(snapshotPath, content, 'utf8');
    return;
  }
  const relative = path.relative(REPO_ROOT, snapshotPath);
  assert.ok(
    existsSync(snapshotPath),
    `missing snapshot ${relative} — generate it with UPDATE_SNAPSHOTS=1 npm run test`,
  );
  assert.equal(
    content,
    readFileSync(snapshotPath, 'utf8'),
    `snapshot ${relative} mismatch — regenerate with UPDATE_SNAPSHOTS=1 npm run test`,
  );
}

/**
 * Render an emitted datapack as deterministic snapshot text.
 *
 * Lists sorted entries, then full text for lifecycle/dispatcher/meta files and the first 60 lines of each
 * level file.
 *
 * @param pack Emitted pack from {@link emitFixture}.
 * @returns Snapshot body ending in a single newline.
 */
export function datapackSnapshotText(pack: EmittedDataPack): string {
  const names = Array.from(pack.files.keys()).sort();
  const parts: string[] = ['## entries'];
  for (const name of names) {
    const value = pack.files.get(name) as string | Uint8Array;
    parts.push(`${typeof value === 'string' ? 'text  ' : 'bin   '} ${name}`);
  }
  for (const name of names) {
    const value = pack.files.get(name);
    if (typeof value !== 'string') continue;
    if (/_lvl_\d+\.mcfunction$/.test(name)) {
      const lines = value.split('\n');
      parts.push(`\n## ${name} (first 60 of ${lines.length - 1} lines)\n${lines.slice(0, 60).join('\n')}`);
    } else {
      parts.push(`\n## ${name} (full)\n${value.replace(/\n$/, '')}`);
    }
  }
  return `${parts.join('\n')}\n`;
}
