// Epistemic service worker — V3 phase 10.
// Network-first, falling back to cache only when offline. Deliberately
// NOT cache-first: a cache-first app shell risks serving a stale
// index.html/app.js forever after a deploy, which is worse than no
// offline support at all for a product that ships frequently (v3.5x
// commits land on main directly, no staging gate). Network-first keeps
// every online visit fresh and only falls back when there's truly no
// connection.

const CACHE_NAME = 'epistemic-shell-v1';
const SHELL_FILES = ['/', '/index.html', '/app.css', '/app.js', '/manifest.json'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_FILES)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return; // never intercept cross-origin (CDNs, API)
  if (!SHELL_FILES.includes(url.pathname) && url.pathname !== '/') return; // shell only — never concepts.json etc.

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
