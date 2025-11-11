import test from 'node:test';
import assert from 'node:assert/strict';
import HomeCall_Web_Ui_Toast from '../../../../web/app/Ui/Toast.mjs';

function createFakeEnv() {
  const timers = new Map();
  const cancelled = [];
  let id = 0;
  return {
    console: { log: () => {} },
    setTimeout(handler) {
      const handle = ++id;
      timers.set(handle, handler);
      return handle;
    },
    clearTimeout(handle) {
      cancelled.push(handle);
      timers.delete(handle);
    },
    triggerNext() {
      const iterator = timers.keys();
      const next = iterator.next();
      if (next.done) {
        return null;
      }
      const handle = next.value;
      const handler = timers.get(handle);
      if (!handler) {
        return null;
      }
      timers.delete(handle);
      handler();
      return handle;
    },
    get pending() {
      return [...timers.keys()];
    },
    get cancelled() {
      return [...cancelled];
    }
  };
}

function createLoggerSpy() {
  const calls = [];
  const levels = ['debug', 'info', 'success', 'warn', 'error'];
  const logger = {};
  for (const level of levels) {
    logger[level] = (message) => calls.push({ level, message });
  }
  return { logger, calls };
}

test('web toast queue honors env timers and logger levels', () => {
  const env = createFakeEnv();
  const { logger, calls } = createLoggerSpy();
  const toast = new HomeCall_Web_Ui_Toast({
    HomeCall_Web_Env_Provider$: env,
    HomeCall_Web_Shared_Logger$: logger
  });

  toast.info('alpha');
  toast.warn('beta');

  assert.strictEqual(toast.queue.length, 2);
  assert.strictEqual(env.pending.length, 1);

  const first = env.triggerNext();
  assert.ok(first);
  assert.strictEqual(env.pending.length, 1);

  const logLevels = calls.map((entry) => entry.level);
  assert.ok(logLevels.includes('info'));

  env.triggerNext();
  assert.strictEqual(env.pending.length, 0);
  assert.strictEqual(toast.queue.length, 0);
});

test('web toast hide interrupts display and starts next', () => {
  const env = createFakeEnv();
  const { logger, calls } = createLoggerSpy();
  const toast = new HomeCall_Web_Ui_Toast({
    HomeCall_Web_Env_Provider$: env,
    HomeCall_Web_Shared_Logger$: logger
  });

  toast.success('first');
  toast.error('second');

  const pendingBefore = env.pending[0];
  toast.hide();
  assert.ok(env.cancelled.includes(pendingBefore));

  const logLevels = calls.map((entry) => entry.level);
  assert.ok(logLevels.includes('success'));
  assert.strictEqual(toast.queue.length, 1);
});
