/**
 * @module HomeCall_Web_Ui_Screen_Lobby
 * @description Displays lobby with participants list.
 */

export default class HomeCall_Web_Ui_Screen_Lobby {
  /**
   * @param {Object} deps
   * @param {HomeCall_Web_Core_TemplateLoader} deps.HomeCall_Web_Core_TemplateLoader$
   * @param {HomeCall_Web_Net_SignalClient} deps.HomeCall_Web_Net_SignalClient$
   * @param {HomeCall_Web_Rtc_Peer} deps.HomeCall_Web_Rtc_Peer$
   * @param {HomeCall_Web_Env_Provider} deps.HomeCall_Web_Env_Provider$
   */
  constructor({
    HomeCall_Web_Core_TemplateLoader$: templates,
    HomeCall_Web_Net_SignalClient$: signal,
    HomeCall_Web_Rtc_Peer$: peer,
    HomeCall_Web_Env_Provider$: env
  } = {}) {
    this.templates = templates;
    this.signal = signal;
    this.peer = peer;
    this.document = env?.document ?? null;
  }

  /**
   * Render lobby screen.
   * @param {Object} params
   * @param {HTMLElement} params.container
   * @param {string} params.roomCode
   * @param {string[]} params.users
   * @param {(user: string) => void} params.onCall
   * @param {() => void} params.onLeave
   */
  show({ container, roomCode, users, onCall, onLeave } = {}) {
    if (!container) {
      return;
    }
    this.templates.apply('lobby', container);
    const roomLabel = container.querySelector('#lobby-room');
    const list = container.querySelector('#user-list');
    const leaveButton = container.querySelector('#leave-room');
    if (roomLabel) {
      roomLabel.textContent = `Room: ${roomCode}`;
    }
    const ownerDocument = container.ownerDocument ?? this.document;
    const createElement = (tag) => ownerDocument?.createElement?.(tag) ?? null;
    if (list) {
      list.innerHTML = '';
      if (!users || users.length === 0) {
        const empty = createElement('p');
        if (empty) {
          empty.textContent = 'Waiting for other participants...';
          list.appendChild(empty);
        }
      } else {
        users.forEach((user) => {
          const card = createElement('div');
          if (!card) {
            return;
          }
          card.className = 'user-card';
          card.setAttribute('role', 'listitem');
          const span = createElement('span');
          if (span) {
            span.textContent = user;
            card.appendChild(span);
          }
          const button = createElement('button');
          if (button) {
            button.className = 'primary';
            button.type = 'button';
            button.textContent = 'Call';
            button.addEventListener('click', () => {
              onCall?.(user);
            });
            card.appendChild(button);
          }
          list.appendChild(card);
        });
      }
    }
    leaveButton?.addEventListener('click', () => {
      this.signal.leave();
      this.signal.disconnect();
      this.peer.end();
      onLeave?.();
    });
  }
}
