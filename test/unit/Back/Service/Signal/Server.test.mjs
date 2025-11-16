/**
 * @module test.unit.Back.Service.Signal.Server
 * @description Integration-style unit tests for HomeCall_Back_Service_Signal_Server.
 */

import fs from 'node:fs';
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { WebSocket } from 'ws';
import { createTestContainer } from '../../../helper.mjs';

const logAssertOk = (value, label) => {
    try {
        assert.ok(value, label);
    } catch (error) {
        console.error('assert.ok failed', label, value, error);
        throw error;
    }
};

const logAssertDeepEqual = (actual, expected, label) => {
    try {
        assert.deepEqual(actual, expected);
    } catch (error) {
        console.error('assert.deepEqual failed', label, { actual, expected }, error);
        throw error;
    }
};

const logSignalEvent = (entry) => {
    try {
        const destination = 'tmp/signal-debug.log';
        fs.appendFileSync(destination, `${JSON.stringify(entry)}\n`);
    } catch (error) {
        console.error('failed to log signal event', error);
    }
};

try {
    fs.rmSync('tmp/signal-debug.log');
} catch (error) {
    // ignore
}
try {
    fs.rmSync('tmp/test-events.log');
} catch (error) {
    // ignore
}

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

const waitForMessage = (socket, predicate, timeoutMs = 2000, label = 'message') => new Promise((resolve, reject) => {
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
        const matched = !predicate || predicate(payload);
        logSignalEvent({ label, type: payload?.type ?? null, sessionId: payload?.sessionId ?? null, matched });
        if (matched) {
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
        const originalHost = process.env.WS_HOST;
        process.env.WS_PORT = '0';
        process.env.WS_HOST = '127.0.0.1';

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
            logAssertOk(address && typeof address === 'object', 'Server must expose listening address.');
            const port = address.port;
            const url = `ws://127.0.0.1:${port}/signal`;

            const sessionId = 'family';
            alice = new WebSocket(`${url}?sessionId=${sessionId}`);
            await waitForOpen(alice);

            alice.send(JSON.stringify({ type: 'offer', sessionId, sdp: 'offer-sdp' }));
            fs.appendFileSync('tmp/test-events.log', 'offer-sent\n');
            alice.send(JSON.stringify({ type: 'hangup', sessionId, initiator: 'caller' }));
            fs.appendFileSync('tmp/test-events.log', 'hangup-sent\n');

            bob = new WebSocket(`${url}?sessionId=${sessionId}`);
            const offerFromQueue = waitForMessage(bob, (msg) => msg.type === 'offer', 2000, 'offer');
            const hangupFromQueue = waitForMessage(bob, (msg) => msg.type === 'hangup', 2000, 'hangup');
            await waitForOpen(bob);
            fs.appendFileSync('tmp/test-events.log', 'bob-opened\n');

            const offer = await offerFromQueue;
            console.error('debug offer', offer);
            fs.appendFileSync('tmp/test-events.log', 'offer-received\n');
            logAssertDeepEqual(offer, { type: 'offer', sessionId, sdp: 'offer-sdp' }, 'queued offer');
            const hangup = await hangupFromQueue;
            console.error('debug hangup', hangup);
            fs.appendFileSync('tmp/test-events.log', 'hangup-received\n');
            logAssertDeepEqual(hangup, { type: 'hangup', sessionId, initiator: 'caller' }, 'queued hangup');

            const answerToAlice = waitForMessage(alice, (msg) => msg.type === 'answer', 2000, 'answer');
            bob.send(JSON.stringify({ type: 'answer', sessionId, sdp: 'answer-sdp' }));
            fs.appendFileSync('tmp/test-events.log', 'answer-sent\n');
            const answer = await answerToAlice;
            console.error('debug answer', answer);
            fs.appendFileSync('tmp/test-events.log', 'answer-received\n');
            logAssertDeepEqual(answer, { type: 'answer', sessionId, sdp: 'answer-sdp' }, 'answer delivery');

            const candidateToBob = waitForMessage(bob, (msg) => msg.type === 'candidate', 2000, 'candidate');
            alice.send(JSON.stringify({ type: 'candidate', sessionId, candidate: { candidate: 'alice-ice' } }));
            fs.appendFileSync('tmp/test-events.log', 'candidate-sent\n');
            const candidate = await candidateToBob;
            console.error('debug candidate', candidate);
            fs.appendFileSync('tmp/test-events.log', 'candidate-received\n');
            logAssertDeepEqual(
                candidate,
                {
                    type: 'candidate',
                    sessionId,
                    candidate: { candidate: 'alice-ice' }
                },
                'candidate delivery'
            );
        } catch (error) {
            console.error('test execution failed', error);
            throw error;
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
            if (originalHost === undefined) {
                delete process.env.WS_HOST;
            } else {
                process.env.WS_HOST = originalHost;
            }
        }
    });
});
