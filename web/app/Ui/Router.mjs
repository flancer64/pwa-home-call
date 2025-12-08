/**
 * @module HomeCall_Web_Ui_Router
 * @description Coordinates hash-based navigation and mounts screen controllers.
 */
export default function HomeCall_Web_Ui_Router({
  HomeCall_Web_Ui_Templates_Loader$: templates,
  HomeCall_Web_Ui_Router_Config$: routerConfig,
  HomeCall_Web_Ui_Screen_Settings$: settingsScreen,
  HomeCall_Web_Env_Provider$: env,
  HomeCall_Web_Logger$: logger
} = {}) {
  const templateLoader = templates;
  const windowRef = env?.window ?? null;
  const documentRef = env?.document ?? null;
  const config = routerConfig ?? {};
  let routeConfig = {};
  let defaultParams = {};

  let routeEntries = [];
  let routeLookup = new Map();
  let fallbackEntry = null;
  let initialEntry = null;

  const createRouteEntries = () =>
    Object.entries(routeConfig)
      .map(([name, descriptor]) => {
        if (!name || !descriptor || typeof descriptor !== 'object') {
          return null;
        }
        return {
          normalized: name.toLowerCase(),
          name,
          descriptor
        };
      })
      .filter(Boolean);

  const rebuildRoutes = () => {
    routeEntries = createRouteEntries();
    routeLookup = new Map(routeEntries.map((entry) => [entry.normalized, entry]));
    fallbackEntry = routeEntries.find((entry) => Boolean(entry.descriptor?.fallback)) ?? routeEntries[0] ?? null;
    initialEntry = routeEntries.find((entry) => Boolean(entry.descriptor?.initial)) ?? routeEntries[0] ?? null;
  };

  const updateFromConfig = () => {
    if (typeof config.getSnapshot === 'function') {
      const snapshot = config.getSnapshot() ?? {};
      routeConfig = snapshot.routeConfig ?? {};
      defaultParams = snapshot.defaultParams ?? {};
    } else {
      routeConfig = config.routeConfig ?? {};
      defaultParams = config.defaultParams ?? {};
    }
    rebuildRoutes();
  };

  updateFromConfig();
  if (typeof config.subscribe === 'function') {
    config.subscribe(updateFromConfig);
  }

  const noop = () => {};
  let rootElement = null;
  let currentController = null;
  let initialized = false;
  let skipNextHash = false;

  const logWarning = (message, details) => {
    if (typeof logger?.warn === 'function') {
      logger.warn(`[Router] ${message}`, details);
    }
  };

  const ensureRoot = () => {
    if (rootElement) {
      return rootElement;
    }
    const target = documentRef?.getElementById('app') ?? null;
    if (!target) {
      throw new Error('Router requires a DOM container with id "app".');
    }
    rootElement = target;
    return rootElement;
  };

  const instantiateController = (factory) => {
    if (!factory) {
      return null;
    }
    if (typeof factory.create === 'function') {
      return factory.create();
    }
    if (typeof factory === 'function') {
      return factory();
    }
    return null;
  };

  const mergeParams = (name, params = {}) => {
    const defaults = defaultParams[name] ?? {};
    return { ...defaults, ...params };
  };

  const extractParamsFromSegments = (descriptor, segments = []) => {
    const params = {};
    if (!descriptor || !Array.isArray(descriptor.segmentParams)) {
      return params;
    }
    descriptor.segmentParams.forEach((paramName, index) => {
      const value = segments[index];
      if (value === undefined) {
        return;
      }
      try {
        params[paramName] = decodeURIComponent(value);
      } catch (error) {
        params[paramName] = value;
      }
    });
    return params;
  };

  const getEntry = (name) => {
    if (!name) {
      return null;
    }
    return routeLookup.get(name.toLowerCase()) ?? null;
  };

  const buildHashForRoute = (name, params = {}) => {
    const entry = getEntry(name) ?? initialEntry ?? fallbackEntry;
    const descriptor = entry?.descriptor;
    const routeName = entry?.name ?? name ?? '';
    if (!descriptor || !routeName.trim()) {
      return '#/';
    }
    const segments = [routeName];
    if (Array.isArray(descriptor.segmentParams)) {
      descriptor.segmentParams.forEach((paramName) => {
        const rawValue = params[paramName];
        if (rawValue === undefined || rawValue === null) {
          return;
        }
        const value = typeof rawValue === 'string' ? rawValue : String(rawValue);
        if (!value) {
          return;
        }
        segments.push(encodeURIComponent(value));
      });
    }
    return '#/' + segments.join('/');
  };

  const resolve = (hash = windowRef?.location?.hash ?? '') => {
    const cleaned = (hash ?? '').replace(/^#\/?/, '');
    const segments = cleaned.split('/').filter(Boolean);
    const nameSegment = segments.shift() ?? '';
    const matchedEntry = getEntry(nameSegment);
    if (matchedEntry) {
      return {
        name: matchedEntry.name,
        params: extractParamsFromSegments(matchedEntry.descriptor, segments)
      };
    }
    if (!nameSegment && initialEntry) {
      const initialParams = extractParamsFromSegments(initialEntry.descriptor, segments);
      return { name: initialEntry.name, params: initialParams };
    }
    if (fallbackEntry) {
      return { name: fallbackEntry.name, params: {} };
    }
    return { name: nameSegment || '', params: {} };
  };

  const unmountScreen = () => {
    if (currentController?.unmount) {
      try {
        currentController.unmount();
      } catch (error) {
        logWarning('Failed to unmount screen controller.', error);
      }
    }
    currentController = null;
  };

  const mountScreen = (name, params = {}) => {
    const entry = getEntry(name) ?? fallbackEntry;
    if (!entry) {
      logWarning(`Route "${name}" is not configured.`);
      return;
    }
    const descriptor = entry.descriptor;
    const container = ensureRoot();
    const payload = mergeParams(entry.name, params);
    const routeParams = ensureFallbackReturn(entry, payload);
    unmountScreen();
    if (!descriptor.template) {
      logWarning(`Route "${entry.name}" does not declare a template.`);
      return;
    }
    templateLoader.apply(descriptor.template, container);
    const controller = instantiateController(descriptor.controllerFactory);
    if (!controller || typeof controller.mount !== 'function') {
      logWarning(`Controller for route "${entry.name}" is not mountable.`);
      return;
    }
    try {
      controller.mount({ container, params: routeParams });
      currentController = controller;
    } catch (error) {
      logWarning(`Controller for "${entry.name}" failed to mount.`, error);
    }
  };

  const handleHashChange = () => {
    if (skipNextHash) {
      skipNextHash = false;
      return;
    }
    const hashValue = windowRef?.location?.hash ?? '';
    const route = resolve(hashValue);
    mountScreen(route.name, route.params);
  };

  const goToRoot = () => {
    const locationRef = windowRef?.location ?? (typeof window !== 'undefined' ? window.location : null);
    if (locationRef) {
      locationRef.assign('/');
    }
  };

  const navigate = (routeArg = {}, extraParams) => {
    const input = typeof routeArg === 'string' ? { name: routeArg } : { ...routeArg };
    const targetName = input.name ?? initialEntry?.name ?? fallbackEntry?.name ?? '';
    const entry = getEntry(targetName) ?? fallbackEntry ?? initialEntry;
    const normalizedName = entry?.name ?? targetName;
    const payload = extraParams && typeof extraParams === 'object' ? extraParams : input.params ?? {};
    const hash = buildHashForRoute(normalizedName, payload);
    if (windowRef?.location && windowRef.location.hash !== hash) {
      skipNextHash = true;
      windowRef.location.hash = hash;
    }
    mountScreen(normalizedName, payload);
  };

  function ensureFallbackReturn(entry, payload = {}) {
    if (!entry?.descriptor?.fallback) {
      return payload;
    }
    if (typeof payload.onReturn === 'function') {
      return payload;
    }
    return { ...payload, onReturn: goToRoot };
  }

  const updateRemoteStream = (stream) => {
    currentController?.updateRemoteStream?.(stream);
  };

  const showSettings = ({ onClose } = {}) => {
    if (typeof settingsScreen?.show !== 'function') {
      return;
    }
    settingsScreen.show({
      container: ensureRoot(),
      onClose: typeof onClose === 'function' ? onClose : undefined
    });
  };

  const init = async (container) => {
    if (container) {
      rootElement = container;
    } else {
      ensureRoot();
    }
    if (initialized) {
      return;
    }
    initialized = true;
    windowRef?.addEventListener('hashchange', handleHashChange);
    handleHashChange();
  };

  return {
    init,
    resolve,
    navigate,
    mountScreen,
    unmountScreen,
    updateRemoteStream,
    showSettings
  };
}
