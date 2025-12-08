/**
 * @module HomeCall_Web_App
 * @description Boots the PWA environment and delegates the interaction flow to dedicated controllers.
 */
export default function HomeCall_Web_App({
  HomeCall_Web_Ui_Templates_Loader$: templates,
  HomeCall_Web_Pwa_ServiceWorker$: sw,
  HomeCall_Web_VersionWatcher$: version,
  HomeCall_Web_Media_Manager$: media,
  HomeCall_Web_Net_Signal_Client$: signal,
  HomeCall_Web_Rtc_Peer$: peer,
  HomeCall_Web_Logger$: logger,
  HomeCall_Web_Config_RemoteLogging$: remoteLoggingConfig,
  HomeCall_Web_Env_Provider$: env,
  HomeCall_Web_Ui_Toast$: toast,
  HomeCall_Web_Ui_Router$: router,
  HomeCall_Web_Net_Signal_Orchestrator$: signalOrchestrator,
  HomeCall_Web_Ui_Flow$: callFlow
} = {}) {
  const documentRef = env?.document ?? null;
  const log = logger ?? console;
  const configureRemoteLogging = () => {
    if (
      typeof logger?.setRemoteLoggingEnabled === 'function' &&
      typeof remoteLoggingConfig?.isRemoteLoggingEnabled === 'function'
    ) {
      logger.setRemoteLoggingEnabled(Boolean(remoteLoggingConfig.isRemoteLoggingEnabled()));
    }
  };
  const run = async () => {
    if (!documentRef) {
      throw new Error('Document is not available for Svyazist application.');
    }
    const root = documentRef.getElementById('app');
    if (!root) {
      throw new Error('Element with id "app" was not found.');
    }
    configureRemoteLogging();
    toast.init();
    media.setPeer(peer);
    await sw.register();
    await templates.loadAll();
    await version.start();
    await router.init(root);
    signalOrchestrator.bindHandlers({
      onOffer: callFlow.handleOffer,
      onAnswer: callFlow.handleAnswer,
      onCandidate: callFlow.handleCandidate,
      onHangup: callFlow.handleHangup,
      onStatus: callFlow.handleSignalStatus,
      onError: callFlow.handleSignalError
    });
    try {
      await callFlow.bootstrap();
    } catch (error) {
      log.error('[App] Call flow bootstrap failed', error);
      toast.error('Не удалось запустить сценарий звонка.');
      callFlow.renderReady();
      return;
    }
  };

  return {
    run
  };
}
