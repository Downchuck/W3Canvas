import { test } from 'node:test';
import assert from 'node:assert';
import { CanvasRenderingContext2D } from '../src/core/canvas/CanvasRenderingContext2D.js';

test('CanvasRenderingContext2D.translate', () => {
  const ctx = new CanvasRenderingContext2D(100, 100);
  ctx.translate(10, 20);
  ctx.fillRect(0, 0, 10, 10);

  const imageData = ctx.getImageData(0, 0, 100, 100);
  const { data, width } = imageData;

  // Check a pixel inside the translated rectangle
  let index = (25 * width + 15) * 4;
  assert.strictEqual(data[index], 0, 'Red channel should be 0');
  assert.strictEqual(data[index+1], 0, 'Green channel should be 0');
  assert.strictEqual(data[index+2], 0, 'Blue channel should be 0');
  assert.strictEqual(data[index+3], 255, 'Alpha channel should be 255');

  // Check a pixel at the original position (should be empty)
  index = (5 * width + 5) * 4;
  assert.strictEqual(data[index+3], 0, 'Alpha channel should be 0');
});

test('CanvasRenderingContext2D.scale', () => {
    const ctx = new CanvasRenderingContext2D(100, 100);
    ctx.scale(2, 0.5);
    ctx.fillRect(10, 20, 10, 10);

    const imageData = ctx.getImageData(0, 0, 100, 100);
    const { data, width } = imageData;

    // Check a pixel inside the scaled rectangle
    let index = (12 * width + 25) * 4;
    assert.strictEqual(data[index+3], 255, 'Alpha channel should be 255');
});

test('CanvasRenderingContext2D.rotate', () => {
    const ctx = new CanvasRenderingContext2D(100, 100);
    ctx.rotate(Math.PI / 2); // 90 degrees
    ctx.fillRect(10, 10, 20, 10);

    const imageData = ctx.getImageData(0, 0, 100, 100);
    const { data, width } = imageData;

    // Original rect was (10, 10) to (30, 20)
    // Rotated rect should be at (-10, 10) to (-20, 30)
    // Let's check a pixel inside the rotated rect.
    // E.g. original point (15, 15) -> rotated (-15, 15)
    let index = (15 * width - 15) * 4;
    // This will be outside the canvas bounds, so this test is not great.

    // Let's rotate around a point
    const ctx2 = new CanvasRenderingContext2D(100, 100);
    ctx2.translate(50, 50);
    ctx2.rotate(Math.PI / 4); // 45 degrees
    ctx2.fillRect(-10, -10, 20, 20);

    const imageData2 = ctx2.getImageData(0, 0, 100, 100);
    const { data: data2, width: width2 } = imageData2;

    // Check center pixel
    let index2 = (50 * width2 + 50) * 4;
    assert.strictEqual(data2[index2+3], 255, 'Alpha channel should be 255');

    // Check a corner
    index2 = (38 * width2 + 38) * 4;
    assert.strictEqual(data2[index2+3], 0, 'Alpha channel should be 0');
});
