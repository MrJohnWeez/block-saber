import assert from 'node:assert/strict';
import { test } from 'node:test';

import { emitSongsResourcePack, type SongAudioEntry } from '../src/converter/emit-songs-resource-pack';
import { FAKE_PNG_BYTES } from './helpers';

function song(slug: string, title: string, mark: number): SongAudioEntry {
  return { slug, title, audioBytes: new Uint8Array([mark, mark, mark]) };
}

const TWO_SONGS: SongAudioEntry[] = [song('ff00ff00', 'Second Song', 2), song('00aa00aa', 'First Song', 1)];

test('emits the exact §5 layout with deterministic sorted keys', () => {
  const pack = emitSongsResourcePack(TWO_SONGS, { logoPng: FAKE_PNG_BYTES });
  assert.deepEqual(Array.from(pack.files.keys()).sort(), [
    'assets/bsong/sounds.json',
    'assets/bsong/sounds/00aa00aa.ogg',
    'assets/bsong/sounds/ff00ff00.ogg',
    'pack.mcmeta',
    'pack.png',
  ]);
  assert.equal(pack.songCount, 2);
  assert.deepEqual(pack.files.get('assets/bsong/sounds/00aa00aa.ogg'), new Uint8Array([1, 1, 1]));
  assert.deepEqual(pack.files.get('pack.png'), FAKE_PNG_BYTES);
});

test('sounds.json carries the locked entry shape for every song', () => {
  const pack = emitSongsResourcePack(TWO_SONGS, { logoPng: FAKE_PNG_BYTES });
  const sounds = pack.files.get('assets/bsong/sounds.json') as string;
  assert.equal(
    sounds,
    `{
  "bsong_00aa00aa": {
    "category": "music",
    "subtitle": "First Song",
    "sounds": [{ "name": "bsong:00aa00aa", "stream": true, "volume": 1.0 }]
  },
  "bsong_ff00ff00": {
    "category": "music",
    "subtitle": "Second Song",
    "sounds": [{ "name": "bsong:ff00ff00", "stream": true, "volume": 1.0 }]
  }
}
`,
  );
  assert.ok(sounds.indexOf('bsong_00aa00aa') < sounds.indexOf('bsong_ff00ff00'), 'entries sorted by slug');
});

test('pack.mcmeta reports 97.1 formats and the song count description', () => {
  const pack = emitSongsResourcePack(TWO_SONGS, { logoPng: FAKE_PNG_BYTES });
  const meta = pack.files.get('pack.mcmeta') as string;
  assert.ok(meta.includes('"pack_format": 97.1'), meta);
  assert.ok(meta.includes('"min_format": 97.1'), meta);
  assert.ok(meta.includes('"max_format": 97.99'), meta);
  assert.ok(meta.includes('"description": "Block Saber Songs — 2 songs"'), meta);
});

test('rebuilds are deterministic and duplicate slugs resolve last-entry-wins', () => {
  const first = emitSongsResourcePack(TWO_SONGS, { logoPng: FAKE_PNG_BYTES });
  const shuffled = emitSongsResourcePack([TWO_SONGS[1], TWO_SONGS[0]], { logoPng: FAKE_PNG_BYTES });
  assert.deepEqual(Array.from(first.files.keys()), Array.from(shuffled.files.keys()));
  assert.equal(first.files.get('assets/bsong/sounds.json'), shuffled.files.get('assets/bsong/sounds.json'));
  const redone = emitSongsResourcePack([...TWO_SONGS, song('00aa00aa', 'Remade Song', 9)], { logoPng: FAKE_PNG_BYTES });
  assert.equal(redone.songCount, 2);
  const sounds = redone.files.get('assets/bsong/sounds.json') as string;
  assert.ok(sounds.includes('"subtitle": "Remade Song"'), sounds);
  assert.ok(!sounds.includes('First Song'), sounds);
});
