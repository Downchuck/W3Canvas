import { test } from 'node:test';
import assert from 'node:assert';
import { CanvasRenderingContext2D } from '../src/core/canvas/CanvasRenderingContext2D.js';

test('CanvasRenderingContext2D.rect creates a rectangular path', () => {
  const ctx = new CanvasRenderingContext2D(100, 100);
  ctx.rect(10, 20, 30, 40);
  assert.strictEqual(ctx.path.length, 5, 'rect should add 5 commands to the path');
  assert.deepStrictEqual(ctx.path[0], { type: 'move', x: 10, y: 20 });
  assert.deepStrictEqual(ctx.path[1], { type: 'line', x: 40, y: 20 });
  assert.deepStrictEqual(ctx.path[2], { type: 'line', x: 40, y: 60 });
  assert.deepStrictEqual(ctx.path[3], { type: 'line', x: 10, y: 60 });
  assert.deepStrictEqual(ctx.path[4], { type: 'close' });
});

test('CanvasRenderingContext2D.arc creates an arc path', () => {
  const ctx = new CanvasRenderingContext2D(100, 100);
  ctx.arc(50, 50, 25, 0, Math.PI);
  assert.strictEqual(ctx.path.length, 1, 'arc should add 1 command to the path');
  assert.deepStrictEqual(ctx.path[0], { type: 'arc', x: 50, y: 50, radius: 25, startAngle: 0, endAngle: Math.PI, anticlockwise: false });
});

test('CanvasRenderingContext2D.ellipse creates a bezier path for an ellipse', () => {
  const ctx = new CanvasRenderingContext2D(200, 200);
  ctx.ellipse(100, 100, 50, 75, 0, 0, 2 * Math.PI);
  assert.strictEqual(ctx.path.length, 6, 'ellipse should add 6 commands to the path');
  assert.strictEqual(ctx.path[0].type, 'move', 'path should start with a move');
  assert.strictEqual(ctx.path[1].type, 'bezier', 'path should have a bezier curve');
  assert.strictEqual(ctx.path[5].type, 'close', 'path should end with a close');
});
