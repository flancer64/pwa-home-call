const VERSION_URL = 'version.json';
const STATIC_ASSETS = [
  'index.html',
  'app.js',
  'manifest.json',
  'assets/style.css',
  'ui/enter.html',
  'ui/invite.html',
  'ui/call.html',
  'ui/end.html',
  'assets/icons/icon-192.svg',
  'assets/icons/icon-512.svg'
];
const MODULE_ASSETS = [
  'app/App.mjs',
  'app/Logger.mjs',
  'app/VersionWatcher.mjs',
  'app/Env/Provider.mjs',
  'app/Media/Monitor.mjs',
  'app/Media/Manager.mjs',
  'app/Net/Signal/Client.mjs',
  'app/Net/Signal/Orchestrator.mjs',
  'app/Net/Session/Manager.mjs',
  'app/Rtc/Peer.mjs',
  'app/Pwa/ServiceWorker.mjs',
  'app/Pwa/Cache.mjs',
  'app/State/Machine.mjs',
  'app/State/Media.mjs',
  'app/Ui/Controller.mjs',
  'app/Ui/Templates/Loader.mjs',
  'app/Ui/Flow.mjs',
  'app/Ui/InviteService.mjs',
  'app/Ui/Toast.mjs',
  'app/Ui/Screen/Call.mjs',
  'app/Ui/Screen/End.mjs',
  'app/Ui/Screen/Enter.mjs',
  'app/Ui/Screen/Invite.mjs'
];
const CORE_ASSETS = [...STATIC_ASSETS, ...MODULE_ASSETS];
const CORE_ASSET_SET = new Set(CORE_ASSETS);
let CURRENT_VERSION = '0';
let CURRENT_CACHE_NAME = 'homecall-v0';

async function resolveVersionInfo() {
  try {
    const response = await fetch(VERSION_URL, { cache: 'no-store' });
    const data = await response.json();
    const version = typeof data?.version === 'string' ? data.version : '0';
    return version;
  } catch (error) {
    console.warn('[ServiceWorker] Failed to resolve version, using fallback cache.', error);
    return '0';
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
      const version = await resolveVersionInfo();
      CURRENT_VERSION = version;
      CURRENT_CACHE_NAME = `homecall-v${version}`;
      const cache = await caches.open(CURRENT_CACHE_NAME);
      await cache.addAll(CORE_ASSETS);
      self.skipWaiting();
    })()
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map((name) => (name === CURRENT_CACHE_NAME ? null : caches.delete(name)))
      );
      console.info(
        `[ServiceWorker] Activated version ${CURRENT_VERSION}, old caches removed`
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
  event.waitUntil(
    (async () => {
      const { type, version } = event.data ?? {};
      if (type !== 'clear-caches-and-rebuild' || !version) {
        return;
      }

      try {
        const newCache = `homecall-v${version}`;
        const keys = await caches.keys();
        await Promise.all(keys.map((key) => caches.delete(key)));
        const cache = await caches.open(newCache);
        await cache.addAll(CORE_ASSETS);
        CURRENT_VERSION = version;
        CURRENT_CACHE_NAME = newCache;
        console.info(`[ServiceWorker] Cache rebuilt for version ${version}`);
      } catch (error) {
        console.warn('[ServiceWorker] Failed to rebuild cache', error);
      }
    })()
  );
});
