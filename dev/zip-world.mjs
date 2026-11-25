import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import AdmZip from 'adm-zip';

const WORLD_DIR = resolve('game', 'template-world');
const OUTPUT_ZIP = resolve('dist', 'downloads', 'template-world.zip');
const ENTRY_PREFIX = 'BlockSaberTemplateWorld';

mkdirSync(resolve(OUTPUT_ZIP, '..'), { recursive: true });

const zip = new AdmZip();
zip.addLocalFolder(WORLD_DIR, ENTRY_PREFIX);
zip.writeZip(OUTPUT_ZIP);
console.log(`Zipped ${WORLD_DIR} into ${OUTPUT_ZIP}`);
