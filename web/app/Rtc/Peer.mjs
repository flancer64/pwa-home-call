/**
 * @module HomeCall_Web_Rtc_Peer
 * @description Wraps RTCPeerConnection logic for HomeCall.
 */

const buildPeerLogger = (logger, env) => {
  if (logger && typeof logger.info === 'function') {
    return logger;
  }
  const consoleRef = env?.console ?? (typeof globalThis !== 'undefined' ? globalThis.console : null);
  if (!consoleRef) {
    const noop = () => {};
    return { debug: noop, info: noop, warn: noop, error: noop };
  }
  const bindLevel = (level) => {
    const fn = typeof consoleRef[level] === 'function' ? consoleRef[level] : consoleRef.log;
    return typeof fn === 'function' ? fn.bind(consoleRef) : () => {};
  };
  return {
    debug: bindLevel('debug'),
    info: bindLevel('info'),
    warn: bindLevel('warn'),
    error: bindLevel('error')
  };
};

export default class HomeCall_Web_Rtc_Peer {
  constructor({
    HomeCall_Web_Env_Provider$: env,
    HomeCall_Web_Logger$: logger,
  } = {}) {
    if (!env) {
      throw new Error('HomeCall environment provider is required.');
    }
    const RTCPeerConnectionCtor = env.RTCPeerConnection;
    const RTCSessionDescriptionCtor = env.RTCSessionDescription;
    const RTCIceCandidateCtor = env.RTCIceCandidate;
    const MediaStreamCtor = env.MediaStream;
    const peerLogger = buildPeerLogger(logger, env);
    const trace = (level, message, data) => {
      const handler = typeof peerLogger[level] === 'function' ? peerLogger[level] : peerLogger.info;
      if (typeof handler === 'function') {
        handler.call(peerLogger, `[Peer] ${message}`, data);
      }
    };
    let handlers = {
      sendOffer: null,
      sendAnswer: null,
      sendCandidate: null,
      onRemoteStream: null,
      onStateChange: null
    };
    const connectionStateListeners = new Set();
    const remoteStreamListeners = new Set();

    const subscribeConnectionState = (handler) => {
      if (typeof handler !== 'function') {
        return () => {};
      }
      connectionStateListeners.add(handler);
      return () => connectionStateListeners.delete(handler);
    };

    const subscribeRemoteStream = (handler) => {
      if (typeof handler !== 'function') {
        return () => {};
      }
      remoteStreamListeners.add(handler);
      return () => remoteStreamListeners.delete(handler);
    };
    let localStream = null;
    let remoteStream = null;
    let connection = null;
    let target = null;

    const ensureConnection = () => {
      if (connection) {
        return connection;
      }
      if (typeof RTCPeerConnectionCtor !== 'function') {
        throw new Error('RTCPeerConnection is not available in this environment.');
      }
      const connectionConfig = {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          {
            urls: 'turn:relay.metered.ca:80',
            username: 'openai',
            credential: 'openai'
          }
        ]
      };
      trace('info', 'Creating RTCPeerConnection', { target, config: connectionConfig });
      const pc = new RTCPeerConnectionCtor(connectionConfig);
      if (localStream) {
        localStream.getTracks().forEach((track) => {
          pc.addTrack(track, localStream);
        });
      }
      remoteStream = typeof MediaStreamCtor === 'function' ? new MediaStreamCtor() : null;
      pc.addEventListener('track', (event) => {
        const stream = remoteStream ?? (typeof MediaStreamCtor === 'function' ? new MediaStreamCtor() : null);
        trace('debug', 'Track event received', {
          target,
          streams: Array.isArray(event.streams) ? event.streams.length : 0,
          trackId: event.track?.id ?? null
        });
        remoteStream = stream;
        const addTrack = (track) => {
          if (!stream || !track) {
            return;
          }
          const existing = typeof stream.getTracks === 'function' ? stream.getTracks() : [];
          if (!existing.includes(track)) {
            stream.addTrack(track);
          }
        };
        if (event.streams && event.streams.length > 0) {
          event.streams.forEach((incoming) => {
            incoming.getTracks().forEach(addTrack);
          });
        } else {
          // Some browsers provide the incoming track only via the event itself.
          addTrack(event.track);
        }
        handlers.onRemoteStream?.(stream);
        trace('info', 'Remote stream updated', {
          target,
          tracks: typeof stream?.getTracks === 'function' ? stream.getTracks().length : 0
        });
        remoteStreamListeners.forEach((listener) => {
          try {
            listener(stream);
          } catch (error) {
            console.error('[Peer] Remote stream listener failed', error);
          }
        });
      });
      pc.addEventListener('icecandidate', (event) => {
        const iceCandidate = event.candidate ?? null;
        trace('debug', 'ICE candidate available', {
          target,
          candidate: iceCandidate?.candidate ?? null,
          sdpMid: iceCandidate?.sdpMid ?? null,
          sdpMLineIndex: iceCandidate?.sdpMLineIndex ?? null
        });
        if (iceCandidate && typeof handlers.sendCandidate === 'function') {
          handlers.sendCandidate(iceCandidate);
        }
      });
      pc.addEventListener('iceconnectionstatechange', () => {
        trace('info', 'ICE connection state changed', {
          target,
          state: pc.iceConnectionState
        });
      });
      pc.addEventListener('connectionstatechange', () => {
        const state = pc.connectionState;
        trace('info', 'Connection state changed', { state, target });
        handlers.onStateChange?.(state);
        connectionStateListeners.forEach((listener) => {
          try {
            listener(state);
          } catch (error) {
            console.error('[Peer] Connection state listener failed', error);
          }
        });
      });
      connection = pc;
      return pc;
    };

    const syncLocalStream = () => {
      if (!connection) {
        return;
      }
      const senders = connection.getSenders();
      if (!localStream) {
        senders.forEach((sender) => {
          if (sender.track) {
            connection.removeTrack(sender);
          }
        });
        return;
      }
      const tracks = localStream.getTracks();
      senders.forEach((sender) => {
        if (sender.track && !tracks.includes(sender.track)) {
          connection.removeTrack(sender);
        }
      });
      tracks.forEach((track) => {
        const alreadyAdded = senders.some((sender) => sender.track === track);
        if (!alreadyAdded) {
          connection.addTrack(track, localStream);
        }
      });
    };

    this.configure = (newHandlers = {}) => {
      handlers = { ...handlers, ...newHandlers };
    };

    this.onConnectionState = (handler) => subscribeConnectionState(handler);

    this.onRemoteStream = (handler) => subscribeRemoteStream(handler);

    this.setLocalStream = (stream) => {
      localStream = stream ?? null;
      trace('info', 'Local stream updated', {
        tracks: typeof localStream?.getTracks === 'function' ? localStream.getTracks().length : 0
      });
      syncLocalStream();
    };

    this.start = async () => {
      target = 'peer';
      trace('info', 'Starting RTC offer', { target });
      const pc = ensureConnection();
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      trace('debug', 'Local description set for offer', {
        target,
        type: offer.type,
        sdpLength: offer.sdp?.length ?? 0
      });
      handlers.sendOffer?.(offer.sdp);
      trace('debug', 'Offer payload emitted', {
        target,
        sdpLength: offer.sdp?.length ?? 0
      });
      return offer;
    };

    this.handleOffer = async ({ from, sdp }) => {
      target = typeof from === 'string' && from.length > 0 ? from : 'peer';
      trace('info', 'Offer received', { from: target, sdpLength: sdp?.length ?? 0 });
      const pc = ensureConnection();
      if (typeof RTCSessionDescriptionCtor !== 'function') {
        throw new Error('RTCSessionDescription is not available.');
      }
      await pc.setRemoteDescription(new RTCSessionDescriptionCtor({ type: 'offer', sdp }));
      trace('debug', 'Remote description set for offer', { from: target });
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      trace('debug', 'Answer created for offer', {
        from: target,
        sdpLength: answer.sdp?.length ?? 0
      });
      handlers.sendAnswer?.(answer.sdp);
      trace('debug', 'Answer payload emitted', {
        target,
        sdpLength: answer.sdp?.length ?? 0
      });
      return answer;
    };

    this.handleAnswer = async ({ from, sdp }) => {
      trace('info', 'Answer received', { from, sdpLength: sdp?.length ?? 0 });
      if (typeof from === 'string' && from.length > 0) {
        target = from;
      }
      if (!connection || typeof RTCSessionDescriptionCtor !== 'function') {
        return;
      }
      await connection.setRemoteDescription(new RTCSessionDescriptionCtor({ type: 'answer', sdp }));
      trace('debug', 'Remote description set for answer', {
        from,
        state: connection?.connectionState ?? null
      });
    };

    this.addCandidate = async ({ candidate }) => {
      const iceCandidate = candidate ?? null;
      trace('debug', 'Adding ICE candidate', {
        target,
        candidate: iceCandidate?.candidate ?? null,
        sdpMid: iceCandidate?.sdpMid ?? null,
        sdpMLineIndex: iceCandidate?.sdpMLineIndex ?? null
      });
      if (!connection || typeof RTCIceCandidateCtor !== 'function' || !iceCandidate) {
        return;
      }
      const init = {
        candidate: iceCandidate.candidate,
        sdpMid: iceCandidate.sdpMid ?? '0',
        sdpMLineIndex: iceCandidate.sdpMLineIndex ?? 0
      };
      try {
        await connection.addIceCandidate(new RTCIceCandidateCtor(init));
      } catch (error) {
        trace('error', 'Failed to add ICE candidate', { error });
        console.error('[Peer] Failed to add ICE candidate', error);
      }
    };

    this.restartIce = () => {
      trace('info', 'Restarting ICE', { target });
      if (!connection || typeof connection.restartIce !== 'function') {
        return false;
      }
      try {
        connection.restartIce();
        return true;
      } catch (error) {
        trace('warn', 'restartIce failed', { error });
        console.warn('[Peer] restartIce failed', error);
        return false;
      }
    };

    this.forceReconnect = async () => {
      if (!target) {
        throw new Error('Cannot reconnect without a target.');
      }
      trace('info', 'Force reconnect requested', { target });
      if (connection) {
        connection.close();
      }
      connection = null;
      remoteStream = null;
      return this.start();
    };

    this.end = () => {
      trace('info', 'Ending peer connection', { target });
      if (connection) {
        connection.close();
      }
      connection = null;
      remoteStream = null;
      target = null;
      handlers.onStateChange?.('closed');
    };
  }
}
