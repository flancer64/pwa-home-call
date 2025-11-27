/**
 * @module HomeCall_Web_Ui_Screen_End
 * @description Shows summary after call ends.
 */

/**
 * @implements {HomeCall_Web_Ui_Screen_Interface}
 */
export default class HomeCall_Web_Ui_Screen_End {
  /**
   * @param {Object} deps
   * @param {HomeCall_Web_Ui_Templates_Loader} deps.HomeCall_Web_Ui_Templates_Loader$
   */
  constructor({ HomeCall_Web_Ui_Templates_Loader$: templates } = {}) {
    this.templates = templates;
  }

  /**
   * Render end screen.
   * @param {Object} params
   * @param {HTMLElement} params.container - Root container for rendering the screen.
   * @param {string} params.message
   * @param {() => void} [params.onReturn]
   */
  show({ container, connectionMessage, onReturn } = {}) {
    if (!container) {
      return;
    }
    this.templates.apply('end', container);
    const messageBox = container.querySelector('#end-message');
    if (messageBox) {
      messageBox.setAttribute(
        'text',
        connectionMessage || 'Можно начать новый сеанс в любой момент.'
      );
    }
    const returnButton = container.querySelector('#return-home');
    returnButton?.addEventListener('click', (event) => {
      event.preventDefault();
      onReturn?.();
    });
  }
}
