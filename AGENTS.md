# AGENTS.md

Block Saber: a Minecraft datapack rhythm game plus the website that converts Beatsaber maps into datapacks. Hand-written HTML, one stylesheet, one esbuild-bundled TypeScript entry, all built into `dist/`. No site is deployed yet; the dev server is the only runner.

## Commands

- `npm run dev` — build once, then serve `dist/` on <http://127.0.0.1:5000> with esbuild and `public/` copy watchers
- `npm run build` — wipe and rebuild `dist/` (minified JS and CSS, plus `dist/downloads/template-world.zip` and the
  base datapack/resource pack zips from `game/template-world/`)
- `npm run typecheck` and `npm run lint` (`lint:fix`) — run both before finishing a change
- `npm run lint:css` and `npm run lint:html` — Stylelint and html-validate over `public/`
- `npm run unzip-world` — extract zips in `worlds/` into the local Minecraft `saves` folder
- No test framework is set up; verify changes in the dev server.

## Layout

- `public/` — the whole site as shipped: `index.html`, `css/styles.css`, `media/`; copied verbatim to `dist/` by the build.
- `src/main.ts` — the site's only script; it wires the Beatsaber map drop zone with `addEventListener`, never with inline handlers.
- `dev/serve.mjs` — static dev server for `dist/` on port 5000; rejects paths outside `dist/`, no hot reload.
- `dev/zip-world.mjs` — zips `game/template-world/` into `dist/downloads/template-world.zip` during the build.
- `dev/zip-base-packs.mjs` — zips the base datapack and resource pack from `game/template-world/` into
  `dist/downloads/block-saber-base-{datapack,resourcepack}.zip` for the site's download links.
- `dev/unzip-world.mjs` — installs world zips from `worlds/` into `%APPDATA%\.minecraft\saves` on Windows, `~/.minecraft/saves` elsewhere.
- `dev/make-fixtures.mjs` — regenerates the synthetic Beat Saber test zips into `test-data/synthetic/` (git-ignored).
- `game/template-world/` — the actual game: level data, `datapacks/BlockSaber/` (mcfunctions, predicates, structures) and `BlockSaberResourcepack/` (models, textures, sounds). Git LFS for the pngs and oggs.
- `reference/unity-converter/` — frozen C# sources and 1.18.2 templates vendored from the old `Block_Saber_Generator` repo as the port reference for the TypeScript converter; read-only, excluded from lint and formatting.
- `test-data/` — committed Beat Saber fixture zips in `maps/` (see its README for provenance), synthetic ones generated into `synthetic/`.
- `docs/migration/` — the exported research packet (plan report + CSVs) behind the web migration; read-only reference.
- `assets/` — GIMP `.xcf` texture sources and app icons; input to the game's assets, never deployed.
- `dist/` — generated and git-ignored; never edit or commit it.

## Conventions

- Prettier is the formatter: 2 spaces, single quotes, semicolons, 120 columns, LF endings, final newline. Never run `prettier --write` on files under `game/`, `assets/`, `reference/`, `test-data/maps/`, or `docs/migration/`.
- TypeScript is strict (`tsconfig.json`, DOM lib). Avoid `any`, give exported functions explicit return types and JSDoc.
- Every comment is exactly one sentence. Comments wrap at 120 columns; `eslint-plugin-comment-length` rewraps them on `lint:fix`.
- Constants never get comments; put the detail in the name instead.
- Prefer named exports; keep files kebab-case.
- `console.log` is an ESLint error in `src/` and any future app code; only `console.warn` and `console.error` are allowed. `dev/*.mjs` scripts may log freely.
- The browser code attaches behavior through `addEventListener` in `src/main.ts`; HTML carries no inline `on*` handlers.
- Styling lives entirely in `public/css/styles.css`. Use the `:root` design tokens (they hold `light-dark(...)` pairs) rather than literal colors or sizes, keep class names kebab-case, and space siblings with parent `gap`, not child margins.
- Page paths in HTML are relative to `index.html` so the built site works from any base URL.
- Minecraft content keeps Minecraft's own naming (snake_case functions, `pack.mcmeta`), so the Prettier and naming conventions above stop at `game/` and `assets/`.
- Game binaries: PNG and OGG are Git LFS (see `.gitattributes`); `.xcf`, `.nbt`, `.mca` and `.dat` stay plain. Don't add LFS patterns without adding matching files or migrating them properly.
