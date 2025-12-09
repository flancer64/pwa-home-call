/**
 * @module HomeCall_Back_Service_Signal_Server
 * @description WebSocket signaling server for Svyazist.
 */

import { WebSocketServer, WebSocket } from 'ws';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

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
        const logInfo = (message, details) => logger.info(namespace, `[Signal] ${message}`, details);
        const logWarn = (message, details) => logger.warn(namespace, `[Signal] ${message}`, details);
        const logError = (message, details) => logger.error(namespace, `[Signal] ${message}`, details);
        let server = null;
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


        const extractSessionIdFromRequest = (req) => {
            if (!req || typeof req.url !== 'string') {
                return null;
            }
            try {
                const host = typeof req.headers?.host === 'string' && req.headers.host.length > 0 ? req.headers.host : 'localhost';
                const normalized = new URL(req.url, `http://${host}`);
                const sessionId = normalized.searchParams.get('sessionId');
                if (!sessionId) {
                    return null;
                }
                return normalizeSessionId(sessionId, 'sessionId');
            } catch (error) {
                logWarn('Unable to parse sessionId from WebSocket handshake.', { error: error?.message ?? null });
                return null;
            }
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

        const SIGNAL_TYPES = new Set(['offer', 'answer', 'candidate', 'hangup', 'error']);
        const sessionQueues = new Map();

        const enqueueSignal = (sessionId, payload) => {
            if (!sessionId || !payload) {
                return;
            }
            const queue = sessionQueues.get(sessionId) ?? [];
            queue.push(payload);
            sessionQueues.set(sessionId, queue);
            logInfo(`Queued ${payload.type} until peer arrives.`, { sessionId, type: payload.type, queueLength: queue.length });
        };

        const flushQueuedSignals = (sessionId, socket) => {
            const queued = sessionQueues.get(sessionId);
            if (!queued || queued.length === 0) {
                return;
            }
            queued.forEach((payload) => safeSend(socket, payload));
            sessionQueues.delete(sessionId);
            logInfo('Flushed queued signals to newly connected participant.', { sessionId, count: queued.length });
        };

        const clearQueuedSignals = (sessionId) => {
            sessionQueues.delete(sessionId);
        };

        const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../..');
        const serverLogPath = path.join(repoRoot, 'tmp', 'signal-server.log');
        try {
            fs.rmSync(serverLogPath);
        } catch (error) {
            // ignore
        }
        const logServerEvent = (entry) => {
            try {
                fs.appendFileSync(serverLogPath, `${JSON.stringify(entry)}\n`);
            } catch (error) {
                // ignore
            }
        };

        const cleanupSocket = (socket) => {
            if (!socket) {
                return;
            }
            const sessionId = sessions.getSessionId(socket);
            sessions.deregister(socket);
            if (sessionId) {
                const remainingPeers = sessions.getPeers(sessionId);
                if (!remainingPeers || remainingPeers.length === 0) {
                    clearQueuedSignals(sessionId);
                }
            }
        };

        const registerSession = (socket, sessionId) => {
            const key = normalizeSessionId(sessionId, 'sessionId');
            const currentSession = sessions.getSessionId(socket);
            if (currentSession === key) {
                return key;
            }
            if (currentSession) {
                sessions.deregister(socket);
            }
            sessions.register(socket, key);
            logInfo(`Socket joined session ${key}.`, { sessionId: key });
            flushQueuedSignals(key, socket);
            return key;
        };

        const buildSignalPayload = (type, message, sessionId) => {
            const payload = { type, sessionId };
            if (type === 'offer' || type === 'answer') {
                const sdp = typeof message?.sdp === 'string' ? message.sdp : '';
                if (!sdp) {
                    throw new Error(`${type} payload requires a non-empty SDP.`);
                }
                payload.sdp = sdp;
            } else if (type === 'candidate') {
                const candidate = message?.candidate;
                if (!candidate || typeof candidate.candidate !== 'string' || candidate.candidate.trim() === '') {
                    throw new Error('Candidate payload requires valid candidate data.');
                }
                payload.candidate = candidate;
            } else if (type === 'hangup') {
                const reason = typeof message?.reason === 'string' ? message.reason.trim() : '';
                if (reason) {
                    payload.reason = reason;
                }
            } else if (type === 'error') {
                payload.message = typeof message?.message === 'string' ? message.message : 'Unknown signaling error.';
                if (typeof message?.code !== 'undefined') {
                    payload.code = message.code;
                }
            }
            return payload;
        };

        const forwardSignal = (socket, type, message) => {
            let normalizedSession;
            try {
                normalizedSession = registerSession(socket, message?.sessionId);
            } catch (error) {
                const errMsg = error?.message ?? 'Unable to register for the session.';
                logWarn('Failed to register session for signal.', { error: errMsg, sessionId: message?.sessionId ?? null });
                sendError(socket, errMsg, message?.sessionId ?? null);
                return;
            }
            let payload;
            try {
                payload = buildSignalPayload(type, message, normalizedSession);
            } catch (error) {
                const errMsg = error?.message ?? 'Invalid signal payload.';
                logWarn('Invalid signal payload.', { error: errMsg, sessionId: normalizedSession });
                sendError(socket, errMsg, normalizedSession);
                return;
            }
            const peers = sessions.getPeers(normalizedSession, socket);
            if (!peers || peers.length === 0) {
                enqueueSignal(normalizedSession, payload);
                return;
            }
            peers.forEach((targetSocket) => safeSend(targetSocket, payload));
            logInfo(`Forwarded ${type} in session ${normalizedSession}.`, {
                sessionId: normalizedSession,
                type
            });
        };

        const sendError = (socket, message, sessionId = null) => {
            logWarn('Sending error response to client.', { message, sessionId });
            safeSend(socket, { type: 'error', sessionId, message });
        };

        const handleMessage = (socket, data) => {
            let parsed;
            try {
                const text = typeof data === 'string' ? data : data.toString();
                parsed = JSON.parse(text);
            } catch (err) {
                logWarn('Received invalid JSON payload.', { error: err?.message ?? null });
                sendError(socket, 'Invalid JSON payload.');
                return;
            }
            const type = typeof parsed.type === 'string' ? parsed.type.trim() : '';
            if (!type) {
                logWarn('Signaling message missing type.');
                sendError(socket, 'Message type is required.', parsed?.sessionId ?? null);
                return;
            }
            if (!SIGNAL_TYPES.has(type)) {
                logWarn(`Unsupported message type: ${type}`, { type });
                sendError(socket, `Unsupported message type: ${type}`, parsed?.sessionId ?? null);
                return;
            }
            forwardSignal(socket, type, parsed);
        };

        const setupServer = () => {
        const port = parsePort();
        const host = parseHost();
            const wss = new WebSocketServer({ port, host, path: SIGNAL_PATH });
            wss.on('connection', (socket, req) => {
                logServerEvent({
                    when: 'connection',
                    url: req?.url ?? null,
                    host: req?.headers?.host ?? null
                });
                const sessionIdFromHandshake = extractSessionIdFromRequest(req);
                if (sessionIdFromHandshake) {
                    try {
                        registerSession(socket, sessionIdFromHandshake);
                    } catch (error) {
                        const reason = error?.message ?? 'Unable to join session.';
                        sendError(socket, reason, sessionIdFromHandshake);
                        socket.close(1008, reason);
                        return;
                    }
                }
                logInfo('Incoming WebSocket connection.', { sessionId: sessionIdFromHandshake ?? null });
                socket.on('message', (data) => handleMessage(socket, data));
                socket.on('close', () => {
                    const sessionId = sessions.getSessionId(socket);
                    logInfo('WebSocket connection closed.', { sessionId });
                    cleanupSocket(socket);
                });
                socket.on('error', (err) => {
                    logError('WebSocket connection error.', err);
                    cleanupSocket(socket);
                });
            });
            wss.on('error', (err) => {
                logError('WebSocket server error.', err);
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
            logInfo('WebSocket signaling server started.', { port: portInfo, path: SIGNAL_PATH });
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
                        logError('Failed to terminate client connection.', err);
                    }
                }
            });
            logInfo('WebSocket signaling server stopped.');
        };

        this.getAddress = () => {
            if (!server) return null;
            return server.address();
        };
    }
}
