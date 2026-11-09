#!/usr/bin/env node
/**
 * Environment check for a fresh checkout.
 *
 *   npm run doctor
 *
 * Verifies the Node version, both dependency trees (server/ and client/), the
 * native SQLite driver and the database — the usual reasons a checkout will not
 * start.
 */

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const server = path.join(root, 'server');
const client = path.join(root, 'client');

let failures = 0;
const ok = (label, detail = '') => console.log(`  \u2713 ${label}${detail ? ` — ${detail}` : ''}`);
const bad = (label, detail) => {
  console.log(`  \u2717 ${label}${detail ? ` — ${detail}` : ''}`);
  failures += 1;
};

console.log('\nLycée de Nyanza — environment check\n');

// 1. Node (22.5 is the first release that ships `node:sqlite`)
const [major, minor] = process.versions.node.split('.').map(Number);
if (major > 22 || (major === 22 && minor >= 5)) ok('Node.js', `v${process.versions.node}`);
else bad('Node.js', `v${process.versions.node} found, 22.5 or newer required (https://nodejs.org)`);

// 2. Dependencies
for (const [label, dir] of [
  ['API dependencies', server],
  ['Website dependencies', client],
]) {
  const modules = path.join(dir, 'node_modules');
  if (!fs.existsSync(modules)) {
    bad(label, `${path.relative(root, modules)} is missing — run "npm run setup"`);
  } else {
    ok(label, `${path.relative(root, modules)} present`);
  }
}

// 3. SQLite — built into Node, so there is nothing to compile
try {
  const { DatabaseSync } = await import('node:sqlite');
  const db = new DatabaseSync(':memory:');
  db.exec('CREATE TABLE t (id INTEGER)');
  db.prepare('INSERT INTO t VALUES (?)').run(1);
  db.close();
  ok('SQLite', 'built into Node (node:sqlite) — no compiler or Visual Studio needed');
} catch (error) {
  bad(
    'SQLite',
    `${error instanceof Error ? error.message.split('\n')[0] : 'unavailable'} — Node 22.5 or newer is required`
  );
}

// 4. Framework versions
for (const [label, dir, pkg] of [
  ['Express', server, 'express'],
  ['Next.js', client, 'next'],
  ['tsx (TypeScript runner)', server, 'tsx'],
]) {
  try {
    const info = require(path.join(dir, 'node_modules', pkg, 'package.json'));
    ok(label, info.version);
  } catch {
    bad(label, 'not installed');
  }
}

// 5. Database + uploads
const dbFile = path.join(server, 'data', 'school.db');
if (fs.existsSync(dbFile)) {
  const size = Math.round(fs.statSync(dbFile).size / 1024);
  ok('School database', `${path.relative(root, dbFile)} (${size} KB)`);
} else {
  ok('School database', 'not created yet — the API builds and seeds it on first start');
}
const uploads = path.join(server, 'public', 'uploads');
ok('Uploads folder', fs.existsSync(uploads) ? path.relative(root, uploads) : 'created on first upload');

console.log(
  failures === 0
    ? '\nAll good.\n' +
        '  npm run dev     # API on :4000 + website on :3000 (hot reload)\n' +
        '  npm run build && npm start   # production\n' +
        '  Admin entrance: http://localhost:3000/lyceeadmin\n'
    : `\n${failures} problem(s) found — see the notes above.\n`
);

process.exit(failures === 0 ? 0 : 1);
