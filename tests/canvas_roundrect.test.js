import { test } from 'node:test';
import assert from 'node:assert';
import { CanvasRenderingContext2D } from '../src/core/canvas/CanvasRenderingContext2D.js';

test('draw a rounded rectangle', (t) => {
    const ctx = new CanvasRenderingContext2D(100, 100);
    ctx.fillStyle = 'red';
    ctx.roundRect(10, 10, 80, 80, 10);
    ctx.fill();

    // Check a corner pixel to see if it's rounded (transparent)
    const cornerPixel = ctx.getImageData(12, 12, 1, 1).data;
    assert.strictEqual(cornerPixel[3], 0, 'alpha channel of corner pixel should be 0');

    // Check a center pixel to see if it's filled
    const centerPixel = ctx.getImageData(50, 50, 1, 1).data;
    assert.strictEqual(centerPixel[0], 255, 'red channel of center pixel should be 255');
    assert.strictEqual(centerPixel[3], 255, 'alpha channel of center pixel should be 255');
});
