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
      connectionMessage: '',
      lastCallTarget: null,
      reconnectAttempts: 0
    };

    const layout = {
      ctaButton: null,
      ctaPanel: null,
      toolbarButtons: {
        clearCache: null,
        toggleMedia: null,
        refresh: null
      }
    };

    const MAX_RECONNECT_ATTEMPTS = 3;
    const RECONNECT_WAIT_MS = 5000;
    const RECONNECT_MESSAGE = 'Потеря связи, пытаемся восстановить…';
    const CONNECTION_LOST_MESSAGE = 'Связь потеряна.';
    const scheduleTimeout =
      typeof env.window?.setTimeout === 'function' ? env.window.setTimeout.bind(env.window) : null;
    const cancelTimeout =
      typeof env.window?.clearTimeout === 'function' ? env.window.clearTimeout.bind(env.window) : null;
    let reconnectTimer = null;
    let reconnectPhase = null;
    let hardReconnectInProgress = false;
    let reconnecting = false;
    let peerConnectionState = 'new';
    let ignoreClosedEvent = false;
    let manualShutdownInProgress = false;
    let ignoreClosedResetTimer = null;

    const bindLayoutElements = () => {
      if (!document) {
        return;
      }
      layout.ctaButton = document.getElementById('cta-action');
      layout.ctaPanel = document.querySelector('.cta-panel');
      layout.toolbarButtons.clearCache = document.getElementById('toolbar-clear-cache');
      layout.toolbarButtons.toggleMedia = document.getElementById('toolbar-toggle-media');
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

    const attachToolbarHandlers = () => {
      const { clearCache, toggleMedia, refresh } = layout.toolbarButtons;
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

    const updateConnectionHint = (visible) => {
      if (state.currentState !== 'call') {
        return;
      }
      if (typeof ui.updateCallConnectionStatus !== 'function') {
        return;
      }
      ui.updateCallConnectionStatus({ message: RECONNECT_MESSAGE, visible });
    };

    const clearRemoteStreamView = () => {
      state.remoteStream = null;
      if (typeof ui.updateRemoteStream === 'function') {
        ui.updateRemoteStream(null);
      }
    };

    const clearReconnectionTimer = () => {
      if (reconnectTimer && cancelTimeout) {
        cancelTimeout(reconnectTimer);
      }
      reconnectTimer = null;
    };

    const stopReconnection = () => {
      reconnecting = false;
      reconnectPhase = null;
      hardReconnectInProgress = false;
      clearReconnectionTimer();
      updateConnectionHint(false);
    };

    const clearPeerShutdownIgnore = () => {
      ignoreClosedEvent = false;
      manualShutdownInProgress = false;
      if (ignoreClosedResetTimer && cancelTimeout) {
        cancelTimeout(ignoreClosedResetTimer);
        ignoreClosedResetTimer = null;
      }
    };

    const beginLocalPeerShutdown = ({ manual = false } = {}) => {
      ignoreClosedEvent = true;
      manualShutdownInProgress = Boolean(manual);
      if (ignoreClosedResetTimer && cancelTimeout) {
        cancelTimeout(ignoreClosedResetTimer);
        ignoreClosedResetTimer = null;
      }
      if (scheduleTimeout) {
        ignoreClosedResetTimer = scheduleTimeout(() => {
          clearPeerShutdownIgnore();
        }, 2000);
      }
    };

    const resetReconnectionAttempts = () => {
      state.reconnectAttempts = 0;
    };

    const tryConsumeReconnectAttempt = () => {
      if (state.reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
        return false;
      }
      state.reconnectAttempts += 1;
      return true;
    };

    const finalizeConnectionLoss = () => {
      stopReconnection();
      log.error(`[App] Reconnection limit reached (${state.reconnectAttempts})`);
      endCall(CONNECTION_LOST_MESSAGE);
    };

    const beginReconnection = () => {
      reconnecting = true;
      clearRemoteStreamView();
      updateConnectionHint(true);
    };

    const startHardReconnect = async () => {
      if (state.currentState !== 'call') {
        return;
      }
      if (hardReconnectInProgress) {
        return;
      }
      if (!tryConsumeReconnectAttempt()) {
        finalizeConnectionLoss();
        return;
      }
      reconnectPhase = 'hard';
      if (!reconnecting) {
        beginReconnection();
      }
      hardReconnectInProgress = true;
      log.warn(`[App] Hard reconnection attempt #${state.reconnectAttempts}`);
      if (!state.lastCallTarget) {
        hardReconnectInProgress = false;
        log.error('[App] Missing target for hard reconnection.');
        finalizeConnectionLoss();
        return;
      }
      clearReconnectionTimer();
      try {
        await peer.forceReconnect();
        log.info('[App] Hard reconnection offer sent.');
      } catch (error) {
        log.error('[App] Hard reconnection failed to rebuild the connection.', error);
        if (state.reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
          finalizeConnectionLoss();
        }
      } finally {
        hardReconnectInProgress = false;
      }
    };

    const startSoftReconnect = () => {
      if (state.currentState !== 'call' || reconnectPhase === 'soft') {
        return;
      }
      if (!tryConsumeReconnectAttempt()) {
        finalizeConnectionLoss();
        return;
      }
      reconnectPhase = 'soft';
      if (!reconnecting) {
        beginReconnection();
      }
      log.warn(`[App] Connection state 'disconnected'. Soft reconnection attempt #${state.reconnectAttempts}`);
      const restarted = peer.restartIce();
      if (!restarted) {
        log.warn('[App] restartIce is not available, escalating to hard reconnection.');
        void startHardReconnect();
        return;
      }
      if (!scheduleTimeout) {
        void startHardReconnect();
        return;
      }
      clearReconnectionTimer();
      reconnectTimer = scheduleTimeout(() => {
        reconnectTimer = null;
        if (peerConnectionState !== 'connected') {
          log.warn('[App] Soft reconnection timed out, escalating to hard reconnect.');
          void startHardReconnect();
        }
      }, RECONNECT_WAIT_MS);
    };

    const handlePeerStateChange = (peerState) => {
      peerConnectionState = peerState;
      if (peerState === 'connected') {
        if (reconnecting) {
          log.info('[App] WebRTC connection restored.');
        }
        stopReconnection();
        resetReconnectionAttempts();
        return;
      }
      if (peerState === 'disconnected') {
        if (state.currentState !== 'call') {
          return;
        }
        log.warn('[App] WebRTC connection lost (disconnected).');
        startSoftReconnect();
        return;
      }
      if (peerState === 'failed') {
        if (state.currentState !== 'call') {
          return;
        }
        log.warn('[App] WebRTC connection failed.');
        clearReconnectionTimer();
        void startHardReconnect();
        return;
      }
      if (peerState === 'closed') {
        if (ignoreClosedEvent) {
          const manualClosure = manualShutdownInProgress;
          clearPeerShutdownIgnore();
          if (manualClosure) {
            log.info('[App] Manual shutdown completed, ignoring duplicate closed event.');
          }
          return;
        }
        if (!reconnecting && state.currentState === 'call') {
          log.warn('[App] WebRTC connection closed unexpectedly.');
          endCall('Соединение потеряно.');
        }
      }
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

    const endCall = (message, { manual = false } = {}) => {
      stopReconnection();
      state.lastCallTarget = null;
      state.reconnectAttempts = 0;
      beginLocalPeerShutdown({ manual });
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
      stopReconnection();
      ui.showCall({
        container: state.root,
        remoteStream: state.remoteStream,
        onEnd: () => {
          endCall('Звонок завершён.', { manual: true });
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
      state.lastCallTarget = target;
      state.reconnectAttempts = 0;
      stopReconnection();
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
          handlePeerStateChange(peerState);
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
        state.lastCallTarget = data?.from ?? null;
        state.reconnectAttempts = 0;
        stopReconnection();
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
