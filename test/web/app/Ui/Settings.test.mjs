import test from 'node:test';
import assert from 'node:assert/strict';
import { createWebContainer } from '../../helper.mjs';

const createDom = (closeButton, reinstallButton, remoteToggleButton = null) => ({
  querySelector(selector) {
    if (selector === '.settings-close') {
      return closeButton;
    }
    if (selector === '#settings-reinstall') {
      return reinstallButton;
    }
    if (selector === '#settings-remote-logging') {
      return remoteToggleButton;
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

const createRemoteToggleButton = () => {
  const listeners = new Map();
  const attributes = { 'aria-pressed': 'false' };
  return {
    addEventListener(type, handler) {
      listeners.set(type, handler);
    },
    setAttribute(name, value) {
      attributes[name] = value;
    },
    getAttribute(name) {
      return attributes[name];
    },
    async trigger() {
      const handler = listeners.get('click');
      if (typeof handler === 'function') {
        await handler({ preventDefault() {} });
      }
    }
  };
};

const createRemoteLoggingConfig = (initial = false) => {
  let state = Boolean(initial);
  const calls = [];
  return {
    isRemoteLoggingEnabled() {
      return state;
    },
    setRemoteLoggingEnabled(value) {
      state = Boolean(value);
      calls.push(state);
    },
    get calls() {
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
  container.register('HomeCall_Web_Config_RemoteLogging$', createRemoteLoggingConfig());
  const screen = await container.get('HomeCall_Web_Ui_Screen_Settings$');
  const closeButton = createActionButton();
  const reinstallButton = createReinstallButton();
  const remoteToggle = createRemoteToggleButton();
  const dom = createDom(closeButton, reinstallButton, remoteToggle);
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
  container.register('HomeCall_Web_Config_RemoteLogging$', createRemoteLoggingConfig());
  const screen = await container.get('HomeCall_Web_Ui_Screen_Settings$');
  const closeButton = { addEventListener() {} };
  const reinstallButton = createReinstallButton();
  const dom = createDom(closeButton, reinstallButton, createRemoteToggleButton());
  screen.show({ container: dom });
  await reinstallButton.trigger();
  assert.equal(clearCalls, 1);
  assert.deepStrictEqual(reinstallButton.callLog, [
    { action: 'set', name: 'disabled' },
    { action: 'remove', name: 'disabled' }
  ]);
});

test('Remote logging toggle updates configuration state', async () => {
  const container = await createWebContainer();
  container.register('HomeCall_Web_Ui_Templates_Loader$', { apply() {} });
  container.register('HomeCall_Web_Pwa_Cache$', { async clear() {} });
  const loggingConfig = createRemoteLoggingConfig(false);
  container.register('HomeCall_Web_Config_RemoteLogging$', loggingConfig);
  const loggerCalls = [];
  const logger = {
    setRemoteLoggingEnabled(value) {
      loggerCalls.push(value);
      loggingConfig.setRemoteLoggingEnabled(value);
    }
  };
  container.register('HomeCall_Web_Logger$', logger);
  const screen = await container.get('HomeCall_Web_Ui_Screen_Settings$');
  const closeButton = { addEventListener() {} };
  const reinstallButton = { addEventListener() {} };
  const remoteToggle = createRemoteToggleButton();
  const dom = createDom(closeButton, reinstallButton, remoteToggle);
  screen.show({ container: dom });
  assert.equal(remoteToggle.getAttribute('aria-pressed'), 'false');
  await remoteToggle.trigger();
  assert.deepStrictEqual(loggingConfig.calls, [true]);
  assert.equal(remoteToggle.getAttribute('aria-pressed'), 'true');
  await remoteToggle.trigger();
  assert.deepStrictEqual(loggingConfig.calls, [true, false]);
  assert.deepStrictEqual(loggerCalls, [true, false]);
  assert.equal(remoteToggle.getAttribute('aria-pressed'), 'false');
});
