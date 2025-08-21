import { test } from 'node:test';
import assert from 'node:assert';
import { CanvasRenderingContext2D } from '../src/core/canvas/CanvasRenderingContext2D.js';

test('roundRect with single radius', (t) => {
    const ctx = new CanvasRenderingContext2D(100, 100);
    ctx.fillStyle = 'red';
    ctx.roundRect(10, 10, 80, 80, 10);
    ctx.fill();

    const cornerPixel = ctx.getImageData(12, 12, 1, 1).data;
    assert.strictEqual(cornerPixel[3], 0, 'alpha channel of corner pixel should be 0');

    const centerPixel = ctx.getImageData(50, 50, 1, 1).data;
    assert.strictEqual(centerPixel[0], 255, 'red channel of center pixel should be 255');
    assert.strictEqual(centerPixel[3], 255, 'alpha channel of center pixel should be 255');
});

test('roundRect with one-value array radius', (t) => {
    const ctx = new CanvasRenderingContext2D(100, 100);
    ctx.fillStyle = 'red';
    ctx.roundRect(10, 10, 80, 80, [10]);
    ctx.fill();

    const cornerPixel = ctx.getImageData(12, 12, 1, 1).data;
    assert.strictEqual(cornerPixel[3], 0, 'alpha channel of corner pixel should be 0');
});

test('roundRect with two-value array radius', (t) => {
    const ctx = new CanvasRenderingContext2D(100, 100);
    ctx.fillStyle = 'blue';
    ctx.roundRect(10, 10, 80, 80, [10, 20]);
    ctx.fill();

    const topLeftCorner = ctx.getImageData(12, 12, 1, 1).data;
    assert.strictEqual(topLeftCorner[3], 0, 'top-left corner should be rounded');

    const topRightCorner = ctx.getImageData(88, 12, 1, 1).data;
    assert.strictEqual(topRightCorner[3], 0, 'top-right corner should be rounded');
});

test('roundRect with three-value array radius', (t) => {
    const ctx = new CanvasRenderingContext2D(100, 100);
    ctx.fillStyle = 'green';
    ctx.roundRect(10, 10, 80, 80, [10, 20, 30]);
    ctx.fill();

    const bottomRightCorner = ctx.getImageData(88, 88, 1, 1).data;
    assert.strictEqual(bottomRightCorner[3], 0, 'bottom-right corner should be rounded with 30px radius');
});

test('roundRect with four-value array radius', (t) => {
    const ctx = new CanvasRenderingContext2D(100, 100);
    ctx.fillStyle = 'purple';
    ctx.roundRect(10, 10, 80, 80, [10, 20, 30, 40]);
    ctx.fill();

    const bottomLeftCorner = ctx.getImageData(12, 88, 1, 1).data;
    assert.strictEqual(bottomLeftCorner[3], 0, 'bottom-left corner should be rounded with 40px radius');
});

test('roundRect with negative radius should throw error', (t) => {
    const ctx = new CanvasRenderingContext2D(100, 100);
    assert.throws(() => {
        ctx.roundRect(10, 10, 80, 80, [-10]);
    }, RangeError, "Negative radius should throw a RangeError");
});
