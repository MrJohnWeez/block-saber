import type { Beatmap, NoteModel, SongInfo } from './types';
import { beatToTick, normalizeBpmSegments } from './tick-table';

/**
 * Expand chains (decision D5) into plain dot notes at their head and tail endpoints.
 *
 * The Beat Saber chain strum has no Minecraft model, so each chain contributes at most two dot notes:
 * one at the head (head beat/x/y/color) and one at the tail (tail beat/x/y/color), both with cut direction
 * 8. Candidates are dropped when an existing note — or an earlier expansion — already sits at the same
 * rounded tick and the same grid cell, so chain heads that are also real notes never double up.
 *
 * @param beatmap Parsed difficulty whose `chains` array is expanded.
 * @param info Song info supplying the fallback BPM for the tick math shared with the spawn timeline.
 * @returns Extra notes to append to `beatmap.notes` before building spawn events.
 */
export function expandChainsToDots(beatmap: Beatmap, info: SongInfo): NoteModel[] {
  const segments = normalizeBpmSegments(beatmap.bpmChanges, info.bpm);
  const occupied = new Set<string>();
  for (const note of beatmap.notes) {
    occupied.add(cellKey(beatToTick(note.beat, segments, beatmap.offsetSeconds), note.x, note.y));
  }
  const additions: NoteModel[] = [];
  for (const chain of beatmap.chains) {
    const endpoints = [
      { beat: chain.beat, x: chain.x, y: chain.y },
      { beat: chain.tailBeat, x: chain.tailX, y: chain.tailY },
    ];
    for (const endpoint of endpoints) {
      const key = cellKey(beatToTick(endpoint.beat, segments, beatmap.offsetSeconds), endpoint.x, endpoint.y);
      if (occupied.has(key)) continue;
      occupied.add(key);
      additions.push({
        beat: endpoint.beat,
        x: endpoint.x,
        y: endpoint.y,
        color: chain.color,
        cutDirection: 8,
        angleOffset: 0,
      });
    }
  }
  return additions;
}

function cellKey(tick: number, x: number, y: number): string {
  return `${tick}|${x}|${y}`;
}
