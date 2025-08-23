import { test } from 'node:test';
import assert from 'node:assert';
import { currentDocument } from '../src/dom/html/dom_html_doc.js';
import '../src/dom/html/dom_html_canvas.js';
import { render } from '../src/dom/renderer.js';
import { Path2D } from '../src/core/canvas/Path2D.js';

console.log('Starting test_paths.js');

test('roundRect', async () => {
  console.log('Starting roundRect test');
  const canvas = currentDocument.createElement('canvas');
  canvas.width = 200;
  canvas.height = 200;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = 'red';
  ctx.roundRect(10, 20, 100, 50, [10]);
  ctx.fill();

  await render(canvas, ctx);

  const imageData = ctx.getImageData(0, 0, 200, 200);
  const { data, width } = imageData;

  // Check a pixel inside the rectangle
  const x = 50;
  const y = 45;
  const index = (y * width + x) * 4;
  assert.strictEqual(data[index], 255, 'Red channel should be 255');
  assert.strictEqual(data[index + 1], 0, 'Green channel should be 0');
  assert.strictEqual(data[index + 2], 0, 'Blue channel should be 0');
  assert.strictEqual(data[index + 3], 255, 'Alpha channel should be 255');

  // Check a pixel in a corner that should be cut off
  const x2 = 11, y2 = 21;
  const index2 = (y2 * width + x2) * 4;
  assert.strictEqual(data[index2], 0, 'Red channel should be 0');
  assert.strictEqual(data[index2 + 1], 0, 'Green channel should be 0');
  assert.strictEqual(data[index2 + 2], 0, 'Blue channel should be 0');
  assert.strictEqual(data[index2 + 3], 0, 'Alpha channel should be 0');
  console.log('Finished roundRect test');
});

test('arcTo', async () => {
    console.log('Starting arcTo test');
    const canvas = currentDocument.createElement('canvas');
    canvas.width = 200;
    canvas.height = 200;
    const ctx = canvas.getContext('2d');

    ctx.strokeStyle = 'blue';
    ctx.lineWidth = 5;
    ctx.moveTo(20, 20);
    ctx.arcTo(150, 20, 150, 70, 50);
    ctx.stroke();

    await render(canvas, ctx);

    const imageData = ctx.getImageData(0, 0, 200, 200);
    const { data, width } = imageData;

    // Check a point on the arc
    const x = 150;
    const y = 70;
    const index = (y * width + x) * 4;
    assert.strictEqual(data[index], 0, 'Red channel should be 0');
    assert.strictEqual(data[index + 1], 0, 'Green channel should be 0');
    assert.strictEqual(data[index + 2], 255, 'Blue channel should be 255');
    assert.strictEqual(data[index + 3], 255, 'Alpha channel should be 255');
    console.log('Finished arcTo test');
});

test('quadraticCurveTo', async () => {
    console.log('Starting quadraticCurveTo test');
    const canvas = currentDocument.createElement('canvas');
    canvas.width = 200;
    canvas.height = 200;
    const ctx = canvas.getContext('2d');

    ctx.strokeStyle = 'green';
    ctx.lineWidth = 2;
    ctx.moveTo(20, 100);
    ctx.quadraticCurveTo(100, 20, 180, 100);
    ctx.stroke();

    await render(canvas, ctx);

    const imageData = ctx.getImageData(0, 0, 200, 200);
    const { data, width } = imageData;

    // Check a point on the curve
    const x = 100;
    const y = 55;
    const index = (y * width + x) * 4;
    assert.strictEqual(data[index], 0, 'Red channel should be 0');
    assert.strictEqual(data[index + 1], 128, 'Green channel should be 128');
    assert.strictEqual(data[index + 2], 0, 'Blue channel should be 0');
    assert.strictEqual(data[index + 3], 255, 'Alpha channel should be 255');
    console.log('Finished quadraticCurveTo test');
});

test('isPointInStroke', async () => {
    console.log('Starting isPointInStroke test');
    const canvas = currentDocument.createElement('canvas');
    canvas.width = 200;
    canvas.height = 200;
    const ctx = canvas.getContext('2d');

    ctx.lineWidth = 10;
    ctx.rect(50, 50, 100, 100);
    ctx.stroke();

    await render(canvas, ctx);

    assert.ok(ctx.isPointInStroke(50, 50), 'Point should be in stroke');
    assert.ok(ctx.isPointInStroke(100, 50), 'Point should be in stroke');
    assert.ok(!ctx.isPointInStroke(100, 100), 'Point should not be in stroke');
    console.log('Finished isPointInStroke test');
});
