import test from 'node:test';
import assert from 'node:assert/strict';
import HomeCall_Web_Ui_Screen_Invite from '../../../../../web/app/Ui/Screen/Invite.mjs';

const createMockInput = () => {
  const listeners = new Map();
  return {
    value: '',
    addEventListener(type, handler) {
      listeners.set(type, handler);
    },
    trigger(eventType) {
      const handler = listeners.get(eventType);
      if (typeof handler === 'function') {
        handler({ preventDefault: () => {} });
      }
    }
  };
};

const createMockButton = () => {
  const listeners = new Map();
  return {
    disabled: false,
    addEventListener(type, handler) {
      listeners.set(type, handler);
    },
    trigger(eventType) {
      const handler = listeners.get(eventType);
      if (typeof handler === 'function') {
        handler({ preventDefault: () => {} });
      }
    }
  };
};

const createMockForm = () => {
  const listeners = new Map();
  return {
    addEventListener(type, handler) {
      listeners.set(type, handler);
    },
    triggerSubmit() {
      const handler = listeners.get('submit');
      if (typeof handler === 'function') {
        handler({ preventDefault: () => {} });
      }
    }
  };
};

const createInviteMocks = () => {
  const form = createMockForm();
  const guestInput = createMockInput();
  const roomInput = createMockInput();
  const confirmButton = createMockButton();
  const cancelButton = createMockButton();
  const container = {
    querySelector(selector) {
      switch (selector) {
        case '#invite-form':
          return form;
        case 'input[name="guestName"]':
          return guestInput;
        case 'input[name="roomName"]':
          return roomInput;
        case 'button[data-invite-action="confirm"]':
          return confirmButton;
        case 'button[data-invite-action="cancel"]':
          return cancelButton;
        default:
          return null;
      }
    }
  };
  return { container, form, guestInput, roomInput, confirmButton, cancelButton };
};

test('Invite screen toggles submit and forwards confirm data', () => {
  const templates = { apply() {} };
  const toast = {
    errors: [],
    error(message) {
      this.errors.push(message);
    }
  };
  const confirmCalls = [];
  const { container, form, guestInput, roomInput, confirmButton } = createInviteMocks();
  const screen = new HomeCall_Web_Ui_Screen_Invite({
    HomeCall_Web_Core_TemplateLoader$: templates,
    HomeCall_Web_Ui_Toast$: toast
  });

  screen.show({
    container,
    onConfirm: (payload) => {
      confirmCalls.push(payload);
    }
  });
  assert.equal(confirmButton.disabled, true);
  form.triggerSubmit();
  assert.deepEqual(toast.errors, ['Оба поля обязательны для заполнения.']);

  guestInput.value = '  Guest  ';
  roomInput.value = '  Room123  ';
  guestInput.trigger('input');
  roomInput.trigger('input');
  assert.equal(confirmButton.disabled, false);

  form.triggerSubmit();
  assert.equal(confirmButton.disabled, false);
  assert.equal(confirmCalls.length, 1);
  assert.deepEqual(confirmCalls[0], { guestName: 'Guest', roomName: 'Room123' });
});

test('Invite screen calls cancel handler', () => {
  const templates = { apply() {} };
  const toast = { error() {} };
  let cancelled = false;
  const { container, cancelButton } = createInviteMocks();
  const screen = new HomeCall_Web_Ui_Screen_Invite({
    HomeCall_Web_Core_TemplateLoader$: templates,
    HomeCall_Web_Ui_Toast$: toast
  });

  screen.show({
    container,
    onCancel: () => {
      cancelled = true;
    }
  });
  cancelButton.trigger('click');
  assert.ok(cancelled);
});
