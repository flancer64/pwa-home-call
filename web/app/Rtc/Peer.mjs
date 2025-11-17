/**
 * @module HomeCall_Web_Rtc_Peer
 * @description Wraps RTCPeerConnection logic for Kolobok.
 */

const buildPeerLogger = (logger, env) => {
  if (logger && typeof logger.info === 'function') {
    return logger;
  }
  const consoleRef = env?.console ?? (typeof globalThis !== 'undefined' ? globalThis.console : null);
  if (!consoleRef) {
    const noop = () => { };
    return { debug: noop, info: noop, warn: noop, error: noop };
  }
  const bindLevel = (level) => {
    const fn = typeof consoleRef[level] === 'function' ? consoleRef[level] : consoleRef.log;
    return typeof fn === 'function' ? fn.bind(consoleRef) : () => { };
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
    HomeCall_Web_Logger$: logger
  } = {}) {
    if (!env) {
      throw new Error('Kolobok environment provider is required.');
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
        return () => { };
      }
      connectionStateListeners.add(handler);
      return () => connectionStateListeners.delete(handler);
    };

    const subscribeRemoteStream = (handler) => {
      if (typeof handler !== 'function') {
        return () => { };
      }
      remoteStreamListeners.add(handler);
      return () => remoteStreamListeners.delete(handler);
    };

    let localStream = null;
    let remoteStream = null;
    let connection = null;

    const connectionConfig = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        {
          urls: [
            'turn:turn.wiredgeese.com:3478?transport=udp',
            'turn:turn.wiredgeese.com:3478?transport=tcp'
          ],
          username: 'demo',
          credential: 'Pt26kp9d2IblMdkUjsbzfZJs'
        }
      ]
    };

    const addLocalTracks = () => {
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
      const tracks = typeof localStream.getTracks === 'function' ? localStream.getTracks() : [];
      trace('debug', 'Syncing local stream tracks with connection', {
        trackCount: tracks.length
      });
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

    const handleTrackEvent = (event) => {
      if (!remoteStream) {
        return;
      }
      trace('debug', 'Track event received', {
        trackId: event.track?.id ?? null,
        streams: Array.isArray(event.streams) ? event.streams.length : 0
      });
      const addTrack = (track) => {
        if (!track) {
          return;
        }
        const existingTracks = typeof remoteStream.getTracks === 'function' ? remoteStream.getTracks() : [];
        if (!existingTracks.includes(track)) {
          remoteStream.addTrack(track);
        }
      };
      if (Array.isArray(event.streams) && event.streams.length > 0) {
        event.streams.forEach((incoming) => {
          if (!incoming || typeof incoming.getTracks !== 'function') {
            return;
          }
          incoming.getTracks().forEach(addTrack);
        });
      } else {
        addTrack(event.track);
      }
      handlers.onRemoteStream?.(remoteStream);
      remoteStreamListeners.forEach((listener) => {
        try {
          listener(remoteStream);
        } catch (error) {
          console.error('[Peer] Remote stream listener failed', error);
        }
      });
      trace('info', 'Remote stream updated', {
        tracks: typeof remoteStream.getTracks === 'function' ? remoteStream.getTracks().length : 0
      });
    };

    const handleIceCandidateEvent = (event) => {
      if (!event?.candidate) {
        return;
      }
      const iceCandidate = event.candidate;
      trace('debug', 'ICE candidate available', {
        candidate: iceCandidate.candidate ?? null,
        sdpMid: iceCandidate.sdpMid ?? null,
        sdpMLineIndex: iceCandidate.sdpMLineIndex ?? null
      });
      if (typeof handlers.sendCandidate === 'function') {
        handlers.sendCandidate({
          candidate: iceCandidate
        });
        trace('debug', 'ICE candidate emitted to signaling layer', {
          candidate: iceCandidate.candidate ?? null
        });
      }
    };

    const ensureConnection = () => {
      if (connection) {
        trace('debug', 'Reusing existing RTCPeerConnection', {
          state: connection.connectionState ?? null
        });
        return connection;
      }
      if (typeof RTCPeerConnectionCtor !== 'function') {
        throw new Error('RTCPeerConnection is not available in this environment.');
      }
      trace('info', 'Creating RTCPeerConnection', { config: connectionConfig });
      const pc = new RTCPeerConnectionCtor(connectionConfig);
      remoteStream = typeof MediaStreamCtor === 'function' ? new MediaStreamCtor() : null;
      pc.addEventListener('track', handleTrackEvent);
      pc.addEventListener('icecandidate', handleIceCandidateEvent);
      pc.addEventListener('iceconnectionstatechange', () => {
        trace('info', 'ICE connection state changed', {
          state: pc.iceConnectionState
        });
      });
      pc.addEventListener('connectionstatechange', () => {
        const state = pc.connectionState;
        trace('info', 'Connection state changed', { state });
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
      addLocalTracks();
      return pc;
    };

    const addIceCandidateInternal = async (init) => {
      if (!connection || typeof RTCIceCandidateCtor !== 'function') {
        return;
      }
      try {
        await connection.addIceCandidate(new RTCIceCandidateCtor(init));
      } catch (error) {
        trace('error', 'Failed to add ICE candidate', { error });
        console.error('[Peer] Failed to add ICE candidate', error);
      }
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
      addLocalTracks();
    };

    this.prepare = () => {
      ensureConnection();
    };

    this.start = async () => {
      trace('info', 'Starting RTC offer');
      const pc = ensureConnection();
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      trace('debug', 'Local description set for offer', {
        type: offer.type,
        sdpLength: offer.sdp?.length ?? 0
      });
      handlers.sendOffer?.({ sdp: offer.sdp });
      trace('debug', 'Offer payload emitted', {
        sdpLength: offer.sdp?.length ?? 0
      });
      return offer;
    };

    this.handleOffer = async ({ sdp } = {}) => {
      if (typeof sdp !== 'string' || sdp.trim() === '') {
        return null;
      }
      trace('info', 'Offer received', { sdpLength: sdp?.length ?? 0 });
      const pc = ensureConnection();
      if (typeof RTCSessionDescriptionCtor !== 'function') {
        throw new Error('RTCSessionDescription is not available.');
      }
      await pc.setRemoteDescription(new RTCSessionDescriptionCtor({ type: 'offer', sdp }));
      trace('debug', 'Remote description set for offer');
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      trace('debug', 'Answer created for offer', {
        sdpLength: answer.sdp?.length ?? 0
      });
      handlers.sendAnswer?.({ sdp: answer.sdp });
      trace('debug', 'Answer payload emitted', {
        sdpLength: answer.sdp?.length ?? 0
      });
      return answer;
    };

    this.handleAnswer = async ({ sdp } = {}) => {
      if (!connection || typeof sdp !== 'string' || typeof RTCSessionDescriptionCtor !== 'function') {
        return;
      }
      trace('info', 'Answer received', { sdpLength: sdp?.length ?? 0 });
      await connection.setRemoteDescription(new RTCSessionDescriptionCtor({ type: 'answer', sdp }));
      trace('debug', 'Remote description set for answer', {
        state: connection?.connectionState ?? null
      });
    };

    this.addCandidate = async ({ candidate } = {}) => {
      const iceCandidate = candidate ?? null;
      trace('debug', 'Adding ICE candidate', {
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
        await addIceCandidateInternal(init);
      } catch (error) {
        trace('error', 'Failed to add ICE candidate', { error });
        console.error('[Peer] Failed to add ICE candidate', error);
      }
    };

    this.getConnectionState = () => {
      return connection?.connectionState ?? null;
    };

    this.getIceConnectionState = () => {
      return connection?.iceConnectionState ?? null;
    };

    this.end = () => {
      trace('info', 'Ending peer connection');
      if (connection) {
        connection.close();
      }
      connection = null;
      remoteStream = null;
      handlers.onStateChange?.('closed');
    };
  }
}
