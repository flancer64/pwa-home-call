/**
 * @module HomeCall_Back_Service_Signal_RoomManager
 * @description Tracks rooms and participants for the signaling server.
 */

export default class HomeCall_Back_Service_Signal_RoomManager {
    constructor() {
        /** @type {Map<string, Map<string, import('ws').WebSocket>>} */
        const rooms = new Map();

        const normalizeKey = (value, label) => {
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

        this.join = (room, user, socket) => {
            const roomKey = normalizeKey(room, 'room');
            const userKey = normalizeKey(user, 'user');
            const ws = ensureSocket(socket);
            let users = rooms.get(roomKey);
            if (!users) {
                users = new Map();
                rooms.set(roomKey, users);
            }
            users.set(userKey, ws);
        };

        this.leave = (room, user) => {
            const roomKey = normalizeKey(room, 'room');
            const userKey = normalizeKey(user, 'user');
            const users = rooms.get(roomKey);
            if (!users) return;
            users.delete(userKey);
            if (users.size === 0) {
                rooms.delete(roomKey);
            }
        };

        this.list = (room) => {
            const roomKey = normalizeKey(room, 'room');
            const users = rooms.get(roomKey);
            if (!users) return [];
            return Array.from(users.keys()).sort();
        };

        this.getSocket = (room, user) => {
            const roomKey = normalizeKey(room, 'room');
            const userKey = normalizeKey(user, 'user');
            const users = rooms.get(roomKey);
            return users ? users.get(userKey) : undefined;
        };
    }
}
