#!/usr/bin/env node
/**
 * Keeps the website's copy of the database layer in step with the API.
 *
 * `server/src/lib/*` is the real implementation. The Next.js app only reads the
 * same SQLite file when it renders pages at build time, so it needs the same
 * schema, seed and serialisers. Instead of hand-editing two copies, that copy
 * is generated from the server with a few path tweaks.
 *
 *   node scripts/sync-server-lib.mjs
 *
 * Runs automatically before `npm run build` and from `npm run setup`.
 */

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const from = path.join(root, 'server', 'src', 'lib');
const to = path.join(root, 'client', 'src', 'lib', 'server');

/** Files that are copied verbatim. */
const plain = ['queries.ts', 'imageHost.ts', 'sqlite.ts', 'auth.ts', 'db.ts', 'seed.ts'];

/** Client-specific edits applied after copying. */
const edits = {
  'auth.ts': [
    [
      "import type { NextRequest } from '../types';",
      "import type { NextRequest } from 'next/server';",
    ],
  ],
  'seed.ts': [
    [
      "import tradesSeed from '../data/trades.json';",
      "import tradesSeed from '@/data/trades.json';",
    ],
  ],
  'db.ts': [
    [
      `/**
 * SQLite database for the school API (Node/Next.js).
 *
 * The file lives in \`client/data/school.db\` and is created, migrated and seeded
 * on first use, so a fresh checkout only needs \`npm run dev\`.
 */`,
      `/**
 * Read access to the school database (generated from server/src/lib/db.ts).
 *
 * The API in \`server/\` owns the data and writes to \`server/data/school.db\`.
 * The website reads the same file when it renders pages at build time and for
 * incremental regeneration, so nothing here writes content.
 */`,
    ],
    [
      `const DATA_DIR = path.join(process.cwd(), 'data');
const DB_PATH = process.env.SCHOOL_DB_PATH || path.join(DATA_DIR, 'school.db');`,
      `const DB_PATH =
  process.env.SCHOOL_DB_PATH || path.join(process.cwd(), '..', 'server', 'data', 'school.db');`,
    ],
  ],
};

fs.mkdirSync(to, { recursive: true });

let changed = 0;
for (const file of plain) {
  const source = path.join(from, file);
  if (!fs.existsSync(source)) {
    console.error(`[sync] missing ${path.relative(root, source)}`);
    process.exitCode = 1;
    continue;
  }

  let contents = fs.readFileSync(source, 'utf8');
  for (const [search, replacement] of edits[file] ?? []) {
    if (!contents.includes(search)) {
      console.error(
        `[sync] could not re-map ${file}: expected ${JSON.stringify(search.slice(0, 60))} — update scripts/sync-server-lib.mjs`
      );
      process.exitCode = 1;
      continue;
    }
    contents = contents.replace(search, replacement);
  }

  const target = path.join(to, file);
  const previous = fs.existsSync(target) ? fs.readFileSync(target, 'utf8') : '';
  if (previous === contents) continue;
  fs.writeFileSync(target, contents);
  changed += 1;
  console.log(`[sync] updated client/src/lib/server/${file}`);
}

console.log(
  changed === 0
    ? '[sync] client/src/lib/server is already up to date'
    : `[sync] ${changed} file(s) updated from server/src/lib`
);
