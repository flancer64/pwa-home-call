import test from 'node:test';
import assert from 'node:assert/strict';
import { createWebContainer } from '../../../helper.mjs';

test('DevRouter dispatches screens based on window hash', async () => {
  const container = await createWebContainer();
  const record = [];
  const flow = {
    showHome(params) { record.push({ screen: 'home', params }); },
    showInvite(params) { record.push({ screen: 'invite', params }); },
    showCall(params) { record.push({ screen: 'call', params }); },
    showSettings(params) { record.push({ screen: 'settings', params }); },
    showEnd(params) { record.push({ screen: 'end', params }); }
  };
  const listeners = {};
  const windowStub = {
    location: { hash: '#invite' },
    addEventListener(event, callback) {
      listeners[event] = callback;
    }
  };
  const env = {
    window: windowStub,
    document: { getElementById() { return null; } },
    navigator: {},
    fetch: async () => ({ json: async () => ({}), text: async () => '' }),
    setInterval() {},
    clearInterval() {},
    WebSocket: class {}
  };
  const logger = { info() {} };

  container.register('HomeCall_Web_Ui_Flow$', flow);
  container.register('HomeCall_Web_Env_Provider$', env);
  container.register('HomeCall_Web_Logger$', logger);

  const router = await container.get('HomeCall_Web_Ui_Router_Dev$');
  router.init();

  assert.strictEqual(record.length, 1, 'DevRouter should run once during init');
  assert.strictEqual(record[0].screen, 'invite');
  assert.strictEqual(record[0].params?.sessionId, 'dev');
  assert.strictEqual(record[0].params?.inviteUrl, 'dev-link');
  assert.strictEqual(typeof listeners.hashchange, 'function', 'hashchange listener is registered');

  windowStub.location.hash = '#call';
  listeners.hashchange?.();

  assert.strictEqual(record.length, 2, 'Hash change should trigger new screen');
  assert.strictEqual(record[1].screen, 'call');
  assert.deepStrictEqual(record[1].params, {});

  windowStub.location.hash = '#settings';
  listeners.hashchange?.();

  assert.strictEqual(record.length, 3, 'Settings hash should render new screen');
  assert.strictEqual(record[2].screen, 'settings');
});
