import { existsSync, mkdirSync, readdirSync } from 'node:fs';
import { homedir } from 'node:os';
import { basename, join, resolve } from 'node:path';
import AdmZip from 'adm-zip';

const WORLD_DIR = resolve('worlds');
const SAVES_DIR = join(process.env.APPDATA ?? join(homedir(), '.minecraft'), 'saves');

if (!existsSync(WORLD_DIR)) {
  console.error(`Missing folder ${WORLD_DIR}; run this from the repository root.`);
  process.exitCode = 1;
} else {
  if (!existsSync(SAVES_DIR)) {
    mkdirSync(SAVES_DIR, { recursive: true });
  }

  const archives = readdirSync(WORLD_DIR).filter((file) => file.toLowerCase().endsWith('.zip'));
  if (archives.length === 0) {
    console.error(`No .zip files found in ${WORLD_DIR}; place a downloaded world there first.`);
  }

  for (const archive of archives) {
    const extractPath = join(SAVES_DIR, basename(archive, '.zip'));
    console.log(`Extracting ${archive} to ${extractPath}`);
    new AdmZip(join(WORLD_DIR, archive)).extractAllTo(extractPath, true);
  }
}
