import { test } from 'node:test';
import assert from 'node:assert';
import { CanvasRenderingContext2D } from '../src/core/canvas/CanvasRenderingContext2D.js';

test('Render a rounded rectangle to the canvas', () => {
  const ctx = new CanvasRenderingContext2D(200, 200);

  ctx.roundRect(10, 20, 100, 50, 10);
  ctx.fillStyle = 'red';
  ctx.fill();

  const imageData = ctx.getImageData(0, 0, 200, 200);
  const { data, width } = imageData;

  // Check a pixel inside the rectangle (but not in a corner)
  const x = 50;
  const y = 45;
  const index = (y * width + x) * 4;
  assert.strictEqual(data[index], 255, 'Red channel should be 255');
  assert.strictEqual(data[index + 1], 0, 'Green channel should be 0');
  assert.strictEqual(data[index + 2], 0, 'Blue channel should be 0');
  assert.strictEqual(data[index + 3], 255, 'Alpha channel should be 255');

  // Check a pixel outside the rectangle
  const x2 = 5;
  const y2 = 5;
  const index2 = (y2 * width + x2) * 4;
  assert.strictEqual(data[index2], 0, 'Red channel should be 0');
  assert.strictEqual(data[index2 + 1], 0, 'Green channel should be 0');
  assert.strictEqual(data[index2 + 2], 0, 'Blue channel should be 0');
  assert.strictEqual(data[index2 + 3], 0, 'Alpha channel should be 0');

  // Check a pixel in a corner that should be transparent
  const x3 = 12;
  const y3 = 22;
  const index3 = (y3 * width + x3) * 4;
  assert.strictEqual(data[index3], 0, 'Red channel in corner should be 0');
  assert.strictEqual(data[index3 + 1], 0, 'Green channel in corner should be 0');
  assert.strictEqual(data[index3 + 2], 0, 'Blue channel in corner should be 0');
  assert.strictEqual(data[index3 + 3], 0, 'Alpha channel in corner should be 0');

  // Check a pixel in a corner that should be filled
  const x4 = 18;
  const y4 = 28;
  const index4 = (y4 * width + x4) * 4;
  assert.strictEqual(data[index4], 255, 'Red channel in corner should be 255');
  assert.strictEqual(data[index4 + 1], 0, 'Green channel in corner should be 0');
  assert.strictEqual(data[index4 + 2], 0, 'Blue channel in corner should be 0');
  assert.strictEqual(data[index4 + 3], 255, 'Alpha channel in corner should be 255');
});
