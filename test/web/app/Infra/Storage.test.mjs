import test from 'node:test';
import assert from 'node:assert/strict';
import { createWebContainer } from '../../helper.mjs';

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

async function loadStorageModuleWithMock() {
  const storageMock = createStorageMock();
  attachWindowStorage(storageMock);
  const container = await createWebContainer();
  const storageModule = await container.get('HomeCall_Web_Infra_Storage$');
  return { storageModule, storageMock };
}

test('stores and retrieves user data', async () => {
  const { storageModule } = await loadStorageModuleWithMock();
  try {
    assert.equal(storageModule.getUserData(), null);

    assert.equal(storageModule.setUserData({ userName: 'Alice', roomName: 'Lobby' }), true);
    const saved = storageModule.getUserData();

    assert.equal(saved.userName, 'Alice');
    assert.equal(saved.roomName, 'Lobby');
    assert.equal(typeof saved.timestamp, 'number');
  } finally {
    detachWindowStorage();
  }
});

test('replaces saved data on consecutive writes', async () => {
  const { storageModule } = await loadStorageModuleWithMock();
  try {
    assert.equal(storageModule.setUserData({ userName: 'Alice', roomName: 'Lobby' }), true);
    const first = storageModule.getUserData();

    assert.ok(first);
    assert.equal(storageModule.setUserData({ userName: 'Bob', roomName: 'Studio' }), true);
    const second = storageModule.getUserData();

    assert.equal(second.userName, 'Bob');
    assert.equal(second.roomName, 'Studio');
    assert.ok(second.timestamp >= first.timestamp);
  } finally {
    detachWindowStorage();
  }
});

test('clears stored user data', async () => {
  const { storageModule } = await loadStorageModuleWithMock();
  try {
    assert.equal(storageModule.setUserData({ userName: 'Alice', roomName: 'Lobby' }), true);
    assert.ok(storageModule.getUserData());

    assert.equal(storageModule.clearUserData(), true);
    assert.equal(storageModule.getUserData(), null);
  } finally {
    detachWindowStorage();
  }
});

test('returns null when localStorage is unavailable', async () => {
  detachWindowStorage();
  const container = await createWebContainer();
  const storageModule = await container.get('HomeCall_Web_Infra_Storage$');
  assert.equal(storageModule.getUserData(), null);
  assert.equal(storageModule.setUserData({ userName: 'Ghost', roomName: 'Void' }), false);
  assert.equal(storageModule.clearUserData(), false);
  assert.equal(storageModule.getUserData(), null);
  detachWindowStorage();
});
