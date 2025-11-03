export class SignalClient {
  constructor(url) {
    const trimmed = typeof url === 'string' ? url.trim() : '';
    if (!trimmed) {
      throw new TypeError('SignalClient requires a non-empty WebSocket URL.');
    }
    this.url = trimmed.replace(/\/+$/, '');
    if (this.url === '') {
      throw new TypeError('SignalClient URL must resolve to a valid endpoint.');
    }
    this.socket = null;
    this.room = null;
    this.user = null;
    this.shouldReconnect = true;
    this.pending = [];
    this.handlers = new Map();
    this.connectPromise = null;
  }

  on(type, handler) {
    if (!this.handlers.has(type)) {
      this.handlers.set(type, new Set());
    }
    this.handlers.get(type).add(handler);
  }

  off(type, handler) {
    const list = this.handlers.get(type);
    if (list) {
      list.delete(handler);
    }
  }

  emit(type, payload) {
    const list = this.handlers.get(type);
    if (list) {
      list.forEach((handler) => handler(payload));
    }
  }

  async connect() {
    this.shouldReconnect = true;
    if (
      this.socket &&
      (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)
    ) {
      return this.connectPromise;
    }

    this.connectPromise = new Promise((resolve, reject) => {
      const socket = new WebSocket(this.url);
      this.socket = socket;

      socket.addEventListener('open', () => {
        this.emit('status', { state: 'connected' });
        this.flushPending();
        if (this.room && this.user) {
          this.join(this.room, this.user);
        }
        resolve();
      });

      socket.addEventListener('message', (event) => {
        try {
          const data = JSON.parse(event.data);
          this.routeMessage(data);
        } catch (error) {
          console.error('[SignalClient] Failed to parse message', error);
        }
      });

      socket.addEventListener('close', () => {
        this.emit('status', { state: 'closed' });
        if (this.shouldReconnect) {
          setTimeout(() => {
            this.connect().catch((error) => {
              console.error('[SignalClient] Reconnect failed', error);
            });
          }, 1000);
        }
      });

      socket.addEventListener('error', (event) => {
        this.emit('error', { message: 'WebSocket error', event });
        reject(event);
      });
    });
    try {
      await this.connectPromise;
    } finally {
      this.connectPromise = null;
    }
  }

  disconnect() {
    this.shouldReconnect = false;
    if (this.socket) {
      this.socket.close();
    }
  }

  join(room, user) {
    this.room = room;
    this.user = user;
    this.send('join', { room, user });
  }

  leave() {
    if (this.room && this.user) {
      this.send('leave', { room: this.room, user: this.user });
    }
    this.room = null;
    this.user = null;
  }

  sendOffer(to, sdp) {
    this.send('offer', { from: this.user, to, sdp });
  }

  sendAnswer(to, sdp) {
    this.send('answer', { from: this.user, to, sdp });
  }

  sendCandidate(to, candidate) {
    this.send('candidate', { from: this.user, to, candidate });
  }

  send(type, payload) {
    const message = JSON.stringify({ type, ...payload });
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(message);
    } else {
      this.pending.push(message);
    }
  }

  flushPending() {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      return;
    }
    while (this.pending.length > 0) {
      this.socket.send(this.pending.shift());
    }
  }

  routeMessage(data) {
    if (!data || !data.type) {
      return;
    }
    switch (data.type) {
      case 'online':
        this.emit('online', data.users || []);
        break;
      case 'offer':
      case 'answer':
      case 'candidate':
      case 'error':
        this.emit(data.type, data);
        break;
      default:
        console.warn('[SignalClient] Unknown message type', data.type);
    }
  }
}
