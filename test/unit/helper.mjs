/**
 * @module test.unit.helper
 * @description Helper to create a clean @teqfw/di container for unit tests.
 */

import Container from '@teqfw/di';
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
    const diRoot = path.resolve(__dirname, '../../node_modules/@teqfw/di/src');
    const resolver = container.getResolver();
    resolver.addNamespaceRoot('HomeCall_', srcRoot);
    resolver.addNamespaceRoot('Teqfw_Di_', diRoot);
    const replacer = await container.get('Teqfw_Di_Pre_Replace$');
    const pre = container.getPreProcessor();
    pre.addChunk(replacer);
    replacer.add('HomeCall_Back_Contract_Logger', 'HomeCall_Back_Logger');
    const originalRegister = container.register.bind(container);
    container.register = (depId, obj) => {
        originalRegister(depId, obj);
        if (depId === 'HomeCall_Back_Contract_Logger$') {
            originalRegister('HomeCall_Back_Logger$', obj);
        }
    };
    return container;
}
