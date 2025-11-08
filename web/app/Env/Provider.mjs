/**
 * @module HomeCall_Web_Env_Provider
 * @description Provides access to browser global objects.
 */
export default class HomeCall_Web_Env_Provider {
    constructor() {
        const g = globalThis;
        this.window = g.window;
        this.document = g.document;
        this.navigator = g.navigator;
        this.fetch = g.fetch.bind(g);
        this.setInterval = g.setInterval.bind(g);
        this.clearInterval = g.clearInterval.bind(g);
        this.WebSocket = g.WebSocket;
    }
}
