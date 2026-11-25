# Unity converter reference (frozen)

Verbatim copies of the relevant sources from the original Unity converter app, [MrJohnWeez/Block_Saber_Generator](https://github.com/MrJohnWeez/Block_Saber_Generator) at commit `1ca97e0` (2022-04-24, the last commit). All `.meta` files were stripped. This tree is a read-only port reference for the TypeScript rewrite — never edit it, and keep formatters and linters out of it.

## Layout

- `scripts/Minecraft/` — `ConvertZip.cs` (orchestration), `Generator/DataPack.cs` (tick-command generation, the biggest port target), `Generator/ResourcePack.cs`, `Generator/DataPackData.cs`, `Globals.cs` (constants, note/wall type tables), `TemplateStrings.cs`, `Filemanagement.cs`.
- `scripts/Conversion/` — `ConversionError.cs` (error enum to mirror in TS), `ConversionObject.cs`, `ConversionProgress.cs`.
- `scripts/Managers/ProcessManager.cs` — the 3-concurrent conversion queue the Web Worker pool mirrors.
- `plugins/BeatSaber/` — v2-era map format classes (`Data/Info.cs`, `Data/Note.cs`, `Data/Obstacle.cs`, …). Superseded by the `bsmap` library; kept to see what the C# parser expected.
- `plugins/Utilities/StringExtensions.cs` — `MakeMinecraftSafe`, the namespace slug rules to port.
- `templates/TemplateDatapack/` — the 1.18.2 game engine templates (`_root_class` engine logic, `_types` note/wall/bomb functions, `folder_uuid` per-map template). Source material for porting the engine into `game/template-world/datapacks/BlockSaber`.
- `templates/TemplateResourcepack/` — matching 1.18.2 resource pack (item overrides, textures, sounds). Historical reference; the modern resource pack lives in `game/template-world/BlockSaberResourcepack`.
- `templates/TemplateStrings.json` — the command templates `DataPack.cs` string-formats. The new equivalents are written against the song-pack contract (`docs/song-pack-contract.md`), not copied verbatim.

## Known bugs already present in this code

Do not faithfully port these (see the master plan's bug table): covers only renamed not converted, culture-dependent number formatting, difficulty-only output filenames, BPM/offset ignored in timing, obstacle duration truncated to int, case-sensitive `info.dat` lookup.
