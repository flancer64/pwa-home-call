/**
 * @module test.unit.Back.App
 * @description Unit tests for HomeCall_Back_App module.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { createTestContainer } from '../helper.mjs';

describe('HomeCall_Back_App', () => {
    it('logs lifecycle messages through injected logger', async () => {
        const container = await createTestContainer();
        container.enableTestMode();

        const calls = [];
        const mockLogger = Object.freeze({
            info: (namespace, message) => {
                calls.push({ method: 'info', namespace, message });
            },
            error: () => {
                throw new Error('error() should not be called in this scenario.');
            },
        });
        container.register('HomeCall_Back_Contract_Logger$', mockLogger);

        const app = await container.get('HomeCall_Back_App$');
        await app.run();
        await app.stop();

        assert.deepEqual(calls, [
            { method: 'info', namespace: 'HomeCall_Back_App', message: 'HomeCall backend started.' },
            { method: 'info', namespace: 'HomeCall_Back_App', message: 'HomeCall backend stopped.' },
        ]);
    });
});
