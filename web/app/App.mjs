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
    HomeCall_Web_Ui_Router_Dev$: devRouter,
    HomeCall_Web_Net_Signal_Orchestrator$: signalOrchestrator,
    HomeCall_Web_Ui_Flow$: callFlow
  } = {}) {
    if (!templates) {
      throw new Error('Template loader is required for Kolobok core.');
    }
    if (!sw) {
      throw new Error('Service worker module is required for Kolobok core.');
    }
    if (!version) {
      throw new Error('Version watcher is required for Kolobok core.');
    }
    if (!media) {
      throw new Error('Media manager is required for Kolobok core.');
    }
    if (!signal) {
      throw new Error('Signal client is required for Kolobok core.');
    }
    if (!peer) {
      throw new Error('RTC peer is required for Kolobok core.');
    }
    if (!env) {
      throw new Error('Environment provider is required for Kolobok core.');
    }
    if (!toast) {
      throw new Error('Toast module is required for Kolobok core.');
    }
    if (!signalOrchestrator) {
      throw new Error('Signal orchestrator is required for Kolobok core.');
    }
    if (!callFlow) {
      throw new Error('Call flow controller is required for Kolobok core.');
    }

    const documentRef = env.document ?? null;
    const log = logger ?? console;
    let devRouterStarted = false;
    const startDevRouter = () => {
      if (devRouterStarted || !env?.isDevelopment || typeof devRouter?.init !== 'function') {
        return;
      }
      devRouterStarted = true;
      try {
        devRouter.init();
      } catch (error) {
        if (typeof log.warn === 'function') {
          log.warn('[App] DevRouter failed to initialize', error);
        } else if (typeof log.info === 'function') {
          log.info('[App] DevRouter failed to initialize', error);
        }
      }
    };

    const run = async () => {
      if (!documentRef) {
        throw new Error('Document is not available for Kolobok application.');
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
        startDevRouter();
        return;
      }
      try {
        await callFlow.bootstrap();
      } catch (error) {
        log.error('[App] Call flow bootstrap failed', error);
        toast.error('Не удалось запустить сценарий звонка.');
        callFlow.renderHome();
        return;
      } finally {
        startDevRouter();
      }
    };

    this.run = run;
  }
}
