import test from 'node:test';
import assert from 'node:assert/strict';
import { createWebContainer } from '../../helper.mjs';

test('UiController exposes home, call, and end screens', async () => {
  const container = await createWebContainer();
  const recorded = {};
  const enterScreen = { show(params) { recorded.home = params; } };
  const callScreen = {
    show(params) { recorded.call = params; },
    updateRemoteStream(stream) { recorded.stream = stream; }
  };
  const endScreen = { show(params) { recorded.end = params; } };
  const inviteScreen = { show(params) { recorded.invite = params; } };

  container.register('HomeCall_Web_Ui_Screen_Enter$', enterScreen);
  container.register('HomeCall_Web_Ui_Screen_Invite$', inviteScreen);
  container.register('HomeCall_Web_Ui_Screen_Call$', callScreen);
  container.register('HomeCall_Web_Ui_Screen_End$', endScreen);

  const controller = await container.get('HomeCall_Web_Core_UiController$');
  controller.showHome({ container: 'root', savedName: 'Jane', onStartCall: () => {} });
  controller.showInvite({ container: 'invite-root', roomId: 'room42', inviteUrl: 'https://domozvon.app/?room=room42' });
  controller.showCall({ container: 'call-root', remoteStream: 'stream', onEnd: () => {} });
  controller.showEnd({ container: 'end-root', connectionMessage: 'ok', onReturn: () => {} });
  controller.updateRemoteStream('stream2');

  assert.strictEqual(recorded.home?.container, 'root');
  assert.strictEqual(recorded.home?.savedName, 'Jane');
  assert.strictEqual(recorded.invite?.roomId, 'room42');
  assert.ok(recorded.invite?.inviteUrl?.includes('room=room42'));
  assert.strictEqual(recorded.call?.remoteStream, 'stream');
  assert.strictEqual(recorded.end?.connectionMessage, 'ok');
  assert.strictEqual(recorded.stream, 'stream2');
});
