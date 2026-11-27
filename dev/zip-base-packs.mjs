import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import AdmZip from 'adm-zip';

const basePacks = [
  {
    dir: resolve('game', 'template-world', 'datapacks', 'BlockSaber'),
    output: resolve('dist', 'downloads', 'block-saber-base-datapack.zip'),
  },
  {
    dir: resolve('game', 'template-world', 'BlockSaberResourcepack'),
    output: resolve('dist', 'downloads', 'block-saber-base-resourcepack.zip'),
  },
];

for (const { dir, output } of basePacks) {
  mkdirSync(resolve(output, '..'), { recursive: true });
  const zip = new AdmZip();
  zip.addLocalFolder(dir);
  zip.writeZip(output);
  console.log(`Zipped ${dir} into ${output}`);
}
