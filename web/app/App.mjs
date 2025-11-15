/**
 * @module HomeCall_Web_App
 * @description Boots the PWA environment and delegates the interaction flow to dedicated controllers.
 */
export default class HomeCall_Web_App {
  constructor({
    HomeCall_Web_Ui_Templates_Loader$: templates,
    HomeCall_Web_Pwa_ServiceWorker$: sw,
    HomeCall_Web_VersionWatcher$: version,
    HomeCall_Web_Media_Manager$: media,
    HomeCall_Web_Net_Signal_Client$: signal,
    HomeCall_Web_Rtc_Peer$: peer,
    HomeCall_Web_Logger$: logger,
    HomeCall_Web_Env_Provider$: env,
    HomeCall_Web_Ui_Toast$: toast,
    HomeCall_Web_Net_Signal_Orchestrator$: signalOrchestrator,
    HomeCall_Web_Ui_Flow$: callFlow
  } = {}) {
    if (!templates) {
      throw new Error('Template loader is required for HomeCall core.');
    }
    if (!sw) {
      throw new Error('Service worker module is required for HomeCall core.');
    }
    if (!version) {
      throw new Error('Version watcher is required for HomeCall core.');
    }
    if (!media) {
      throw new Error('Media manager is required for HomeCall core.');
    }
    if (!signal) {
      throw new Error('Signal client is required for HomeCall core.');
    }
    if (!peer) {
      throw new Error('RTC peer is required for HomeCall core.');
    }
    if (!env) {
      throw new Error('Environment provider is required for HomeCall core.');
    }
    if (!toast) {
      throw new Error('Toast module is required for HomeCall core.');
    }
    if (!signalOrchestrator) {
      throw new Error('Signal orchestrator is required for HomeCall core.');
    }
    if (!callFlow) {
      throw new Error('Call flow controller is required for HomeCall core.');
    }

    const documentRef = env.document ?? null;
    const log = logger ?? console;

    const run = async () => {
      if (!documentRef) {
        throw new Error('Document is not available for HomeCall application.');
      }
      const root = documentRef.getElementById('app');
      if (!root) {
        throw new Error('Element with id "app" was not found.');
      }
      toast.init();
      media.setPeer(peer);
      await sw.register();
      await templates.loadAll();
      await version.start();
      callFlow.initRoot(root);
      signalOrchestrator.bindHandlers({
        onOffer: callFlow.handleOffer,
        onAnswer: callFlow.handleAnswer,
        onCandidate: callFlow.handleCandidate,
        onError: callFlow.handleSignalError
      });
      try {
        await signal.connect();
      } catch (error) {
        log.error('[App] Failed to connect to signaling server', error);
        toast.error('Не удалось подключиться к серверу сигналинга.');
        callFlow.renderHome();
        return;
      }
      try {
        await callFlow.bootstrap();
      } catch (error) {
        log.error('[App] Call flow bootstrap failed', error);
        toast.error('Не удалось запустить сценарий звонка.');
        callFlow.renderHome();
      }
    };

    this.run = run;
  }
}
