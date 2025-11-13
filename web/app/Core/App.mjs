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
 * @param {HomeCall_Web_Shared_Logger} deps.HomeCall_Web_Shared_Logger$
   * @param {HomeCall_Web_Infra_Storage} deps.HomeCall_Web_Infra_Storage$
   * @param {HomeCall_Web_Pwa_CacheCleaner} deps.HomeCall_Web_Pwa_CacheCleaner$
   * @param {HomeCall_Web_Ui_Toolbar} deps.HomeCall_Web_Ui_Toolbar$
  * @param {HomeCall_Web_Env_Provider} deps.HomeCall_Web_Env_Provider$
  * @param {HomeCall_Web_Ui_Toast} deps.HomeCall_Web_Ui_Toast$
  */
  constructor({
    HomeCall_Web_Core_TemplateLoader$: templates,
    HomeCall_Web_Core_ServiceWorkerManager$: sw,
    HomeCall_Web_Core_VersionWatcher$: version,
    HomeCall_Web_Media_Manager$: media,
    HomeCall_Web_Net_SignalClient$: signal,
    HomeCall_Web_Rtc_Peer$: peer,
    HomeCall_Web_Core_UiController$: uiController,
    HomeCall_Web_Shared_Logger$: logger,
    HomeCall_Web_Infra_Storage$: storage,
    HomeCall_Web_Pwa_CacheCleaner$: cacheCleaner,
    HomeCall_Web_Ui_Toolbar$: toolbar,
    HomeCall_Web_Ui_Toast$: toast,
    HomeCall_Web_Env_Provider$: env
  } = {}) {
    if (!env) {
      throw new Error('HomeCall environment provider is required.');
    }
    if (!storage) {
      throw new Error('Storage module is required for HomeCall core.');
    }
    if (!uiController) {
      throw new Error('UI controller is required for HomeCall core.');
    }
    if (!cacheCleaner) {
      throw new Error('Cache cleaner module is required for HomeCall core.');
    }
    if (!toolbar) {
      throw new Error('Toolbar module is required for HomeCall core.');
    }
    if (!toast) {
      throw new Error('Toast module is required for HomeCall core.');
    }
    const document = env.document;
    const MediaStreamCtor = env.MediaStream;
    const log = logger ?? console;
    const ui = uiController;
    const toastNotifier = toast;
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
    let savedDataNotified = false;

    const INVITE_URL_BASE =
      (env.window && env.window.location && env.window.location.origin)
        ? `${env.window.location.origin}/`
        : 'https://domozvon.app/';
    let inviteSession = null;

    const updateToolbarContext = () => {
      if (typeof toolbar.setContext === 'function') {
        toolbar.setContext({ user: state.userName, room: state.roomCode, state: state.currentState });
      }
    };

    const buildInviteUrl = (roomName, guestName) => {
      const params = new URLSearchParams();
      if (typeof roomName === 'string' && roomName.length > 0) {
        params.set('room', roomName);
      }
      if (typeof guestName === 'string' && guestName.length > 0) {
        params.set('name', guestName);
      }
      const query = params.toString();
      return query ? `${INVITE_URL_BASE}?${query}` : INVITE_URL_BASE;
    };

    const restoreInviteState = () => {
      if (!inviteSession) {
        return;
      }
      const previousState = inviteSession.previousState;
      inviteSession = null;
      switch (previousState) {
        case 'lobby':
          showLobby();
          return;
        case 'call':
          showCall();
          return;
        case 'end':
          showEnd();
          return;
        default:
          showEnter();
      }
    };

    const handleInviteConfirm = async ({ guestName, roomName } = {}) => {
      if (!inviteSession) {
        return;
      }
      const url = buildInviteUrl(roomName, guestName);
      const navigatorRef = env.navigator;
      let handled = false;
      if (navigatorRef && typeof navigatorRef.share === 'function') {
        try {
          await navigatorRef.share({ title: 'ДомоЗвон', text: 'Присоединяйся к разговору', url });
          toastNotifier?.success('Ссылка отправлена');
          handled = true;
        } catch (error) {
          log.error('[App] Unable to share link', error);
        }
      }
      if (!handled) {
        const clipboard = navigatorRef?.clipboard;
        if (clipboard && typeof clipboard.writeText === 'function') {
          try {
            await clipboard.writeText(url);
            toastNotifier?.info('Ссылка скопирована в буфер обмена');
            handled = true;
          } catch (error) {
            log.error('[App] Clipboard copy failed', error);
          }
        }
      }
      if (!handled) {
        toastNotifier?.error('Не удалось поделиться ссылкой');
      }
      restoreInviteState();
    };

    const handleInviteCancel = () => {
      restoreInviteState();
    };

    const handleShareLink = () => {
      if (!state.root || inviteSession || state.currentState === 'call') {
        return;
      }
      if (typeof ui.showInvite !== 'function') {
        log.warn('[App] Invite screen is unavailable.');
        toastNotifier?.warn('Экран приглашения недоступен.');
        return;
      }
      inviteSession = { previousState: state.currentState };
      ui.showInvite({
        container: state.root,
        initialGuestName: state.userName,
        initialRoomName: state.roomCode,
        onConfirm: handleInviteConfirm,
        onCancel: handleInviteCancel
      });
    };

    const readInviteParamsFromUrl = () => {
      const search = env.window?.location?.search;
      if (!search) {
        return null;
      }
      const params = new URLSearchParams(search);
      const rawRoom = params.get('room') ?? '';
      const rawName = params.get('name') ?? '';
      const room = rawRoom.trim();
      const name = rawName.trim();
      if (!room && !name) {
        return null;
      }
      const stored = storage.getUserData() ?? {};
      const entry = {
        userName: name || stored.userName || null,
        roomName: room || stored.roomName || null
      };
      storage.setUserData(entry);
      return {
        initialUserName: entry.userName ?? '',
        initialRoomName: entry.roomName ?? ''
      };
    };

    const showSavedDataNotification = (entry) => {
      if (savedDataNotified) {
        return;
      }
      const hasUser = entry && typeof entry.userName === 'string' && entry.userName.length > 0;
      const hasRoom = entry && typeof entry.roomName === 'string' && entry.roomName.length > 0;
      if (!hasUser || !hasRoom) {
        return;
      }
      savedDataNotified = true;
      const notifier = typeof toastNotifier?.info === 'function' ? toastNotifier.info.bind(toastNotifier) : null;
      if (notifier) {
        notifier('Saved data loaded');
      }
    };

    const setToolbarMediaState = (value) => {
      if (typeof toolbar.setMediaButtonState === 'function') {
        toolbar.setMediaButtonState(value);
      }
    };

    const notifyStorageCleared = () => {
      storage.clearUserData();
      const warnNotifier = typeof toastNotifier?.warn === 'function' ? toastNotifier.warn.bind(toastNotifier) : null;
      if (warnNotifier) {
        warnNotifier('Saved data cleared');
      }
    };

    const clearApplicationCache = async () => {
      if (!cacheCleaner || typeof cacheCleaner.clear !== 'function') {
        return;
      }
      notifyStorageCleared();
      showCacheClearedMessage();
      try {
        await cacheCleaner.clear();
      } catch (error) {
        log.error('[App] Unable to clear cache', error);
      }
    };

    const toggleMediaTracks = async () => {
      try {
        const result = await media.toggleMedia();
        const stateName = result?.state;
        if (stateName) {
          setToolbarMediaState(stateName);
        }
      } catch (error) {
        log.error('[App] Unable to toggle media tracks', error);
      }
    };

    const handleToolbarAction = async (action) => {
      if (!action) {
        return;
      }
      switch (action) {
        case 'clear-cache':
          await clearApplicationCache();
          break;
        case 'toggle-media':
          await toggleMediaTracks();
          break;
        case 'settings':
          toastNotifier?.info('Настройки появятся в следующих версиях.');
          break;
        case 'info': {
          const userLabel = state.userName || 'Гость';
          const roomLabel = state.roomCode ? `Комната ${state.roomCode}` : 'Комната не выбрана';
          toastNotifier?.info(`Сведения: ${userLabel}, ${roomLabel}.`);
          break;
        }
        case 'share-link':
          handleShareLink();
          break;
        default:
          break;
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
      updateToolbarContext();
    };

    const showEnd = () => {
      transitionState('end');
      ui.showEnd({
        container: state.root,
        message: state.connectionMessage,
        onReturn: () => {
          state.connectionMessage = '';
          showLobby();
        }
      });
      updateToolbarContext();
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
      updateToolbarContext();
    };

    const showEnter = ({ initialUserName: overrideUser, initialRoomName: overrideRoom } = {}) => {
      transitionState('enter');
      const message = state.connectionMessage;
      state.connectionMessage = '';
      state.userName = '';
      state.roomCode = '';
      state.onlineUsers = [];
      updateToolbarContext();
      const storedData = storage.getUserData();
      const initialUserName = typeof overrideUser === 'string' ? overrideUser : storedData?.userName ?? '';
      const initialRoomName = typeof overrideRoom === 'string' ? overrideRoom : storedData?.roomName ?? '';
      showSavedDataNotification(storedData);
      ui.showEnter({
        container: state.root,
        connectionMessage: message,
        initialUserName,
        initialRoomName,
        onEnter: ({ user, room }) => {
          state.userName = user;
          state.roomCode = room;
          state.connectionMessage = '';
          showLobby();
        }
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
      const notifier = typeof toastNotifier?.info === 'function' ? toastNotifier.info.bind(toastNotifier) : null;
      if (notifier) {
        notifier('Кэш очищен. Приложение будет перезапущено.');
      }
    };

    this.run = async () => {
      if (!document) {
        throw new Error('Document is not available for HomeCall application.');
      }
      state.root = document.getElementById('app');
      if (!state.root) {
        throw new Error('Element with id "app" was not found.');
      }
      toastNotifier?.init();
      toolbar.onAction(handleToolbarAction);
      toolbar.init();
      setToolbarMediaState('off');
      updateToolbarContext();
      configurePeer();
      media.setPeer(peer);
      await sw.register();
      await templates.loadAll();
      await version.start();
      setupSignalClient();
      const urlOverrides = readInviteParamsFromUrl();
      if (urlOverrides) {
        showEnter(urlOverrides);
      } else {
        showEnter();
      }
    };
  }
}
