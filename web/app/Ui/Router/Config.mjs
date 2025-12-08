/**
 * @module HomeCall_Web_Ui_Router_Config
 * @description Stores route descriptors and default params, exposing hooks for incremental registration.
 */
export default function HomeCall_Web_Ui_Router_Config({
  HomeCall_Web_Ui_Screen_Home$: homeScreen,
  HomeCall_Web_Ui_Screen_Call$: callScreen,
  HomeCall_Web_Ui_Screen_End$: endScreen,
  HomeCall_Web_Ui_Screen_NotFound$: notFoundScreen
} = {}) {
  const routeDescriptors = new Map();
  const paramsMap = new Map();
  const listeners = new Set();

  const toObject = (map) => {
    const result = {};
    for (const [key, value] of map.entries()) {
      result[key] = value;
    }
    return result;
  };

  const getSnapshot = () => ({
    routeConfig: toObject(routeDescriptors),
    defaultParams: toObject(paramsMap)
  });

  const notify = () => {
    const snapshot = getSnapshot();
    listeners.forEach((listener) => listener(snapshot));
  };

  const registerRoute = (descriptor) => {
    if (!descriptor || typeof descriptor !== 'object' || !descriptor.name) {
      return;
    }
    routeDescriptors.set(descriptor.name, descriptor);
    notify();
  };

  const registerRoutes = (descriptors = []) => {
    descriptors.forEach(registerRoute);
  };

  const setDefaultParams = (name, params = {}) => {
    if (!name) {
      return;
    }
    paramsMap.set(name, params);
    notify();
  };

  const subscribe = (listener) => {
    if (typeof listener !== 'function') {
      return () => {};
    }
    listeners.add(listener);
    return () => listeners.delete(listener);
  };

  const baseRoutes = [
    {
      name: 'home',
      template: 'home',
      controllerFactory: homeScreen,
      initial: true
    },
    {
      name: 'call',
      template: 'call',
      controllerFactory: callScreen,
      segmentParams: ['sessionId']
    },
    {
      name: 'end',
      template: 'end',
      controllerFactory: endScreen
    },
    {
      name: 'not-found',
      template: 'not-found',
      controllerFactory: notFoundScreen,
      fallback: true
    }
  ];

  registerRoutes(baseRoutes);

  return {
    registerRoute,
    registerRoutes,
    setDefaultParams,
    getSnapshot,
    subscribe
  };
}
