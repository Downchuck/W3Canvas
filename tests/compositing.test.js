import { test } from 'node:test';
import assert from 'node:assert';
import { CanvasRenderingContext2D } from '../src/core/canvas/CanvasRenderingContext2D.js';

test('source-over compositing should work correctly', () => {
    const ctx = new CanvasRenderingContext2D(100, 100);

    // Draw a red square
    ctx.fillStyle = 'red';
    ctx.fillRect(20, 20, 50, 50);

    // Draw a blue square on top of it
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = 'blue';
    ctx.fillRect(40, 40, 50, 50);

    // Check a pixel in the overlapping area
    const pixelData = ctx.getImageData(50, 50, 1, 1).data;
    assert.strictEqual(pixelData[2], 255, 'Overlapping pixel should be blue');
});
