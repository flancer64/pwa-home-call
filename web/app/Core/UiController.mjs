/**
 * @module HomeCall_Web_Core_UiController
 * @description Coordinates the UI screens behind a single facade.
 */
export default class HomeCall_Web_Core_UiController {
  /**
   * @param {Object} deps
   * @param {HomeCall_Web_Ui_Screen_Enter} deps.HomeCall_Web_Ui_Screen_Enter$
   * @param {HomeCall_Web_Ui_Screen_Lobby} deps.HomeCall_Web_Ui_Screen_Lobby$
   * @param {HomeCall_Web_Ui_Screen_Call} deps.HomeCall_Web_Ui_Screen_Call$
   * @param {HomeCall_Web_Ui_Screen_End} deps.HomeCall_Web_Ui_Screen_End$
   */
  constructor({
    HomeCall_Web_Ui_Screen_Enter$: screenEnter,
    HomeCall_Web_Ui_Screen_Lobby$: screenLobby,
    HomeCall_Web_Ui_Screen_Call$: screenCall,
    HomeCall_Web_Ui_Screen_End$: screenEnd
  } = {}) {
    const enter = screenEnter;
    const lobby = screenLobby;
    const call = screenCall;
    const end = screenEnd;

    if (!enter || !lobby || !call || !end) {
      throw new Error('All UI screen dependencies are required.');
    }

    this.showEnter = (container, message, onEnter) =>
      enter.show({ container, connectionMessage: message, onEnter });

    this.showLobby = (container, roomCode, users, onCall, onLeave) =>
      lobby.show({ container, roomCode, users, onCall, onLeave });

    this.showCall = (container, remoteStream, onEnd, onRetry) =>
      call.show({ container, remoteStream, onEnd, onRetry });

    this.showEnd = (container, message, onBack) =>
      end.show({ container, message, onBack });

    this.updateRemoteStream = (stream) => call.updateRemoteStream(stream);
  }
}
