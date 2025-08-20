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

test('CanvasRenderingContext2D.roundRect creates a rounded rectangle path', () => {
    const ctx = new CanvasRenderingContext2D(200, 200);
    ctx.roundRect(10, 20, 100, 50, 10);
    assert.strictEqual(ctx.path.length, 10, 'roundRect should add 10 commands to the path');
    assert.deepStrictEqual(ctx.path[0], { type: 'move', x: 20, y: 20 });
    assert.deepStrictEqual(ctx.path[1], { type: 'line', x: 100, y: 20 });

    const curve1 = ctx.path[2];
    assert.strictEqual(curve1.type, 'bezier');
    assert(Math.abs(curve1.cp1x - 106.666) < 0.001, "cp1x is wrong");
    assert(Math.abs(curve1.cp1y - 20) < 0.001, "cp1y is wrong");
    assert(Math.abs(curve1.cp2x - 110) < 0.001, "cp2x is wrong");
    assert(Math.abs(curve1.cp2y - 23.333) < 0.001, "cp2y is wrong");
    assert(Math.abs(curve1.x - 110) < 0.001, "x is wrong");
    assert(Math.abs(curve1.y - 30) < 0.001, "y is wrong");

    assert.deepStrictEqual(ctx.path[3], { type: 'line', x: 110, y: 60 });

    const curve2 = ctx.path[4];
    assert.strictEqual(curve2.type, 'bezier');
    assert(Math.abs(curve2.cp1x - 110) < 0.001, "cp1x is wrong");
    assert(Math.abs(curve2.cp1y - 66.666) < 0.001, "cp1y is wrong");
    assert(Math.abs(curve2.cp2x - 106.666) < 0.001, "cp2x is wrong");
    assert(Math.abs(curve2.cp2y - 70) < 0.001, "cp2y is wrong");
    assert(Math.abs(curve2.x - 100) < 0.001, "x is wrong");
    assert(Math.abs(curve2.y - 70) < 0.001, "y is wrong");

    assert.deepStrictEqual(ctx.path[5], { type: 'line', x: 20, y: 70 });

    const curve3 = ctx.path[6];
    assert.strictEqual(curve3.type, 'bezier');
    assert(Math.abs(curve3.cp1x - 13.333) < 0.001, "cp1x is wrong");
    assert(Math.abs(curve3.cp1y - 70) < 0.001, "cp1y is wrong");
    assert(Math.abs(curve3.cp2x - 10) < 0.001, "cp2x is wrong");
    assert(Math.abs(curve3.cp2y - 66.666) < 0.001, "cp2y is wrong");
    assert(Math.abs(curve3.x - 10) < 0.001, "x is wrong");
    assert(Math.abs(curve3.y - 60) < 0.001, "y is wrong");

    assert.deepStrictEqual(ctx.path[7], { type: 'line', x: 10, y: 30 });

    const curve4 = ctx.path[8];
    assert.strictEqual(curve4.type, 'bezier');
    assert(Math.abs(curve4.cp1x - 10) < 0.001, "cp1x is wrong");
    assert(Math.abs(curve4.cp1y - 23.333) < 0.001, "cp1y is wrong");
    assert(Math.abs(curve4.cp2x - 13.333) < 0.001, "cp2x is wrong");
    assert(Math.abs(curve4.cp2y - 20) < 0.001, "cp2y is wrong");
    assert(Math.abs(curve4.x - 20) < 0.001, "x is wrong");
    assert(Math.abs(curve4.y - 20) < 0.001, "y is wrong");

    assert.deepStrictEqual(ctx.path[9], { type: 'close' });
});
