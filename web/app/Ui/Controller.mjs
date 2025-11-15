/**
 * @module HomeCall_Web_Ui_Controller
 * @description Coordinates the minimal home → invite → call → end screens.
 */
export default class HomeCall_Web_Ui_Controller {
  /**
   * @param {Object} deps
   * @param {HomeCall_Web_Ui_Screen_Home$} deps.HomeCall_Web_Ui_Screen_Home$
   * @param {HomeCall_Web_Ui_Screen_Invite$} deps.HomeCall_Web_Ui_Screen_Invite$
   * @param {HomeCall_Web_Ui_Screen_Call$} deps.HomeCall_Web_Ui_Screen_Call$
   * @param {HomeCall_Web_Ui_Screen_Settings$} deps.HomeCall_Web_Ui_Screen_Settings$
   * @param {HomeCall_Web_Ui_Screen_End$} deps.HomeCall_Web_Ui_Screen_End$
   */
  constructor({
    HomeCall_Web_Ui_Screen_Home$: screenHome,
    HomeCall_Web_Ui_Screen_Invite$: screenInvite,
    HomeCall_Web_Ui_Screen_Call$: screenCall,
    HomeCall_Web_Ui_Screen_Settings$: screenSettings,
    HomeCall_Web_Ui_Screen_End$: screenEnd
  } = {}) {
    if (!screenHome || !screenCall || !screenSettings || !screenEnd) {
      throw new Error('Home, call, settings, and end screens must be provided.');
    }
    if (!screenInvite) {
      throw new Error('Invite screen must be provided.');
    }

    this.showHome = (params = {}) => screenHome.show(params);
    this.showInvite = (params = {}) => screenInvite.show(params);
    this.showCall = (params = {}) => screenCall.show(params);
    this.showSettings = (params = {}) => screenSettings.show(params);
    this.showEnd = (params = {}) => screenEnd.show(params);
    this.updateRemoteStream = (stream) => screenCall.updateRemoteStream?.(stream);
  }
}
