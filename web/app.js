import Container from 'https://cdn.jsdelivr.net/npm/@teqfw/di@latest/+esm';

(async () => {
  /** @type {TeqFw_Di_Container} */
  const container = new Container();
  const resolver = container.getResolver();
  resolver.addNamespaceRoot('HomeCall_Web_', '/app/', 'mjs');

  container.register('window$', window);
  container.register('document$', document);
  container.register('navigator$', navigator);
  container.register('fetch$', fetch);
  container.register('setInterval$', setInterval);
  container.register('clearInterval$', clearInterval);
  container.register('WebSocket$', WebSocket);

  const app = await container.get('HomeCall_Web_Core_App$');
  await app.run();
})();
