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
   * @param {Document} [deps.document]
   * @param {Window} [deps.window]
   * @param {Navigator} [deps.navigator]
   */
  constructor({
    HomeCall_Web_Core_TemplateLoader$: templates,
    HomeCall_Web_Media_Manager$: media,
    HomeCall_Web_Net_SignalClient$: signal,
    HomeCall_Web_Env_Provider$: env
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
  }

  /**
   * Render screen and bind events.
   * @param {Object} params
   * @param {HTMLElement} params.container - Root container for rendering the screen.
   * @param {(data: {user: string, room: string}) => void} params.onEnter
   * @param {string} [params.connectionMessage]
   */
  show({ container, onEnter, connectionMessage } = {}) {
    if (!container) {
      return;
    }
    this.templates.apply('enter', container);
    const form = container.querySelector('#enter-form');
    const errorBox = container.querySelector('#enter-error');
    const prepareButton = container.querySelector('#prepare-media');
    const settingsLink = container.querySelector('#open-settings');
    const statusBox = container.querySelector('#media-status');
    this.media.bindStatusElement(statusBox);
    if (connectionMessage && errorBox) {
      errorBox.textContent = connectionMessage;
    } else if (errorBox) {
      errorBox.textContent = '';
    }
    if (prepareButton) {
      prepareButton.addEventListener('click', (event) => {
        event.preventDefault();
        this.media.prepare().catch((error) => {
          console.error('[EnterScreen] Failed to prepare media', error);
        });
      });
    }
    if (settingsLink) {
      settingsLink.addEventListener('click', (event) => {
        event.preventDefault();
        this.openBrowserSettings();
      });
    }
    form?.addEventListener('submit', async (event) => {
      event.preventDefault();
      const formData = new FormData(form);
      const user = (formData.get('user') || '').toString().trim();
      const room = (formData.get('room') || '').toString().trim();
      if (!user || !room) {
        if (errorBox) {
          errorBox.textContent = 'Оба поля обязательны для заполнения.';
        }
        return;
      }
      try {
        await this.signal.connect();
        this.signal.join(room, user);
        onEnter?.({ user, room });
      } catch (error) {
        console.error('[EnterScreen] Failed to connect to signaling server', error);
        if (errorBox) {
          errorBox.textContent = 'Не удалось подключиться. Попробуйте позже.';
        }
      }
    });
  }

  /**
   * Open browser specific privacy settings.
   */
  openBrowserSettings() {
    if (!this.window) {
      return;
    }
    const agent = this.navigator?.userAgent || '';
    let target = 'chrome://settings/content/camera';
    if (/edg/i.test(agent)) {
      target = 'edge://settings/content/camera';
    } else if (/firefox/i.test(agent)) {
      target = 'about:preferences#privacy';
    } else if (/safari/i.test(agent) && !/chrome/i.test(agent)) {
      target = 'x-apple.systempreferences:com.apple.preference.security?Privacy_Camera';
    }
    this.window.open(target, '_blank', 'noopener');
  }
}
