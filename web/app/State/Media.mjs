/**
 * @module HomeCall_Web_State_Media
 * @description
 * Declarative TeqFW-style state object that tracks independent lifecycle
 * of video and audio media devices. Private data is hidden in module closure.
 */

const priv = new WeakMap();

/**
 * @private
 * Handles controlled transition for the given medium and notifies listeners.
 * @param {HomeCall_Web_State_Media} instance
 * @param {'video'|'audio'} type
 * @param {string} next
 * @param {any} [params]
 */
function transition(instance, type, next, params) {
    const data = priv.get(instance);
    if (!data) throw new Error('Invalid media state instance');
    const current = data.state[type];
    if (current === next) return;
    data.state[type] = next;
    const listeners = data.listeners[type][next];
    for (const fn of listeners) {
        try {
            fn(params, current, next);
        } catch (e) {
            console.error('[MediaState] Listener failed', e);
        }
    }
}

export default class HomeCall_Web_State_Media {
    /**
     * @param {object} deps - Dependencies injected by DI container (not used).
     */
    constructor(deps = {}) {
        const props = {
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
        priv.set(this, props);
    }

    /**
     * Initializes both sub-states.
     * @param {string} [video='off']
     * @param {string} [audio='off']
     */
    initState(video = 'off', audio = 'off') {
        const data = priv.get(this);
        data.state.video = video;
        data.state.audio = audio;
    }

    /**
     * Returns current snapshot of both sub-states.
     * @returns {{video: string, audio: string}}
     */
    get() {
        const data = priv.get(this);
        return { ...data.state };
    }

    /* ---------- VIDEO setters ---------- */
    setVideoOff(params) { transition(this, 'video', 'off', params); }
    setVideoInitializing(params) { transition(this, 'video', 'initializing', params); }
    setVideoReady(params) { transition(this, 'video', 'ready', params); }
    setVideoPaused(params) { transition(this, 'video', 'paused', params); }
    setVideoBlocked(params) { transition(this, 'video', 'blocked', params); }
    setVideoUnsupported(params) { transition(this, 'video', 'unsupported', params); }

    /* ---------- AUDIO setters ---------- */
    setAudioOff(params) { transition(this, 'audio', 'off', params); }
    setAudioInitializing(params) { transition(this, 'audio', 'initializing', params); }
    setAudioReady(params) { transition(this, 'audio', 'ready', params); }
    setAudioPaused(params) { transition(this, 'audio', 'paused', params); }
    setAudioBlocked(params) { transition(this, 'audio', 'blocked', params); }
    setAudioUnsupported(params) { transition(this, 'audio', 'unsupported', params); }

    /* ---------- VIDEO listeners ---------- */
    onVideoOff(fn) { return subscribe(this, 'video', 'off', fn); }
    onVideoInitializing(fn) { return subscribe(this, 'video', 'initializing', fn); }
    onVideoReady(fn) { return subscribe(this, 'video', 'ready', fn); }
    onVideoPaused(fn) { return subscribe(this, 'video', 'paused', fn); }
    onVideoBlocked(fn) { return subscribe(this, 'video', 'blocked', fn); }
    onVideoUnsupported(fn) { return subscribe(this, 'video', 'unsupported', fn); }

    /* ---------- AUDIO listeners ---------- */
    onAudioOff(fn) { return subscribe(this, 'audio', 'off', fn); }
    onAudioInitializing(fn) { return subscribe(this, 'audio', 'initializing', fn); }
    onAudioReady(fn) { return subscribe(this, 'audio', 'ready', fn); }
    onAudioPaused(fn) { return subscribe(this, 'audio', 'paused', fn); }
    onAudioBlocked(fn) { return subscribe(this, 'audio', 'blocked', fn); }
    onAudioUnsupported(fn) { return subscribe(this, 'audio', 'unsupported', fn); }
}

/**
 * @private
 * Adds a listener for a given type/state pair.
 * @param {HomeCall_Web_State_Media} instance
 * @param {'video'|'audio'} type
 * @param {string} state
 * @param {(params?: any, from: string, to: string) => void} fn
 * @returns {() => void} unsubscribe function
 */
function subscribe(instance, type, state, fn) {
    if (typeof fn !== 'function') return () => { };
    const data = priv.get(instance);
    const list = data.listeners[type][state];
    list.add(fn);
    return () => list.delete(fn);
}
