import { test } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { createTestContainer } from './helper.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function normalize(pathname) {
    return pathname.replace(/\\/g, '/');
}

test('createTestContainer registers HomeCall namespace root', async () => {
    const container = await createTestContainer();
    assert.ok(container, 'container is created');

    const resolver = container.getResolver();
    const resolvedPath = resolver.resolve('HomeCall_Test_Sample');

    const expectedRoot = normalize(path.resolve(__dirname, '../../src'));
    const expectedPath = `${expectedRoot}/Test/Sample.js`;

    assert.equal(resolvedPath, expectedPath, 'resolver should map namespace to src folder');
});
