import test from 'node:test';
import assert from 'node:assert/strict';
import { createWebContainer } from '../../helper.mjs';

test('returns current state for each media type', async () => {
  const container = await createWebContainer();
  const mediaState = await container.get('HomeCall_Web_State_Media$');

  mediaState.initState('blocked', 'paused');
  mediaState.setVideoReady();
  mediaState.setAudioReady();

  assert.deepEqual(mediaState.get(), { video: 'ready', audio: 'ready' });
});

test('fires event when state changes', async () => {
  const container = await createWebContainer();
  const mediaState = await container.get('HomeCall_Web_State_Media$');
  const events = [];
  const unsubscribe = mediaState.onVideoReady((params, from, to) => {
    events.push({ params, from, to });
  });

  try {
    const payload = { streamId: 'fake-stream' };
    mediaState.setVideoReady(payload);
    assert.equal(events.length, 1);
    assert.equal(events[0].from, 'off');
    assert.equal(events[0].to, 'ready');
    assert.deepEqual(events[0].params, payload);

    mediaState.setVideoReady(payload);
    assert.equal(events.length, 1, 'event should not fire again for the same state');
  } finally {
    unsubscribe();
  }
});

test('isolates state between container instances', async () => {
  const firstContainer = await createWebContainer();
  const secondContainer = await createWebContainer();
  const firstState = await firstContainer.get('HomeCall_Web_State_Media$');
  const secondState = await secondContainer.get('HomeCall_Web_State_Media$');

  firstState.setVideoReady();
  firstState.setAudioReady();

  assert.deepEqual(firstState.get(), { video: 'ready', audio: 'ready' });
  assert.deepEqual(secondState.get(), { video: 'off', audio: 'off' });
});
