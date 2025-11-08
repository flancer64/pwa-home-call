import test from 'node:test';
import assert from 'node:assert/strict';
import { createWebContainer } from './helper.mjs';

test('App wires screens and services through DI', async () => {
  const OriginalMediaStream = globalThis.MediaStream;
  class FakeMediaStream {
    constructor() {
      this.tracks = [];
    }
    getTracks() {
      return this.tracks;
    }
  }
  globalThis.MediaStream = FakeMediaStream;
  const container = await createWebContainer();
  const calls = {
    loadAll: 0,
    registerSW: 0,
    startWatcher: 0,
    mediaSetPeer: 0,
    mediaPrepare: 0,
    peerStart: 0,
    peerEnd: 0,
    stopLocal: 0,
    disconnect: 0
  };
  const templateLoader = {
    async loadAll() {
      calls.loadAll += 1;
    },
    apply() {}
  };
  const swManager = {
    async register() {
      calls.registerSW += 1;
      return null;
    },
    getRegistration() {
      return null;
    }
  };
  const versionWatcher = {
    async start() {
      calls.startWatcher += 1;
    }
  };
  let mediaStream = null;
  const mediaManager = {
    setPeer() {
      calls.mediaSetPeer += 1;
    },
    setLocalStream(stream) {
      mediaStream = stream;
    },
    getLocalStream() {
      return mediaStream;
    },
    stopLocalStream() {
      calls.stopLocal += 1;
    },
    async prepare() {
      calls.mediaPrepare += 1;
    }
  };
  const signalHandlers = new Map();
  const signalClient = {
    on(type, handler) {
      signalHandlers.set(type, handler);
    },
    sendOffer() {},
    sendAnswer() {},
    sendCandidate() {},
    disconnect() {
      calls.disconnect += 1;
    }
  };
  let configuredHandlers = null;
  const peer = {
    configure(handlers) {
      configuredHandlers = handlers;
    },
    async start(target) {
      calls.peerStart += 1;
      return target;
    },
    end() {
      calls.peerEnd += 1;
    },
    async handleOffer() {},
    async handleAnswer() {},
    async addCandidate() {}
  };
  const enterScreen = {
    lastOnEnter: null,
    show({ onEnter }) {
      this.lastOnEnter = onEnter;
    }
  };
  const lobbyScreen = {
    shows: 0,
    lastParams: null,
    show(params) {
      this.shows += 1;
      this.lastParams = params;
    }
  };
  const callScreen = {
    shows: 0,
    lastParams: null,
    updateRemoteStream() {},
    show(params) {
      this.shows += 1;
      this.lastParams = params;
    }
  };
  const endScreen = {
    shows: 0,
    lastParams: null,
    show(params) {
      this.shows += 1;
      this.lastParams = params;
    }
  };
  const toggles = [];
  const rootElement = {};
  const documentStub = {
    getElementById(id) {
      return id === 'app' ? rootElement : null;
    },
    body: {
      classList: {
        toggle(name, state) {
          toggles.push({ name, state });
        }
      }
    }
  };
  container.register('document$', documentStub);
  container.register('window$', {});
  container.register('navigator$', {});
  container.register('fetch$', async () => ({ json: async () => ({ version: '1.0.0' }), text: async () => '' }));
  container.register('setInterval$', () => {});
  container.register('clearInterval$', () => {});
  container.register('WebSocket$', class {});
  container.register('HomeCall_Web_Core_TemplateLoader$', templateLoader);
  container.register('HomeCall_Web_Core_ServiceWorkerManager$', swManager);
  container.register('HomeCall_Web_Core_VersionWatcher$', versionWatcher);
  container.register('HomeCall_Web_Media_Manager$', mediaManager);
  container.register('HomeCall_Web_Net_SignalClient$', signalClient);
  container.register('HomeCall_Web_Rtc_Peer$', peer);
  container.register('HomeCall_Web_Ui_Screen_Enter$', enterScreen);
  container.register('HomeCall_Web_Ui_Screen_Lobby$', lobbyScreen);
  container.register('HomeCall_Web_Ui_Screen_Call$', callScreen);
  container.register('HomeCall_Web_Ui_Screen_End$', endScreen);

  try {
    const app = await container.get('HomeCall_Web_Core_App$');
    await app.run();

    assert.equal(calls.loadAll, 1);
    assert.equal(calls.registerSW, 1);
    assert.equal(calls.startWatcher, 1);
    assert.equal(calls.mediaSetPeer, 1);
    assert.ok(configuredHandlers, 'peer handlers configured');
    assert.equal(typeof enterScreen.lastOnEnter, 'function');

    enterScreen.lastOnEnter({ user: 'alice', room: 'room1' });
    assert.equal(lobbyScreen.shows, 1);
    assert.equal(typeof lobbyScreen.lastParams.onCall, 'function');

    await lobbyScreen.lastParams.onCall('bob');
    assert.equal(callScreen.shows, 1);
    assert.equal(calls.peerStart, 1);

    callScreen.lastParams.onEnd();
    assert.equal(endScreen.shows, 1);
    assert.equal(calls.peerEnd, 1);
    assert.ok(endScreen.lastParams.message.includes('Call ended'));
  } finally {
    globalThis.MediaStream = OriginalMediaStream;
  }
});
