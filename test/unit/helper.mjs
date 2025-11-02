/**
 * @module test.unit.helper
 * @description Helper to create a clean @teqfw/di container for unit tests.
 */

import { Container } from '@teqfw/di';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Create and configure a clean DI container for tests.
 * @returns {Promise<import('@teqfw/di').Container>}
 */
export async function createTestContainer() {
    const container = new Container();
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const srcRoot = path.resolve(__dirname, '../../src');
    await container.registerNamespaceRoot('HomeCall_', srcRoot);
    return container;
}
