/**
 * @module HomeCall_Web_Ui_Screen_End
 * @description Shows summary after call ends.
 */

export default class HomeCall_Web_Ui_Screen_End {
  /**
   * @param {Object} deps
   * @param {HomeCall_Web_Core_TemplateLoader} deps.HomeCall_Web_Core_TemplateLoader$
   */
  constructor({ HomeCall_Web_Core_TemplateLoader$: templates } = {}) {
    this.templates = templates;
  }

  /**
   * Render end screen.
   * @param {Object} params
   * @param {HTMLElement} params.container
   * @param {string} params.message
   * @param {() => void} params.onBack
   */
  show({ container, message, onBack } = {}) {
    if (!container) {
      return;
    }
    this.templates.apply('end', container);
    const messageBox = container.querySelector('#end-message');
    const backButton = container.querySelector('#back-to-lobby');
    if (messageBox) {
      messageBox.textContent = message || 'The session has finished. You can return to the lobby.';
    }
    backButton?.addEventListener('click', () => {
      onBack?.();
    });
  }
}
