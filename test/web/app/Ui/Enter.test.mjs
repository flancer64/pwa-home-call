import test from 'node:test';
import assert from 'node:assert/strict';
import { createWebContainer } from '../../helper.mjs';

class FakeFormData {
  constructor(form) {
    this.form = form;
  }
  get(name) {
    const entry = this.form.fields?.[name];
    if (entry && typeof entry === 'object' && 'value' in entry) {
      return entry.value ?? '';
    }
    return entry ?? '';
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
  const windowStub = {};
  const navigatorStub = { userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0' };
  const documentStub = {};

  const elements = new Map();
  const createElement = (key) => {
    const listeners = new Map();
    const element = {
      key,
      textContent: '',
      hidden: false,
      value: '',
      addEventListener(type, handler) {
        listeners.set(type, handler);
      },
      trigger(type, event) {
        const handler = listeners.get(type);
        if (handler) {
          return handler(event);
        }
      }
    };
    elements.set(key, element);
    return element;
  };
  const userInput = createElement('input-user');
  const roomInput = createElement('input-room');
  const form = createElement('form');
  form.fields = { user: userInput, room: roomInput };
  const prepareButton = createElement('prepare');
  const statusBox = createElement('status');
  const containerStub = {
    appliedTemplate: null,
    querySelector(selector) {
      switch (selector) {
        case '#enter-form':
          return form;
        case '#prepare-media':
          return prepareButton;
        case '#media-status':
          return statusBox;
        case 'input[name="user"]':
          return userInput;
        case 'input[name="room"]':
          return roomInput;
        default:
          return null;
      }
    }
  };

  container.register('HomeCall_Web_Core_TemplateLoader$', templateLoader);
  container.register('HomeCall_Web_Media_Manager$', media);
  container.register('HomeCall_Web_Net_SignalClient$', signal);
  const fetchStub = async () => ({});
  const setIntervalStub = () => {};
  const clearIntervalStub = () => {};
  const WebSocketStub = class {};
  container.register('HomeCall_Web_Env_Provider$', {
    get window() {
      return windowStub;
    },
    get document() {
      return documentStub;
    },
    get navigator() {
      return navigatorStub;
    },
    get fetch() {
      return fetchStub;
    },
    get setInterval() {
      return setIntervalStub;
    },
    get clearInterval() {
      return clearIntervalStub;
    },
    get WebSocket() {
      return WebSocketStub;
    }
  });

  const storageCalls = [];
  const storage = {
    getUserData() {
      return null;
    },
    setUserData(payload) {
      storageCalls.push(payload);
      return true;
    },
    clearUserData() {}
  };
  container.register('HomeCall_Web_Infra_Storage$', storage);
  const toastCalls = [];
  const toast = {
    error(message) {
      toastCalls.push({ type: 'error', message });
    },
    success(message) {
      toastCalls.push({ type: 'success', message });
    },
    warn() {},
    info() {}
  };
  container.register('HomeCall_Web_Ui_Toast$', toast);

  try {
    const screen = await container.get('HomeCall_Web_Ui_Screen_Enter$');
    let received = null;
    const savedUser = 'SavedAlice';
    const savedRoom = 'SavedRoom';
    screen.show({
      container: containerStub,
      connectionMessage: 'Server down',
      initialUserName: savedUser,
      initialRoomName: savedRoom,
      onEnter: (data) => { received = data; }
    });

    assert.equal(containerStub.appliedTemplate, 'enter');
    assert.equal(toastCalls[0]?.type, 'error');
    assert.equal(toastCalls[0]?.message, 'Server down');
    assert.equal(media.statusElement, statusBox);
    assert.equal(userInput.value, savedUser);
    assert.equal(roomInput.value, savedRoom);

    prepareButton.trigger('click', { preventDefault() {} });
    assert.equal(prepareCalled, 1);

    userInput.value = 'Alice';
    roomInput.value = 'Room123';

    await form.trigger('submit', { preventDefault() {} });
    assert.equal(connectCalled, 1);
    assert.deepEqual(joinArgs, { room: 'Room123', user: 'Alice' });
    assert.deepEqual(received, { user: 'Alice', room: 'Room123' });
    assert.ok(toastCalls.some((call) => call.type === 'success' && call.message === 'Data saved'));
    assert.ok(toastCalls.some((call) => call.type === 'success' && call.message === 'Подключение установлено.'));
    assert.equal(storageCalls.length, 1);
    assert.deepEqual(storageCalls[0], { userName: 'Alice', roomName: 'Room123' });
  } finally {
    globalThis.FormData = originalFormData;
  }
});

test('Enter screen warns when storage save fails', async () => {
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
  const windowStub = {};
  const navigatorStub = { userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0' };
  const documentStub = {};

  const elements = new Map();
  const createElement = (key) => {
    const listeners = new Map();
    const element = {
      key,
      textContent: '',
      hidden: false,
      value: '',
      addEventListener(type, handler) {
        listeners.set(type, handler);
      },
      trigger(type, event) {
        const handler = listeners.get(type);
        if (handler) {
          return handler(event);
        }
      }
    };
    elements.set(key, element);
    return element;
  };
  const userInput = createElement('input-user');
  const roomInput = createElement('input-room');
  const form = createElement('form');
  form.fields = { user: userInput, room: roomInput };
  const prepareButton = createElement('prepare');
  const statusBox = createElement('status');
  const containerStub = {
    appliedTemplate: null,
    querySelector(selector) {
      switch (selector) {
        case '#enter-form':
          return form;
        case '#prepare-media':
          return prepareButton;
        case '#media-status':
          return statusBox;
        case 'input[name="user"]':
          return userInput;
        case 'input[name="room"]':
          return roomInput;
        default:
          return null;
      }
    }
  };

  container.register('HomeCall_Web_Core_TemplateLoader$', templateLoader);
  container.register('HomeCall_Web_Media_Manager$', media);
  container.register('HomeCall_Web_Net_SignalClient$', signal);
  const fetchStub = async () => ({});
  const setIntervalStub = () => {};
  const clearIntervalStub = () => {};
  const WebSocketStub = class {};
  container.register('HomeCall_Web_Env_Provider$', {
    get window() {
      return windowStub;
    },
    get document() {
      return documentStub;
    },
    get navigator() {
      return navigatorStub;
    },
    get fetch() {
      return fetchStub;
    },
    get setInterval() {
      return setIntervalStub;
    },
    get clearInterval() {
      return clearIntervalStub;
    },
    get WebSocket() {
      return WebSocketStub;
    }
  });

  const storageCalls = [];
  const storage = {
    getUserData() {
      return null;
    },
    setUserData(payload) {
      storageCalls.push(payload);
      return false;
    },
    clearUserData() {}
  };
  container.register('HomeCall_Web_Infra_Storage$', storage);
  const toastCalls = [];
  const toast = {
    error(message) {
      toastCalls.push({ type: 'error', message });
    },
    success(message) {
      toastCalls.push({ type: 'success', message });
    },
    warn() {},
    info() {}
  };
  container.register('HomeCall_Web_Ui_Toast$', toast);

  try {
    const screen = await container.get('HomeCall_Web_Ui_Screen_Enter$');
    let received = null;
    const savedUser = 'SavedAlice';
    const savedRoom = 'SavedRoom';
    screen.show({
      container: containerStub,
      connectionMessage: 'Server down',
      initialUserName: savedUser,
      initialRoomName: savedRoom,
      onEnter: (data) => { received = data; }
    });

    assert.equal(containerStub.appliedTemplate, 'enter');
    assert.equal(toastCalls[0]?.type, 'error');
    assert.equal(toastCalls[0]?.message, 'Server down');
    assert.equal(media.statusElement, statusBox);
    assert.equal(userInput.value, savedUser);
    assert.equal(roomInput.value, savedRoom);

    prepareButton.trigger('click', { preventDefault() {} });
    assert.equal(prepareCalled, 1);

    userInput.value = 'Alice';
    roomInput.value = 'Room123';

    await form.trigger('submit', { preventDefault() {} });
    assert.equal(connectCalled, 1);
    assert.deepEqual(joinArgs, { room: 'Room123', user: 'Alice' });
    assert.deepEqual(received, { user: 'Alice', room: 'Room123' });
    assert.ok(toastCalls.some((call) => call.type === 'error' && call.message === 'Failed to save data'));
    assert.ok(toastCalls.some((call) => call.type === 'success' && call.message === 'Подключение установлено.'));
    assert.equal(storageCalls.length, 1);
    assert.deepEqual(storageCalls[0], { userName: 'Alice', roomName: 'Room123' });
  } finally {
    globalThis.FormData = originalFormData;
  }
});
