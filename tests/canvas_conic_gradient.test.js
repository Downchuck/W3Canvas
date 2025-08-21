import { test } from 'node:test';
import assert from 'node:assert';
import { CanvasRenderingContext2D } from '../src/core/canvas/CanvasRenderingContext2D.js';
import { write_png } from './test-helpers.js';

test('Create a conic gradient', (t) => {
    const ctx = new CanvasRenderingContext2D(100, 100);

    // This function does not exist yet, so this test will fail.
    // I will implement it in the next step.
    const gradient = ctx.createConicGradient(0, 50, 50);

    gradient.addColorStop(0, 'red');
    gradient.addColorStop(0.25, 'blue');
    gradient.addColorStop(0.5, 'green');
    gradient.addColorStop(0.75, 'yellow');
    gradient.addColorStop(1, 'red');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 100, 100);

    // Test a pixel at 270 degrees (75% progress)
    const pixel = ctx.getImageData(25, 50, 1, 1).data;

    // The color should be yellow.
    assert.strictEqual(pixel[0], 255, 'red channel should be 255 for yellow');
    assert.strictEqual(pixel[1], 255, 'green channel should be 255 for yellow');
    assert.strictEqual(pixel[2], 0, 'blue channel should be 0 for yellow');
    assert.strictEqual(pixel[3], 255, 'alpha channel should be 255');

    write_png(ctx.imageData, 'conic_gradient.png');
});
