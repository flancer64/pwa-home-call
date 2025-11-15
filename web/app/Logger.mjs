/**
 * @module HomeCall_Web_Logger
 * @description Console-backed logger with optional context augmentation.
 */

export default class HomeCall_Web_Logger {
  constructor({ HomeCall_Web_Env_Provider$: env } = {}) {
    const consoleRef = env?.console ?? globalThis.console ?? null;
    this.console = consoleRef;
    this.context = 'HomeCall';
  }

  _notify(level, message, details) {
    if (!this.console) {
      return;
    }
    const payload = details ? [message, details] : [message];
    if (typeof this.console[level] === 'function') {
      this.console[level](`[${this.context}] ${message}`, ...payload.slice(1));
    } else {
      this.console.log(`[${this.context}] ${message}`, ...payload.slice(1));
    }
  }

  debug(message, details) {
    this._notify('debug', message, details);
  }

  info(message, details) {
    this._notify('info', message, details);
  }

  warn(message, details) {
    this._notify('warn', message, details);
  }

  error(message, details) {
    this._notify('error', message, details);
  }
}
