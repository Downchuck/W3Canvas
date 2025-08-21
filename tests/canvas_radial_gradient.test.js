import { test } from 'node:test';
import assert from 'node:assert';
import { CanvasRenderingContext2D } from '../src/core/canvas/CanvasRenderingContext2D.js';
import { CanvasGradient } from '../src/core/canvas/CanvasGradient.js';

test('createRadialGradient returns a CanvasGradient object', (t) => {
    const ctx = new CanvasRenderingContext2D(100, 100);
    const gradient = ctx.createRadialGradient(50, 50, 10, 50, 50, 50);
    assert.ok(gradient instanceof CanvasGradient, 'should return a CanvasGradient instance');
    assert.strictEqual(gradient.type, 'radial');
    assert.strictEqual(gradient.x0, 50);
    assert.strictEqual(gradient.r1, 50);
});

test('simple concentric radial gradient', (t) => {
    const ctx = new CanvasRenderingContext2D(100, 100);
    const gradient = ctx.createRadialGradient(50, 50, 10, 50, 50, 50);
    gradient.addColorStop(0, 'red');
    gradient.addColorStop(1, 'blue');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 100, 100);

    const imageData = ctx.getImageData(50, 50, 1, 1);
    const { data } = imageData;

    // Check center pixel - should be red
    assert.strictEqual(data[0], 255, 'Red channel at center should be 255');
    assert.strictEqual(data[1], 0, 'Green channel at center should be 0');
    assert.strictEqual(data[2], 0, 'Blue channel at center should be 0');
    assert.strictEqual(data[3], 255, 'Alpha channel at center should be 255');
});

test('radial gradient with r0 > r1', (t) => {
    const ctx = new CanvasRenderingContext2D(100, 100);
    // NB: r0 > r1
    const gradient = ctx.createRadialGradient(50, 50, 50, 50, 50, 10);
    gradient.addColorStop(0, 'red');
    gradient.addColorStop(1, 'blue');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 100, 100);

    // At (50, 50), the center of the gradient, the color should be red.
    // The radius is 50, which corresponds to t=0.
    const centerImageData = ctx.getImageData(50, 50, 1, 1);
    const centerData = centerImageData.data;
    assert.strictEqual(centerData[0], 0, 'Red channel at center should be 0 for blue');
    assert.strictEqual(centerData[1], 0, 'Green channel at center should be 0 for blue');
    assert.strictEqual(centerData[2], 255, 'Blue channel at center should be 255 for blue');

    // At (50, 60), which is 10px away from the center.
    // The gradient goes from r=50 (t=0) to r=10 (t=1).
    // A distance of 10px from the center corresponds to r=40.
    // (dist - r0) / (r1 - r0) = (10 - 50) / (10 - 50) = 1
    // So the color should be blue.
    const pointImageData = ctx.getImageData(50, 60, 1, 1);
    const pointData = pointImageData.data;
    assert.strictEqual(pointData[0], 0, 'Red channel at (50,60) should be 0 for blue');
    assert.strictEqual(pointData[1], 0, 'Green channel at (50,60) should be 0 for blue');
    assert.strictEqual(pointData[2], 255, 'Blue channel at (50,60) should be 255 for blue');
});
