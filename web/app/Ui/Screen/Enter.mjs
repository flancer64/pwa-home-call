/**
 * @module HomeCall_Web_Ui_Screen_Enter
 * @description Renders the minimal home screen with a single action.
 */
export default class HomeCall_Web_Ui_Screen_Enter {
  constructor({ HomeCall_Web_Core_TemplateLoader$: templates } = {}) {
    if (!templates) {
      throw new Error('Template loader is required for the home screen.');
    }
    this.templates = templates;
  }

  show({ container, onStartCall } = {}) {
    if (!container) {
      return;
    }
    this.templates.apply('home', container);
    const callButton = container.querySelector('#home-call');
    callButton?.addEventListener('click', (event) => {
      event.preventDefault();
      onStartCall?.();
    });
  }
}
