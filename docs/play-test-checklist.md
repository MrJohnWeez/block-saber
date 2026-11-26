# Play-test checklist (M4 sub-step gates)

Run each section in a fresh copy of `game/template-world/` after the sub-step it gates. Reproduce with
`npm run unzip-world` or by copying the folder into `saves/`. Record pass/fail + MC version in the plan file's Status
Log line for the sub-step. Failing sections block the next sub-step from starting.

## M4a — note spawn + movement (no judgment yet)

- [ ] `/function block_saber:init` runs clean (no red chat, no errors in F3 logs); `uninstall` then `init` twice is idempotent.
- [ ] Note-cube summon keys audited against the 26.3 entity format (2026-11-25): `Team`, `NoGravity`, `Silent`, `NoAI`, `DeathLootTable`, `DeathTime`, `PersistenceRequired`, `Size` are still PascalCase; only `active_effects`/`equipment`/`fall_distance`/`drop_chances` were renamed — do not "modernize" the others. Watch first spawn for silent team/size failures.
- [ ] Install a converted `syn-v2-basic` song pack: `/reload`, `/function bs_<slug>:install`, chat shows the green install line; one song marker visible via `/data get entity @e[tag=bs_song,limit=1] bs`.
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
- [ ] **Crouch/short-wall band has ZERO fixture coverage** (snapshots emit no `wall_1x3`/short pieces) — build a hand-made crouch-wall test map and verify short-band classification (anchor Y +0.6 off `bs_node_origin`) and the stand-through/jump-hit/sneak-clear matrix.
- [ ] Confirm the player stands at `game_origin` Y during play — the whole height model is origin-relative; also check `set_player_height`'s sneak-over-jump branch order matches the intended dodge bands (+0.0/+0.3/+0.6).
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

- [ ] Two songs installed → both listed; two-characteristics song shows separate Expert entries (Standard + Lawless).
- [ ] Removing a song's datapack + `/reload` → its menu entry disappears within a tick (prune pass); no chat spam for other songs.
- [ ] `uninstall` of a song pack cleans marker + scores; base `uninstall` leaves a vanilla-legal world.
- [ ] Cross-version guard: installing an old-format pack or playing a marker with `bs.contract ≠ #CONST song_contract` shows the red refusal line.

## M6 — end-to-end

- [ ] Full run of every fixture through the live site → install → play in 26.3.
- [ ] BPM-change song (syn-v3-bpm + a real variable-BPM map) stays in sync start to end (offset sign calibration flag from M2 resolved here — flip in `tick-table.ts` if inverted).
- [ ] 100+ note-density file splitting: no file exceeds 10k commands; no mid-note splits.
- [ ] `pack.mcmeta` warnings absent in datapack list; song packs show cover PNG (real PNG, not renamed JPEG — B1).
