/*
 * Offline shell for the Lycée de Nyanza portal.
 *
 * The school is in a valley where the mobile network drops for minutes at a
 * time, so pages are served from the last copy when the network is gone and a
 * plain offline page explains what happened. Nothing personal is cached: API
 * responses are never stored, only the app shell, the fonts and the images.
 */
const VERSION = 'lycee-v3';
const SHELL = `${VERSION}-shell`;
const ASSETS = `${VERSION}-assets`;

const PRECACHE = ['/', '/offline.html', '/icon.svg', '/manifest.webmanifest'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(SHELL)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting())
      .catch(() => undefined)
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => !key.startsWith(VERSION)).map((key) => caches.delete(key)))
      )
      .then(() => self.clients.claim())
  );
});

function isStatic(url) {
  return (
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.startsWith('/images/') ||
    url.pathname.startsWith('/fonts/') ||
    /\.(?:css|js|woff2?|png|jpe?g|webp|svg|ico)$/.test(url.pathname)
  );
}

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  // never store anything the office or a parent typed
  if (url.pathname.startsWith('/api/')) return;

  // pages: fresh copy when possible, last copy when the network is gone
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(SHELL).then((cache) => cache.put(request, copy)).catch(() => undefined);
          return response;
        })
        .catch(() =>
          caches
            .match(request)
            .then((cached) => cached || caches.match('/offline.html'))
            .then((cached) => cached || Response.error())
        )
    );
    return;
  }

  if (!isStatic(url)) return;

  event.respondWith(
    caches.match(request).then(
      (cached) =>
        cached ||
        fetch(request)
          .then((response) => {
            const copy = response.clone();
            caches.open(ASSETS).then((cache) => cache.put(request, copy)).catch(() => undefined);
            return response;
          })
          .catch(() => cached || Response.error())
    )
  );
});
