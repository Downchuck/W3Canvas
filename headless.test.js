import { test } from 'node:test';
import assert from 'node:assert';
import { currentDocument } from './html/dom_html_doc.js';
import './html/dom_html_canvas.js';
import { CustomCanvasRenderingContext2D } from './custom_canvas.js';

import { Rectangle } from './svg/dom_svg_rect.js';

test('CustomCanvasRenderingContext2D.fillRect', () => {
  const canvas = currentDocument.createElement('canvas');
  canvas.width = 200;
  canvas.height = 200;

  const originalGetContext = canvas.getContext;
  canvas.getContext = (contextId) => {
    if (contextId === '2d') {
      return new CustomCanvasRenderingContext2D(canvas, Rectangle);
    }
    return originalGetContext(contextId);
  };

  const ctx = canvas.getContext('2d');
  ctx.fillStyle = 'red';
  ctx.fillRect(10, 20, 100, 50);

  assert.ok(true, 'fillRect should not throw an error');
});

test('CustomCanvasRenderingContext2D.arc', () => {
  console.log('arc test running');
  const canvas = currentDocument.createElement('canvas');
  canvas.width = 200;
  canvas.height = 200;

  const originalGetContext = canvas.getContext;
  canvas.getContext = (contextId) => {
    if (contextId === '2d') {
      return new CustomCanvasRenderingContext2D(canvas, Rectangle);
    }
    return originalGetContext(contextId);
  };

  const ctx = canvas.getContext('2d');
  ctx.arc(100, 100, 50, 0, Math.PI * 2);

  assert.ok(true, 'arc should not throw an error');
});
