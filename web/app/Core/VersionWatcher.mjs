/**
 * @module HomeCall_Web_Core_VersionWatcher
 * @description Checks application version and triggers updates when needed.
 */

export default class HomeCall_Web_Core_VersionWatcher {
  constructor({
    HomeCall_Web_Core_ServiceWorkerManager$: sw,
    HomeCall_Web_Env_Provider$: env,
    HomeCall_Web_Shared_Logger$: logger
  } = {}) {
    if (!env) {
      throw new Error('HomeCall environment provider is required.');
    }
    const fetchRef = env.fetch;
    const setIntervalRef = env.setInterval;
    const clearIntervalRef = env.clearInterval;
    const log = logger ?? console;
    let currentVersion = null;
    let timer = null;

    const notifySkipWaiting = (registration) => {
      if (!registration) {
        return;
      }

      const sendMessage = (worker) => {
        if (worker && typeof worker.postMessage === 'function') {
          worker.postMessage('skip-waiting');
          return true;
        }
        return false;
      };

      if (sendMessage(registration.waiting)) {
        return;
      }

      const installing = registration.installing;
      if (!installing || typeof installing.addEventListener !== 'function') {
        return;
      }

      const handleStateChange = () => {
        if (installing.state === 'installed') {
          sendMessage(registration.waiting) || sendMessage(installing);
          installing.removeEventListener('statechange', handleStateChange);
          return;
        }
        if (installing.state === 'redundant') {
          installing.removeEventListener('statechange', handleStateChange);
        }
      };

      installing.addEventListener('statechange', handleStateChange);
    };

    const ensureRegistrationUpdate = async (registration) => {
      if (!registration || typeof registration.update !== 'function') {
        return;
      }
      try {
        await registration.update();
      } catch (updateError) {
        log.warn('[VersionWatcher] Failed to update service worker', updateError);
      }
    };

    const checkOnce = async () => {
      try {
        const response = await fetchRef('version.json', { cache: 'no-store' });
        const data = await response.json();
        const nextVersion = data?.version ?? null;
        const registration = sw?.getRegistration();
        if (currentVersion && nextVersion && currentVersion !== nextVersion) {
          log?.info?.(
            `[VersionWatcher] Version change detected: ${currentVersion} → ${nextVersion}`
          );
          if (registration) {
            await ensureRegistrationUpdate(registration);
            notifySkipWaiting(registration);
          }
        }
        if (nextVersion) {
          currentVersion = nextVersion;
        }
      } catch (error) {
        log.warn('[VersionWatcher] Unable to check version', error);
      }
    };

    this.start = async (intervalMs = 60_000) => {
      await checkOnce();
      if (intervalMs > 0 && typeof setIntervalRef === 'function') {
        this.stop();
        timer = setIntervalRef(() => {
          checkOnce().catch((error) => {
            log.warn('[VersionWatcher] Periodic check failed', error);
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
