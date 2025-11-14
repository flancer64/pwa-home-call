/**
 * @module HomeCall_Web_Core_RoomManager
 * @description Encapsulates room identifiers and URL manipulations for invites.
 */
export default class HomeCall_Web_Core_RoomManager {
  constructor({ HomeCall_Web_Env_Provider$: env } = {}) {
    if (!env) {
      throw new Error('Environment provider is required for the room manager.');
    }
    const envRef = env;
    const originValue = (envRef.window?.location?.origin ?? 'https://domozvon.app').replace(/\/$/, '');

    this.createRoomId = () => {
      const randomId = envRef.crypto?.randomUUID?.() ?? null;
      if (randomId) {
        return randomId;
      }
      const randomSegment = () => Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
      return `${randomSegment()}${randomSegment()}-${randomSegment()}-${randomSegment()}-${randomSegment()}-${randomSegment()}${randomSegment()}${randomSegment()}`;
    };

    this.readRoomFromUrl = () => {
      const search = envRef.window?.location?.search;
      if (!search) {
        return null;
      }
      const params = new URLSearchParams(search);
      const room = params.get('room')?.trim();
      return room?.length ? room : null;
    };

    this.clearRoomFromUrl = () => {
      const locationRef = envRef.window?.location;
      const historyRef = envRef.window?.history;
      if (!locationRef || !historyRef || typeof historyRef.replaceState !== 'function') {
        return;
      }
      const url = new URL(locationRef.href);
      url.searchParams.delete('room');
      historyRef.replaceState(historyRef.state, '', `${url.pathname}${url.search}`);
    };

    this.buildInviteUrl = (roomId) => {
      const base = originValue;
      const normalizedRoom = typeof roomId === 'string' ? roomId.trim() : '';
      if (!normalizedRoom) {
        return base;
      }
      return `${base}/?room=${encodeURIComponent(normalizedRoom)}`;
    };
  }
}
