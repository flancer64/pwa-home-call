/**
 * @module HomeCall_Web_Config_RemoteLogging
 * @description Tracks the remote logging flag and persists it when storage is available.
 */

const STORAGE_KEY = 'homecall.remoteLoggingEnabled';
const PRIVATE_STATE = new WeakMap();

export default class HomeCall_Web_Config_RemoteLogging {
  constructor({ HomeCall_Web_Env_Provider$: env } = {}) {
    this.storage = env?.localStorage ?? null;
    PRIVATE_STATE.set(this, { value: this._readStoredValue() });
  }

  _readStoredValue() {
    if (!this.storage) {
      return false;
    }
    try {
      const raw = this.storage.getItem(STORAGE_KEY);
      if (raw === '1' || raw === 'true') {
        return true;
      }
      if (raw === '0' || raw === 'false') {
        return false;
      }
    } catch {
      // fall through when storage is not writable
    }
    return false;
  }

  _persistValue(nextValue) {
    if (!this.storage) {
      return;
    }
    try {
      this.storage.setItem(STORAGE_KEY, nextValue ? '1' : '0');
    } catch {
      // ignore storage failures
    }
  }

  _getState() {
    return PRIVATE_STATE.get(this) ?? { value: false };
  }

  isRemoteLoggingEnabled() {
    return Boolean(this._getState().value);
  }

  setRemoteLoggingEnabled(flag) {
    const normalized = Boolean(flag);
    const state = this._getState();
    if (state.value === normalized) {
      return normalized;
    }
    state.value = normalized;
    this._persistValue(normalized);
    return normalized;
  }

  toggleRemoteLogging() {
    return this.setRemoteLoggingEnabled(!this._getState().value);
  }
}
