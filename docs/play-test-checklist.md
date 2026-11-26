# Play-test checklist (M4 sub-step gates)

Run each section in a fresh copy of `game/template-world/` after the sub-step it gates. Reproduce with
`npm run unzip-world` or by copying the folder into `saves/`. Record pass/fail + MC version in the plan file's Status
Log line for the sub-step. Failing sections block the next sub-step from starting.

## M4a — note spawn + movement (no judgment yet)

- [ ] `/function block_saber:init` runs clean (no red chat, no errors in F3 logs); `uninstall` then `init` twice is idempotent.
- [ ] Install a converted `syn-v2-basic` song pack: `/reload`, `/function bs_<slug>:install`, chat shows the green install line; one song marker visible via `/data get entity @e[tag=bs_song,limit=1] bs`.
- [ ] Start the song from the inventory menu: music starts at the expected tick; notes spawn from the origin line and travel toward the player in the correct lanes/heights.
- [ ] Cut direction models visible and distinct for up/down/left/right/diagonal/dot, red vs blue; white note (syn-v4-basic) renders with the white model.
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

## M4d — scoring display + completion

- [ ] Combo/multiplier displays update without sign/entity name truncation; no `§`-junk.
- [ ] Song end: done-flags fire, results appear, `bs_complete` entry set; re-play same song resets cleanly.
- [ ] Empty-difficulty songs end without hanging (empty-stream stubs).

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
