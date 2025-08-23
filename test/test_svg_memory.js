import { test } from 'node:test';
import assert from 'node:assert';
import { currentDocument } from '../src/dom/html/dom_html_doc.js';
import '../src/dom/html/dom_html_canvas.js';
import '../src/dom/svg/dom_svg_path.js';

test('Render complex SVG path on canvas', () => {
  const canvas = currentDocument.createElement('canvas');
  canvas.setWidth(500);
  canvas.setHeight(500);

  // Generate a complex path
  let d = 'M 10 10';
  for (let i = 0; i < 200; i++) {
    const x1 = 10 + (i * 2);
    const y1 = 10 + (i % 2 === 0 ? 5 : -5);
    const x2 = 10 + (i * 2) + 1;
    const y2 = 20 + (i % 2 === 0 ? -5 : 5); // y2 is different
    const x = 10 + (i * 2) + 2;
    const y = i % 2 === 0 ? 10 : 20; // y alternates
    d += ` C ${x1} ${y1}, ${x2} ${y2}, ${x} ${y}`;
  }

  const path = currentDocument.createElement('svg:path');
  path.setD(d);
  path.setFill('red');

  canvas.appendChild(path);
  path.repaint(canvas.getContext('2d'));

  const ctx = canvas.getContext('2d');
  const imageData = ctx.getImageData(15, 11, 1, 1);
  const pixel = [imageData.data[0], imageData.data[1], imageData.data[2], imageData.data[3]];

  // The main purpose of this test is to not crash.
  // We'll also check a pixel to make sure it's rendered something.
  // This pixel check is a bit of a guess, but it's better than nothing.
  // The exact color might vary depending on the antialiasing, but it should be reddish.
  assert.ok(pixel[0] > 100, "Pixel should be reddish");
  assert.ok(pixel[1] < 100, "Pixel should be reddish");
  assert.ok(pixel[2] < 100, "Pixel should be reddish");
  assert.ok(pixel[3] > 100, "Pixel should be opaque");
});
