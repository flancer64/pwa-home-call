/**
 * @module HomeCall_Web_State_Media
 * @description
 * Declarative TeqFW-style state object that tracks independent lifecycle
 * of video and audio media devices. Private data is hidden in module closure.
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

function subscribe(context, type, state, fn) {
  if (typeof fn !== 'function') return () => {};
  const list = context.listeners[type][state];
  list.add(fn);
  return () => list.delete(fn);
}

export default function HomeCall_Web_State_Media(deps = {}) {
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

  const initState = (video = 'off', audio = 'off') => {
    context.state.video = video;
    context.state.audio = audio;
  };

  const get = () => Object.assign({}, context.state);

  const setVideoOff = createSetter('video', 'off');
  const setVideoInitializing = createSetter('video', 'initializing');
  const setVideoReady = createSetter('video', 'ready');
  const setVideoPaused = createSetter('video', 'paused');
  const setVideoBlocked = createSetter('video', 'blocked');
  const setVideoUnsupported = createSetter('video', 'unsupported');

  const setAudioOff = createSetter('audio', 'off');
  const setAudioInitializing = createSetter('audio', 'initializing');
  const setAudioReady = createSetter('audio', 'ready');
  const setAudioPaused = createSetter('audio', 'paused');
  const setAudioBlocked = createSetter('audio', 'blocked');
  const setAudioUnsupported = createSetter('audio', 'unsupported');

  const onVideoOff = createListener('video', 'off');
  const onVideoInitializing = createListener('video', 'initializing');
  const onVideoReady = createListener('video', 'ready');
  const onVideoPaused = createListener('video', 'paused');
  const onVideoBlocked = createListener('video', 'blocked');
  const onVideoUnsupported = createListener('video', 'unsupported');

  const onAudioOff = createListener('audio', 'off');
  const onAudioInitializing = createListener('audio', 'initializing');
  const onAudioReady = createListener('audio', 'ready');
  const onAudioPaused = createListener('audio', 'paused');
  const onAudioBlocked = createListener('audio', 'blocked');
  const onAudioUnsupported = createListener('audio', 'unsupported');

  return {
    initState,
    get,
    setVideoOff,
    setVideoInitializing,
    setVideoReady,
    setVideoPaused,
    setVideoBlocked,
    setVideoUnsupported,
    setAudioOff,
    setAudioInitializing,
    setAudioReady,
    setAudioPaused,
    setAudioBlocked,
    setAudioUnsupported,
    onVideoOff,
    onVideoInitializing,
    onVideoReady,
    onVideoPaused,
    onVideoBlocked,
    onVideoUnsupported,
    onAudioOff,
    onAudioInitializing,
    onAudioReady,
    onAudioPaused,
    onAudioBlocked,
    onAudioUnsupported
  };
}
