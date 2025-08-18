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

test('Filling a semicircle', (t) => {
    const ctx = new CanvasRenderingContext2D(100, 100);
    ctx.fillStyle = 'blue';

    ctx.beginPath();
    ctx.arc(50, 50, 40, 0, Math.PI, false); // Semicircle
    ctx.fill();

    // Check pixels
    // Inside the semicircle
    assert.deepStrictEqual(getPixel(ctx.imageData, 50, 70), [0, 0, 255, 255], 'Center of the semicircle base should be blue');
    assert.deepStrictEqual(getPixel(ctx.imageData, 30, 30)[3], 0, 'Point in the top half should be transparent');

    // Outside the semicircle
    assert.deepStrictEqual(getPixel(ctx.imageData, 50, 95)[3], 0, 'Pixel below the semicircle should be transparent');
});

test('Stroking a 90-degree arc with a thick line', (t) => {
    const ctx = new CanvasRenderingContext2D(100, 100);
    ctx.strokeStyle = 'green';
    ctx.lineWidth = 10;

    ctx.beginPath();
    const startAngle = -Math.PI / 2;
    const endAngle = startAngle + (10 * Math.PI / 180); // 10-degree arc
    ctx.arc(20, 80, 50, startAngle, endAngle, false);
    ctx.stroke();

    const endX = Math.round(20 + 50 * Math.cos(endAngle));
    const endY = Math.round(80 + 50 * Math.sin(endAngle));

    // Check pixels on the stroke
    // A point near the start of the arc
    assert.deepStrictEqual(getPixel(ctx.imageData, 20, 30), [0, 255, 0, 255], 'Pixel near the start of the arc should be green');
    // A point near the end of the arc
    assert.deepStrictEqual(getPixel(ctx.imageData, endX, endY), [0, 255, 0, 255], 'Pixel near the end of the arc should be green');
    // A point just off the stroke
    assert.deepStrictEqual(getPixel(ctx.imageData, 20, 24)[3], 0, 'Pixel just off the stroke should be transparent');
});
