import { readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';

const rootDir = join(dirname(fileURLToPath(import.meta.url)), '..');
const srcDir = join(rootDir, 'src');
const require = createRequire(import.meta.url);
const tsxCli = require.resolve('tsx/cli');

/** @param {string} dir @param {string[]} out */
function collectTestFiles(dir, out = []) {
  for (const name of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, name.name);
    if (name.isDirectory()) collectTestFiles(p, out);
    else if (name.name.endsWith('.test.ts')) out.push(p);
  }
  return out;
}

const files = collectTestFiles(srcDir);
if (files.length === 0) {
  console.error('No *.test.ts files found under src/');
  process.exit(1);
}

const r = spawnSync(process.execPath, [tsxCli, '--test', ...files], {
  cwd: rootDir,
  stdio: 'inherit',
});

process.exit(r.status ?? 1);
