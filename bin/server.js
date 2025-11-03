#!/usr/bin/env node

import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Container from '@teqfw/di';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const container = new Container();
const resolver = container.getResolver();
resolver.addNamespaceRoot('HomeCall_', path.join(rootDir, 'src'));
resolver.addNamespaceRoot('Teqfw_Di_', path.join(rootDir, 'node_modules', '@teqfw', 'di', 'src'));

const preProcessor = container.getPreProcessor();
/** @type {TeqFw_Di_Pre_Replace} */
const replacer = await container.get('Teqfw_Di_Pre_Replace$');
preProcessor.addChunk(replacer);
replacer.add('HomeCall_Back_Contract_Logger', 'HomeCall_Back_Logger');

const app = await container.get('HomeCall_Back_App$');

let shuttingDown = false;
const shutdown = async () => {
    if (shuttingDown) return;
    shuttingDown = true;
    await app.stop();
    process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

await app.run();
