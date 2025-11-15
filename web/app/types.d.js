// web/app/types.d.js
/**
 * Global JSDoc type declarations for Kolobok web application.
 * These typedefs enable IDE navigation and autocompletion without direct imports.
 */

/* ---------- App ---------- */
/** @typedef {import('./App.mjs').default} HomeCall_Web_App */
/** @typedef {import('./VersionWatcher.mjs').default} HomeCall_Web_VersionWatcher */
/** @typedef {import('./Logger.mjs').default} HomeCall_Web_Logger */

/* ---------- Env ---------- */
/** @typedef {import('./Env/Provider.mjs').default} HomeCall_Web_Env_Provider */

/* ---------- Media ---------- */
/** @typedef {import('./Media/Monitor.mjs').default} HomeCall_Web_Media_Monitor */
/** @typedef {import('./Media/Manager.mjs').default} HomeCall_Web_Media_Manager */

/* ---------- Net ---------- */
/** @typedef {import('./Net/Signal/Client.mjs').default} HomeCall_Web_Net_Signal_Client */
/** @typedef {import('./Net/Signal/Orchestrator.mjs').default} HomeCall_Web_Net_Signal_Orchestrator */
/** @typedef {import('./Net/Session/Manager.mjs').default} HomeCall_Web_Net_Session_Manager */

/* ---------- RTC ---------- */
/** @typedef {import('./Rtc/Peer.mjs').default} HomeCall_Web_Rtc_Peer */

/* ---------- PWA ---------- */
/** @typedef {import('./Pwa/ServiceWorker.mjs').default} HomeCall_Web_Pwa_ServiceWorker */
/** @typedef {import('./Pwa/Cache.mjs').default} HomeCall_Web_Pwa_Cache */

/* ---------- State ---------- */
/** @typedef {import('./State/Machine.mjs').default} HomeCall_Web_State_Machine */
/** @typedef {import('./State/Media.mjs').default} HomeCall_Web_State_Media */

/* ---------- UI ---------- */
/** @typedef {import('./Ui/Controller.mjs').default} HomeCall_Web_Ui_Controller */
/** @typedef {import('./Ui/Templates/Loader.mjs').default} HomeCall_Web_Ui_Templates_Loader */
/** @typedef {import('./Ui/Flow.mjs').default} HomeCall_Web_Ui_Flow */
/** @typedef {import('./Ui/InviteService.mjs').default} HomeCall_Web_Ui_InviteService */
/** @typedef {import('./Ui/Toast.mjs').default} HomeCall_Web_Ui_Toast */
/** @typedef {import('./Ui/Router/Dev.mjs').default} HomeCall_Web_Ui_Router_Dev */
/** @typedef {import('./Ui/Screen/Home.mjs').default} HomeCall_Web_Ui_Screen_Home */
/** @typedef {import('./Ui/Screen/Settings.mjs').default} HomeCall_Web_Ui_Screen_Settings */
/** @typedef {import('./Ui/Screen/Invite.mjs').default} HomeCall_Web_Ui_Screen_Invite */
/** @typedef {import('./Ui/Screen/Call.mjs').default} HomeCall_Web_Ui_Screen_Call */
/** @typedef {import('./Ui/Screen/End.mjs').default} HomeCall_Web_Ui_Screen_End */

/**
 * @interface HomeCall_Web_Ui_Screen_Interface
 * @description Unified contract for all UI screens managed by the UI controller.
 * Each screen must implement the `show(params)` method.
 * @note Implementations must not mutate instance fields because the DI container returns frozen singletons.
 *
 * @function show
 * @param {Object} params
 * @param {HTMLElement} params.container - Root container for rendering the screen.
 * @description Renders the screen content inside the given container and binds events.
 */
