import { test } from 'node:test';
import assert from 'node:assert';
import { CanvasRenderingContext2D } from '../src/core/canvas/CanvasRenderingContext2D.js';

test('Fill a simple bezier curve path', (t) => {
    const ctx = new CanvasRenderingContext2D(100, 100);
    ctx.fillStyle = 'blue';

    ctx.beginPath();
    ctx.moveTo(10, 50);
    ctx.bezierCurveTo(30, 10, 70, 90, 90, 50);
    ctx.closePath(); // This makes a closed shape with a straight line back to (10, 50)
    ctx.fill();

    // Check a pixel that should be inside the curve
    const imageData = ctx.getImageData(50, 50, 1, 1).data;
    assert.strictEqual(imageData[2], 255, 'Pixel at (50, 50) should be blue');

    // Check a pixel that should be outside
    const imageData2 = ctx.getImageData(1, 1, 1, 1).data;
    assert.strictEqual(imageData2[3], 0, 'Pixel at (1, 1) should be transparent');
});

test('Fill a bezier curve path with small fractional coordinates', (t) => {
    const ctx = new CanvasRenderingContext2D(100, 100);
    ctx.fillStyle = 'red';

    ctx.beginPath();
    ctx.moveTo(10.1, 50.5);
    ctx.bezierCurveTo(12.3, 48.2, 18.7, 52.8, 20.9, 50.5);
    ctx.closePath();
    ctx.fill();

    // Check a pixel that should be inside this small curve
    const imageData = ctx.getImageData(15, 50, 1, 1).data;
    assert.strictEqual(imageData[0], 255, 'Pixel at (15, 50) should be red');
});
