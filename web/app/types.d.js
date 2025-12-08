// web/app/types.d.js
/**
 * Global JSDoc type declarations for Svyazist web application.
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
/** @typedef {import('./Ui/Router.mjs').default} HomeCall_Web_Ui_Router */
/** @typedef {import('./Ui/Flow.mjs').default} HomeCall_Web_Ui_Flow */
/** @typedef {import('./Ui/InviteService.mjs').default} HomeCall_Web_Ui_InviteService */
/** @typedef {import('./Ui/Screen/Call.mjs').default} HomeCall_Web_Ui_Screen_Call */
/** @typedef {import('./Ui/Screen/End.mjs').default} HomeCall_Web_Ui_Screen_End */
/** @typedef {import('./Ui/Screen/Home.mjs').default} HomeCall_Web_Ui_Screen_Home */
/** @typedef {import('./Ui/Screen/NotFound.mjs').default} HomeCall_Web_Ui_Screen_NotFound */
/** @typedef {import('./Ui/Screen/Settings.mjs').default} HomeCall_Web_Ui_Screen_Settings */
/** @typedef {import('./Ui/Templates/Loader.mjs').default} HomeCall_Web_Ui_Templates_Loader */
/** @typedef {import('./Ui/Toast.mjs').default} HomeCall_Web_Ui_Toast */

/**
 * @interface HomeCall_Web_Ui_Screen_Interface
 * @description Unified contract for all UI screens managed by the Router.
 * Implementations expose lifecycle hooks that bind template fragments to the DOM.
 *
 * @function mount
 * @param {Object} options
 * @param {HTMLElement} options.container - Root container for rendering the screen.
 * @param {Object} options.params - Data payload provided by the Router (handlers, metadata).
 * @description Renders the screen content inside the given container and wires events.
 *
 * @function unmount
 * @description Optional cleanup hook that removes listeners and clears state.
 *
 * @function updateRemoteStream
 * @param {MediaStream} stream
 * @description Optional helper used by the call screen to refresh the remote video element.
 *
 * @note Implementations must not mutate instance fields because the DI container returns frozen singletons.
 */
