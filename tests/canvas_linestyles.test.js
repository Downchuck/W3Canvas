import { test } from 'node:test';
import assert from 'node:assert';
import { CanvasRenderingContext2D } from '../src/core/canvas/CanvasRenderingContext2D.js';

test('setLineDash and getLineDash should work correctly', () => {
    const ctx = new CanvasRenderingContext2D(100, 100);

    const dashes1 = [10, 5];
    ctx.setLineDash(dashes1);
    assert.deepStrictEqual(ctx.getLineDash(), [10, 5]);

    const dashes2 = [10, 5, 2];
    ctx.setLineDash(dashes2);
    assert.deepStrictEqual(ctx.getLineDash(), [10, 5, 2, 10, 5, 2]);

    ctx.setLineDash([]);
    assert.deepStrictEqual(ctx.getLineDash(), []);
});

test('should draw a dashed line', () => {
    const ctx = new CanvasRenderingContext2D(100, 100);
    ctx.strokeStyle = 'blue';
    ctx.lineWidth = 2;
    ctx.setLineDash([10, 10]);

    ctx.beginPath();
    ctx.moveTo(10, 50);
    ctx.lineTo(90, 50);
    ctx.stroke();

    const pixelInDash1 = ctx.getImageData(15, 50, 1, 1).data;
    assert.strictEqual(pixelInDash1[2], 255);

    const pixelInGap1 = ctx.getImageData(25, 50, 1, 1).data;
    assert.strictEqual(pixelInGap1[3], 0);
});

test('lineDashOffset should shift the pattern', () => {
    const ctx = new CanvasRenderingContext2D(100, 100);
    ctx.strokeStyle = 'green';
    ctx.lineWidth = 2;
    ctx.setLineDash([10, 10]);
    ctx.lineDashOffset = 5;

    ctx.beginPath();
    ctx.moveTo(10, 50);
    ctx.lineTo(90, 50);
    ctx.stroke();

    const pixelInFirstPart = ctx.getImageData(12, 50, 1, 1).data;
    assert.strictEqual(pixelInFirstPart[1], 255);

    const pixelInGap = ctx.getImageData(20, 50, 1, 1).data;
    assert.strictEqual(pixelInGap[3], 0);
});

test('miterLimit should cap sharp corners', () => {
    const ctx = new CanvasRenderingContext2D(100, 100);
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 10;
    ctx.lineJoin = 'miter';

    // Create a very sharp angle. The miter ratio for this angle is ~2.23.
    ctx.beginPath();
    ctx.moveTo(20, 80);
    ctx.lineTo(50, 20);
    ctx.lineTo(80, 80);

    // With a high miter limit, the point should be sharp.
    // The miter tip will be at y = 20 - (lineWidth/2) * miterRatio = 20 - 5 * 2.236 = ~8.82
    ctx.miterLimit = 10;
    ctx.stroke();

    // Check a pixel near the miter tip
    const miterPixel = ctx.getImageData(50, 10, 1, 1).data;
    assert.strictEqual(miterPixel[0], 255, 'With high limit, miter point should be drawn');
    assert.strictEqual(miterPixel[3], 255, 'With high limit, miter point should be opaque');

    // Clear and redraw with a low miter limit, which should bevel the corner
    ctx.clearRect(0, 0, 100, 100);
    ctx.miterLimit = 2; // This is less than the miter ratio, so it will be beveled
    ctx.stroke();

    // Check that the miter tip is now cut off (transparent)
    const beveledPixel = ctx.getImageData(50, 10, 1, 1).data;
    assert.strictEqual(beveledPixel[3], 0, 'With low limit, miter point should be cut off');
});
