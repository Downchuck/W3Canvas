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

test('Stroking a polyline with a miter join works correctly', (t) => {
    const ctx = new CanvasRenderingContext2D(30, 30);
    ctx.strokeStyle = 'blue';
    ctx.lineWidth = 4;

    // Draw a V-shape
    ctx.beginPath();
    ctx.moveTo(5, 5);
    ctx.lineTo(15, 20);
    ctx.lineTo(25, 5);
    ctx.stroke();

    const blue = [0, 0, 255, 255];
    const white = [0, 0, 0, 0];

    // Check a point deep inside the miter join
    assertPixelIsColor(ctx.getImageData(0, 0, 30, 30), 15, 18, blue);

    // Check a point that would be empty without a miter join
    assertPixelIsColor(ctx.getImageData(0, 0, 30, 30), 13, 18, blue);

    // Check a point just outside the join
    assertPixelIsColor(ctx.getImageData(0, 0, 30, 30), 15, 22, white);
});

test('Stroking a bezier curve with lineWidth works correctly', (t) => {
    const ctx = new CanvasRenderingContext2D(50, 50);
    ctx.strokeStyle = 'green';
    ctx.lineWidth = 6;

    // Draw a simple curve
    ctx.beginPath();
    ctx.moveTo(10, 40);
    ctx.bezierCurveTo(20, 10, 30, 10, 40, 40);
    ctx.stroke();

    const green = [0, 255, 0, 255];
    const white = [0, 0, 0, 0];

    // Check a point near the apex of the curve's stroke
    assertPixelIsColor(ctx.getImageData(0, 0, 50, 50), 25, 15, green);

    // Check a point just outside the stroke
    assertPixelIsColor(ctx.getImageData(0, 0, 50, 50), 25, 8, white);
});

test('Stroking an arc with lineWidth works correctly', (t) => {
    const ctx = new CanvasRenderingContext2D(50, 50);
    ctx.strokeStyle = '#FF00FF'; // Magenta
    ctx.lineWidth = 4;

    // Draw a semicircle
    ctx.beginPath();
    ctx.arc(25, 25, 20, Math.PI, 2 * Math.PI);
    ctx.stroke();

    const magenta = [255, 0, 255, 255];
    const white = [0, 0, 0, 0];

    // Check a point on the top of the arc's stroke
    assertPixelIsColor(ctx.getImageData(0, 0, 50, 50), 25, 6, magenta);

    // Check a point just inside the inner radius
    assertPixelIsColor(ctx.getImageData(0, 0, 50, 50), 25, 9, white);
});
