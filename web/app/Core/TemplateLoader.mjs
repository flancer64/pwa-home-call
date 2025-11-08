/**
 * @module HomeCall_Web_Core_TemplateLoader
 * @description Loads and caches HTML templates for HomeCall screens.
 */

const TEMPLATE_PATHS = new Map([
  ['enter', 'ui/enter.html'],
  ['lobby', 'ui/lobby.html'],
  ['call', 'ui/call.html'],
  ['end', 'ui/end.html']
]);

export default class HomeCall_Web_Core_TemplateLoader {
  /**
   * @param {Object} deps
   * @param {typeof fetch} [deps.fetch]
   */
  constructor({ 'fetch$': fetchSingleton } = {}) {
    this.fetch = fetchSingleton ?? globalThis.fetch;
    this.cache = new Map();
    if (typeof this.fetch !== 'function') {
      throw new Error('Fetch API is not available.');
    }
  }

  /**
   * Load all templates defined in TEMPLATE_PATHS.
   * @returns {Promise<void>}
   */
  async loadAll() {
    await Promise.all(
      Array.from(TEMPLATE_PATHS.entries(), async ([name, path]) => {
        const response = await this.fetch(path, { cache: 'no-store' });
        const html = await response.text();
        this.cache.set(name, html);
      })
    );
  }

  /**
   * Get template HTML by name.
   * @param {string} name
   * @returns {string}
   */
  get(name) {
    if (!this.cache.has(name)) {
      throw new Error(`Template "${name}" is not loaded.`);
    }
    return this.cache.get(name);
  }

  /**
   * Render template into container.
   * @param {string} name
   * @param {Element} container
   */
  apply(name, container) {
    if (!container) {
      return;
    }
    container.innerHTML = this.get(name);
  }
}
