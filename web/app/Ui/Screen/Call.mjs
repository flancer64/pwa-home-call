/**
 * @module HomeCall_Web_Ui_Screen_Call
 * @description Renders the minimal call screen layout with remote video, local preview, and controls.
 */
export default class HomeCall_Web_Ui_Screen_Call {
  constructor({
    HomeCall_Web_Ui_Templates_Loader$: templates,
    HomeCall_Web_Media_Manager$: media
  } = {}) {
    if (!templates) {
      throw new Error('Template loader is required for the call screen.');
    }
    if (!media) {
      throw new Error('Media manager is required for the call screen.');
    }
    this.templates = templates;
    this.media = media;

    const context = {
      remoteVideo: null
    };

    this.show = ({ container, remoteStream, onEnd, onOpenSettings } = {}) => {
      if (!container) {
        return;
      }
      this.templates.apply('call', container);
      const remoteVideo = container.querySelector('#remote-video');
      const localVideo = container.querySelector('#local-video');
      const settingsButton = container.querySelector('#call-settings');
      const endButton = container.querySelector('#end-call');

      context.remoteVideo = remoteVideo ?? null;
      this.media.bindLocalElements({
        video: localVideo ?? null
      });

      if (remoteStream) {
        this.updateRemoteStream(remoteStream);
      }

      endButton?.addEventListener('click', (event) => {
        event.preventDefault();
        onEnd?.();
      });
      settingsButton?.addEventListener('click', (event) => {
        event.preventDefault();
        onOpenSettings?.();
      });
    };

    this.updateRemoteStream = (stream) => {
      const video = context.remoteVideo;
      if (!video) {
        return;
      }
      if (stream) {
        if (video.srcObject !== stream) {
          video.srcObject = stream;
        }
      } else {
        video.srcObject = null;
      }
    };
  }
}
