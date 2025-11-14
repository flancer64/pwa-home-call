/**
 * @module HomeCall_Back_Service_Signal_Server
 * @description WebSocket signaling server for HomeCall.
 */

import { WebSocketServer, WebSocket } from 'ws';

export default class HomeCall_Back_Service_Signal_Server {
    /**
     * @param {Object} deps - Dependencies injected by @teqfw/di.
     * @param {HomeCall_Back_Contract_Logger} deps.HomeCall_Back_Contract_Logger$ - Logger instance.
     * @param {HomeCall_Back_Service_Signal_RoomManager} deps.HomeCall_Back_Service_Signal_RoomManager$ - Room manager.
     */
    constructor({ HomeCall_Back_Contract_Logger$: logger, HomeCall_Back_Service_Signal_RoomManager$: rooms } = {}) {
        if (!logger || typeof logger.info !== 'function') {
            throw new TypeError('HomeCall_Back_Service_Signal_Server requires a logger with info() method.');
        }
        if (!rooms || typeof rooms.join !== 'function') {
            throw new TypeError('HomeCall_Back_Service_Signal_Server requires a room manager.');
        }

        const namespace = 'HomeCall_Back_Service_Signal_Server';
        /** @type {WebSocketServer | null} */
        let server = null;
        /** @type {WeakMap<import('ws').WebSocket, { room: string, user: string }>} */
        const session = new WeakMap();
        const SIGNAL_PATH = '/signal';
        const pendingSignals = new Map();

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

        const normalizeString = (value, label) => {
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

        const enqueuePendingSignal = (room, payload) => {
            const existing = pendingSignals.get(room) ?? [];
            existing.push(payload);
            pendingSignals.set(room, existing);
            logger.info(namespace, `Queued ${payload.type} for room ${room}. Waiting for peer.`);
        };

        const deliverPendingSignals = (room, socket, user) => {
            const entries = pendingSignals.get(room);
            if (!entries || entries.length === 0) {
                pendingSignals.delete(room);
                return;
            }
            const remaining = [];
            for (const payload of entries) {
                if (payload.from === user) {
                    remaining.push(payload);
                    continue;
                }
                safeSend(socket, payload);
                logger.info(namespace, `Delivered queued ${payload.type} to ${user} in room ${room}.`);
            }
            if (remaining.length > 0) {
                pendingSignals.set(room, remaining);
            } else {
                pendingSignals.delete(room);
            }
        };

        const cleanupSocket = (socket) => {
            const meta = session.get(socket);
            if (!meta) {
                return;
            }
            session.delete(socket);
            try {
                rooms.leave(meta.room, meta.user);
                logger.info(namespace, `User ${meta.user} left room ${meta.room}.`);
            } catch (err) {
                logger.error(namespace, 'Failed to cleanup socket.', err);
            }
        };

        const registerSession = (socket, room, user) => {
            const roomKey = normalizeString(room, 'room');
            const userKey = normalizeString(user, 'user');
            rooms.join(roomKey, userKey, socket);
            session.set(socket, { room: roomKey, user: userKey });
            logger.info(namespace, `User ${userKey} joined room ${roomKey}.`);
            deliverPendingSignals(roomKey, socket, userKey);
        };

        const handleJoin = (socket, message) => {
            try {
                registerSession(socket, message.room, message.user);
            } catch (err) {
                logger.error(namespace, 'Failed to process join message.', err);
                sendError(socket, 'Unable to join the room.');
            }
        };

        const handleLeave = (socket, message) => {
            const meta = session.get(socket);
            const roomKey = typeof message.room === 'string' && message.room.trim() !== '' ? message.room.trim() : meta?.room;
            const userKey = typeof message.user === 'string' && message.user.trim() !== '' ? message.user.trim() : meta?.user;
            if (!roomKey || !userKey) {
                sendError(socket, 'leave message requires room and user.');
                return;
            }
            try {
                rooms.leave(roomKey, userKey);
                if (meta) {
                    session.delete(socket);
                }
                logger.info(namespace, `User ${userKey} left room ${roomKey}.`);
            } catch (err) {
                logger.error(namespace, 'Failed to process leave message.', err);
                sendError(socket, 'Unable to leave the room.');
            }
        };

        const forwardSignal = (socket, type, message) => {
            const meta = session.get(socket);
            if (!meta) {
                sendError(socket, 'Join a room before sending signaling messages.');
                return;
            }
            let roomKey = typeof message.room === 'string' && message.room.trim() !== '' ? message.room.trim() : meta.room;
            let fromKey = typeof message.from === 'string' && message.from.trim() !== '' ? message.from.trim() : meta.user;
            if (!roomKey || !fromKey) {
                sendError(socket, `${type} message requires room and from.`);
                return;
            }
            const payload = { type, room: roomKey, from: fromKey };
            if (type === 'offer' || type === 'answer') {
                payload.sdp = message.sdp;
            } else if (type === 'candidate') {
                payload.candidate = message.candidate;
            }
            const targetSocket = rooms.getPeerSocket(roomKey, fromKey);
            if (!targetSocket) {
                enqueuePendingSignal(roomKey, payload);
                return;
            }
            safeSend(targetSocket, payload);
            logger.info(namespace, `Forwarded ${type} from ${fromKey} to peer in room ${roomKey}.`);
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
