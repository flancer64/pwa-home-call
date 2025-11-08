/**
 * @module HomeCall_Web_Env_Provider
 * @description Provides access to browser global objects.
 */
export default class HomeCall_Web_Env_Provider {
    get window() { return globalThis.window; }
    get document() { return globalThis.document; }
    get navigator() { return globalThis.navigator; }
    get fetch() { return globalThis.fetch; }
    get setInterval() { return globalThis.setInterval; }
    get clearInterval() { return globalThis.clearInterval; }
    get WebSocket() { return globalThis.WebSocket; }
}
