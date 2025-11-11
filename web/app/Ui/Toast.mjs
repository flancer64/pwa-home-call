/**
 * @module HomeCall_Web_Ui_Toast
 * @description Manages toast notification lifecycle and serial display.
 */

const DEFAULT_DURATION = 4000;

export default class HomeCall_Web_Ui_Toast {
  #env;
  #logger;
  #queue;
  #isActive;
  #timer;
  #current;
  #container;
  #currentElement;

  constructor({ HomeCall_Web_Env_Provider$: env, HomeCall_Web_Shared_Logger$: logger } = {}) {
    this.#env = env ?? {};
    this.#logger = logger ?? this.#env.console ?? globalThis.console ?? null;
    this.#queue = [];
    this.#isActive = false;
    this.#timer = null;
    this.#current = null;
    this.#container = null;
    this.#currentElement = null;
  }

  init() {
    this.#resolveContainer();
    return this;
  }

  /**
   * Exposes queue snapshot for diagnostics without leaking internal references.
   * @returns {Array}
   */
  get queue() {
    return [...this.#queue];
  }

  info(message, options) {
    this.#enqueue('info', message, options);
  }

  success(message, options) {
    this.#enqueue('success', message, options);
  }

  warn(message, options) {
    this.#enqueue('warn', message, options);
  }

  error(message, options) {
    this.#enqueue('error', message, options);
  }

  hide() {
    if (!this.#isActive) {
      return;
    }
    this.#completeCurrent();
  }

  #enqueue(type, message, options = {}) {
    const duration = Number.isFinite(options.duration) ? options.duration : DEFAULT_DURATION;
    const payload = {
      type,
      message,
      duration,
      icon: options?.icon ?? null
    };
    this.#queue.push(payload);
    if (!this.#isActive) {
      this.#showNext();
    }
  }

  #dequeue() {
    return this.#queue.shift() ?? null;
  }

  #showNext() {
    const next = this.#queue[0] ?? null;
    if (!next) {
      this.#isActive = false;
      return;
    }
    this.#isActive = true;
    this.#current = next;
    this.#logDisplay(next.type, next.message);
    this.#currentElement = this.#appendToastElement(next);
    this.#timer = this.#schedule(() => this.#completeCurrent(), next.duration);
  }

  #completeCurrent() {
    const active = this.#current;
    this.#clearTimer();
    this.#removeCurrentElement();
    if (active) {
      this.#logHide(active.type, active.message);
      this.#dequeue();
    }
    this.#current = null;
    this.#isActive = false;
    this.#showNext();
  }

  #appendToastElement(entry) {
    const container = this.#resolveContainer();
    if (!container) {
      return null;
    }
    const element = this.#createToastElement(entry);
    if (!element) {
      return null;
    }
    container.appendChild(element);
    return element;
  }

  #createToastElement({ message, type, icon }) {
    const documentRef = this.#getDocument();
    if (!documentRef) {
      return null;
    }
    const element = documentRef.createElement('div');
    const classes = ['toast', `toast-${type}`].filter(Boolean);
    element.className = classes.join(' ');
    element.dataset.toastType = type;
    if (icon) {
      element.dataset.toastIcon = icon;
    }
    element.setAttribute('role', 'status');
    element.setAttribute('aria-live', 'polite');
    const messageNode = documentRef.createElement('span');
    messageNode.textContent = message ?? '';
    element.appendChild(messageNode);
    return element;
  }

  #removeCurrentElement() {
    if (this.#currentElement && typeof this.#currentElement.remove === 'function') {
      this.#currentElement.remove();
    }
    this.#currentElement = null;
  }

  #resolveContainer() {
    if (this.#container) {
      return this.#container;
    }
    const documentRef = this.#getDocument();
    if (!documentRef) {
      return null;
    }
    const existing = documentRef.getElementById('toast-container');
    if (existing) {
      this.#container = existing;
      this.#container.setAttribute('aria-live', 'polite');
      return existing;
    }
    const host = documentRef.body ?? documentRef.documentElement;
    if (!host || typeof documentRef.createElement !== 'function') {
      return null;
    }
    const container = documentRef.createElement('div');
    container.id = 'toast-container';
    container.setAttribute('aria-live', 'polite');
    host.appendChild(container);
    this.#container = container;
    return container;
  }

  #getDocument() {
    if (this.#env?.document) {
      return this.#env.document;
    }
    if (typeof globalThis === 'undefined') {
      return null;
    }
    return globalThis.document ?? null;
  }

  #schedule(handler, duration) {
    const scheduler = typeof this.#env?.setTimeout === 'function'
      ? this.#env.setTimeout.bind(this.#env)
      : globalThis.setTimeout;
    return scheduler(handler, duration);
  }

  #clearTimer() {
    if (!this.#timer) {
      return;
    }
    const cancel = typeof this.#env?.clearTimeout === 'function'
      ? this.#env.clearTimeout.bind(this.#env)
      : globalThis.clearTimeout;
    cancel(this.#timer);
    this.#timer = null;
  }

  #logDisplay(type, message) {
    this.#writeLog(type, `show ${message}`);
  }

  #logHide(type, message) {
    const payload = `[Toast:${type}] hide ${message}`;
    if (this.#logger && typeof this.#logger.debug === 'function') {
      this.#logger.debug.call(this.#logger, payload);
      return;
    }
    this.#writeConsole(payload);
  }

  #writeLog(type, message) {
    const payload = `[Toast:${type}] ${message}`;
    if (!this.#logger) {
      this.#writeConsole(payload);
      return;
    }
    const level = typeof this.#logger[type] === 'function' ? type : 'info';
    const method = typeof this.#logger[level] === 'function' ? this.#logger[level] : null;
    if (method) {
      method.call(this.#logger, payload);
      return;
    }
    this.#writeConsole(payload);
  }

  #writeConsole(payload) {
    const consoleRef = this.#env?.console ?? globalThis.console ?? null;
    if (consoleRef && typeof consoleRef.log === 'function') {
      consoleRef.log(payload);
    }
  }
}
