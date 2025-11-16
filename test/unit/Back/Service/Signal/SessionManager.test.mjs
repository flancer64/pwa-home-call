/**
 * @module test.unit.Back.Service.Signal.SessionManager
 * @description Unit tests for HomeCall_Back_Service_Signal_SessionManager.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { createTestContainer } from '../../../helper.mjs';

const createMockSocket = () => ({ send: () => {} });

describe('HomeCall_Back_Service_Signal_SessionManager', () => {
    it('tracks participants inside sessions and exposes peers', async () => {
        const container = await createTestContainer();
        const manager = await container.get('HomeCall_Back_Service_Signal_SessionManager$');

        const socketAlice = createMockSocket();
        const socketBob = createMockSocket();

        manager.register(socketAlice, 'session-a');
        manager.register(socketBob, 'session-a');

        assert.equal(manager.getSessionId(socketAlice), 'session-a');
        const peers = manager.getPeers('session-a', socketAlice);
        assert.equal(peers.length, 1);
        assert.strictEqual(peers[0], socketBob);
        const socketCharlie = createMockSocket();
        assert.throws(
            () => manager.register(socketCharlie, 'session-a'),
            /already has 2 participants/
        );

        manager.deregister(socketAlice);
        assert.equal(manager.getPeers('session-a', socketBob).length, 0);
    });
});
