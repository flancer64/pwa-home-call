/**
 * @module HomeCall_Web_Media_Manager
 * @description Manages media permissions, local stream state and UI bindings.
 */

export default class HomeCall_Web_Media_Manager {
  constructor({
    HomeCall_Web_Media_Monitor$: monitor,
    HomeCall_Web_State_Media$: mediaState,
    HomeCall_Web_Env_Provider$: env,
    HomeCall_Web_Ui_Toast$: toast
  } = {}) {
    if (!env) {
      throw new Error('HomeCall environment provider is required.');
    }
    if (!toast) {
      throw new Error('Toast module is required for media manager.');
    }
    const navigatorRef = env.navigator;
    const windowRef = env.window;
    const scheduleTimeout = typeof windowRef?.setTimeout === 'function' ? windowRef.setTimeout.bind(windowRef) : null;
    const cancelTimeout = typeof windowRef?.clearTimeout === 'function' ? windowRef.clearTimeout.bind(windowRef) : null;
    const toastNotifier = toast;
    let peerRef = null;
    let localStream = null;
    let warningActive = false;
    let status = { type: null, message: '' };
    let statusElement = null;
    const statusListeners = new Set();
    let localVideo = null;
    let localFallbackMessage = null;
    let retryButton = null;
    const stateTracker = mediaState ?? null;
    const capitalize = (value) => (typeof value === 'string' && value.length > 0 ? `${value[0].toUpperCase()}${value.slice(1)}` : '');
    const invokeStateSetter = (type, suffix) => {
      if (!stateTracker) {
        return;
      }
      const setterName = `set${capitalize(type)}${capitalize(suffix)}`;
      const setter = stateTracker[setterName];
      if (typeof setter === 'function') {
        setter.call(stateTracker);
      }
    };

    const setTypeState = (type, stateName) => {
      invokeStateSetter(type, stateName);
    };

    const collectTracks = (kind) => {
      if (!localStream) {
        return [];
      }
      const accessor = kind === 'video' ? 'getVideoTracks' : 'getAudioTracks';
      if (typeof localStream[accessor] === 'function') {
        return localStream[accessor]();
      }
      if (typeof localStream.getTracks === 'function') {
        return localStream.getTracks().filter((track) => track?.kind === kind);
      }
      return [];
    };

    const updateTrackState = (type, tracks) => {
      if (!tracks || tracks.length === 0) {
        setTypeState(type, 'off');
        return;
      }
      const hasEnabled = tracks.some((track) => track?.enabled !== false);
      if (hasEnabled) {
        setTypeState(type, 'ready');
        return;
      }
      setTypeState(type, 'paused');
    };

    const syncStreamState = () => {
      updateTrackState('video', collectTracks('video'));
      updateTrackState('audio', collectTracks('audio'));
    };

    const setAllOff = () => {
      setTypeState('video', 'off');
      setTypeState('audio', 'off');
    };

    const setAllBlocked = () => {
      setTypeState('video', 'blocked');
      setTypeState('audio', 'blocked');
    };

    const setAllUnsupported = () => {
      setTypeState('video', 'unsupported');
      setTypeState('audio', 'unsupported');
    };

    const applyErrorState = (statusName) => {
      if (!statusName) {
        setAllOff();
        return;
      }
      if (statusName === 'blocked' || statusName === 'denied') {
        setAllBlocked();
        return;
      }
      if (statusName === 'device-error' || statusName === 'error') {
        setAllUnsupported();
        return;
      }
      if (statusName === 'not-found') {
        setAllOff();
        return;
      }
      setAllOff();
    };

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
    };

    const setLocalStreamInternal = (stream) => {
      localStream = stream ?? null;
      if (peerRef && typeof peerRef.setLocalStream === 'function') {
        peerRef.setLocalStream(localStream);
      }
      updateLocalBindings();
      syncStreamState();
    };

    const mapMediaError = async (error) => {
      const name = error?.name || error?.code || 'UnknownError';
      if (name === 'NotAllowedError' || name === 'PermissionDeniedError') {
        const blockedCamera = await isPermissionPermanentlyDenied('camera');
        const blockedMicrophone = await isPermissionPermanentlyDenied('microphone');
        if (blockedCamera || blockedMicrophone) {
        return {
          status: 'blocked',
          message: 'Доступ к камере или микрофону заблокирован. Разрешите его в настройках браузера.'
        };
        }
        return {
          status: 'denied',
          message: 'Доступ к камере или микрофону был отклонён. Разрешите его, чтобы продолжить.'
        };
      }
      if (name === 'NotFoundError' || name === 'DevicesNotFoundError') {
        return {
          status: 'not-found',
          message: 'Камера или микрофон не найдены.'
        };
      }
      if (name === 'NotReadableError' || name === 'TrackStartError') {
        return {
          status: 'device-error',
          message: 'Камера или микрофон не работают. Проверьте устройство и попробуйте снова.'
        };
      }
      return {
        status: 'error',
        message: 'Не удалось получить доступ к медиаустройствам.'
      };
    };

    const displayNotification = (mapped) => {
      if (!mapped || !mapped.message) {
        return;
      }
      const severity = mapped.status === 'error' || mapped.status === 'device-error' ? 'error' : 'warn';
      const notifier = typeof toastNotifier?.[severity] === 'function' ? toastNotifier[severity] : null;
      if (notifier) {
        notifier.call(toastNotifier, mapped.message);
      }
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
      setTypeState('video', 'initializing');
      setTypeState('audio', 'initializing');
      if (!navigatorRef?.mediaDevices || typeof navigatorRef.mediaDevices.enumerateDevices !== 'function') {
        this.stopLocalStream();
        setLocalStreamInternal(null);
        setStatus('warning', 'Этот браузер не поддерживает медиаустройства.');
        warningActive = true;
        setAllUnsupported();
        return { status: 'unsupported', message: 'Этот браузер не поддерживает медиаустройства.' };
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
          setStatus('warning', 'Камера или микрофон не найдены.');
          warningActive = true;
          setAllOff();
          return { status: 'not-found', message: 'Камера или микрофон не найдены.' };
        }

        const stream = await navigatorRef.mediaDevices.getUserMedia(constraints);
        if (localStream && localStream !== stream) {
          this.stopLocalStream();
        }
        setLocalStreamInternal(stream);
        let successMessage = 'Камера и микрофон готовы.';
        if (constraints.audio && !constraints.video) {
          successMessage = 'Микрофон готов. Камера не найдена.';
        } else if (!constraints.audio && constraints.video) {
          successMessage = 'Камера готова. Микрофон не найден.';
        } else if (!constraints.audio && !constraints.video) {
          successMessage = 'Доступ к медиа подтверждён.';
        }
        setStatus('success', successMessage);
        if (warningActive && typeof toastNotifier.success === 'function') {
          toastNotifier.success('Камера снова активна.');
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
        applyErrorState(mapped.status);
        displayNotification(mapped);
        return mapped;
      }
    };

    this.toggleMedia = async () => {
      const currentStream = localStream;
      if (!currentStream || currentStream.getTracks().length === 0) {
        await this.prepare();
        return { state: 'enabled' };
      }
      const tracks = currentStream.getTracks();
      const isActive = tracks.some((track) => track.enabled);
      const nextState = !isActive;
      tracks.forEach((track) => {
        try {
          track.enabled = nextState;
        } catch (error) {
          console.warn('[MediaManager] Failed to toggle track', error);
        }
      });
      if (nextState) {
        setStatus('success', 'Камера и микрофон включены.');
      } else {
        setStatus('warning', 'Камера и микрофон отключены.');
      }
      syncStreamState();
      return { state: nextState ? 'enabled' : 'disabled' };
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
  }
}
