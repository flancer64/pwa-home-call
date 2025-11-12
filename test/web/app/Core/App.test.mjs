import test from 'node:test';
import assert from 'node:assert/strict';
import { createWebContainer } from '../../helper.mjs';

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
    disconnect: 0,
    toolbarInit: 0,
    mediaToggle: 0,
    cacheCleared: 0
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
    },
    async toggleMedia() {
      calls.mediaToggle += 1;
      return { state: 'ready' };
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
    updateConnectionStatus() {},
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
  const ctaButton = {
    textContent: '',
    type: 'button',
    disabled: false,
    dataset: {},
    onclick: null,
    setAttribute() {},
    removeAttribute() {}
  };
  const ctaPanel = {
    classList: {
      toggle(_, __) {}
    },
    setAttribute() {}
  };
  const cacheStatus = {
    hidden: true,
    textContent: '',
    className: '',
    classList: {
      add() {}
    }
  };
  const toolbarHandlers = [];
  const toolbarContextUpdates = [];
  const toolbarMediaStates = [];
  const toolbar = {
    init() {
      calls.toolbarInit += 1;
    },
    onAction(handler) {
      toolbarHandlers.push(handler);
    },
    setContext(context) {
      toolbarContextUpdates.push(context);
    },
    setMediaButtonState(state) {
      toolbarMediaStates.push(state);
    }
  };
  const cacheCleaner = {
    async clear() {
      calls.cacheCleared += 1;
    }
  };
  const toastCalls = [];
  const toast = {
    init() {
      toastCalls.push('init');
    },
    info(message) {
      toastCalls.push({ type: 'info', message });
    },
    warn(message) {
      toastCalls.push({ type: 'warn', message });
    },
    success(message) {
      toastCalls.push({ type: 'success', message });
    },
    error(message) {
      toastCalls.push({ type: 'error', message });
    }
  };
  const documentStub = {
    getElementById(id) {
      if (id === 'app') return rootElement;
      if (id === 'cta-action') return ctaButton;
      return null;
    },
    querySelector(selector) {
      if (selector === '.cta-panel') {
        return ctaPanel;
      }
      if (selector === '#cache-status') {
        return cacheStatus;
      }
      return null;
    },
    body: {
      classList: {
        toggle(name, state) {
          toggles.push({ name, state });
        }
      }
    }
  };
  const windowStub = {};
  const navigatorStub = {};
  const fetchStub = async () => ({ json: async () => ({ version: '1.0.0' }), text: async () => '' });
  const setIntervalStub = () => {};
  const clearIntervalStub = () => {};
  const WebSocketStub = class {};
  container.register('HomeCall_Web_Env_Provider$', {
    get window() {
      return windowStub;
    },
    get document() {
      return documentStub;
    },
    get navigator() {
      return navigatorStub;
    },
    get fetch() {
      return fetchStub;
    },
    get setInterval() {
      return setIntervalStub;
    },
    get clearInterval() {
      return clearIntervalStub;
    },
    get WebSocket() {
      return WebSocketStub;
    }
  });
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
  container.register('HomeCall_Web_Ui_Toolbar$', toolbar);
  container.register('HomeCall_Web_Ui_Toast$', toast);
  const storageEvents = [];
  const storage = {
    getUserData() {
      return null;
    },
    setUserData() {
      return true;
    },
    clearUserData() {
      storageEvents.push('clear');
      return true;
    }
  };
  container.register('HomeCall_Web_Infra_Storage$', storage);
  container.register('HomeCall_Web_Pwa_CacheCleaner$', cacheCleaner);

  try {
    const app = await container.get('HomeCall_Web_Core_App$');
    await app.run();

    assert.equal(calls.loadAll, 1);
    assert.equal(calls.registerSW, 1);
    assert.equal(calls.startWatcher, 1);
    assert.equal(calls.mediaSetPeer, 1);
    assert.ok(configuredHandlers, 'peer handlers configured');
    assert.equal(typeof enterScreen.lastOnEnter, 'function');
    assert.equal(calls.toolbarInit, 1);
    assert.ok(toastCalls.includes('init'));
    assert.equal(toolbarHandlers.length, 1);
    assert.ok(toolbarContextUpdates.length > 0);
    assert.ok(toolbarMediaStates.includes('off'));
    await toolbarHandlers[0]('clear-cache');
    assert.equal(calls.cacheCleared, 1);
    assert.equal(storageEvents.length, 1);
    assert.ok(toastCalls.some((call) => call.type === 'warn' && call.message === 'Saved data cleared'));
    await toolbarHandlers[0]('toggle-media');
    assert.equal(calls.mediaToggle, 1);
    assert.ok(toolbarMediaStates.includes('ready'));

    enterScreen.lastOnEnter({ user: 'alice', room: 'room1' });
    assert.equal(lobbyScreen.shows, 1);
    assert.equal(typeof lobbyScreen.lastParams.onCall, 'function');

    await lobbyScreen.lastParams.onCall('bob');
    assert.equal(callScreen.shows, 1);
    assert.equal(calls.peerStart, 1);

    callScreen.lastParams.onEnd();
    assert.equal(endScreen.shows, 1);
    assert.equal(calls.peerEnd, 1);
    assert.ok(endScreen.lastParams.message.includes('Звонок'));
  } finally {
    globalThis.MediaStream = OriginalMediaStream;
  }
});
