import test from 'node:test';
import assert from 'node:assert/strict';
import HomeCall_Web_Core_SessionManager from '../../../../web/app/Core/SessionManager.mjs';

test('Session manager exposes session URLs and parses query params', () => {
  const location = new URL('https://domozvon.app/?session=initiator123');
  const historyCalls = [];
  const history = {
    replaceState(state, title, url) {
      historyCalls.push({ state, title, url });
    }
  };
  const env = {
    window: {
      location,
      history
    }
  };
  const manager = new HomeCall_Web_Core_SessionManager({ HomeCall_Web_Env_Provider$: env });
  const inviteSession = manager.createSessionId();
  assert.equal(typeof inviteSession, 'string');
  const inviteUrl = manager.buildInviteUrl(inviteSession);
  assert.ok(inviteUrl.includes('?session='), 'invite link should embed the session param');
  const parsed = manager.readSessionFromUrl();
  assert.equal(parsed, 'initiator123');
  manager.clearSessionFromUrl();
  assert.ok(historyCalls.length >= 1);
  assert.ok(!historyCalls[0].url.includes('session='));
});
