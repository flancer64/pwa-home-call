// web/app/types.d.js
/**
 * Global JSDoc type declarations for HomeCall web application.
 * These typedefs enable IDE navigation and autocompletion without direct imports.
 */

/* ---------- Core ---------- */
/** @typedef {import('./Core/App.mjs').default} HomeCall_Web_Core_App */
/** @typedef {import('./Core/TemplateLoader.mjs').default} HomeCall_Web_Core_TemplateLoader */
/** @typedef {import('./Core/UiController.mjs').default} HomeCall_Web_Core_UiController */
/** @typedef {import('./Core/ServiceWorkerManager.mjs').default} HomeCall_Web_Core_ServiceWorkerManager */
/** @typedef {import('./Core/VersionWatcher.mjs').default} HomeCall_Web_Core_VersionWatcher */

/* ---------- Env ---------- */
/** @typedef {import('./Env/Provider.mjs').default} HomeCall_Web_Env_Provider */

/* ---------- Media ---------- */
/** @typedef {import('./Media/DeviceMonitor.mjs').default} HomeCall_Web_Media_DeviceMonitor */
/** @typedef {import('./Media/Manager.mjs').default} HomeCall_Web_Media_Manager */

/* ---------- Net ---------- */
/** @typedef {import('./Net/SignalClient.mjs').default} HomeCall_Web_Net_SignalClient */

/* ---------- Infra ---------- */
/** @typedef {import('./Infra/Storage.mjs').default} HomeCall_Web_Infra_Storage */

/* ---------- RTC ---------- */
/** @typedef {import('./Rtc/Peer.mjs').default} HomeCall_Web_Rtc_Peer */

/* ---------- Shared ---------- */
/** @typedef {import('./Shared/EventBus.mjs').default} HomeCall_Web_Shared_EventBus */
/** @typedef {import('./Shared/Logger.mjs').default} HomeCall_Web_Shared_Logger */
/** @typedef {import('./Shared/Util.mjs').default} HomeCall_Web_Shared_Util */

/* ---------- UI ---------- */
/** @typedef {import('./Ui/Screen/Enter.mjs').default} HomeCall_Web_Ui_Screen_Enter */
/** @typedef {import('./Ui/Screen/Lobby.mjs').default} HomeCall_Web_Ui_Screen_Lobby */
/** @typedef {import('./Ui/Screen/Call.mjs').default} HomeCall_Web_Ui_Screen_Call */
/** @typedef {import('./Ui/Screen/End.mjs').default} HomeCall_Web_Ui_Screen_End */
/** @typedef {import('./Ui/Toast.mjs').default} HomeCall_Web_Ui_Toast */

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
