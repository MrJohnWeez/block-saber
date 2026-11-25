# Block Saber

A Minecraft rhythm game built entirely with datapacks and a resource pack, plus the website that converts Beatsaber map files into playable Block Saber datapacks.

The playable content lives in `game/template-world/`: a template world with the Block Saber datapack and resource pack baked in. The website source lives in `public/` and `src/` and is bundled into `dist/`.

## Tech Stack

| Area       | Choice                                                        |
| ---------- | ------------------------------------------------------------- |
| Game logic | Minecraft datapack (`.mcfunction`) and resource pack          |
| Website    | Hand-written HTML, one stylesheet, one TypeScript entry point |
| Bundler    | esbuild (single `dist/main.js`, minified CSS)                 |
| Dev server | Small Node static server with watch mode                      |
| Media      | PNG textures and OGG sounds, tracked in Git LFS               |
| Tooling    | Prettier, ESLint, Stylelint, html-validate, TypeScript        |

## Dev Setup

1. Install [Node.js](https://nodejs.org/en/download).
2. Install [Git LFS](https://git-lfs.com/) so textures and sounds are checked out instead of pointer files.
3. Clone the repo.
4. Run `npm ci`.

## Run Dev

```bash
npm run dev
```

This builds the site into `dist/`, serves it at <http://127.0.0.1:5000>, and keeps rebundling JavaScript and recopying `public/` in watch mode while a browser tab is open.

## Scripts

| Script                | Purpose                                                       |
| --------------------- | ------------------------------------------------------------- |
| `npm run dev`         | Build once, then serve `dist/` with watchers                  |
| `npm run build`       | Build the site into `dist/`, including the template world zip |
| `npm run typecheck`   | Type check the website TypeScript                             |
| `npm run lint`        | ESLint across the repo (`lint:fix` to autofix)                |
| `npm run lint:css`    | Stylelint on the stylesheet                                   |
| `npm run lint:html`   | html-validate on the pages                                    |
| `npm run unzip-world` | Extract world zips from `worlds/` into your Minecraft saves   |

Run `npm run typecheck` and `npm run lint` before finishing a change. There is no test framework, so verify behavior in the dev server and in Minecraft.

## Project Layout

```
public/                Site source copied verbatim into dist/
  index.html           The converter page shell
  css/styles.css       The one stylesheet, using :root design tokens
  media/               Logos and icons for the site
src/main.ts            The website's only script, bundled by esbuild
dev/                   Dev server, world zip builder, world installer
game/template-world/   The template world with the datapack and resource pack (Git LFS binaries)
worlds/                Drop downloaded world zips here (git-ignored)
assets/                GIMP .xcf texture sources and app icons, never deployed
dist/                  Build output (generated, git-ignored)
```

The website's page is plain HTML on purpose: the converter logic will grow into `src/main.ts`, and the build stays a single bundled script.

The template world is the game itself. Copy `game/template-world/` (or the built `dist/downloads/template-world.zip`) into your Minecraft `saves` folder to play, or let `npm run unzip-world` install zips you dropped into `worlds/`.

Editing the game content is done in the Minecraft tools: [Blockbench](https://blockbench.net/) for models, GIMP for the `.xcf` sources in `assets/textures/`, and a datapack-aware editor (see `.vscode/extensions.json`).

## Disclaimer

All content provided here is an independent creation and is not affiliated with, endorsed by, or associated with Mojang AB, Minecraft, or Microsoft Corporation. All trademarks and copyrights related to Minecraft and associated brands are the property of their respective owners. This content is provided "as is" without any warranties, express or implied.

## License

GPL-3.0-only, see [LICENSE.txt](LICENSE.txt).
