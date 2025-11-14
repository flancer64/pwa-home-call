/**
 * @module HomeCall_Web_Core_InviteService
 * @description Handles sharing and copying invite links with user feedback.
 */
export default class HomeCall_Web_Core_InviteService {
  constructor({
    HomeCall_Web_Env_Provider$: env,
    HomeCall_Web_Ui_Toast$: toast,
    HomeCall_Web_Core_RoomManager$: roomManager
  } = {}) {
    if (!env) {
      throw new Error('Environment provider is required for the invite service.');
    }
    if (!toast) {
      throw new Error('Toast module is required for the invite service.');
    }
    if (!roomManager) {
      throw new Error('Room manager is required for the invite service.');
    }
    const envRef = env;
    const linkBuilder = roomManager;
    const toastNotifier = toast;
    const log = console;

    const notifyShareError = () => {
      const notifier = typeof toastNotifier.error === 'function' ? toastNotifier.error.bind(toastNotifier) : null;
      notifier?.('Не удалось поделиться ссылкой.');
    };

    this.canShare = () => typeof envRef.navigator?.share === 'function';

    this.shareRoomLink = async (roomId) => {
      if (!roomId) {
        notifyShareError();
        return;
      }
      const link = linkBuilder.buildInviteUrl(roomId);
      const navigatorRef = envRef.navigator;
      let handled = false;
      if (navigatorRef && typeof navigatorRef.share === 'function') {
        try {
          await navigatorRef.share({
            title: 'ДомоЗвон',
            text: 'Присоединяйтесь к звонку.',
            url: link
          });
          toastNotifier.success('Ссылка отправлена.');
          handled = true;
        } catch (error) {
          log.error('[InviteService] Sharing failed', error);
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
            log.error('[InviteService] Clipboard write failed', error);
          }
        }
      }
      if (!handled) {
        notifyShareError();
      }
    };

    this.copyRoomLink = async (roomId) => {
      if (!roomId) {
        toastNotifier.warn('Не удалось скопировать автоматически. Выделите ссылку вручную.');
        return;
      }
      const link = linkBuilder.buildInviteUrl(roomId);
      const clipboard = envRef.navigator?.clipboard;
      if (clipboard && typeof clipboard.writeText === 'function') {
        try {
          await clipboard.writeText(link);
          toastNotifier.success('Ссылка скопирована в буфер обмена.');
          return;
        } catch (error) {
          log.error('[InviteService] Clipboard write failed', error);
        }
      }
      toastNotifier.warn('Не удалось скопировать автоматически. Выделите ссылку вручную.');
    };
  }
}
