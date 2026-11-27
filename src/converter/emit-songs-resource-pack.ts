/**
 * Cumulative "Block Saber Songs" resource pack builder — contract §5.
 *
 * Minecraft cannot merge `sounds.json` across packs, so the site rebuilds this single pack from the full
 * song list every time. Output is deterministic: entries are sorted by slug and every JSON value is
 * emitted by hand so byte-for-byte identical inputs always produce identical text.
 */

/** One song contributed to the cumulative songs pack. */
export interface SongAudioEntry {
  /** Namespace slug shared with the song datapack (no `bs_` prefix). */
  slug: string;
  /** Display title used as the sound `subtitle`. */
  title: string;
  /** Raw audio bytes; `.egg` content is treated as ogg per M2. */
  audioBytes: Uint8Array;
}

/** Options for {@link emitSongsResourcePack}. */
export interface EmitSongsPackOptions {
  /** Static Block Saber logo PNG bytes shipped as `pack.png` (decision D10). */
  logoPng: Uint8Array;
}

/** A whole emitted songs resource pack keyed at the zip root. */
export interface EmittedSongsResourcePack {
  /** All files keyed by zip-root-relative path; string values are UTF-8 text. */
  files: Map<string, string | Uint8Array>;
  /** Number of songs merged into the pack. */
  songCount: number;
}

/**
 * Build the complete cumulative songs resource pack content per contract §5.
 *
 * Duplicate slugs resolve last-entry-wins so a rebuild after re-converting a song stays idempotent.
 *
 * @param songs Every song currently in the site's song list, in any order.
 * @param options Logo bytes for `pack.png`.
 * @returns Zip-ready file map plus the merged song count.
 */
export function emitSongsResourcePack(
  songs: readonly SongAudioEntry[],
  options: EmitSongsPackOptions,
): EmittedSongsResourcePack {
  const bySlug = new Map<string, SongAudioEntry>();
  for (const song of songs) bySlug.set(song.slug, song);
  const sorted = Array.from(bySlug.values()).sort((a, b) => (a.slug < b.slug ? -1 : a.slug > b.slug ? 1 : 0));
  const files = new Map<string, string | Uint8Array>();
  files.set('pack.mcmeta', songsMcMeta(sorted.length));
  files.set('pack.png', options.logoPng);
  // The sounds.json folder decides the event id's namespace, and the emitted play functions call the
  // unqualified `bsong_<slug>` (i.e. `minecraft:bsong_<slug>`), so the registry file lives in `minecraft`.
  files.set('assets/minecraft/sounds.json', soundsJson(sorted));
  for (const song of sorted) files.set(`assets/bsong/sounds/${song.slug}.ogg`, song.audioBytes);
  return { files, songCount: sorted.length };
}

function songsMcMeta(songCount: number): string {
  return `{
  "pack": {
    "pack_format": 97.1,
    "min_format": 97.1,
    "max_format": 97.99,
    "description": ${JSON.stringify(`Block Saber Songs — ${songCount} songs`)}
  }
}
`;
}

function soundsJson(songs: readonly SongAudioEntry[]): string {
  const entries = songs.map((song) => {
    const event = JSON.stringify(`bsong_${song.slug}`);
    return `  ${event}: {
    "category": "music",
    "subtitle": ${JSON.stringify(song.title)},
    "sounds": [{ "name": "bsong:${song.slug}", "stream": true, "volume": 1.0 }]
  }`;
  });
  return `{\n${entries.join(',\n')}\n}\n`;
}
