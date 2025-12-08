/**
 * @module HomeCall_Web_Pwa_Cache
 * @description Clears all service worker caches and reloads the application.
 */

export default function HomeCall_Web_Pwa_Cache({
  HomeCall_Web_Env_Provider$: env,
  HomeCall_Web_Logger$: logger
} = {}) {
  const windowRef = env?.window;
  const navigatorRef = env?.navigator;
  const log = logger ?? console;

  const clear = async () => {
    const cachesRef = windowRef?.caches ?? globalThis.caches ?? null;
    if (!cachesRef) {
      log?.warn?.('[Cache] Caches API is unavailable.');
    } else {
      try {
        const names = await cachesRef.keys();
        await Promise.all(names.map((name) => cachesRef.delete(name)));
      } catch (error) {
        log?.warn?.('[Cache] Failed to delete caches', error);
      }
    }
    await unregisterServiceWorkers();
    log?.info?.('[Cache] PWA cache cleared and service worker reinstalled');
    reload();
  };

  const reload = () => {
    const locationRef = windowRef?.location ?? globalThis.location ?? null;
    if (locationRef && typeof locationRef.reload === 'function') {
      locationRef.reload();
    }
  };

  const unregisterServiceWorkers = async () => {
    const swContainer =
      navigatorRef?.serviceWorker ?? globalThis.navigator?.serviceWorker ?? null;
    if (!swContainer || typeof swContainer.getRegistrations !== 'function') {
      return;
    }
    try {
      const registrations = await swContainer.getRegistrations();
      await Promise.all(
        registrations.map((registration) => {
          if (registration && typeof registration.unregister === 'function') {
            return registration.unregister();
          }
          return false;
        })
      );
    } catch (error) {
      log?.warn?.('[Cache] Failed to unregister service workers', error);
    }
  };

  return {
    clear,
    reload,
    unregisterServiceWorkers
  };
}
