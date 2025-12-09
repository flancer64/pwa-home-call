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
    let mainVideo = null;
    let overlayVideo = null;
    let localPreviewTarget = null;
    let callStage = null;
    let shareButton = null;

    const setWaitingState = (value) => {
      const waiting = Boolean(value);
      if (callStage) {
        callStage.classList.toggle('call-stage--waiting', waiting);
      }
      if (shareButton) {
        shareButton.hidden = !waiting;
      }
    };

    const toggleOverlaySlot = (active) => {
      if (!overlayVideo) {
        return;
      }
      overlayVideo.hidden = !active;
      if (!active) {
        overlayVideo.srcObject = null;
      }
    };

    const bindLocalPreview = (target) => {
      if (localPreviewTarget === target) {
        return;
      }
      localPreviewTarget = target;
      const isOverlayTarget = target === overlayVideo;
      toggleOverlaySlot(isOverlayTarget);
      if (typeof media?.bindLocalElements === 'function') {
        media.bindLocalElements({ video: target ?? null });
      }
    };

    const updateStream = (stream) => {
      if (!mainVideo) {
        return;
      }
      if (stream) {
        bindLocalPreview(overlayVideo);
        if (mainVideo.srcObject !== stream) {
          mainVideo.srcObject = stream;
        }
      } else {
        bindLocalPreview(mainVideo);
      }
      setWaitingState(!Boolean(stream));
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
      mainVideo = containerRef.querySelector('#main-video');
      overlayVideo = containerRef.querySelector('#overlay-video');
      shareButton = containerRef.querySelector('#invite-share');
      if (typeof media?.bindLocalElements === 'function') {
        cleanups.push(() => {
          bindLocalPreview(null);
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
      if (mainVideo) {
        mainVideo.srcObject = null;
        mainVideo = null;
      }
      if (overlayVideo) {
        overlayVideo.srcObject = null;
        overlayVideo = null;
      }
      localPreviewTarget = null;
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
