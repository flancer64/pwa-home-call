const DEFAULT_ENDPOINT = (() => {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${protocol}//${window.location.host}/ws`;
})();

export class SignalClient {
  constructor(endpoint = DEFAULT_ENDPOINT) {
    this.endpoint = endpoint;
    this.socket = null;
    this.handlers = new Map();
    this.hello = null;
  }

  on(type, callback) {
    if (!this.handlers.has(type)) {
      this.handlers.set(type, new Set());
    }
    this.handlers.get(type).add(callback);
    return () => this.off(type, callback);
  }

  off(type, callback) {
    if (!this.handlers.has(type)) {
      return;
    }
    this.handlers.get(type).delete(callback);
  }

  emit(type, payload) {
    if (!this.handlers.has(type)) {
      return;
    }
    for (const handler of this.handlers.get(type)) {
      try {
        handler(payload);
      } catch (err) {
        console.error('Signal handler error', err);
      }
    }
  }

  async connect({ name, code }) {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }

    this.hello = { name, code };

    return new Promise((resolve, reject) => {
      const socket = new WebSocket(this.endpoint);
      this.socket = socket;
      let settled = false;

      socket.addEventListener('open', () => {
        socket.send(
          JSON.stringify({
            type: 'join',
            payload: { name, code }
          })
        );
      });

      socket.addEventListener('message', (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'welcome') {
            settled = true;
            this.emit('open', data.payload);
            resolve(data.payload);
            return;
          }
          this.emit(data.type, data.payload);
        } catch (err) {
          console.error('Failed to process WS message', err, event.data);
        }
      });

      socket.addEventListener('close', () => {
        this.emit('close');
        if (!settled) {
          reject(new Error('Connection closed before welcome message.'));
        }
      });

      socket.addEventListener('error', (err) => {
        console.error('Signal socket error', err);
        this.emit('error', err);
        if (!settled) {
          reject(err);
        }
      });
    });
  }

  send(type, payload) {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      throw new Error('Signal connection is not open.');
    }
    this.socket.send(JSON.stringify({ type, payload }));
  }

  requestUsers() {
    if (!this.socket) {
      return;
    }
    this.send('users:list', {});
  }

  sendOffer(targetId, description) {
    this.send('call:offer', { targetId, description });
  }

  sendAnswer(targetId, description) {
    this.send('call:answer', { targetId, description });
  }

  sendCandidate(targetId, candidate) {
    this.send('call:candidate', { targetId, candidate });
  }

  sendEnd(targetId) {
    this.send('call:end', { targetId });
  }

  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }
}
