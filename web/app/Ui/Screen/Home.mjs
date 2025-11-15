/**
 * @module HomeCall_Web_Ui_Screen_Home
 * @description Renders the minimal home screen with a single action.
 */
export default class HomeCall_Web_Ui_Screen_Home {
  constructor({ HomeCall_Web_Ui_Templates_Loader$: templates } = {}) {
    if (!templates) {
      throw new Error('Template loader is required for the home screen.');
    }
    this.templates = templates;
  }

  show({ container, onStartCall, onOpenSettings } = {}) {
    if (!container) {
      return;
    }
    this.templates.apply('home', container);
    const callButton = container.querySelector('#home-call');
    callButton?.addEventListener('click', (event) => {
      event.preventDefault();
      onStartCall?.();
    });
    const settingsButton = container.querySelector('.home-settings');
    settingsButton?.addEventListener('click', (event) => {
      event.preventDefault();
      onOpenSettings?.();
    });
  }
}
