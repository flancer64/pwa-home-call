import test from 'node:test';
import assert from 'node:assert/strict';
import { createWebContainer } from '../../helper.mjs';

const createDom = (closeButton, reinstallButton) => ({
  querySelector(selector) {
    if (selector === '.settings-close') {
      return closeButton;
    }
    if (selector === '#settings-reinstall') {
      return reinstallButton;
    }
    return null;
  }
});

const createActionButton = () => {
  const listeners = new Map();
  return {
    addEventListener(type, handler) {
      listeners.set(type, handler);
    },
    async trigger(type = 'click') {
      const handler = listeners.get(type);
      if (typeof handler === 'function') {
        await handler({ preventDefault() {} });
      }
    }
  };
};

const createReinstallButton = () => {
  const clicks = createActionButton();
  const calls = [];
  return {
    addEventListener(type, handler) {
      clicks.addEventListener(type, handler);
    },
    async trigger() {
      await clicks.trigger();
    },
    setAttribute(name) {
      calls.push({ action: 'set', name });
    },
    removeAttribute(name) {
      calls.push({ action: 'remove', name });
    },
    get callLog() {
      return calls.slice();
    }
  };
};

test('Settings close button calls provided handler', async () => {
  const container = await createWebContainer();
  container.register('HomeCall_Web_Ui_Templates_Loader$', { apply() {} });
  let clearCalls = 0;
  container.register('HomeCall_Web_Pwa_Cache$', {
    async clear() {
      clearCalls += 1;
    }
  });
  const screen = await container.get('HomeCall_Web_Ui_Screen_Settings$');
  const closeButton = createActionButton();
  const reinstallButton = createReinstallButton();
  const dom = createDom(closeButton, reinstallButton);
  let closed = false;
  screen.show({ container: dom, onClose: () => { closed = true; } });
  await closeButton.trigger();
  assert.equal(closed, true);
  assert.equal(clearCalls, 0);
});

test('Settings reinstall button clears cache and toggles disable', async () => {
  const container = await createWebContainer();
  container.register('HomeCall_Web_Ui_Templates_Loader$', { apply() {} });
  let clearCalls = 0;
  container.register('HomeCall_Web_Pwa_Cache$', {
    async clear() {
      clearCalls += 1;
    }
  });
  const screen = await container.get('HomeCall_Web_Ui_Screen_Settings$');
  const closeButton = { addEventListener() {} };
  const reinstallButton = createReinstallButton();
  const dom = createDom(closeButton, reinstallButton);
  screen.show({ container: dom });
  await reinstallButton.trigger();
  assert.equal(clearCalls, 1);
  assert.deepStrictEqual(reinstallButton.callLog, [
    { action: 'set', name: 'disabled' },
    { action: 'remove', name: 'disabled' }
  ]);
});
