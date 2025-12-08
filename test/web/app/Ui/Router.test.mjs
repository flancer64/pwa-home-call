import test from 'node:test';
import assert from 'node:assert/strict';
import HomeCall_Web_Ui_Router from '../../../../web/app/Ui/Router.mjs';

const makeControllerFactory = () => {
  const records = [];
  let lastStream = null;

  return {
    create() {
      return {
        mount({ params }) {
          records.push({ type: 'mount', params });
        },
        unmount() {
          records.push({ type: 'unmount' });
        },
        updateRemoteStream(stream) {
          lastStream = stream;
          records.push({ type: 'stream', stream });
        }
      };
    },
    getRecords: () => records,
    getLastStream: () => lastStream
  };
};

const createEnvironment = () => {
  const handlers = {};
  const location = {
    _hash: '#/home',
    get hash() {
      return this._hash;
    },
    set hash(value) {
      this._hash = value;
    }
  };
  const windowRef = {
    location,
    addEventListener(event, callback) {
      handlers[event] = callback;
    }
  };
  const root = { innerHTML: '', lastTemplate: null };
  const documentRef = {
    getElementById(id) {
      return id === 'app' ? root : null;
    }
  };
  return { windowRef, documentRef, handlers, location, root };
};

const createRouter = () => {
  const controllers = {
    home: makeControllerFactory(),
    call: makeControllerFactory(),
    end: makeControllerFactory(),
    'not-found': makeControllerFactory()
  };
  const templateLoader = {
    apply(name, container) {
      container.lastTemplate = name;
    }
  };
  const settingsScreen = {
    show() {}
  };
  const env = createEnvironment();
  const routeConfig = {
    home: {
      template: 'home',
      controllerFactory: controllers.home,
      initial: true
    },
    call: {
      template: 'call',
      controllerFactory: controllers.call,
      segmentParams: ['sessionId']
    },
    end: {
      template: 'end',
      controllerFactory: controllers.end
    },
    'not-found': {
      template: 'not-found',
      controllerFactory: controllers['not-found'],
      fallback: true
    }
  };
  const defaultParams = {
    home: { onStartCall: () => {}, onOpenSettings: () => {} },
    call: {
      sessionId: null,
      remoteStream: null,
      onEnd: () => {},
      onOpenSettings: () => {}
    },
    end: {
      connectionMessage: 'Звонок завершён.',
      onReturn: () => {}
    },
    'not-found': {
      onReturn: () => {}
    }
  };
  const router = HomeCall_Web_Ui_Router({
    HomeCall_Web_Ui_Templates_Loader$: templateLoader,
    HomeCall_Web_Ui_Router_Config$: { routeConfig, defaultParams },
    HomeCall_Web_Ui_Screen_Settings$: settingsScreen,
    HomeCall_Web_Env_Provider$: {
      window: env.windowRef,
      document: env.documentRef
    },
    HomeCall_Web_Logger$: { warn() {} }
  });
  return { router, env, controllers, templateLoader, settingsScreen, root: env.root };
};

test('resolve extracts navigation name and parameters', () => {
  const { router } = createRouter();
  const route = router.resolve('#/call/session-xyz');
  assert.strictEqual(route.name, 'call');
  assert.strictEqual(route.params.sessionId, 'session-xyz');
});

test('router navigates, updates hash, and mounts fallback when needed', async () => {
  const { router, env, controllers, root } = createRouter();
  await router.init(root);
  assert.strictEqual(root.lastTemplate, 'home');

  env.handlers.hashchange?.();
  env.windowRef.location.hash = '#/missing';
  env.handlers.hashchange?.();
  assert.strictEqual(root.lastTemplate, 'not-found');

  router.navigate('call', { sessionId: 'abc' });
  assert.strictEqual(env.windowRef.location.hash, '#/call/abc');
  router.updateRemoteStream('stream-object');
  assert.strictEqual(controllers.call.getLastStream(), 'stream-object');
});
