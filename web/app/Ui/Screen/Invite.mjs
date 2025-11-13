/**
 * @module HomeCall_Web_Ui_Screen_Invite
 * @description Handles the invite form used to generate share links.
 */

/**
 * @implements {HomeCall_Web_Ui_Screen_Interface}
 */
export default class HomeCall_Web_Ui_Screen_Invite {
  /**
   * @param {Object} deps
 * @param {HomeCall_Web_Core_TemplateLoader} deps.HomeCall_Web_Core_TemplateLoader$
 * @param {HomeCall_Web_Ui_Toast} deps.HomeCall_Web_Ui_Toast$
   */
  constructor({
    HomeCall_Web_Core_TemplateLoader$: templates,
    HomeCall_Web_Ui_Toast$: toast
  } = {}) {
    if (!templates) {
      throw new Error('Template loader is required for the invite screen.');
    }
    if (!toast) {
      throw new Error('Toast module is required for the invite screen.');
    }
    this.templates = templates;
    this.toast = toast;
  }

  /**
   * @param {Object} params
   * @param {HTMLElement} params.container
   * @param {string} [params.initialGuestName]
   * @param {string} [params.initialRoomName]
   */
  show({ container, initialGuestName, initialRoomName, onConfirm, onCancel } = {}) {
    if (!container) {
      return;
    }
    this.templates.apply('invite', container);
    const form = container.querySelector('#invite-form');
    if (!form) {
      return;
    }
    const guestInput = container.querySelector('input[name="guestName"]');
    const roomInput = container.querySelector('input[name="roomName"]');
    const confirmButton = container.querySelector('button[data-invite-action="confirm"]');
    const cancelButton = container.querySelector('button[data-invite-action="cancel"]');

    const normalizeValue = (value) => (typeof value === 'string' ? value.trim() : '');

    if (guestInput && typeof initialGuestName === 'string') {
      guestInput.value = initialGuestName;
    }
    if (roomInput && typeof initialRoomName === 'string') {
      roomInput.value = initialRoomName;
    }

    const updateButtonState = () => {
      if (!confirmButton) {
        return;
      }
      const guestValue = normalizeValue(guestInput?.value);
      const roomValue = normalizeValue(roomInput?.value);
      confirmButton.disabled = !(guestValue && roomValue);
    };

    updateButtonState();

    const attachInputListeners = (input) => {
      if (!input) {
        return;
      }
      input.addEventListener('input', updateButtonState);
    };

    attachInputListeners(guestInput);
    attachInputListeners(roomInput);

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const guestName = normalizeValue(guestInput?.value);
      const roomName = normalizeValue(roomInput?.value);
      if (!guestName || !roomName) {
        this.toast.error('Оба поля обязательны для заполнения.');
        return;
      }
      if (typeof onConfirm === 'function') {
        onConfirm({ guestName, roomName });
      }
    });

    cancelButton?.addEventListener('click', (event) => {
      event.preventDefault();
      if (typeof onCancel === 'function') {
        onCancel();
      }
    });
  }
}
