/**
 * @module HomeCall_Web_Ui_Screen_Invite
 * @description Shows the invite screen with link sharing controls.
 */
export default class HomeCall_Web_Ui_Screen_Invite {
  constructor({ HomeCall_Web_Core_TemplateLoader$: templates } = {}) {
    if (!templates) {
      throw new Error('Template loader is required for the invite screen.');
    }
    this.templates = templates;
  }

  show({ container, sessionId, inviteUrl, canShare, onCopyLink, onShareLink, onStartCall } = {}) {
    if (!container) {
      return;
    }
    this.templates.apply('invite', container);
    const linkElement = container.querySelector('#invite-link');
    const sessionInfo = container.querySelector('#invite-session');
    const copyButton = container.querySelector('#copy-link');
    const shareButton = container.querySelector('#share-link');
    const startButton = container.querySelector('#start-call');

    if (linkElement) {
      linkElement.textContent = inviteUrl || '';
    }
    if (sessionInfo) {
      sessionInfo.textContent = sessionId
        ? `Сессия ${sessionId} готова к звонку.`
        : 'Сессия готова к использованию.';
    }
    if (shareButton) {
      if (canShare) {
        shareButton.removeAttribute('hidden');
      } else {
        shareButton.setAttribute('hidden', '');
      }
      shareButton.addEventListener('click', (event) => {
        event.preventDefault();
        onShareLink?.();
      });
    }
    copyButton?.addEventListener('click', (event) => {
      event.preventDefault();
      onCopyLink?.();
    });
    startButton?.addEventListener('click', (event) => {
      event.preventDefault();
      onStartCall?.();
    });
  }
}
