import test from 'node:test';
import assert from 'node:assert/strict';
import { createWebContainer } from '../../helper.mjs';

test('Media manager prepares devices and updates UI bindings', async () => {
  const OriginalMediaStream = globalThis.MediaStream;
  class FakeMediaStream {
    constructor() {
      this.tracks = [{ stop() {} }, { stop() {} }];
    }
    getTracks() {
      return this.tracks;
    }
  }
  globalThis.MediaStream = FakeMediaStream;
  const container = await createWebContainer();
  const fakeDevices = [
    { kind: 'audioinput' },
    { kind: 'videoinput' }
  ];
  const tracks = [{ kind: 'audio', stopCalled: false, stop() { this.stopCalled = true; } }];
  const stream = {
    getTracks() {
      return tracks;
    }
  };
  const mediaDevices = {
    async enumerateDevices() {
      return fakeDevices;
    },
    async getUserMedia() {
      return stream;
    },
    addEventListener() {}
  };
  const navigatorStub = {
    mediaDevices,
    permissions: {
      async query() {
        return { state: 'granted' };
      }
    }
  };
  const documentStub = {
    createElement() {
      return { className: '', textContent: '', remove() {} };
    },
    body: { appendChild() {} }
  };
  const windowStub = {
    setTimeout(handler) {
      handler();
      return 0;
    },
    clearTimeout() {}
  };
  const monitor = {
    register() {}
  };
  let peerStream = null;
  const peer = {
    setLocalStream(streamValue) {
      peerStream = streamValue;
    }
  };
  container.register('navigator$', navigatorStub);
  container.register('document$', documentStub);
  container.register('window$', windowStub);
  container.register('HomeCall_Web_Media_DeviceMonitor$', monitor);
  container.register('HomeCall_Web_Rtc_Peer$', peer);

  const manager = await container.get('HomeCall_Web_Media_Manager$');
  manager.setPeer(peer);
  const statusElement = { hidden: true, textContent: '', className: '', classList: { add(cls) { this[cls] = true; } } };
  const videoElement = { hidden: true, srcObject: null };
  const messageElement = { hidden: false };
  const retryButton = { hidden: false };
  manager.bindStatusElement(statusElement);
  manager.bindLocalElements({ video: videoElement, message: messageElement, retry: retryButton });

  try {
    const result = await manager.prepare();

    assert.equal(result.status, 'ready');
    assert.equal(peerStream, stream);
    assert.equal(statusElement.hidden, false);
    assert.match(statusElement.textContent, /Camera/);
    assert.ok(statusElement.classList['alert-success']);
    assert.equal(videoElement.hidden, false);
    assert.equal(videoElement.srcObject, stream);
    assert.equal(messageElement.hidden, true);
    assert.equal(retryButton.hidden, true);
  } finally {
    globalThis.MediaStream = OriginalMediaStream;
  }
});
