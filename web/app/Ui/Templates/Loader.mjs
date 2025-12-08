/**
 * @module HomeCall_Web_Ui_Templates_Loader
 * @description Loads and caches HTML templates for Svyazist screens.
 */

const TEMPLATE_PATHS = new Map([
  ['home', 'ui/screens/home.html'],
  ['call', 'ui/screens/call.html'],
  ['end', 'ui/screens/end.html'],
  ['not-found', 'ui/screens/not-found.html'],
  ['settings', 'ui/screen/settings.html']
]);

export default function HomeCall_Web_Ui_Templates_Loader({ HomeCall_Web_Env_Provider$: env } = {}) {
  if (!env) throw new Error('Svyazist environment provider is required.');
  if (typeof env.fetch !== 'function') throw new Error('Fetch API is not available.');

  const cache = new Map();

  const loadAll = async function () {
    await Promise.all(
      Array.from(TEMPLATE_PATHS.entries(), async ([name, path]) => {
        const response = await env.fetch(path, { cache: 'no-store' });
        const html = await response.text();
        cache.set(name, html);
      })
    );
  };

  const get = function (name) {
    if (!cache.has(name)) throw new Error(`Template "${name}" is not loaded.`);
    return cache.get(name);
  };

  const apply = function (name, container) {
    if (!container) return;
    container.innerHTML = get(name);
  };

  return {
    loadAll,
    get,
    apply
  };
}
