/**
 * @module HomeCall_Web_Ui_Screen_Settings
 * @description Renders the service settings card with a reset action.
 */
export default function HomeCall_Web_Ui_Screen_Settings({
  HomeCall_Web_Ui_Templates_Loader$: templates,
  HomeCall_Web_Pwa_Cache$: cache,
  HomeCall_Web_Logger$: logger,
  HomeCall_Web_Config_RemoteLogging$: remoteLoggingConfig
} = {}) {
  const templateLoader = templates;
  const cacheHelper = cache;
  const log = logger ?? null;
  const remoteConfig = remoteLoggingConfig ?? {
    isRemoteLoggingEnabled: () => false,
    setRemoteLoggingEnabled: () => {}
  };

  const show = ({ container, onClose } = {}) => {
    if (!container) {
      return;
    }
    templateLoader.apply('settings', container);
    const closeButton = container.querySelector('#settings-close');
    const reinstallButton = container.querySelector('#settings-reinstall');
    const remoteLoggingToggle = container.querySelector('#settings-remote-logging');
    const remoteLoggingState = container.querySelector('.settings-remote-logging-state');

    const updateRemoteState = () => {
      if (!remoteLoggingToggle) {
        return;
      }
      const enabled = Boolean(remoteConfig.isRemoteLoggingEnabled());
      remoteLoggingToggle.setAttribute('aria-pressed', enabled ? 'true' : 'false');
      remoteLoggingToggle.setAttribute('data-state', enabled ? 'enabled' : 'disabled');
      if (remoteLoggingState) {
        remoteLoggingState.textContent = enabled ? 'Вкл' : 'Выкл';
        remoteLoggingState.setAttribute('data-state', enabled ? 'enabled' : 'disabled');
      }
    };

    closeButton?.addEventListener('click', (event) => {
      event.preventDefault();
      onClose?.();
    });

    reinstallButton?.addEventListener('click', async (event) => {
      event.preventDefault();
      reinstallButton?.setAttribute('disabled', '');
      try {
        await cacheHelper.clear();
      } catch {
        // swallow errors; double-clicks are harmless if reload fails
      } finally {
        reinstallButton?.removeAttribute('disabled');
      }
    });

    remoteLoggingToggle?.addEventListener('click', (event) => {
      event.preventDefault();
      const next = !remoteConfig.isRemoteLoggingEnabled();
      if (typeof log?.setRemoteLoggingEnabled === 'function') {
        log.setRemoteLoggingEnabled(next);
      } else if (typeof remoteConfig.setRemoteLoggingEnabled === 'function') {
        remoteConfig.setRemoteLoggingEnabled(next);
      }
      updateRemoteState();
    });
    updateRemoteState();
  };

  return {
    show
  };
}
