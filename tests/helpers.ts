import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { parseBeatmap } from '../src/converter/parse-beatmap';
import { ConversionError, type ConversionErrorKind } from '../src/converter/conversion-error';
import { readMapZip, type OpenedMapZip } from '../src/converter/read-map-zip';
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
