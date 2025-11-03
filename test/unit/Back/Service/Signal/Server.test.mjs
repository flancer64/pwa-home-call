/**
 * @module test.unit.Back.Service.Signal.Server
 * @description Integration-style unit tests for HomeCall_Back_Service_Signal_Server.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { WebSocket } from 'ws';
import { createTestContainer } from '../../../helper.mjs';

const waitForOpen = (socket, timeoutMs = 2000) => new Promise((resolve, reject) => {
    if (socket.readyState === WebSocket.OPEN) {
        resolve();
        return;
    }
    const timer = setTimeout(() => {
        cleanup();
        reject(new Error('Timed out while waiting for socket to open.'));
    }, timeoutMs);
    const cleanup = () => {
        clearTimeout(timer);
        socket.off('open', onOpen);
        socket.off('error', onError);
    };
    const onOpen = () => {
        cleanup();
        resolve();
    };
    const onError = (err) => {
        cleanup();
        reject(err);
    };
    socket.once('open', onOpen);
    socket.once('error', onError);
});

const waitForMessage = (socket, predicate, timeoutMs = 2000) => new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
        cleanup();
        reject(new Error('Timed out while waiting for WebSocket message.'));
    }, timeoutMs);
    const cleanup = () => {
        clearTimeout(timer);
        socket.off('message', onMessage);
    };
    const onMessage = (data) => {
        let payload;
        try {
            payload = JSON.parse(typeof data === 'string' ? data : data.toString());
        } catch (err) {
            return;
        }
        if (!predicate || predicate(payload)) {
            cleanup();
            resolve(payload);
        }
    };
    socket.on('message', onMessage);
});

const closeSocket = (socket, timeoutMs = 2000) => new Promise((resolve) => {
    if (socket.readyState === WebSocket.CLOSED) {
        resolve();
        return;
    }
    const timer = setTimeout(() => {
        cleanup();
        resolve();
    }, timeoutMs);
    const cleanup = () => {
        clearTimeout(timer);
        socket.off('close', onClose);
    };
    const onClose = () => {
        cleanup();
        resolve();
    };
    socket.once('close', onClose);
    socket.close();
});

describe('HomeCall_Back_Service_Signal_Server', () => {
    it('routes signaling messages between participants', async () => {
        const originalPort = process.env.WS_PORT;
        process.env.WS_PORT = '0';

        const container = await createTestContainer();
        container.enableTestMode();

        const mockLogger = Object.freeze({
            info: () => {},
            warn: () => {},
            error: () => {},
        });
        container.register('HomeCall_Back_Contract_Logger$', mockLogger);

        const server = await container.get('HomeCall_Back_Service_Signal_Server$');
        let alice;
        let bob;

        try {
            await server.start();
            const address = server.getAddress();
            assert.ok(address && typeof address === 'object', 'Server must expose listening address.');
            const port = address.port;
            const url = `ws://127.0.0.1:${port}/signal`;

            alice = new WebSocket(url);
            await waitForOpen(alice);

            const aliceOnlineInitial = waitForMessage(alice, (msg) => msg.type === 'online');
            alice.send(JSON.stringify({ type: 'join', room: 'family', user: 'alice' }));
            const onlineAlice = await aliceOnlineInitial;
            assert.deepEqual(onlineAlice, { type: 'online', room: 'family', users: ['alice'] });

            bob = new WebSocket(url);
            await waitForOpen(bob);
            const aliceOnlineAfterBob = waitForMessage(alice, (msg) => msg.type === 'online' && msg.users.length === 2);
            const bobOnline = waitForMessage(bob, (msg) => msg.type === 'online');
            bob.send(JSON.stringify({ type: 'join', room: 'family', user: 'bob' }));
            const onlineBob = await bobOnline;
            assert.deepEqual(onlineBob, { type: 'online', room: 'family', users: ['alice', 'bob'] });
            const onlineAlice2 = await aliceOnlineAfterBob;
            assert.deepEqual(onlineAlice2, { type: 'online', room: 'family', users: ['alice', 'bob'] });

            const offerToBob = waitForMessage(bob, (msg) => msg.type === 'offer');
            alice.send(JSON.stringify({ type: 'offer', room: 'family', to: 'bob', sdp: 'offer-sdp' }));
            const offer = await offerToBob;
            assert.deepEqual(offer, { type: 'offer', room: 'family', from: 'alice', to: 'bob', sdp: 'offer-sdp' });

            const answerToAlice = waitForMessage(alice, (msg) => msg.type === 'answer');
            bob.send(JSON.stringify({ type: 'answer', room: 'family', to: 'alice', sdp: 'answer-sdp' }));
            const answer = await answerToAlice;
            assert.deepEqual(answer, { type: 'answer', room: 'family', from: 'bob', to: 'alice', sdp: 'answer-sdp' });

            const candidateToBob = waitForMessage(bob, (msg) => msg.type === 'candidate');
            alice.send(JSON.stringify({ type: 'candidate', room: 'family', to: 'bob', candidate: { candidate: 'ice' } }));
            const candidate = await candidateToBob;
            assert.deepEqual(candidate, {
                type: 'candidate',
                room: 'family',
                from: 'alice',
                to: 'bob',
                candidate: { candidate: 'ice' },
            });

            const aliceAfterLeave = waitForMessage(alice, (msg) => msg.type === 'online' && msg.users.length === 1);
            bob.send(JSON.stringify({ type: 'leave', room: 'family', user: 'bob' }));
            const onlineAfterLeave = await aliceAfterLeave;
            assert.deepEqual(onlineAfterLeave, { type: 'online', room: 'family', users: ['alice'] });
        } finally {
            if (bob) {
                await closeSocket(bob).catch(() => {});
            }
            if (alice) {
                await closeSocket(alice).catch(() => {});
            }
            await server.stop().catch(() => {});

            if (originalPort === undefined) {
                delete process.env.WS_PORT;
            } else {
                process.env.WS_PORT = originalPort;
            }
        }
    });
});
