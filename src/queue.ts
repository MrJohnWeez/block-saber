/**
 * Conversion queue state machine — a pure port of the Unity `ProcessManager` waiting/current/finished lists.
 *
 * No DOM and no timers: the site injects a real runner and re-renders from `onChange`, tests inject a fake one.
 */

/** Lifecycle state of one queued conversion, mirroring the Unity `ConversionObject` flow. */
export type QueueItemState = 'waiting' | 'running' | 'done' | 'failed' | 'canceled';

/** Abort handle handed to the runner; poll `canceled` between stages or register an `onAbort` callback. */
export interface QueueAbortSignal {
  /** True once the item was canceled or deleted mid-run. */
  readonly canceled: boolean;
  /** Runs `listener` immediately when already canceled, otherwise exactly once at cancellation. */
  onAbort(listener: () => void): void;
}

/** Progress reporter the runner calls with a 0..100 percent and a human status label. */
export type QueueProgressReporter = (percent: number, message: string) => void;

/** Work starter launched when an item enters the running list; its settle moves the item to finished. */
export type QueueRunner<T> = (
  item: QueueItem<T>,
  signal: QueueAbortSignal,
  report: QueueProgressReporter,
) => Promise<void>;

/** One row of the conversion queue. */
export interface QueueItem<T> {
  /** Stable id assigned in add order. */
  readonly id: number;
  /** Caller payload — file name and bytes on the site. */
  readonly data: T;
  /** Current lifecycle state. */
  state: QueueItemState;
  /** Last reported progress percent, 0..100. */
  percent: number;
  /** Status label shown next to the progress bar. */
  message: string;
  /** Rejection value while `state` is `'failed'`, otherwise undefined. */
  failure: unknown;
}

/** Options for {@link ConversionQueue}. */
export interface ConversionQueueOptions<T> {
  /** Maximum number of simultaneously running items; Unity's ProcessManager uses 3. */
  concurrency?: number;
  /** Work starter invoked for each item that enters the running list. */
  runner: QueueRunner<T>;
  /** Invoked after every state change so the UI can re-render. */
  onChange?: () => void;
}

/** Default simultaneous-conversion cap, matching `ProcessManager.Update`. */
export const DEFAULT_CONCURRENCY = 3;

class AbortFlag implements QueueAbortSignal {
  public canceled = false;

  private listeners: (() => void)[] = [];

  public onAbort(listener: () => void): void {
    if (this.canceled) listener();
    else this.listeners.push(listener);
  }

  public cancel(): void {
    if (this.canceled) return;
    this.canceled = true;
    for (const listener of this.listeners.splice(0)) listener();
  }
}

/**
 * Holds queued conversions in three lists (waiting, running, finished) and starts waiting items whenever a
 * concurrency slot frees, reproducing `ProcessManager` behavior with injectable async work.
 */
export class ConversionQueue<T> {
  private readonly concurrency: number;
  private readonly runner: QueueRunner<T>;
  private readonly onChange: () => void;
  private readonly waiting: QueueItem<T>[] = [];
  private readonly running: QueueItem<T>[] = [];
  private readonly finished: QueueItem<T>[] = [];
  private readonly signals = new Map<number, AbortFlag>();
  private readonly removed = new Set<number>();
  private nextId = 1;

  /** Create a queue; `runner` is started once per item that enters the running list. */
  public constructor(options: ConversionQueueOptions<T>) {
    this.concurrency = options.concurrency ?? DEFAULT_CONCURRENCY;
    this.runner = options.runner;
    this.onChange = options.onChange ?? (() => undefined);
  }

  /** Append an item to the waiting list (Unity `AddFile`) and start it when a slot is free. */
  public add(data: T): QueueItem<T> {
    const item: QueueItem<T> = {
      id: this.nextId++,
      data,
      state: 'waiting',
      percent: 0,
      message: 'Waiting...',
      failure: undefined,
    };
    this.waiting.push(item);
    this.onChange();
    this.pump();
    return item;
  }

  /**
   * Cancel an item: waiting items go straight to finished, running items get their abort signal set and move
   * to finished once the runner settles (Unity `DeleteSelf` cancel path).
   */
  public cancel(id: number): void {
    const waitingIndex = this.waiting.findIndex((item) => item.id === id);
    if (waitingIndex >= 0) {
      const [item] = this.waiting.splice(waitingIndex, 1);
      item.state = 'canceled';
      item.message = 'Canceled';
      this.finished.push(item);
      this.onChange();
      return;
    }
    this.signals.get(id)?.cancel();
  }

  /** Delete an item from whichever list holds it, canceling it first when it is running (Unity `ConversionDeleted`). */
  public remove(id: number): void {
    this.signals.get(id)?.cancel();
    this.signals.delete(id);
    this.removed.add(id);
    for (const list of [this.waiting, this.running, this.finished]) {
      const index = list.findIndex((item) => item.id === id);
      if (index >= 0) {
        list.splice(index, 1);
        this.onChange();
        this.pump();
        return;
      }
    }
  }

  /** Snapshot of the waiting list, in start order. */
  public waitingItems(): readonly QueueItem<T>[] {
    return [...this.waiting];
  }

  /** Snapshot of the running list. */
  public runningItems(): readonly QueueItem<T>[] {
    return [...this.running];
  }

  /** Snapshot of the finished list — done, failed, and canceled items, in settle order. */
  public finishedItems(): readonly QueueItem<T>[] {
    return [...this.finished];
  }

  /** Find an item by id in any list, or null when it was removed. */
  public itemById(id: number): QueueItem<T> | null {
    return (
      this.waiting.find((item) => item.id === id) ??
      this.running.find((item) => item.id === id) ??
      this.finished.find((item) => item.id === id) ??
      null
    );
  }

  private pump(): void {
    while (this.running.length < this.concurrency && this.waiting.length > 0) {
      const item = this.waiting.shift() as QueueItem<T>;
      const signal = new AbortFlag();
      this.signals.set(item.id, signal);
      this.running.push(item);
      item.state = 'running';
      item.message = '';
      this.onChange();
      void this.run(item, signal);
    }
  }

  private async run(item: QueueItem<T>, signal: AbortFlag): Promise<void> {
    const report: QueueProgressReporter = (percent, message) => {
      if (signal.canceled) return;
      item.percent = Math.max(0, Math.min(100, percent));
      item.message = message;
      this.onChange();
    };
    try {
      await this.runner(item, signal, report);
      this.settle(item, signal, undefined);
    } catch (failure: unknown) {
      this.settle(item, signal, failure);
    }
  }

  private settle(item: QueueItem<T>, signal: AbortFlag, failure: unknown): void {
    const index = this.running.findIndex((candidate) => candidate.id === item.id);
    if (index >= 0) this.running.splice(index, 1);
    this.signals.delete(item.id);
    if (this.removed.delete(item.id)) return;
    if (signal.canceled) {
      item.state = 'canceled';
      item.message = 'Canceled';
    } else if (failure === undefined) {
      item.state = 'done';
      item.percent = 100;
      item.message = 'Done!';
    } else {
      item.state = 'failed';
      item.failure = failure;
    }
    this.finished.push(item);
    this.onChange();
    this.pump();
  }
}
