import Container from 'https://cdn.jsdelivr.net/npm/@teqfw/di@latest/+esm';

/**
 * @LLM-DOC: This IIFE isolates the startup logic to keep the global scope clean.
 * It initializes the DI container, registers namespace roots, and runs the App singleton.
 */
(async () => {
  /** @type {TeqFw_Di_Container} */
  const container = new Container();
  const resolver = container.getResolver();

  // Determine base URL relative to this script
  const baseUrl = new URL('./', import.meta.url).href;
  resolver.addNamespaceRoot('HomeCall_Web_', `${baseUrl}app/`, 'mjs');

  const app = await container.get('HomeCall_Web_App$');
  await app.run();
})()
