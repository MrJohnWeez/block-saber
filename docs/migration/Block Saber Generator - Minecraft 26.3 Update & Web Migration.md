# Block Saber Generator: Minecraft 26.3 Update & Web Migration

Nov 17, 2026 · @John

## Summary

Both goals are feasible: the converter can target Minecraft Java 26.3, and the whole tool can move from Unity to the browser. Because the port is a full rewrite, the Minecraft update is cheapest done inside it rather than as a separate job.

Every feature carries over except two. The "open output folder" button can't exist in a browser. The remembered output folder works only in Chromium browsers; Firefox and Safari save each pack as a normal download.

The more urgent problem is on the Beat Saber side: the converter can't read most maps made in the last few years, because it only understands the v2 map format.

## What's in the repo today

The real conversion logic is about 1,500 lines of C#, and it ports to TypeScript almost line for line.

| Part | Size | Notes |
| --- | --- | --- |
| Unity app | ~3,300 lines of C#, Unity 2021.3 | Last updated April 2022 |
| Conversion logic | ~1,500 lines | Mainly `DataPack.cs`, `ResourcePack.cs`, `ConvertZip.cs`, `MapLoader.cs` and the map data classes |
| Platform glue | the rest | File wrappers with retries, a Windows drive-mapping workaround for long paths, native file picker, Windows-only drag-and-drop hook, UI. None of it is needed in a browser. |
| Minecraft templates | 83 `.mcfunction` files (1,445 lines) + `TemplateStrings.json` | Plus a resource pack with item models, textures and sounds. Targets 1.18.2 (data pack format 9, resource pack format 8). |

How a song becomes a pack: the converter copies the templates, swaps in the song's details, writes one block of commands per game tick for notes, walls and lights, then zips everything up. That logic is plain string-building.

## Part 1: Updating to Minecraft Java 26.3

Target Java 26.3 "Wilderness Bound" (released 2026-09-15): data pack format 121.0, resource pack format 97.1 ([Craftdex](https://craftdex.net/updates/wilderness-bound), [Cybrancee](https://cybrancee.com/blog/minecraft-26-3-the-new-wilderness-bound/)). 26.4 is in snapshots at data pack 126.0 / resource pack 102.0 ([Releasebot](https://releasebot.io/updates/minecraft)).

| Change | Since | Where it hits the repo |
| --- | --- | --- |
| `pack.mcmeta` needs `min_format` and `max_format` | 1.21.9 | Both template `pack.mcmeta` files ([format notes](https://www.convertmcpack.net/pages/mcmeta_template.html)) |
| Folders renamed to singular: `functions` → `function`, `tags/functions` → `tags/function`, `structures` → `structure` | 1.21 | Hardcoded in `Globals.cs` and the template tree ([MC-274484](https://mojira.dev/MC-274484)) |
| Item components replace item NBT | 1.20.5 | `Count:` / `tag:{...}` 39 times in 28 files; `display:{Name}`, `HideFlags`, `CanPlaceOn`, `Enchantments` (glint) |
| Item model definitions in `assets/<ns>/items/` | 1.21.4 | The three `overrides` models (stick, name_tag, spectral_arrow) stop rendering, so notes, walls and sabers go invisible ([items model definition](https://wiki.ronlab.site/content/minecraftwiki_en_all_maxi_2025-11/Item_model)) |
| `ActiveEffects` → `active_effects`, string IDs | 1.20.2 | 19 files (every note's magma cube) |
| `ArmorItems` → `equipment` | 1.21.5 | 24 places (every note and wall armor stand) |
| Text components are SNBT, not JSON; `clickEvent` → `click_event`, `hoverEvent` → `hover_event` | 1.21.5 | 21 click/hover events in the menus, ~138 `CustomName` strings, `_difficultyChat` and `_mainMenuBack` templates ([MC-279229](https://mojira.dev/MC-279229), [FAWE #3179](https://github.com/IntellectualSites/FastAsyncWorldEdit/issues/3179)) |
| Sign NBT `Text1` → `front_text.messages` | 1.20 | Combo and multiplier displays copy a score into an entity name through a sign |
| Item checks via `nbt={Item:{tag:{display:{Name:...}}}}` | 1.20.5 | 6 places (saber and menu item pickup) |
| Old GUI textures (`icons.png`, `widgets.png`) and `unicode_page_20.png` no longer used | 1.20 / 1.20.2 | Silently ignored now (from memory; confirm in-game) |

What survives: scoreboards, `execute`, markers, the music/End-dimension trick, particles and sounds. The game logic (ticks, rows, lights) doesn't need redesigning; most of the work is syntax, then in-game testing. Hit detection is the riskiest part, since it depends on damaging magma cubes.

Optional while rewriting note spawns: item/text display entities for smoother movement, interaction entities for cleaner hit detection, and 1.21.6 dialogs for the song menu. None of this is required for 26.3.

## Part 2: Beat Saber map formats

The parser only reads v2 maps, so v3 and v4 maps (the editor defaults for years) fail to convert. It uses Unity's `JsonUtility` with v2 field names (`_notes`, `_songFilename`, …).

| Format | What happens today | Why |
| --- | --- | --- |
| v2 | Converts | Matches the C# field names |
| v3 | Fails with "no map data" | Note arrays parse as empty (`colorNotes`, `bombNotes`, `obstacles` use short keys) |
| v4 | Fails earlier, as an invalid beat map | Metadata moved into `song` and `audio` objects, beatmap sets became a flat `difficultyBeatmaps` array, and lighting lives in a separate Lightshow file ([BSMG Info.dat](https://bsmg.wiki/mapping/map-format/info.html)) |

The new parser needs to read v2, v3 and v4, load v4's separate lightshow files, and decide what chains and arcs become (dot notes, or skipped). [bsmap](https://jsr.io/@kvl/bsmap/3.0.0/README.md) is a TypeScript library that converts between all the schemas; check whether its parsing runs in a browser without filesystem access.

## Part 3: Moving to the web

One feature is lost, one works only in Chromium, two get better, and the rest carry over as is.

| Current feature | Web version | Parity |
| --- | --- | --- |
| Pick map zips in a file dialog | `<input type="file" multiple accept=".zip">` | Full |
| Drag and drop (Windows-only today) | Standard browser drag and drop | Better: every OS |
| Unzip / zip (LightBuzz) | fflate or JSZip | Full |
| `.egg` → `.ogg` | Same rename; no transcoding | Full |
| Cover `.jpg` → `pack.png` | Real conversion through a canvas | Better (see bugs) |
| Queue of 3 conversions, progress, cancel/delete | Web Worker pool with cancel support | Full |
| Error messages (missing info, song, invalid zip…) | Same error enum | Full |
| Choose and remember an output folder | File System Access API, folder handle saved in IndexedDB; downloads elsewhere | Chromium only |
| "Open output folder" button | Not possible in a browser | Lost |

A Unity WebGL build isn't a good shortcut: the file picker, the drag-and-drop hook and `Task.Run` threading all fail or degrade there. Porting ~1,500 lines of string-building is less work.

The port fits the existing Preact/TypeScript/esbuild and Cloudflare setup as a fully static page: ~3.6 MB of templates in R2, all processing in the browser, no server cost.

## Bugs in the current tool

Six existing bugs should be fixed during the port, whichever order the work takes.

- **Covers aren't converted.** The "jpg → png" step only renames the file, so `pack.png` is really a JPEG.
- **Possible broken output on some locales.** Numbers use the system culture (no `InvariantCulture` anywhere), so German or French Windows likely writes `0,42` and breaks every `teleport` command.
- **Characteristics collide.** Files are named by difficulty only, so Standard Expert and Lawless Expert both write into `expert.mcfunction`.
- **Timing ignores BPM changes and song time offset**, so tempo-changing songs drift out of sync.
- **Wall length is truncated.** Obstacle `_duration` is an `int`, but v2 uses fractional beats.
- **Linux/macOS can't find `info.dat`.** The lookup is case-sensitive and v4 requires `Info.dat`; match file names case-insensitively.

## Suggested order of work

Port first, then parser, then templates, so each step can be checked on its own.

- [ ] **Port the logic to TypeScript, still producing 1.18.2 packs.** Fix the random IDs to known values and diff output against the Unity build for each map in `UnitTestFiles/`.
- [ ] **Add the v2/v3/v4 map parser** and fix the six bugs above.
- [ ] **Rewrite the templates for 26.3** and play-test, especially hit detection.
- [ ] **Set `max_format`:** keep it at 121, or raise it and re-test against 26.4 when it releases.
- [ ] **Warn users about mixing versions:** each song pack ships its own copy of the shared `_root_class` and `_types` namespaces, so old 1.18 and new song packs shouldn't share a world.

## Sources

- [Block_Saber_Generator repo](https://github.com/MrJohnWeez/Block_Saber_Generator) (code and template counts)
- [Minecraft Java 26.3 release (Craftdex)](https://craftdex.net/updates/wilderness-bound)
- [26.3 pack formats (Cybrancee)](https://cybrancee.com/blog/minecraft-26-3-the-new-wilderness-bound/)
- [26.4 Snapshot 7 (Releasebot)](https://releasebot.io/updates/minecraft)
- [pack.mcmeta min/max format](https://www.convertmcpack.net/pages/mcmeta_template.html)
- [1.21 folder rename (MC-274484)](https://mojira.dev/MC-274484)
- [Items model definition](https://wiki.ronlab.site/content/minecraftwiki_en_all_maxi_2025-11/Item_model)
- [1.21.5 SNBT text components (MC-279229)](https://mojira.dev/MC-279229)
- [1.21.5 click_event/hover_event (FAWE #3179)](https://github.com/IntellectualSites/FastAsyncWorldEdit/issues/3179)
- [BSMG Info.dat format](https://bsmg.wiki/mapping/map-format/info.html)
- [bsmap TypeScript library](https://jsr.io/@kvl/bsmap/3.0.0/README.md)
