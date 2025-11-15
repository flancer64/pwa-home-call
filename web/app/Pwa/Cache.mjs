/**
 * @module HomeCall_Web_Pwa_Cache
 * @description Clears all service worker caches and reloads the application.
 */

export default class HomeCall_Web_Pwa_Cache {
  /**
   * @param {Object} deps
   * @param {HomeCall_Web_Env_Provider} deps.HomeCall_Web_Env_Provider$
   * @param {HomeCall_Web_Logger} [deps.HomeCall_Web_Logger$]
   */
  constructor({
    HomeCall_Web_Env_Provider$: env,
    HomeCall_Web_Logger$: logger
  } = {}) {
    if (!env) {
      throw new Error('HomeCall environment provider is required for cache cleaning.');
    }
    this.window = env.window;
    this.navigator = env.navigator;
    this.log = logger ?? console;
  }

  async clear() {
    const cachesRef = this.window?.caches ?? globalThis.caches ?? null;
    if (!cachesRef) {
      this.log?.warn?.('[Cache] Caches API is unavailable.');
    } else {
      try {
        const names = await cachesRef.keys();
        await Promise.all(names.map((name) => cachesRef.delete(name)));
      } catch (error) {
        this.log?.warn?.('[Cache] Failed to delete caches', error);
      }
    }
    await this.unregisterServiceWorkers();
    this.log?.info?.('[Cache] PWA cache cleared and service worker reinstalled');
    this.reload();
  }

  reload() {
    const locationRef = this.window?.location ?? globalThis.location ?? null;
    if (locationRef && typeof locationRef.reload === 'function') {
      locationRef.reload();
    }
  }

  async unregisterServiceWorkers() {
    const swContainer =
      this.navigator?.serviceWorker ?? globalThis.navigator?.serviceWorker ?? null;
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
      this.log?.warn?.('[Cache] Failed to unregister service workers', error);
    }
  }
}
