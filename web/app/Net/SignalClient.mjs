/**
 * @module HomeCall_Web_Net_SignalClient
 * @description WebSocket client for signaling server.
 */

export default class HomeCall_Web_Net_SignalClient {
  constructor({ url, 'WebSocket$': WsSingleton } = {}) {
    const WebSocketCtor = WsSingleton ?? globalThis.WebSocket;
    const normalizedUrl = normalizeUrl(url ?? buildDefaultUrl());
    let socket = null;
    let room = null;
    let user = null;
    let shouldReconnect = true;
    const pending = [];
    const handlers = new Map();
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

    const flushPending = () => {
      if (!socket || socket.readyState !== WebSocketCtor.OPEN) {
        return;
      }
      while (pending.length > 0) {
        socket.send(pending.shift());
      }
    };

    const routeMessage = (data) => {
      if (!data || !data.type) {
        return;
      }
      switch (data.type) {
        case 'online':
          emit('online', data.users || []);
          break;
        case 'offer':
        case 'answer':
        case 'candidate':
        case 'error':
          emit(data.type, data);
          break;
        default:
          console.warn('[SignalClient] Unknown message type', data.type);
      }
    };

    const send = (type, payload) => {
      const message = JSON.stringify({ type, ...payload });
      if (socket && socket.readyState === WebSocketCtor.OPEN) {
        socket.send(message);
      } else {
        pending.push(message);
      }
    };

    this.on = (type, handler) => {
      if (!handlers.has(type)) {
        handlers.set(type, new Set());
      }
      handlers.get(type).add(handler);
    };

    this.off = (type, handler) => {
      handlers.get(type)?.delete(handler);
    };

    this.connect = async () => {
      if (socket && (socket.readyState === WebSocketCtor.OPEN || socket.readyState === WebSocketCtor.CONNECTING)) {
        return connectPromise ?? Promise.resolve();
      }
      if (typeof WebSocketCtor !== 'function') {
        throw new Error('WebSocket constructor is not available.');
      }
      shouldReconnect = true;
      connectPromise = new Promise((resolve, reject) => {
        const ws = new WebSocketCtor(normalizedUrl);
        socket = ws;
        ws.addEventListener('open', () => {
          emit('status', { state: 'connected' });
          flushPending();
          if (room && user) {
            send('join', { room, user });
          }
          resolve();
        });
        ws.addEventListener('message', (event) => {
          try {
            const data = JSON.parse(event.data);
            routeMessage(data);
          } catch (error) {
            console.error('[SignalClient] Failed to parse message', error);
          }
        });
        ws.addEventListener('close', () => {
          emit('status', { state: 'closed' });
          if (shouldReconnect) {
            setTimeout(() => {
              this.connect().catch((error) => {
                console.error('[SignalClient] Reconnect failed', error);
              });
            }, 1000);
          }
        });
        ws.addEventListener('error', (event) => {
          emit('error', { message: 'WebSocket error', event });
          reject(event);
        });
      });
      try {
        await connectPromise;
      } finally {
        connectPromise = null;
      }
    };

    this.disconnect = () => {
      shouldReconnect = false;
      socket?.close();
    };

    this.join = (roomName, userName) => {
      room = roomName;
      user = userName;
      send('join', { room, user });
    };

    this.leave = () => {
      if (room && user) {
        send('leave', { room, user });
      }
      room = null;
      user = null;
    };

    this.sendOffer = (to, sdp) => {
      send('offer', { from: user, to, sdp });
    };

    this.sendAnswer = (to, sdp) => {
      send('answer', { from: user, to, sdp });
    };

    this.sendCandidate = (to, candidate) => {
      send('candidate', { from: user, to, candidate });
    };
  }
}

function buildDefaultUrl() {
  if (typeof location === 'undefined') {
    return 'ws://localhost/signal';
  }
  const scheme = location.protocol === 'https:' ? 'wss://' : 'ws://';
  const host = location.host || 'localhost';
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
