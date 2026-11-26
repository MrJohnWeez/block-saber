/**
 * Deterministic namespace slug derivation for song packs, contract §1.2 decision D1.
 *
 * The slug seeds from the BeatSaver map key when known, otherwise from a SHA-256 of the zip's `Info.dat`
 * bytes joined with the first beatmap data filename; `globalThis.crypto.subtle` keeps this browser-safe.
 */

/** Default slug length in hex characters, contract §1.2. */
export const SLUG_HEX_LENGTH = 8;

/** Collision-grown slug length in hex characters, contract §1.2. */
export const SLUG_GROWN_HEX_LENGTH = 12;

/** Maximum length of the full `bs_<slug>` namespace, contract §1.2. */
export const NAMESPACE_MAX_LENGTH = 16;

/**
 * Hex-encode a digest the lowercase way MC slugs need.
 *
 * @param bytes Raw digest bytes.
 * @returns Lowercase hex string.
 */
function toHex(bytes: ArrayBuffer): string {
  return Array.from(new Uint8Array(bytes))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Compute the full lowercase hex SHA-1 of a string via WebCrypto.
 *
 * @param input Text to hash (UTF-8 encoded).
 * @returns 40-character lowercase hex digest.
 */
export async function sha1Hex(input: string): Promise<string> {
  const digest = await globalThis.crypto.subtle.digest('SHA-1', new TextEncoder().encode(input));
  return toHex(digest);
}

/**
 * Compute the first 8 hex characters of SHA-1, the D1 slug source.
 *
 * @param input Text to hash (UTF-8 encoded).
 * @returns 8-character lowercase hex string.
 */
export async function sha1Hex8(input: string): Promise<string> {
  return (await sha1Hex(input)).slice(0, SLUG_HEX_LENGTH);
}

/**
 * Compute the full lowercase hex SHA-256 of binary data via WebCrypto.
 *
 * @param input Raw bytes to hash.
 * @returns 64-character lowercase hex digest.
 */
export async function sha256Hex(input: Uint8Array): Promise<string> {
  const digest = await globalThis.crypto.subtle.digest('SHA-256', new Uint8Array(input));
  return toHex(digest);
}

/**
 * Derive the stable namespace slug from a full SHA-1 hex digest, pure so callers own collision state.
 *
 * Without `collisionSuffix` this yields the first 8 hex characters; passing any string (empty included)
 * grows the slug to 12 hex characters plus the suffix, modelling the contract §1.2 collision growth.
 *
 * @param inputHex Full lowercase hex digest from {@link sha1Hex}.
 * @param collisionSuffix Extra disambiguator appended when growing; omit for the 8-hex default.
 * @returns Lowercase hex slug suitable for `bs_<slug>`.
 */
export function makeSlug(inputHex: string, collisionSuffix?: string): string {
  if (collisionSuffix === undefined) return inputHex.slice(0, SLUG_HEX_LENGTH);
  return inputHex.slice(0, SLUG_GROWN_HEX_LENGTH) + collisionSuffix;
}

/**
 * Resolve the contract §1.2 slug input for a map: BeatSaver key when known, else Info-hash plus filename.
 *
 * @param beatsaverKey BeatSaver map key (e.g. `443f3`) when the map was fetched from BeatSaver.
 * @param infoBytes Raw `Info.dat` bytes from the zip.
 * @param firstBeatmapFilename Filename of the first difficulty entry in the info file.
 * @returns The string to feed to {@link sha1Hex} for slug derivation.
 */
export async function slugInput(
  beatsaverKey: string | null,
  infoBytes: Uint8Array,
  firstBeatmapFilename: string,
): Promise<string> {
  if (beatsaverKey !== null && beatsaverKey !== '') return beatsaverKey;
  return `${await sha256Hex(infoBytes)}|${firstBeatmapFilename}`;
}

/**
 * Options identifying a map for {@link slugForMap}.
 */
export interface SlugSource {
  /** BeatSaver map key when the map was fetched from BeatSaver, null for hand-dropped zips. */
  beatsaverKey: string | null;
  /** Raw `Info.dat` bytes from the zip. */
  infoBytes: Uint8Array;
  /** Filename of the first difficulty entry in the info file. */
  firstBeatmapFilename: string;
  /** Collision disambiguator passed to {@link makeSlug}; omit for the 8-hex default. */
  collisionSuffix?: string;
}

/**
 * Compute the deterministic song slug for a map per contract §1.2 (D1).
 *
 * @param source Map identity inputs from the read/parse stages.
 * @returns Lowercase hex slug (8 characters, or 12 plus suffix when a collision growth is requested).
 */
export async function slugForMap(source: SlugSource): Promise<string> {
  const input = await slugInput(source.beatsaverKey, source.infoBytes, source.firstBeatmapFilename);
  return makeSlug(await sha1Hex(input), source.collisionSuffix);
}
