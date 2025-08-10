import { test } from 'node:test';
import assert from 'node:assert';
import { currentDocument } from '../src/dom/html/dom_html_doc.js';
import '../src/dom/html/dom_html_canvas.js';
import '../src/dom/svg/dom_svg_rect.js';
import { render } from '../src/dom/renderer.js';

test('Render a rectangle to the canvas', () => {
  const canvas = currentDocument.createElement('canvas');
  canvas.setWidth(200);
  canvas.setHeight(200);

  const rect = currentDocument.createElement('svg:rect');
  rect.setX(10);
  rect.setY(20);
  rect.setWidth(100);
  rect.setHeight(50);
  rect.setFill('red');

  canvas.appendChild(rect);

  const ctx = canvas.getContext('2d');
  render(canvas, ctx);

  const imageData = ctx.getImageData(0, 0, 200, 200);
  const { data, width } = imageData;

  // Check a pixel inside the rectangle
  const x = 15;
  const y = 25;
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
});
