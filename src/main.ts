import { ConversionError, ConversionErrorKind } from './converter/conversion-error';
import type { SongAudioEntry } from './converter/emit-songs-resource-pack';
import { sha256Hex } from './converter/slug';
import type { ConvertMapResult, ConversionStage, WorkerResponse } from './convert-worker';
import { ConversionQueue, type QueueAbortSignal, type QueueItem, type QueueProgressReporter } from './queue';
import { loadDirectoryHandle, saveDirectoryHandle } from './output-folder-store';

/** One queued map file. */
interface MapQueueData {
  /** Original drop name, used for the row label and the `.zip` sanity check. */
  fileName: string;
  /** Raw zip bytes read from the File. */
  zipBytes: Uint8Array;
}

/** UI status per {@link ConversionErrorKind}, phrased like the Unity app's `ConversionObject` labels. */
const ERROR_COPY: Record<ConversionErrorKind, string> = {
  [ConversionErrorKind.None]: 'Failed: unknown error!',
  [ConversionErrorKind.InvalidZipFile]: 'Failed: invalid zip file',
  [ConversionErrorKind.InvalidBeatMap]: 'Failed: invalid beat map',
  [ConversionErrorKind.MissingInfo]: 'Failed: missing Info.dat',
  [ConversionErrorKind.MissingSongData]: 'Failed: missing song data',
  [ConversionErrorKind.MissingSongFile]: 'Failed: missing song file',
  [ConversionErrorKind.MissingCover]: 'Failed: missing cover image',
  [ConversionErrorKind.UnsupportedVersion]: 'Failed: unsupported map format version',
  [ConversionErrorKind.FailedToCopyFile]: 'Failed: unable to write the output files',
  [ConversionErrorKind.NoMapData]: 'Failed: no playable map data',
  [ConversionErrorKind.UnzipError]: 'Failed: unzip error',
  [ConversionErrorKind.DuplicateDifficulty]: 'Failed: duplicate difficulty in Info.dat',
  [ConversionErrorKind.SongTooLong]: 'Failed: the song is longer than the game supports',
  [ConversionErrorKind.SlugCollision]: 'Failed: this map collides with another song namespace',
  [ConversionErrorKind.OtherFail]: 'Failed!',
  [ConversionErrorKind.Canceled]: 'Canceled',
};

/** Status label shown while each pipeline stage runs. */
const STAGE_LABEL: Record<ConversionStage, string> = {
  reading: 'Unzipping map...',
  parsing: 'Parsing beatmap...',
  emitting: 'Emitting datapack...',
  zipping: 'Zipping datapack...',
};

/** Narrow structural type for the optional permission methods Chromium adds to directory handles. */
interface PermissionAwareDirectoryHandle extends FileSystemDirectoryHandle {
  queryPermission?(descriptor: { mode?: 'read' | 'readwrite' }): Promise<PermissionState>;
  requestPermission?(descriptor: { mode?: 'read' | 'readwrite' }): Promise<PermissionState>;
}

/** Window surface for the File System Access picker, which the DOM lib does not declare. */
interface PickerCapableWindow extends Window {
  showDirectoryPicker?: (options?: {
    id?: string;
    mode?: 'read' | 'readwrite';
  }) => Promise<PermissionAwareDirectoryHandle>;
}

function requireElement(id: string): HTMLElement {
  const element = document.getElementById(id);
  if (element === null) throw new Error(`Block Saber: #${id} is missing from the page markup.`);
  return element;
}

/** Re-wrap bytes over a plain `ArrayBuffer` for Blob/stream APIs that reject `SharedArrayBuffer`-backed views. */
function toLocalBytes(bytes: Uint8Array): Uint8Array<ArrayBuffer> {
  return new Uint8Array(bytes.buffer as ArrayBuffer, bytes.byteOffset, bytes.byteLength);
}

const dropZone = requireElement('drop-zone');
const fileInput = requireElement('file-input') as HTMLInputElement;
const chooseFilesButton = requireElement('choose-files');
const queueList = requireElement('queue');
const songsPackButton = requireElement('download-songs-pack') as HTMLButtonElement;
const folderButton = requireElement('choose-output-folder') as HTMLButtonElement;
const outputStatus = requireElement('output-status');

/** Worker script sits next to this module in `dist/`, so resolve it against `import.meta.url` for any base URL. */
function spawnWorker(): Worker {
  return new Worker(new URL('convert-worker.js', import.meta.url), { type: 'module' });
}

/** Slug → fingerprint of the map that owns it, for contract §1.2 collision growth. */
const slugRegistry = new Map<string, string>();

/** Cumulative session songs keyed by slug; re-converting a song overwrites its entry, deleting a row never does. */
const sessionSongs = new Map<string, SongAudioEntry>();

/** Per-row blob URLs for finished datapack zips, revoked when the row is deleted. */
const datapackBlobUrls = new Map<number, string>();

/** Row elements by queue item id. */
const rowElements = new Map<number, HTMLLIElement>();

/** Worker instances of currently running items, terminated on cancel or delete. */
const itemWorkers = new Map<number, Worker>();

/** Chosen output folder, or null when the user never picked one (or revoked access). */
let outputFolder: PermissionAwareDirectoryHandle | null = null;

/** Cached `pack.png` bytes for the songs resource pack, fetched once from the site's own logo. */
let logoPngCache: Uint8Array | null = null;

/** Serializes songs-pack builds; a request arriving mid-build marks it dirty for one more pass. */
let songsPackBuild: Promise<void> | null = null;
let songsPackDirty = false;
let nextSongsPackJobId = 1;

const queue = new ConversionQueue<MapQueueData>({
  concurrency: 3,
  runner: runConversion,
  onChange: renderQueue,
});

/**
 * Convert one queued map on a dedicated worker, growing the slug to 12 hex (contract §1.2) when the site's
 * slug registry finds a different song already owning the 8-hex slug. Unity grew *both* slugs on collision;
 * in the browser the first pack may already be delivered, so only the latecomer grows and a grown-slug
 * collision is the contract's hard `SlugCollision` error.
 */
async function runConversion(
  item: QueueItem<MapQueueData>,
  signal: QueueAbortSignal,
  report: QueueProgressReporter,
): Promise<void> {
  if (!item.data.fileName.toLowerCase().endsWith('.zip')) {
    throw new ConversionError(ConversionErrorKind.InvalidZipFile, `${item.data.fileName} is not a .zip file`);
  }
  const fingerprint = await sha256Hex(item.data.zipBytes);
  // Attempt 0: 8-hex slug. Attempt 1: same hash grown to 12 hex via collisionSuffix ''.
  for (let attempt = 0; attempt < 2; attempt++) {
    const result = await runWorkerConversion(item, signal, report, attempt, attempt === 1 ? '' : undefined);
    const owner = slugRegistry.get(result.song.slug);
    if (owner === undefined || owner === fingerprint) {
      if (owner === undefined) slugRegistry.set(result.song.slug, fingerprint);
      finalizeConversion(item, result);
      return;
    }
  }
  throw new ConversionError(
    ConversionErrorKind.SlugCollision,
    `${item.data.fileName} collides with another song namespace`,
  );
}

/** Drive one worker `convert` job to completion, rejecting with a {@link ConversionError} on `error` frames. */
function runWorkerConversion(
  item: QueueItem<MapQueueData>,
  signal: QueueAbortSignal,
  report: QueueProgressReporter,
  attempt: number,
  collisionSuffix: string | undefined,
): Promise<ConvertMapResult> {
  const jobId = item.id * 10 + attempt;
  const worker = spawnWorker();
  itemWorkers.set(item.id, worker);
  return new Promise<ConvertMapResult>((resolve, reject) => {
    const cleanup = (): void => {
      worker.terminate();
      itemWorkers.delete(item.id);
    };
    signal.onAbort(() => {
      cleanup();
      reject(new ConversionError(ConversionErrorKind.Canceled, `${item.data.fileName} canceled`));
    });
    worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
      const message = event.data;
      if (message.jobId !== jobId) return;
      if (message.type === 'progress') {
        report(message.percent, STAGE_LABEL[message.stage]);
      } else if (message.type === 'done') {
        cleanup();
        resolve({
          title: message.title,
          namespace: message.namespace,
          difficulties: message.difficulties,
          song: message.song,
          datapack: message.datapack,
        });
      } else if (message.type === 'error') {
        cleanup();
        reject(new ConversionError(message.kind, message.message));
      } else if (message.type === 'canceled') {
        cleanup();
        reject(new ConversionError(ConversionErrorKind.Canceled, `${item.data.fileName} canceled`));
      }
    };
    worker.onerror = (event: ErrorEvent) => {
      cleanup();
      reject(new ConversionError(ConversionErrorKind.OtherFail, event.message || 'conversion worker crashed'));
    };
    worker.postMessage({ type: 'convert', jobId, zipBytes: item.data.zipBytes, beatsaverKey: null, collisionSuffix });
  });
}

/** Register a finished conversion: song entry, blob download link, and optional output-folder writes. */
function finalizeConversion(item: QueueItem<MapQueueData>, result: ConvertMapResult): void {
  sessionSongs.set(result.song.slug, result.song);
  const blobUrl = URL.createObjectURL(new Blob([toLocalBytes(result.datapack.zipBytes)], { type: 'application/zip' }));
  datapackBlobUrls.set(item.id, blobUrl);
  const row = rowElements.get(item.id);
  if (row) {
    const link = row.querySelector<HTMLAnchorElement>('.queue-item-download');
    if (link) {
      link.href = blobUrl;
      link.download = result.datapack.fileName;
      link.hidden = false;
    }
  }
  updateSongsButton();
  if (outputFolder !== null) {
    void (async () => {
      await writeToFolder(
        outputFolder as PermissionAwareDirectoryHandle,
        result.datapack.fileName,
        result.datapack.zipBytes,
      );
      await rebuildSongsPack(false);
      setStatus(`Wrote "${result.datapack.fileName}" and the songs pack to "${outputFolder?.name ?? ''}".`);
    })().catch((error: unknown) => setStatus(`Output folder write failed: ${describeFailure(error)}`));
  }
}

function describeFailure(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function failureText(item: QueueItem<MapQueueData>): string {
  if (item.failure instanceof ConversionError) return ERROR_COPY[item.failure.kind];
  return item.failure === undefined ? item.message : `Failed: ${describeFailure(item.failure)}`;
}

function statusTextFor(item: QueueItem<MapQueueData>): string {
  switch (item.state) {
    case 'failed':
      return failureText(item);
    case 'canceled':
      return 'Canceled';
    case 'done':
      return 'Done!';
    default:
      return item.message;
  }
}

/** Re-render the queue list, reusing per-item row elements so progress bars and links keep their state. */
function renderQueue(): void {
  const items = [...queue.waitingItems(), ...queue.runningItems(), ...queue.finishedItems()];
  const liveIds = new Set<number>();
  for (const item of items) {
    liveIds.add(item.id);
    let row = rowElements.get(item.id);
    if (row === undefined) {
      row = document.createElement('li');
      row.className = 'queue-item';
      row.dataset.itemId = String(item.id);
      row.innerHTML =
        '<span class="queue-item-name"></span>' +
        '<progress class="queue-item-progress" max="100" value="0" aria-label="Conversion progress"></progress>' +
        '<span class="queue-item-status"></span>' +
        '<a class="queue-item-download" hidden>Download datapack</a>' +
        '<button class="queue-item-cancel" type="button">Cancel</button>' +
        '<button class="queue-item-delete" type="button" aria-label="Remove from list">Delete</button>';
      row.querySelector('.queue-item-name')!.textContent = item.data.fileName;
      rowElements.set(item.id, row);
    }
    row.dataset.state = item.state;
    row.querySelector('.queue-item-status')!.textContent = statusTextFor(item);
    const progress = row.querySelector<HTMLProgressElement>('progress')!;
    progress.value = item.percent;
    const cancelButton = row.querySelector<HTMLButtonElement>('.queue-item-cancel')!;
    cancelButton.hidden = item.state !== 'waiting' && item.state !== 'running';
    const downloadLink = row.querySelector<HTMLAnchorElement>('.queue-item-download')!;
    downloadLink.hidden = item.state !== 'done' || downloadLink.getAttribute('href') === null;
    queueList.appendChild(row);
  }
  for (const [id, row] of rowElements) {
    if (!liveIds.has(id)) {
      row.remove();
      rowElements.delete(id);
    }
  }
}

/** Delete a row, revoking its blob URL; running items are canceled by the queue first. */
function deleteItem(id: number): void {
  const blobUrl = datapackBlobUrls.get(id);
  if (blobUrl !== undefined) {
    URL.revokeObjectURL(blobUrl);
    datapackBlobUrls.delete(id);
  }
  queue.remove(id);
}

queueList.addEventListener('click', (event: Event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;
  const row = target.closest('li[data-item-id]');
  if (!(row instanceof HTMLLIElement) || row.dataset.itemId === undefined) return;
  const id = Number(row.dataset.itemId);
  if (target.classList.contains('queue-item-cancel')) queue.cancel(id);
  else if (target.classList.contains('queue-item-delete')) deleteItem(id);
});

function updateSongsButton(): void {
  const count = sessionSongs.size;
  songsPackButton.disabled = count === 0;
  songsPackButton.textContent =
    count === 0 ? 'Download songs pack' : `Download songs pack (${count} ${count === 1 ? 'song' : 'songs'})`;
}

function setStatus(message: string): void {
  outputStatus.textContent = message;
}

async function fetchLogoPng(): Promise<Uint8Array> {
  if (logoPngCache !== null) return logoPngCache;
  const response = await fetch(new URL('media/block-saber-logo.png', import.meta.url));
  if (!response.ok) throw new Error('Could not fetch the Block Saber logo for the songs pack.');
  logoPngCache = new Uint8Array(await response.arrayBuffer());
  return logoPngCache;
}

async function writeToFolder(handle: FileSystemDirectoryHandle, name: string, bytes: Uint8Array): Promise<void> {
  const fileHandle = await handle.getFileHandle(name, { create: true });
  const writable = await fileHandle.createWritable({ keepExistingData: false });
  await writable.write(toLocalBytes(bytes));
  await writable.close();
}

/** Build the cumulative songs pack once on a one-shot worker, then hand it to the downloads and/or the folder. */
async function buildSongsPackOnce(triggerDownload: boolean): Promise<void> {
  if (sessionSongs.size === 0) return;
  const logoPng = await fetchLogoPng();
  const jobId = nextSongsPackJobId++;
  const result = await new Promise<{ fileName: string; zipBytes: Uint8Array }>((resolve, reject) => {
    const worker = spawnWorker();
    worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
      const message = event.data;
      if (message.jobId !== jobId) return;
      worker.terminate();
      if (message.type === 'songs-pack') resolve({ fileName: message.fileName, zipBytes: message.zipBytes });
      else if (message.type === 'error') reject(new ConversionError(message.kind, message.message));
    };
    worker.onerror = (event: ErrorEvent) => {
      worker.terminate();
      reject(new ConversionError(ConversionErrorKind.OtherFail, event.message || 'songs pack worker crashed'));
    };
    worker.postMessage({
      type: 'build-songs-pack',
      jobId,
      songs: [...sessionSongs.values()],
      logoPng: logoPng.slice(),
    });
  });
  if (outputFolder !== null) await writeToFolder(outputFolder, result.fileName, result.zipBytes);
  if (triggerDownload) {
    const url = URL.createObjectURL(new Blob([toLocalBytes(result.zipBytes)], { type: 'application/zip' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = result.fileName;
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 30_000);
  }
}

/** Rebuild the cumulative songs pack, coalescing requests that arrive while a build is in flight. */
function rebuildSongsPack(triggerDownload: boolean): Promise<void> {
  if (songsPackBuild !== null) {
    songsPackDirty = true;
    return songsPackBuild;
  }
  songsPackBuild = buildSongsPackOnce(triggerDownload).finally(() => {
    songsPackBuild = null;
    if (songsPackDirty) {
      songsPackDirty = false;
      void rebuildSongsPack(false).catch((error: unknown) => setStatus(`Songs pack failed: ${describeFailure(error)}`));
    }
  });
  return songsPackBuild;
}

songsPackButton.addEventListener('click', () => {
  setStatus('Building the songs pack...');
  rebuildSongsPack(true)
    .then(() => setStatus('Songs pack ready — check your downloads.'))
    .catch((error: unknown) => setStatus(`Songs pack failed: ${describeFailure(error)}`));
});

function picker():
  ((options?: { id?: string; mode?: 'read' | 'readwrite' }) => Promise<PermissionAwareDirectoryHandle>) | undefined {
  return (window as PickerCapableWindow).showDirectoryPicker;
}

folderButton.addEventListener('click', () => {
  const showDirectoryPicker = picker();
  if (typeof showDirectoryPicker !== 'function') return;
  void (async () => {
    try {
      const handle = await showDirectoryPicker.call(window, { id: 'block-saber-output', mode: 'readwrite' });
      outputFolder = handle;
      await saveDirectoryHandle(handle);
      setStatus(`Writing datapacks and the songs pack to "${handle.name}".`);
      await rebuildSongsPack(false);
    } catch (error: unknown) {
      if (error instanceof DOMException && error.name === 'AbortError') return;
      setStatus(`Output folder selection failed: ${describeFailure(error)}`);
    }
  })();
});

async function restoreOutputFolder(): Promise<void> {
  try {
    const handle = await loadDirectoryHandle();
    if (handle === null) return;
    const candidate = handle as PermissionAwareDirectoryHandle;
    if (
      typeof candidate.queryPermission === 'function' &&
      (await candidate.queryPermission({ mode: 'readwrite' })) === 'granted'
    ) {
      outputFolder = candidate;
      setStatus(`Writing datapacks and the songs pack to "${candidate.name}".`);
    } else {
      setStatus('The previously chosen output folder needs permission again — choose it below.');
    }
  } catch (error: unknown) {
    console.warn('Block Saber: could not restore the saved output folder.', error);
  }
}

function acceptFiles(files: File[]): void {
  for (const file of files) {
    void (async () => {
      const zipBytes = new Uint8Array(await file.arrayBuffer());
      queue.add({ fileName: file.name, zipBytes });
    })().catch((error: unknown) => console.error('Block Saber: could not read dropped file.', error));
  }
}

function handleDragOver(event: DragEvent): void {
  event.preventDefault();
  dropZone.classList.add('is-armed');
}

function handleDragLeave(): void {
  dropZone.classList.remove('is-armed');
}

function handleDrop(event: DragEvent): void {
  event.preventDefault();
  dropZone.classList.remove('is-armed');
  acceptFiles(event.dataTransfer ? [...event.dataTransfer.files] : []);
}

dropZone.addEventListener('dragover', handleDragOver);
dropZone.addEventListener('dragleave', handleDragLeave);
dropZone.addEventListener('drop', handleDrop);
chooseFilesButton.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', () => acceptFiles(fileInput.files ? [...fileInput.files] : []));

if (typeof picker() !== 'function') {
  folderButton.hidden = true;
}

updateSongsButton();
void restoreOutputFolder();
