/**
 * @module HomeCall_Web_Env_Provider
 * @description Provides access to browser global objects.
 */
export default class HomeCall_Web_Env_Provider {
  constructor() {
    const g = globalThis;
    this.window = g.window ?? null;
    this.document = g.document ?? null;
    this.navigator = g.navigator ?? null;
    this.fetch = typeof g.fetch === 'function' ? g.fetch.bind(g) : null;
    this.setInterval = typeof g.setInterval === 'function' ? g.setInterval.bind(g) : null;
    this.clearInterval = typeof g.clearInterval === 'function' ? g.clearInterval.bind(g) : null;
    this.WebSocket = g.WebSocket ?? null;
    this.MediaStream = typeof g.MediaStream === 'function' ? g.MediaStream : null;
    this.RTCPeerConnection = typeof g.RTCPeerConnection === 'function' ? g.RTCPeerConnection : null;
    this.RTCSessionDescription = typeof g.RTCSessionDescription === 'function' ? g.RTCSessionDescription : null;
    this.RTCIceCandidate = typeof g.RTCIceCandidate === 'function' ? g.RTCIceCandidate : null;
    this.crypto = g.crypto ?? null;
    this.console = g.console ?? null;
    this.localStorage = g.localStorage ?? null;
    const normalizedHost = (this.window?.location?.hostname ?? '').trim().toLowerCase();
    const processEnv = typeof g.process === 'object' && g.process !== null ? g.process?.env ?? null : null;
    const hasExplicitDevFlag = processEnv?.NODE_ENV === 'development';
    const localHosts = new Set(['localhost', '127.0.0.1', '0.0.0.0', '::1']);
    const hostLooksLikeDev =
      normalizedHost === 'dev' ||
      normalizedHost.startsWith('dev.') ||
      normalizedHost.endsWith('.dev') ||
      normalizedHost.includes('.dev.');
    const hostLooksLikeLocal =
      normalizedHost.endsWith('.local') || normalizedHost.includes('.local.');
    this.isDevelopment = hasExplicitDevFlag || localHosts.has(normalizedHost) || hostLooksLikeDev || hostLooksLikeLocal;
  }
}
