/**
 * @module HomeCall_Web_Config_RemoteLogging
 * @description Tracks the remote logging flag and persists it when storage is available.
 */

const STORAGE_KEY = 'homecall.remoteLoggingEnabled';

export default function HomeCall_Web_Config_RemoteLogging({ HomeCall_Web_Env_Provider$: env } = {}) {
  const storage = env?.localStorage ?? null;

  const readStoredValue = () => {
    if (!storage) {
      return false;
    }
    try {
      const raw = storage.getItem(STORAGE_KEY);
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
  };

  const persistValue = (nextValue) => {
    if (!storage) {
      return;
    }
    try {
      storage.setItem(STORAGE_KEY, nextValue ? '1' : '0');
    } catch {
      // ignore storage failures
    }
  };

  const state = { value: readStoredValue() };

  const isRemoteLoggingEnabled = () => Boolean(state.value);

  const setRemoteLoggingEnabled = (flag) => {
    const normalized = Boolean(flag);
    if (state.value === normalized) {
      return normalized;
    }
    state.value = normalized;
    persistValue(normalized);
    return normalized;
  };

  const toggleRemoteLogging = () => setRemoteLoggingEnabled(!state.value);

  return {
    isRemoteLoggingEnabled,
    setRemoteLoggingEnabled,
    toggleRemoteLogging
  };
}
