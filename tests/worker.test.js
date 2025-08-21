import { test, after } from 'node:test';
import assert from 'node:assert';
import { Worker } from '../src/worker/Worker.js';
import { SharedWorker, shutdownAllSharedWorkers } from '../src/worker/SharedWorker.js';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test('Web Worker basic communication', async () => {
    const worker = new Worker(path.join(__dirname, 'test-worker.js'));
    await worker.ready;

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
    await worker.ready;

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

    const client1 = new SharedWorker(scriptURL);
    await client1.ready;
    const client2 = new SharedWorker(scriptURL);
    await client2.ready;

    const messagePromise1 = new Promise(resolve => {
        client1.port.onmessage = e => resolve(e.data);
    });

    const messagePromise2 = new Promise(resolve => {
        client2.port.onmessage = e => resolve(e.data);
    });

    client1.port.postMessage('ping');

    const response1 = await messagePromise1;
    const response2 = await messagePromise2;

    assert.strictEqual(response1, 'pong', 'Client 1 should receive "pong"');
    assert.strictEqual(response2, 'pong', 'Client 2 should also receive "pong"');

    client1.port.close();
    client2.port.close();
});

test('SharedWorker font loading', async () => {
    const scriptURL = path.join(__dirname, 'test-shared-worker.js');
    const worker = new SharedWorker(scriptURL);
    await worker.ready;

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

test('Web Worker transferable ArrayBuffer', async () => {
    const worker = new Worker(path.join(__dirname, 'test-worker.js'));
    await worker.ready;

    const messagePromise = new Promise(resolve => {
        worker.onmessage = (e) => {
            if (e.data.response === 'arrayBuffer') {
                resolve(e.data.sum);
            }
        };
    });

    const buffer = new ArrayBuffer(8);
    const view = new Uint8Array(buffer);
    view.set([1, 2, 3, 4, 5, 6, 7, 8]);

    worker.postMessage({ command: 'arrayBuffer', buffer: buffer }, [buffer]);

    assert.strictEqual(buffer.byteLength, 0, 'ArrayBuffer should be transferred, not copied');

    const sum = await messagePromise;
    assert.strictEqual(sum, 36, 'Worker should correctly sum the bytes in the ArrayBuffer');

    worker.terminate();
});

test('Web Worker onerror handler', async () => {
    const worker = new Worker(path.join(__dirname, 'test-worker.js'));
    await worker.ready;

    const errorPromise = new Promise(resolve => {
        worker.onerror = (err) => {
            worker.terminate();
            resolve(err);
        };
    });

    const exitPromise = new Promise(resolve => {
        worker.onexit = (code) => {
            resolve(code);
        };
    });

    worker.postMessage({ command: 'error' });

    const error = await errorPromise;
    const exitCode = await exitPromise;

    assert.ok(error instanceof Error, 'The onerror handler should receive an Error object');
    assert.strictEqual(error.message, 'This is a test error from inside the worker.');
    assert.ok(exitCode === 1 || exitCode === 0, 'Worker should exit cleanly');
});

after(() => {
    shutdownAllSharedWorkers();
});
