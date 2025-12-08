/**
 * @module HomeCall_Web_Net_Session_Manager
 * @description Handles session identifiers and invite URL generation.
 */
export default function HomeCall_Web_Net_Session_Manager({ HomeCall_Web_Env_Provider$: env } = {}) {
  const envRef = env ?? {};
  const originValue = (envRef.window?.location?.origin ?? 'https://svyazist.app').replace(/\/$/, '');

  const createFallbackId = () => {
    const randomSegment = () => Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    return `${randomSegment()}${randomSegment()}-${randomSegment()}-${randomSegment()}-${randomSegment()}-${randomSegment()}${randomSegment()}${randomSegment()}`;
  };

  const createSessionId = () => {
    const uuid = envRef.crypto?.randomUUID?.() ?? null;
    return uuid ?? createFallbackId();
  };

  const readSessionFromUrl = () => {
    const search = envRef.window?.location?.search;
    if (!search) {
      return null;
    }
    const params = new URLSearchParams(search);
    const session = params.get('session')?.trim();
    return session?.length ? session : null;
  };

  const clearSessionFromUrl = () => {
    const locationRef = envRef.window?.location;
    const historyRef = envRef.window?.history;
    if (!locationRef || !historyRef || typeof historyRef.replaceState !== 'function') {
      return;
    }
    const url = new URL(locationRef.href);
    url.searchParams.delete('session');
    historyRef.replaceState(historyRef.state, '', `${url.pathname}${url.search}`);
  };

  const buildInviteUrl = (sessionId) => {
    const normalizedSession = typeof sessionId === 'string' ? sessionId.trim() : '';
    if (!normalizedSession) {
      return originValue;
    }
    return `${originValue}/?session=${encodeURIComponent(normalizedSession)}`;
  };

  return {
    createSessionId,
    readSessionFromUrl,
    clearSessionFromUrl,
    buildInviteUrl
  };
}
