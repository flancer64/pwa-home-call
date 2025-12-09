/**
 * @module HomeCall_Web_Ui_Flow
 * @description Orchestrates the ready → waiting → active → ended lifecycle for the single window.
 */
export default function HomeCall_Web_Ui_Flow({
  HomeCall_Web_State_Machine$: stateMachine,
  HomeCall_Web_Net_Session_Manager$: sessionManager,
  HomeCall_Web_Ui_ShareLinkService$: shareLinkService,
  HomeCall_Web_Ui_Router$: router,
  HomeCall_Web_Ui_Router_Config$: routerConfig,
  HomeCall_Web_Media_Manager$: media,
  HomeCall_Web_Rtc_Peer$: peer,
  HomeCall_Web_Net_Signal_Client$: signal,
  HomeCall_Web_Env_Provider$: env,
  HomeCall_Web_Ui_Toast$: toast,
  HomeCall_Web_Logger$: logger
} = {}) {
  const windowRef = env?.window ?? null;
  const context = {
    pendingSession: sessionManager.readSessionFromUrl(),
    activeSession: null,
    remoteStream: null,
    connectionMessage: '',
    isCallInProgress: false,
    shouldSendOffer: false
  };

  let mediaPreparation = null;
  const waitForLocalMediaReady = () => mediaPreparation ?? Promise.resolve();
  const log = logger ?? console;
  const toastNotifier = toast;

  const getFlowLogger = (level) => {
    if (typeof log[level] === 'function') {
      return log[level].bind(log);
    }
    if (typeof log.info === 'function') {
      return log.info.bind(log);
    }
    return () => {};
  };

  const flowLog = (level, message, details) => {
    const writer = getFlowLogger(level);
    writer(`[Flow] ${message}`, details);
  };

  const applyState = (state, navigation) => {
    if (stateMachine.getState() !== state) {
      stateMachine.transition(state);
    }
    if (typeof navigation === 'function') {
      navigation();
    }
  };

  const registerDefaults = (name, payload = {}) => {
    if (typeof routerConfig?.setDefaultParams !== 'function') {
      return;
    }
    routerConfig.setDefaultParams(name, payload);
  };

  const showHomeScreen = (overrides = {}) => {
    const payload = {
      onStartCall: overrides.onStartCall ?? handleStartCall,
      onOpenSettings: overrides.onOpenSettings ?? openSettings
    };
    router.navigate('home', payload);
    registerDefaults('home', payload);
  };

  const showActiveScreen = (overrides = {}) => {
    if (typeof overrides.sessionId === 'string') {
      context.activeSession = overrides.sessionId;
    }
    const sessionId = overrides.sessionId ?? context.activeSession;
    const remoteStreamValue = overrides.remoteStream ?? context.remoteStream;
    const waiting = typeof overrides.waiting === 'boolean' ? overrides.waiting : !Boolean(remoteStreamValue);
    const payload = {
      onEnd: overrides.onEnd ?? (() => endCall('Вы завершили звонок.')),
      onOpenSettings: overrides.onOpenSettings ?? openSettings,
      onShareLink: overrides.onShareLink ?? handleShareLink,
      sessionId,
      remoteStream: remoteStreamValue,
      waiting
    };
    router.navigate('call', payload);
    router.updateRemoteStream(remoteStreamValue);
    registerDefaults('call', payload);
  };

  const showEndedScreen = (overrides = {}) => {
    const payload = {
      connectionMessage: overrides.connectionMessage ?? (context.connectionMessage || 'Звонок завершён.'),
      onReturn: overrides.onReturn ?? handleReturnHome
    };
    router.navigate('end', payload);
    registerDefaults('end', payload);
  };

  const handleShareLink = () => {
    if (!context.activeSession) {
      return;
    }
    shareLinkService.shareSessionLink(context.activeSession);
  };

  const handleCopyLink = () => {
    if (!context.activeSession) {
      return;
    }
    shareLinkService.copySessionLink(context.activeSession);
  };

  const renderReady = (overrides = {}) => {
    applyState('ready', () => showHomeScreen(overrides));
  };

  const renderActive = (overrides = {}) => {
    applyState('active', () => showActiveScreen(overrides));
  };

  const renderEnded = (overrides = {}) => {
    applyState('ended', () => showEndedScreen(overrides));
  };

  const restoreCurrentState = () => {
    const current = stateMachine.getState();
    if (current === 'ready') {
      renderReady();
    } else if (current === 'active') {
      renderActive();
    } else if (current === 'ended') {
      renderEnded();
    }
  };

  const openSettings = () => {
    router.showSettings({ onClose: restoreCurrentState });
  };

  let initialHashHandled = false;
  const handleInitialHashNavigation = () => {
    if (initialHashHandled) {
      return false;
    }
    initialHashHandled = true;
    const hashValue = windowRef?.location?.hash ?? '';
    const route = router.resolve(hashValue);
    if (!route.name || route.name === 'home' || route.name === 'not-found') {
      return false;
    }
    const params = route.params ?? {};
    switch (route.name) {
      case 'call':
        if (typeof params.sessionId === 'string') {
          context.activeSession = params.sessionId;
        }
        renderActive({ sessionId: params.sessionId });
        return true;
      case 'end':
        context.connectionMessage = params.connectionMessage ?? context.connectionMessage ?? 'Звонок завершён.';
        renderEnded();
        return true;
      default:
        return false;
    }
  };

  const handleReturnHome = () => {
    if (context.isCallInProgress) {
      endCall('Сессия отменена пользователем.');
      return;
    }
    context.connectionMessage = '';
    context.remoteStream = null;
    context.activeSession = null;
    context.pendingSession = null;
    context.shouldSendOffer = false;
    stateMachine.reset();
    renderReady();
  };

  const handleStartCall = () => {
    if (context.isCallInProgress) {
      return;
    }
    context.activeSession = sessionManager.createSessionId();
    context.pendingSession = null;
    sessionManager.clearSessionFromUrl();
    context.shouldSendOffer = true;
    renderActive({ waiting: true });
    startOutgoingCall();
  };

  const prepareLocalMedia = () => {
    if (mediaPreparation) {
      return mediaPreparation;
    }
    flowLog('info', 'Preparing local media.');
    mediaPreparation = (async () => {
      await media.prepare();
      const stream = media.getLocalStream();
      const trackCount = typeof stream?.getTracks === 'function' ? stream.getTracks().length : 0;
      flowLog('info', 'Local media stream ready.', {
        sessionId: context.activeSession,
        tracks: trackCount
      });
      peer.setLocalStream(stream);
      if (typeof peer.prepare === 'function') {
        try {
          peer.prepare();
        } catch (error) {
          flowLog('error', 'RTC peer preparation failed.', error);
          throw error;
        }
      }
      return stream;
    })();
    mediaPreparation.finally(() => {
      mediaPreparation = null;
    });
    return mediaPreparation;
  };

  const beginCallSession = async ({ sessionId, shouldSendOffer }) => {
    if (!sessionId) {
      toastNotifier.error('Сессия не указана.');
      renderReady();
      return;
    }
    if (context.isCallInProgress) {
      return;
    }
    flowLog('info', 'Initiating call session.', { sessionId, shouldSendOffer });
    context.shouldSendOffer = Boolean(shouldSendOffer);
    context.isCallInProgress = true;
    context.activeSession = sessionId;
    context.connectionMessage = '';
    context.remoteStream = null;
    try {
      await prepareLocalMedia();
    } catch (error) {
      flowLog('error', 'Media preparation failed', error);
      endCall('Не удалось получить доступ к медиаустройствам.');
      return;
    }
    try {
      await signal.connect(context.activeSession);
    } catch (error) {
      flowLog('error', 'Signaling connection failed', { error, sessionId: context.activeSession });
      endCall('Не удалось подключиться к серверу сигналинга.');
      return;
    }
    if (context.shouldSendOffer) {
      try {
        await peer.start();
      } catch (error) {
        flowLog('error', 'Unable to start call', error);
        endCall('Не удалось начать звонок.');
      }
    }
  };

  const startOutgoingCall = () => beginCallSession({ sessionId: context.activeSession, shouldSendOffer: true });

  const startIncomingCall = async (sessionId) => {
    if (!sessionId || context.isCallInProgress) {
      return;
    }
    context.pendingSession = null;
    sessionManager.clearSessionFromUrl();
    renderActive({ waiting: true });
    await beginCallSession({ sessionId, shouldSendOffer: false });
  };

  const updateRemoteStream = (stream) => {
    context.remoteStream = stream ?? null;
    router.updateRemoteStream(context.remoteStream);
  };

  const handleRemoteStream = (stream) => {
    updateRemoteStream(stream);
    if (stream) {
      renderActive({ remoteStream: stream, waiting: false, sessionId: context.activeSession });
    }
  };

  const handlePeerStateChange = (peerState) => {
    if (peerState === 'connected') {
      toastNotifier.info('Собеседник подключён.');
    } else if (peerState === 'disconnected') {
      toastNotifier.warn('Связь потеряна.');
    } else if (peerState === 'failed') {
      toastNotifier.error('Не удалось установить соединение.');
      endCall('Связь потеряна.');
    }
  };

  const endCall = (message = 'Звонок завершён.', skipSignalHangup = false) => {
    flowLog('info', 'Ending call session.', { message, sessionId: context.activeSession });
    const sessionId = context.activeSession;
    if (!skipSignalHangup && sessionId) {
      const payload = { sessionId };
      const reasonText = typeof message === 'string' ? message.trim() : '';
      if (reasonText) {
        payload.reason = reasonText;
      }
      signal.sendHangup(payload);
    }
    peer.end();
    signal.disconnect();
    context.isCallInProgress = false;
    context.connectionMessage = message;
    context.remoteStream = null;
    context.activeSession = null;
    context.shouldSendOffer = false;
    media.stopLocalStream();
    renderEnded();
  };

  const handleOffer = async (data) => {
    if (!data?.sessionId || typeof data?.sdp !== 'string') {
      return;
    }
    flowLog('info', 'Received offer.', { sessionId: data.sessionId });
    if (!context.isCallInProgress) {
      await startIncomingCall(data.sessionId);
    }
    try {
      await waitForLocalMediaReady();
      await peer.handleOffer({ sdp: data.sdp });
    } catch (error) {
      flowLog('error', 'Failed to handle offer', error);
      endCall('Не удалось принять звонок.');
    }
  };

  const handleAnswer = async (data) => {
    if (!data?.sdp) {
      return;
    }
    flowLog('info', 'Received answer.', { sessionId: data.sessionId ?? context.activeSession });
    try {
      await peer.handleAnswer({ sdp: data.sdp });
    } catch (error) {
      flowLog('error', 'Failed to handle answer', error);
    }
  };

  const handleCandidate = async (data) => {
    const candidate = data?.candidate;
    if (!candidate) {
      return;
    }
    flowLog('info', 'Received ICE candidate.', {
      sessionId: data?.sessionId ?? context.activeSession,
      sdpMid: candidate?.sdpMid ?? null,
      sdpMLineIndex: candidate?.sdpMLineIndex ?? null
    });
    try {
      await peer.addCandidate({ candidate });
    } catch (error) {
      flowLog('error', 'Failed to add candidate', error);
    }
  };

  const handleSignalError = (data) => {
    const userMessage = 'Произошла ошибка сигналинга.';
    flowLog('error', 'Signal error', data ?? undefined);
    toastNotifier.error(userMessage);
    endCall(userMessage);
  };

  const handleSignalStatus = async (payload) => {
    const state = payload?.state ?? null;
    const sessionId = payload?.sessionId ?? context.activeSession;
    if (state === 'connected') {
      flowLog('info', 'Signaling session established.', { sessionId });
      return;
    }
    if (state === 'reconnected') {
      flowLog('info', 'Signaling session reconnected.', { sessionId });
      return;
    }
    if (state === 'closed') {
      flowLog('warn', 'Signaling session closed.', { sessionId });
    }
  };

  const handleHangup = (data) => {
    if (!data?.sessionId || data.sessionId !== context.activeSession) {
      return;
    }
    const hangupMessage =
      typeof data?.reason === 'string' && data.reason.trim().length > 0
        ? data.reason.trim()
        : 'Собеседник завершил звонок.';
    flowLog('info', 'Remote hangup received.', {
      sessionId: data.sessionId,
      reason: data.reason ?? null
    });
    endCall(hangupMessage, true);
  };

  const configurePeer = () => {
    peer.configure({
      sendOffer: async ({ sdp }) => {
        if (!context.activeSession || !sdp) {
          return;
        }
        const payload = {
          sessionId: context.activeSession,
          sdp
        };
        flowLog('info', 'Sending offer', {
          sessionId: context.activeSession,
          sdpLength: typeof sdp === 'string' ? sdp.length : 0
        });
        signal.sendOffer(payload);
      },
      sendAnswer: async ({ sdp }) => {
        if (!context.activeSession || !sdp) {
          return;
        }
        const payload = {
          sessionId: context.activeSession,
          sdp
        };
        flowLog('info', 'Sending answer', {
          sessionId: context.activeSession,
          sdpLength: typeof sdp === 'string' ? sdp.length : 0
        });
        signal.sendAnswer(payload);
      },
      sendCandidate: async ({ candidate }) => {
        if (!context.activeSession || !candidate) {
          return;
        }
        const normalizedCandidate = {
          candidate: candidate.candidate,
          sdpMid: candidate.sdpMid ?? null,
          sdpMLineIndex: candidate.sdpMLineIndex ?? null
        };
        flowLog('info', 'Sending ICE candidate.', {
          sessionId: context.activeSession,
          sdpMid: normalizedCandidate.sdpMid,
          sdpMLineIndex: normalizedCandidate.sdpMLineIndex
        });
        signal.sendCandidate({
          sessionId: context.activeSession,
          candidate: normalizedCandidate
        });
      },
      onRemoteStream: handleRemoteStream,
      onStateChange: handlePeerStateChange
    });
  };

  configurePeer();

  const bootstrap = async () => {
    if (context.pendingSession) {
      await startIncomingCall(context.pendingSession);
      return;
    }
    if (handleInitialHashNavigation()) {
      return;
    }
    renderReady();
  };

  const renderReadyPublic = () => {
    context.pendingSession = null;
    context.connectionMessage = '';
    context.remoteStream = null;
    context.activeSession = null;
    context.isCallInProgress = false;
    context.shouldSendOffer = false;
    stateMachine.reset();
    renderReady();
  };

  const renderActivePublic = () => {
    renderActive();
  };

  const renderEndedPublic = () => {
    renderEnded();
  };

  return {
    bootstrap,
    renderReady: renderReadyPublic,
    renderActive: renderActivePublic,
    renderEnded: renderEndedPublic,
    handleStartCall,
    handleReturnHome,
    handleOffer,
    handleAnswer,
    handleCandidate,
    handleHangup,
    handleSignalStatus,
    handleSignalError,
    openSettings
  };
}
