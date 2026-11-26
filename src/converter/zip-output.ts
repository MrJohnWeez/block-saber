/**
 * Deterministic zip packaging and file naming for emitted packs (contract §1.1 and §5).
 *
 * Entry order is sorted by path so the same file map always zips to identical bytes, and names are
 * sanitized for filesystems while keeping the spaces and hyphens the contract examples use.
 */

import { zipSync } from 'fflate';

import type { SongInfo } from './types';

/**
 * Zip a file map with entries sorted by name so output is deterministic.
 *
 * @param files Zip-root-relative paths to UTF-8 text or binary content, e.g. from `emitSongPack`.
 * @returns Complete `.zip` archive bytes.
 */
export function zipPackFiles(files: ReadonlyMap<string, string | Uint8Array>): Uint8Array {
  const entries: Record<string, Uint8Array> = {};
  for (const name of Array.from(files.keys()).sort()) {
    const value = files.get(name) as string | Uint8Array;
    entries[name] = typeof value === 'string' ? new TextEncoder().encode(value) : value;
  }
  return zipSync(entries, { level: 6 });
}

/**
 * Strip filesystem-hostile characters while keeping spaces and hyphens.
 *
 * @param raw Candidate file name (typically from song metadata).
 * @returns Safe single-path-segment name, trimmed of separators, dots and extra spaces.
 */
export function sanitizeFileName(raw: string): string {
  const cleaned = raw
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u001f<>:"/\\|?*]/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/[. ]+$/g, '')
    .trim();
  return cleaned;
}

/**
 * Build the download file name for an emitted pack.
 *
 * @param info Parsed song info providing artist and title; unused fields are ignored for the songs pack.
 * @param kind Which pack is being named.
 * @returns Sanitized zip name: `BlockSaber - <Artist> - <Title> (datapack).zip` or `Block Saber Songs (resourcepack).zip`.
 */
export function packZipName(
  info: Pick<SongInfo, 'title' | 'songAuthorName'>,
  kind: 'datapack' | 'resourcepack',
): string {
  const base = kind === 'datapack' ? `BlockSaber - ${info.songAuthorName} - ${info.title}` : 'Block Saber Songs';
  const suffix = kind === 'datapack' ? 'datapack' : 'resourcepack';
  return `${sanitizeFileName(base)} (${suffix}).zip`;
}
