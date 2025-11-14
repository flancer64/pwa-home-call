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

function createUuid() {
  if (typeof globalThis !== 'undefined') {
    const cryptoApi = globalThis.crypto ?? globalThis.msCrypto;
    if (cryptoApi && typeof cryptoApi.randomUUID === 'function') {
      return cryptoApi.randomUUID();
    }
  }

  const randomSegment = () => Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
  return `${randomSegment()}${randomSegment()}-${randomSegment()}-${randomSegment()}-${randomSegment()}-${randomSegment()}${randomSegment()}${randomSegment()}`;
}

export default class HomeCall_Web_Infra_Storage {
  constructor() {
    const readRawEntry = () => {
      const storage = resolveStorage();
      if (!storage) {
        return null;
      }
      const raw = storage.getItem(STORAGE_KEY);
      return safeDeserialize(raw);
    };

    const writeNormalizedEntry = (entry) => {
      const storage = resolveStorage();
      if (!storage) {
        return false;
      }

      const payload = {
        myName: typeof entry?.myName === 'string' ? entry.myName : null,
        myRoomId: typeof entry?.myRoomId === 'string' ? entry.myRoomId : null,
        lastUpdated: typeof entry?.lastUpdated === 'number' ? entry.lastUpdated : Date.now()
      };

      const serialized = safeSerialize(payload);
      if (!serialized) {
        return false;
      }

      try {
        storage.setItem(STORAGE_KEY, serialized);
        return true;
      } catch (error) {
        return false;
      }
    };

    const normalizeEntry = (entry) => ({
      myName: typeof entry?.myName === 'string' ? entry.myName : null,
      myRoomId: typeof entry?.myRoomId === 'string' ? entry.myRoomId : null,
      lastUpdated: typeof entry?.lastUpdated === 'number' ? entry.lastUpdated : Date.now()
    });

    const convertLegacyEntry = (rawEntry) => {
      if (!rawEntry || typeof rawEntry !== 'object') {
        return null;
      }
      const legacyUserName = typeof rawEntry.userName === 'string' ? rawEntry.userName : null;
      const legacyRoomName = typeof rawEntry.roomName === 'string' ? rawEntry.roomName : null;

      if (legacyUserName === null && legacyRoomName === null) {
        return normalizeEntry(rawEntry);
      }

      const migratedRoomId = legacyRoomName || createUuid();
      return {
        myName: legacyUserName,
        myRoomId: migratedRoomId,
        lastUpdated: Date.now()
      };
    };

    const getStoredEntry = () => {
      const raw = readRawEntry();
      if (!raw) {
        return null;
      }

      const normalized = convertLegacyEntry(raw);
      if (!normalized) {
        return null;
      }

      const isLegacy = typeof raw.userName === 'string' || typeof raw.roomName === 'string';
      if (isLegacy) {
        writeNormalizedEntry(normalized);
      }

      return normalized;
    };

    this.getMyData = function getMyData() {
      const entry = getStoredEntry();
      if (!entry) {
        return { myName: null, myRoomId: null };
      }
      return {
        myName: entry.myName,
        myRoomId: entry.myRoomId
      };
    };

    this.setMyName = function setMyName(name) {
      const entry = getStoredEntry() ?? { myName: null, myRoomId: null, lastUpdated: Date.now() };
      const payload = {
        myName: typeof name === 'string' ? name : null,
        myRoomId: entry.myRoomId,
        lastUpdated: Date.now()
      };
      return writeNormalizedEntry(payload);
    };

    this.ensureMyRoomId = function ensureMyRoomId() {
      const entry = getStoredEntry() ?? { myName: null, myRoomId: null, lastUpdated: Date.now() };
      if (typeof entry.myRoomId === 'string' && entry.myRoomId.length > 0) {
        return entry.myRoomId;
      }
      const newRoomId = createUuid();
      const payload = {
        myName: entry.myName,
        myRoomId: newRoomId,
        lastUpdated: Date.now()
      };
      writeNormalizedEntry(payload);
      return newRoomId;
    };

    this.resetMyData = function resetMyData() {
      const storage = resolveStorage();
      if (!storage) {
        return false;
      }
      try {
        storage.removeItem(STORAGE_KEY);
        return true;
      } catch (error) {
        return false;
      }
    };

    this.getUserData = function getUserData() {
      const entry = getStoredEntry();
      if (!entry) {
        return null;
      }
      return {
        userName: entry.myName,
        roomName: entry.myRoomId,
        timestamp: entry.lastUpdated || null
      };
    };

    this.setUserData = function setUserData(data = {}) {
      const entry = getStoredEntry() ?? { myName: null, myRoomId: null, lastUpdated: Date.now() };
      const payload = {
        myName: typeof data.userName === 'string' ? data.userName : entry.myName,
        myRoomId: typeof data.roomName === 'string' ? data.roomName : entry.myRoomId,
        lastUpdated: Date.now()
      };
      return writeNormalizedEntry(payload);
    };

    this.clearUserData = function clearUserData() {
      return this.resetMyData();
    };

    Object.freeze(this);
  }
}
