import path from 'node:path';
import { fileURLToPath } from 'node:url';

async function loadContainerCtor() {
  try {
    const mod = await import('https://cdn.jsdelivr.net/npm/@teqfw/di@latest/+esm');
    return mod.default;
  } catch (error) {
    const local = await import('@teqfw/di');
    return local.default;
  }
}

export async function createWebContainer() {
  const Container = await loadContainerCtor();
  const container = new Container();
  const resolver = container.getResolver();
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const webRoot = path.resolve(__dirname, '../../web/app');
  resolver.addNamespaceRoot('HomeCall_Web_', webRoot, 'mjs');
  container.enableTestMode?.();
  return container;
}
