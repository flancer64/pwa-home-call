/**
 * @module HomeCall_Web_Core_App
 * @description Main application orchestrator for HomeCall frontend.
 */

export default class HomeCall_Web_Core_App {
 /**
  * @param {Object} deps
  * @param {HomeCall_Web_Core_TemplateLoader} deps.HomeCall_Web_Core_TemplateLoader$
  * @param {HomeCall_Web_Core_ServiceWorkerManager} deps.HomeCall_Web_Core_ServiceWorkerManager$
  * @param {HomeCall_Web_Core_VersionWatcher} deps.HomeCall_Web_Core_VersionWatcher$
  * @param {HomeCall_Web_Media_Manager} deps.HomeCall_Web_Media_Manager$
  * @param {HomeCall_Web_Net_SignalClient} deps.HomeCall_Web_Net_SignalClient$
  * @param {HomeCall_Web_Rtc_Peer} deps.HomeCall_Web_Rtc_Peer$
  * @param {HomeCall_Web_Core_UiController} deps.HomeCall_Web_Core_UiController$
  * @param {HomeCall_Web_Shared_EventBus} deps.HomeCall_Web_Shared_EventBus$
  * @param {HomeCall_Web_Shared_Logger} deps.HomeCall_Web_Shared_Logger$
  * @param {HomeCall_Web_Pwa_CacheCleaner} deps.HomeCall_Web_Pwa_CacheCleaner$
  * @param {HomeCall_Web_Env_Provider} deps.HomeCall_Web_Env_Provider$
  */
  constructor({
    HomeCall_Web_Core_TemplateLoader$: templates,
    HomeCall_Web_Core_ServiceWorkerManager$: sw,
    HomeCall_Web_Core_VersionWatcher$: version,
    HomeCall_Web_Media_Manager$: media,
    HomeCall_Web_Net_SignalClient$: signal,
    HomeCall_Web_Rtc_Peer$: peer,
    HomeCall_Web_Core_UiController$: uiController,
    HomeCall_Web_Shared_EventBus$: eventBus,
    HomeCall_Web_Shared_Logger$: logger,
    HomeCall_Web_Pwa_CacheCleaner$: cacheCleaner,
    HomeCall_Web_Env_Provider$: env
  } = {}) {
    if (!env) {
      throw new Error('HomeCall environment provider is required.');
    }
    if (!eventBus) {
      throw new Error('Shared event bus is required for HomeCall core.');
    }
    if (!uiController) {
      throw new Error('UI controller is required for HomeCall core.');
    }
    if (!cacheCleaner) {
      throw new Error('Cache cleaner module is required for HomeCall core.');
    }
    const document = env.document;
    const MediaStreamCtor = env.MediaStream;
    const log = logger ?? console;
    const bus = eventBus;
    const ui = uiController;
    const state = {
      root: null,
      currentState: null,
      userName: '',
      roomCode: '',
      onlineUsers: [],
      remoteStream: null,
      connectionMessage: ''
    };

    const layout = {
      ctaButton: null,
      ctaPanel: null,
      toolbarButtons: {
        clearCache: null,
        toggleMedia: null,
        settings: null,
        refresh: null
      }
    };

    const bindLayoutElements = () => {
      if (!document) {
        return;
      }
      layout.ctaButton = document.getElementById('cta-action');
      layout.ctaPanel = document.querySelector('.cta-panel');
      layout.toolbarButtons.clearCache = document.getElementById('toolbar-clear-cache');
      layout.toolbarButtons.toggleMedia = document.getElementById('toolbar-toggle-media');
      layout.toolbarButtons.settings = document.getElementById('toolbar-settings');
      layout.toolbarButtons.refresh = document.getElementById('toolbar-refresh');
    };

    const hideCtaPanel = (hidden) => {
      if (!layout.ctaPanel) {
        return;
      }
      layout.ctaPanel.classList.toggle('cta-hidden', hidden);
      layout.ctaPanel.setAttribute('aria-hidden', hidden ? 'true' : 'false');
    };

    const updateCta = ({
      label = '',
      type = 'button',
      formId = null,
      disabled = false,
      onTrigger = null,
      hidden = false
    } = {}) => {
      const button = layout.ctaButton;
      if (!button) {
        return;
      }
      button.textContent = label;
      button.type = type;
      button.disabled = disabled || hidden;
      if (formId) {
        button.setAttribute('form', formId);
      } else {
        button.removeAttribute('form');
      }
      if (typeof onTrigger === 'function') {
        button.onclick = (event) => {
          event.preventDefault();
          onTrigger();
        };
      } else {
        button.onclick = null;
      }
      hideCtaPanel(hidden);
    };

    const openBrowserSettings = () => {
      const browserWindow = env.window;
      const userAgent = env.navigator?.userAgent || '';
      if (!browserWindow) {
        return;
      }
      let target = 'chrome://settings/content/camera';
      if (/edg/i.test(userAgent)) {
        target = 'edge://settings/content/camera';
      } else if (/firefox/i.test(userAgent)) {
        target = 'about:preferences#privacy';
      } else if (/safari/i.test(userAgent) && !/chrome/i.test(userAgent)) {
        target = 'x-apple.systempreferences:com.apple.preference.security?Privacy_Camera';
      }
      browserWindow.open(target, '_blank', 'noopener');
    };

    const attachToolbarHandlers = () => {
      const { clearCache, toggleMedia, settings, refresh } = layout.toolbarButtons;
      clearCache?.addEventListener('click', (event) => {
        event.preventDefault();
        bus.emit('ui:action:clear-cache');
      });
      toggleMedia?.addEventListener('click', async (event) => {
        event.preventDefault();
        try {
          const result = await media.toggleMedia();
          const stateName = result?.state;
          if (stateName) {
            toggleMedia.dataset.state = stateName;
          }
        } catch (error) {
          log.error('[App] Unable to toggle media tracks', error);
        }
      });
      settings?.addEventListener('click', (event) => {
        event.preventDefault();
        openBrowserSettings();
      });
      refresh?.addEventListener('click', (event) => {
        event.preventDefault();
        if (env.window?.location) {
          env.window.location.reload();
        }
      });
    };

    const updateBodyState = () => {
      if (!document?.body) {
        return;
      }
      document.body.classList.toggle('state-call', state.currentState === 'call');
    };

    const transitionState = (nextState) => {
      state.currentState = nextState;
      updateBodyState();
      bus.emit('core:state', { state: nextState, room: state.roomCode, user: state.userName });
      log.info(`[App] transition -> ${nextState}`);
    };

    const showLobby = () => {
      transitionState('lobby');
      ui.showLobby({
        container: state.root,
        roomCode: state.roomCode,
        users: state.onlineUsers,
        onCall: (user) => {
          startCall(user);
        },
        onLeave: () => {
          signal.disconnect();
          peer.end();
          state.remoteStream = null;
          state.onlineUsers = [];
          showEnter();
        }
      });
      const hasUsers = state.onlineUsers.length > 0;
      updateCta({
        label: 'Позвонить',
        type: 'button',
        disabled: !hasUsers,
        hidden: false,
        onTrigger: () => {
          if (!state.onlineUsers.length) {
            return;
          }
          startCall(state.onlineUsers[0]);
        }
      });
    };

    const showEnd = () => {
      transitionState('end');
      ui.showEnd({
        container: state.root,
        message: state.connectionMessage
      });
      updateCta({
        label: 'Вернуться',
        type: 'button',
        disabled: false,
        hidden: false,
        onTrigger: () => {
          state.connectionMessage = '';
          showLobby();
        }
      });
    };

    const endCall = (message) => {
      peer.end();
      media.stopLocalStream();
      media.setLocalStream(null);
      state.remoteStream = null;
      state.connectionMessage = message || '';
      bus.emit('core:shutdown', { reason: state.connectionMessage });
      showEnd();
      media.prepare().catch((error) => {
        log.error('[App] Unable to prepare media after ending call', error);
      });
    };

    const showCall = () => {
      transitionState('call');
      ui.showCall({
        container: state.root,
        remoteStream: state.remoteStream,
        onEnd: () => {
          endCall('Звонок завершён.');
        },
        onRetry: () => {
          media.prepare().catch((error) => {
            log.error('[App] Unable to re-prepare media', error);
          });
        }
      });
      updateCta({ hidden: true });
    };

    const showEnter = () => {
      transitionState('enter');
      const message = state.connectionMessage;
      state.connectionMessage = '';
      ui.showEnter({
        container: state.root,
        connectionMessage: message,
        onEnter: ({ user, room }) => {
          state.userName = user;
          state.roomCode = room;
          state.connectionMessage = '';
          showLobby();
        }
      });
      updateCta({
        label: 'Войти',
        type: 'submit',
        formId: 'enter-form',
        disabled: false,
        hidden: false
      });
    };

    const startCall = async (target) => {
      try {
        let localStream = media.getLocalStream();
        if (!localStream && typeof MediaStreamCtor === 'function') {
          localStream = new MediaStreamCtor();
        }
        media.setLocalStream(localStream);
        showCall();
        await peer.start(target);
      } catch (error) {
        log.error('[App] Unable to start call', error);
        peer.end();
        state.remoteStream = null;
        state.connectionMessage = 'Не удалось начать звонок.';
        showEnd();
      }
    };

    const configurePeer = () => {
      peer.configure({
        sendOffer: (to, sdp) => signal.sendOffer(to, sdp),
        sendAnswer: (to, sdp) => signal.sendAnswer(to, sdp),
        sendCandidate: (to, candidate) => signal.sendCandidate(to, candidate),
        onRemoteStream: (stream) => {
          state.remoteStream = stream;
          if (state.currentState === 'call') {
            ui.updateRemoteStream(stream);
          }
        },
        onStateChange: (peerState) => {
          if (peerState === 'disconnected' || peerState === 'failed') {
            endCall('Соединение потеряно.');
          }
        }
      });
    };

    const setupSignalClient = () => {
      signal.on('online', (users) => {
        state.onlineUsers = (users || []).filter((user) => user !== state.userName);
        if (state.currentState === 'lobby') {
          showLobby();
        }
      });

      signal.on('offer', async (data) => {
        if (state.currentState !== 'call') {
          showCall();
        }
        try {
          if (!media.getLocalStream() && typeof MediaStreamCtor === 'function') {
            media.setLocalStream(new MediaStreamCtor());
          }
          await peer.handleOffer(data);
        } catch (error) {
          log.error('[App] Failed to handle offer', error);
          endCall('Не удалось принять звонок.');
        }
      });

      signal.on('answer', async (data) => {
        try {
          await peer.handleAnswer(data);
        } catch (error) {
          log.error('[App] Failed to handle answer', error);
        }
      });

      signal.on('candidate', async (data) => {
        try {
          await peer.addCandidate(data);
        } catch (error) {
          log.error('[App] Failed to add candidate', error);
        }
      });

      signal.on('error', (data) => {
        state.connectionMessage = data?.message || 'Произошла ошибка сигнализации.';
        if (state.currentState === 'enter') {
          showEnter();
        }
      });

      signal.on('status', ({ state: status }) => {
        if (status === 'closed' && state.currentState !== 'enter') {
          peer.end();
          state.remoteStream = null;
          state.connectionMessage = 'Соединение с сервером сигнализации потеряно.';
          showEnter();
        }
      });
    };

    const showCacheClearedMessage = () => {
      const statusElement = document?.querySelector('#cache-status');
      if (!statusElement) {
        return;
      }
      statusElement.textContent = 'Кэш удалён. Приложение будет перезапущено.';
      statusElement.hidden = false;
    };

    const handleClearCache = () => {
      if (!cacheCleaner || typeof cacheCleaner.clear !== 'function') {
        return;
      }
      showCacheClearedMessage();
      cacheCleaner.clear().catch((error) => {
        log.error('[App] Unable to clear cache', error);
      });
    };
    bus.on('ui:action:clear-cache', handleClearCache);

    this.run = async () => {
      if (!document) {
        throw new Error('Document is not available for HomeCall application.');
      }
      state.root = document.getElementById('app');
      if (!state.root) {
        throw new Error('Element with id "app" was not found.');
      }
      bindLayoutElements();
      attachToolbarHandlers();
      configurePeer();
      media.setPeer(peer);
      await sw.register();
      await templates.loadAll();
      await version.start();
      setupSignalClient();
      showEnter();
      bus.emit('core:ready', { state: state.currentState });
    };
  }
}
