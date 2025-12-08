/**
 * @module HomeCall_Web_Ui_Screen_Call
 * @description Renders the active call stage.
 */
export default function HomeCall_Web_Ui_Screen_Call({
  HomeCall_Web_Media_Manager$: media
} = {}) {
  const create = () => {
    let containerRef = null;
    const cleanups = [];
    let remoteVideo = null;
    let callStage = null;
    let shareButton = null;

    const updateStream = (stream) => {
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
      setWaitingState(!Boolean(stream));
    };

    const setWaitingState = (value) => {
      const waiting = Boolean(value);
      if (callStage) {
        callStage.classList.toggle('call-stage--waiting', waiting);
      }
      if (shareButton) {
        shareButton.hidden = !waiting;
      }
    };

    const attachClick = (element, handler) => {
      if (!element || typeof handler !== 'function') {
        return;
      }
      const listener = (event) => {
        event?.preventDefault?.();
        handler(event);
      };
      element.addEventListener('click', listener);
      cleanups.push(() => element.removeEventListener('click', listener));
    };

    const mount = ({ container, params = {} } = {}) => {
      containerRef = container ?? null;
      if (!containerRef) {
        return;
      }
      callStage = containerRef.querySelector('.call-stage');
      remoteVideo = containerRef.querySelector('#remote-video');
      shareButton = containerRef.querySelector('#invite-share');
      const localVideo = containerRef.querySelector('#local-video');
      if (typeof media?.bindLocalElements === 'function') {
        media.bindLocalElements({ video: localVideo });
        cleanups.push(() => {
          media.bindLocalElements({ video: null });
        });
      }
      const waitingFlag = typeof params.waiting === 'boolean' ? params.waiting : !Boolean(params.remoteStream);
      setWaitingState(waitingFlag);
      attachClick(shareButton, params.onShareLink);
      attachClick(containerRef.querySelector('#call-settings'), params.onOpenSettings);
      attachClick(containerRef.querySelector('#end-call'), params.onEnd);
      updateStream(params.remoteStream ?? null);
    };

    const unmount = () => {
      cleanups.splice(0).forEach((fn) => fn());
      if (remoteVideo) {
        remoteVideo.srcObject = null;
        remoteVideo = null;
      }
      shareButton = null;
      callStage = null;
      containerRef = null;
    };

    return {
      mount,
      unmount,
      updateRemoteStream: updateStream
    };
  };

  return {
    create
  };
}
