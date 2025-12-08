/**
 * @module HomeCall_Web_Ui_Toast
 * @description Manages toast notification lifecycle and serial display.
 */

const DEFAULT_DURATION = 4000;

export default function HomeCall_Web_Ui_Toast({ HomeCall_Web_Env_Provider$: env, HomeCall_Web_Logger$: logger } = {}) {
  const environment = env ?? {};
  const loggerRef = logger ?? environment.console ?? globalThis.console ?? null;
  const queue = [];
  let isActive = false;
  let timer = null;
  let current = null;
  let container = null;
  let currentElement = null;

  const getDocument = () => {
    if (environment.document) {
      return environment.document;
    }
    if (typeof globalThis === 'undefined') {
      return null;
    }
    return globalThis.document ?? null;
  };

  const resolveContainer = () => {
    if (container) {
      return container;
    }
    const documentRef = getDocument();
    if (!documentRef) {
      return null;
    }
    const existing = documentRef.getElementById('toast-container');
    if (existing) {
      container = existing;
      container.setAttribute('aria-live', 'polite');
      return existing;
    }
    const host = documentRef.body ?? documentRef.documentElement;
    if (!host || typeof documentRef.createElement !== 'function') {
      return null;
    }
    const element = documentRef.createElement('div');
    element.id = 'toast-container';
    element.setAttribute('aria-live', 'polite');
    host.appendChild(element);
    container = element;
    return element;
  };

  const schedule = (handler, duration) => {
    const scheduler =
      typeof environment.setTimeout === 'function'
        ? environment.setTimeout.bind(environment)
        : typeof globalThis?.setTimeout === 'function'
          ? globalThis.setTimeout.bind(globalThis)
          : () => {};
    return scheduler(handler, duration);
  };

  const clearTimer = () => {
    if (!timer) {
      return;
    }
    const cancel =
      typeof environment.clearTimeout === 'function'
        ? environment.clearTimeout.bind(environment)
        : typeof globalThis?.clearTimeout === 'function'
          ? globalThis.clearTimeout.bind(globalThis)
          : () => {};
    cancel(timer);
    timer = null;
  };

  const writeConsole = (payload) => {
    const consoleRef = environment.console ?? globalThis.console ?? null;
    if (consoleRef && typeof consoleRef.log === 'function') {
      consoleRef.log(payload);
    }
  };

  const writeLog = (type, message) => {
    const payload = `[Toast:${type}] ${message}`;
    if (!loggerRef) {
      writeConsole(payload);
      return;
    }
    const level = typeof loggerRef[type] === 'function' ? type : 'info';
    const method = typeof loggerRef[level] === 'function' ? loggerRef[level] : null;
    if (method) {
      method.call(loggerRef, payload);
      return;
    }
    writeConsole(payload);
  };

  const logDisplay = (type, message) => {
    writeLog(type, `show ${message}`);
  };

  const logHide = (type, message) => {
    const payload = `[Toast:${type}] hide ${message}`;
    if (loggerRef && typeof loggerRef.debug === 'function') {
      loggerRef.debug.call(loggerRef, payload);
      return;
    }
    writeConsole(payload);
  };

  const removeCurrentElement = () => {
    if (currentElement && typeof currentElement.remove === 'function') {
      currentElement.remove();
    }
    currentElement = null;
  };

  const createToastElement = ({ message, type, icon }) => {
    const documentRef = getDocument();
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
  };

  const appendToastElement = (entry) => {
    const host = resolveContainer();
    if (!host) {
      return null;
    }
    const element = createToastElement(entry);
    if (!element) {
      return null;
    }
    host.appendChild(element);
    return element;
  };

  const dequeue = () => queue.shift() ?? null;

  const showNext = () => {
    const next = queue[0] ?? null;
    if (!next) {
      isActive = false;
      return;
    }
    isActive = true;
    current = next;
    logDisplay(next.type, next.message);
    currentElement = appendToastElement(next);
    timer = schedule(() => completeCurrent(), next.duration);
  };

  const completeCurrent = () => {
    const active = current;
    clearTimer();
    removeCurrentElement();
    if (active) {
      logHide(active.type, active.message);
      dequeue();
    }
    current = null;
    isActive = false;
    showNext();
  };

  const enqueue = (type, message, options = {}) => {
    const duration = Number.isFinite(options.duration) ? options.duration : DEFAULT_DURATION;
    const payload = {
      type,
      message,
      duration,
      icon: options?.icon ?? null
    };
    queue.push(payload);
    if (!isActive) {
      showNext();
    }
  };

  const info = (message, options) => enqueue('info', message, options);
  const success = (message, options) => enqueue('success', message, options);
  const warn = (message, options) => enqueue('warn', message, options);
  const error = (message, options) => enqueue('error', message, options);

  const hide = () => {
    if (!isActive) {
      return;
    }
    completeCurrent();
  };

  const getQueue = () => [...queue];

  const init = () => {
    resolveContainer();
    return api;
  };

  let api;
  api = {
    init,
    info,
    success,
    warn,
    error,
    hide
  };

  Object.defineProperty(api, 'queue', {
    get: getQueue
  });

  return api;
}
