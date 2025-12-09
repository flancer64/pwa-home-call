/**
 * @module HomeCall_Web_Net_Signal_Client
 * @description WebSocket client for signaling server.
 */

const buildSignalLogger = (logger, env) => {
  const createConsoleLogger = (consoleRef) => {
    const bindLevel = (level) => {
      const fn = typeof consoleRef[level] === 'function' ? consoleRef[level] : consoleRef.log;
      return typeof fn === 'function' ? fn.bind(consoleRef) : () => {};
    };
    return {
      debug: bindLevel('debug'),
      info: bindLevel('info'),
      warn: bindLevel('warn'),
      error: bindLevel('error')
    };
  };

  const wrapWithPrefix = (delegate) => {
    if (!delegate) {
      const noop = () => {};
      return { debug: noop, info: noop, warn: noop, error: noop };
    }
    const buildHandler = (level) => {
      const fallback = typeof delegate.info === 'function' ? delegate.info.bind(delegate) : () => {};
      const handler =
        typeof delegate[level] === 'function' ? delegate[level].bind(delegate) : fallback;
      return (message, details) => {
        handler(`[Signal] ${message}`, details);
      };
    };
    return {
      debug: buildHandler('debug'),
      info: buildHandler('info'),
      warn: buildHandler('warn'),
      error: buildHandler('error')
    };
  };

  const consoleRef = env?.console ?? (typeof globalThis !== 'undefined' ? globalThis.console : null);
  const delegate =
    logger && typeof logger.info === 'function'
      ? logger
      : consoleRef
        ? createConsoleLogger(consoleRef)
        : null;
  return wrapWithPrefix(delegate);
};

const RECONNECT_MIN_DELAY = 1000;
const RECONNECT_MAX_DELAY = 5000;

export default function HomeCall_Web_Net_Signal_Client({ HomeCall_Web_Env_Provider$: env, HomeCall_Web_Logger$: logger } = {}) {
  const signalLog = buildSignalLogger(logger, env);
  const WebSocketCtor = env?.WebSocket;
  const windowRef = env?.window;
  const scheduleTimer =
    typeof windowRef?.setTimeout === 'function'
      ? windowRef.setTimeout.bind(windowRef)
      : typeof globalThis?.setTimeout === 'function'
        ? globalThis.setTimeout.bind(globalThis)
        : () => {};
  const cancelTimer =
    typeof windowRef?.clearTimeout === 'function'
      ? windowRef.clearTimeout.bind(windowRef)
      : typeof globalThis?.clearTimeout === 'function'
        ? globalThis.clearTimeout.bind(globalThis)
        : () => {};
  const normalizedUrl = normalizeUrl(buildDefaultUrl(windowRef));
  const pending = [];
  const handlers = new Map();
  let socket = null;
  let connectPromise = null;
  let currentSessionId = null;
  let manualDisconnect = false;
  let reconnectTimer = null;
  let reconnectDelay = RECONNECT_MIN_DELAY;
  let reconnectAttempts = 0;
  let hasConnectedBefore = false;
  let lastDescription = null;
  const localCandidates = [];

  const normalizeSessionIdValue = (value) => {
    const normalizedValue = typeof value === 'string' ? value.trim() : '';
    return normalizedValue.length > 0 ? normalizedValue : null;
  };

  const buildSessionUrl = (sessionId) => `${normalizedUrl}?sessionId=${encodeURIComponent(sessionId)}`;

  const emit = (type, payload) => {
    const list = handlers.get(type);
    list?.forEach((handler) => {
      try {
        handler(payload);
      } catch (error) {
        console.error('[SignalClient] Handler failed', error);
      }
    });
  };

  const ensureHandlerSet = (type) => {
    if (!handlers.has(type)) {
      handlers.set(type, new Set());
    }
    return handlers.get(type);
  };

  const addHandler = (type, handler) => {
    if (!type || typeof handler !== 'function') {
      return;
    }
    ensureHandlerSet(type).add(handler);
  };

  const removeHandler = (type, handler) => {
    if (!type || typeof handler !== 'function') {
      return;
    }
    handlers.get(type)?.delete(handler);
  };

  const flushPending = () => {
    if (!socket || socket.readyState !== WebSocketCtor?.OPEN) {
      return;
    }
    if (pending.length > 0) {
      signalLog.debug('Flushing pending signaling messages.', { pending: pending.length });
    }
    while (pending.length > 0) {
      try {
        socket.send(pending.shift());
      } catch (error) {
        console.error('[SignalClient] Failed to flush pending message', error);
        break;
      }
    }
  };

  const normalizeCandidatePayload = (candidate) => {
    if (!candidate || typeof candidate.candidate !== 'string' || candidate.candidate.trim() === '') {
      return null;
    }
    return {
      candidate: candidate.candidate,
      sdpMid: candidate.sdpMid ?? null,
      sdpMLineIndex: candidate.sdpMLineIndex ?? null
    };
  };

  const routeMessage = (data) => {
    if (!data?.type) {
      return;
    }
    signalLog.info('Received signaling message.', {
      type: data.type,
      sessionId: data.sessionId ?? null
    });
    signalLog.debug('Raw signaling message payload.', data);
    if (['offer', 'answer', 'candidate', 'error', 'hangup'].includes(data.type)) {
      emit(data.type, data);
    }
  };

  const send = (payload) => {
    signalLog.debug('Sending signaling payload.', payload);
    const message = JSON.stringify(payload);
    if (socket && socket.readyState === WebSocketCtor?.OPEN) {
      socket.send(message);
    } else {
      pending.push(message);
    }
  };

  const replayLocalState = () => {
    if (!lastDescription?.type || !lastDescription?.sdp) {
      return;
    }
    signalLog.info('Replaying cached local SDP after reconnection.', {
      type: lastDescription.type,
      sessionId: currentSessionId ?? null
    });
    if (lastDescription.type === 'offer') {
      sendOfferMessage({ sdp: lastDescription.sdp, skipRecord: true });
    } else if (lastDescription.type === 'answer') {
      sendAnswerMessage({ sdp: lastDescription.sdp, skipRecord: true });
    }
    if (localCandidates.length > 0) {
      signalLog.info('Replaying cached ICE candidates after reconnection.', {
        count: localCandidates.length,
        sessionId: currentSessionId ?? null
      });
      localCandidates.forEach((candidate) => {
        sendCandidateMessage({ candidate, skipRecord: true });
      });
    }
  };

  const resetSessionState = () => {
    pending.length = 0;
    localCandidates.length = 0;
    lastDescription = null;
    currentSessionId = null;
    hasConnectedBefore = false;
    reconnectAttempts = 0;
    reconnectDelay = RECONNECT_MIN_DELAY;
  };

  const ensureSession = (sessionId) => {
    const normalized = normalizeSessionIdValue(sessionId);
    if (!normalized) {
      throw new TypeError('Signaling sessionId is required.');
    }
    if (currentSessionId !== normalized) {
      resetSessionState();
      currentSessionId = normalized;
      signalLog.info('Signaling session configured.', { sessionId: normalized });
    }
    return normalized;
  };

  const clearReconnectTimer = () => {
    if (reconnectTimer) {
      cancelTimer(reconnectTimer);
      reconnectTimer = null;
    }
  };

  const handleSocketClose = (event) => {
    const sessionId = currentSessionId;
    signalLog.warn('Signaling WebSocket closed.', {
      sessionId,
      code: event?.code ?? null,
      reason: event?.reason ?? null
    });
    emit('status', { state: 'closed', sessionId });
    socket = null;
    if (!manualDisconnect) {
      scheduleReconnect();
    }
  };

  const handleSocketError = (event) => {
    signalLog.error('Signaling WebSocket error.', event);
    emit('error', { message: 'WebSocket error', event });
  };

  const handleSocketMessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      routeMessage(data);
    } catch (error) {
      signalLog.error('Failed to parse signaling message.', error);
    }
  };

  const scheduleReconnect = () => {
    if (manualDisconnect || !currentSessionId || reconnectTimer) {
      return;
    }
    reconnectAttempts += 1;
    const delay = reconnectDelay;
    reconnectDelay = Math.min(RECONNECT_MAX_DELAY, reconnectDelay * 2);
    signalLog.warn('Signaling WebSocket disconnected unexpectedly. Scheduling reconnect.', {
      sessionId: currentSessionId,
      delay,
      attempt: reconnectAttempts
    });
    reconnectTimer = scheduleTimer(() => {
      reconnectTimer = null;
      attemptConnection().catch((error) => {
        signalLog.error('Automatic reconnect attempt failed.', error);
        scheduleReconnect();
      });
    }, delay);
  };

  const attemptConnection = () => {
    if (!currentSessionId) {
      return Promise.reject(new Error('Signaling sessionId is not configured.'));
    }
    if (socket && (socket.readyState === WebSocketCtor?.OPEN || socket.readyState === WebSocketCtor?.CONNECTING)) {
      return Promise.resolve();
    }
    if (connectPromise) {
      return connectPromise;
    }
    manualDisconnect = false;
    const url = buildSessionUrl(currentSessionId);
    connectPromise = new Promise((resolve, reject) => {
      if (!WebSocketCtor) {
        reject(new Error('WebSocket constructor is not available.'));
        connectPromise = null;
        return;
      }
      signalLog.info('Connecting to signaling endpoint.', { endpoint: url });
      const ws = new WebSocketCtor(url);
      socket = ws;
      let connected = false;
      let settled = false;

      const settleResolve = () => {
        if (settled) {
          return;
        }
        settled = true;
        resolve();
      };

      const settleReject = (error) => {
        if (settled) {
          return;
        }
        settled = true;
        reject(error);
      };

      const handleOpen = () => {
        clearReconnectTimer();
        flushPending();
        const status = hasConnectedBefore ? 'reconnected' : 'connected';
        const payload = { state: status, sessionId: currentSessionId };
        if (status === 'reconnected') {
          payload.attempt = reconnectAttempts;
          signalLog.info('Signaling WebSocket reconnected.', payload);
        } else {
          signalLog.info('Signaling WebSocket connected.', payload);
          hasConnectedBefore = true;
        }
        reconnectAttempts = 0;
        reconnectDelay = RECONNECT_MIN_DELAY;
        emit('status', payload);
        replayLocalState();
        connected = true;
        settleResolve();
      };

      const handleError = (event) => {
        handleSocketError(event);
        if (!connected) {
          settleReject(event?.error ?? new Error('Unexpected WebSocket error during connection.'));
        }
      };

      const handleClose = (event) => {
        handleSocketClose(event);
        if (!connected && !manualDisconnect) {
          settleReject(new Error('Signaling socket closed before connection completed.'));
        }
      };

      ws.addEventListener('open', handleOpen);
      ws.addEventListener('message', handleSocketMessage);
      ws.addEventListener('close', handleClose);
      ws.addEventListener('error', handleError);
    })
      .catch((error) => {
        signalLog.error('Failed to open signaling socket.', error);
        throw error;
      })
      .finally(() => {
        connectPromise = null;
      });
    return connectPromise;
  };

  const on = (type, handler) => addHandler(type, handler);
  const off = (type, handler) => removeHandler(type, handler);

  const connect = async (sessionId) => {
    ensureSession(sessionId);
    await attemptConnection();
  };

  const disconnect = () => {
    manualDisconnect = true;
    clearReconnectTimer();
    if (socket) {
      socket.close();
      socket = null;
    }
    connectPromise = null;
    resetSessionState();
  };

  const recordDescription = (type, sdp) => {
    lastDescription = { type, sdp };
  };

  const recordCandidate = (candidate) => {
    localCandidates.push(candidate);
  };

  const sendOfferMessage = ({ sessionId, sdp, skipRecord = false } = {}) => {
    const resolvedSession = normalizeSessionIdValue(sessionId ?? currentSessionId);
    if (!resolvedSession || typeof sdp !== 'string' || sdp.trim() === '') {
      signalLog.warn('Offer payload missing sessionId or SDP.', {
        sessionId,
        hasSdp: typeof sdp === 'string' && sdp.trim().length > 0
      });
      return;
    }
    if (!skipRecord) {
      recordDescription('offer', sdp);
    }
    const payload = { type: 'offer', sessionId: resolvedSession, sdp };
    signalLog.info('Sending offer message.', {
      sessionId: resolvedSession,
      sdpLength: sdp.length
    });
    send(payload);
  };

  const sendAnswerMessage = ({ sessionId, sdp, skipRecord = false } = {}) => {
    const resolvedSession = normalizeSessionIdValue(sessionId ?? currentSessionId);
    if (!resolvedSession || typeof sdp !== 'string' || sdp.trim() === '') {
      signalLog.warn('Answer payload missing sessionId or SDP.', {
        sessionId,
        hasSdp: typeof sdp === 'string' && sdp.trim().length > 0
      });
      return;
    }
    if (!skipRecord) {
      recordDescription('answer', sdp);
    }
    const payload = { type: 'answer', sessionId: resolvedSession, sdp };
    signalLog.info('Sending answer message.', {
      sessionId: resolvedSession,
      sdpLength: sdp.length
    });
    send(payload);
  };

  const sendCandidateMessage = ({ sessionId, candidate, skipRecord = false } = {}) => {
    const resolvedSession = normalizeSessionIdValue(sessionId ?? currentSessionId);
    const normalizedCandidate = normalizeCandidatePayload(candidate);
    if (!resolvedSession || !normalizedCandidate) {
      signalLog.warn('Candidate payload invalid.', {
        sessionId,
        hasCandidate: Boolean(candidate?.candidate)
      });
      return;
    }
    if (!skipRecord) {
      recordCandidate(normalizedCandidate);
    }
    const payload = {
      type: 'candidate',
      sessionId: resolvedSession,
      candidate: normalizedCandidate
    };
    signalLog.info('Sending ICE candidate message.', {
      sessionId: resolvedSession,
      sdpMid: normalizedCandidate.sdpMid,
      sdpMLineIndex: normalizedCandidate.sdpMLineIndex
    });
    send(payload);
  };

  const sendHangupMessage = ({ sessionId, reason } = {}) => {
    const resolvedSession = normalizeSessionIdValue(sessionId ?? currentSessionId);
    if (!resolvedSession) {
      signalLog.warn('Hangup payload missing sessionId.', { sessionId });
      return;
    }
    const payload = {
      type: 'hangup',
      sessionId: resolvedSession
    };
    const reasonText = typeof reason === 'string' ? reason.trim() : '';
    if (reasonText) {
      payload.reason = reasonText;
    }
    signalLog.info('Sending hangup message.', {
      sessionId: resolvedSession,
      reason: payload.reason ?? null
    });
    send(payload);
  };

  return {
    on,
    off,
    connect,
    disconnect,
    sendOffer: sendOfferMessage,
    sendAnswer: sendAnswerMessage,
    sendCandidate: sendCandidateMessage,
    sendHangup: sendHangupMessage
  };
}

function buildDefaultUrl(windowRef) {
  const locationRef = windowRef?.location;
  if (!locationRef) {
    return 'ws://localhost/signal';
  }
  const scheme = locationRef.protocol === 'https:' ? 'wss://' : 'ws://';
  const host = locationRef.host || 'localhost';
  return `${scheme}${host}/signal`;
}

function normalizeUrl(url) {
  const trimmed = typeof url === 'string' ? url.trim() : '';
  if (!trimmed) {
    throw new TypeError('SignalClient requires a non-empty WebSocket URL.');
  }
  const normalized = trimmed.replace(/\/+$/, '');
  if (!normalized) {
    throw new TypeError('SignalClient URL must resolve to a valid endpoint.');
  }
  return normalized;
}
