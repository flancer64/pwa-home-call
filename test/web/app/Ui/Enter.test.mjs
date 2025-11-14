import test from 'node:test';
import assert from 'node:assert/strict';
import HomeCall_Web_Ui_Screen_Enter from '../../../../web/app/Ui/Screen/Enter.mjs';

const createContainer = () => {
  const elements = new Map();
  const createElement = () => {
    const listeners = new Map();
    return {
      hidden: false,
      addEventListener(type, handler) {
        listeners.set(type, handler);
      },
      trigger(type) {
        const handler = listeners.get(type);
        if (typeof handler === 'function') {
          handler({ preventDefault: () => {} });
        }
      },
      setAttribute(name) {
        if (name === 'hidden') {
          this.hidden = true;
        }
      },
      removeAttribute(name) {
        if (name === 'hidden') {
          this.hidden = false;
        }
      }
    };
  };
  const form = createElement();
  const callButton = createElement();
  const formContainer = createElement();
  const callContainer = createElement();
  const nameInput = {
    value: '',
    addEventListener() {}
  };
  elements.set('#home-form', form);
  elements.set('#home-call', callButton);
  elements.set('#home-form-container', formContainer);
  elements.set('#home-call-container', callContainer);
  elements.set('input[name="user"]', nameInput);
  const container = {
    querySelector(selector) {
      return elements.get(selector);
    }
  };
  return { container, form, callButton, formContainer, callContainer, nameInput };
};

const homeScreenFactory = () => new HomeCall_Web_Ui_Screen_Enter({
  HomeCall_Web_Core_TemplateLoader$: { apply() {} }
});

test('Home screen shows call button when name is saved', () => {
  const screen = homeScreenFactory();
  const { container, formContainer, callContainer, nameInput } = createContainer();
  screen.show({ container, savedName: 'Мария', onStartCall: () => {} });
  assert.equal(nameInput.value, 'Мария');
  assert.equal(formContainer.hidden, true);
  assert.equal(callContainer.hidden, false);
});

test('Home screen displays form when name is missing', () => {
  const screen = homeScreenFactory();
  const { container, formContainer, callContainer } = createContainer();
  screen.show({ container, savedName: '', onStartCall: () => {} });
  assert.equal(formContainer.hidden, false);
  assert.equal(callContainer.hidden, true);
});

test('Home screen submits entered name', () => {
  const screen = homeScreenFactory();
  const { container, form, nameInput } = createContainer();
  let received = null;
  nameInput.value = 'Вера';
  screen.show({ container, onStartCall: (value) => { received = value; } });
  form.trigger('submit');
  assert.equal(received, 'Вера');
});

test('Home screen invokes call when the button is pressed', () => {
  const screen = homeScreenFactory();
  const { container, callButton } = createContainer();
  let triggered = false;
  screen.show({ container, savedName: 'Павел', onStartCall: () => { triggered = true; } });
  callButton.trigger('click');
  assert.equal(triggered, true);
});
