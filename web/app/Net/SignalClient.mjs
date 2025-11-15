/**
 * @module HomeCall_Web_Net_SignalClient
 * @description WebSocket client for signaling server.
 */

const buildSignalLogger = (logger, env) => {
  if (logger && typeof logger.info === 'function') {
    return logger;
  }
  const consoleRef = env?.console ?? (typeof globalThis !== 'undefined' ? globalThis.console : null);
  if (!consoleRef) {
    const noop = () => {};
    return { debug: noop, info: noop, warn: noop, error: noop };
  }
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

export default class HomeCall_Web_Net_SignalClient {
  constructor({ HomeCall_Web_Env_Provider$: env, HomeCall_Web_Shared_Logger$: logger } = {}) {
    if (!env) {
      throw new Error('HomeCall environment provider is required.');
    }
    const signalLog = buildSignalLogger(logger, env);
    const WebSocketCtor = env.WebSocket;
    const windowRef = env.window;
    const normalizedUrl = normalizeUrl(buildDefaultUrl(windowRef));
    const pending = [];
    const handlers = new Map();
    let socket = null;
    let connectPromise = null;

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
      if (!socket || socket.readyState !== WebSocketCtor.OPEN) {
        return;
      }
      if (pending.length > 0) {
        signalLog.debug('Flushing pending signaling messages.', { pending: pending.length });
      }
      while (pending.length > 0) {
        socket.send(pending.shift());
      }
    };

    const routeMessage = (data) => {
      if (!data?.type) {
        return;
      }
      signalLog.debug('Received signaling message.', data);
      if (['offer', 'answer', 'candidate', 'error'].includes(data.type)) {
        emit(data.type, data);
      }
    };

    const send = (payload) => {
      signalLog.debug('Sending signaling payload.', payload);
      const message = JSON.stringify(payload);
      if (socket && socket.readyState === WebSocketCtor.OPEN) {
        socket.send(message);
      } else {
        pending.push(message);
      }
    };

    const openSocket = () => {
      if (!WebSocketCtor) {
        throw new Error('WebSocket constructor is not available.');
      }
      signalLog.info('Connecting to signaling endpoint.', { endpoint: normalizedUrl });
      const ws = new WebSocketCtor(normalizedUrl);
      socket = ws;
      ws.addEventListener('open', () => {
        flushPending();
        signalLog.info('Signaling WebSocket connected.');
        emit('status', { state: 'connected' });
      });
      ws.addEventListener('message', (event) => {
        try {
          const data = JSON.parse(event.data);
          routeMessage(data);
        } catch (error) {
          signalLog.error('Failed to parse signaling message.', error);
        }
      });
      ws.addEventListener('close', () => {
        signalLog.warn('Signaling WebSocket closed.');
        emit('status', { state: 'closed' });
        socket = null;
      });
      ws.addEventListener('error', (event) => {
        signalLog.error('Signaling WebSocket error.', event);
        emit('error', { message: 'WebSocket error', event });
      });
      return ws;
    };

    this.on = (type, handler) => addHandler(type, handler);

    this.off = (type, handler) => removeHandler(type, handler);

    this.connect = async () => {
      if (socket && (socket.readyState === WebSocketCtor.OPEN || socket.readyState === WebSocketCtor.CONNECTING)) {
        return connectPromise ?? Promise.resolve();
      }
      connectPromise = new Promise((resolve, reject) => {
        try {
          signalLog.info('Signaling client initiating connection.');
          openSocket();
          resolve();
        } catch (error) {
          signalLog.error('Failed to open signaling socket.', error);
          reject(error);
        }
      });
      try {
        await connectPromise;
      } finally {
        connectPromise = null;
      }
    };

    this.disconnect = () => {
      signalLog.info('Signaling client disconnect requested.');
      socket?.close();
      socket = null;
      connectPromise = null;
    };

    const envelope = (type, payload = {}) => {
      const message = { type, ...payload };
      send(message);
    };

    this.sendOffer = (payload) => envelope('offer', payload);
    this.sendAnswer = (payload) => envelope('answer', payload);
    this.sendCandidate = (payload) => envelope('candidate', payload);
    this.joinSession = (payload) => envelope('join', payload);
    this.leaveSession = (payload) => envelope('leave', payload);
  }
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
