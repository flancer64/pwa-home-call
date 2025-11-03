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

        const parsePort = () => {
            const raw = process.env.WS_PORT;
            const port = Number.parseInt(raw ?? '', 10);
            if (!Number.isInteger(port) || port < 0 || port > 65535) {
                throw new Error('WS_PORT environment variable must be a valid TCP port number.');
            }
            return port;
        };

        const toJson = (payload) => JSON.stringify(payload);

        const safeSend = (socket, payload) => {
            if (!socket || typeof socket.send !== 'function') return;
            if (socket.readyState !== WebSocket.OPEN) return;
            socket.send(toJson(payload));
        };

        const broadcastOnline = (room) => {
            try {
                const users = rooms.list(room);
                const payload = { type: 'online', room, users };
                for (const user of users) {
                    const target = rooms.getSocket(room, user);
                    if (target) {
                        safeSend(target, payload);
                    }
                }
            } catch (err) {
                logger.error(namespace, 'Failed to broadcast online list.', err);
            }
        };

        const sendError = (socket, message) => {
            safeSend(socket, { type: 'error', message });
        };

        const cleanupSocket = (socket) => {
            const meta = session.get(socket);
            if (!meta) return;
            session.delete(socket);
            try {
                rooms.leave(meta.room, meta.user);
                broadcastOnline(meta.room);
                logger.info(namespace, `User ${meta.user} left room ${meta.room}.`);
            } catch (err) {
                logger.error(namespace, 'Failed to cleanup socket.', err);
            }
        };

        const handleJoin = (socket, message) => {
            const room = typeof message.room === 'string' ? message.room.trim() : '';
            const user = typeof message.user === 'string' ? message.user.trim() : '';
            if (!room || !user) {
                sendError(socket, 'join message requires room and user.');
                return;
            }
            try {
                rooms.join(room, user, socket);
                session.set(socket, { room, user });
                logger.info(namespace, `User ${user} joined room ${room}.`);
                broadcastOnline(room);
            } catch (err) {
                logger.error(namespace, 'Failed to process join message.', err);
                sendError(socket, 'Unable to join the room.');
            }
        };

        const handleLeave = (socket, message) => {
            const meta = session.get(socket);
            const room = typeof message.room === 'string' && message.room.trim() !== '' ? message.room.trim() : meta?.room;
            const user = typeof message.user === 'string' && message.user.trim() !== '' ? message.user.trim() : meta?.user;
            if (!room || !user) {
                sendError(socket, 'leave message requires room and user.');
                return;
            }
            try {
                rooms.leave(room, user);
                if (meta) {
                    session.delete(socket);
                }
                logger.info(namespace, `User ${user} left room ${room}.`);
                broadcastOnline(room);
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
            const room = typeof message.room === 'string' && message.room.trim() !== '' ? message.room.trim() : meta.room;
            const to = typeof message.to === 'string' ? message.to.trim() : '';
            if (!to) {
                sendError(socket, `${type} message requires destination user.`);
                return;
            }
            const target = rooms.getSocket(room, to);
            if (!target) {
                sendError(socket, `User ${to} is not available in room ${room}.`);
                return;
            }
            const payload = { type, room, from: meta.user, to };
            if (type === 'offer' || type === 'answer') {
                payload.sdp = message.sdp;
            }
            if (type === 'candidate') {
                payload.candidate = message.candidate;
            }
            safeSend(target, payload);
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
            const wss = new WebSocketServer({ port, host: '0.0.0.0', path: '/ws/' });
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
            logger.info(namespace, `WebSocket signaling server started on port ${portInfo}.`);
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
