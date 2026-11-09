#!/usr/bin/env node
/**
 * Starts the whole project: the Node API (server/) and the website (client/).
 *
 *   node scripts/run.mjs dev     # hot reload, port 3000 + 4000
 *   node scripts/run.mjs start   # production build already made with `npm run build`
 *
 * The website proxies /api/** to the API, so both must be running.
 */

import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const mode = process.argv[2] === 'dev' ? 'dev' : 'start';
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';

const children = [];
let shuttingDown = false;

function start(name, args, cwd) {
  const child = spawn(npm, args, { cwd, stdio: 'inherit', env: process.env });
  children.push(child);

  child.on('exit', (code) => {
    if (shuttingDown) return;
    console.error(`\n[run] ${name} exited with code ${code ?? 0} — stopping everything.`);
    shutdown(code ?? 1);
  });
  return child;
}

function shutdown(code = 0) {
  if (shuttingDown) return;
  shuttingDown = true;
  for (const child of children) {
    if (!child.killed) child.kill('SIGTERM');
  }
  setTimeout(() => process.exit(code), 500).unref();
}

process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));

async function waitForApi(attempts = 60) {
  for (let i = 0; i < attempts; i += 1) {
    try {
      const response = await fetch('http://127.0.0.1:4000/health');
      if (response.ok) return true;
    } catch {
      /* not up yet */
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  return false;
}

console.log(`[run] starting the API (server/) in ${mode} mode`);
start('api', ['run', mode], path.join(root, 'server'));

const ready = await waitForApi();
console.log(
  ready
    ? '[run] API is up on http://localhost:4000'
    : '[run] API did not answer /health within 30s — starting the website anyway'
);

if (mode === 'start' && !existsSync(path.join(root, 'client', '.next', 'BUILD_ID'))) {
  console.error(
    '[run] No production build found (client/.next is empty).\n' +
      '[run] Run "npm run build" first, or use "npm run dev" for development.'
  );
  shutdown(1);
}

console.log(`[run] starting the website (client/) in ${mode} mode`);
start(
  'web',
  ['run', mode, '--', '-p', process.env.PORT || '3000', '-H', '0.0.0.0'],
  path.join(root, 'client')
);

console.log('[run] website: http://localhost:3000   API: http://localhost:4000\n');
