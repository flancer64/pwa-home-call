/**
 * @module test.unit.Back.Service.Signal.RoomManager
 * @description Unit tests for HomeCall_Back_Service_Signal_RoomManager.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { createTestContainer } from '../../../helper.mjs';

const createMockSocket = () => ({
    send: () => {},
});

describe('HomeCall_Back_Service_Signal_RoomManager', () => {
    it('tracks participants inside rooms', async () => {
        const container = await createTestContainer();
        const manager = await container.get('HomeCall_Back_Service_Signal_RoomManager$');

        const socketAlice = createMockSocket();
        const socketBob = createMockSocket();

        manager.join('family', 'alice', socketAlice);
        manager.join('family', 'bob', socketBob);

        assert.deepEqual(manager.list('family'), ['alice', 'bob']);
        assert.equal(manager.getSocket('family', 'alice'), socketAlice);
        assert.equal(manager.getSocket('family', 'bob'), socketBob);

        manager.leave('family', 'alice');
        assert.deepEqual(manager.list('family'), ['bob']);
        assert.equal(manager.getSocket('family', 'alice'), undefined);

        manager.leave('family', 'bob');
        assert.deepEqual(manager.list('family'), []);
    });
});
