import { test } from 'node:test';
import assert from 'node:assert';
import { OffscreenCanvas } from '../src/core/canvas/OffscreenCanvas.js';
import { HTMLCanvasElement } from '../src/dom/html/dom_html_canvas.js';
import { Worker } from '../src/worker/Worker.js';
import path from 'path';

// Mock registerElement if it's not available in this test context
if (typeof global.registerElement === 'undefined') {
    global.registerElement = () => {};
}

test('OffscreenCanvas: should be created with correct dimensions', () => {
    const canvas = new OffscreenCanvas(100, 200);
    assert.strictEqual(canvas.width, 100);
    assert.strictEqual(canvas.height, 200);
});

test('OffscreenCanvas: getContext("2d") should return a valid context', () => {
    const canvas = new OffscreenCanvas(100, 150);
    const ctx = canvas.getContext('2d');
    assert.ok(ctx, 'Context should be created');
    assert.strictEqual(ctx.canvas, canvas, 'Context should reference the canvas');
    assert.strictEqual(ctx.width, 100);
    assert.strictEqual(ctx.height, 150);
});

test('OffscreenCanvas: should support basic drawing operations', () => {
    const canvas = new OffscreenCanvas(100, 100);
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'red';
    ctx.fillRect(10, 10, 50, 50);
    const imageData = ctx.getImageData(10, 10, 1, 1);
    assert.deepStrictEqual([...imageData.data], [255, 0, 0, 255], 'Pixel should be red');
});

test('HTMLCanvasElement: transferControlToOffscreen should work correctly', () => {
    const canvas = new HTMLCanvasElement();
    canvas.setWidth(100);
    canvas.setHeight(100);

    const offscreenCanvas = canvas.transferControlToOffscreen();
    assert.ok(offscreenCanvas instanceof OffscreenCanvas, 'Should return an OffscreenCanvas');
    assert.strictEqual(offscreenCanvas.width, 100);
    assert.strictEqual(offscreenCanvas.height, 100);

    const ctx = canvas.getContext('2d');
    assert.strictEqual(ctx, null, 'Original canvas context should be inaccessible');
});

test('OffscreenCanvas: should work in a Web Worker', { timeout: 2000 }, (t, done) => {
    const workerScriptPath = path.resolve(process.cwd(), 'tests/test-worker-offscreencanvas.js');
    const worker = new Worker(workerScriptPath);

    worker.onmessage = (e) => {
        const { imageBitmap } = e.data;
        assert.ok(imageBitmap, 'Worker should send back an imageBitmap');
        assert.strictEqual(imageBitmap.width, 100);
        assert.strictEqual(imageBitmap.height, 150);

        // Check a pixel to see if it was drawn on
        const pixelData = imageBitmap.data;
        const pixelIndex = (0 * 100 + 0) * 4; // Top-left pixel
        assert.deepStrictEqual(
            [...pixelData.slice(pixelIndex, pixelIndex + 4)],
            [0, 0, 255, 255],
            'Pixel should be blue'
        );

        worker.terminate();
        done();
    };

    worker.postMessage({ width: 100, height: 150 });
});
