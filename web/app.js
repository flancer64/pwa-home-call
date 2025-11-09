import Container from 'https://cdn.jsdelivr.net/npm/@teqfw/di@latest/+esm';

(async () => {
  /** @type {TeqFw_Di_Container} */
  const container = new Container();
  const resolver = container.getResolver();

  // Determine base URL relative to this script
  const baseUrl = new URL('./', import.meta.url).href;
  resolver.addNamespaceRoot('HomeCall_Web_', `${baseUrl}app/`, 'mjs');

  const app = await container.get('HomeCall_Web_Core_App$');
  await app.run();
})()
