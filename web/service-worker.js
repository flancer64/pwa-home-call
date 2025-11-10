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
  'assets/icons/icon-192.svg',
  'assets/icons/icon-512.svg'
];
const MODULE_ASSETS = [
  'app/Core/App.mjs',
  'app/Core/ServiceWorkerManager.mjs',
  'app/Core/TemplateLoader.mjs',
  'app/Core/VersionWatcher.mjs',
  'app/Env/Provider.mjs',
  'app/Media/DeviceMonitor.mjs',
  'app/Media/Manager.mjs',
  'app/Net/SignalClient.mjs',
  'app/Rtc/Peer.mjs',
  'app/Shared/EventBus.mjs',
  'app/Shared/Logger.mjs',
  'app/Shared/Util.mjs',
  'app/Ui/Screen/Call.mjs',
  'app/Ui/Screen/End.mjs',
  'app/Ui/Screen/Enter.mjs',
  'app/Ui/Screen/Lobby.mjs'
];
const CORE_ASSETS = [...STATIC_ASSETS, ...MODULE_ASSETS];
const CORE_ASSET_SET = new Set(CORE_ASSETS);

async function resolveVersionInfo() {
  try {
    const response = await fetch(VERSION_URL, { cache: 'no-store' });
    const data = await response.json();
    const version = typeof data?.version === 'string' ? data.version : '0';
    return { version, cacheName: `homecall-v${version}` };
  } catch (error) {
    console.warn('[ServiceWorker] Failed to resolve version, using fallback cache.', error);
    return { version: '0', cacheName: 'homecall-v0' };
  }
}

function toAssetKey(requestUrl) {
  try {
    const url = new URL(requestUrl);
    if (url.origin !== self.location.origin) {
      return null;
    }
    return url.pathname.replace(/^\//, '');
  } catch {
    return null;
  }
}

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) {
    return cached;
  }
  return fetch(request);
}

async function networkFirst(request) {
  try {
    return await fetch(request);
  } catch (error) {
    const offline = await caches.match('index.html');
    if (offline) {
      return offline;
    }
    throw error;
  }
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const { cacheName } = await resolveVersionInfo();
      const cache = await caches.open(cacheName);
      await cache.addAll(CORE_ASSETS);
      self.skipWaiting();
    })()
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const { cacheName: expected, version } = await resolveVersionInfo();
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map((name) => (name === expected ? null : caches.delete(name)))
      );
      console.info(
        `[ServiceWorker] Activated version ${version}, old caches removed`
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

  const assetKey = toAssetKey(request.url);
  if (assetKey === VERSION_URL) {
    event.respondWith(fetch(request, { cache: 'no-store' }));
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request));
    return;
  }

  if (assetKey && CORE_ASSET_SET.has(assetKey)) {
    event.respondWith(cacheFirst(request));
    return;
  }

  event.respondWith(fetch(request));
});

self.addEventListener('message', (event) => {
  if (event.data === 'skip-waiting') {
    self.skipWaiting();
  }
});
