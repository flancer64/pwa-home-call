/**
 * @module HomeCall_Back_Logger
 * @description Internal logger implementation for Svyazist back-end zone.
 */

export default class HomeCall_Back_Logger {
    /**
     * @param {Object} [deps] - Dependencies injected by the DI container.
     * @param {Console} [deps.console] - Optional console-like object for output.
     */
    constructor(deps = {}) {
        const defaultConsole = globalThis.console ?? console;
        const targetConsole = deps.console ?? defaultConsole;
        const fallback = typeof targetConsole.log === 'function' ? targetConsole.log.bind(targetConsole) : () => { };

        /** @type {Record<string, Function>} */
        const writers = {
            INFO: typeof targetConsole.info === 'function' ? targetConsole.info.bind(targetConsole) : fallback,
            WARN: typeof targetConsole.warn === 'function' ? targetConsole.warn.bind(targetConsole) : fallback,
            ERROR: typeof targetConsole.error === 'function' ? targetConsole.error.bind(targetConsole) : fallback,
            EXCEPTION: typeof targetConsole.error === 'function' ? targetConsole.error.bind(targetConsole) : fallback,
        };

        const normalizeNamespace = (namespace) => {
            if (typeof namespace !== 'string' || namespace.trim() === '') {
                throw new TypeError('Logger namespace must be a non-empty string.');
            }
            return namespace;
        };

        const formatMessage = (level, namespace, message) => {
            const timestamp = new Date().toISOString();
            const text = message === undefined || message === null ? '' : String(message);
            return `[${timestamp}] [${level}] [${namespace}] ${text}`.trimEnd();
        };

        const emit = (level, namespace, message, extras = []) => {
            const ns = normalizeNamespace(namespace);
            const formatted = formatMessage(level, ns, message);
            const extraArgs = Array.isArray(extras) ? extras : [extras];
            writers[level](formatted, ...extraArgs);
        };

        this.info = (namespace, message = '', ...details) => {
            emit('INFO', namespace, message, details);
        };

        this.warn = (namespace, message = '', ...details) => {
            emit('WARN', namespace, message, details);
        };

        this.error = (namespace, message = '', ...details) => {
            emit('ERROR', namespace, message, details);
        };

        this.exception = (namespace, error, ...details) => {
            const err = error instanceof Error ? error : new Error(error ?? '');
            const extra = [];
            if (err.stack) {
                extra.push(err.stack);
            }
            extra.push(...details);
            emit('EXCEPTION', namespace, err.message, extra);
        };
    }
}
