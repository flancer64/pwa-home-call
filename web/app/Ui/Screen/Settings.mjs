/**
 * @module HomeCall_Web_Ui_Screen_Settings
 * @description Renders the service settings card with a reset action.
 */
export default class HomeCall_Web_Ui_Screen_Settings {
  constructor({
    HomeCall_Web_Ui_Templates_Loader$: templates,
    HomeCall_Web_Pwa_Cache$: cache,
    HomeCall_Web_Config_RemoteLogging$: remoteLoggingConfig
  } = {}) {
    if (!templates) {
      throw new Error('Template loader is required for the settings screen.');
    }
    if (!cache) {
      throw new Error('Cache helper is required for the settings screen.');
    }
    this.templates = templates;
    this.cache = cache;
    this.remoteLoggingConfig = remoteLoggingConfig ?? {
      isRemoteLoggingEnabled: () => false,
      setRemoteLoggingEnabled: () => {}
    };
  }

  show({ container, onClose } = {}) {
    if (!container) {
      return;
    }
    this.templates.apply('settings', container);
    const closeButton = container.querySelector('.settings-close');
    const reinstallButton = container.querySelector('#settings-reinstall');
    const remoteLoggingToggle = container.querySelector('#settings-remote-logging');

    const updateRemoteState = () => {
      if (!remoteLoggingToggle) {
        return;
      }
      const enabled = Boolean(this.remoteLoggingConfig.isRemoteLoggingEnabled());
      remoteLoggingToggle.setAttribute('aria-pressed', enabled ? 'true' : 'false');
    };

    closeButton?.addEventListener('click', (event) => {
      event.preventDefault();
      onClose?.();
    });

    reinstallButton?.addEventListener('click', async (event) => {
      event.preventDefault();
      reinstallButton?.setAttribute('disabled', '');
      try {
        await this.cache.clear();
      } catch {
        // swallow errors; double-clicks are harmless if reload fails
      } finally {
        reinstallButton?.removeAttribute('disabled');
      }
    });

    remoteLoggingToggle?.addEventListener('click', (event) => {
      event.preventDefault();
      const next = !this.remoteLoggingConfig.isRemoteLoggingEnabled();
      this.remoteLoggingConfig.setRemoteLoggingEnabled(next);
      updateRemoteState();
    });
    updateRemoteState();
  }
}
