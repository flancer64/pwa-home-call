import test from 'node:test';
import assert from 'node:assert/strict';
import HomeCall_Web_Ui_Screen_Enter from '../../../../web/app/Ui/Screen/Enter.mjs';

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

const homeScreenFactory = () => new HomeCall_Web_Ui_Screen_Enter({
  HomeCall_Web_Core_TemplateLoader$: { apply() {} }
});

test('Home screen triggers callback when call button is pressed', () => {
  const screen = homeScreenFactory();
  const { container, callButton } = createContainer();
  let triggered = false;
  screen.show({ container, onStartCall: () => { triggered = true; } });
  callButton.trigger('click');
  assert.equal(triggered, true);
});
