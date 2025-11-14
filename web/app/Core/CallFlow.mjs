const priv = new WeakMap();

/**
 * @module HomeCall_Web_Core_CallFlow
 * @description Encapsulates the home → invite → call → end journey and manages call state.
 */
export default class HomeCall_Web_Core_CallFlow {
  constructor({
    HomeCall_Web_Core_StateMachine$: stateMachine,
    HomeCall_Web_Core_RoomManager$: roomManager,
    HomeCall_Web_Core_InviteService$: inviteService,
    HomeCall_Web_Core_UiController$: uiController,
    HomeCall_Web_Media_Manager$: media,
    HomeCall_Web_Rtc_Peer$: peer,
    HomeCall_Web_Net_SignalClient$: signal,
    HomeCall_Web_Infra_Storage$: storage,
    HomeCall_Web_Env_Provider$: env,
    HomeCall_Web_Ui_Toast$: toast,
    HomeCall_Web_Shared_Logger$: logger
  } = {}) {
    if (!stateMachine) {
      throw new Error('State machine is required for the call flow.');
    }
    if (!roomManager) {
      throw new Error('Room manager is required for the call flow.');
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
    if (!storage) {
      throw new Error('Storage is required for the call flow.');
    }
    if (!env) {
      throw new Error('Environment provider is required for the call flow.');
    }
    if (!toast) {
      throw new Error('Toast module is required for the call flow.');
    }

    const context = {
      root: null,
      pendingRoom: roomManager.readRoomFromUrl(),
      myName: storage.getMyData()?.myName ?? null,
      activeRoom: null,
      remoteStream: null,
      connectionMessage: '',
      isCallInProgress: false
    };
    priv.set(this, context);

    let showHome;
    let showInviteScreen;
    let showCall;
    let showEnd;

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

    const joinSignalRoom = () => {
      if (!context.activeRoom || !context.myName) {
        return;
      }
      signal.joinRoom?.({ room: context.activeRoom, user: context.myName });
    };

    const leaveSignalRoom = () => {
      if (!context.activeRoom || !context.myName) {
        return;
      }
      signal.leaveRoom?.({ room: context.activeRoom, user: context.myName });
    };

    const handleChangeName = () => {
      storage.setMyName?.(null);
      context.myName = null;
      toastNotifier.info('Имя очищено. Введите новое имя, чтобы продолжить.');
      context.pendingRoom = null;
      showHome();
    };

    const handleResetSettings = () => {
      const resetResult = storage.resetMyData?.();
      if (resetResult) {
        toastNotifier.success('Настройки сброшены.');
      } else {
        toastNotifier.error('Не удалось сбросить настройки.');
      }
      context.myName = null;
      context.pendingRoom = null;
      context.activeRoom = null;
      context.remoteStream = null;
      context.connectionMessage = '';
      context.isCallInProgress = false;
      showHome();
    };

    const handleReturnHome = () => {
      leaveSignalRoom();
      context.connectionMessage = '';
      context.remoteStream = null;
      context.activeRoom = null;
      context.pendingRoom = null;
      context.isCallInProgress = false;
      roomManager.clearRoomFromUrl();
      showHome();
    };

    const handleStartCall = async (name) => {
      if (context.isCallInProgress) {
        return;
      }
      log.info('Start call requested', {
        hasName: Boolean(context.myName),
        pendingRoom: context.pendingRoom
      });
      if (typeof name === 'string' && name.trim()) {
        const normalized = name.trim();
        const saved = storage.setMyName?.(normalized);
        if (!saved) {
          toastNotifier.error('Не удалось сохранить имя.');
          return;
        }
        context.myName = normalized;
        log.info('Caller name stored', { name: normalized });
        toastNotifier.success('Имя сохранено.');
      }
      if (!context.myName) {
          toastNotifier.error('Введите имя.');
          return;
        }
        signal.setSenderName?.(context.myName);
      if (context.pendingRoom) {
        const room = context.pendingRoom;
        context.pendingRoom = null;
        log.info('Incoming room detected, resuming call.', { room });
        await startIncomingCall(room);
        return;
      }
      prepareOutgoingInvite();
    };

    const prepareOutgoingInvite = () => {
      if (context.isCallInProgress) {
        return;
      }
      const roomId = roomManager.createRoomId();
      context.activeRoom = roomId;
      context.pendingRoom = null;
      roomManager.clearRoomFromUrl();
      context.isCallInProgress = true;
      log.info('Prepared outgoing invite link.', { roomId });
      showInviteScreen(roomId);
    };

    const prepareLocalMedia = async () => {
      await media.prepare();
      const stream = media.getLocalStream();
      peer.setLocalStream(stream);
    };

    const beginCallSession = async ({ roomId, role }) => {
      if (!roomId) {
        toastNotifier.error('Комната не указана.');
        context.isCallInProgress = false;
        showHome();
        return;
      }
      log.info('Beginning call session', { roomId, role, user: context.myName });
      try {
        await prepareLocalMedia();
      } catch (error) {
        log.error('[CallFlow] Media preparation failed', error);
        endCall('Не удалось получить доступ к медиаустройствам.');
        return;
      }
      context.remoteStream = null;
      context.connectionMessage = '';
      joinSignalRoom();
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

    const startIncomingCall = async (roomId) => {
      if (!roomId || context.isCallInProgress) {
        return;
      }
      context.activeRoom = roomId;
      context.pendingRoom = null;
      context.isCallInProgress = true;
      roomManager.clearRoomFromUrl();
      log.info('Incoming room accepted', { roomId });
      await beginCallSession({ roomId, role: 'recipient' });
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
      log.info('Ending call session.', { message });
      if (stateMachine.getState() !== 'call') {
        context.connectionMessage = message;
        showEnd();
        return;
      }
      context.isCallInProgress = false;
      context.connectionMessage = message;
      leaveSignalRoom();
      media.stopLocalStream();
      peer.end();
      context.remoteStream = null;
      context.activeRoom = null;
      showEnd();
    };

    const handleOffer = async (data) => {
      if (!data || !data.room) {
        return;
      }
      context.activeRoom = data.room;
      log.info('Offer received via signal.', { room: data.room, from: data.from });
      if (!context.myName) {
        context.pendingRoom = data.room;
        log.info('Name is missing, waiting for user input before joining.', { room: data.room });
        showHome();
        return;
      }
      signal.setSenderName?.(context.myName);
      if (stateMachine.getState() !== 'call') {
        await startIncomingCall(data.room);
      }
      try {
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
      log.info('Answer received via signal.', { from: data.from });
      try {
        await peer.handleAnswer({ from: data.from, sdp: data.sdp });
      } catch (error) {
        log.error('[CallFlow] Failed to handle answer', error);
      }
    };

    const handleCandidate = async (data) => {
      if (!data) {
        return;
      }
      log.debug('Candidate received via signal.', { candidate: data.candidate?.candidate ?? null });
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
          if (!context.activeRoom || !context.myName || !sdp) {
            return;
          }
          signal.sendOffer({ room: context.activeRoom, from: context.myName, sdp });
        },
        sendAnswer: async (sdp) => {
          if (!context.activeRoom || !context.myName || !sdp) {
            return;
          }
          signal.sendAnswer({ room: context.activeRoom, from: context.myName, sdp });
        },
        sendCandidate: async (candidate) => {
          if (!context.activeRoom || !context.myName || !candidate) {
            return;
          }
          const normalizedCandidate = {
            candidate: candidate.candidate,
            sdpMid: candidate.sdpMid ?? null,
            sdpMLineIndex: candidate.sdpMLineIndex ?? null
          };
          signal.sendCandidate({
            room: context.activeRoom,
            from: context.myName,
            candidate: normalizedCandidate
          });
        },
        onRemoteStream: handleRemoteStream,
        onStateChange: handlePeerStateChange
      });
    };

    configurePeer();

    showInviteScreen = (roomId) => {
      ensureRoot();
      stateMachine.goInvite();
      uiController.showInvite({
        container: context.root,
        roomId,
        inviteUrl: roomManager.buildInviteUrl(roomId),
        canShare: inviteService.canShare(),
        onCopyLink: () => inviteService.copyRoomLink(roomId),
        onShareLink: () => inviteService.shareRoomLink(roomId),
        onStartCall: () => beginCallSession({ roomId, role: 'initiator' })
      });
    };

    showCall = () => {
      ensureRoot();
      stateMachine.goCall();
      uiController.showCall({
        container: context.root,
        remoteStream: context.remoteStream,
        onEnd: () => endCall('Вы завершили звонок.')
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
      const incomingRoomHint = context.pendingRoom && !context.myName ? context.pendingRoom : null;
      uiController.showHome({
        container: context.root,
        savedName: context.myName,
        incomingRoom: incomingRoomHint,
        onStartCall: handleStartCall,
        onChangeName: handleChangeName,
        onResetSettings: handleResetSettings
      });
    };

    const bootstrap = async () => {
      ensureRoot();
      context.pendingRoom = roomManager.readRoomFromUrl();
      context.myName = storage.getMyData()?.myName ?? null;
      if (context.myName) {
        signal.setSenderName?.(context.myName);
      }
      if (context.pendingRoom && context.myName) {
        await startIncomingCall(context.pendingRoom);
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
    this.handleChangeName = handleChangeName;
    this.handleResetSettings = handleResetSettings;
    this.handleReturnHome = handleReturnHome;
    this.handleOffer = handleOffer;
    this.handleAnswer = handleAnswer;
    this.handleCandidate = handleCandidate;
    this.handleSignalError = handleSignalError;
  }
}
