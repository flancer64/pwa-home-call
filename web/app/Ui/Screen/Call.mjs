/**
 * @module HomeCall_Web_Ui_Screen_Call
 * @description Manages UI for active call.
 */

export default class HomeCall_Web_Ui_Screen_Call {
  constructor({ HomeCall_Web_Core_TemplateLoader$: templates, HomeCall_Web_Media_Manager$: media } = {}) {
    let remoteVideo = null;

    this.show = ({ container, remoteStream, onEnd, onRetry } = {}) => {
      if (!container) {
        return;
      }
      templates.apply('call', container);
      const localVideo = container.querySelector('#local-video');
      remoteVideo = container.querySelector('#remote-video');
      const noMedia = container.querySelector('#no-media');
      const retryButton = container.querySelector('#retry-media');
      const endButton = container.querySelector('#end-call');
      media.bindLocalElements({ video: localVideo ?? null, message: noMedia ?? null, retry: retryButton ?? null });
      if (remoteStream) {
        this.updateRemoteStream(remoteStream);
      }
      endButton?.addEventListener('click', () => {
        onEnd?.();
      });
      retryButton?.addEventListener('click', () => {
        onRetry?.();
      });
    };

    this.updateRemoteStream = (stream) => {
      if (!remoteVideo) {
        return;
      }
      if (stream) {
        if (remoteVideo.srcObject !== stream) {
          remoteVideo.srcObject = stream;
        }
      } else {
        remoteVideo.srcObject = null;
      }
    };
  }
}
