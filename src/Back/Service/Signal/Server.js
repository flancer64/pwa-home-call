/**
 * @module HomeCall_Back_Service_Signal_Server
 * @description WebSocket signaling server for HomeCall.
 */

import { WebSocketServer, WebSocket } from 'ws';

export default class HomeCall_Back_Service_Signal_Server {
    /**
     * @param {Object} deps - Dependencies injected by @teqfw/di.
     * @param {HomeCall_Back_Contract_Logger} deps.HomeCall_Back_Contract_Logger$ - Logger instance.
     * @param {HomeCall_Back_Service_Signal_SessionManager} deps.HomeCall_Back_Service_Signal_SessionManager$ - Session manager.
     */
    constructor({ HomeCall_Back_Contract_Logger$: logger, HomeCall_Back_Service_Signal_SessionManager$: sessions } = {}) {
        if (!logger || typeof logger.info !== 'function') {
            throw new TypeError('HomeCall_Back_Service_Signal_Server requires a logger with info() method.');
        }
        if (!sessions || typeof sessions.register !== 'function') {
            throw new TypeError('HomeCall_Back_Service_Signal_Server requires a session manager.');
        }

        const namespace = 'HomeCall_Back_Service_Signal_Server';
        let server = null;
        const pendingSignals = new Map();
        const SIGNAL_PATH = '/signal';

        const parsePort = () => {
            const raw = process.env.WS_PORT;
            const port = Number.parseInt(raw ?? '', 10);
            if (!Number.isInteger(port) || port < 0 || port > 65535) {
                throw new Error('WS_PORT environment variable must be a valid TCP port number.');
            }
            return port;
        };

        const parseHost = () => {
            const raw = typeof process.env.WS_HOST === 'string' ? process.env.WS_HOST.trim() : '';
            return raw.length > 0 ? raw : '0.0.0.0';
        };

        const normalizeSessionId = (value, label) => {
            if (typeof value !== 'string' || value.trim() === '') {
                throw new TypeError(`${label} must be a non-empty string.`);
            }
            return value.trim();
        };

        const toJson = (payload) => JSON.stringify(payload);

        const safeSend = (targetSocket, payload) => {
            if (!targetSocket || typeof targetSocket.send !== 'function') {
                return;
            }
            if (targetSocket.readyState !== WebSocket.OPEN) {
                return;
            }
            targetSocket.send(toJson(payload));
        };

        const enqueuePendingSignal = (sessionId, payload, sourceSocket) => {
            const entries = pendingSignals.get(sessionId) ?? [];
            entries.push({ payload, source: sourceSocket });
            pendingSignals.set(sessionId, entries);
            logger.info(namespace, `Queued ${payload.type} for session ${sessionId}. Waiting for peer.`);
        };

        const deliverPendingSignals = (sessionId, socket) => {
            const entries = pendingSignals.get(sessionId);
            if (!entries || entries.length === 0) {
                pendingSignals.delete(sessionId);
                return;
            }
            const remaining = [];
            for (const entry of entries) {
                if (entry.source === socket) {
                    remaining.push(entry);
                    continue;
                }
                safeSend(socket, entry.payload);
                logger.info(namespace, `Delivered queued ${entry.payload.type} to session ${sessionId}.`);
            }
            if (remaining.length > 0) {
                pendingSignals.set(sessionId, remaining);
            } else {
                pendingSignals.delete(sessionId);
            }
        };

        const cleanupSocket = (socket) => {
            if (!socket) {
                return;
            }
            sessions.deregister(socket);
        };

        const registerSession = (socket, sessionId) => {
            const key = normalizeSessionId(sessionId, 'sessionId');
            sessions.register(socket, key);
            logger.info(namespace, `Socket joined session ${key}.`);
            deliverPendingSignals(key, socket);
            return key;
        };

        const handleJoin = (socket, message) => {
            if (!message?.sessionId) {
                sendError(socket, 'Join message requires sessionId.');
                return;
            }
            try {
                registerSession(socket, message.sessionId);
            } catch (err) {
                logger.error(namespace, 'Failed to process join message.', err);
                sendError(socket, 'Unable to join the session.');
            }
        };

        const handleLeave = (socket, message) => {
            const explicit = typeof message?.sessionId === 'string' && message.sessionId.trim().length
                ? message.sessionId.trim()
                : sessions.getSessionId(socket);
            if (!explicit) {
                sendError(socket, 'Leave message requires sessionId.');
                return;
            }
            try {
                sessions.deregister(socket);
                logger.info(namespace, `Socket left session ${explicit}.`);
            } catch (err) {
                logger.error(namespace, 'Failed to process leave message.', err);
                sendError(socket, 'Unable to leave the session.');
            }
        };

        const forwardSignal = (socket, type, message) => {
            const sessionId = typeof message?.sessionId === 'string' && message.sessionId.trim().length
                ? message.sessionId.trim()
                : sessions.getSessionId(socket);
            if (!sessionId) {
                sendError(socket, `${type} message requires sessionId.`);
                return;
            }
            let payload = { type, sessionId };
            if (type === 'offer' || type === 'answer') {
                payload.sdp = message.sdp;
            } else if (type === 'candidate') {
                payload.candidate = message.candidate;
            }
            const peers = sessions.getPeers(sessionId, socket);
            if (!peers || peers.length === 0) {
                enqueuePendingSignal(sessionId, payload, socket);
                return;
            }
            peers.forEach((targetSocket) => safeSend(targetSocket, payload));
            logger.info(namespace, `Forwarded ${type} in session ${sessionId}.`);
        };

        const sendError = (socket, message) => {
            safeSend(socket, { type: 'error', message });
        };

        const handleMessage = (socket, data) => {
            let parsed;
            try {
                const text = typeof data === 'string' ? data : data.toString();
                parsed = JSON.parse(text);
            } catch (err) {
                logger.warn(namespace, 'Received invalid JSON payload.');
                sendError(socket, 'Invalid JSON payload.');
                return;
            }
            const type = typeof parsed.type === 'string' ? parsed.type.trim() : '';
            if (!type) {
                sendError(socket, 'Message type is required.');
                return;
            }
            switch (type) {
                case 'join':
                    handleJoin(socket, parsed);
                    break;
                case 'leave':
                    handleLeave(socket, parsed);
                    break;
                case 'offer':
                case 'answer':
                case 'candidate':
                    forwardSignal(socket, type, parsed);
                    break;
                case 'error':
                    logger.warn(namespace, 'Client reported an error.', parsed);
                    break;
                default:
                    logger.warn(namespace, `Unsupported message type: ${type}`);
                    sendError(socket, `Unsupported message type: ${type}`);
                    break;
            }
        };

        const setupServer = () => {
            const port = parsePort();
            const host = parseHost();
            const wss = new WebSocketServer({ port, host, path: SIGNAL_PATH });
            wss.on('connection', (socket) => {
                logger.info(namespace, 'Incoming WebSocket connection.');
                socket.on('message', (data) => handleMessage(socket, data));
                socket.on('close', () => cleanupSocket(socket));
                socket.on('error', (err) => {
                    logger.error(namespace, 'WebSocket connection error.', err);
                    cleanupSocket(socket);
                });
            });
            wss.on('error', (err) => {
                logger.error(namespace, 'WebSocket server error.', err);
            });
            return wss;
        };

        this.start = async () => {
            if (server) {
                return;
            }
            const wss = setupServer();
            await new Promise((resolve, reject) => {
                wss.once('listening', resolve);
                wss.once('error', reject);
            });
            server = wss;
            const address = server.address();
            const portInfo = typeof address === 'object' && address ? address.port : parsePort();
            logger.info(namespace, `WebSocket signaling server started on port ${portInfo} (path ${SIGNAL_PATH}).`);
        };

        this.stop = async () => {
            if (!server) {
                return;
            }
            const current = server;
            server = null;
            await new Promise((resolve, reject) => {
                current.close((err) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve();
                    }
                });
                for (const client of current.clients) {
                    try {
                        client.terminate();
                    } catch (err) {
                        logger.error(namespace, 'Failed to terminate client connection.', err);
                    }
                }
            });
            logger.info(namespace, 'WebSocket signaling server stopped.');
        };

        this.getAddress = () => {
            if (!server) return null;
            return server.address();
        };
    }
}
