import { test } from 'node:test';
import assert from 'node:assert';
import { CanvasRenderingContext2D } from '../src/core/canvas/CanvasRenderingContext2D.js';

test('fillRect with translation', (t) => {
    const ctx = new CanvasRenderingContext2D(100, 100);
    ctx.translate(10, 20);
    ctx.fillStyle = 'red';
    ctx.fillRect(0, 0, 10, 10);

    const imageData = ctx.getImageData(0, 0, 100, 100);
    const { data, width } = imageData;

    // Check a pixel inside the translated rectangle
    let x = 15;
    let y = 25;
    let index = (y * width + x) * 4;
    assert.strictEqual(data[index], 255, 'Red channel should be 255');
    assert.strictEqual(data[index + 1], 0, 'Green channel should be 0');
    assert.strictEqual(data[index + 2], 0, 'Blue channel should be 0');

    // Check a pixel at the original, untranslated location
    x = 5;
    y = 5;
    index = (y * width + x) * 4;
    assert.strictEqual(data[index], 0, 'Pixel at original location should be transparent');
});

test('strokeRect with rotation', (t) => {
    const ctx = new CanvasRenderingContext2D(100, 100);
    ctx.strokeStyle = 'blue';
    ctx.translate(50, 50);
    ctx.rotate(Math.PI / 4); // 45 degrees
    ctx.strokeRect(-10, -10, 20, 20);

    const imageData = ctx.getImageData(0, 0, 100, 100);
    const { data, width } = imageData;

    // Check a pixel on the rotated path.
    // A point on the top-right corner of the un-rotated rect is (10, -10).
    // Rotated by 45 deg (cos=sin=0.707): x' = 10*0.707 - (-10)*0.707 = 14.14
    // y' = 10*0.707 + (-10)*0.707 = 0.
    // Translated by (50,50), the point is at (64.14, 50).
    let x = 64;
    let y = 50;
    let index = (y * width + x) * 4;
    assert.strictEqual(data[index + 2], 255, 'Blue channel should be 255 at rotated corner');
});
