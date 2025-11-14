/**
 * @module HomeCall_Web_Ui_Screen_Enter
 * @description Renders the home screen with name input, quick actions and invites.
 */
export default class HomeCall_Web_Ui_Screen_Enter {
  constructor({ HomeCall_Web_Core_TemplateLoader$: templates } = {}) {
    if (!templates) {
      throw new Error('Template loader is required for the home screen.');
    }
    this.templates = templates;
  }

  show({ container, savedName, incomingRoom, onStartCall, onChangeName, onClearCache } = {}) {
    if (!container) {
      return;
    }
    this.templates.apply('home', container);
    const form = container.querySelector('#home-form');
    const nameInput = container.querySelector('input[name="user"]');
    const callButton = container.querySelector('#home-call');
    const callContainer = container.querySelector('#home-call-container');
    const formContainer = form;
    const savedBanner = container.querySelector('#saved-name-banner');
    const savedNameValue = container.querySelector('#saved-name-value');
    const changeButton = container.querySelector('#change-name');
    const clearCacheButton = container.querySelector('#clear-cache');
    const incomingMessage = container.querySelector('#incoming-room-message');

    const normalizedName = typeof savedName === 'string' && savedName.trim().length
      ? savedName.trim()
      : '';
    if (incomingMessage) {
      if (incomingRoom) {
        incomingMessage.textContent = `Вас пригласили в комнату ${incomingRoom}. Введите имя, чтобы присоединиться.`;
        incomingMessage.removeAttribute('hidden');
      } else {
        incomingMessage.setAttribute('hidden', '');
        incomingMessage.textContent = '';
      }
    }

    if (savedBanner && savedNameValue) {
      if (normalizedName) {
        savedNameValue.textContent = normalizedName;
        savedBanner.removeAttribute('hidden');
      } else {
        savedBanner.setAttribute('hidden', '');
      }
    }

    if (formContainer && callContainer) {
      if (normalizedName) {
        formContainer.setAttribute('hidden', '');
        callContainer.removeAttribute('hidden');
      } else {
        callContainer.setAttribute('hidden', '');
        formContainer.removeAttribute('hidden');
      }
    }

    if (nameInput && normalizedName) {
      nameInput.value = normalizedName;
    }

    form?.addEventListener('submit', (event) => {
      event.preventDefault();
      const user = (nameInput?.value ?? '').toString().trim();
      if (!user) {
        return;
      }
      onStartCall?.(user);
    });

    callButton?.addEventListener('click', (event) => {
      event.preventDefault();
      onStartCall?.();
    });

    changeButton?.addEventListener('click', (event) => {
      event.preventDefault();
      onChangeName?.();
    });

    clearCacheButton?.addEventListener('click', (event) => {
      event.preventDefault();
      onClearCache?.();
    });
  }
}
