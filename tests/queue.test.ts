import assert from 'node:assert/strict';
import { test } from 'node:test';

import { ConversionQueue, type QueueAbortSignal, type QueueItem, type QueueProgressReporter } from '../src/queue';

interface Deferred {
  promise: Promise<void>;
  resolve: () => void;
  reject: (error: unknown) => void;
}

function deferred(): Deferred {
  let resolve: () => void = () => undefined;
  let reject: (error: unknown) => void = () => undefined;
  const promise = new Promise<void>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

interface StartedJob {
  item: QueueItem<string>;
  signal: QueueAbortSignal;
  report: QueueProgressReporter;
  done: Deferred;
}

interface Harness {
  queue: ConversionQueue<string>;
  jobs: StartedJob[];
}

function makeHarness(concurrency?: number): Harness {
  const jobs: StartedJob[] = [];
  const queue = new ConversionQueue<string>({
    concurrency,
    runner: (item, signal, report) => {
      const done = deferred();
      jobs.push({ item, signal, report, done });
      return done.promise;
    },
  });
  return { queue, jobs };
}

function flush(): Promise<void> {
  return new Promise((resolve) => setImmediate(resolve));
}

test('runs at most three items at once and starts waiting items in FIFO order', async () => {
  const { queue, jobs } = makeHarness();
  for (const name of ['a', 'b', 'c', 'd', 'e']) queue.add(name);
  assert.deepEqual(
    jobs.map((job) => job.item.data),
    ['a', 'b', 'c'],
  );
  assert.deepEqual(
    queue.runningItems().map((item) => item.data),
    ['a', 'b', 'c'],
  );
  assert.deepEqual(
    queue.waitingItems().map((item) => item.data),
    ['d', 'e'],
  );
  jobs[0].done.resolve();
  await flush();
  assert.deepEqual(
    jobs.map((job) => job.item.data),
    ['a', 'b', 'c', 'd'],
  );
  assert.deepEqual(
    queue.waitingItems().map((item) => item.data),
    ['e'],
  );
});

test('honors a custom concurrency limit', () => {
  const { queue, jobs } = makeHarness(1);
  queue.add('a');
  queue.add('b');
  assert.equal(jobs.length, 1);
  assert.deepEqual(
    queue.waitingItems().map((item) => item.data),
    ['b'],
  );
});

test('progress reports land on the item and are clamped to 0..100', () => {
  const { queue, jobs } = makeHarness();
  const item = queue.add('a');
  jobs[0].report(42, 'Parsing beatmap...');
  assert.equal(item.percent, 42);
  assert.equal(item.message, 'Parsing beatmap...');
  jobs[0].report(250, 'over');
  assert.equal(item.percent, 100);
  jobs[0].report(-5, 'under');
  assert.equal(item.percent, 0);
});

test('a resolved runner moves the item to finished as done at 100 percent', async () => {
  const { queue, jobs } = makeHarness();
  const item = queue.add('a');
  jobs[0].report(30, 'working');
  jobs[0].done.resolve();
  await flush();
  assert.equal(item.state, 'done');
  assert.equal(item.percent, 100);
  assert.equal(item.message, 'Done!');
  assert.deepEqual(
    queue.finishedItems().map((finished) => finished.data),
    ['a'],
  );
  assert.equal(queue.runningItems().length, 0);
});

test('a rejected runner records the failure on the item', async () => {
  const { queue, jobs } = makeHarness();
  const item = queue.add('a');
  const failure = new Error('boom');
  jobs[0].done.reject(failure);
  await flush();
  assert.equal(item.state, 'failed');
  assert.equal(item.failure, failure);
  assert.deepEqual(
    queue.finishedItems().map((finished) => finished.data),
    ['a'],
  );
});

test('canceling a running item signals abort and settles it as canceled', async () => {
  const { queue, jobs } = makeHarness();
  const item = queue.add('a');
  let abortFired = false;
  jobs[0].signal.onAbort(() => {
    abortFired = true;
  });
  queue.cancel(item.id);
  assert.equal(jobs[0].signal.canceled, true);
  assert.equal(abortFired, true);
  assert.equal(item.state, 'running');
  assert.equal(queue.runningItems().length, 1);
  jobs[0].done.resolve();
  await flush();
  assert.equal(item.state, 'canceled');
  assert.equal(item.message, 'Canceled');
});

test('a canceled item that rejects anyway still settles as canceled', async () => {
  const { queue, jobs } = makeHarness();
  const item = queue.add('a');
  queue.cancel(item.id);
  jobs[0].done.reject(new Error('too late'));
  await flush();
  assert.equal(item.state, 'canceled');
  assert.equal(item.failure, undefined);
});

test('progress reports after cancellation are ignored', () => {
  const { queue, jobs } = makeHarness();
  const item = queue.add('a');
  jobs[0].report(10, 'early');
  queue.cancel(item.id);
  jobs[0].report(90, 'ignored');
  assert.equal(item.percent, 10);
  assert.equal(item.message, 'early');
});

test('canceling a waiting item moves it straight to finished without starting it', () => {
  const { queue, jobs } = makeHarness(1);
  queue.add('a');
  const waiting = queue.add('b');
  queue.cancel(waiting.id);
  assert.equal(jobs.length, 1);
  assert.equal(waiting.state, 'canceled');
  assert.deepEqual(
    queue.finishedItems().map((finished) => finished.data),
    ['b'],
  );
});

test('canceling a finished item is a no-op', async () => {
  const { queue, jobs } = makeHarness();
  const item = queue.add('a');
  jobs[0].done.resolve();
  await flush();
  queue.cancel(item.id);
  assert.equal(item.state, 'done');
});

test('remove deletes items from every list', () => {
  const { queue, jobs } = makeHarness(2);
  const runningA = queue.add('a');
  const runningB = queue.add('b');
  const waitingC = queue.add('c');
  const waitingD = queue.add('d');
  queue.cancel(waitingD.id);
  assert.equal(jobs.length, 2);
  queue.remove(runningA.id);
  queue.remove(waitingC.id);
  queue.remove(waitingD.id);
  queue.remove(runningB.id);
  assert.equal(queue.waitingItems().length, 0);
  assert.equal(queue.runningItems().length, 0);
  assert.equal(queue.finishedItems().length, 0);
  assert.equal(queue.itemById(runningA.id), null);
});

test('removing a running item cancels its signal, frees the slot, and keeps it out of the finished list', async () => {
  const { queue, jobs } = makeHarness(1);
  const running = queue.add('a');
  queue.add('b');
  let abortFired = false;
  jobs[0].signal.onAbort(() => {
    abortFired = true;
  });
  queue.remove(running.id);
  assert.equal(abortFired, true);
  assert.deepEqual(
    queue.runningItems().map((item) => item.data),
    ['b'],
  );
  jobs[0].done.reject(new Error('canceled by removal'));
  await flush();
  assert.deepEqual(
    queue.finishedItems().map((finished) => finished.data),
    [],
  );
  assert.deepEqual(
    queue.runningItems().map((item) => item.data),
    ['b'],
  );
});

test('onAbort fires immediately for an already-canceled signal', () => {
  const { queue, jobs } = makeHarness();
  const item = queue.add('a');
  queue.cancel(item.id);
  let fired = false;
  jobs[0].signal.onAbort(() => {
    fired = true;
  });
  assert.equal(fired, true);
});

test('a freed slot pulls the next waiting item forward', async () => {
  const { queue, jobs } = makeHarness();
  for (const name of ['a', 'b', 'c', 'd']) queue.add(name);
  jobs[1].done.resolve();
  await flush();
  assert.deepEqual(
    jobs.map((job) => job.item.data),
    ['a', 'b', 'c', 'd'],
  );
  assert.deepEqual(
    queue.runningItems().map((item) => item.data),
    ['a', 'c', 'd'],
  );
});
