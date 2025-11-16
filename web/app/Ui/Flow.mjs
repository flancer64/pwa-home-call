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
      isCallInProgress: false
    };
    let mediaPreparation = null;
    const waitForLocalMediaReady = () => mediaPreparation ?? Promise.resolve();
    const log = logger ?? console;
    const toastNotifier = toast;
    const ensureRoot = () => {
      if (context.root) {
        return;
      }
      if (env.document) {
        throw new Error('Call flow root container is not initialized.');
      }
      throw new Error('Call flow requires a DOM root container.');
    };

    const joinSignalSession = () => {
      if (!context.activeSession) {
        return;
      }
      log.info('[CallFlow] Joining signal session.', { sessionId: context.activeSession });
      signal.joinSession?.({ sessionId: context.activeSession });
    };

    const leaveSignalSession = () => {
      if (!context.activeSession) {
        return;
      }
      log.info('[CallFlow] Leaving signal session.', { sessionId: context.activeSession });
      signal.leaveSession?.({ sessionId: context.activeSession });
    };

    const handleReturnHome = () => {
      leaveSignalSession();
      context.connectionMessage = '';
      context.remoteStream = null;
      context.activeSession = null;
      context.inviteUrl = null;
      context.isCallInProgress = false;
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
      log.info('[CallFlow] Preparing local media.');
      mediaPreparation = (async () => {
        await media.prepare();
        const stream = media.getLocalStream();
        const trackCount = typeof stream?.getTracks === 'function' ? stream.getTracks().length : 0;
        log.info('[CallFlow] Local media stream ready.', {
          sessionId: context.activeSession,
          tracks: trackCount
        });
        peer.setLocalStream(stream);
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
      log.info('[CallFlow] Initiating call session.', { sessionId, role });
      context.isCallInProgress = true;
      context.activeSession = sessionId;
      context.inviteUrl = sessionManager.buildInviteUrl(sessionId);
      context.connectionMessage = '';
      context.remoteStream = null;
      try {
        await prepareLocalMedia();
      } catch (error) {
        log.error('[CallFlow] Media preparation failed', error);
        endCall('Не удалось получить доступ к медиаустройствам.');
        return;
      }
      joinSignalSession();
      showCall();
      if (role === 'initiator') {
        try {
          await peer.start();
        } catch (error) {
          log.error('[CallFlow] Unable to start call', error);
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

    const endCall = (message = 'Звонок завершён.') => {
      log.info('Ending call session.', { message, sessionId: context.activeSession });
      if (stateMachine.getState() !== 'call') {
        context.connectionMessage = message;
        showEnd();
        return;
      }
      context.isCallInProgress = false;
      context.connectionMessage = message;
      leaveSignalSession();
      media.stopLocalStream();
      peer.end();
      context.remoteStream = null;
      context.activeSession = null;
      context.inviteUrl = null;
      showEnd();
    };

    const handleOffer = async (data) => {
      if (!data?.sessionId) {
        return;
      }
      log.info('[CallFlow] Received offer.', { sessionId: data.sessionId });
      if (!context.isCallInProgress) {
        await startIncomingCall(data.sessionId);
      }
      try {
        await waitForLocalMediaReady();
        await peer.handleOffer({ sdp: data.sdp });
      } catch (error) {
        log.error('[CallFlow] Failed to handle offer', error);
        endCall('Не удалось принять звонок.');
      }
    };

    const handleAnswer = async (data) => {
      if (!data) {
        return;
      }
      log.info('[CallFlow] Received answer.', { sessionId: context.activeSession });
      try {
        await peer.handleAnswer({ sdp: data.sdp });
      } catch (error) {
        log.error('[CallFlow] Failed to handle answer', error);
      }
    };

    const handleCandidate = async (data) => {
      if (!data) {
        return;
      }
      log.info('[CallFlow] Received ICE candidate.', {
        sessionId: data?.sessionId ?? context.activeSession,
        sdpMid: data?.candidate?.sdpMid ?? null,
        sdpMLineIndex: data?.candidate?.sdpMLineIndex ?? null
      });
      try {
        await peer.addCandidate({ candidate: data.candidate });
      } catch (error) {
        log.error('[CallFlow] Failed to add candidate', error);
      }
    };

    const handleSignalError = (data) => {
      const userMessage = 'Произошла ошибка сигналинга.';
      if (data?.message) {
        log.error('[CallFlow] Signal error', data.message, data);
      } else {
        log.error('[CallFlow] Signal error', data);
      }
      toastNotifier.error(userMessage);
      endCall(userMessage);
    };

    const configurePeer = () => {
      peer.configure({
        sendOffer: async (sdp) => {
          if (!context.activeSession || !sdp) {
            return;
          }
          signal.sendOffer({ sessionId: context.activeSession, sdp });
        },
        sendAnswer: async (sdp) => {
          if (!context.activeSession || !sdp) {
            return;
          }
          signal.sendAnswer({ sessionId: context.activeSession, sdp });
        },
        sendCandidate: async (candidate) => {
          if (!context.activeSession || !candidate) {
            return;
          }
          const normalizedCandidate = {
            candidate: candidate.candidate,
            sdpMid: candidate.sdpMid ?? null,
            sdpMLineIndex: candidate.sdpMLineIndex ?? null
          };
          log.info('[CallFlow] Sending ICE candidate.', {
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
    this.handleSignalError = handleSignalError;
  }
}
