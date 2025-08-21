import { test } from 'node:test';
import assert from 'node:assert';
import { CanvasRenderingContext2D } from '../src/core/canvas/CanvasRenderingContext2D.js';

test('globalAlpha should make shapes semi-transparent', () => {
    const ctx = new CanvasRenderingContext2D(100, 100);

    ctx.fillStyle = 'red'; // Alpha 255
    ctx.globalAlpha = 0.5;

    ctx.fillRect(10, 10, 80, 80);

    const pixel = ctx.getImageData(50, 50, 1, 1).data;
    assert.strictEqual(pixel[0], 255, 'R channel should be 255');
    assert.strictEqual(pixel[3], 128, 'Alpha should be 255 * 0.5 = 127.5, rounded to 128');
});

test('globalAlpha should default to 1.0', () => {
    const ctx = new CanvasRenderingContext2D(100, 100);

    ctx.fillStyle = 'rgba(0, 0, 255, 0.5)'; // Alpha 128

    ctx.fillRect(10, 10, 80, 80);

    const pixel = ctx.getImageData(50, 50, 1, 1).data;
    assert.strictEqual(pixel[2], 255, 'B channel should be 255');
    // Alpha should be 128 * 1.0 = 128
    assert.strictEqual(pixel[3], 128, 'Alpha should be unchanged when globalAlpha is 1.0');
});

test('globalAlpha = 0 should make shapes completely transparent', () => {
    const ctx = new CanvasRenderingContext2D(100, 100);

    ctx.fillStyle = 'green';
    ctx.globalAlpha = 0.0;

    ctx.fillRect(10, 10, 80, 80);

    const pixel = ctx.getImageData(50, 50, 1, 1).data;
    assert.strictEqual(pixel[3], 0, 'Alpha should be 0');
});

test('globalAlpha should be handled by save() and restore()', () => {
    const ctx = new CanvasRenderingContext2D(100, 100);

    ctx.globalAlpha = 0.2;
    ctx.save();

    ctx.globalAlpha = 0.8;
    ctx.fillRect(10, 10, 40, 40);

    const pixel1 = ctx.getImageData(30, 30, 1, 1).data;
    assert.strictEqual(pixel1[3], Math.round(255 * 0.8), 'Alpha should be modulated by 0.8');

    ctx.restore();

    ctx.fillRect(50, 50, 40, 40);
    const pixel2 = ctx.getImageData(70, 70, 1, 1).data;
    assert.strictEqual(pixel2[3], Math.round(255 * 0.2), 'Alpha should be modulated by restored 0.2');
});
