/**
 * @module HomeCall_Web_Net_Signal_Orchestrator
 * @description Registers signaling callbacks so the core application stays decoupled from event wiring.
 */
export default class HomeCall_Web_Net_Signal_Orchestrator {
  constructor({ HomeCall_Web_Net_Signal_Client$: signal, HomeCall_Web_Logger$: logger } = {}) {
    if (!signal) {
      throw new Error('Signal client is required for the orchestrator.');
    }
    const context = {
      signal,
      logger: logger ?? console,
      cleanup: []
    };

    this.bindHandlers = (handlers = {}) => {
      const { signal: client, cleanup } = context;
      cleanup.forEach((fn) => fn());
      cleanup.length = 0;
      const bind = (type, handler) => {
        if (typeof handler !== 'function') {
          return;
        }
        client.on(type, handler);
        cleanup.push(() => client.off?.(type, handler));
      };
      bind('offer', handlers.onOffer);
      bind('answer', handlers.onAnswer);
      bind('candidate', handlers.onCandidate);
      bind('hangup', handlers.onHangup);
      bind('error', handlers.onError);
      bind('status', handlers.onStatus);
    };
  }
}
