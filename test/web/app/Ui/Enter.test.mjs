import test from 'node:test';
import assert from 'node:assert/strict';
import { createWebContainer } from '../../helper.mjs';

const createContainer = () => {
  const listeners = new Map();
  const button = {
    addEventListener(type, handler) {
      listeners.set(type, handler);
    },
    trigger(type) {
      const handler = listeners.get(type);
      if (typeof handler === 'function') {
        handler({ preventDefault: () => {} });
      }
    }
  };
  const container = {
    querySelector(selector) {
      return selector === '#home-call' ? button : null;
    }
  };
  return { container, callButton: button };
};

test('Home screen triggers callback when call button is pressed', async () => {
  const container = await createWebContainer();
  container.register('HomeCall_Web_Ui_Templates_Loader$', { apply() {} });
  const screen = await container.get('HomeCall_Web_Ui_Screen_Enter$');
  const { container: dom, callButton } = createContainer();
  let triggered = false;
  screen.show({ container: dom, onStartCall: () => { triggered = true; } });
  callButton.trigger('click');
  assert.equal(triggered, true);
});
