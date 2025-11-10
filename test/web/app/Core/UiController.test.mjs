import test from 'node:test';
import assert from 'node:assert';
import UiController from '../../../../web/app/Core/UiController.mjs';

test('UiController delegates screen calls without leaking state', () => {
  const recorded = {};
  const mockEnter = {
    show: (params) => {
      recorded.enter = params;
    }
  };
  const mockLobby = {
    show: (params) => {
      recorded.lobby = params;
    }
  };
  const mockCall = {
    show: (params) => {
      recorded.call = params;
    },
    updateRemoteStream: (stream) => {
      recorded.stream = stream;
    }
  };
  const mockEnd = {
    show: (params) => {
      recorded.end = params;
    }
  };

  const controller = new UiController({
    HomeCall_Web_Ui_Screen_Enter$: mockEnter,
    HomeCall_Web_Ui_Screen_Lobby$: mockLobby,
    HomeCall_Web_Ui_Screen_Call$: mockCall,
    HomeCall_Web_Ui_Screen_End$: mockEnd
  });

  assert.ok(controller, 'controller should be created with valid deps');

  controller.showEnter({
    container: 'root',
    connectionMessage: 'hello',
    onEnter: () => {}
  });
  controller.showLobby({
    container: 'root',
    roomCode: 'room',
    users: ['alice'],
    onCall: () => {},
    onLeave: () => {}
  });
  controller.showCall({
    container: 'root',
    remoteStream: 'stream-a',
    onEnd: () => {},
    onRetry: () => {}
  });
  controller.showEnd({
    container: 'root',
    message: 'goodbye',
    onBack: () => {}
  });
  controller.updateRemoteStream('stream-b');

  assert.strictEqual(recorded.enter?.container, 'root');
  assert.strictEqual(recorded.enter?.connectionMessage, 'hello');
  assert.strictEqual(recorded.lobby?.roomCode, 'room');
  assert.strictEqual(recorded.call?.remoteStream, 'stream-a');
  assert.strictEqual(recorded.end?.message, 'goodbye');
  assert.strictEqual(recorded.stream, 'stream-b');
});
