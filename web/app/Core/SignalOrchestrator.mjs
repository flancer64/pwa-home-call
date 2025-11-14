const priv = new WeakMap();

/**
 * @module HomeCall_Web_Core_SignalOrchestrator
 * @description Registers signaling callbacks so the core application stays decoupled from event wiring.
 */
export default class HomeCall_Web_Core_SignalOrchestrator {
  constructor({ HomeCall_Web_Net_SignalClient$: signal, HomeCall_Web_Shared_Logger$: logger } = {}) {
    if (!signal) {
      throw new Error('Signal client is required for the orchestrator.');
    }
    priv.set(this, {
      signal,
      logger: logger ?? console,
      cleanup: []
    });
  }

  bindHandlers(handlers = {}) {
    const context = priv.get(this);
    if (!context) {
      throw new Error('Signal orchestrator is not initialized.');
    }
    const { signal, cleanup } = context;
    cleanup.forEach((fn) => fn());
    cleanup.length = 0;
    const bind = (type, handler) => {
      if (typeof handler !== 'function') {
        return;
      }
      signal.on(type, handler);
      cleanup.push(() => signal.off?.(type, handler));
    };
    bind('offer', handlers.onOffer);
    bind('answer', handlers.onAnswer);
    bind('candidate', handlers.onCandidate);
    bind('error', handlers.onError);
  }
}
