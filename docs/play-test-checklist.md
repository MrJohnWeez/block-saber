# Play-test checklist (M4 sub-step gates)

Run each section in a fresh copy of `game/template-world/` after the sub-step it gates. Reproduce with
`npm run unzip-world` or by copying the folder into `saves/`. Record pass/fail + MC version in the plan file's Status
Log line for the sub-step. Failing sections block the next sub-step from starting.

## M4a — note spawn + movement (no judgment yet)

- [ ] `/function block_saber:init` runs clean (no red chat, no errors in F3 logs); `uninstall` then `init` twice is idempotent.
- [ ] Note-cube summon keys audited against the 26.3 entity format (2026-11-25): `Team`, `NoGravity`, `Silent`, `NoAI`, `DeathLootTable`, `DeathTime`, `PersistenceRequired`, `Size` are still PascalCase; only `active_effects`/`equipment`/`fall_distance`/`drop_chances` were renamed — do not "modernize" the others. Watch first spawn for silent team/size failures.
- [ ] Install a converted `syn-v2-basic` song pack: `/reload` → the song **auto-registers** (record appears in the registry within a couple of ticks, no command run — check with `/data get storage bs:songs order` + `/data get storage bs:songs <slug>`; 26.3 storage registry per §2.1 amendment — there is no marker any more); `/function bs_<slug>:install` still works as the manual fresh-install path (green chat line).
- [ ] Drop-menu bring-up: menu items arrive in the inventory on world start, on late join, and after death without keepInventory (tick self-heal, ≤1 tick); dropping any item on the song browser selects **that** song (regression: the per-slot scan once read NBT `Slot:0b–26b`, but menu items live in `inventory.0–26` = `Slot:9b–35b`, so every drop landed on slot 0 = back).
- [ ] Start the song from the inventory menu: music starts at the expected tick; notes spawn from the origin line and travel toward the player in the correct lanes/heights.
- [ ] Cut direction models visible and distinct for up/down/left/right/diagonal/dot, red vs blue; white note (syn-v4-basic) renders with the white model. Visuals are billboard-centered display entities rolled by `transformation` quaternions (entity `Rotation` is ignored under billboard); if directions read mirrored (up/right swapped etc.), negate the third quaternion component in all 24 directional `function/notes/*.mcfunction` display lines; if they're off by a fixed 45°, rotate the angle table. Arrow glyph lives on the model's north face — if arrows render with a blank side toward the player, flip faces by composing each quaternion with a 180° roll about the view axis (`[0.0f,0.0f,1.0f,0.0f]`).
- [ ] Notes reach the player plane in sync with a metronome-plain section (head-check on first 8 notes).
- [ ] Notes despawn behind the player without lag spikes or stray particles; `/kill @e[tag=blocksaber,tag=!bs_song]` during play does not error the loop.

## M4b — hit detection + white either-saber

- [ ] Red note with red saber → correct-point feedback; blue saber → wrong-point (per old behavior).
- [ ] Same for blue note/saber. All 9 cut directions judged correctly at least once.
- [ ] WHITE note: hit by red saber ✓, by blue saber ✓, both count correct once only (no double score).
- [ ] Bomb: passing through with any saber → penalty; avoiding → nothing.
- [ ] Missed note behind player → miss feedback once, no ghost re-triggers.
- [ ] Score/combo/multiplier tick up like the 1.18 tool on a known song (DifficultyTestSong): compare total score on full combo.

## M4c — walls

- [ ] Each of wall_1x1/1x3/2x1/2x3 (RedWallTest + synthetics) renders at the right height; standing/crouching/jumping pass/fail matrix matches old tool behavior.
- [ ] Fractional-duration walls (syn-v3-basic) hit for their full duration, not truncated (B5).
- [ ] Wide walls (width 2–4, clamped ≥5) block the correct lanes.
- [ ] **Crouch/short-wall band coverage now exists** (`syn-v3-walls.zip`, golden snapshot `bs_b58b8d06`): verify in-world the short band (anchor `~+0.3 ~+0.6` → `wall_1x3`) classifies as crouch-to-clear, the tall boundary (`y≤1 ∧ h≥3`, beat 64) as stand-block, and the width matrix incl. the w5≡w4 clamp and fractional-duration tails (beats 60–82).
- [ ] **Crouch-vs-jump collapse (v1 known approximation):** a Beat Saber jump-over strip (`y:0, h:1`) and a crouch wall (`y:2, h:3`) both emit the same short `wall_1x3` piece at the same anchor — the band model is binary. Play it: does jumping ever read as the correct dodge for strips that should be jumped? If the feel is wrong, the fix is a contract amendment (third band + piece), not a fixture change.
- [ ] Confirm the player stands at `game_origin` Y during play — the whole height model is origin-relative; also check `set_player_height`'s sneak-over-jump branch order matches the intended dodge bands (+0.0/+0.3/+0.6).
- [ ] **Full environment builds in a stock world** (regression 2026-11-27: a never-firing `distance=3..` guard meant the scene build — and with it the `place template` arena loads — never ran, so notes/walls converged on bare terrain in silence; second regression the same day: building in the teleport's own tick hit "That position is not loaded" in fresh worlds and players fell into the void): first song start teleports to the End (0 151 500, feet on the template's own black-concrete floor at Y150) and `build_stage_tick` lands the three 48³ `default_environment*` templates with light fixtures once `if loaded` passes; no errors from the DataVersion-2975 files.
- [ ] **Gamemode round-trip** (regression: `stop` used to force `gamemode creative`): start a run from survival → adventure during play → survival restored after clear/fail/stop; a never-played player defaults to adventure.
- [ ] **Note track follows the anchor** (regression: `spawn_begin` wrote absolute `Pos[2] = -lead_m × 1e-6`, collapsing the spawn origin onto absolute Z≈0 — invisible notes + phantom misses killed the run): with the End anchor, `bs_node_origin` sits ~`lead_m` blocks at NEGATIVE Z from `game_origin` (e.g. Z=480 for lead 20) and `data get entity @e[tag=bs_node_origin,limit=1] Pos` reads `[0d, 152.2d, 480.0d]`-style values near the stage.
- [ ] **Note and wall visuals render** (regression 2026-11-27: the base pack summoned displays with an `item_stack:` NBT key — 26.3 silently ignores it and the display item field is plain `item` in flattened `{id,count,components}` form, so every note and wall was an empty invisible display while judging ran on): `data get entity @e[type=minecraft:item_display,tag=bs_note_visual,limit=1] item` returns the `blocksaber:*` `item_model` component during a run, and arrows/walls/bombs are visibly flying down the runway.
- [ ] **Music starts audibly** (regression 2026-11-27: the converter baked the `playsound` origin at `0 0 0` while the run stands 500 blocks up in the End — outside the volume-1 radius, so total silence): the dispatcher's line-1 `playsound … music @a 0.0 150.0 500.0 1 1` fires at `curr_tick == LEAD_TICKS` and the track is audible from the stage.
- [ ] `x−0.3` wide-wall sample offset: does a safe pocket appear beside 2-wide walls in play? (faithful-to-old quirk; fix = `~-0.3`→`~+0.3` in both `wall_check_*_wide.mcfunction` if the owner calls it).

## M4d — scoring display + completion

- [ ] Combo/multiplier displays update without sign/entity name truncation; no `§`-junk.
- [ ] Song end: done-flags fire, results appear, `bs_complete` entry set; re-play same song resets cleanly.
- [ ] Empty-difficulty songs end without hanging (empty-stream stubs).
- [ ] Display positions: five `text_display`s at old armor-stand coords +0.5 y (nameplate-to-center transform) — calibrate heights vs the M4a `~2.2` origin constant; combo/multiplier values render **live from score components** — if they ever show stale/frozen numbers, switch to the change-detected `data modify entity … text` fallback noted in `song/score/displays_spawn.mcfunction`.
- [ ] Fail path: drain health (miss ~6 notes) → `LEVEL FAILED` chat+actionbar, run stops, **no `bs_complete` written**; multiplier growth feel (full pool ×2/tick up to 8) and the godmode-health-only quirk (GodMode keeps score/combo penalties).
- [ ] Wall penalty feel: once-per-piece (−2 HP per piece, not old per-tick drain) — joint M4c/M4d call on whether long walls bite enough.

## M4e — lights

- [ ] Light groups animate on a lightshow-rich map (bsmg v3 sample / real v4 map): rings, rotating lasers, center, boost visible.
- [ ] Lightshow toggle setting cuts lights to zero cost without desync.
- [ ] Flash events (value 3) flash then turn off ~2 s later (T+40), not stuck on.

## M4f — song menu lifecycle

- [ ] Two songs installed → both listed in `bs:songs order` install order and on the browser page; two-characteristics song shows separate Expert entries (Standard + Lawless).
- [ ] **Difficulty page renders one item per record `diffs[]` entry** (regression 26.3: the diff walk's macro args are `{i, slot}` in `diff_ctx` — a `$(slot)` the caller never seeded made the whole walk fail instantiation and the page showed ZERO difficulties in silence; also the walk must start at 0-based `win_lo - 1` or the first difficulty is skipped). Dropping one plays that exact difficulty.
- [ ] **NBT read-outs render** (regression 26.3: chat-component content keys are exclusive — `{text:"",nbt:…,storage:…}` in one object shows nothing; "Selected Song:" once printed without the title): song title in the selection tellraw and the results/fail lines must show real strings — and print them **without quotes** (`interpret:true`; `plain:true` only strips styling, the quotes come from the tag visitor).
- [ ] **Song audio plays** (regression: `assets/bsong/sounds.json` registered the event as `bsong:bsong_<slug>` while the play function calls bare `bsong_<slug>` — client warned `Unable to play unknown soundEvent` and every song was silent; the registry now lives in `assets/minecraft/sounds.json`).
- [ ] **Note arrows are rotated** (regression 26.3: display `transformation` needs all four keys; rotation-only compounds logged `Serialization errors: … No key scale` per spawn and spawned unrotated).
- [ ] Removing a song's datapack + `/reload` → the prune rotation (one `bs:songs order` entry per tick after load) drops its record and order entry within a few ticks; no chat spam for other songs. Regression (26.3): a song whose `probe.mcfunction` is comment-only (no `return 1`) gets pruned **while installed** — the whole liveness check rides on `if function` executing the probe and requiring a nonzero result.
- [ ] Headless bring-up: with zero players online (server console `/reload`), song packs still register — the tick drain has no player gate; queue entry, `bs:songs` record, and order entry all appear before anyone joins.
- [ ] `uninstall` of a song pack cleans its `bs:songs` record + order entry + completion scores (plus the legacy marker for pre-storage installs); base `uninstall` leaves a vanilla-legal world (also wipes `bs:songs`, `reg_*`, `prune_*`).
- [ ] Cross-version guard: installing an old-format pack or playing a song whose `bs:songs <slug>` record carries `contract ≠ #CONST song_contract` shows the red refusal line. The play-file existence guard is gone on 26.3 (`if function` can't guard side-effecting targets) — the record + contract check is the whole gate, so a hand-corrupted pack half-errors mid-play as understood v1 behavior.
- [ ] **First true end-to-end playthrough**: menu → song → difficulty → teleport/scene, music starts from the dispatcher at tick 39 (category `music` — song follows the Music volume slider), notes move at the record's `mpt_millionths`/`lead_m`, results screen shows real title/artist/diff, Stop/main-menu exits leave no stale `bs:engine play`.
- [ ] Drop-click feel: one drop = one action; verify picking an item up (instead of dropping) behaves acceptably (both remove the slot's item — detection can't tell them apart); filler-pane drops just re-render.
- [ ] Settings toggles round-trip both ways with correct ON/OFF labels (regression: the old `*= -1` flip froze god mode at 0 and made the lightshow button vanish at −1) and apply live mid-run.
- [ ] Pagination: with 25+ song packs installed, page forward, then pick a song from page 2 — difficulty page must show its entries (regression: song/difficulty pages once shared the page cursor).
- [ ] Refusal after mid-run song-pack removal (registry record pruned on the next reload) is loud, and the run's dispatcher failing until the player quits is understood as v1 behavior.

## M6 — end-to-end

- [ ] Full run of every fixture through the live site → install → play in 26.3.
- [ ] BPM-change song (syn-v3-bpm + a real variable-BPM map) stays in sync start to end (offset sign calibration flag from M2 resolved here — flip in `tick-table.ts` if inverted).
- [ ] 100+ note-density file splitting: no file exceeds 10k commands; no mid-note splits.
- [ ] `pack.mcmeta` warnings absent in datapack list; song packs show cover PNG (real PNG, not renamed JPEG — B1).
