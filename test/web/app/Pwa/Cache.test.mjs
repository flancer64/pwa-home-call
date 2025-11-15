import test from 'node:test';
import assert from 'node:assert/strict';
import { createWebContainer } from '../../helper.mjs';

test('Cache removes caches and triggers reload', async () => {
  const container = await createWebContainer();
  const originalCaches = globalThis.caches;
  const deletedKeys = [];
  globalThis.caches = {
    async keys() {
      return ['homecall-v0', 'homecall-v1'];
    },
    async delete(name) {
      deletedKeys.push(name);
      return true;
    }
  };
  const reloadCalls = [];
  const unregisterCalls = [];
  const serviceWorkerRegistrations = [
    {
      async unregister() {
        unregisterCalls.push('one');
        return true;
      }
    }
  ];
  const envProvider = {
    get window() {
      return {
        location: {
          reload() {
            reloadCalls.push(true);
          }
        }
      };
    },
    get navigator() {
      return {
        serviceWorker: {
          async getRegistrations() {
            return serviceWorkerRegistrations;
          }
        }
      };
    }
  };

  container.register('HomeCall_Web_Env_Provider$', envProvider);
  const cleaner = await container.get('HomeCall_Web_Pwa_Cache$');
  try {
    await cleaner.clear();
    assert.deepEqual(deletedKeys, ['homecall-v0', 'homecall-v1']);
    assert.equal(unregisterCalls.length, 1);
    assert.equal(reloadCalls.length, 1);
  } finally {
    globalThis.caches = originalCaches;
  }
});
