import test from 'node:test';
import assert from 'node:assert/strict';
import { createWebContainer } from '../../../helper.mjs';

class FakeFormData {
  constructor(form) {
    this.form = form;
  }
  get(name) {
    return this.form.fields?.[name] ?? '';
  }
}

test('Enter screen handles events and propagates data', async () => {
  const originalFormData = globalThis.FormData;
  globalThis.FormData = FakeFormData;
  const container = await createWebContainer();
  const templateLoader = {
    apply(name, target) {
      target.appliedTemplate = name;
    }
  };
  let prepareCalled = 0;
  const media = {
    bindStatusElement(element) {
      this.statusElement = element;
    },
    bindLocalElements() {},
    async prepare() {
      prepareCalled += 1;
    }
  };
  let connectCalled = 0;
  let joinArgs = null;
  const signal = {
    async connect() {
      connectCalled += 1;
    },
    join(room, user) {
      joinArgs = { room, user };
    }
  };
  let openedUrl = null;
  const windowStub = {
    open(url) {
      openedUrl = url;
    }
  };
  const navigatorStub = { userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0' };

  const elements = new Map();
  const createElement = (key) => {
    const listeners = new Map();
    const element = {
      key,
      textContent: '',
      hidden: false,
      addEventListener(type, handler) {
        listeners.set(type, handler);
      },
      trigger(type, event) {
        const handler = listeners.get(type);
        if (handler) {
          handler(event);
        }
      }
    };
    elements.set(key, element);
    return element;
  };
  const form = createElement('form');
  form.fields = { user: 'Alice', room: 'Room123' };
  const errorBox = createElement('error');
  const prepareButton = createElement('prepare');
  const settingsLink = createElement('settings');
  const statusBox = createElement('status');

  const containerStub = {
    appliedTemplate: null,
    querySelector(selector) {
      switch (selector) {
        case '#enter-form':
          return form;
        case '#enter-error':
          return errorBox;
        case '#prepare-media':
          return prepareButton;
        case '#open-settings':
          return settingsLink;
        case '#media-status':
          return statusBox;
        default:
          return null;
      }
    }
  };

  container.register('HomeCall_Web_Core_TemplateLoader$', templateLoader);
  container.register('HomeCall_Web_Media_Manager$', media);
  container.register('HomeCall_Web_Net_SignalClient$', signal);
  container.register('window$', windowStub);
  container.register('navigator$', navigatorStub);
  container.register('document$', {});

  try {
    const screen = await container.get('HomeCall_Web_Ui_Screen_Enter$');
    let received = null;
    screen.show({ container: containerStub, connectionMessage: 'Server down', onEnter: (data) => { received = data; } });

    assert.equal(containerStub.appliedTemplate, 'enter');
    assert.equal(errorBox.textContent, 'Server down');
    assert.equal(media.statusElement, statusBox);

    prepareButton.trigger('click', { preventDefault() {} });
    assert.equal(prepareCalled, 1);

    settingsLink.trigger('click', { preventDefault() {} });
    assert.ok(openedUrl?.startsWith('chrome'));

    await form.trigger('submit', { preventDefault() {} });
    assert.equal(connectCalled, 1);
    assert.deepEqual(joinArgs, { room: 'Room123', user: 'Alice' });
    assert.deepEqual(received, { user: 'Alice', room: 'Room123' });
  } finally {
    globalThis.FormData = originalFormData;
  }
});
