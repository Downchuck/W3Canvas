import { test } from 'node:test';
import assert from 'node:assert';
import { CanvasRenderingContext2D } from '../src/core/canvas/CanvasRenderingContext2D.js';

function assertPixel(ctx, x, y, r, g, b, a, message) {
    const pixelData = ctx.getImageData(x, y, 1, 1).data;
    assert.strictEqual(pixelData[0], r, `${message} - red`);
    assert.strictEqual(pixelData[1], g, `${message} - green`);
    assert.strictEqual(pixelData[2], b, `${message} - blue`);
    assert(Math.abs(pixelData[3] - a) <= 1, `${message} - alpha`);
}

test('fillRect with solid color', () => {
    const ctx = new CanvasRenderingContext2D(100, 100);
    ctx.fillStyle = 'red';
    ctx.fillRect(20, 20, 50, 50);
    assertPixel(ctx, 30, 30, 255, 0, 0, 255, 'Pixel should be red');
});

test('fillRect with transparent color', () => {
    const ctx = new CanvasRenderingContext2D(100, 100);
    ctx.fillStyle = 'rgba(0, 0, 255, 0.5)';
    ctx.fillRect(20, 20, 50, 50);
    assertPixel(ctx, 30, 30, 0, 0, 255, 127, 'Pixel should be blue with 0.5 alpha');
});
