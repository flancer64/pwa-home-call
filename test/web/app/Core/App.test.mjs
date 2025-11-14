import test from 'node:test';
import assert from 'node:assert/strict';
import { createWebContainer } from '../../helper.mjs';

test('App orchestrates simplified home → invite → call flow', async () => {
  const container = await createWebContainer();
  let templateLoads = 0;
  const templateLoader = {
    async loadAll() { templateLoads += 1; },
    apply() {}
  };
  let swRegisters = 0;
  const swManager = { async register() { swRegisters += 1; } };
  let versionStarts = 0;
  const versionWatcher = { async start() { versionStarts += 1; } };
  let mediaPrepareCalls = 0;
  const mediaStream = { getTracks: () => [] };
  const media = {
    setPeer() {},
    async prepare() { mediaPrepareCalls += 1; },
    getLocalStream() { return mediaStream; },
    stopLocalStream() {}
  };
  let connectCalls = 0;
  let senderName = '';
  let sendOfferArgs = null;
  let joinRoomArgs = null;
  const signalHandlers = new Map();
  const signalClient = {
    on(type, handler) {
      signalHandlers.set(type, handler);
    },
    async connect() { connectCalls += 1; },
    sendOffer(payload) { sendOfferArgs = payload; },
    sendAnswer() {},
    sendCandidate() {},
    joinRoom(payload) { joinRoomArgs = payload; },
    leaveRoom() {},
    setSenderName(name) { senderName = name; }
  };
  let configuredHandlers = null;
  let peerStartCalls = 0;
  const peer = {
    configure(handlers) { configuredHandlers = handlers; },
    setLocalStream() {},
    async start() {
      peerStartCalls += 1;
      await configuredHandlers?.sendOffer?.('sdp-token');
      return { sdp: 'sdp-token' };
    },
    end() {},
    async handleOffer() {},
    async handleAnswer() {},
    async addCandidate() {}
  };
  const storage = {
    getMyData() { return { myName: 'Alice', myRoomId: 'stored-room' }; },
    setMyName() { return true; }
  };
  const logger = { info() {}, warn() {}, error() {} };
  const rootElement = { classList: { toggle() {} } };
  const location = new URL('https://domozvon.app/');
  const history = { replaceState() {}, state: null };
  const windowStub = { location, history };
  const navigatorStub = { clipboard: { async writeText() {} } };
  const documentStub = {
    getElementById(id) {
      if (id === 'app') {
        return rootElement;
      }
      return null;
    },
    body: { classList: { toggle() {} } }
  };
  const fetchStub = async () => ({ json: async () => ({}), text: async () => '' });
  const env = {
    window: windowStub,
    document: documentStub,
    navigator: navigatorStub,
    fetch: fetchStub,
    setInterval: () => {},
    clearInterval: () => {},
    WebSocket: class {}
  };
  const toast = {
    init() {},
    info() {},
    warn() {},
    success() {},
    error() {}
  };
  const uiCalls = {};
  const uiController = {
    showHome(params) { uiCalls.home = params; },
    showInvite(params) { uiCalls.invite = params; },
    showCall(params) { uiCalls.call = params; },
    showEnd(params) { uiCalls.end = params; },
    updateRemoteStream(stream) { uiCalls.remote = stream; }
  };

  container.register('HomeCall_Web_Core_TemplateLoader$', templateLoader);
  container.register('HomeCall_Web_Core_ServiceWorkerManager$', swManager);
  container.register('HomeCall_Web_Core_VersionWatcher$', versionWatcher);
  container.register('HomeCall_Web_Media_Manager$', media);
  container.register('HomeCall_Web_Net_SignalClient$', signalClient);
  container.register('HomeCall_Web_Rtc_Peer$', peer);
  container.register('HomeCall_Web_Core_UiController$', uiController);
  container.register('HomeCall_Web_Shared_Logger$', logger);
  container.register('HomeCall_Web_Infra_Storage$', storage);
  container.register('HomeCall_Web_Env_Provider$', env);
  container.register('HomeCall_Web_Ui_Toast$', toast);

  const app = await container.get('HomeCall_Web_Core_App$');
  await app.run();

  assert.equal(templateLoads, 1, 'templates should load once');
  assert.equal(swRegisters, 1, 'service worker should register');
  assert.equal(versionStarts, 1, 'version watcher should start');
  assert.equal(mediaPrepareCalls, 0, 'media should not prepare before call');
  assert.equal(connectCalls, 1, 'signal client connects once');
  assert.ok(uiCalls.home, 'home screen should render');
  assert.strictEqual(typeof uiCalls.home?.onStartCall, 'function', 'home should provide call handler');

  await uiCalls.home.onStartCall?.();

  assert.ok(uiCalls.invite, 'invite screen should render after home call');
  assert.equal(mediaPrepareCalls, 0, 'media should not prepare before the invite is confirmed');

  await uiCalls.invite?.onStartCall?.();

  assert.equal(mediaPrepareCalls, 1, 'media should prepare for outgoing call');
  assert.equal(peerStartCalls, 1, 'peer start should be invoked once');
  assert.ok(uiCalls.call, 'call screen should render when the call starts');
  assert.equal(senderName, 'Alice', 'signal should capture saved name');
  assert.ok(sendOfferArgs, 'signal should send offer payload');
  assert.ok(sendOfferArgs?.room?.length > 0, 'offer payload includes room id');
  assert.equal(sendOfferArgs?.from, 'Alice', 'offer payload includes sender name');
  assert.ok(joinRoomArgs, 'signal should join room before exchanging offers');
  assert.equal(joinRoomArgs?.user, 'Alice', 'join payload includes sender name');
  assert.equal(joinRoomArgs?.room, uiCalls.invite?.roomId, 'join payload uses invite room id');
  assert.equal(sendOfferArgs?.to, undefined, 'offer payload no longer specifies explicit target');
});
