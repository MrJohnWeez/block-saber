import { strFromU8, unzipSync } from 'fflate';

import { ConversionError, ConversionErrorKind } from './conversion-error';

/** A Beat Saber map zip that has been unzipped in memory. */
export interface OpenedMapZip {
  /** Every zip entry keyed by its full lowercase path. */
  entries: ReadonlyMap<string, Uint8Array>;
  /** Lowercase path of the located info file (fixes Unity bug B6 by ignoring case). */
  infoPath: string;
  /** Info file text with any byte-order mark stripped. */
  infoText: string;
}

/**
 * Unzip map bytes and locate the info file at the zip root or one folder deep, case-insensitively.
 *
 * @param zipBytes Raw `.zip` file bytes.
 * @returns The lowercase-keyed entry map plus the decoded info file.
 * @throws ConversionError With `InvalidZipFile` when the archive cannot be read or `MissingInfo` when no
 *   info file exists.
 */
export function readMapZip(zipBytes: Uint8Array): OpenedMapZip {
  let unzipped: Record<string, Uint8Array>;
  try {
    unzipped = unzipSync(zipBytes);
  } catch (error: unknown) {
    throw new ConversionError(ConversionErrorKind.InvalidZipFile, `Could not unzip map: ${describeError(error)}`);
  }
  const entries = new Map<string, Uint8Array>();
  for (const [name, bytes] of Object.entries(unzipped)) {
    if (name.endsWith('/')) continue;
    entries.set(name.toLowerCase(), bytes);
  }
  const infoPath = findInfoPath(entries.keys());
  if (infoPath === null) {
    throw new ConversionError(
      ConversionErrorKind.MissingInfo,
      'Map zip contains no Info.dat at root or one folder deep',
    );
  }
  return { entries, infoPath, infoText: decodeEntryText(entries, infoPath) };
}

/**
 * Find a referenced map file by name, ignoring case and matching the basename when the reference has no folder.
 *
 * @param entries Lowercase-keyed entries from {@link readMapZip}.
 * @param referencedName Filename as written inside the info file.
 * @returns The file bytes, or null when the reference points at nothing (missing files are tolerated here).
 */
export function lookupMapFile(entries: ReadonlyMap<string, Uint8Array>, referencedName: string): Uint8Array | null {
  const path = lookupMapPath(entries, referencedName);
  return path === null ? null : (entries.get(path) ?? null);
}

/**
 * Same lookup as {@link lookupMapFile} but returning the lowercase zip path instead of the bytes.
 *
 * @param entries Lowercase-keyed entries from {@link readMapZip}.
 * @param referencedName Filename as written inside the info file.
 * @returns The matching lowercase path, or null when not found.
 */
export function lookupMapPath(entries: ReadonlyMap<string, Uint8Array>, referencedName: string): string | null {
  const wanted = normalizeReference(referencedName);
  if (wanted === null) return null;
  if (entries.has(wanted)) return wanted;
  const basename = wanted.slice(wanted.lastIndexOf('/') + 1);
  let best: string | null = null;
  let bestDepth = Number.POSITIVE_INFINITY;
  for (const path of entries.keys()) {
    if (path !== basename && !path.endsWith(`/${basename}`)) continue;
    const depth = path.split('/').length;
    if (depth < bestDepth || (depth === bestDepth && (best === null || path < best))) {
      best = path;
      bestDepth = depth;
    }
  }
  return best;
}

/**
 * Decode a zip entry as UTF-8 text, dropping a leading byte-order mark.
 *
 * @param entries Lowercase-keyed entries from {@link readMapZip}.
 * @param path Lowercase entry path.
 * @returns The decoded, BOM-stripped text (empty for a missing path).
 */
export function decodeEntryText(entries: ReadonlyMap<string, Uint8Array>, path: string): string {
  const bytes = entries.get(path);
  return bytes === undefined ? '' : stripBom(strFromU8(bytes));
}

/**
 * Remove a leading U+FEFF byte-order mark from text.
 *
 * @param text Decoded file text.
 * @returns The same text without a leading BOM.
 */
export function stripBom(text: string): string {
  return text.startsWith('\uFEFF') ? text.slice(1) : text;
}

function findInfoPath(paths: IterableIterator<string>): string | null {
  let best: string | null = null;
  let bestDepth = Number.POSITIVE_INFINITY;
  for (const path of paths) {
    const parts = path.split('/');
    if (parts.at(-1) !== 'info.dat' || parts.length > 2) continue;
    const depth = parts.length;
    if (depth < bestDepth || (depth === bestDepth && (best === null || path < best))) {
      best = path;
      bestDepth = depth;
    }
  }
  return best;
}

function normalizeReference(referencedName: string): string | null {
  const trimmed = referencedName
    .trim()
    .replace(/\\/g, '/')
    .replace(/^\.?\/+/, '');
  if (trimmed === '' || trimmed.endsWith('/')) return null;
  return trimmed.toLowerCase();
}

function describeError(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
