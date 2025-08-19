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

  // Check a point near the start and end points, but unambiguously inside the stroke
  assert.deepStrictEqual(getPixel(ctx.imageData, 10, 11), [0, 0, 0, 255], 'A point near the start should be black');
  assert.deepStrictEqual(getPixel(ctx.imageData, 89, 89), [0, 0, 0, 255], 'A point near the end should be black');

  // Check a point somewhere in the middle of the curve.
  const t = 0.5;
  const x = 0.125 * 10 + 0.375 * 20 + 0.375 * 80 + 0.125 * 90; // 50
  const y = 0.125 * 10 + 0.375 * 80 + 0.375 * 20 + 0.125 * 90; // 50

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
