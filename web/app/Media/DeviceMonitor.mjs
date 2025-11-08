/**
 * @module HomeCall_Web_Media_DeviceMonitor
 * @description Observes media device changes.
 */

export default class HomeCall_Web_Media_DeviceMonitor {
  constructor({ 'navigator$': navSingleton } = {}) {
    const navigatorRef = navSingleton ?? globalThis.navigator;
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
          console.error('[DeviceMonitor] Callback failed', error);
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
