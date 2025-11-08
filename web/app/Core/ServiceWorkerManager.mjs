/**
 * @module HomeCall_Web_Core_ServiceWorkerManager
 * @description Handles registration and lifecycle of the service worker.
 */

export default class HomeCall_Web_Core_ServiceWorkerManager {
  constructor({ 'navigator$': navSingleton, 'window$': winSingleton } = {}) {
    const navigatorRef = navSingleton ?? globalThis.navigator;
    const windowRef = winSingleton ?? globalThis.window;
    let registration = null;

    this.register = async () => {
      if (!navigatorRef || !('serviceWorker' in navigatorRef)) {
        return null;
      }
      if (registration) {
        return registration;
      }
      try {
        const reg = await navigatorRef.serviceWorker.register('service-worker.js');
        if (navigatorRef.serviceWorker && typeof navigatorRef.serviceWorker.addEventListener === 'function') {
          navigatorRef.serviceWorker.addEventListener('controllerchange', () => {
            if (windowRef?.location) {
              windowRef.location.reload();
            }
          });
        }
        registration = reg;
        return reg;
      } catch (error) {
        console.warn('[ServiceWorkerManager] Registration failed', error);
        return null;
      }
    };

    this.getRegistration = () => registration;
  }
}
