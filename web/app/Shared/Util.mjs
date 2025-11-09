/**
 * @module HomeCall_Web_Shared_Util
 * @description Utility helpers (UUIDs, storage) shared across contours.
 */

export default class HomeCall_Web_Shared_Util {
  constructor({ HomeCall_Web_Env_Provider$: env } = {}) {
    this.env = env ?? {};
    this.storage = {
      get: (key) => {
        try {
          return this.env.localStorage?.getItem(key) ?? null;
        } catch {
          return null;
        }
      },
      set: (key, value) => {
        try {
          this.env.localStorage?.setItem(key, value);
        } catch {}
      },
      remove: (key) => {
        try {
          this.env.localStorage?.removeItem(key);
        } catch {}
      }
    };
  }

  _randomIdSegment() {
    return Math.floor(Math.random() * Number.MAX_SAFE_INTEGER).toString(36);
  }

  uuid(prefix = 'hc') {
    const cryptoRef = this.env.crypto;
    if (cryptoRef && typeof cryptoRef.randomUUID === 'function') {
      try {
        return `${prefix}-${cryptoRef.randomUUID()}`;
      } catch {
        /* ignore */
      }
    }
    return `${prefix}-${this._randomIdSegment()}-${this._randomIdSegment()}`;
  }
}
