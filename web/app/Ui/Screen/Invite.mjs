/**
 * @module HomeCall_Web_Ui_Screen_Invite
 * @description Renders the invite screen with two action buttons and a close FAB.
 */
const ICONS = {
  copy: '<img src="assets/icons/copy.svg" alt="" aria-hidden="true">',
  share: '<img src="assets/icons/share.svg" alt="" aria-hidden="true">',
  phone: '<img src="assets/icons/phone.svg" alt="" aria-hidden="true">'
};

export default class HomeCall_Web_Ui_Screen_Invite {
  constructor({ HomeCall_Web_Ui_Templates_Loader$: templates } = {}) {
    if (!templates) {
      throw new Error('Template loader is required for the invite screen.');
    }
    this.templates = templates;
  }

  show({ container, sessionId, inviteUrl, canShare, onCopyLink, onShareLink, onStartCall, onClose } = {}) {
    if (!container) {
      return;
    }
    this.templates.apply('invite', container);
    const linkElement = container.querySelector('#invite-link');
    if (linkElement) {
      const linkText = inviteUrl ?? '';
      linkElement.textContent = linkText;
      linkElement.setAttribute('title', linkText);
      if (sessionId) {
        linkElement.dataset.sessionId = sessionId;
      } else {
        delete linkElement.dataset.sessionId;
      }
    }

    const closeButton = container.querySelector('#invite-close');
    if (closeButton) {
      closeButton.onclick = (event) => {
        event.preventDefault();
        onClose?.();
      };
    }

    const primaryButton = container.querySelector('#invite-primary-action');
    const startButton = container.querySelector('#start-call');

    const shareHandler = typeof onShareLink === 'function' ? onShareLink : null;
    const copyHandler = typeof onCopyLink === 'function' ? onCopyLink : null;
    const shareAvailable = Boolean(canShare && shareHandler);
    const primaryHandler = shareAvailable ? shareHandler : copyHandler;
    const primaryIcon = shareAvailable ? ICONS.share : ICONS.copy;
    const primaryLabel = shareAvailable ? 'Поделиться' : 'Скопировать ссылку';

    if (primaryButton) {
      const glyph = primaryButton.querySelector('icon-wrapper');
      if (glyph) {
        glyph.innerHTML = primaryIcon;
      }
      primaryButton.setAttribute('label', primaryLabel);
      primaryButton.addEventListener('click', (event) => {
        event.preventDefault();
        primaryHandler?.();
      });
    }

    if (startButton) {
      startButton.addEventListener('click', (event) => {
        event.preventDefault();
        onStartCall?.();
      });
    }
  }
}
