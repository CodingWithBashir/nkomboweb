/**
 * Lycée de Nyanza — standalone Node.js API.
 *
 * Express adapts incoming HTTP requests to the web-standard handlers in
 * `api.ts`, so the same code also runs behind Next.js route handlers. The
 * website proxies /api/** and /uploads/** here (see client/next.config.mjs).
 *
 *   npm run dev     # tsx watch
 *   npm start       # tsx
 */

import path from 'node:path';
import express from 'express';
import { DELETE, GET, PATCH, POST, PUT } from './api';
import { UPLOAD_DIR } from './lib/db';
import { seedDatabase } from './lib/seed';
import type { NextRequest } from './types';

const PORT = Number(process.env.PORT || 4000);
const HOST = process.env.HOST || '0.0.0.0';

const handlers = { GET, POST, PUT, PATCH, DELETE } as const;

const app = express();

app.disable('x-powered-by');

/** Permissive CORS: the website is normally same-origin through a proxy, but a
 *  separately hosted front end (or a mobile app) may call this API directly. */
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    req.headers['access-control-request-headers'] || 'Authorization, Content-Type'
  );
  res.setHeader('Access-Control-Max-Age', '86400');
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }
  next();
});

/** Keep the raw body around: the handlers parse JSON and multipart themselves. */
app.use(express.raw({ type: () => true, limit: '40mb' }));

/** Uploaded files (holiday packs, photos kept locally) are served from here. */
app.use('/uploads', express.static(UPLOAD_DIR, { fallthrough: true, maxAge: '7d' }));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'lycee-de-nyanza-api', uptime: Math.round(process.uptime()) });
});

function headersFrom(req: express.Request): Headers {
  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (Array.isArray(value)) value.forEach((item) => headers.append(key, item));
    else if (typeof value === 'string') headers.set(key, value);
  }
  return headers;
}

app.use('/api', async (req, res) => {
  const method = req.method.toUpperCase() as keyof typeof handlers;
  const handler = handlers[method];
  if (!handler) {
    res.status(405).json({ detail: 'Method not allowed.' });
    return;
  }

  const proto = (req.headers['x-forwarded-proto'] as string) || req.protocol || 'http';
  const host = (req.headers['x-forwarded-host'] as string) || req.headers.host || `localhost:${PORT}`;
  const url = new URL(req.originalUrl, `${proto}://${host}`);

  const body =
    Buffer.isBuffer(req.body) && req.body.length > 0 ? (req.body as Buffer) : undefined;

  const request = new Request(url, {
    method: req.method,
    headers: headersFrom(req),
    body,
  }) as NextRequest;
  request.nextUrl = url;

  const segments = req.path.split('/').filter(Boolean);

  try {
    const response = await handler(request, { params: { path: segments } });
    res.status(response.status);
    response.headers.forEach((value, key) => {
      const lower = key.toLowerCase();
      if (lower === 'content-encoding' || lower === 'content-length' || lower === 'transfer-encoding') return;
      res.setHeader(key, value);
    });
    const buffer = Buffer.from(await response.arrayBuffer());
    res.end(buffer);
  } catch (error) {
    console.error('[api] request failed', req.method, req.originalUrl, error);
    const detail = error instanceof Error ? error.message : 'Unexpected server error.';
    res.status(500).json({ detail });
  }
});

// Anything else under this service is a 404 in API shape.
app.use((req, res) => {
  res.status(404).json({ detail: `No route for ${req.method} ${req.path}` });
});

try {
  seedDatabase();
  console.log('[api] database ready at', path.join(process.cwd(), 'data', 'school.db'));
} catch (error) {
  console.error('[api] could not prepare the database:', error);
}

const server = app.listen(PORT, HOST, () => {
  console.log(`[api] Lycée de Nyanza API listening on http://${HOST}:${PORT}`);
  console.log(`[api] uploads served from ${UPLOAD_DIR}`);
});

const shutdown = (signal: string) => {
  console.log(`[api] ${signal} received, closing`);
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(0), 3000).unref();
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
