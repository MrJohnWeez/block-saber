import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';

import { REPO_ROOT } from './helpers';

const CONVERTER_MODULES = [
  'emit-datapack.ts',
  'emit-songs-resource-pack.ts',
  'chain-expansion.ts',
  'slug.ts',
  'zip-output.ts',
  'v4-lights.ts',
];

function bundleForBrowser(moduleName: string): string {
  return execFileSync(
    process.execPath,
    [
      path.join(REPO_ROOT, 'node_modules', 'esbuild', 'bin', 'esbuild'),
      path.join(REPO_ROOT, 'src/converter', moduleName),
      '--bundle',
      '--format=esm',
      '--platform=browser',
      '--target=es2022',
      '--log-level=silent',
    ],
    { encoding: 'utf8' },
  );
}

test('converter modules bundle for the browser without node: imports or require() calls', async () => {
  const smokeParts: string[] = [];
  for (const moduleName of CONVERTER_MODULES) {
    const text = bundleForBrowser(moduleName);
    assert.ok(!text.includes('node:'), `${moduleName} bundle references a node: builtin`);
    assert.ok(!text.includes('require('), `${moduleName} bundle contains require()`);
    smokeParts.push(`// ---- ${moduleName} ----\n${text}`);
  }
  const combinedPath = path.join(REPO_ROOT, '.tmp-tests', 'bundle-smoke.js');
  writeFileSync(combinedPath, smokeParts.join('\n'), 'utf8');
  const written = readFileSync(combinedPath, 'utf8');
  assert.ok(!written.includes('node:'), 'bundle-smoke.js references node:');
  assert.ok(!written.includes('require('), 'bundle-smoke.js contains require()');
});
