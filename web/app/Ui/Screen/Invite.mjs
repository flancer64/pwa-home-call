/**
 * @module HomeCall_Web_Ui_Screen_Invite
 * @description Renders the invite screen with two action buttons and a close FAB.
 */
const ICONS = {
  copy: '<svg viewBox="0 0 24 24" role="presentation" focusable="false"><rect x="9" y="3" width="13" height="13" rx="2" fill="none" stroke="currentColor" stroke-width="2"></rect><rect x="2" y="8" width="13" height="13" rx="2" fill="none" stroke="currentColor" stroke-width="2"></rect></svg>',
  share: '<svg viewBox="0 0 24 24" role="presentation" focusable="false"><circle cx="18" cy="5" r="3" fill="none" stroke="currentColor" stroke-width="2"></circle><circle cx="6" cy="12" r="3" fill="none" stroke="currentColor" stroke-width="2"></circle><circle cx="18" cy="19" r="3" fill="none" stroke="currentColor" stroke-width="2"></circle><path d="m8.59 13.51 6.83 3.98" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path><path d="m15.41 6.51-6.82 3.98" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path></svg>',
  phone: '<svg viewBox="0 0 24 24" role="presentation" focusable="false"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.86 19.86 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.86 19.86 0 0 1-3.07-8.58A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12 12 0 0 0 .69 2.75 2 2 0 0 1-.45 2.11L7.08 9.75a16 16 0 0 0 6 6l1.17-1.17a2 2 0 0 1 2.11-.45 12 12 0 0 0 2.75.69A2 2 0 0 1 22 16.92z" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>'
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
