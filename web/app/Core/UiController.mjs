/**
 * @module HomeCall_Web_Core_UiController
 * @description Coordinates the UI screens behind a single facade.
 */
export default class HomeCall_Web_Core_UiController {
  /**
   * @param {Object} deps
   * @param {HomeCall_Web_Ui_Screen_Interface} deps.HomeCall_Web_Ui_Screen_Enter$
   * @param {HomeCall_Web_Ui_Screen_Interface} deps.HomeCall_Web_Ui_Screen_Lobby$
   * @param {HomeCall_Web_Ui_Screen_Interface} deps.HomeCall_Web_Ui_Screen_Call$
   * @param {HomeCall_Web_Ui_Screen_Interface} deps.HomeCall_Web_Ui_Screen_End$
   * @param {HomeCall_Web_Ui_Screen_Interface} deps.HomeCall_Web_Ui_Screen_Invite$
   */
  constructor({
    HomeCall_Web_Ui_Screen_Enter$: screenEnter,
    HomeCall_Web_Ui_Screen_Lobby$: screenLobby,
    HomeCall_Web_Ui_Screen_Call$: screenCall,
    HomeCall_Web_Ui_Screen_End$: screenEnd,
    HomeCall_Web_Ui_Screen_Invite$: screenInvite
  } = {}) {
    const enter = screenEnter;
    const lobby = screenLobby;
    const call = screenCall;
    const end = screenEnd;
    const invite = screenInvite;

    if (!enter || !lobby || !call || !end) {
      throw new Error('All UI screen dependencies are required.');
    }
    if (!invite) {
      throw new Error('Invite screen dependency is required.');
    }

    this.showEnter = (params = {}) => enter.show(params);

    this.showLobby = (params = {}) => lobby.show(params);

    this.showCall = (params = {}) => call.show(params);

    this.showEnd = (params = {}) => end.show(params);

    this.showInvite = (params = {}) => invite.show(params);

    this.updateRemoteStream = (stream) => call.updateRemoteStream(stream);
    this.updateCallConnectionStatus = (params = {}) => call.updateConnectionStatus(params);
  }
}
