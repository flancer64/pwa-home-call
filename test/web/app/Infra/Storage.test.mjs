import test from 'node:test';
import assert from 'node:assert/strict';
import { createWebContainer } from '../../helper.mjs';

const STORAGE_KEY = 'homecall.user';

function createStorageMock() {
  const entries = new Map();
  return {
    getItem(key) {
      const normalized = String(key);
      return entries.has(normalized) ? entries.get(normalized) : null;
    },
    setItem(key, value) {
      entries.set(String(key), String(value));
    },
    removeItem(key) {
      entries.delete(String(key));
    },
    clear() {
      entries.clear();
    },
  };
}

function attachWindowStorage(storageMock) {
  globalThis.window = { localStorage: storageMock };
}

function detachWindowStorage() {
  if (typeof globalThis.window !== 'undefined') {
    delete globalThis.window;
  }
}

async function loadStorageModuleWithMock(initialPayload = null) {
  const storageMock = createStorageMock();
  if (initialPayload) {
    storageMock.setItem(STORAGE_KEY, JSON.stringify(initialPayload));
  }
  attachWindowStorage(storageMock);
  const container = await createWebContainer();
  const storageModule = await container.get('HomeCall_Web_Infra_Storage$');
  return { storageModule, storageMock };
}

test('stores and retrieves my data via the new model', async () => {
  const { storageModule } = await loadStorageModuleWithMock();
  try {
    assert.deepEqual(storageModule.getMyData(), { myName: null, myRoomId: null });

    const roomId = storageModule.ensureMyRoomId();
    assert.equal(typeof roomId, 'string');
    assert.equal(storageModule.getMyData().myRoomId, roomId);

    assert.equal(storageModule.setMyName('Alice'), true);
    const stored = storageModule.getMyData();
    assert.equal(stored.myName, 'Alice');
    assert.equal(stored.myRoomId, roomId);

    const userData = storageModule.getUserData();
    assert.equal(userData.userName, 'Alice');
    assert.equal(userData.roomName, roomId);
    assert.equal(typeof userData.timestamp, 'number');

    assert.equal(storageModule.setUserData({ userName: 'Bob', roomName: 'Studio' }), true);
    const updated = storageModule.getMyData();
    assert.equal(updated.myName, 'Bob');
    assert.equal(updated.myRoomId, 'Studio');
  } finally {
    detachWindowStorage();
  }
});

test('resetMyData clears entry and ensureMyRoomId regenerates room', async () => {
  const { storageModule } = await loadStorageModuleWithMock();
  try {
    const initialRoom = storageModule.ensureMyRoomId();
    assert.equal(storageModule.setMyName('Charlie'), true);
    assert.equal(storageModule.resetMyData(), true);

    assert.deepEqual(storageModule.getMyData(), { myName: null, myRoomId: null });
    const nextRoom = storageModule.ensureMyRoomId();
    assert.equal(typeof nextRoom, 'string');
    assert.notEqual(nextRoom, initialRoom);
  } finally {
    detachWindowStorage();
  }
});

test('migrates legacy payload into the new structure', async () => {
  const legacyEntry = { userName: 'Legacy', roomName: 'OldLobby', timestamp: 111 };
  const { storageModule, storageMock } = await loadStorageModuleWithMock(legacyEntry);
  try {
    const migrated = storageModule.getMyData();
    assert.equal(migrated.myName, 'Legacy');
    assert.equal(migrated.myRoomId, 'OldLobby');

    const raw = storageMock.getItem(STORAGE_KEY);
    assert.ok(raw);
    const parsed = JSON.parse(raw);
    assert.equal(parsed.myName, 'Legacy');
    assert.equal(parsed.myRoomId, 'OldLobby');
    assert.equal(parsed.userName, undefined);
    assert.equal(parsed.roomName, undefined);
  } finally {
    detachWindowStorage();
  }
});

test('returns defaults when localStorage is unavailable', async () => {
  detachWindowStorage();
  const container = await createWebContainer();
  const storageModule = await container.get('HomeCall_Web_Infra_Storage$');
  assert.deepEqual(storageModule.getMyData(), { myName: null, myRoomId: null });
  assert.equal(typeof storageModule.ensureMyRoomId(), 'string');
  assert.equal(storageModule.setMyName('Ghost'), false);
  assert.equal(storageModule.setUserData({ userName: 'Ghost', roomName: 'Void' }), false);
  assert.equal(storageModule.resetMyData(), false);
  assert.equal(storageModule.getUserData(), null);
  detachWindowStorage();
});
