const STORAGE_KEY = 'homecall.user';

function resolveStorage() {
  if (typeof globalThis === 'undefined') {
    return null;
  }

  const candidate = globalThis.window?.localStorage ?? globalThis.localStorage;
  if (!candidate) {
    return null;
  }

  const hasRequiredMethods =
    typeof candidate.getItem === 'function' &&
    typeof candidate.setItem === 'function' &&
    typeof candidate.removeItem === 'function';

  return hasRequiredMethods ? candidate : null;
}

function safeDeserialize(value) {
  if (typeof value !== 'string' || value.length === 0) {
    return null;
  }

  try {
    const parsed = JSON.parse(value);
    if (parsed && typeof parsed === 'object') {
      return parsed;
    }
  } catch (error) {
    // ignore deserialization errors to keep storage resilient
  }

  return null;
}

function safeSerialize(entry) {
  try {
    return JSON.stringify(entry);
  } catch (error) {
    return null;
  }
}

export default class HomeCall_Web_Infra_Storage {
  constructor() {

    this.getUserData = function getUserData() {
      const storage = resolveStorage();
      if (!storage) {
        return null;
      }

      const raw = storage.getItem(STORAGE_KEY);
      const payload = safeDeserialize(raw);
      if (!payload) {
        return null;
      }

      const { userName = null, roomName = null, timestamp = null } = payload;
      return { userName, roomName, timestamp };
    };

    this.setUserData = function setUserData(data = {}) {
      const storage = resolveStorage();
      if (!storage) {
        return false;
      }

      const entry = {
        userName: typeof data.userName === 'string' ? data.userName : null,
        roomName: typeof data.roomName === 'string' ? data.roomName : null,
        timestamp: Date.now(),
      };

      const serialized = safeSerialize(entry);
      if (!serialized) {
        return false;
      }

      try {
        storage.setItem(STORAGE_KEY, serialized);
        return true;
      } catch (error) {
        // swallow storage write errors to preserve flow
        return false;
      }
    };

    this.clearUserData = function clearUserData() {
      const storage = resolveStorage();
      if (!storage) {
        return false;
      }

      try {
        storage.removeItem(STORAGE_KEY);
        return true;
      } catch (error) {
        // ignore removal failures
        return false;
      }
    };

    Object.freeze(this);
  }
}
