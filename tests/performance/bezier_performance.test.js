import { test } from 'node:test';
import assert from 'node:assert';
import { CanvasRenderingContext2D } from '../../src/core/canvas/CanvasRenderingContext2D.js';
import { performance } from 'perf_hooks';

// Performance test for Bezier curves
test('Bezier curve performance test', () => {
  const ctx = new CanvasRenderingContext2D(500, 500);
  const num_curves = 1000;
  const max_time_stroke = 50; // ms
  const max_time_fill = 100; // ms

  // Create a complex path
  ctx.beginPath();
  ctx.moveTo(10, 10);
  for (let i = 0; i < num_curves; i++) {
    const x0 = 10 + (i / num_curves) * 480;
    const y0 = 250;
    const cp1x = x0 + Math.random() * 50 - 25;
    const cp1y = y0 + Math.random() * 200 - 100;
    const cp2x = x0 + Math.random() * 50 - 25;
    const cp2y = y0 + Math.random() * 200 - 100;
    const x = x0 + 5;
    const y = 250;
    ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y);
  }

  // Benchmark stroking
  const start_stroke = performance.now();
  ctx.stroke();
  const stroke_time = performance.now() - start_stroke;

  console.log(`Stroking ${num_curves} bezier curves took ${stroke_time}ms`);
  assert.ok(stroke_time < max_time_stroke, `Stroking should be faster than ${max_time_stroke}ms. Actual: ${stroke_time}ms`);

  // Benchmark filling
  const start_fill = performance.now();
  ctx.fill();
  const fill_time = performance.now() - start_fill;

  console.log(`Filling ${num_curves} bezier curves took ${fill_time}ms`);
  assert.ok(fill_time < max_time_fill, `Filling should be faster than ${max_time_fill}ms. Actual: ${fill_time}ms`);
});
