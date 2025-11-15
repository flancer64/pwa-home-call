/**
 * @module HomeCall_Web_Media_Monitor
 * @description Observes media device changes.
 */

export default class HomeCall_Web_Media_Monitor {
  constructor({ HomeCall_Web_Env_Provider$: env } = {}) {
    if (!env) {
      throw new Error('Kolobok environment provider is required.');
    }
    const navigatorRef = env.navigator;
    let listener = null;

    this.register = (callback) => {
      if (listener || !navigatorRef || !navigatorRef.mediaDevices) {
        return;
      }
      const mediaDevices = navigatorRef.mediaDevices;
      const handler = () => {
        try {
          callback?.();
        } catch (error) {
          console.error('[Monitor] Callback failed', error);
        }
      };
      if (typeof mediaDevices.addEventListener === 'function') {
        mediaDevices.addEventListener('devicechange', handler);
      } else {
        mediaDevices.ondevicechange = handler;
      }
      listener = handler;
    };
  }
}
