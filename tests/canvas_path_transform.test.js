import { test } from 'node:test';
import assert from 'node:assert';
import { CanvasRenderingContext2D } from '../src/core/canvas/CanvasRenderingContext2D.js';

test('fill() with a translated path', (t) => {
    const ctx = new CanvasRenderingContext2D(100, 100);
    ctx.fillStyle = 'purple';

    // Create a path
    ctx.rect(0, 0, 10, 10);

    // Apply a transform
    ctx.translate(20, 30);

    // Fill the path
    ctx.fill();

    // Check if the pixel at the transformed location is filled
    const imageData = ctx.getImageData(0, 0, 100, 100);
    const { data, width } = imageData;

    // Check a pixel inside the *transformed* rectangle
    let x = 25;
    let y = 35;
    let index = (y * width + x) * 4;
    assert.strictEqual(data[index], 128, 'Red channel of purple at transformed location should be 128');
    assert.strictEqual(data[index + 2], 128, 'Blue channel of purple at transformed location should be 128');

    // Check a pixel at the original location, it should be empty
    x = 5;
    y = 5;
    index = (y * width + x) * 4;
    assert.strictEqual(data[index + 3], 0, 'Pixel at original location should be transparent');
});

test('stroke() with a translated path', (t) => {
    const ctx = new CanvasRenderingContext2D(100, 100);
    ctx.strokeStyle = 'orange';
    ctx.lineWidth = 1;

    // Create a path
    ctx.rect(10, 10, 10, 10);

    // Apply a transform
    ctx.translate(20, 30);

    // Stroke the path
    ctx.stroke();

    // Check if a pixel on the transformed path is stroked
    const imageData = ctx.getImageData(0, 0, 100, 100);
    const { data, width } = imageData;

    // Check a pixel on the top edge of the *transformed* rectangle
    let x = 35; // 10 (orig x) + 5 (midpoint) + 20 (translate)
    let y = 40; // 10 (orig y) + 30 (translate)
    let index = (y * width + x) * 4;
    assert.strictEqual(data[index], 255, 'Red channel of orange at transformed location should be 255');
    assert.strictEqual(data[index + 1], 165, 'Green channel of orange at transformed location should be 165');

    // Check a pixel on the original path, it should be empty
    x = 15;
    y = 10;
    index = (y * width + x) * 4;
    assert.strictEqual(data[index + 3], 0, 'Pixel at original location should be transparent');
});
