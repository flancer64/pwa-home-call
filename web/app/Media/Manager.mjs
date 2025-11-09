/**
 * @module HomeCall_Web_Media_Manager
 * @description Manages media permissions, local stream state and UI bindings.
 */

export default class HomeCall_Web_Media_Manager {
  constructor({
    HomeCall_Web_Media_DeviceMonitor$: monitor,
    HomeCall_Web_Env_Provider$: env,
    HomeCall_Web_Shared_EventBus$: eventBus
  } = {}) {
    if (!env) {
      throw new Error('HomeCall environment provider is required.');
    }
    const navigatorRef = env.navigator;
    const documentRef = env.document;
    const windowRef = env.window;
    const scheduleTimeout = typeof windowRef?.setTimeout === 'function' ? windowRef.setTimeout.bind(windowRef) : null;
    const cancelTimeout = typeof windowRef?.clearTimeout === 'function' ? windowRef.clearTimeout.bind(windowRef) : null;
    const bus = eventBus;
    let peerRef = null;
    let localStream = null;
    let warningActive = false;
    let status = { type: null, message: '' };
    let statusElement = null;
    const statusListeners = new Set();
    let localVideo = null;
    let localFallbackMessage = null;
    let retryButton = null;
    let toastElement = null;
    let toastTimeout = null;

    const updateStatusElement = () => {
      if (!statusElement) {
        return;
      }
      statusElement.className = 'alert';
      if (status.message) {
        statusElement.hidden = false;
        statusElement.textContent = status.message;
        if (status.type === 'warning') {
          statusElement.classList.add('alert-warning');
        } else if (status.type === 'success') {
          statusElement.classList.add('alert-success');
        }
      } else {
        statusElement.hidden = true;
        statusElement.textContent = '';
      }
    };

    const updateLocalBindings = () => {
      const hasTracks = Boolean(localStream && localStream.getTracks().length > 0);
      if (localVideo) {
        if (hasTracks) {
          if (localVideo.srcObject !== localStream) {
            localVideo.srcObject = localStream;
          }
          localVideo.hidden = false;
        } else {
          localVideo.srcObject = null;
          localVideo.hidden = true;
        }
      }
      if (localFallbackMessage) {
        localFallbackMessage.hidden = hasTracks;
      }
      if (retryButton) {
        retryButton.hidden = hasTracks;
      }
    };

    const setStatus = (type, message) => {
      status = { type, message };
      updateStatusElement();
      statusListeners.forEach((listener) => {
        try {
          listener(status);
        } catch (error) {
          console.error('[MediaManager] Status listener failed', error);
        }
      });
      bus?.emit('media:status', { status: type, message });
      if (type === 'success') {
        bus?.emit('media:ready', { stream: localStream });
      }
    };

    const setLocalStreamInternal = (stream) => {
      localStream = stream ?? null;
      if (peerRef && typeof peerRef.setLocalStream === 'function') {
        peerRef.setLocalStream(localStream);
      }
      updateLocalBindings();
    };

    const showToast = (message) => {
      if (!documentRef) {
        return;
      }
      clearToast();
      const element = documentRef.createElement?.('div') ?? { remove() {} };
      element.className = 'toast';
      element.textContent = message;
      documentRef.body?.appendChild?.(element);
      toastElement = element;
      if (scheduleTimeout) {
        toastTimeout = scheduleTimeout(() => {
          clearToast();
        }, 4000);
      }
    };

    const clearToast = () => {
      if (toastElement && typeof toastElement.remove === 'function') {
        toastElement.remove();
      }
      if (toastTimeout && cancelTimeout) {
        cancelTimeout(toastTimeout);
        toastTimeout = null;
      }
      toastElement = null;
    };

    const mapMediaError = async (error) => {
      const name = error?.name || error?.code || 'UnknownError';
      if (name === 'NotAllowedError' || name === 'PermissionDeniedError') {
        const blockedCamera = await isPermissionPermanentlyDenied('camera');
        const blockedMicrophone = await isPermissionPermanentlyDenied('microphone');
        if (blockedCamera || blockedMicrophone) {
          return {
            status: 'blocked',
            message: 'Camera or microphone access is blocked. Use the browser settings link below to allow access.'
          };
        }
        return {
          status: 'denied',
          message: 'Camera or microphone access was denied. Please allow access to continue.'
        };
      }
      if (name === 'NotFoundError' || name === 'DevicesNotFoundError') {
        return {
          status: 'not-found',
          message: 'No camera or microphone detected.'
        };
      }
      if (name === 'NotReadableError' || name === 'TrackStartError') {
        return {
          status: 'device-error',
          message: 'The camera or microphone is not working. Check your device and try again.'
        };
      }
      return {
        status: 'error',
        message: 'Unable to access media devices.'
      };
    };

    const isPermissionPermanentlyDenied = async (name) => {
      if (!navigatorRef?.permissions || typeof navigatorRef.permissions.query !== 'function') {
        return false;
      }
      try {
        const statusResult = await navigatorRef.permissions.query({ name });
        return statusResult.state === 'denied';
      } catch (permissionError) {
        console.warn(`[MediaManager] Unable to query ${name} permission state`, permissionError);
        return false;
      }
    };

    this.setPeer = (peer) => {
      peerRef = peer;
      if (peerRef && localStream && typeof peerRef.setLocalStream === 'function') {
        peerRef.setLocalStream(localStream);
      }
    };

    this.onStatusChange = (callback) => {
      if (typeof callback !== 'function') {
        return () => {};
      }
      statusListeners.add(callback);
      callback(status);
      return () => {
        statusListeners.delete(callback);
      };
    };

    this.bindStatusElement = (element) => {
      statusElement = element ?? null;
      updateStatusElement();
    };

    this.bindLocalElements = ({ video, message, retry } = {}) => {
      localVideo = video ?? null;
      localFallbackMessage = message ?? null;
      retryButton = retry ?? null;
      updateLocalBindings();
    };

    this.prepare = async () => {
      if (!navigatorRef?.mediaDevices || typeof navigatorRef.mediaDevices.enumerateDevices !== 'function') {
        this.stopLocalStream();
        setLocalStreamInternal(null);
        setStatus('warning', 'Media devices are not supported in this browser.');
        warningActive = true;
        return { status: 'unsupported', message: 'Media devices are not supported in this browser.' };
      }

      monitor?.register(() => {
        this.prepare().catch((error) => {
          console.error('[MediaManager] Failed to re-prepare media after device change', error);
        });
      });

      try {
        const devices = await navigatorRef.mediaDevices.enumerateDevices();
        const hasAudioInput = devices.some((device) => device.kind === 'audioinput');
        const hasVideoInput = devices.some((device) => device.kind === 'videoinput');
        const constraints = {};
        if (hasAudioInput) {
          constraints.audio = true;
        }
        if (hasVideoInput) {
          constraints.video = true;
        }

        if (!hasAudioInput && !hasVideoInput) {
          this.stopLocalStream();
          setLocalStreamInternal(null);
          setStatus('warning', 'No camera or microphone detected.');
          warningActive = true;
          return { status: 'not-found', message: 'No camera or microphone detected.' };
        }

        const stream = await navigatorRef.mediaDevices.getUserMedia(constraints);
        if (localStream && localStream !== stream) {
          this.stopLocalStream();
        }
        setLocalStreamInternal(stream);
        let successMessage = 'Camera and microphone are ready.';
        if (constraints.audio && !constraints.video) {
          successMessage = 'Microphone is ready. No camera detected.';
        } else if (!constraints.audio && constraints.video) {
          successMessage = 'Camera is ready. No microphone detected.';
        } else if (!constraints.audio && !constraints.video) {
          successMessage = 'Media access granted.';
        }
        setStatus('success', successMessage);
        if (warningActive) {
          showToast('Camera is active again.');
        }
        warningActive = false;
        return { status: 'ready', message: successMessage };
      } catch (error) {
        console.error('[MediaManager] Unable to access media devices', error);
        this.stopLocalStream();
        setLocalStreamInternal(null);
        const mapped = await mapMediaError(error);
        setStatus('warning', mapped.message);
        warningActive = true;
        return mapped;
      }
    };

    this.stopLocalStream = () => {
      if (!localStream) {
        return;
      }
      localStream.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch (error) {
          console.warn('[MediaManager] Failed to stop track', error);
        }
      });
    };

    this.getLocalStream = () => localStream;

    this.setLocalStream = (stream) => {
      setLocalStreamInternal(stream);
    };

    this.mapMediaError = mapMediaError;
    this.isPermissionPermanentlyDenied = isPermissionPermanentlyDenied;
    this.clearToast = clearToast;
  }
}
