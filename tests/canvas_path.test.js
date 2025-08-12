import { CanvasRenderingContext2D } from '../src/core/canvas/CanvasRenderingContext2D.js';

test('CanvasRenderingContext2D.rect creates a rectangular path', () => {
  const ctx = new CanvasRenderingContext2D(100, 100);
  ctx.rect(10, 20, 30, 40);
  expect(ctx.path.length).toBe(5);
  expect(ctx.path[0]).toEqual({ type: 'move', x: 10, y: 20 });
  expect(ctx.path[1]).toEqual({ type: 'line', x: 40, y: 20 });
  expect(ctx.path[2]).toEqual({ type: 'line', x: 40, y: 60 });
  expect(ctx.path[3]).toEqual({ type: 'line', x: 10, y: 60 });
  expect(ctx.path[4]).toEqual({ type: 'close' });
});

test('CanvasRenderingContext2D.arc creates an arc path', () => {
  const ctx = new CanvasRenderingContext2D(100, 100);
  ctx.arc(50, 50, 25, 0, Math.PI);
  expect(ctx.path.length).toBe(1);
  expect(ctx.path[0]).toEqual({ type: 'arc', x: 50, y: 50, radius: 25, startAngle: 0, endAngle: Math.PI, anticlockwise: false });
});

test('CanvasRenderingContext2D.ellipse creates a bezier path for an ellipse', () => {
  const ctx = new CanvasRenderingContext2D(200, 200);
  ctx.ellipse(100, 100, 50, 75, 0, 0, 2 * Math.PI);
  expect(ctx.path.length).toBe(6);
  expect(ctx.path[0].type).toBe('move');
  expect(ctx.path[1].type).toBe('bezier');
  expect(ctx.path[5].type).toBe('close');
});
