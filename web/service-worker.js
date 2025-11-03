const CORE_CACHE = 'homecall-core-v1';
const META_CACHE = 'homecall-meta';
const CORE_ASSETS = [
  '/',
  '/web/',
  '/web/index.html',
  '/web/app.js',
  '/web/manifest.json',
  '/web/version.json',
  '/web/assets/style.css',
  '/web/ui/enter.html',
  '/web/ui/lobby.html',
  '/web/ui/call.html',
  '/web/ui/end.html',
  '/web/rtc/peer.js',
  '/web/ws/client.js',
  '/web/assets/icons/icon-192.svg',
  '/web/assets/icons/icon-512.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CORE_CACHE).then((cache) => cache.addAll(CORE_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((key) => key !== CORE_CACHE && key !== META_CACHE)
          .map((key) => caches.delete(key))
      );

      try {
        const response = await fetch('/web/version.json', { cache: 'no-store' });
        const data = await response.json();
        const meta = await caches.open(META_CACHE);
        await meta.put('version', new Response(data.version));
      } catch (err) {
        console.warn('Version check failed in service worker', err);
      }

      await self.clients.claim();
    })()
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') {
    return;
  }

  const url = new URL(request.url);
  if (url.origin === self.location.origin) {
    if (request.mode === 'navigate') {
      event.respondWith(
        caches.match('/web/index.html').then(
          (cached) => cached || fetch(request)
        )
      );
      return;
    }

    let normalized = url.pathname;
    if (normalized === '/web' || normalized === '/web/') {
      normalized = '/web/index.html';
    } else if (!normalized.startsWith('/web/')) {
      const suffix = normalized.startsWith('/') ? normalized : `/${normalized}`;
      normalized = `/web${suffix}`;
    }
    event.respondWith(
      caches.match(normalized).then((cached) => cached || fetch(request))
    );
  }
});

self.addEventListener('message', (event) => {
  if (event.data === 'skip-waiting') {
    self.skipWaiting();
  }
});
