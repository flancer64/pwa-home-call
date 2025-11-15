/**
 * @module HomeCall_Web_Ui_Screen_Call
 * @description Renders the active call screen with media status indicators.
 */
export default class HomeCall_Web_Ui_Screen_Call {
    constructor({ HomeCall_Web_Ui_Templates_Loader$: templates, HomeCall_Web_Media_Manager$: media, HomeCall_Web_State_Media$: mediaState } = {}) {
        if (!templates) {
            throw new Error('Template loader is required for the call screen.');
        }
        if (!media) {
            throw new Error('Media manager is required for the call screen.');
        }
        if (!mediaState) {
            throw new Error('Media state tracker is required for the call screen.');
        }
        this.templates = templates;
        this.media = media;
        this.mediaState = mediaState;

        const context = {
            remoteVideo: null,
            indicatorRefs: null,
            statusMessage: 'Камера и микрофон готовятся.',
            unsubscribe: null
        };

        this.show = ({ container, remoteStream, onEnd } = {}) => {
            if (!container) {
                return;
            }
            if (typeof context.unsubscribe === 'function') {
                context.unsubscribe();
                context.unsubscribe = null;
            }

            this.templates.apply('call', container);
            const remoteVideo = container.querySelector('#remote-video');
            const localVideo = container.querySelector('#local-video');
            const noMedia = container.querySelector('#no-media');
            const endButton = container.querySelector('#end-call');
            const retryButton = container.querySelector('#retry-media');
            const detailMessage = container.querySelector('#media-detail');
            const cameraIndicator = container.querySelector('[data-device="camera"]');
            const microphoneIndicator = container.querySelector('[data-device="microphone"]');
            const cameraStateLabel = container.querySelector('#camera-state');
            const microphoneStateLabel = container.querySelector('#microphone-state');
            context.indicatorRefs = {
                cameraIndicator,
                microphoneIndicator,
                cameraStateLabel,
                microphoneStateLabel
            };

            context.remoteVideo = remoteVideo ?? null;
            this.media.bindLocalElements({
                video: localVideo ?? null,
                message: noMedia ?? null,
                retry: retryButton ?? null
            });
            if (remoteStream) {
                this.updateRemoteStream(remoteStream);
            }
            endButton?.addEventListener('click', () => onEnd?.());

            const renderStates = () => {
                const snapshot = this.mediaState.get();
                const refs = context.indicatorRefs ?? {};
                this.updateIndicator(refs.cameraIndicator, snapshot.video, refs.cameraStateLabel);
                this.updateIndicator(refs.microphoneIndicator, snapshot.audio, refs.microphoneStateLabel);
                if (detailMessage && context.statusMessage) {
                    detailMessage.textContent = context.statusMessage;
                }
                if (retryButton) {
                    if (snapshot.video === 'blocked') {
                        retryButton.removeAttribute('hidden');
                    } else {
                        retryButton.setAttribute('hidden', '');
                    }
                }
            };

            const unsubscribe = this.media.onStatusChange((status) => {
                context.statusMessage = status?.message ?? '';
                if (detailMessage && context.statusMessage) {
                    detailMessage.textContent = context.statusMessage;
                }
                renderStates();
            });
            context.unsubscribe = unsubscribe;
            renderStates();

            retryButton?.addEventListener('click', () => {
                this.media.prepare().catch(() => { });
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

    updateIndicator(element, state, labelElement) {
        if (!element || !labelElement) {
            return;
        }
        element.dataset.state = state ?? 'unknown';
        labelElement.textContent = this.describeState(state);
    }

    describeState(state) {
        switch (state) {
            case 'ready':
                return 'Готово';
            case 'initializing':
                return 'Подготовка';
            case 'paused':
                return 'Приостановлено';
            case 'blocked':
                return 'Заблокировано';
            case 'unsupported':
                return 'Не поддерживается';
            case 'off':
                return 'Отключено';
            default:
                return 'Ожидание';
        }
    }
}
