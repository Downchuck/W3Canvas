import { test } from 'node:test';
import assert from 'node:assert';
import { CanvasRenderingContext2D } from '../src/core/canvas/CanvasRenderingContext2D.js';
import { assertPixelIsColor } from './test-helpers.js';

test('Stroking a line with lineWidth creates a fillable polygon', (t) => {
  const ctx = new CanvasRenderingContext2D(20, 20);
  ctx.strokeStyle = 'red';
  ctx.lineWidth = 4;

  // Draw a simple horizontal line
  ctx.beginPath();
  ctx.moveTo(5, 10);
  ctx.lineTo(15, 10);
  ctx.stroke();

  // The _strokePath method should have converted the line into a rectangle
  // and then filled it. We can check the pixels.
  // The line is from (5, 10) to (15, 10) with a lineWidth of 4.
  // The filled rectangle should be from (5, 8) to (15, 12).

  const red = [255, 0, 0, 255];
  const white = [0, 0, 0, 0]; // Assuming default is transparent black

  // Check a point inside the stroke
  assertPixelIsColor(ctx.getImageData(0, 0, 20, 20), 10, 10, red);

  // Check points at the edges of the stroke
  assertPixelIsColor(ctx.getImageData(0, 0, 20, 20), 5, 8, red);
  assertPixelIsColor(ctx.getImageData(0, 0, 20, 20), 14, 11, red); // x is up to 15, so 14 is inside

  // Check a point just outside the stroke
  assertPixelIsColor(ctx.getImageData(0, 0, 20, 20), 10, 7, white);
  assertPixelIsColor(ctx.getImageData(0, 0, 20, 20), 10, 13, white);
});
