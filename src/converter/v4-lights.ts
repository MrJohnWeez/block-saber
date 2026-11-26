/**
 * v4 lightshow normalization into v2 LightWithId semantics (contract §3.5, amendment 2026-11-25).
 *
 * v4 box-group color events carry none of the v2 type/value fields, so the parser decodes them here:
 * the group id (a standard-environment light id) picks the D6 engine group, and the referenced
 * `lightColorEvents[i]` picks a v2 value from {0 off, 1 on, 3 flash}. Per the contract's §3.5
 * exclusions we skip: v4 `basicEvents` (compatible-event types/values, not box-group semantics),
 * rotation/translation/FX box groups (`t ∈ {2,3,4}`), the white light ids (88–131) and `ALL`
 * pseudo-ids (≥132), `indexFilters` subset semantics (a filtered group is the whole group), the `c`
 * color channel (side color comes from the D6 group), Chroma/`customData`, and every
 * distribution/easing/strobe-detail field.
 */

import type { LightEventModel } from './types';

/** Any JSON object read from a lightshow file before schema validation. */
type RawData = Record<string, unknown>;

/** Normalized v2 light value constants (the emitter's §3.5 decoder domain). */
const V2_OFF = 0;
const V2_ON = 1;
const V2_FLASH = 3;

/**
 * Normalize the color box-group events of a parsed v4 lightshow (raw JSON) to v2-semantics events.
 *
 * @param lightshowData Raw JSON object of the v4 lightshow file (or embedded lightshow section).
 * @returns Light events sorted by beat; every `type`/`value` pair is decodable by the emitter.
 */
export function normalizeV4Lights(lightshowData: RawData): LightEventModel[] {
  const colorEvents = arrOf(lightshowData, 'lightColorEvents');
  const events: LightEventModel[] = [];
  for (const rawGroup of arrOf(lightshowData, 'eventBoxGroups')) {
    const group = asRecord(rawGroup);
    if (group['t'] !== 1) continue;
    const type = v2GroupForLightId(intOf(group, 'g'));
    if (type === null) continue;
    const baseBeat = numOf(group, 'b');
    for (const rawBox of arrOf(group, 'e')) {
      for (const rawLane of arrOf(asRecord(rawBox), 'l')) {
        const lane = asRecord(rawLane);
        const value = v2ValueForColorEvent(atIndex(colorEvents, lane['i']));
        if (value === null) continue;
        events.push({
          beat: baseBeat + numOf(lane, 'b'),
          type,
          value,
          floatValue: value === V2_OFF ? 0 : 1,
        });
      }
    }
  }
  events.sort((a, b) => a.beat - b.beat);
  return events;
}

/**
 * Map a standard-environment light id (group `g`) to the D6 v2 event type per contract §3.5.
 *
 * Ranges: rotating lasers 0–11 left / 12–23 right, center 24–43, side lasers 44–47 left / 48–51
 * right, boost 52–63, rings 64–87; white light ids 88–131 and `ALL` pseudo-ids ≥132 are skipped.
 * **M6 calibration flag:** the ranges above 23 are community-documented standard-environment values
 * that no fixture exercises (the real fixture is laser-only); correct this single table if the M6
 * playtest disagrees.
 *
 * @param id Group id (`g`) of a color event box group.
 * @returns The v2 LightWithId type, or `null` when the id is not modeled.
 */
function v2GroupForLightId(id: number): number | null {
  if (id < 0) return null;
  if (id <= 11) return 2;
  if (id <= 23) return 3;
  if (id <= 43) return 4;
  if (id <= 47) return 10;
  if (id <= 51) return 11;
  if (id <= 63) return 5;
  if (id <= 87) return 1;
  return null;
}

/**
 * Decode one referenced `lightColorEvents` entry into the v2 value domain (contract §3.5 table).
 *
 * An Extend transition preserves prior state (skip), zero brightness is off, and a strobe
 * frequency approximates the v2 flash the contract maps to value 3. The `c` color channel is a
 * v1 exclusion: side color comes from the mapped group, never from the event.
 *
 * @param event Raw `lightColorEvents` entry.
 * @returns A v2 value in {0, 1, 3}, or `null` to skip the event.
 */
function v2ValueForColorEvent(event: RawData): number | null {
  if (event['p'] === 1) return null;
  const brightness = typeof event['b'] === 'number' && Number.isFinite(event['b']) ? event['b'] : 1;
  if (!(brightness > 0)) return V2_OFF;
  const strobe = typeof event['f'] === 'number' && Number.isFinite(event['f']) ? event['f'] : 0;
  return strobe > 0 ? V2_FLASH : V2_ON;
}

function asRecord(value: unknown): RawData {
  return typeof value === 'object' && value !== null && !Array.isArray(value) ? (value as RawData) : {};
}

function arrOf(data: RawData, name: string): unknown[] {
  const value = data[name];
  return Array.isArray(value) ? value : [];
}

function atIndex(array: unknown[], index: unknown): RawData {
  const value = typeof index === 'number' && Number.isFinite(index) ? array[Math.trunc(index)] : undefined;
  return asRecord(value);
}

function numOf(data: RawData, name: string): number {
  const value = data[name];
  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}

function intOf(data: RawData, name: string): number {
  return Math.trunc(numOf(data, name));
}
