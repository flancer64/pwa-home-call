import test from 'node:test';
import assert from 'node:assert/strict';

test('CacheCleaner removes caches and triggers reload', async () => {
  const moduleUrl = new URL('../../../../web/app/Pwa/CacheCleaner.mjs', import.meta.url);
  const { default: CacheCleaner } = await import(moduleUrl);
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

  const cleaner = new CacheCleaner({ HomeCall_Web_Env_Provider$: envProvider });
  try {
    await cleaner.clear();
    assert.deepEqual(deletedKeys, ['homecall-v0', 'homecall-v1']);
    assert.equal(unregisterCalls.length, 1);
    assert.equal(reloadCalls.length, 1);
  } finally {
    globalThis.caches = originalCaches;
  }
});
