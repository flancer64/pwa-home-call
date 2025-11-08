/**
 * @module HomeCall_Web_Core_VersionWatcher
 * @description Checks application version and triggers updates when needed.
 */

export default class HomeCall_Web_Core_VersionWatcher {
  constructor({
    HomeCall_Web_Core_ServiceWorkerManager$: sw,
    'fetch$': fetchSingleton,
    'setInterval$': setIntervalSingleton,
    'clearInterval$': clearIntervalSingleton
  } = {}) {
    const fetchRef = fetchSingleton ?? globalThis.fetch;
    const setIntervalRef = setIntervalSingleton ?? globalThis.setInterval;
    const clearIntervalRef = clearIntervalSingleton ?? globalThis.clearInterval;
    let currentVersion = null;
    let timer = null;

    const checkOnce = async () => {
      try {
        const response = await fetchRef('version.json', { cache: 'no-store' });
        const data = await response.json();
        const registration = sw?.getRegistration();
        if (currentVersion && registration && currentVersion !== data.version) {
          if (registration.waiting && typeof registration.waiting.postMessage === 'function') {
            registration.waiting.postMessage('skip-waiting');
          }
        }
        currentVersion = data.version;
      } catch (error) {
        console.warn('[VersionWatcher] Unable to check version', error);
      }
    };

    this.start = async (intervalMs = 60_000) => {
      await checkOnce();
      if (intervalMs > 0 && typeof setIntervalRef === 'function') {
        this.stop();
        timer = setIntervalRef(() => {
          checkOnce().catch((error) => {
            console.warn('[VersionWatcher] Periodic check failed', error);
          });
        }, intervalMs);
      }
    };

    this.stop = () => {
      if (timer && typeof clearIntervalRef === 'function') {
        clearIntervalRef(timer);
        timer = null;
      }
    };

    this.checkOnce = checkOnce;
  }
}
