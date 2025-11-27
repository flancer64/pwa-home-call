/**
 * @module HomeCall_Web_Ui_Templates_Loader
 * @description Loads and caches HTML templates for Svyazist screens.
 */

const TEMPLATE_PATHS = new Map([
  ['home', 'ui/screen/home.html'],
  ['settings', 'ui/screen/settings.html'],
  ['invite', 'ui/screen/invite.html'],
  ['call', 'ui/screen/call.html'],
  ['end', 'ui/screen/end.html']
]);

export default class HomeCall_Web_Ui_Templates_Loader {
  /**
   * @param {Object} deps
   * @param {HomeCall_Web_Env_Provider} deps.HomeCall_Web_Env_Provider$
   */
  constructor({ HomeCall_Web_Env_Provider$: env } = {}) {
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

    // expose public methods
    this.loadAll = loadAll;
    this.get = get;
    this.apply = apply;
  }
}
