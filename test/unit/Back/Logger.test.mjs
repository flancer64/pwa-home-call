/**
 * @module test.unit.Back.Logger
 * @description Unit tests for HomeCall_Back_Logger implementation (with timestamp).
 */

import assert from 'node:assert/strict';
import { beforeEach, afterEach, describe, it } from 'node:test';
import { createTestContainer } from '../helper.mjs';

const TEST_NAMESPACE = 'Test.Namespace';
const TIMESTAMP_REGEX = /^\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\]/;

describe('HomeCall_Back_Logger', () => {
    /** @type {Console} */
    let originalConsole;
    /** @type {{ method: string, args: any[] }[]} */
    let records;

    const createMockConsole = () => {
        records = [];
        return {
            log: (...args) => {
                records.push({ method: 'log', args });
            },
            info: (...args) => {
                records.push({ method: 'info', args });
            },
            warn: (...args) => {
                records.push({ method: 'warn', args });
            },
            error: (...args) => {
                records.push({ method: 'error', args });
            },
        };
    };

    beforeEach(() => {
        originalConsole = globalThis.console;
        globalThis.console = createMockConsole();
    });

    afterEach(() => {
        globalThis.console = originalConsole;
    });

    it('implements the logger contract', async () => {
        const container = await createTestContainer();
        const logger = await container.get('HomeCall_Back_Logger$');
        assert.equal(typeof logger.info, 'function');
        assert.equal(typeof logger.warn, 'function');
        assert.equal(typeof logger.error, 'function');
        assert.equal(typeof logger.exception, 'function');
    });

    it('logs info messages with timestamp and expected format', async () => {
        const container = await createTestContainer();
        const logger = await container.get('HomeCall_Back_Logger$');
        logger.info(TEST_NAMESPACE, 'hello world');
        assert.equal(records.length, 1);
        const [entry] = records;
        assert.match(entry.args[0], new RegExp(`${TIMESTAMP_REGEX.source} \\[INFO\\] \\[${TEST_NAMESPACE}\\] hello world$`));
    });

    it('logs warnings with timestamp and expected format', async () => {
        const container = await createTestContainer();
        const logger = await container.get('HomeCall_Back_Logger$');
        logger.warn(TEST_NAMESPACE, 'careful');
        assert.equal(records.length, 1);
        const [entry] = records;
        assert.match(entry.args[0], new RegExp(`${TIMESTAMP_REGEX.source} \\[WARN\\] \\[${TEST_NAMESPACE}\\] careful$`));
    });

    it('logs errors with timestamp and expected format', async () => {
        const container = await createTestContainer();
        const logger = await container.get('HomeCall_Back_Logger$');
        logger.error(TEST_NAMESPACE, 'boom');
        assert.equal(records.length, 1);
        const [entry] = records;
        assert.match(entry.args[0], new RegExp(`${TIMESTAMP_REGEX.source} \\[ERROR\\] \\[${TEST_NAMESPACE}\\] boom$`));
    });

    it('logs exceptions with timestamp, message, and stack trace', async () => {
        const container = await createTestContainer();
        const logger = await container.get('HomeCall_Back_Logger$');
        const error = new Error('unexpected');
        logger.exception(TEST_NAMESPACE, error);
        assert.equal(records.length, 1);
        const [entry] = records;
        assert.match(entry.args[0], new RegExp(`${TIMESTAMP_REGEX.source} \\[EXCEPTION\\] \\[${TEST_NAMESPACE}\\] unexpected$`));
        assert.ok(entry.args.length >= 1);
    });
});
