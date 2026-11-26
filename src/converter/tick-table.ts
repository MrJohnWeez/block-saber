import type { Beatmap, BpmChangeEvent, SongInfo, SpawnEvent } from './types';

/** Game ticks per real-time second; the engine runs one command batch every 50 ms. */
export const TICKS_PER_SECOND = 20;

/** BPM assumed at beat 0 when a difficulty ships no BPM events at all. */
export const DEFAULT_SONG_BPM = 120;

/**
 * Sort and de-duplicate BPM change events so every beat resolves to exactly one segment.
 *
 * Events at the same beat keep the last entry, events with a non-positive BPM are dropped, and a
 * segment at beat 0 is synthesized from `fallbackBpm` when the file's first change starts later.
 *
 * @param bpmChanges Raw events in arbitrary order.
 * @param fallbackBpm Song BPM used before the first change.
 * @returns A non-empty, beat-ascending segment list starting at or before beat 0.
 */
export function normalizeBpmSegments(bpmChanges: readonly BpmChangeEvent[], fallbackBpm: number): BpmChangeEvent[] {
  const valid = bpmChanges.filter((event) => Number.isFinite(event.beat) && event.bpm > 0);
  valid.sort((a, b) => a.beat - b.beat);
  const merged: BpmChangeEvent[] = [];
  for (const event of valid) {
    if (merged.length > 0 && merged[merged.length - 1].beat === event.beat) merged[merged.length - 1] = event;
    else merged.push(event);
  }
  if (merged.length === 0 || merged[0].beat > 0) merged.unshift({ beat: 0, bpm: fallbackBpm });
  return merged;
}

/**
 * Convert a beat to seconds of beat-derived time, integrating across BPM change segments.
 *
 * Within each segment the tempo is constant, so the result is a piecewise-linear sum of
 * `deltaBeats * 60 / bpm` starting from beat 0; beats before 0 use the beat-0 tempo.
 *
 * @param beat Beat to convert.
 * @param bpmChanges Segments from {@link normalizeBpmSegments}.
 * @returns Seconds elapsed by `beat`, negative for beats before 0.
 */
export function beatToSeconds(beat: number, bpmChanges: readonly BpmChangeEvent[]): number {
  const segments = bpmChanges.length > 0 ? bpmChanges : [{ beat: 0, bpm: DEFAULT_SONG_BPM }];
  let seconds = 0;
  let cursorBeat = 0;
  let currentBpm = bpmAt(0, segments);
  for (const segment of segments) {
    if (segment.beat <= 0 || segment.beat >= beat) continue;
    seconds += (segment.beat - cursorBeat) * (60 / currentBpm);
    cursorBeat = segment.beat;
    currentBpm = segment.bpm;
  }
  seconds += (beat - cursorBeat) * (60 / currentBpm);
  return seconds;
}

/**
 * Convert a beat to an absolute game tick.
 *
 * The formula mirrors Beat Saber's `AudioTimeConvertor`: `tick = round((songTime(beat) - offset)
 * * 20)` where `songTime(beat)` integrates the BPM segments and a positive offset (from `_timeOffset`
 * or `customData.offset`) shifts the pattern earlier against the audio, matching the game convention
 * `songTime = beat * 60 / bpm - timeOffset`. Ticks may be negative when an offset pulls events before
 * the first audio sample.
 *
 * @param beat Beat to convert.
 * @param bpmChanges Segments from {@link normalizeBpmSegments}; empty falls back to 120 BPM.
 * @param offsetSeconds Timing offset in seconds resolved by the parse layer.
 * @returns Rounded absolute tick at 20 ticks per second from the first audio sample.
 */
export function beatToTick(beat: number, bpmChanges: readonly BpmChangeEvent[], offsetSeconds: number): number {
  return Math.round((beatToSeconds(beat, bpmChanges) - offsetSeconds) * TICKS_PER_SECOND);
}

/**
 * Build the ordered spawn timeline for one difficulty.
 *
 * Positions stay in beats inside the carried models; only scheduling ticks are computed here.
 * Events are sorted by tick, ties fall back to kind order (control, wall, light, bomb, note) and then
 * file order. A `control: start` event is emitted at beat 0 and a `control: end` event at the last
 * scheduled object, leaving any finish padding to the emitter.
 *
 * @param beatmap Parsed difficulty.
 * @param info Song info supplying the fallback BPM.
 * @returns Non-empty timeline, ascending by tick.
 */
export function buildSpawnEvents(beatmap: Beatmap, info: SongInfo): SpawnEvent[] {
  const segments = normalizeBpmSegments(beatmap.bpmChanges, info.bpm);
  const tickAt = (beat: number): number => beatToTick(beat, segments, beatmap.offsetSeconds);
  const events: SpawnEvent[] = [];
  for (const wall of beatmap.obstacles) {
    events.push({ kind: 'wall', tick: tickAt(wall.beat), endTick: tickAt(wall.beat + wall.durationBeats), wall });
  }
  for (const light of beatmap.lightEvents) {
    events.push({ kind: 'light', tick: tickAt(light.beat), light });
  }
  for (const bomb of beatmap.bombs) {
    events.push({ kind: 'bomb', tick: tickAt(bomb.beat), bomb });
  }
  for (const note of beatmap.notes) {
    events.push({ kind: 'note', tick: tickAt(note.beat), note });
  }
  const lastTick = events.reduce(
    (max, event) => Math.max(max, event.tick, event.kind === 'wall' ? event.endTick : event.tick),
    0,
  );
  events.push({ kind: 'control', tick: tickAt(0), control: 'start' });
  events.push({ kind: 'control', tick: lastTick, control: 'end' });
  events.sort((a, b) => a.tick - b.tick || KIND_ORDER[a.kind] - KIND_ORDER[b.kind]);
  return events;
}

const KIND_ORDER: Record<SpawnEvent['kind'], number> = {
  control: 0,
  wall: 1,
  light: 2,
  bomb: 3,
  note: 4,
};

function bpmAt(beat: number, segments: readonly BpmChangeEvent[]): number {
  let bpm = segments[0].bpm;
  for (const segment of segments) {
    if (segment.beat > beat) break;
    bpm = segment.bpm;
  }
  return bpm;
}
