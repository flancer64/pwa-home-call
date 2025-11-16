/**
 * @module HomeCall_Web_Ui_Flow
 * @description Orchestrates the home → invite → call → end cycle using sessionIds.
 */
export default class HomeCall_Web_Ui_Flow {
  constructor({
    HomeCall_Web_State_Machine$: stateMachine,
    HomeCall_Web_Net_Session_Manager$: sessionManager,
    HomeCall_Web_Ui_InviteService$: inviteService,
    HomeCall_Web_Ui_Controller$: uiController,
    HomeCall_Web_Media_Manager$: media,
    HomeCall_Web_Rtc_Peer$: peer,
    HomeCall_Web_Net_Signal_Client$: signal,
    HomeCall_Web_Env_Provider$: env,
    HomeCall_Web_Ui_Toast$: toast,
    HomeCall_Web_Logger$: logger
  } = {}) {
    if (!stateMachine) {
      throw new Error('State machine is required for the call flow.');
    }
    if (!sessionManager) {
      throw new Error('Session manager is required for the call flow.');
    }
    if (!inviteService) {
      throw new Error('Invite service is required for the call flow.');
    }
    if (!uiController) {
      throw new Error('UI controller is required for the call flow.');
    }
    if (!media) {
      throw new Error('Media manager is required for the call flow.');
    }
    if (!peer) {
      throw new Error('RTC peer is required for the call flow.');
    }
    if (!signal) {
      throw new Error('Signal client is required for the call flow.');
    }
    if (!env) {
      throw new Error('Environment provider is required for the call flow.');
    }
    if (!toast) {
      throw new Error('Toast module is required for the call flow.');
    }

    const context = {
      root: null,
      pendingSession: sessionManager.readSessionFromUrl(),
      activeSession: null,
      inviteUrl: null,
      remoteStream: null,
      connectionMessage: '',
      isCallInProgress: false,
      role: null
    };
    let mediaPreparation = null;
    const waitForLocalMediaReady = () => mediaPreparation ?? Promise.resolve();
    const log = logger ?? console;
    const toastNotifier = toast;
    let recoveryInProgress = false;
    const ensureRoot = () => {
      if (context.root) {
        return;
      }
      if (env.document) {
        throw new Error('Call flow root container is not initialized.');
      }
      throw new Error('Call flow requires a DOM root container.');
    };
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

    const handleReturnHome = () => {
      context.connectionMessage = '';
      context.remoteStream = null;
      context.activeSession = null;
      context.inviteUrl = null;
      context.isCallInProgress = false;
      context.role = null;
      context.pendingSession = null;
      sessionManager.clearSessionFromUrl();
      showHome();
    };

    const prepareOutgoingInvite = () => {
      if (context.isCallInProgress) {
        return;
      }
      const sessionId = sessionManager.createSessionId();
      context.activeSession = sessionId;
      context.inviteUrl = sessionManager.buildInviteUrl(sessionId);
      context.pendingSession = null;
      sessionManager.clearSessionFromUrl();
      showInviteScreen({ sessionId });
    };

    const handleStartCall = () => {
      if (context.isCallInProgress) {
        return;
      }
      prepareOutgoingInvite();
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

    const beginCallSession = async ({ sessionId, role }) => {
      if (!sessionId) {
        toastNotifier.error('Сессия не указана.');
        showHome();
        return;
      }
      if (context.isCallInProgress) {
        return;
      }
      flowLog('info', 'Initiating call session.', { sessionId, role });
      context.role = role;
      context.isCallInProgress = true;
      context.activeSession = sessionId;
      context.inviteUrl = sessionManager.buildInviteUrl(sessionId);
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
      showCall();
      if (role === 'initiator') {
        try {
          await peer.start();
        } catch (error) {
          flowLog('error', 'Unable to start call', error);
          endCall('Не удалось начать звонок.');
        }
      }
    };

    const startOutgoingCall = () => beginCallSession({ sessionId: context.activeSession, role: 'initiator' });

    const startIncomingCall = async (sessionId) => {
      if (!sessionId || context.isCallInProgress) {
        return;
      }
      context.pendingSession = null;
      sessionManager.clearSessionFromUrl();
      await beginCallSession({ sessionId, role: 'recipient' });
    };

    const updateRemoteStream = (stream) => {
      context.remoteStream = stream ?? null;
      if (stateMachine.getState() === 'call') {
        uiController.updateRemoteStream?.(context.remoteStream);
      }
    };

    const handleRemoteStream = (stream) => {
      updateRemoteStream(stream);
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
        const initiator = context.role === 'initiator' ? 'caller' : 'callee';
        signal.sendHangup({ sessionId, initiator });
      }
      peer.end();
      signal.disconnect();
      context.isCallInProgress = false;
      context.connectionMessage = message;
      context.remoteStream = null;
      context.activeSession = null;
      context.inviteUrl = null;
      context.role = null;
      media.stopLocalStream();
      showEnd();
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

    const attemptPeerRecovery = async () => {
      if (!context.isCallInProgress || recoveryInProgress) {
        return;
      }
      const state = typeof peer.getConnectionState === 'function' ? peer.getConnectionState() : null;
      if (!state || state === 'connected') {
        return;
      }
      if (!['disconnected', 'failed', 'closed'].includes(state)) {
        return;
      }
      recoveryInProgress = true;
      flowLog('info', 'Rebuilding peer connection after signal reconnection.', {
        sessionId: context.activeSession,
        previousState: state
      });
      try {
        peer.end();
        const stream = media.getLocalStream();
        if (stream && typeof peer.setLocalStream === 'function') {
          peer.setLocalStream(stream);
        }
        peer.prepare();
        if (context.role === 'initiator') {
          await peer.start();
        }
      } catch (error) {
        flowLog('error', 'Failed to rebuild peer connection.', error);
        endCall('Связь потеряна.', true);
      } finally {
        recoveryInProgress = false;
      }
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
        await attemptPeerRecovery();
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
      flowLog('info', 'Remote hangup received.', {
        sessionId: data.sessionId,
        initiator: data.initiator ?? null
      });
      endCall('Собеседник завершил звонок.', true);
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

    let showInviteScreen;
    let showCall;
    let showEnd;
    let showHome;
    let showSettings;

    showInviteScreen = ({ sessionId, inviteUrl } = {}) => {
      ensureRoot();
      stateMachine.goInvite();
      const resolvedSessionId = sessionId ?? context.activeSession;
      const resolvedInviteUrl = inviteUrl ?? context.inviteUrl;
      uiController.showInvite({
        container: context.root,
        sessionId: resolvedSessionId,
        inviteUrl: resolvedInviteUrl,
        canShare: inviteService.canShare(),
        onCopyLink: () => inviteService.copySessionLink(resolvedSessionId),
        onShareLink: () => inviteService.shareSessionLink(resolvedSessionId),
        onStartCall: () => startOutgoingCall(),
        onClose: () => showHome()
      });
    };

    showCall = () => {
      ensureRoot();
      stateMachine.goCall();
      uiController.showCall({
        container: context.root,
        remoteStream: context.remoteStream,
        onEnd: () => endCall('Вы завершили звонок.'),
        onOpenSettings: () => showSettings?.({ onClose: showCall })
      });
    };

    showEnd = () => {
      ensureRoot();
      stateMachine.goEnd();
      uiController.showEnd({
        container: context.root,
        connectionMessage: context.connectionMessage || 'Звонок завершён.',
        onReturn: handleReturnHome
      });
    };

    showHome = () => {
      ensureRoot();
      stateMachine.goHome();
      uiController.showHome({
        container: context.root,
        onStartCall: handleStartCall,
        onOpenSettings: () => showSettings?.({ onClose: showHome })
      });
    };

    showSettings = ({ onClose } = {}) => {
      ensureRoot();
      stateMachine.goSettings();
      uiController.showSettings({
        container: context.root,
        onClose: typeof onClose === 'function' ? onClose : showHome
      });
    };

    this.showInvite = (params = {}) => showInviteScreen(params);
    this.showCall = showCall;
    this.showEnd = showEnd;
    this.showHome = showHome;
    this.showSettings = showSettings;

    const bootstrap = async () => {
      ensureRoot();
      if (context.pendingSession) {
        await startIncomingCall(context.pendingSession);
        return;
      }
      showHome();
    };

    this.initRoot = (container) => {
      if (!container) {
        throw new Error('Call flow requires a root container.');
      }
      context.root = container;
    };

    this.bootstrap = bootstrap;
    this.renderHome = () => showHome();
    this.handleStartCall = handleStartCall;
    this.handleReturnHome = handleReturnHome;
    this.handleOffer = handleOffer;
    this.handleAnswer = handleAnswer;
    this.handleCandidate = handleCandidate;
    this.handleHangup = handleHangup;
    this.handleSignalStatus = handleSignalStatus;
    this.handleSignalError = handleSignalError;
  }
}
