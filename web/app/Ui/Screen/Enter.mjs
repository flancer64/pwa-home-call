/**
 * @module HomeCall_Web_Ui_Screen_Enter
 * @description Handles UI for the enter screen.
 */

/**
 * @implements {HomeCall_Web_Ui_Screen_Interface}
 */
export default class HomeCall_Web_Ui_Screen_Enter {
  /**
   * @param {Object} deps
 * @param {HomeCall_Web_Core_TemplateLoader} deps.HomeCall_Web_Core_TemplateLoader$
 * @param {HomeCall_Web_Media_Manager} deps.HomeCall_Web_Media_Manager$
 * @param {HomeCall_Web_Net_SignalClient} deps.HomeCall_Web_Net_SignalClient$
 * @param {HomeCall_Web_Shared_EventBus} deps.HomeCall_Web_Shared_EventBus$
 * @param {HomeCall_Web_Infra_Storage} deps.HomeCall_Web_Infra_Storage$
 * @param {HomeCall_Web_Ui_Toast} deps.HomeCall_Web_Ui_Toast$
 * @param {Document} [deps.document]
 * @param {Window} [deps.window]
 * @param {Navigator} [deps.navigator]
  */
  constructor({
    HomeCall_Web_Core_TemplateLoader$: templates,
    HomeCall_Web_Media_Manager$: media,
    HomeCall_Web_Net_SignalClient$: signal,
    HomeCall_Web_Shared_EventBus$: eventBus,
    HomeCall_Web_Infra_Storage$: storage,
    HomeCall_Web_Env_Provider$: env,
    HomeCall_Web_Ui_Toast$: toast
  } = {}) {
    if (!env) {
      throw new Error('HomeCall environment provider is required.');
    }
    this.templates = templates;
    this.media = media;
    this.signal = signal;
    this.document = env.document;
    this.window = env.window;
    this.navigator = env.navigator;
    this.eventBus = eventBus;
    this.storage = storage;
    if (!toast) {
      throw new Error('Toast module is required for enter screen.');
    }
    this.toast = toast;
  }

 /**
  * Render screen and bind events.
  * @param {Object} params
  * @param {HTMLElement} params.container - Root container for rendering the screen.
  * @param {(data: {user: string, room: string}) => void} params.onEnter
  * @param {string} [params.connectionMessage]
   * @param {string} [params.initialUserName]
   * @param {string} [params.initialRoomName]
  */
  show({ container, onEnter, connectionMessage, initialUserName, initialRoomName } = {}) {
    if (!container) {
      return;
    }
    this.templates.apply('enter', container);
    const form = container.querySelector('#enter-form');
    const prepareButton = container.querySelector('#prepare-media');
    const statusBox = container.querySelector('#media-status');
    this.media.bindStatusElement(statusBox);
    const userInput = container.querySelector('input[name="user"]');
    const roomInput = container.querySelector('input[name="room"]');
    if (userInput) {
      userInput.value = typeof initialUserName === 'string' ? initialUserName : '';
    }
    if (roomInput) {
      roomInput.value = typeof initialRoomName === 'string' ? initialRoomName : '';
    }
    if (connectionMessage) {
      this.toast.error(connectionMessage);
    }
    if (prepareButton) {
      prepareButton.addEventListener('click', (event) => {
        event.preventDefault();
        this.media.prepare().catch((error) => {
          console.error('[EnterScreen] Failed to prepare media', error);
        });
      });
    }
    form?.addEventListener('submit', async (event) => {
      event.preventDefault();
      const formData = new FormData(form);
      const user = (formData.get('user') || '').toString().trim();
      const room = (formData.get('room') || '').toString().trim();
      if (!user || !room) {
        this.toast.error('Оба поля обязательны для заполнения.');
        return;
      }
      try {
        await this.signal.connect();
        this.signal.join(room, user);
        const saveResult = typeof this.storage?.setUserData === 'function'
          ? this.storage.setUserData({ userName: user, roomName: room })
          : null;
        if (saveResult === true) {
          this.toast.success('Data saved');
          if (this.eventBus && typeof this.eventBus.emit === 'function') {
            this.eventBus.emit('storage:saved', { userName: user, roomName: room });
          }
        } else if (saveResult === false) {
          this.toast.error('Failed to save data');
          if (this.eventBus && typeof this.eventBus.emit === 'function') {
            this.eventBus.emit('storage:failed', { userName: user, roomName: room });
          }
        }
        this.toast.success('Подключение установлено.');
        onEnter?.({ user, room });
      } catch (error) {
        console.error('[EnterScreen] Failed to connect to signaling server', error);
        this.toast.error('Не удалось подключиться. Попробуйте позже.');
      }
    });
  }

}
