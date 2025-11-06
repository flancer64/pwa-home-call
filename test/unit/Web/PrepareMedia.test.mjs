/**
 * @module test.unit.Web.PrepareMedia
 * @description Tests for prepareMedia UX flow in web/app.js.
 */

import assert from 'node:assert/strict';
import { afterEach, beforeEach, describe, it } from 'node:test';
import { prepareMedia, __resetMediaState } from '../../../web/app.js';

describe('web/app prepareMedia', () => {
  let enumerateDevicesResult = [];
  let getUserMediaImpl = async () => createStreamWithTracks();
  let permissionStates = {};
  let deviceListeners = [];
  let navigatorDescriptor;

  beforeEach(() => {
    __resetMediaState();
    enumerateDevicesResult = [];
    permissionStates = {};
    deviceListeners = [];
    navigatorDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'navigator');
    const navigatorMock = {
      mediaDevices: {
        enumerateDevices: async () => enumerateDevicesResult,
        getUserMedia: async (constraints) => getUserMediaImpl(constraints),
        addEventListener: (event, handler) => {
          deviceListeners.push({ event, handler });
        }
      },
      permissions: {
        query: async ({ name }) => ({
          state: permissionStates[name] || 'prompt'
        })
      },
      userAgent: 'MockBrowser/1.0'
    };
    Object.defineProperty(globalThis, 'navigator', {
      configurable: true,
      enumerable: true,
      writable: true,
      value: navigatorMock
    });
    global.document = {
      getElementById: () => null,
      createElement: () => ({
        className: '',
        textContent: '',
        remove: () => {}
      }),
      body: {
        appendChild: () => {},
        classList: {
          toggle: () => {}
        }
      }
    };
  });

  afterEach(() => {
    __resetMediaState();
    if (navigatorDescriptor) {
      Object.defineProperty(globalThis, 'navigator', navigatorDescriptor);
    } else {
      delete globalThis.navigator;
    }
    delete global.document;
  });

  it('returns ready status when camera and microphone are available', async () => {
    enumerateDevicesResult = [
      { kind: 'audioinput', deviceId: 'mic-1' },
      { kind: 'videoinput', deviceId: 'cam-1' }
    ];
    let capturedConstraints = null;
    getUserMediaImpl = async (constraints) => {
      capturedConstraints = { ...constraints };
      return createStreamWithTracks(2);
    };

    const result = await prepareMedia();

    assert.equal(result.status, 'ready');
    assert.equal(result.message, 'Camera and microphone are ready.');
    assert.deepEqual(capturedConstraints, { audio: true, video: true });
    assert.ok(deviceListeners.length >= 1, 'devicechange listener registered');
  });

  it('reports blocked access when permission is permanently denied', async () => {
    enumerateDevicesResult = [
      { kind: 'audioinput', deviceId: 'mic-1' },
      { kind: 'videoinput', deviceId: 'cam-1' }
    ];
    permissionStates = { camera: 'denied', microphone: 'granted' };
    getUserMediaImpl = async () => {
      const error = new Error('Permission denied');
      error.name = 'NotAllowedError';
      throw error;
    };

    const result = await prepareMedia();

    assert.equal(result.status, 'blocked');
    assert.equal(
      result.message,
      'Camera or microphone access is blocked. Use the browser settings link below to allow access.'
    );
  });

  it('reports denied access when the user dismisses the permission prompt', async () => {
    enumerateDevicesResult = [
      { kind: 'audioinput', deviceId: 'mic-1' },
      { kind: 'videoinput', deviceId: 'cam-1' }
    ];
    permissionStates = { camera: 'prompt', microphone: 'prompt' };
    getUserMediaImpl = async () => {
      const error = new Error('Permission denied');
      error.name = 'NotAllowedError';
      throw error;
    };

    const result = await prepareMedia();

    assert.equal(result.status, 'denied');
    assert.equal(result.message, 'Camera or microphone access was denied. Please allow access to continue.');
  });

  it('returns not-found status when no devices exist', async () => {
    enumerateDevicesResult = [];

    const result = await prepareMedia();

    assert.equal(result.status, 'not-found');
    assert.equal(result.message, 'No camera or microphone detected.');
  });

  it('returns device-error status when hardware fails to start', async () => {
    enumerateDevicesResult = [
      { kind: 'audioinput', deviceId: 'mic-1' },
      { kind: 'videoinput', deviceId: 'cam-1' }
    ];
    getUserMediaImpl = async () => {
      const error = new Error('Not readable');
      error.name = 'NotReadableError';
      throw error;
    };

    const result = await prepareMedia();

    assert.equal(result.status, 'device-error');
    assert.equal(result.message, 'The camera or microphone is not working. Check your device and try again.');
  });
});

function createStreamWithTracks(count = 1) {
  const tracks = Array.from({ length: count }, () => ({
    stop: () => {
      // no-op stub
    }
  }));
  return {
    getTracks: () => tracks
  };
}
