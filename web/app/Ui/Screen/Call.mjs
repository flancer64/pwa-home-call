/**
 * @module HomeCall_Web_Ui_Screen_Call
 * @description Manages UI for active call.
 */

/**
 * @implements {HomeCall_Web_Ui_Screen_Interface}
 */
export default class HomeCall_Web_Ui_Screen_Call {
  constructor({ HomeCall_Web_Core_TemplateLoader$: templates, HomeCall_Web_Media_Manager$: media } = {}) {
    this.templates = templates;
    this.media = media;
    this.remoteVideo = null;
  }

  /**
   * Render call view and wire controls.
   * @param {Object} params
   * @param {HTMLElement} params.container - Root container for rendering the screen.
   * @param {MediaStream} [params.remoteStream]
   * @param {() => void} [params.onEnd]
   * @param {() => void} [params.onRetry]
   */
  show({ container, remoteStream, onEnd, onRetry } = {}) {
    if (!container) {
      return;
    }
    this.templates.apply('call', container);
    const localVideo = container.querySelector('#local-video');
    this.remoteVideo = container.querySelector('#remote-video');
    const noMedia = container.querySelector('#no-media');
    const retryButton = container.querySelector('#retry-media');
    const endButton = container.querySelector('#end-call');
    this.media.bindLocalElements({
      video: localVideo ?? null,
      message: noMedia ?? null,
      retry: retryButton ?? null
    });
    if (remoteStream) {
      this.updateRemoteStream(remoteStream);
    }
    endButton?.addEventListener('click', () => {
      onEnd?.();
    });
    retryButton?.addEventListener('click', () => {
      onRetry?.();
    });
  }

  updateRemoteStream(stream) {
    if (!this.remoteVideo) {
      return;
    }
    if (stream) {
      if (this.remoteVideo.srcObject !== stream) {
        this.remoteVideo.srcObject = stream;
      }
    } else {
      this.remoteVideo.srcObject = null;
    }
  }
}
