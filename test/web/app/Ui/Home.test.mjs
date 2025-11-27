import test from 'node:test';
import assert from 'node:assert/strict';
import { createWebContainer } from '../../helper.mjs';

const createContainer = () => {
  const callListeners = new Map();
  const button = {
    addEventListener(type, handler) {
      callListeners.set(type, handler);
    },
    trigger(type) {
      const handler = callListeners.get(type);
      if (typeof handler === 'function') {
        handler({ preventDefault: () => {} });
      }
    }
  };
  const container = {
    querySelector(selector) {
      if (selector === '#home-call') {
        return button;
      }
      return null;
    }
  };
  return { container, callButton: button };
};

test('Home screen triggers callback when call button is pressed', async () => {
  const container = await createWebContainer();
  container.register('HomeCall_Web_Ui_Templates_Loader$', { apply() {} });
  const screen = await container.get('HomeCall_Web_Ui_Screen_Home$');
  const { container: dom, callButton } = createContainer();
  let triggered = false;
  screen.show({ container: dom, onStartCall: () => { triggered = true; } });
  callButton.trigger('click');
  assert.equal(triggered, true);
});
