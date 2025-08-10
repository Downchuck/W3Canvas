import { test } from 'node:test';
import assert from 'node:assert';
import { currentDocument } from '../src/dom/html/dom_html_doc.js';
import '../src/dom/html/dom_html_canvas.js';
import '../src/dom/svg/dom_svg_rect.js';

test('Render SVG rect on canvas', () => {
  const canvas = currentDocument.createElement('canvas');
  canvas.setWidth(200);
  canvas.setHeight(200);

  const rect = currentDocument.createElement('svg:rect');
  rect.setX(10);
  rect.setY(10);
  rect.setWidth(50);
  rect.setHeight(50);
  rect.setFill('red');

  canvas.appendChild(rect);
  rect.repaint();

  const ctx = canvas.getContext('2d');
  const imageData = ctx.getImageData(15, 15, 1, 1);
  const pixel = [imageData.data[0], imageData.data[1], imageData.data[2], imageData.data[3]];

  assert.deepStrictEqual(pixel, [255, 0, 0, 255]);
});
