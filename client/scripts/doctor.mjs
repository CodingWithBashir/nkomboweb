#!/usr/bin/env node
/**
 * Quick health check for a fresh checkout.
 *
 *   npm run doctor        (from the repository root)
 *
 * Verifies the Node version, that the dependencies are installed and that the
 * native SQLite driver loads — the three things that stop the site from
 * starting on a new machine.
 */

import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const root = path.resolve(process.cwd(), 'client');
const ok = (label, detail = '') => console.log(`  \u2713 ${label}${detail ? ` — ${detail}` : ''}`);
const bad = (label, detail) => {
  console.log(`  \u2717 ${label}${detail ? ` — ${detail}` : ''}`);
  failures += 1;
};
let failures = 0;

console.log('\nLycée de Nyanza — environment check\n');

// 1. Node version
const [major, minor] = process.versions.node.split('.').map(Number);
if (major > 18 || (major === 18 && minor >= 17)) {
  ok('Node.js', `v${process.versions.node}`);
} else {
  bad('Node.js', `v${process.versions.node} found, 18.17 or newer required`);
}

// 2. Dependencies
if (!fs.existsSync(path.join(root, 'node_modules'))) {
  bad('Dependencies', 'client/node_modules is missing — run "npm run setup"');
} else {
  ok('Dependencies', 'client/node_modules present');

  // 3. Native SQLite driver
  try {
    const Database = require(path.join(root, 'node_modules', 'better-sqlite3'));
    const db = new Database(':memory:');
    db.exec('CREATE TABLE t (id INTEGER)');
    db.close();
    ok('SQLite driver', 'better-sqlite3 loads and runs');
  } catch (error) {
    bad(
      'SQLite driver',
      `${error instanceof Error ? error.message.split('\n')[0] : 'failed to load'} — try "npm run setup" again, or reinstall Node 20 LTS`
    );
  }

  // 4. Next.js
  try {
    const next = require(path.join(root, 'node_modules', 'next', 'package.json'));
    ok('Next.js', next.version);
  } catch {
    bad('Next.js', 'not installed');
  }
}

// 5. Database file
const dbFile = path.join(root, 'data', 'school.db');
if (fs.existsSync(dbFile)) {
  const size = Math.round(fs.statSync(dbFile).size / 1024);
  ok('School database', `${path.relative(process.cwd(), dbFile)} (${size} KB)`);
} else {
  ok('School database', 'not created yet — it is built and seeded on first run');
}

console.log(
  failures === 0
    ? '\nAll good. Start the site with:  npm run dev   (or npm run build && npm start)\n' +
        'The website and the API are served together on http://localhost:3000\n'
    : `\n${failures} problem(s) found — see the notes above.\n`
);

process.exit(failures === 0 ? 0 : 1);
