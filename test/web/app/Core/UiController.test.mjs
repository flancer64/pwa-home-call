import test from 'node:test';
import assert from 'node:assert';
import { createWebContainer } from '../../helper.mjs';

test('UiController delegates screen calls without leaking state', async () => {
  const container = await createWebContainer();
  const recorded = {};
  const createScreen = (key) => ({
    show(params) {
      recorded[key] = params;
    }
  });
  const enterScreen = createScreen('enter');
  const lobbyScreen = createScreen('lobby');
  const endScreen = createScreen('end');
  const callScreen = {
    show(params) {
      recorded.call = params;
    },
    updateRemoteStream(stream) {
      recorded.stream = stream;
    },
    updateConnectionStatus(params) {
      recorded.connectionStatus = params;
    }
  };

  container.register('HomeCall_Web_Ui_Screen_Enter$', enterScreen);
  container.register('HomeCall_Web_Ui_Screen_Lobby$', lobbyScreen);
  container.register('HomeCall_Web_Ui_Screen_Call$', callScreen);
  container.register('HomeCall_Web_Ui_Screen_End$', endScreen);

  const controller = await container.get('HomeCall_Web_Core_UiController$');
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
