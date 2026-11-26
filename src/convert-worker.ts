/**
 * Conversion worker — the full map-zip → song-datapack pipeline plus the DedicatedWorker message wiring.
 *
 * {@link convertMap} is the exact function the browser worker runs and the node smoke tests drive; the worker
 * wiring below only adds message plumbing and a browser {@link CoverImageConverter}, so both share one pipeline.
 */

import { ConversionError, ConversionErrorKind } from './converter/conversion-error';
import {
  emitSongPack,
  type CoverImageConverter,
  type EmittedDifficulty,
  type ParsedSong,
} from './converter/emit-datapack';
import { emitSongsResourcePack, type SongAudioEntry } from './converter/emit-songs-resource-pack';
import { parseBeatmap } from './converter/parse-beatmap';
import { readMapZip } from './converter/read-map-zip';
import { slugForMap } from './converter/slug';
import { packZipName, zipPackFiles } from './converter/zip-output';

/** Pipeline stage labels reported through progress messages, in execution order. */
export const CONVERSION_STAGES = ['reading', 'parsing', 'emitting', 'zipping'] as const;

/** One named stage of {@link convertMap}. */
export type ConversionStage = (typeof CONVERSION_STAGES)[number];

/** Percent announced when each stage begins. */
const STAGE_PERCENT: Record<ConversionStage, number> = {
  reading: 5,
  parsing: 30,
  emitting: 55,
  zipping: 92,
};

/** Messages the main thread sends to the worker. */
export type WorkerRequest =
  | { type: 'convert'; jobId: number; zipBytes: Uint8Array; beatsaverKey: string | null; collisionSuffix?: string }
  | { type: 'build-songs-pack'; jobId: number; songs: readonly SongAudioEntry[]; logoPng: Uint8Array }
  | { type: 'cancel'; jobId: number };

/** Messages the worker sends back to the main thread. */
export type WorkerResponse =
  | { type: 'progress'; jobId: number; stage: ConversionStage; percent: number }
  | {
      type: 'done';
      jobId: number;
      title: string;
      namespace: string;
      difficulties: EmittedDifficulty[];
      song: SongAudioEntry;
      datapack: { fileName: string; zipBytes: Uint8Array };
    }
  | { type: 'error'; jobId: number; kind: ConversionErrorKind; message: string }
  | { type: 'canceled'; jobId: number }
  | { type: 'songs-pack'; jobId: number; fileName: string; zipBytes: Uint8Array };

/** Options for {@link convertMap}. */
export interface ConvertMapOptions {
  /** Cover-to-PNG converter: OffscreenCanvas in the worker, a fixture in node tests. */
  coverConverter: CoverImageConverter;
  /** BeatSaver map key when the zip was fetched from BeatSaver; hand-dropped files pass null. */
  beatsaverKey?: string | null;
  /** Slug disambiguator when the site's slug registry detected an 8-hex collision (contract §1.2 growth). */
  collisionSuffix?: string;
  /** Checked between stages; return true to abort with a `Canceled` {@link ConversionError}. */
  shouldCancel?: () => boolean;
  /** Notified with each stage as it begins. */
  onStage?: (stage: ConversionStage, percent: number) => void;
}

/** Everything one conversion produces for the site: datapack zip, songs-pack entry, and summary. */
export interface ConvertMapResult {
  /** Display title (title plus subtitle when the map has one). */
  title: string;
  /** Full song namespace, e.g. `bs_443f3a1b`. */
  namespace: string;
  /** Emission summary, one entry per shipped difficulty. */
  difficulties: EmittedDifficulty[];
  /** Audio stem for the cumulative songs resource pack (contract §5). */
  song: SongAudioEntry;
  /** Finished per-song datapack zip plus its download file name (contract §1.1). */
  datapack: { fileName: string; zipBytes: Uint8Array };
}

/**
 * Run the whole conversion pipeline — read zip → parse → slug → emit datapack → zip — on one map archive.
 *
 * Tick-table work happens inside {@link emitSongPack}, reported under the `emitting` stage.
 *
 * @param zipBytes Raw `.zip` bytes of a Beat Saber map.
 * @param options Cover converter plus slug/cancel/stage hooks.
 * @returns Datapack zip, songs-pack audio entry, and emission summary.
 * @throws ConversionError With whatever kind a stage produced, or `Canceled` when `shouldCancel` fired.
 */
export async function convertMap(zipBytes: Uint8Array, options: ConvertMapOptions): Promise<ConvertMapResult> {
  checkCanceled(options.shouldCancel);
  options.onStage?.('reading', STAGE_PERCENT.reading);
  const opened = readMapZip(zipBytes);

  checkCanceled(options.shouldCancel);
  options.onStage?.('parsing', STAGE_PERCENT.parsing);
  const map = parseBeatmap(opened);
  const infoBytes = opened.entries.get(opened.infoPath) as Uint8Array;
  const slug = await slugForMap({
    beatsaverKey: options.beatsaverKey ?? null,
    infoBytes,
    firstBeatmapFilename: map.info.beatmapRefs[0].beatmapDataFilename,
    collisionSuffix: options.collisionSuffix,
  });

  checkCanceled(options.shouldCancel);
  options.onStage?.('emitting', STAGE_PERCENT.emitting);
  const song: ParsedSong = { ...map, slug };
  const pack = await emitSongPack(song, { coverConverter: options.coverConverter });

  checkCanceled(options.shouldCancel);
  options.onStage?.('zipping', STAGE_PERCENT.zipping);
  const zip = zipPackFiles(pack.files);
  const title = map.info.subTitle === '' ? map.info.title : `${map.info.title} (${map.info.subTitle})`;
  return {
    title,
    namespace: pack.namespace,
    difficulties: pack.difficulties,
    song: { slug, title, audioBytes: map.assets.songBytes },
    datapack: { fileName: packZipName(map.info, 'datapack'), zipBytes: zip },
  };
}

function checkCanceled(shouldCancel: (() => boolean) | undefined): void {
  if (shouldCancel?.()) {
    throw new ConversionError(ConversionErrorKind.Canceled, 'Conversion canceled by the user');
  }
}

/** {@link convertMap} plus the browser-only cover converter the worker message loop uses. */
const canvasCoverConverter: CoverImageConverter = {
  async toPng(coverBytes: Uint8Array): Promise<Uint8Array> {
    const bitmap = await createImageBitmap(
      new Blob([new Uint8Array(coverBytes.buffer as ArrayBuffer, coverBytes.byteOffset, coverBytes.byteLength)]),
    );
    const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
    const context = canvas.getContext('2d');
    if (context === null) {
      throw new ConversionError(ConversionErrorKind.OtherFail, 'Could not create a canvas context for the cover image');
    }
    context.drawImage(bitmap, 0, 0);
    const pngBlob = await canvas.convertToBlob({ type: 'image/png' });
    return new Uint8Array(await pngBlob.arrayBuffer());
  },
};

/** Minimal view of the DedicatedWorkerGlobalScope surface this file needs. */
interface WorkerScope {
  postMessage(message: WorkerResponse, transfer?: Transferable[]): void;
  addEventListener(type: 'message', listener: (event: MessageEvent<WorkerRequest>) => void): void;
}

const runningJobs = new Map<number, { canceled: boolean }>();

function post(scope: WorkerScope, message: WorkerResponse, transfer: Transferable[] = []): void {
  scope.postMessage(message, transfer);
}

function handleRequest(scope: WorkerScope, request: WorkerRequest): void {
  if (request.type === 'cancel') {
    const job = runningJobs.get(request.jobId);
    if (job) job.canceled = true;
    return;
  }
  const job = { canceled: false };
  runningJobs.set(request.jobId, job);
  const cancelCheck = (): boolean => job.canceled;
  const settle = async (): Promise<void> => {
    try {
      if (request.type === 'convert') {
        const result = await convertMap(request.zipBytes, {
          coverConverter: canvasCoverConverter,
          beatsaverKey: request.beatsaverKey,
          collisionSuffix: request.collisionSuffix,
          shouldCancel: cancelCheck,
          onStage: (stage, percent) => post(scope, { type: 'progress', jobId: request.jobId, stage, percent }),
        });
        post(
          scope,
          {
            type: 'done',
            jobId: request.jobId,
            title: result.title,
            namespace: result.namespace,
            difficulties: result.difficulties,
            song: result.song,
            datapack: result.datapack,
          },
          [result.datapack.zipBytes.buffer as ArrayBuffer, result.song.audioBytes.buffer as ArrayBuffer],
        );
      } else {
        const pack = emitSongsResourcePack(request.songs, { logoPng: request.logoPng });
        const zip = zipPackFiles(pack.files);
        post(
          scope,
          {
            type: 'songs-pack',
            jobId: request.jobId,
            fileName: packZipName({ title: '', songAuthorName: '' }, 'resourcepack'),
            zipBytes: zip,
          },
          [zip.buffer as ArrayBuffer],
        );
      }
    } catch (failure: unknown) {
      if (failure instanceof ConversionError && (failure.kind === ConversionErrorKind.Canceled || job.canceled)) {
        post(scope, { type: 'canceled', jobId: request.jobId });
      } else if (failure instanceof ConversionError) {
        post(scope, { type: 'error', jobId: request.jobId, kind: failure.kind, message: failure.message });
      } else {
        const message = failure instanceof Error ? failure.message : String(failure);
        post(scope, { type: 'error', jobId: request.jobId, kind: ConversionErrorKind.OtherFail, message });
      }
    } finally {
      runningJobs.delete(request.jobId);
    }
  };
  void settle();
}

const workerCandidate = globalThis as {
  postMessage?: (message: WorkerResponse, transfer?: Transferable[]) => void;
  addEventListener?: (type: 'message', listener: (event: MessageEvent<WorkerRequest>) => void) => void;
};

if (typeof workerCandidate.postMessage === 'function' && typeof workerCandidate.addEventListener === 'function') {
  const scope: WorkerScope = {
    postMessage: (message, transfer) => (workerCandidate.postMessage as WorkerScope['postMessage'])(message, transfer),
    addEventListener: (type, listener) =>
      (workerCandidate.addEventListener as NonNullable<WorkerScope['addEventListener']>)(type, listener),
  };
  scope.addEventListener('message', (event) => handleRequest(scope, event.data));
}
