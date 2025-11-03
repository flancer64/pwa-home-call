const VERSION_URL = 'version.json';
const STATIC_ASSETS = [
  'index.html',
  'app.js',
  'manifest.json',
  'assets/style.css',
  'ui/enter.html',
  'ui/lobby.html',
  'ui/call.html',
  'ui/end.html',
  'rtc/peer.js',
  'ws/client.js',
  'assets/icons/icon-192.svg',
  'assets/icons/icon-512.svg'
];

async function resolveCacheName() {
  try {
    const response = await fetch(VERSION_URL, { cache: 'no-store' });
    const data = await response.json();
    return `homecall-v${data.version}`;
  } catch (error) {
    console.warn('[ServiceWorker] Failed to resolve version, using fallback cache.', error);
    return 'homecall-v0';
  }
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cacheName = await resolveCacheName();
      const cache = await caches.open(cacheName);
      await cache.addAll(STATIC_ASSETS);
      self.skipWaiting();
    })()
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const expected = await resolveCacheName();
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map((name) => (name === expected ? null : caches.delete(name)))
      );
      await self.clients.claim();
    })()
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') {
    return;
  }

  if (new URL(request.url).pathname.endsWith(VERSION_URL)) {
    event.respondWith(fetch(request, { cache: 'no-store' }));
    return;
  }

  event.respondWith(
    (async () => {
      const cache = await caches.match(request);
      if (cache) {
        return cache;
      }
      try {
        const response = await fetch(request);
        return response;
      } catch (error) {
        if (request.mode === 'navigate') {
          return caches.match('index.html');
        }
        throw error;
      }
    })()
  );
});

self.addEventListener('message', (event) => {
  if (event.data === 'skip-waiting') {
    self.skipWaiting();
  }
});
