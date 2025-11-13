/**
 * @module HomeCall_Web_Ui_Toolbar
 * @description Manages the workspace indicators, menu, and contextual hints in the HomeCall toolbar.
 */

const STATE_CLASS = {
  ready: 'ok',
  paused: 'paused',
  blocked: 'blocked',
  unsupported: 'unsupported',
  off: 'off'
};

const ICON_MAP = {
  video: {
    ready: 'camera.svg',
    paused: 'camera-off.svg',
    blocked: 'alert-triangle.svg',
    unsupported: 'slash.svg',
    off: 'help-circle.svg'
  },
  audio: {
    ready: 'mic.svg',
    paused: 'mic-off.svg',
    blocked: 'alert-triangle.svg',
    unsupported: 'slash.svg',
    off: 'help-circle.svg'
  }
};

const EVENTS = ['Off', 'Ready', 'Paused', 'Blocked', 'Unsupported'];

const TYPE_LABEL = {
  video: 'Video',
  audio: 'Audio'
};

const ACTION_BUTTONS = [
  { id: 'toolbar-clear-cache', action: 'clear-cache' },
  { id: 'toolbar-settings', action: 'settings' },
  { id: 'toolbar-info', action: 'info' },
  { id: 'toolbar-toggle-media', action: 'toggle-media' }
];

const WS_STATE_MAP = {
  connected: 'connected',
  closed: 'off',
  error: 'failed'
};

const RTC_STATE_MAP = {
  connected: 'connected',
  disconnected: 'pending',
  failed: 'failed',
  closed: 'closed',
  connecting: 'connecting',
  new: 'pending'
};

const DEFAULT_INDICATOR_STATE = 'off';
const ACTION_HANDLERS = new WeakMap();

const createImage = (doc, type) => {
  if (!doc) {
    return null;
  }
  const image = doc.createElement('img');
  image.alt = TYPE_LABEL[type];
  return image;
};

const normalizeWsState = (value) => {
  if (!value) {
    return 'pending';
  }
  return WS_STATE_MAP[value] ?? 'pending';
};

const normalizeRtcState = (value) => {
  if (!value) {
    return 'pending';
  }
  return RTC_STATE_MAP[value] ?? 'pending';
};

export default class HomeCall_Web_Ui_Toolbar {
  constructor({
    HomeCall_Web_State_Media$: mediaState,
    HomeCall_Web_Net_SignalClient$: signalClient,
    HomeCall_Web_Rtc_Peer$: peer,
    HomeCall_Web_Env_Provider$: env
  } = {}) {
    if (!env) {
      throw new Error('Environment provider is required for the toolbar.');
    }
    const documentRef = env.document;
    if (!documentRef) {
      throw new Error('Document reference is required for the toolbar.');
    }
    const indicators = {
      ws: null,
      rtc: null,
      video: null,
      audio: null
    };
    const info = {
      user: null,
      room: null
    };
    let toggleButton = null;
    let menuToggle = null;
    let menuPanel = null;
    let shareButton = null;
    let outsideClickHandler = null;
    let initialized = false;
    const mediaStateRef = mediaState;
    const signalClientRef = signalClient;
    const peerRef = peer;
    ACTION_HANDLERS.set(this, null);

    const setIndicatorState = (type, stateName) => {
      const element = indicators[type];
      if (!element) {
        return;
      }
      const nextState = stateName || DEFAULT_INDICATOR_STATE;
      if (type === 'video' || type === 'audio') {
        updateMediaIndicator(type, nextState);
        return;
      }
      element.dataset.state = nextState;
    };

    const updateMediaIndicator = (type, currentState) => {
      const element = indicators[type];
      if (!element) {
        return;
      }
      const normalizedClass = STATE_CLASS[currentState] ?? STATE_CLASS.off;
      element.className = `media-indicator ${normalizedClass}`;
      element.dataset.state = currentState;
      const iconName = ICON_MAP[type][currentState] ?? ICON_MAP[type].off;
      let image = element.querySelector('img');
      if (!image) {
        image = createImage(documentRef, type);
        if (image) {
          element.appendChild(image);
        }
      }
      if (!image) {
        return;
      }
      image.src = `assets/icons/${iconName}`;
      image.alt = TYPE_LABEL[type];
    };

    const emitAction = (action) => {
      const handler = ACTION_HANDLERS.get(this);
      if (!action || typeof handler !== 'function') {
        return;
      }
      handler(action);
    };

    const updateShareActionVisibility = (screenState) => {
      if (!shareButton) {
        return;
      }
      const isCallState = screenState === 'call';
      if (isCallState) {
        shareButton.setAttribute('hidden', '');
        shareButton.setAttribute('aria-hidden', 'true');
        shareButton.setAttribute('disabled', '');
        return;
      }
      shareButton.removeAttribute('hidden');
      shareButton.removeAttribute('aria-hidden');
      shareButton.removeAttribute('disabled');
    };

    const toggleMenu = (open) => {
      if (!menuPanel) {
        return;
      }
      const targetState = typeof open === 'boolean' ? open : menuPanel.hasAttribute('hidden');
      if (targetState) {
        menuPanel.removeAttribute('hidden');
        menuToggle?.setAttribute('aria-expanded', 'true');
        return;
      }
      menuPanel.setAttribute('hidden', '');
      menuToggle?.setAttribute('aria-expanded', 'false');
    };

    const closeMenu = () => {
      toggleMenu(false);
    };

    const bindMenuActions = () => {
      ACTION_BUTTONS.forEach(({ id, action }) => {
        const button = documentRef.getElementById(id);
        if (!button) {
          return;
        }
        button.addEventListener('click', (event) => {
          event.preventDefault();
          emitAction(action);
        });
      });
      if (!menuToggle || !menuPanel) {
        return;
      }
      menuToggle.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        const expanded = menuToggle.getAttribute('aria-expanded') === 'true';
        toggleMenu(!expanded);
      });
      menuPanel.addEventListener('click', (event) => {
        const target = event.target;
        const button = typeof target?.closest === 'function'
          ? target.closest('button[data-menu-action]')
          : target?.matches?.('button[data-menu-action]') ? target : null;
        if (!button) {
          return;
        }
        const action = button.dataset?.menuAction;
        if (action) {
          emitAction(action);
          closeMenu();
        }
      });
      menuPanel.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
          event.stopPropagation();
          closeMenu();
          menuToggle?.focus();
        }
      });
      outsideClickHandler = (event) => {
        if (!menuPanel || menuPanel.hasAttribute('hidden')) {
          return;
        }
        if (menuPanel.contains(event.target) || menuToggle?.contains(event.target)) {
          return;
        }
        closeMenu();
      };
      documentRef.addEventListener('click', outsideClickHandler);
    };

    const bindConnectionEvents = () => {
      if (signalClientRef && typeof signalClientRef.onStatus === 'function') {
        signalClientRef.onStatus(({ state }) => {
          setIndicatorState('ws', normalizeWsState(state));
        });
      }
      if (peerRef && typeof peerRef.onConnectionState === 'function') {
        peerRef.onConnectionState((state) => {
          setIndicatorState('rtc', normalizeRtcState(state));
        });
      }
    };

    const bindMediaState = () => {
      if (!mediaStateRef) {
        return;
      }
      ['video', 'audio'].forEach((type) => {
        EVENTS.forEach((suffix) => {
          const methodName = `on${type[0].toUpperCase() + type.slice(1)}${suffix}`;
          const subscriber = mediaStateRef[methodName];
          if (typeof subscriber !== 'function') {
            return;
          }
          subscriber.call(mediaStateRef, (_, __, next) => {
            setIndicatorState(type, next);
          });
        });
      });
    };

    const updateMediaSnapshot = () => {
      if (!mediaStateRef) {
        return;
      }
      const snapshot = mediaStateRef.get();
      setIndicatorState('video', snapshot?.video);
      setIndicatorState('audio', snapshot?.audio);
    };

    this.init = () => {
      if (initialized) {
        return;
      }
      initialized = true;
      indicators.ws = documentRef.getElementById('toolbar-indicator-ws');
      indicators.rtc = documentRef.getElementById('toolbar-indicator-rtc');
      indicators.video = documentRef.getElementById('toolbar-indicator-video');
      indicators.audio = documentRef.getElementById('toolbar-indicator-audio');
      info.user = documentRef.getElementById('toolbar-user');
      info.room = documentRef.getElementById('toolbar-room');
      toggleButton = documentRef.getElementById('toolbar-toggle-media');
      menuToggle = documentRef.getElementById('toolbar-menu-toggle');
      menuPanel = documentRef.getElementById('toolbar-menu-panel');
      shareButton = menuPanel?.querySelector('button[data-menu-action="share-link"]') ?? null;
      bindConnectionEvents();
      bindMediaState();
      bindMenuActions();
      updateMediaSnapshot();
      setIndicatorState('ws', 'pending');
      setIndicatorState('rtc', 'pending');
    };

    this.onAction = (handler) => {
      ACTION_HANDLERS.set(this, typeof handler === 'function' ? handler : null);
    };

    this.setContext = ({ user, room, state } = {}) => {
      if (info.user) {
        info.user.textContent = user ? user : 'Гость';
      }
      if (info.room) {
        info.room.textContent = room ? `Комната: ${room}` : 'Комната: —';
      }
      updateShareActionVisibility(state);
    };

    this.setMediaButtonState = (stateName) => {
      if (!toggleButton) {
        return;
      }
      if (stateName) {
        toggleButton.dataset.state = stateName;
      } else {
        toggleButton.removeAttribute('data-state');
      }
    };

    this.toggleMenu = toggleMenu;
  }
}
