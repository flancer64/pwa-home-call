/**
 * @module HomeCall_Web_Rtc_Peer
 * @description Wraps RTCPeerConnection logic for HomeCall.
 */

export default class HomeCall_Web_Rtc_Peer {
  constructor() {
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
      const pc = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
      });
      if (localStream) {
        localStream.getTracks().forEach((track) => {
          pc.addTrack(track, localStream);
        });
      }
      remoteStream = new MediaStream();
      pc.addEventListener('track', (event) => {
        event.streams.forEach((stream) => {
          stream.getTracks().forEach((track) => {
            remoteStream.addTrack(track);
          });
        });
        handlers.onRemoteStream?.(remoteStream);
      });
      pc.addEventListener('icecandidate', (event) => {
        if (event.candidate && target && typeof handlers.sendCandidate === 'function') {
          handlers.sendCandidate(target, event.candidate);
        }
      });
      pc.addEventListener('connectionstatechange', () => {
        handlers.onStateChange?.(pc.connectionState);
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
      await pc.setRemoteDescription(new RTCSessionDescription({ type: 'offer', sdp }));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      handlers.sendAnswer?.(from, answer.sdp);
      return answer;
    };

    this.handleAnswer = async ({ sdp }) => {
      if (!connection) {
        return;
      }
      await connection.setRemoteDescription(new RTCSessionDescription({ type: 'answer', sdp }));
    };

    this.addCandidate = async ({ candidate }) => {
      if (!connection) {
        return;
      }
      try {
        await connection.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (error) {
        console.error('[Peer] Failed to add ICE candidate', error);
      }
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
