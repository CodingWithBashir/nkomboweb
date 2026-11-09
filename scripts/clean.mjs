#!/usr/bin/env node
/**
 * Removes installed dependencies and build output so `npm run setup` can start
 * from scratch — handy after a failed install (for example a half-built native
 * module on Windows).
 *
 *   npm run clean           # node_modules + client/.next
 *   npm run clean -- --data # also delete the school database and uploads
 */

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const withData = process.argv.includes('--data');

const targets = [
  'server/node_modules',
  'client/node_modules',
  'client/.next',
  ...(withData ? ['server/data', 'server/public/uploads'] : []),
];

for (const target of targets) {
  const absolute = path.join(root, target);
  if (!fs.existsSync(absolute)) {
    console.log(`  - ${target} (not there)`);
    continue;
  }
  fs.rmSync(absolute, { recursive: true, force: true });
  console.log(`  \u2713 removed ${target}`);
}

console.log(
  withData
    ? '\nClean. Next: npm run setup && npm run dev (the database is re-created and seeded).\n'
    : '\nClean. Next: npm run setup && npm run dev\n'
);
