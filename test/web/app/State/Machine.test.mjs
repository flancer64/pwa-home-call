import test from 'node:test';
import assert from 'node:assert/strict';
import { createWebContainer } from '../../helper.mjs';

test('state machine follows ready → waiting → active → ended → ready', async () => {
  const container = await createWebContainer();
  const machine = await container.get('HomeCall_Web_State_Machine$');

  assert.equal(machine.getState(), 'ready');
  machine.transition('waiting');
  assert.equal(machine.getState(), 'waiting');
  machine.transition('active');
  assert.equal(machine.getState(), 'active');
  machine.transition('ended');
  assert.equal(machine.getState(), 'ended');
  machine.transition('ready');
  assert.equal(machine.getState(), 'ready');
});

test('state machine rejects invalid transitions', async () => {
  const container = await createWebContainer();
  const machine = await container.get('HomeCall_Web_State_Machine$');
  assert.throws(() => machine.transition('ended'), /Invalid state transition/);
});
