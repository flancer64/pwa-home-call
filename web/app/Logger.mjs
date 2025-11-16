const REMOTE_LOGGING_ENDPOINT = 'https://console.wiredgeese.com/log/homecall';
const DEFAULT_CONTEXT = 'Kolobok';

const formatLevel = (level) => (typeof level === 'string' ? level.toUpperCase() : 'INFO');

/**
 * @module HomeCall_Web_Logger
 * @description Handles console output and optional remote dupes to the wiredgeese console.
 */
export default class HomeCall_Web_Logger {
  constructor({
    HomeCall_Web_Env_Provider$: env,
    HomeCall_Web_Config_RemoteLogging$: config
  } = {}) {
    const environment = env ?? {};
    const consoleRef = environment.console ?? globalThis.console ?? null;
    const navigatorRef = environment.navigator ?? globalThis.navigator ?? null;
    const fetchRef =
      environment.fetch ??
      (typeof globalThis.fetch === 'function' ? globalThis.fetch.bind(globalThis) : null);
    const loggerConfig = config ?? null;
    const context = DEFAULT_CONTEXT;
    const instanceId = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, '0');

    const prepareMessage = (level, message, details) => {
      const normalizedLevel = formatLevel(level);
      return `[${normalizedLevel}] [${context}] ${message ?? ''} ${details ? JSON.stringify(details) : ''}`;
    };

    const shouldLogRemotely = () => {
      if (!loggerConfig || typeof loggerConfig.isRemoteLoggingEnabled !== 'function') {
        return false;
      }
      return Boolean(loggerConfig.isRemoteLoggingEnabled());
    };

    const sendViaBeacon = (body) => {
      if (!navigatorRef || typeof navigatorRef.sendBeacon !== 'function') {
        return false;
      }
      try {
        return navigatorRef.sendBeacon(REMOTE_LOGGING_ENDPOINT, body);
      } catch {
        return false;
      }
    };

    const sendViaFetch = (body) => {
      const fallbackFetch =
        fetchRef ?? (typeof globalThis.fetch === 'function' ? globalThis.fetch.bind(globalThis) : null);
      if (!fallbackFetch) {
        return;
      }
      try {
        fallbackFetch(REMOTE_LOGGING_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain' },
          body
        }).catch(() => { });
      } catch {
        // intentionally ignored
      }
    };

    const dispatchRemote = (level, message, details) => {
      if (!shouldLogRemotely()) {
        return;
      }
      const payload = `[${instanceId}] ${prepareMessage(level, message, details)}`;
      if (sendViaBeacon(payload)) {
        return;
      }
      sendViaFetch(payload);
    };

    const notify = (level, message, details) => {
      if (!consoleRef) {
        return;
      }
      const formatted = prepareMessage(level, message);
      const payload = details ? [message, details] : [message];
      const write = typeof consoleRef[level] === 'function' ? consoleRef[level] : consoleRef.log;
      write.call(consoleRef, formatted, ...payload.slice(1));
    };

    const record = (level, message, details) => {
      notify(level, message, details);
      dispatchRemote(level, message, details);
    };

    this.debug = (message, details) => record('debug', message, details);
    this.info = (message, details) => record('info', message, details);
    this.warn = (message, details) => record('warn', message, details);
    this.error = (message, details) => record('error', message, details);
    this.setRemoteLoggingEnabled = (flag) => {
      if (typeof loggerConfig?.setRemoteLoggingEnabled === 'function') {
        loggerConfig.setRemoteLoggingEnabled(flag);
      }
    };
    this.isRemoteLoggingEnabled = () => {
      if (typeof loggerConfig?.isRemoteLoggingEnabled === 'function') {
        return Boolean(loggerConfig.isRemoteLoggingEnabled());
      }
      return false;
    };
  }
}
