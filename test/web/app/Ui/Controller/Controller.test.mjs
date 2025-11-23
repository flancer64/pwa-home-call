import test from 'node:test';
import assert from 'node:assert/strict';
import { createWebContainer } from '../../../helper.mjs';

test('UiController exposes home, invite, call, and end screens', async () => {
  const container = await createWebContainer();
  const recorded = {};
  const homeScreen = { show(params) { recorded.home = params; } };
  const callScreen = {
    show(params) { recorded.call = params; },
    updateRemoteStream(stream) { recorded.stream = stream; }
  };
  const endScreen = { show(params) { recorded.end = params; } };
  const inviteScreen = { show(params) { recorded.invite = params; } };
  const settingsScreen = { show(params) { recorded.settings = params; } };

  container.register('HomeCall_Web_Ui_Screen_Home$', homeScreen);
  container.register('HomeCall_Web_Ui_Screen_Invite$', inviteScreen);
  container.register('HomeCall_Web_Ui_Screen_Call$', callScreen);
  container.register('HomeCall_Web_Ui_Screen_End$', endScreen);
  container.register('HomeCall_Web_Ui_Screen_Settings$', settingsScreen);

  const controller = await container.get('HomeCall_Web_Ui_Controller$');
  controller.showHome({ container: 'root', onStartCall: () => {} });
  controller.showInvite({ container: 'invite-root', sessionId: 'session42', inviteUrl: 'https://svyazist.app/?session=session42' });
  controller.showCall({ container: 'call-root', remoteStream: 'stream', onEnd: () => {} });
  controller.showEnd({ container: 'end-root', connectionMessage: 'ok', onReturn: () => {} });
  controller.updateRemoteStream('stream2');
  controller.showSettings({ container: 'settings-root', onClose: () => {} });

  assert.strictEqual(recorded.home?.container, 'root');
  assert.strictEqual(typeof recorded.home?.onStartCall, 'function');
  assert.strictEqual(recorded.invite?.sessionId, 'session42');
  assert.ok(recorded.invite?.inviteUrl?.includes('session=session42'));
  assert.strictEqual(recorded.call?.remoteStream, 'stream');
  assert.strictEqual(recorded.end?.connectionMessage, 'ok');
  assert.strictEqual(recorded.stream, 'stream2');
  assert.strictEqual(recorded.settings?.container, 'settings-root');
});
