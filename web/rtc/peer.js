const DEFAULT_CONFIG = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' }
  ]
};

export class PeerSession {
  constructor(localStream, config = {}) {
    if (!localStream) {
      throw new Error('Local media stream is required for PeerSession.');
    }

    this.localStream = localStream;
    this.remoteStream = new MediaStream();
    this.connection = new RTCPeerConnection({ ...DEFAULT_CONFIG, ...config });

    this.onRemoteTrack = null;
    this.onIceCandidate = null;
    this.onConnectionStateChange = null;

    for (const track of this.localStream.getTracks()) {
      this.connection.addTrack(track, this.localStream);
    }

    this.connection.addEventListener('track', (event) => {
      for (const track of event.streams[0].getTracks()) {
        if (!this.remoteStream.getTracks().includes(track)) {
          this.remoteStream.addTrack(track);
        }
      }
      if (typeof this.onRemoteTrack === 'function') {
        this.onRemoteTrack(this.remoteStream);
      }
    });

    this.connection.addEventListener('icecandidate', (event) => {
      if (event.candidate && typeof this.onIceCandidate === 'function') {
        this.onIceCandidate(event.candidate);
      }
    });

    this.connection.addEventListener('connectionstatechange', () => {
      if (typeof this.onConnectionStateChange === 'function') {
        this.onConnectionStateChange(this.connection.connectionState);
      }
    });
  }

  async createOffer(options) {
    const offer = await this.connection.createOffer(options);
    await this.connection.setLocalDescription(offer);
    return offer;
  }

  async acceptOffer(offer) {
    await this.connection.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await this.connection.createAnswer();
    await this.connection.setLocalDescription(answer);
    return answer;
  }

  async applyAnswer(answer) {
    await this.connection.setRemoteDescription(new RTCSessionDescription(answer));
  }

  async addIceCandidate(candidate) {
    if (!candidate) {
      return;
    }
    try {
      await this.connection.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (err) {
      console.error('Failed to add ICE candidate', err);
    }
  }

  close() {
    this.connection.getSenders().forEach((sender) => {
      try {
        this.connection.removeTrack(sender);
      } catch (err) {
        // Ignore removal issues when connection already closed
      }
    });
    this.connection.close();
    this.remoteStream.getTracks().forEach((track) => track.stop());
  }
}
