import { test } from 'node:test';
import assert from 'node:assert';
import { currentDocument } from './src/dom/html/dom_html_doc.js';
import './src/dom/html/dom_html_canvas.js';
import { CanvasRenderingContext2D } from './src/core/canvas/CanvasRenderingContext2D.js';

test('CanvasRenderingContext2D.arc', () => {
  const canvas = currentDocument.createElement('canvas');
  canvas.width = 200;
  canvas.height = 200;

  const ctx = canvas.getContext('2d');
  ctx.arc(100, 100, 50, 0, Math.PI * 2);

  assert.ok(true, 'arc should not throw an error');
});
