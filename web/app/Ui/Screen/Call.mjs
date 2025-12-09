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

    const silenceVideoElement = (video) => {
      if (!video) {
        return;
      }
      video.muted = true;
      video.defaultMuted = true;
      if (typeof video.volume === 'number') {
        video.volume = 0;
      }
    };

    const requestMainVideoPlayback = () => {
      if (!mainVideo || typeof mainVideo.play !== 'function') {
        return;
      }
      const playPromise = mainVideo.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(() => {});
      }
    };

    const setMainVideoAudioEnabled = (enabled) => {
      if (!mainVideo) {
        return;
      }
      const shouldMute = !enabled;
      mainVideo.muted = shouldMute;
      mainVideo.defaultMuted = shouldMute;
      if (typeof mainVideo.volume === 'number') {
        mainVideo.volume = enabled ? 1 : 0;
      }
      if (typeof mainVideo.setAttribute === 'function') {
        if (shouldMute) {
          mainVideo.setAttribute('muted', '');
        } else {
          mainVideo.removeAttribute('muted');
        }
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

      if (target) {
        silenceVideoElement(target);
      }

      toggleOverlaySlot(isOverlayTarget);
      if (typeof media?.bindLocalElements === 'function') {
        media.bindLocalElements({ video: target ?? null });
      }
    };

    const updateStream = (stream) => {
      if (!mainVideo) {
        return;
      }
      const hasRemote = Boolean(stream);
      if (hasRemote) {
        setMainVideoAudioEnabled(true);
        if (mainVideo.srcObject !== stream) {
          mainVideo.srcObject = stream;
        }
        bindLocalPreview(overlayVideo);
        requestMainVideoPlayback();
      } else {
        setMainVideoAudioEnabled(false);
        if (mainVideo.srcObject) {
          mainVideo.srcObject = null;
        }
        bindLocalPreview(mainVideo);
      }
      setWaitingState(!hasRemote);
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
