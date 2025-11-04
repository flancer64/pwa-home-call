export class PeerConnection {
  constructor({ sendOffer, sendAnswer, sendCandidate, onRemoteStream, onStateChange } = {}) {
    this.sendOffer = sendOffer;
    this.sendAnswer = sendAnswer;
    this.sendCandidate = sendCandidate;
    this.onRemoteStream = onRemoteStream;
    this.onStateChange = onStateChange;
    this.localStream = null;
    this.remoteStream = null;
    this.connection = null;
    this.target = null;
  }

  setLocalStream(stream) {
    this.localStream = stream;
    if (!this.connection) {
      return;
    }

    const senders = this.connection.getSenders();

    if (!stream) {
      senders.forEach((sender) => {
        if (sender.track) {
          this.connection.removeTrack(sender);
        }
      });
      return;
    }

    const tracks = stream.getTracks();

    senders.forEach((sender) => {
      if (sender.track && !tracks.includes(sender.track)) {
        this.connection.removeTrack(sender);
      }
    });

    tracks.forEach((track) => {
      const alreadyAdded = senders.some((sender) => sender.track === track);
      if (!alreadyAdded) {
        this.connection.addTrack(track, stream);
      }
    });
  }

  ensureConnection() {
    if (this.connection) {
      return this.connection;
    }

    const pc = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    });

    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => {
        pc.addTrack(track, this.localStream);
      });
    }

    this.remoteStream = new MediaStream();

    pc.addEventListener('track', (event) => {
      event.streams.forEach((stream) => {
        stream.getTracks().forEach((track) => {
          this.remoteStream.addTrack(track);
        });
      });
      if (typeof this.onRemoteStream === 'function') {
        this.onRemoteStream(this.remoteStream);
      }
    });

    pc.addEventListener('icecandidate', (event) => {
      if (event.candidate && this.target && typeof this.sendCandidate === 'function') {
        this.sendCandidate(this.target, event.candidate);
      }
    });

    pc.addEventListener('connectionstatechange', () => {
      if (typeof this.onStateChange === 'function') {
        this.onStateChange(pc.connectionState);
      }
    });

    this.connection = pc;
    return pc;
  }

  async start(target) {
    this.target = target;
    const pc = this.ensureConnection();
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    if (typeof this.sendOffer === 'function') {
      this.sendOffer(target, offer.sdp);
    }
    return offer;
  }

  async handleOffer({ from, sdp }) {
    this.target = from;
    const pc = this.ensureConnection();
    await pc.setRemoteDescription(new RTCSessionDescription({ type: 'offer', sdp }));
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    if (typeof this.sendAnswer === 'function') {
      this.sendAnswer(from, answer.sdp);
    }
    return answer;
  }

  async handleAnswer({ sdp }) {
    if (!this.connection) {
      return;
    }
    await this.connection.setRemoteDescription(new RTCSessionDescription({ type: 'answer', sdp }));
  }

  async addCandidate({ candidate }) {
    if (!this.connection) {
      return;
    }
    try {
      await this.connection.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (error) {
      console.error('[PeerConnection] Failed to add ICE candidate', error);
    }
  }

  end() {
    if (this.connection) {
      this.connection.close();
    }
    this.connection = null;
    this.remoteStream = null;
    this.target = null;
    if (typeof this.onStateChange === 'function') {
      this.onStateChange('closed');
    }
  }
}
