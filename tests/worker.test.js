import { test } from 'node:test';
import assert from 'node:assert';
import { Worker } from '../src/worker/Worker.js';
import { SharedWorker } from '../src/worker/SharedWorker.js';
import { FontFace } from '../src/dom/css/font_face.js';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test('Web Worker basic communication', async () => {
    const worker = new Worker(path.join(__dirname, 'test-worker.js'));

    const messagePromise = new Promise(resolve => {
        worker.onmessage = (e) => {
            resolve(e.data);
        };
    });

    worker.postMessage({ command: 'echo', data: 'hello' });

    const response = await messagePromise;
    assert.deepStrictEqual(response, { response: 'echo', data: 'hello' });

    worker.terminate();
});

test('Web Worker font loading', async () => {
    const worker = new Worker(path.join(__dirname, 'test-worker.js'));

    const fontReadyPromise = new Promise(resolve => {
        worker.onmessage = (e) => {
            if (e.data.response === 'fontLoaded') {
                resolve(e.data.isLoaded);
            }
        };
    });

    const fontPath = path.join(__dirname, '../fonts/DejaVuSans.ttf');
    worker.postMessage({ command: 'loadFont', fontPath: fontPath, family: 'TestFont' });

    const isLoaded = await fontReadyPromise;
    assert.ok(isLoaded, 'Font should be loaded inside the worker');

    worker.terminate();
});

test('SharedWorker basic communication', async () => {
    const scriptURL = path.join(__dirname, 'test-shared-worker.js');

    // Create two clients for the same shared worker
    const client1 = new SharedWorker(scriptURL);
    const client2 = new SharedWorker(scriptURL);

    // Promise for receiving a message on client1
    const messagePromise1 = new Promise(resolve => {
        client1.port.onmessage = e => resolve(e.data);
    });

    // Promise for receiving a message on client2
    const messagePromise2 = new Promise(resolve => {
        client2.port.onmessage = e => resolve(e.data);
    });

    // Send a message from client1 to broadcast
    client1.port.postMessage('ping');

    // Both clients should receive the broadcasted "pong"
    const response1 = await messagePromise1;
    const response2 = await messagePromise2;

    assert.strictEqual(response1, 'pong', 'Client 1 should receive "pong"');
    assert.strictEqual(response2, 'pong', 'Client 2 should also receive "pong"');

    // Close the ports, which should eventually terminate the worker
    client1.port.close();
    client2.port.close();
});

test('SharedWorker font loading', async () => {
    const scriptURL = path.join(__dirname, 'test-shared-worker.js');
    const worker = new SharedWorker(scriptURL);

    const fontReadyPromise = new Promise(resolve => {
        worker.port.onmessage = (e) => {
            if (e.data.response === 'fontLoaded') {
                resolve(e.data.isLoaded);
            }
        };
    });

    const fontPath = path.join(__dirname, '../fonts/DejaVuSans.ttf');
    worker.port.postMessage({ command: 'loadFont', fontPath: fontPath, family: 'SharedTestFont' });

    const isLoaded = await fontReadyPromise;
    assert.ok(isLoaded, 'Font should be loaded inside the shared worker');

    worker.port.close();
});
