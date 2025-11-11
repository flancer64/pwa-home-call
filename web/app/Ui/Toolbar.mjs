/**
 * @module HomeCall_Web_Ui_Toolbar
 * @description Renders toolbar indicators for camera and microphone statuses.
 */

const STATE_CLASS = {
  ready: 'ok',
  paused: 'paused',
  blocked: 'blocked',
  unsupported: 'unsupported',
  off: 'off'
};

const ICON_MAP = {
  video: {
    ready: 'camera.svg',
    paused: 'camera-off.svg',
    blocked: 'alert-triangle.svg',
    unsupported: 'slash.svg',
    off: 'help-circle.svg'
  },
  audio: {
    ready: 'mic.svg',
    paused: 'mic-off.svg',
    blocked: 'alert-triangle.svg',
    unsupported: 'slash.svg',
    off: 'help-circle.svg'
  }
};

const EVENTS = ['Off', 'Ready', 'Paused', 'Blocked', 'Unsupported'];

const TYPE_LABEL = {
  video: 'Video',
  audio: 'Audio'
};

export default class HomeCall_Web_Ui_Toolbar {
  constructor({ HomeCall_Web_State_Media$: mediaState, HomeCall_Web_Env_Provider$: env } = {}) {
    if (!mediaState) {
      throw new Error('Media state is required for the toolbar.');
    }
    if (!env) {
      throw new Error('Environment provider is required for the toolbar.');
    }
    const documentRef = env.document;
    const state = mediaState;
    let initialized = false;
    const indicators = {
      video: null,
      audio: null
    };

    const createImage = (type) => {
      if (!documentRef) {
        return null;
      }
      const image = documentRef.createElement('img');
      image.alt = TYPE_LABEL[type];
      return image;
    };

    const update = (type, currentState) => {
      const element = indicators[type];
      if (!element) {
        return;
      }
      const normalizedClass = STATE_CLASS[currentState] ?? STATE_CLASS.off;
      element.className = `media-indicator ${normalizedClass}`;
      const iconName = ICON_MAP[type][currentState] ?? ICON_MAP[type].off;
      let image = element.querySelector('img');
      if (!image) {
        image = createImage(type);
        if (image) {
          element.appendChild(image);
        }
      }
      if (!image) {
        return;
      }
      image.src = `assets/icons/${iconName}`;
      image.alt = TYPE_LABEL[type];
    };

    const bindStateEvents = () => {
      ['video', 'audio'].forEach((type) => {
        EVENTS.forEach((suffix) => {
          const methodName = `on${type[0].toUpperCase() + type.slice(1)}${suffix}`;
          const subscriber = state[methodName];
          if (typeof subscriber !== 'function') {
            return;
          }
          subscriber.call(state, (_, __, next) => {
            update(type, next);
          });
        });
      });
    };

    this.init = () => {
      if (initialized) {
        return;
      }
      initialized = true;
      if (!documentRef) {
        return;
      }
      indicators.video = documentRef.getElementById('toolbar-indicator-video');
      indicators.audio = documentRef.getElementById('toolbar-indicator-audio');
      bindStateEvents();
      const snapshot = state.get();
      update('video', snapshot.video);
      update('audio', snapshot.audio);
    };
  }
}
