import assert from 'node:assert/strict';
import { test } from 'node:test';
import { unzipSync } from 'fflate';

import { ConversionError, ConversionErrorKind } from '../src/converter/conversion-error';
import { convertMap, type ConversionStage } from '../src/convert-worker';
import { FAKE_COVER_CONVERTER, readFixtureZip } from './helpers';

interface ConversionSummary {
  entryCount: number;
  zipSize: number;
  namespaces: string[];
  audioSize: number;
}

async function runFixture(fixturePath: string): Promise<{ summary: ConversionSummary; stages: ConversionStage[] }> {
  const stages: ConversionStage[] = [];
  const result = await convertMap(readFixtureZip(fixturePath), {
    coverConverter: FAKE_COVER_CONVERTER,
    beatsaverKey: null,
    onStage: (stage) => stages.push(stage),
  });
  const entries = unzipSync(result.datapack.zipBytes);
  const namespaces = Object.keys(entries)
    .filter((name) => name.startsWith('data/'))
    .map((name) => name.split('/')[1])
    .filter((value, index, all) => all.indexOf(value) === index);
  return {
    summary: {
      entryCount: Object.keys(entries).length,
      zipSize: result.datapack.zipBytes.byteLength,
      namespaces,
      audioSize: result.song.audioBytes.byteLength,
    },
    stages,
  };
}

test('convertMap runs the whole pipeline on the synthetic v2 fixture', async () => {
  const { summary, stages } = await runFixture('synthetic/syn-v2-basic.zip');
  assert.deepEqual(stages, ['reading', 'parsing', 'emitting', 'zipping']);
  assert.match(summary.namespaces.join(','), /^bs_[0-9a-f]{8}$/);
  assert.ok(summary.entryCount >= 5, `expected lifecycle + difficulty files, got ${summary.entryCount}`);
  assert.ok(summary.zipSize > 500, `datapack zip suspiciously small: ${summary.zipSize} bytes`);
  assert.ok(summary.audioSize > 0, 'songs-pack audio entry is empty');
});

test('convertMap converts the real BeatSaver v4 map 443f3 end to end', async () => {
  const { summary, stages } = await runFixture('maps/beatsaver-v4-443f3.zip');
  assert.deepEqual(stages, ['reading', 'parsing', 'emitting', 'zipping']);
  assert.match(summary.namespaces.join(','), /^bs_[0-9a-f]{8}$/);
  assert.ok(summary.entryCount > 10, `expected many level files, got ${summary.entryCount}`);
  assert.ok(summary.audioSize > 100_000, `expected real song audio, got ${summary.audioSize} bytes`);
  console.error(
    `smoke 443f3: datapack ${summary.zipSize} bytes / ${summary.entryCount} entries, audio ${summary.audioSize} bytes`,
  );
});

test('convertMap reports smoke sizes for the synthetic fixture', async () => {
  const { summary } = await runFixture('synthetic/syn-v2-basic.zip');
  console.error(
    `smoke syn-v2-basic: datapack ${summary.zipSize} bytes / ${summary.entryCount} entries, audio ${summary.audioSize} bytes`,
  );
});

test('convertMap honors the cancellation flag between stages', async () => {
  await assert.rejects(
    () =>
      convertMap(readFixtureZip('synthetic/syn-v2-basic.zip'), {
        coverConverter: FAKE_COVER_CONVERTER,
        shouldCancel: () => true,
      }),
    (error: unknown) => error instanceof ConversionError && error.kind === ConversionErrorKind.Canceled,
  );
});

test('a broken zip surfaces as an InvalidZipFile ConversionError through the pipeline', async () => {
  await assert.rejects(
    () =>
      convertMap(new Uint8Array([0x50, 0x4b, 0x00, 0x00]), {
        coverConverter: FAKE_COVER_CONVERTER,
      }),
    (error: unknown) => error instanceof ConversionError && error.kind === ConversionErrorKind.InvalidZipFile,
  );
});
