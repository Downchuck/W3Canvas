import { test } from 'node:test';
import assert from 'node:assert';
import { currentDocument } from '../src/dom/html/dom_html_doc.js';
import '../src/dom/html/dom_html_canvas.js';
import '../src/dom/svg/dom_svg_path.js';

test('Render simple triangle on canvas', () => {
  const canvas = currentDocument.createElement('canvas');
  canvas.setWidth(100);
  canvas.setHeight(100);

  const path = currentDocument.createElement('svg:path');
  path.setD('M 10 10 L 90 10 L 50 90 Z');
  path.setFill('blue');

  canvas.appendChild(path);
  path.repaint();

  const ctx = canvas.getContext('2d');

  // Check a pixel inside the triangle
  const imageDataIn = ctx.getImageData(50, 50, 1, 1);
  const pixelIn = [imageDataIn.data[0], imageDataIn.data[1], imageDataIn.data[2], imageDataIn.data[3]];
  assert.deepStrictEqual(pixelIn, [0, 0, 255, 255], "Pixel inside should be blue");

  // Check a pixel outside the triangle
  const imageDataOut = ctx.getImageData(1, 1, 1, 1);
  const pixelOut = [imageDataOut.data[0], imageDataOut.data[1], imageDataOut.data[2], imageDataOut.data[3]];
  assert.deepStrictEqual(pixelOut, [0, 0, 0, 0], "Pixel outside should be transparent");
});
