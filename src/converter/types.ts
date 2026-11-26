/**
 * Internal Beat Saber map model shared by the reader, tick table, and pack emitters.
 *
 * bsmap wrapper types must never cross out of `parse-beatmap.ts`; everything here uses our own field names.
 */

/** Major Beat Saber data version a parsed map uses. */
export type BeatmapFormatVersion = 2 | 3 | 4;

/** Song-level metadata normalized from `Info.dat` across all supported format versions. */
export interface SongInfo {
  /** Major format version detected from the info file. */
  formatVersion: BeatmapFormatVersion;
  /** Raw version string as written in the info file, e.g. `"4.0.1"`. */
  schemaVersion: string;
  /** Song title. */
  title: string;
  /** Song subtitle, empty when absent. */
  subTitle: string;
  /** Song author name. */
  songAuthorName: string;
  /** Map creator name. */
  levelAuthorName: string;
  /** Base song BPM at beat 0. */
  bpm: number;
  /** Song time offset in seconds, from `_timeOffset` (v2) or `customData.offset` (v3+). */
  timeOffsetSeconds: number;
  /** Preview start time in seconds. */
  previewStartSeconds: number;
  /** Preview duration in seconds. */
  previewDurationSeconds: number;
  /** Referenced song audio filename (`.egg` counts as valid audio). */
  songFilename: string;
  /** Referenced cover image filename. */
  coverFilename: string;
  /** Referenced v4 audio analysis file, if the info file names one. */
  audioDataFilename: string | null;
  /** Environment names the map requests, in the order the format lists them. */
  environmentNames: string[];
  /** 360-degree environment name, empty when absent. */
  allDirectionsEnvironmentName: string;
  /** Difficulty entries declared in the info file, in file order. */
  beatmapRefs: BeatmapRef[];
}

/** One difficulty declaration inside the info file, before its data file is loaded. */
export interface BeatmapRef {
  /** Play mode characteristic, e.g. `Standard`. */
  characteristic: string;
  /** Difficulty name, e.g. `ExpertPlus`. */
  difficulty: string;
  /** Difficulty rank number, 0 when the format omits it. */
  difficultyRank: number;
  /** Referenced beatmap data filename. */
  beatmapDataFilename: string;
  /** Referenced v4 lightshow filename, null for v2/v3 and when absent. */
  lightshowDataFilename: string | null;
  /** Note jump movement speed. */
  noteJumpMovementSpeed: number;
  /** Note jump start beat offset. */
  noteJumpStartBeatOffset: number;
  /** Per-difficulty timing offset in seconds, null to inherit the song offset. */
  offsetSeconds: number | null;
}

/** A colorable saber note in beat/grid space. */
export interface NoteModel {
  /** Beat time of the note. */
  beat: number;
  /** Grid column, 0 (outer left) to 3 (outer right). */
  x: number;
  /** Grid row, 0 (bottom) to 2 (top). */
  y: number;
  /** Note color: 0 red, 1 blue, -1 undefined. */
  color: number;
  /** Cut direction, Beat Saber numbering (0 up, 1 down, 8 dot). */
  cutDirection: number;
  /** Extra cut angle offset in degrees clockwise. */
  angleOffset: number;
}

/** A bomb in beat/grid space. */
export interface BombModel {
  /** Beat time of the bomb. */
  beat: number;
  /** Grid column, 0 to 3. */
  x: number;
  /** Grid row, 0 to 2. */
  y: number;
}

/**
 * A chain (v3 `burstSliders`, v4 `chains`+`chainsData`) linking a head note position to a tail position.
 *
 * The emitter expands chains into plain dots at head and tail per contract §3.3 decision D5; v2 arcs and
 * v3 `sliders` / v4 `arcs` never reach this model.
 */
export interface ChainModel {
  /** Head beat time of the chain. */
  beat: number;
  /** Head grid column, 0 to 3. */
  x: number;
  /** Head grid row, 0 to 2. */
  y: number;
  /** Chain color: 0 red, 1 blue, -1 undefined. */
  color: number;
  /** Tail beat time of the chain. */
  tailBeat: number;
  /** Tail grid column, 0 to 3. */
  tailX: number;
  /** Tail grid row, 0 to 2. */
  tailY: number;
}

/** A wall obstacle; `durationBeats` keeps its fractional part (fixes Unity bug B5). */
export interface ObstacleModel {
  /** Beat time the wall starts. */
  beat: number;
  /** Wall duration in beats, fractional values preserved. */
  durationBeats: number;
  /** Grid column of the left edge, 0 to 3. */
  x: number;
  /** Grid row of the bottom edge (0-1 normal, 3 crouch). */
  y: number;
  /** Width in grid columns, 1 or 2. */
  width: number;
  /** Height in grid rows, 1 short, 2 moderate, 3 crouch. */
  height: number;
}

/**
 * A basic light event in beat space, normalized by the parser to v2 LightWithId semantics (§3.5).
 *
 * `type` is the v2 group enum (0 back lasers, 1 rings, 2/3 rotating lasers, 4 center, 5 boost, 6/7
 * extra lights, 10/11 side lasers; 8/9 pass through but the emitter drops them) and `value` is in
 * the v2 light-value domain {0 off, 1/2 on, 3 flash, 4 off, 5..11 on}.
 */
export interface LightEventModel {
  /** Beat time of the event. */
  beat: number;
  /** v2 LightWithId group type, e.g. 1 ring lights, 9 ring zoom. */
  type: number;
  /** v2 light value; v3/v4 sources are normalized into this domain by the parser. */
  value: number;
  /** Event float value (v3+); brightness for normalized v4 events. */
  floatValue: number;
}

/** A BPM change at a given beat. */
export interface BpmChangeEvent {
  /** Beat the new BPM applies from. */
  beat: number;
  /** New BPM value. */
  bpm: number;
}

/** One playable difficulty with its fully parsed objects. */
export interface Beatmap {
  /** Play mode characteristic, e.g. `Standard`. */
  characteristic: string;
  /** Difficulty name, e.g. `Expert`. */
  difficulty: string;
  /** Difficulty rank number, 0 when unknown. */
  difficultyRank: number;
  /** Note jump movement speed. */
  noteJumpMovementSpeed: number;
  /** Note jump start beat offset. */
  noteJumpStartBeatOffset: number;
  /** Resolved timing offset in seconds for this difficulty. */
  offsetSeconds: number;
  /** BPM changes declared by this difficulty's data file, possibly empty. */
  bpmChanges: BpmChangeEvent[];
  /** Color notes, in file order. */
  notes: NoteModel[];
  /** Bombs, split out from v2 `_notes` with `_type: 3` (fixes the Unity bomb bug). */
  bombs: BombModel[];
  /** Chains (v3 burst sliders, v4 chains); expanded to dots by the emitter per decision D5. */
  chains: ChainModel[];
  /** Walls, in file order. */
  obstacles: ObstacleModel[];
  /** Light events, from the v2/v3 data file or the v4 lightshow file. */
  lightEvents: LightEventModel[];
}

/** Binary map assets resolved case-insensitively from the zip. */
export interface MapAssets {
  /** Song audio bytes, `.egg` included. */
  songBytes: Uint8Array;
  /** Zip path the audio was found under, lowercase. */
  songEntryPath: string;
  /** Cover image bytes. */
  coverBytes: Uint8Array;
  /** Zip path the cover was found under, lowercase. */
  coverEntryPath: string;
}

/** A whole parsed map ready for the tick table and emitters. */
export interface ParsedMap {
  /** Normalized song info. */
  info: SongInfo;
  /** Parsed difficulties in info-file order. */
  beatmaps: Beatmap[];
  /** Referenced binary assets. */
  assets: MapAssets;
}

/** A scheduled note spawn. */
export interface SpawnNoteEvent {
  /** Event discriminator. */
  kind: 'note';
  /** Absolute game tick, 20 ticks per second from the first audio sample. */
  tick: number;
  /** The note to place. */
  note: NoteModel;
}

/** A scheduled bomb spawn. */
export interface SpawnBombEvent {
  /** Event discriminator. */
  kind: 'bomb';
  /** Absolute game tick, 20 ticks per second from the first audio sample. */
  tick: number;
  /** The bomb to place. */
  bomb: BombModel;
}

/** A scheduled wall spawn with its end tick preserving fractional wall durations. */
export interface SpawnWallEvent {
  /** Event discriminator. */
  kind: 'wall';
  /** Absolute game tick, 20 ticks per second from the first audio sample. */
  tick: number;
  /** Absolute game tick the wall stops occupying the lane. */
  endTick: number;
  /** The wall to place. */
  wall: ObstacleModel;
}

/** A scheduled light show event. */
export interface SpawnLightEvent {
  /** Event discriminator. */
  kind: 'light';
  /** Absolute game tick, 20 ticks per second from the first audio sample. */
  tick: number;
  /** The light event to run. */
  light: LightEventModel;
}

/** A song-boundary marker for the engine. */
export interface SpawnControlEvent {
  /** Event discriminator. */
  kind: 'control';
  /** Absolute game tick, 20 ticks per second from the first audio sample. */
  tick: number;
  /** Which boundary this marks. */
  control: 'start' | 'end';
}

/** One entry of a difficulty's ordered spawn timeline. */
export type SpawnEvent = SpawnNoteEvent | SpawnBombEvent | SpawnWallEvent | SpawnLightEvent | SpawnControlEvent;
