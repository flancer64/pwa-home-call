/**
 * @module HomeCall_Web_Rtc_Peer
 * @description Wraps RTCPeerConnection logic for HomeCall.
 */

export default class HomeCall_Web_Rtc_Peer {
  constructor({
    HomeCall_Web_Env_Provider$: env,
    HomeCall_Web_Shared_EventBus$: eventBus
  } = {}) {
    if (!env) {
      throw new Error('HomeCall environment provider is required.');
    }
    const RTCPeerConnectionCtor = env.RTCPeerConnection;
    const RTCSessionDescriptionCtor = env.RTCSessionDescription;
    const RTCIceCandidateCtor = env.RTCIceCandidate;
    const MediaStreamCtor = env.MediaStream;
    const bus = eventBus;
    let handlers = {
      sendOffer: null,
      sendAnswer: null,
      sendCandidate: null,
      onRemoteStream: null,
      onStateChange: null
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
      const pc = new RTCPeerConnectionCtor({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
      });
      if (localStream) {
        localStream.getTracks().forEach((track) => {
          pc.addTrack(track, localStream);
        });
      }
      remoteStream = typeof MediaStreamCtor === 'function' ? new MediaStreamCtor() : null;
      pc.addEventListener('track', (event) => {
        const stream = remoteStream ?? (typeof MediaStreamCtor === 'function' ? new MediaStreamCtor() : null);
        remoteStream = stream;
        event.streams.forEach((incoming) => {
          incoming.getTracks().forEach((track) => {
            stream?.addTrack(track);
          });
        });
        handlers.onRemoteStream?.(stream);
        bus?.emit('rtc:track', { stream });
      });
      pc.addEventListener('icecandidate', (event) => {
        if (event.candidate && target && typeof handlers.sendCandidate === 'function') {
          handlers.sendCandidate(target, event.candidate);
        }
      });
      pc.addEventListener('connectionstatechange', () => {
        const state = pc.connectionState;
        handlers.onStateChange?.(state);
        bus?.emit('rtc:state', { state });
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

    this.setLocalStream = (stream) => {
      localStream = stream ?? null;
      syncLocalStream();
    };

    this.start = async (targetUser) => {
      target = targetUser;
      const pc = ensureConnection();
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      handlers.sendOffer?.(targetUser, offer.sdp);
      return offer;
    };

    this.handleOffer = async ({ from, sdp }) => {
      target = from;
      const pc = ensureConnection();
      if (typeof RTCSessionDescriptionCtor !== 'function') {
        throw new Error('RTCSessionDescription is not available.');
      }
      await pc.setRemoteDescription(new RTCSessionDescriptionCtor({ type: 'offer', sdp }));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      handlers.sendAnswer?.(from, answer.sdp);
      return answer;
    };

    this.handleAnswer = async ({ sdp }) => {
      if (!connection || typeof RTCSessionDescriptionCtor !== 'function') {
        return;
      }
      await connection.setRemoteDescription(new RTCSessionDescriptionCtor({ type: 'answer', sdp }));
    };

    this.addCandidate = async ({ candidate }) => {
      if (!connection || typeof RTCIceCandidateCtor !== 'function') {
        return;
      }
      try {
        await connection.addIceCandidate(new RTCIceCandidateCtor(candidate));
      } catch (error) {
        console.error('[Peer] Failed to add ICE candidate', error);
      }
    };

    this.restartIce = () => {
      if (!connection || typeof connection.restartIce !== 'function') {
        return false;
      }
      try {
        connection.restartIce();
        return true;
      } catch (error) {
        console.warn('[Peer] restartIce failed', error);
        return false;
      }
    };

    this.forceReconnect = async () => {
      if (!target) {
        throw new Error('Cannot reconnect without a target.');
      }
      if (connection) {
        connection.close();
      }
      connection = null;
      remoteStream = null;
      return this.start(target);
    };

    this.end = () => {
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
