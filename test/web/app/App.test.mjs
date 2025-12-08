import test from 'node:test';
import assert from 'node:assert/strict';
import { createWebContainer } from '../helper.mjs';

const createEnv = () => {
  const location = new URL('https://svyazist.app/');
  const history = { replaceState() {}, state: null };
  const windowStub = { location, history };
  return {
    window: windowStub,
    document: {
      getElementById(id) {
        if (id === 'app') {
          return { classList: { toggle() {} } };
        }
        return null;
      },
      body: { classList: { toggle() {} } }
    },
    navigator: { clipboard: { async writeText() {} } },
    fetch: async () => ({ json: async () => ({}), text: async () => '' }),
    setInterval: () => {},
    clearInterval: () => {},
    WebSocket: class {}
  };
};

test('App runs the flow on startup', async () => {
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

  const signalClient = {
    on() {},
    off() {},
    async connect(sessionId) {},
    disconnect() {},
    sendOffer() {},
    sendAnswer() {},
    sendCandidate() {},
    sendHangup() {}
  };
  const boundHandlers = {};
  const signalOrchestrator = {
    bindHandlers(handlers) {
      Object.assign(boundHandlers, handlers);
    }
  };
  let flowBootstrapCalls = 0;
  const flow = {
    initRoot() {},
    async bootstrap() { flowBootstrapCalls += 1; },
    renderReady() {},
    handleStartCall() {},
    handleReturnHome() {},
    handleOffer() {},
    handleAnswer() {},
    handleCandidate() {},
    handleHangup() {},
    handleSignalStatus() {},
    handleSignalError() {},
    renderActive() {},
    renderEnded() {},
    openSettings() {}
  };
  const router = {
    init() {},
    navigate() {},
    updateRemoteStream() {},
    showSettings() {}
  };
  const logger = { info() {}, warn() {}, error() {}, setRemoteLoggingEnabled() {} };
  const toast = {
    init() {},
    info() {},
    warn() {},
    success() {},
    error() {}
  };
  const env = createEnv();
  const remoteLoggingConfig = { isRemoteLoggingEnabled: () => false };

  container.register('HomeCall_Web_Ui_Templates_Loader$', templateLoader);
  container.register('HomeCall_Web_Pwa_ServiceWorker$', swManager);
  container.register('HomeCall_Web_VersionWatcher$', versionWatcher);
  container.register('HomeCall_Web_Media_Manager$', media);
  container.register('HomeCall_Web_Net_Signal_Client$', signalClient);
  container.register('HomeCall_Web_Rtc_Peer$', { configure() {}, setLocalStream() {} });
  container.register('HomeCall_Web_Ui_Router$', router);
  container.register('HomeCall_Web_Logger$', logger);
  container.register('HomeCall_Web_Env_Provider$', env);
  container.register('HomeCall_Web_Ui_Toast$', toast);
  container.register('HomeCall_Web_Config_RemoteLogging$', remoteLoggingConfig);
  container.register('HomeCall_Web_Net_Signal_Orchestrator$', signalOrchestrator);
  const app = await container.get('HomeCall_Web_App$');
  await app.run();

  assert.equal(templateLoads, 1);
  assert.equal(swRegisters, 1);
  assert.equal(versionStarts, 1);
  assert.equal(mediaPrepareCalls, 0);
  assert.equal(flowBootstrapCalls, 1);
  assert.equal(typeof boundHandlers.onOffer, 'function');
});

test('App falls back to ready state when bootstrap fails', async () => {
  const container = await createWebContainer();
  const templateLoader = { async loadAll() {}, apply() {} };
  const swManager = { async register() {} };
  const versionWatcher = { async start() {} };
  const media = { setPeer() {}, async prepare() {}, getLocalStream() {}, stopLocalStream() {} };
  const signalClient = {
    on() {},
    off() {},
    async connect() {},
    disconnect() {},
    sendOffer() {},
    sendAnswer() {},
    sendCandidate() {},
    sendHangup() {}
  };
  const signalOrchestrator = { bindHandlers() {} };
  let renderReadyCalls = 0;
  const flow = {
    initRoot() {},
    async bootstrap() { throw new Error('boom'); },
    renderReady() { renderReadyCalls += 1; },
    handleStartCall() {},
    handleReturnHome() {},
    handleOffer() {},
    handleAnswer() {},
    handleCandidate() {},
    handleHangup() {},
    handleSignalStatus() {},
    handleSignalError() {},
    renderActive() {},
    renderEnded() {},
    openSettings() {}
  };
  const router = {
    init() {},
    navigate() {},
    updateRemoteStream() {},
    showSettings() {}
  };
  const logger = { info() {}, warn() {}, error() {}, setRemoteLoggingEnabled() {} };
  let errorCalls = 0;
  const toast = {
    init() {},
    info() {},
    warn() {},
    success() {},
    error() { errorCalls += 1; }
  };
  const env = createEnv();
  const remoteLoggingConfig = { isRemoteLoggingEnabled: () => false };

  container.register('HomeCall_Web_Ui_Templates_Loader$', templateLoader);
  container.register('HomeCall_Web_Pwa_ServiceWorker$', swManager);
  container.register('HomeCall_Web_VersionWatcher$', versionWatcher);
  container.register('HomeCall_Web_Media_Manager$', media);
  container.register('HomeCall_Web_Net_Signal_Client$', signalClient);
  container.register('HomeCall_Web_Rtc_Peer$', { configure() {}, setLocalStream() {} });
  container.register('HomeCall_Web_Ui_Router$', router);
  container.register('HomeCall_Web_Logger$', logger);
  container.register('HomeCall_Web_Env_Provider$', env);
  container.register('HomeCall_Web_Ui_Toast$', toast);
  container.register('HomeCall_Web_Config_RemoteLogging$', remoteLoggingConfig);
  container.register('HomeCall_Web_Net_Signal_Orchestrator$', signalOrchestrator);
  const app = await container.get('HomeCall_Web_App$');
  await app.run();

  assert.equal(renderReadyCalls, 1);
  assert.equal(errorCalls, 1);
});
