const VERSION_URL = 'version.json';
const CORE_ASSETS = [
  'app.js',
  'app/App.mjs',
  'app/Config/RemoteLogging.mjs',
  'app/Env/Provider.mjs',
  'app/Logger.mjs',
  'app/Media/Manager.mjs',
  'app/Media/Monitor.mjs',
  'app/Net/Session/Manager.mjs',
  'app/Net/Signal/Client.mjs',
  'app/Net/Signal/Orchestrator.mjs',
  'app/Pwa/Cache.mjs',
  'app/Pwa/ServiceWorker.mjs',
  'app/Rtc/Peer.mjs',
  'app/State/Machine.mjs',
  'app/State/Media.mjs',
  'app/Ui/Router.mjs',
  'app/Ui/Flow.mjs',
  'app/Ui/ShareLinkService.mjs',
  'app/Ui/Screen/Home.mjs',
  'app/Ui/Screen/Call.mjs',
  'app/Ui/Screen/End.mjs',
  'app/Ui/Screen/NotFound.mjs',
  'app/Ui/Screen/Settings.mjs',
  'app/Ui/Templates/Loader.mjs',
  'app/Ui/Toast.mjs',
  'app/VersionWatcher.mjs',
  'app/types.d.js',
  'assets/icons/alert-triangle.svg',
  'assets/icons/camera-off.svg',
  'assets/icons/camera.svg',
  'assets/icons/close.svg',
  'assets/icons/copy.svg',
  'assets/icons/help-circle.svg',
  'assets/icons/icon-192.svg',
  'assets/icons/icon-512.svg',
  'assets/icons/link.svg',
  'assets/icons/menu.svg',
  'assets/icons/mic-off.svg',
  'assets/icons/mic.svg',
  'assets/icons/phone.svg',
  'assets/icons/refresh-ccw.svg',
  'assets/icons/return-home.svg',
  'assets/icons/rss.svg',
  'assets/icons/settings.svg',
  'assets/icons/share.svg',
  'assets/icons/slash.svg',
  'assets/icons/trash-2.svg',
  'assets/icons/video.svg',
  'index.html',
  'manifest.json',
  'service-worker.js',
  'reinstall.html',
  'ui/component/big-button.css',
  'ui/component/big-button.js',
  'ui/component/header-action-button.css',
  'ui/component/header-action-button.js',
  'ui/component/components.js',
  'ui/component/icon-wrapper.css',
  'ui/component/icon-wrapper.js',
  'ui/component/screen-card.css',
  'ui/component/screen-card.js',
  'ui/component/screen-header.css',
  'ui/component/screen-header.js',
  'ui/component/screen-note.css',
  'ui/component/screen-note.js',
  'ui/screen/home.html',
  'ui/screen/call.html',
  'ui/screen/end.html',
  'ui/screen/not-found.html',
  'ui/screen/settings.html',
  'ui/toast.css',
  'ui/ui.css',
  'version.json'
];
const CORE_ASSET_SET = new Set(CORE_ASSETS);
let CURRENT_VERSION = '0';
let CURRENT_CACHE_NAME = 'svyazist-v0';

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
      CURRENT_CACHE_NAME = `svyazist-v${version}`;
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
        const newCache = `svyazist-v${version}`;
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
