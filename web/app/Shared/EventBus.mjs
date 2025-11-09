/**
 * @module HomeCall_Web_Shared_EventBus
 * @description Lightweight pub/sub bus for cross-contour coordination.
 */

export default class HomeCall_Web_Shared_EventBus {
  constructor() {
    this.handlers = new Map();
  }

  emit(event, payload) {
    if (!event) {
      return;
    }
    const list = this.handlers.get(event);
    if (!list) {
      return;
    }
    for (const handler of Array.from(list)) {
      try {
        handler(payload);
      } catch (error) {
        console.error(`[EventBus] Handler failed for ${event}`, error);
      }
    }
  }

  on(event, handler) {
    if (!event || typeof handler !== 'function') {
      return () => {};
    }
    if (!this.handlers.has(event)) {
      this.handlers.set(event, new Set());
    }
    this.handlers.get(event).add(handler);
    return () => this.off(event, handler);
  }

  once(event, handler) {
    const off = this.on(event, (payload) => {
      off();
      handler(payload);
    });
    return off;
  }

  off(event, handler) {
    if (!event || typeof handler !== 'function') {
      return;
    }
    this.handlers.get(event)?.delete(handler);
  }
}
