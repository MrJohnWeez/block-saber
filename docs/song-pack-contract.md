# Song Pack Contract — converter ↔ in-game engine interface (Minecraft 26.3)

**Status: LOCKED contract v1 (`BS_API_VERSION = 1`) — owner-reviewed 2026-11-25; D1–D10 approved (D7 amended: dedicated
white note), D11/D12 deferred to M6/M4b.** This document is the interface between the browser converter's emitted
per-map datapacks ("song packs") and the shared `block_saber` datapack engine in `game/template-world`. Two engineers
implementing (a) the converter emitter and (b) the in-game engine from this file alone should never need to talk to each
other. Every change to the interface happens here first. Research background: [`docs/migration/`](migration/) (MD report +
CSVs); work plan: `~/.opencode/plan/block-saber-web-migration.md` (M1). Target: **data pack format 121.0, resource pack
format 97.1** (26.3), singular directories (`function/`), SNBT text components, item components, `active_effects`,
`equipment`.

**DECISION** items are marked inline and collected in §8. Locked decisions from the plan are implemented, not re-debated.

---

## 0. Overview of both sides

```
┌─────────────────────────┐   emits    ┌──────────────────────────────┐   reads    ┌────────────────────────────┐
│ Web converter (TS, M3)  │ ─────────► │ song datapack  bs_<slug>/    │ ─────────► │ BlockSaber base datapack   │
│ tick-table is authority │            │ + songs resource pack (M5)   │  functions │ block_saber (engine, M4)   │
└─────────────────────────┘            └──────────────────────────────┘  + tags    └────────────────────────────┘
```

- Song packs are **data only**: they never define note/wall/light behavior, they call the engine's
  `block_saber:notes/*`, `block_saber:walls/*` and write contract scoreboards (replacing the old `_types` namespace).
- The engine owns: tick loop, cursor markers, hit judgment, scoring, lights rendering, menus, pause/stop, completion.
- One cumulative **"Block Saber Songs"** resource pack carries all audio (sounds.json cannot merge across packs).

Contract constants (used throughout):

| Constant                            | Value                                           |
| ----------------------------------- | ----------------------------------------------- |
| `BS_API_VERSION` (contract version) | `1`                                             |
| Song namespace                      | `bs_<slug>` (§1.2)                              |
| Sound event                         | `bsong_<slug>` (§5)                             |
| Game TPS                            | 20                                              |
| `COMMAND_LIMIT` (commands per file) | 10000 (port of `Globals.COMMAND_LIMIT`)         |
| Marker base tag                     | `blocksaber` (all engine/song entities)         |
| Song marker tag                     | `bs_song`                                       |
| Cursor tags                         | `bs_node_cursor`; spawn origin `bs_node_origin` |

---

## 1. Song datapack layout

### 1.1 Zip layout (real example, hypothetical map "Blueberry Dream" by QooBee, slug `443f3a1b`)

```text
BlockSaber - QooBee - Blueberry Dream (datapack).zip
├── pack.mcmeta
├── pack.png                                    # real PNG cover (B1 fix), §4
├── README-install.txt                          # human install steps incl. the install command
└── data/
    └── bs_443f3a1b/
        └── function/
            ├── probe.mcfunction
            ├── install.mcfunction
            ├── uninstall.mcfunction
            ├── expert_standard_play.mcfunction
            ├── expert_standard_notes_lvl_1.mcfunction
            ├── expert_standard_notes_lvl_2.mcfunction
            ├── expert_standard_walls_lvl_1.mcfunction
            ├── expert_standard_lights_lvl_1.mcfunction
            ├── expert_plus_standard_play.mcfunction
            ├── expert_plus_standard_notes_lvl_1.mcfunction
            ├── expert_plus_standard_walls_lvl_1.mcfunction
            ├── expert_plus_standard_lights_lvl_1.mcfunction
            └── ...                             # one group of files per characteristic+difficulty
```

Rules:

- `pack.mcmeta`/`pack.png` at zip root; the zip **is** the datapack (no wrapper folder).
- Data namespace `bs_<slug>` only. **No** files under `data/minecraft/` — function tags (`load.json`, `tick.json`)
  do **not** merge across packs; shipping one would clobber the base pack's tags. Registration is via `/function
bs_<slug>:install` (§2).
- No engine files, no `sounds.json`, no audio in song datapacks.
- Old Unity template's per-map functions `play`, `tick`, `active_tick`, `spawn_notes_base`, `set_spawn_origin`,
  `game_controls`, `difficulties`, `title`, `display_title`, `map_difficulty_completed`, `init` are **deleted**; the
  base engine (`block_saber:*`) and the marker entity (§2) absorb them 1-for-1.

### 1.2 Namespace slug (deterministic, collision-resistant) — **DECISION (D1)**

`slug = first 8 lowercase hex of sha1(input)` where `input` =

1. the BeatSaver map key if known (site fetch), else
2. sha256 of the zip's `Info.dat` bytes + first beatmap file name (stable for hand-dropped zips).

Namespace = `bs_` + slug → `bs_443f3a1b` (11 chars; always ≤ 16). Characters are `[0-9a-f_]` ⊂ Minecraft's allowed
`[a-z0-9_.-]`. This supersedes Unity's `MakeMinecraftSafe(folderName)`/random-id scheme (fixes the "random IDs" note).

- **Collision:** if two different songs hash to the same slug, both grow to 12 hex; a third collision is a hard
  converter error (`ConversionError.SlugCollision`). The songs-resource-pack sound file name and marker metadata use
  the same slug string.
- Slug is stable across re-converts of the same map ⇒ reinstall is an in-place upgrade (§2.3).

### 1.3 Characteristic + difficulty naming (B3 fix)

Token = `<difficulty>_<characteristic>`, each half mapped through the table below, non-`[a-z0-9]` runs → `_` (spirit
of `MakeMinecraftSafe`, `StringExtensions.cs`). **Every** function file carries the full token:
`<difficulty>_<characteristic>_<kind>[_lvl_<n>].mcfunction` (plan example: `expert_plus_standard_play`).

| Beat Saber difficulty | token         | Beat Saber characteristic | token             |
| --------------------- | ------------- | ------------------------- | ----------------- |
| Easy                  | `easy`        | Standard                  | `standard`        |
| Normal                | `normal`      | Lawless                   | `lawless`         |
| Hard                  | `hard`        | AllDirection              | `all_direction`   |
| Expert                | `expert`      | Extended                  | `extended`        |
| ExpertPlus            | `expert_plus` | OneSaber                  | `one_saber`       |
| —                     |               | NoArrows                  | `no_arrows`       |
| —                     |               | 360Degree                 | `degree_360`      |
| —                     |               | VerticalSingle            | `vertical_single` |
| —                     |               | Legacy                    | `legacy`          |

Unknown characteristics (mods): sanitize to `[a-z0-9_]` and use the result (e.g. `Chroma` → `chroma`); if the token is
empty or duplicates a table token, use `unknown` and apply the §7 duplicate rule. Gameplay is identical for all
characteristics (they only relabel the menu and split files) — **no** characteristic-specific engine behavior in v1.
`Standard-Expert` vs `Lawless-Expert` therefore never collide (B3).

---

## 2. Song metadata + self-registration

### 2.1 Mechanism: install command + marker entity (locked design choice)

Datapacks cannot be enumerated from mcfunction and function tags don't merge, so song packs self-register with **one
player-run command** after the pack is dropped into `datapacks/` and `/reload`:

```text
/function bs_443f3a1b:install
```

The converter prints this in the site UI and in `README-install.txt`. `install.mcfunction` is idempotent. It:

1. version-guards (§4.2);
2. deletes any previous state for its slug, then summons **one song marker** at fixed coords `0 5 0` and creates
   its scoreboard entries.

The marker is the machine-readable song registry: the engine enumerates `@e[type=marker,tag=bs_song]` — that selector
_is_ the "installed songs" list; no scoreboard enumeration or NBT scanning is needed to find songs, and all static
metadata travels as **entity data** (read with `data get entity`, copied via `data modify ... from entity`, and fed
into the engine's internal macro functions to build menu items).

Marker schema (summoned by the song pack, read only by the engine):

```mcfunction
summon minecraft:marker 0 5 0 {Tags:["bs_song","bs_443f3a1b","blocksaber"],bs:{\
  slug:"443f3a1b",contract:1,sound:"bsong_443f3a1b",\
  title:"Blueberry Dream",artist:"QooBee",level:"Standard Expert / ExpertPlus",\
  diffs:[{id:"expert_standard",diff:"Expert",char:"Standard",notes:964,end_tick:9417,mpt_millionths:504000,lead_m:20},\
         {id:"expert_plus_standard",diff:"ExpertPlus",char:"Standard",notes:1418,end_tick:9417,mpt_millionths:504000,lead_m:20}]}}
```

- `bs.diffs[].id` is exactly the §1.3 token and the prefix of every per-difficulty function file.
- `bs.diffs[].end_tick` = absolute game tick of the last emitted command (`§3.7`) — engine uses it for result timing.
- `bs.diffs[].mpt_millionths` = `metersPerTick × 1e6` (§3.1, integer) and `bs.diffs[].lead_m` = lead meters (§3.1,
  integer). The play-start sequence (§2.3) copies both into the engine's movement state before the first tick — the
  runtime handoff for the constants the converter derives from BPM. (Amendment 2026-11-25 from M4a: without these,
  the engine cannot move notes.)
- `bs.contract` is validated at play time (§4.2).
- Strings: SNBT-quoted, `"`/`\` escaped, title/artist truncated to 64 chars by the converter.
- Marker NBT is preserved on chunk save (custom entity NBT via `/data` semantics); position `0 5 0` is inside the
  always-loaded spawn area of the template world. **DECISION (D3):** fixed-position markers are acceptable for a
  singleplayer template world; if ever needed, the engine's prune pass (§2.4) is the migration hook.

### 2.2 Scoreboards touched by a song pack

The **engine's** `block_saber:init` creates these objectives (song packs never create them, only write entries):

| Objective                        | Entries                                                                                                                                                      | Written by                     | Purpose                                                    |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------ | ---------------------------------------------------------- |
| `bs_finished`                    | `#bs_notes`, `#bs_walls`, `#bs_lights`                                                                                                                       | song files                     | per-stream done flags (§3.7), reset by engine on start     |
| `bs_light_on` / `bs_light_color` | `#back_lasers`, `#rings`, `#rotating_left`, `#rotating_right`, `#center`, `#boost`, `#extra_left`, `#extra_right`, `#side_lasers_left`, `#side_lasers_right` | song files                     | light group state (§3.5)                                   |
| `bs_complete`                    | `#<slug>_<token>`                                                                                                                                            | engine on success              | completion records (port of old `songGuid+<n>` objectives) |
| `song_contract`                  | `#CONST`                                                                                                                                                     | engine init = `BS_API_VERSION` | handshake (§4.2)                                           |
| `curr_tick`                      | players                                                                                                                                                      | engine `game_loop`             | per-player song tick the song files gate on (§3.1)         |

`install.mcfunction` only pre-creates its `bs_complete` entry: `scoreboard players set #443f3a1b_expert_standard
bs_complete 0`.

### 2.3 Menu integration (engine side, specified so emitter authors know what players see)

Existing inventory menus (`game/template-world/.../inventory/*`) keep their `custom_data={action:...}` +
`block_saber:actions/*` predicate pattern. The engine's `block_saber:inventory/menu_selection_set` becomes:

- iterate `@e[type=marker,tag=bs_song]`, read each marker's `bs` compound into `storage bs:menu`, and place one item
  per song via an engine-internal `$`-macro `item replace`:
  `minecraft:stick[custom_name=[{"text":"Blueberry Dream — QooBee"}],custom_data={action:"bs_song",slug:"443f3a1b",menu_item:1b},...]`
- clicking a song (new predicate `block_saber:actions/song_action`, checks `custom_data.action == "bs_song"`) opens
  the difficulty page: one item per `bs.diffs[]` entry with
  `custom_data={action:"bs_play",slug:"443f3a1b",diff:"expert_standard",menu_item:1b}`.
- clicking a difficulty item → engine extracts `slug`+`diff` from the clicked slot's `custom_data`
  (`data get entity @s Inventory[...]` → `storage bs:menu`) and starts the song.
- 27-slot page, slots 1–24 for songs, slot 0 = back, slot 26 = next/prev page (`custom_data={action:"bs_page",page:N}`
  — engine-internal). **DECISION (D9):** v1 page order = marker selector order (undefined); sort by title in v2.

**Play start sequence (engine `block_saber:song/start`, called with slug+diff from the menu):**
`block_saber:stop` cleanup → contract check (§4.2) → copy `mpt_millionths`/`lead_m` from the marker's `bs.diffs[]`
entry into the engine's movement state → `summon` origin/cursor markers around `game_origin` →
reset `curr_tick 0`, `bs_finished` flags, `bs_light_*` scores →
`execute as @s run function bs_<slug>:<diff_char>_play` runs every tick from `game_loop` (in player context), replacing
today's hardcoded single-scene `block_saber:play` body. `block_saber:stop` must kill markers **except** song markers:
`kill @e[type=marker,tag=blocksaber,tag=!bs_song]` (engine change; today it kills all markers and would delete
registrations).

### 2.4 Lifecycle files

- `probe.mcfunction` — comment-only file whose existence the engine uses to detect removed packs:
  `$execute unless function bs_${slug}:probe run kill @s` run per marker from `block_saber:tick` (prune pass).
- `install.mcfunction` — example (real contract v1):

```mcfunction
# bs_443f3a1b — Blueberry Dream (QooBee) — Block Saber song contract 1
execute unless score #CONST song_contract matches 1 run tellraw @s {text:"[BlockSaber] Install the base BlockSaber datapack first.",color:"red"}
execute unless score #CONST song_contract matches 1 run return 0
execute unless function block_saber:notes/red_dot run tellraw @s {text:"[BlockSaber] Base engine too old (missing block_saber:notes).",color:"red"}
execute unless function block_saber:notes/red_dot run return 0
function bs_443f3a1b:uninstall
summon minecraft:marker 0 5 0 {Tags:["bs_song","bs_443f3a1b","blocksaber"],bs:{slug:"443f3a1b",contract:1,...}}
scoreboard players set #443f3a1b_expert_standard bs_complete 0
scoreboard players set #443f3a1b_expert_plus_standard bs_complete 0
tellraw @s [{text:"[BlockSaber] ",color:"green"},{text:"Blueberry Dream installed (2 difficulties).",color:"white"}]
```

- `uninstall.mcfunction` — `kill @e[tag=bs_443f3a1b]` + `scoreboard players reset #443f3a1b_* bs_complete`.
  Removing the zip without running this is safe: the §2.4 prune pass deletes the orphan marker within one tick;
  leftover `bs_complete` fake-player entries are inert.

**DECISION (D2):** one manual `/function bs_<slug>:install` per song pack (printed by the site, documented in the zip
and on `public/index.html`). There is no zero-touch alternative that survives the function-tag no-merge rule.

---

## 3. Runtime data contract

### 3.1 Tick model

The converter's **tick table (M2 `tick-table.ts`) is authoritative**: it already applies BPM-change segments and the
song time offset (`_timeOffset` / `customData.offset`, B4) and emits integer game ticks. Emitter rules:

- `gameTick(n) = round(20 × secondsSinceSongStart(n))` — nearest integer, computed per note/wall/event from the
  normalized model (`tick-table.ts` uses `Math.round`; floor would bias every event up to one tick early).
- Note speed constant (port of `DataPackData.cs`): `metersPerTick = bpm/60 × 24 × 0.21 / 20`; lead distance
  `LEAD_M = clamp(bpm/6, 7, 20) m`; `LEAD_TICKS = trunc(LEAD_M / metersPerTick)` (per difficulty; BPM of the first
  segment). The spawn origin marker is placed `LEAD_TICKS × metersPerTick` meters in front of `game_origin`
  (engine side, from `bs`-independent engine constants passed by the play dispatcher §3.2 line 1).
- One clock: spawn ticks and `curr_tick` are the same timeline. A note at `gameTick T` spawns at the cursor with
  `z = -(frac)` and **arrives at the player at tick `T + LEAD_TICKS`**, so audio must start at game tick
  `LEAD_TICKS`. The dispatcher's first line is therefore always
  `execute if score @s curr_tick matches <LEAD_TICKS> run playsound ...`.
- Walls keep fractional durations (B5): each 1-beat segment of `0.21 m` becomes its own spawn command
  (`segmentTick = gameTick + trunc(i × 0.21 / metersPerTick)`), fractional remainder in `z`.

Worked example (BPM change, so the engine author can spot-check sync):

```text
BPM 120 beat 0 → BPM 150 at beat 16; offset 0.0
seconds(beat 20) = 16 × 60/120 + 4 × 60/150 = 8 + 1.6 = 9.6 s → gameTick = round(192) = 192
LEAD_M = clamp(120/6,7,20) = 20 m; metersPerTick = 120/60 × 24 × 0.21/20 = 0.504 → LEAD_TICKS = 39
→ playsound gated at curr_tick 39. Note spawns at curr_tick 192, reaches player at tick 231
  = 39 + 192 → (231−39)/20 = 9.6 s after audio start = beat 20 under the changed-BPM clock. ✓
```

### 3.2 Per-difficulty dispatcher — `<token>_play.mcfunction`

Emitted first in every group; runs as the playing player from `game_loop` every tick. It is the port of the old
`<difficulty>.mcfunction` (`_baseCommand` batching). Example for `expert_standard` (2 note levels, 1 wall, 1 light;
last note command at tick 7939, last wall command at 9377, last light command at 7103; `LEAD_TICKS = 39`):

```mcfunction
execute if score @s curr_tick matches 39 run playsound bsong_443f3a1b music @a 0.0 0.0 0.0 1 1
execute if score @s curr_tick matches 0..3927 run function bs_443f3a1b:expert_standard_notes_lvl_1
execute if score @s curr_tick matches 3928..7979 run function bs_443f3a1b:expert_standard_notes_lvl_2
execute if score @s curr_tick matches 0..9417 run function bs_443f3a1b:expert_standard_walls_lvl_1
execute if score @s curr_tick matches 0..7143 if score #CONST bs_lightshow matches 1 run function bs_443f3a1b:expert_standard_lights_lvl_1
```

Gates are **contiguous per stream**: first file `0..b1`, each next file `b(n−1)+1..bn`, and the **last file of each
stream ends at that stream's `doneTick`** (§3.7 = stream's last command tick + `LEAD_TICKS` + 1), because the
stream's done flag lives in its last file as a self-gated command at `doneTick`. Boundaries are inclusive and only
guard function-call cost — level files self-gate every command. `#CONST bs_lightshow` (0/1, engine-owned,
settings-toggled — port of `LightShowEnabled`) gates light files so disabled lightshows cost one score test, not
thousands.

### 3.3 Notes — `<token>_notes_lvl_<n>.mcfunction`

Port of the old `TickCount` batching + cursor: every note = exactly 2 commands (teleport + dispatch; the third
command of the old `NodeDataToCommands` was a row-id score command, now moved engine-side), no
score command (row id handling moves engine-side). Real example lines:

```mcfunction
execute if score @s curr_tick matches 192 at @e[type=marker,tag=bs_node_origin,limit=1] run teleport @e[type=marker,tag=bs_node_cursor,limit=1] ~0.300000 ~-0.300000 ~-0.126000
execute if score @s curr_tick matches 192 as @e[type=marker,tag=bs_node_cursor,limit=1] run function block_saber:notes/red_up
execute if score @s curr_tick matches 193 at @e[type=marker,tag=bs_node_origin,limit=1] run teleport @e[type=marker,tag=bs_node_cursor,limit=1] ~-0.300000 ~0.000000 ~0.000000
execute if score @s curr_tick matches 193 as @e[type=marker,tag=bs_node_cursor,limit=1] run function block_saber:notes/blue_dot
```

Cursor offsets relative to `bs_node_origin` (engine places the origin centered on the saber column axis):

- `x = (lineIndex - 1) × 0.300000`, `y = (lineLayer - 1) × 0.300000`, `z = -(fractionTick × metersPerTick)`
  (fractional sub-tick offset, §3.1; `0.000000` when on-tick).

Node-type dispatch table (port of `Globals.noteTypes`; engine **defines** these, song packs **only call** them):

| BS color × cut                                  | engine function                                                                                                                                                                                                                              |     | BS color × cut | engine function               |
| ----------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --- | -------------- | ----------------------------- |
| red up / down / left / right                    | `block_saber:notes/red_up` `_down` `_left` `_right`                                                                                                                                                                                          |     | blue ×same 4   | `block_saber:notes/blue_up` … |
| red up-left / up-right / down-left / down-right | `…/red_up_left` `red_up_right` `red_down_left` `red_down_right`                                                                                                                                                                              |     | blue ×same 4   | `…/blue_*`                    |
| red dot                                         | `block_saber:notes/red_dot`                                                                                                                                                                                                                  |     | blue dot       | `block_saber:notes/blue_dot`  |
| white ×same 9 (v4 color 2)                      | `block_saber:notes/white_up` … `white_dot` — **DECISION (D7, owner-approved)**: dedicated white note entity + item model/texture in the base resource pack, judged hittable by **either** saber (engine M4b; the emitter never picks a side) |     |                |                               |
| bomb (any direction field)                      | `block_saber:notes/bomb` (single)                                                                                                                                                                                                            |     |                |                               |

Format normalization (converter side): v2 `Type` 0→red, 1→blue, 3→bomb (`CutDirection` >8 or unknown → `dot`, unknown
type → `red_dot`, mirroring old clamping); v3 `colorNotes[].c` 0→red (`ColorLeft`), 1→blue (`ColorRight`), plus
`bombNotes`; v4 `colorNotesData[].c` 0→red, 1→blue, 2→white (see table), type 3→bomb. **Arcs: skipped.
Chains (v3 `c` continuation, v4 chain bits): expanded to
their constituent head-note as plain dots at the chain endpoint — DECISION (D5)** — a chain has no independent MC
strum model, and dots
preserve density; arcs carry a curved slash path with no MC analog, and the 1.18 converter had no arc data at all, so
skipping matches the shipped community status quo. (No engine function is ever added for arcs/chains.)
Engine spawn NBT (`active_effects`, `equipment`) is engine-internal; the song pack's contract stops at the function
name.

### 3.4 Walls — `<token>_walls_lvl_<n>.mcfunction`

2 commands per wall segment (old `_wallCommand`): teleport to wall center, then call one of the four
`block_saber:walls/*` functions. Example:

```mcfunction
execute if score @s curr_tick matches 353 at @e[type=marker,tag=bs_node_origin,limit=1] run teleport @e[type=marker,tag=bs_node_cursor,limit=1] ~-0.300000 ~0.300000 ~-0.126000
execute if score @s curr_tick matches 353 as @e[type=marker,tag=bs_node_cursor,limit=1] run function block_saber:walls/wall_2x1
```

Wall-shape mapping (port of `ObstacleDataToCommands`; `tall` = "must duck/stretch-under", `short` = "crouch wall"):

| width (note lanes) | v2 `_type` | v3/v4 `{w,h}` | emitted pieces (in order)                                                                       | y offset                          |
| ------------------ | ---------- | ------------- | ----------------------------------------------------------------------------------------------- | --------------------------------- |
| 1                  | 0 tall     | tall (below)  | `walls/wall_1x1` at `x=0.3×x0`                                                                  | `y=0.300000`                      |
| 1                  | 1 short    | short (below) | `walls/wall_1x3` at `x=0.3×x0`                                                                  | `y=0.600000`                      |
| 2                  | any        | `w:2`         | `walls/wall_2x1` at `x=0.3×x0`                                                                  | tall `0.300000`, short `0.600000` |
| 3                  | any        | `w:3`         | `walls/wall_2x1` at `x=0.3×x0` + `walls/wall_1x1` at `x=0.3×(x0+2)` (tall) / `wall_1x3` (short) | as above                          |
| 4                  | any        | `w:4`         | `walls/wall_2x1` at `x=0.3×x0` + `walls/wall_2x1` at `x=0.3×(x0+2)`                             | as above                          |
| ≥5 / unknown       | any        | `w≥5`         | clamp to the `w:4` rule                                                                         | as above                          |

Tall-vs-short on the normalized model (replacing the old `isHeightTall = _type == 0`, which cannot see bsmap's
normalized `{y,h}`): **`tall ⇔ y ≤ 1 && h ≥ 3`**, verified against bsmap's v2 mapping (`_type:0 → {y:0,h:5}`,
`_type:1 → {y:2,h:3}`) so v2 full-height walls stay tall, crouch walls stay short, genuine v3/v4 crouch walls float
(`y ≥ 2`) and pass-through walls (`h ≤ 1`) fall to the short rule (known v1 approximation — the old tool never saw
either). The two `y` constants are the exact
port of old `0.6 − 0.3×isHeightTall` relative to `bs_node_origin`. Which model geometry (`wall_1x1` = 1-block-high box,
`wall_1x3` = 3-blocks-high box, per the RP models) intersects a player at scale 1 / 1.5 (jump key) / 0.5 (sneak) is
engine M4c's hit-check logic — the song pack guarantees only the table above.
Duration: `_duration` (v2, beats) and `duration` (v3/v4) × 24 segments of `0.21 m`, each segment its own 2-command
group at `gameTick + trunc(i×0.21/metersPerTick)`; wall `z` fraction preserved per segment (B5). Walls with
`duration ≥ 16 beats` → hard error (§7).

### 3.5 Lights — `<token>_lights_lvl_<n>.mcfunction`

Port of `_eventOnOff`/`_eventColor` (2 commands per event), writing the ten §2.2 group fake players. Engine reads
them once per tick in `block_saber:lights/handle` (port of `handle_lights*`), renders particles, and never has to
know event formats. Color values: `0` off, `16` blue, `24` red (old quantization); `bs_light_on`: 0/1.

```mcfunction
execute if score @s curr_tick matches 47 run scoreboard players set #back_lasers bs_light_on 1
execute if score @s curr_tick matches 47 run scoreboard players set #back_lasers bs_light_color 24
```

Light event mapping — **DECISION (D6)** (which source events drive which fixture groups):

| engine group (`#…`)                      | v2 event `Type` | v3/v4 lightshow source array                                   | skipped / notes                                                             |
| ---------------------------------------- | --------------- | -------------------------------------------------------------- | --------------------------------------------------------------------------- |
| `back_lasers`                            | 0               | —                                                              | v3+ has no back-laser fixture; group idle for v3/v4 maps                    |
| `rings`                                  | 1               | `colorLeft` (red saber lights)                                 | v3 `colorRight` folds into `center` (below) — MC arena has one ring fixture |
| `rotating_left` / `rotating_right`       | 2 / 3           | `laserLeft` / `laserRight` (v3)                                |                                                                             |
| `center`                                 | 4               | `colorRight` (blue saber lights)                               |                                                                             |
| `boost`                                  | 5               | `specialLeft` (boost)                                          | gameplay "boost" has no MC effect → rendered as a light only                |
| `extra_left` / `extra_right`             | 6 / 7           | — / `specialRight`                                             |                                                                             |
| `side_lasers_left` / `side_lasers_right` | 10 / 11         | v4 tinted `laserLeft/Right` second channel — not modeled in v1 | v4 gradient/easing metadata ignored; first color only                       |
| (dropped)                                | 8, 9            | v3/v4 `white` laser arrays (v3.4+)                             | unused in BS itself / no fixture                                            |

Event **values** (port of `EventDataToCommands`) run through ONE v2-semantics decoder — `0`→off; `1,2`→on + color
(blue if the mapped array/group is the blue side else red per table); `3` **flash** → on at tick `T` +
converter-emitted explicit off at `T+40`; `4`→off; `5..11` → on (the value split collapses to the mapped color) —
but formats other than v2 must first be **normalized into that semantics by the converter**, because raw v3/v4
fields do not carry v2 type/value meanings. Normalization (amendment 2026-11-25, from M3):

- **v2:** `type`/`value` used as-is (the group table and decoder above).
- **v3:** the typed arrays (`colorLeft`, `colorRight`, `laserLeft`, `laserRight`, `specialLeft`, `specialRight`)
  map to groups per the D6 table; each event's color index is decoded by the same v2 value table (BSID value
  semantics unchanged).
- **v4:** lightshow **simple event arrays** are read directly — `colorLeft`/`colorRight`/`specialLeft`/
  `specialRight` inside `lightColorEventBoxGroups` and `simpleLaserEvents` inside `lightRotationEventBoxGroups` —
  never bsmap's synthesized `basicEvents`, whose `type`/`value` fields carry v4 enum values and light indices, not
  v2 semantics. The referenced `lightColorEvents[i].t` (v4 `LightshowType`) decodes as: On variants
  (`0,2,6,10,16,17`) → on; Fade/Boost variants (`5,9,13,14`) → on; Flash variants (`4,8,12`) → flash; Off
  variants (`1,3,7,11`) → off; `15` (Warmup) and unknown → skipped. Laser side comes from the rotation group's
  `indexFilter`: ids `0–11` → `rotating_left`, `12–23` → `rotating_right`, missing/covering both → emit to both.
  Color is never taken from `t` — it comes from the source array side (D6 table), same as v3.
- **v1 exclusions** (skipped, logged): Chroma/`customData`, v4 event **boxes** (gradients, easing, frequency,
  dyes/rotations), `indexFilter` subset semantics (a filtered group is treated as the whole group), v4 `white*`
  laser arrays (D6).

`bs_light_color` gets the mapped 16/24, `0` when off. Auto-off bookkeeping stays fully in the emitted commands
(engine is stateless here).

### 3.6 Bombs

No separate stream: bombs ride the notes files (§3.3) and call `block_saber:notes/bomb`. Hit-penalty logic is
engine-side (`check_bomb_collide` port).

### 3.7 Finish markers & pause hooks

Each stream's **last** level file ends with its done flag at `doneTick = lastCommandTickInFile + LEAD_TICKS + 1`
(port of `_finishedNotes/_finishedObstacles/_finishedEvents`):

```mcfunction
execute if score @s curr_tick matches 9417 run scoreboard players set #bs_notes bs_finished 1
```

Empty stream ⇒ a level file containing only its done flag at `LEAD_TICKS + 1` (so all three flags always fire; the
old code did the same with its empty-level stub). The engine declares the run complete when
`#bs_notes`, `#bs_walls`, `#bs_lights` are all 1 **and** no live notes remain, then writes
`bs_complete #<slug>_<token> = 1` and shows results — no per-song end function ships.

Pause/resume: audio cannot seek in vanilla. **DECISION (D8):** v1 pause = stop-and-quit only (matches today's pause
menu). Contract still defines optional hooks so v2 can add freeze-resume without a format bump: if
`<token>_pause.mcfunction` / `<token>_resume.mcfunction` exist, the engine calls them in player context around a
freeze; song packs MAY ship them (content: `stopsound @a music bsong_<slug>` / restart-with-sync-notice). The default
emitter does **not** ship them.

### 3.8 Command budget & file splitting

- Count: 2/note, 2/wall-segment-piece, 2/light-event (old `DataPack.cs` accounting minus the engine-side row-id score command).
- A level file holds ≤ `COMMAND_LIMIT = 10000` counted commands; a file is never split mid-note/wall/light (the
  whole event's commands move to the next file).
- Numbering `lvl_1, lvl_2, …` is per stream, ordered by tick; the dispatcher emits one range-gated call per level
  file. `probe/install/uninstall` and dispatchers are trivially small; no budget concerns.
- Largest expected: 10k-command file ≈ ~1.9 MB text worst case — zip + fflate handle it; no change to the limit.

---

## 4. `pack.mcmeta` + version handshake

### 4.1 Song datapack mcmeta

```json
{
  "pack": {
    "pack_format": 121.0,
    "min_format": 121.0,
    "max_format": 121.99,
    "description": "Block Saber song: Blueberry Dream by QooBee [bs_443f3a1b / song contract 1]"
  }
}
```

`pack.png`: map cover image **converted to a real PNG** (B1 fix — re-encode via OffscreenCanvas, never rename).
`max_format` held at `121.99` pending the M6 26.4 decision **PROPOSED (see §8)**.

### 4.2 Handshake (`BS_API_VERSION = 1`)

Two directions, both mandatory:

1. **Song pack checks engine** in `install.mcfunction` (§2.4 example): refuses when
   `execute unless score #CONST song_contract matches 1` or `unless function block_saber:notes/red_dot` fails —
   player sees a red chat line naming the missing base pack.
2. **Engine checks song pack** at difficulty-click, before any scene setup: read `data get entity <marker>
bs.contract` into a temp score; if ≠ `#CONST song_contract`, refuse and send (SNBT tellraw):

```mcfunction
tellraw @s [{text:"[BlockSaber] ",color:"red"},{text:"\"Blueberry Dream\" needs song contract 1 (this world runs ",color:"red"},{score:{name:"#CONST",objective:"song_contract"}},{text:"). Re-convert it at block-saber.web — old 1.18 packs are incompatible.",color:"red"}]
```

Version bump policy: any change to this document's §1–§6 numbering/format bumps `BS_API_VERSION`; the converter's
zip description + marker + mcmeta description all embed it so humans can spot mismatches too.

---

## 5. Songs resource pack ("Block Saber Songs")

One cumulative resource pack rebuilt by the site on every batch download (locked decision; `sounds.json` does not
merge — song datapacks and the base RP must never ship one).

```text
Block Saber Songs (resourcepack).zip
├── pack.mcmeta                  # pack_format 97.1, min 97.1, max 97.99, description "Block Saber Songs — <N> songs"
├── pack.png                     # static Block Saber logo (re-generated each build, deterministic)  DECISION (D10)
└── assets/
    └── bsong/
        ├── sounds.json
        └── sounds/
            ├── 443f3a1b.ogg
            └── 6a07c1d2.ogg
```

`assets/bsong/sounds.json` — exact entry shape (one key per installed song):

```json
{
  "bsong_443f3a1b": {
    "category": "music",
    "subtitle": "Blueberry Dream",
    "sounds": [{ "name": "bsong:443f3a1b", "stream": true, "volume": 1.0 }]
  }
}
```

- Sound event id = `bsong_<slug>` (referenced by `<token>_play` line 1 and marker `bs.sound`); file path
  `assets/bsong/sounds/<slug>.<ext>` (`name` omits folder `sounds/` and extension; `.egg` → treated/renamed as
  `.ogg` per M2).
- **DECISION (D4):** category `music` + `stream: true` (parity with the 1.18 converter; `record` would attenuate by
  distance). `playsound` in `§3.2` uses `music` accordingly.
- Slug-keyed files make rebuilds idempotent; the pack is never partially edited client-side — always rebuilt from
  the site's song list (M5 `emit-songs-resource-pack.ts`).
- Install path: `resourcepacks/` (told to the player next to the datapack `datapacks/` instructions).

---

## 6. Number formatting contract (B2 fix, emitter-wide)

| Quantity                              | Format                                      | Example                 |
| ------------------------------------- | ------------------------------------------- | ----------------------- |
| teleport/offset coordinates (`x,y,z`) | `toFixed(6)` invariant, trailing zeros kept | `0.300000`, `-0.126000` |
| ticks (`matches a..b`, flags)         | integer, no leading `+`                     | `9417`                  |
| scoreboard values                     | integer                                     | `24`                    |
| volume/pitch (`playsound`)            | `1` (literal)                               | `1`                     |

Invariant culture only: `.` decimal separator, no thousands separators, **no scientific notation ever** (no `1e-5`),
no locale commas. JS: `Number(v).toFixed(6)` / `Math.trunc(v).toString()`. The engine may `data`-parse these with
vanilla SNBT, which is locale-free — this section is purely a converter-side ban on the class of bugs that produced
`0,42` in Unity output.

---

## 7. Error & edge rules (emitter must encode these; hard = abort with ConversionError)

| Condition                                                 | Behavior                                                                                                                       |
| --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| difficulty has 0 notes AND 0 walls                        | omit from menu (`bs.diffs`), emit no files for it                                                                              |
| characteristic set empty / no `difficultyBeatmaps`        | hard `NoMapData` (port)                                                                                                        |
| duplicate exact (characteristic, difficulty) pair in Info | hard `DuplicateDifficulty` (new error enum entry; B3 guard)                                                                    |
| unknown characteristic                                    | §1.3 sanitize; token collides with another characteristic of the same song → hard `DuplicateDifficulty` with both names quoted |
| unknown note type/color beyond §3.3 clamps                | clamp per §3.3 (`red_dot`/`blue_dot`), never error                                                                             |
| unknown light event type / dropped type in §3.5 table     | silently skip, no command emitted                                                                                              |
| wall `width` ≥ 5                                          | clamp to §3.4 w:4 rule (never error)                                                                                           |
| wall `duration ≥ 16` beats                                | hard `WallTooLong` (segment explosion guard)                                                                                   |
| per-difficulty tick range exceeds `2^31` ticks            | hard `SongTooLong` (≥ ~3.5 years; belt-and-braces)                                                                             |
| `>COMMAND_LIMIT` in one stream                            | §3.8 split — never an error                                                                                                    |
| audio/cover file missing from zip                         | hard (M2 `ConversionError` ports)                                                                                              |
| `Info.dat` vs `info.dat`                                  | case-insensitive lookup everywhere (B6)                                                                                        |

---

## 8. Decisions register (owner-reviewed 2026-11-25)

| #   | Topic                                                        | Status           | Decision                                                                                                                                                                                                  | Owner sign-off                     |
| --- | ------------------------------------------------------------ | ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------- |
| D1  | Slug algorithm                                               | LOCKED           | sha1(BeatSaver key ∨ Info-hash) → 8 hex → `bs_<slug>`, grow on collision                                                                                                                                  | approved 2026-11-25                |
| D2  | Registration = manual `/function bs_<slug>:install` + marker | LOCKED           | as §2 (only tag-merge-safe mechanism)                                                                                                                                                                     | approved 2026-11-25                |
| D3  | Marker fixed position `0 5 0` + prune pass                   | LOCKED           | as §2.1                                                                                                                                                                                                   | approved 2026-11-25                |
| D4  | Audio category `music`, `stream:true`                        | LOCKED           | as §5                                                                                                                                                                                                     | approved 2026-11-25                |
| D5  | Arcs skipped; chains → dots                                  | LOCKED           | as §3.3                                                                                                                                                                                                   | approved 2026-11-25                |
| D6  | v3/v4 → light group mapping + skips                          | LOCKED (amended) | as §3.5 table + per-format value normalization amendment (2026-11-25, M3): v4 simple arrays + `LightshowType` decode, never bsmap `basicEvents`                                                           | approved with amendment 2026-11-25 |
| D7  | v4 white notes                                               | LOCKED (amended) | **dedicated white note**: `block_saber:notes/white_*` engine functions + white item model/texture in the base resource pack, judged hittable by **either** saber (engine M4b; emitter never picks a side) | approved with amendment 2026-11-25 |
| D8  | Pause = stop-only in v1; `_pause`/`_resume` hooks optional   | LOCKED           | §3.7                                                                                                                                                                                                      | approved 2026-11-25                |
| D9  | Menu song order unsorted in v1                               | LOCKED           | §2.3, sort later                                                                                                                                                                                          | approved 2026-11-25                |
| D10 | Songs-RP `pack.png` = static logo                            | LOCKED           | §5                                                                                                                                                                                                        | approved 2026-11-25                |
| D11 | `max_format: 121.99`                                         | PROPOSED         | hold until 26.4 stable (M6 re-raises at datapack 126.0)                                                                                                                                                   | deferred to M6                     |
| D12 | Hit detection stays magma-cube (not `interaction`) in v1     | PROPOSED         | keeps the proven 1.18 mechanics under 26.3; the white-note either-saber judgment (§3.3) rides on top of it; revisit in M4b with playtest gate                                                             | deferred to M4b                    |

Everything else in this document is locked; changes require editing this file and bumping `BS_API_VERSION`.
