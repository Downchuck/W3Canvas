import { test } from 'node:test';
import assert from 'node:assert';
import { CanvasRenderingContext2D } from '../src/core/canvas/CanvasRenderingContext2D.js';

const getPixel = (imageData, x, y) => {
  const i = (y * imageData.width + x) * 4;
  return [
    imageData.data[i],
    imageData.data[i + 1],
    imageData.data[i + 2],
    imageData.data[i + 3],
  ];
};

test('Stroking a simple bezier curve', () => {
  const ctx = new CanvasRenderingContext2D(100, 100);
  ctx.strokeStyle = 'black';
  ctx.beginPath();
  ctx.moveTo(10, 10);
  ctx.bezierCurveTo(20, 80, 80, 20, 90, 90);
  ctx.stroke();

  // Check the start and end points
  assert.deepStrictEqual(getPixel(ctx.imageData, 10, 10), [0, 0, 0, 255], 'Start point should be black');
  assert.deepStrictEqual(getPixel(ctx.imageData, 90, 90), [0, 0, 0, 255], 'End point should be black');

  // Check a point somewhere in the middle of the curve.
  // I'll need to calculate a point manually. For t=0.5:
  // B(t) = (1-t)^3 * P0 + 3(1-t)^2 * t * P1 + 3(1-t) * t^2 * P2 + t^3 * P3
  // B(0.5) = 0.125*P0 + 0.375*P1 + 0.375*P2 + 0.125*P3
  const t = 0.5;
  const x = 0.125 * 10 + 0.375 * 20 + 0.375 * 80 + 0.125 * 90; // 1.25 + 7.5 + 30 + 11.25 = 50
  const y = 0.125 * 10 + 0.375 * 80 + 0.375 * 20 + 0.125 * 90; // 1.25 + 30 + 7.5 + 11.25 = 50

  // The bresenham line drawing might not hit the exact integer coordinate.
  // I'll check a small area around the calculated point.
  let pixelFound = false;
  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {
      if (getPixel(ctx.imageData, Math.round(x) + i, Math.round(y) + j)[3] === 255) {
        pixelFound = true;
        break;
      }
    }
    if(pixelFound) break;
  }

  assert.ok(pixelFound, 'A black pixel should be found near the calculated midpoint of the curve');
});
