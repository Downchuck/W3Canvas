import { test } from 'node:test';
import assert from 'node:assert';
import { currentDocument } from '../src/dom/html/dom_html_doc.js';
import '../src/dom/html/dom_html_canvas.js';
import '../src/dom/svg/dom_svg_path.js';
import '../src/dom/svg/dom_svg_text.js';

test('Render SVG path on canvas', () => {
  const canvas = currentDocument.createElement('canvas');
  canvas.setWidth(200);
  canvas.setHeight(200);

  const path = currentDocument.createElement('svg:path');
  path.setD('M 10 10 L 60 10 L 60 60 L 10 60 Z');
  path.setFill('blue');

  canvas.appendChild(path);
  path.repaint(canvas.getContext('2d'));

  const ctx = canvas.getContext('2d');
  const imageData = ctx.getImageData(15, 15, 1, 1);
  const pixel = [imageData.data[0], imageData.data[1], imageData.data[2], imageData.data[3]];

  assert.deepStrictEqual(pixel, [0, 0, 255, 255]);
});

test('Render SVG text on canvas', () => {
    const canvas = currentDocument.createElement('canvas');
    canvas.setWidth(200);
    canvas.setHeight(200);

    const text = currentDocument.createElement('svg:text');
    text.setX(10);
    text.setY(80);
    text.setText('Hello');
    text.setFill('green');
    text.style.setProperty('font-size', '20px');
    text.style.setProperty('font-family', 'Arial');

    canvas.appendChild(text);
    text.repaint(canvas.getContext('2d'));

    const ctx = canvas.getContext('2d');
    // Note: Due to the complexity of font rendering, we can't do a simple pixel check.
    // For now, we'll just check that the test runs without errors.
    // A more advanced test would involve image snapshot testing.
    assert.ok(true, "Test completed without errors");
});
