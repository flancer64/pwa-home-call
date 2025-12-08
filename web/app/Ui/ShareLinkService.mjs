/**
 * @module HomeCall_Web_Ui_ShareLinkService
 * @description Handles sharing and copying invite links with minimal UI feedback.
 */
export default function HomeCall_Web_Ui_ShareLinkService({
  HomeCall_Web_Env_Provider$: env,
  HomeCall_Web_Ui_Toast$: toast,
  HomeCall_Web_Net_Session_Manager$: sessionManager
} = {}) {
  const envRef = env;
  const linkBuilder = sessionManager;
  const toastNotifier = toast;
  const log = console;

  const notifyShareError = () => {
    const notifier = typeof toastNotifier?.error === 'function' ? toastNotifier.error.bind(toastNotifier) : null;
    notifier?.('Не удалось поделиться ссылкой.');
  };

  const canShare = () => typeof envRef?.navigator?.share === 'function';

  const shareSessionLink = async (sessionId) => {
    if (!sessionId) {
      notifyShareError();
      return;
    }
    const link = linkBuilder.buildInviteUrl(sessionId);
    const navigatorRef = envRef?.navigator;
    let handled = false;
    if (navigatorRef && typeof navigatorRef.share === 'function') {
      try {
        await navigatorRef.share({
          title: 'Связист',
          text: 'Присоединяйтесь к звонку.',
          url: link
        });
        toastNotifier.success('Ссылка отправлена.');
        handled = true;
      } catch (error) {
        log.error('[ShareLinkService] Sharing failed', error);
      }
    }
    if (!handled) {
      const clipboard = navigatorRef?.clipboard;
      if (clipboard && typeof clipboard.writeText === 'function') {
        try {
          await clipboard.writeText(link);
          toastNotifier.success('Ссылка скопирована в буфер обмена.');
          handled = true;
        } catch (error) {
          log.error('[ShareLinkService] Clipboard write failed', error);
        }
      }
    }
    if (!handled) {
      notifyShareError();
    }
  };

  const copySessionLink = async (sessionId) => {
    if (!sessionId) {
      toastNotifier.warn('Не удалось скопировать автоматически. Выделите ссылку вручную.');
      return;
    }
    const link = linkBuilder.buildInviteUrl(sessionId);
    const clipboard = envRef?.navigator?.clipboard;
    if (clipboard && typeof clipboard.writeText === 'function') {
      try {
        await clipboard.writeText(link);
        toastNotifier.success('Ссылка скопирована в буфер обмена.');
        return;
      } catch (error) {
        log.error('[ShareLinkService] Clipboard write failed', error);
      }
    }
    toastNotifier.warn('Не удалось скопировать автоматически. Выделите ссылку вручную.');
  };

  return {
    canShare,
    shareSessionLink,
    copySessionLink
  };
}
