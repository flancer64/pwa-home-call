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

    const checkOnce = async () => {
      try {
        const response = await fetchRef('version.json', { cache: 'no-store' });
        const data = await response.json();
        const nextVersion = data?.version ?? null;
        if (currentVersion && nextVersion && currentVersion !== nextVersion) {
          log?.info?.(
            `[VersionWatcher] Version change detected: ${currentVersion} → ${nextVersion}`
          );
          const registration = await sw?.getRegistration();
          if (registration?.active && typeof registration.active.postMessage === 'function') {
            registration.active.postMessage({
              type: 'clear-caches-and-rebuild',
              version: nextVersion
            });
            log?.info?.(`[VersionWatcher] Triggered cache rebuild for ${nextVersion}`);
          }
        }
        if (nextVersion) {
          currentVersion = nextVersion;
        }
      } catch (error) {
        log.warn('[VersionWatcher] Unable to check version', error);
      }
    };

    this.start = async (intervalMs = 3_600_000) => {
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
