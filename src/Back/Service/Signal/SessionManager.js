/**
 * @module HomeCall_Back_Service_Signal_SessionManager
 * @description Tracks active signaling sessions and their participants.
 */
export default class HomeCall_Back_Service_Signal_SessionManager {
    constructor() {
        const sessions = new Map();
        const registry = new WeakMap();
        const MAX_PARTICIPANTS = 2;

        const normalizeSessionId = (value, label) => {
            if (typeof value !== 'string' || value.trim() === '') {
                throw new TypeError(`${label} must be a non-empty string.`);
            }
            return value.trim();
        };

        const ensureSocket = (socket) => {
            if (!socket || typeof socket.send !== 'function') {
                throw new TypeError('socket must implement send() method.');
            }
            return socket;
        };

        this.register = (socket, sessionId) => {
            const key = normalizeSessionId(sessionId, 'sessionId');
            const ws = ensureSocket(socket);
            let participants = sessions.get(key);
            if (!participants) {
                participants = new Set();
                sessions.set(key, participants);
            }
            if (!participants.has(ws) && participants.size >= MAX_PARTICIPANTS) {
                throw new Error(`Session ${key} already has ${MAX_PARTICIPANTS} participants.`);
            }
            participants.add(ws);
            registry.set(ws, key);
        };

        this.deregister = (socket) => {
            const sessionId = registry.get(socket);
            if (!sessionId) {
                return;
            }
            registry.delete(socket);
            const participants = sessions.get(sessionId);
            if (!participants) {
                return;
            }
            participants.delete(socket);
            if (participants.size === 0) {
                sessions.delete(sessionId);
            }
        };

        this.getSessionId = (socket) => {
            return registry.get(socket) ?? null;
        };

        this.getPeers = (sessionId, excludeSocket = null) => {
            try {
                const key = normalizeSessionId(sessionId, 'sessionId');
                const participants = sessions.get(key);
                if (!participants || participants.size === 0) {
                    return [];
                }
                const peers = [];
                for (const participant of participants) {
                    if (participant !== excludeSocket) {
                        peers.push(participant);
                    }
                }
                return peers;
            } catch (error) {
                return [];
            }
        };
    }
}
