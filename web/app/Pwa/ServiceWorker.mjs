/**
 * @module HomeCall_Web_Pwa_ServiceWorker
 * @description Handles registration and lifecycle of the service worker.
 */

export default function HomeCall_Web_Pwa_ServiceWorker({ HomeCall_Web_Env_Provider$: env } = {}) {
  const navigatorRef = env?.navigator;
  const windowRef = env?.window;
  let registration = null;

  const register = async () => {
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
      console.warn('[ServiceWorker] Registration failed', error);
      return null;
    }
  };

  const getRegistration = () => registration;

  return {
    register,
    getRegistration
  };
}
