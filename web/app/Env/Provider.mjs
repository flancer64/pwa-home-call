/**
 * @module HomeCall_Web_Env_Provider
 * @description Provides access to browser global objects.
 */
export default function HomeCall_Web_Env_Provider() {
  const g = globalThis;
  const windowRef = g.window ?? null;
  const env = {
    window: windowRef,
    document: g.document ?? null,
    navigator: g.navigator ?? null,
    fetch: typeof g.fetch === 'function' ? g.fetch.bind(g) : null,
    setInterval: typeof g.setInterval === 'function' ? g.setInterval.bind(g) : null,
    clearInterval: typeof g.clearInterval === 'function' ? g.clearInterval.bind(g) : null,
    WebSocket: g.WebSocket ?? null,
    MediaStream: typeof g.MediaStream === 'function' ? g.MediaStream : null,
    RTCPeerConnection: typeof g.RTCPeerConnection === 'function' ? g.RTCPeerConnection : null,
    RTCSessionDescription: typeof g.RTCSessionDescription === 'function' ? g.RTCSessionDescription : null,
    RTCIceCandidate: typeof g.RTCIceCandidate === 'function' ? g.RTCIceCandidate : null,
    crypto: g.crypto ?? null,
    console: g.console ?? null,
    localStorage: g.localStorage ?? null
  };
  const normalizedHost = (windowRef?.location?.hostname ?? '').trim().toLowerCase();
  const processEnv = typeof g.process === 'object' && g.process !== null ? g.process?.env ?? null : null;
  const hasExplicitDevFlag = processEnv?.NODE_ENV === 'development';
  const localHosts = new Set(['localhost', '127.0.0.1', '0.0.0.0', '::1']);
  const hostLooksLikeDev =
    normalizedHost === 'dev' ||
    normalizedHost.startsWith('dev.') ||
    normalizedHost.endsWith('.dev') ||
    normalizedHost.includes('.dev.');
  const hostLooksLikeLocal = normalizedHost.endsWith('.local') || normalizedHost.includes('.local.');
  env.isDevelopment = hasExplicitDevFlag || localHosts.has(normalizedHost) || hostLooksLikeDev || hostLooksLikeLocal;
  return env;
}
