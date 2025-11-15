/**
 * @module HomeCall_Web_State_Media
 * @description
 * Declarative TeqFW-style state object that tracks independent lifecycle
 * of video and audio media devices. Private data is hidden in module closure.
 */

/**
 * @private
 * Handles controlled transition for the given medium and notifies listeners.
 * @param {object} context
 * @param {'video'|'audio'} type
 * @param {string} next
 * @param {any} [params]
 */
function transition(context, type, next, params) {
    const current = context.state[type];
    if (current === next) return;
    context.state[type] = next;
    const listeners = context.listeners[type][next];
    for (const fn of listeners) {
        try {
            fn(params, current, next);
        } catch (e) {
            console.error('[MediaState] Listener failed', e);
        }
    }
}

/**
 * @private
 * Adds a listener for a given type/state pair.
 * @param {object} context
 * @param {'video'|'audio'} type
 * @param {string} state
 * @param {(params?: any, from: string, to: string) => void} fn
 * @returns {() => void} unsubscribe function
 */
function subscribe(context, type, state, fn) {
    if (typeof fn !== 'function') return () => { };
    const list = context.listeners[type][state];
    list.add(fn);
    return () => list.delete(fn);
}

export default class HomeCall_Web_State_Media {
    /**
     * @param {object} deps - Dependencies injected by DI container (not used).
     */
    constructor(deps = {}) {
        const context = {
            state: {
                video: 'off',
                audio: 'off'
            },
            listeners: {
                video: {
                    off: new Set(),
                    initializing: new Set(),
                    ready: new Set(),
                    paused: new Set(),
                    blocked: new Set(),
                    unsupported: new Set()
                },
                audio: {
                    off: new Set(),
                    initializing: new Set(),
                    ready: new Set(),
                    paused: new Set(),
                    blocked: new Set(),
                    unsupported: new Set()
                }
            }
        };

        const createSetter = (type, state) => (params) => transition(context, type, state, params);
        const createListener = (type, state) => (fn) => subscribe(context, type, state, fn);

        this.initState = (video = 'off', audio = 'off') => {
            context.state.video = video;
            context.state.audio = audio;
        };

        this.get = () => ({ ...context.state });

        this.setVideoOff = createSetter('video', 'off');
        this.setVideoInitializing = createSetter('video', 'initializing');
        this.setVideoReady = createSetter('video', 'ready');
        this.setVideoPaused = createSetter('video', 'paused');
        this.setVideoBlocked = createSetter('video', 'blocked');
        this.setVideoUnsupported = createSetter('video', 'unsupported');

        this.setAudioOff = createSetter('audio', 'off');
        this.setAudioInitializing = createSetter('audio', 'initializing');
        this.setAudioReady = createSetter('audio', 'ready');
        this.setAudioPaused = createSetter('audio', 'paused');
        this.setAudioBlocked = createSetter('audio', 'blocked');
        this.setAudioUnsupported = createSetter('audio', 'unsupported');

        this.onVideoOff = createListener('video', 'off');
        this.onVideoInitializing = createListener('video', 'initializing');
        this.onVideoReady = createListener('video', 'ready');
        this.onVideoPaused = createListener('video', 'paused');
        this.onVideoBlocked = createListener('video', 'blocked');
        this.onVideoUnsupported = createListener('video', 'unsupported');

        this.onAudioOff = createListener('audio', 'off');
        this.onAudioInitializing = createListener('audio', 'initializing');
        this.onAudioReady = createListener('audio', 'ready');
        this.onAudioPaused = createListener('audio', 'paused');
        this.onAudioBlocked = createListener('audio', 'blocked');
        this.onAudioUnsupported = createListener('audio', 'unsupported');
    }
}
