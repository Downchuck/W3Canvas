import { test } from 'node:test';
import assert from 'node:assert';
import { CanvasRenderingContext2D } from '../../src/core/canvas/CanvasRenderingContext2D.js';
import { performance } from 'perf_hooks';

// Performance tests for simple shapes
test('Rectangle rendering performance', () => {
    const ctx = new CanvasRenderingContext2D(500, 500);
    const num_rects = 10000;
    const max_time_fill = 50; // ms
    const max_time_stroke = 110; // ms

    // Benchmark filling
    const start_fill = performance.now();
    for (let i = 0; i < num_rects; i++) {
        ctx.fillRect(i % 100, Math.floor(i / 100), 1, 1);
    }
    const fill_time = performance.now() - start_fill;

    console.log(`Filling ${num_rects} rectangles took ${fill_time.toFixed(2)}ms`);
    assert.ok(fill_time < max_time_fill, `Filling rects should be faster than ${max_time_fill}ms. Actual: ${fill_time}ms`);

    // Benchmark stroking
    const start_stroke = performance.now();
    for (let i = 0; i < num_rects; i++) {
        ctx.strokeRect(i % 100, Math.floor(i / 100), 1, 1);
    }
    const stroke_time = performance.now() - start_stroke;

    console.log(`Stroking ${num_rects} rectangles took ${stroke_time.toFixed(2)}ms`);
    assert.ok(stroke_time < max_time_stroke, `Stroking rects should be faster than ${max_time_stroke}ms. Actual: ${stroke_time}ms`);
});

test('Triangle rendering performance', () => {
    const ctx = new CanvasRenderingContext2D(500, 500);
    const num_triangles = 5000;
    const max_time_fill = 220; // ms
    const max_time_stroke = 100; // ms

    // Benchmark filling
    const start_fill = performance.now();
    for (let i = 0; i < num_triangles; i++) {
        ctx.beginPath();
        const x = (i * 10) % 500;
        const y = Math.floor((i * 10) / 500) * 10;
        ctx.moveTo(x, y);
        ctx.lineTo(x + 10, y);
        ctx.lineTo(x + 5, y + 10);
        ctx.closePath();
        ctx.fill();
    }
    const fill_time = performance.now() - start_fill;

    console.log(`Filling ${num_triangles} triangles took ${fill_time.toFixed(2)}ms`);
    assert.ok(fill_time < max_time_fill, `Filling triangles should be faster than ${max_time_fill}ms. Actual: ${fill_time}ms`);

    // Benchmark stroking
    const start_stroke = performance.now();
    for (let i = 0; i < num_triangles; i++) {
        ctx.beginPath();
        const x = (i * 10) % 500;
        const y = Math.floor((i * 10) / 500) * 10;
        ctx.moveTo(x, y);
        ctx.lineTo(x + 10, y);
        ctx.lineTo(x + 5, y + 10);
        ctx.closePath();
        ctx.stroke();
    }
    const stroke_time = performance.now() - start_stroke;

    console.log(`Stroking ${num_triangles} triangles took ${stroke_time.toFixed(2)}ms`);
    assert.ok(stroke_time < max_time_stroke, `Stroking triangles should be faster than ${max_time_stroke}ms. Actual: ${stroke_time}ms`);
});

test('Circle rendering performance', () => {
    const ctx = new CanvasRenderingContext2D(500, 500);
    const num_circles = 2000;
    const max_time_fill = 3000; // ms
    const max_time_stroke = 200; // ms

    // Benchmark filling
    const start_fill = performance.now();
    for (let i = 0; i < num_circles; i++) {
        ctx.beginPath();
        const x = (i * 20) % 500;
        const y = Math.floor((i * 20) / 500) * 20;
        ctx.arc(x + 10, y + 10, 10, 0, 2 * Math.PI);
        ctx.fill();
    }
    const fill_time = performance.now() - start_fill;

    console.log(`Filling ${num_circles} circles took ${fill_time.toFixed(2)}ms`);
    assert.ok(fill_time < max_time_fill, `Filling circles should be faster than ${max_time_fill}ms. Actual: ${fill_time}ms`);

    // Benchmark stroking
    const start_stroke = performance.now();
    for (let i = 0; i < num_circles; i++) {
        ctx.beginPath();
        const x = (i * 20) % 500;
        const y = Math.floor((i * 20) / 500) * 20;
        ctx.arc(x + 10, y + 10, 10, 0, 2 * Math.PI);
        ctx.stroke();
    }
    const stroke_time = performance.now() - start_stroke;

    console.log(`Stroking ${num_circles} circles took ${stroke_time.toFixed(2)}ms`);
    assert.ok(stroke_time < max_time_stroke, `Stroking circles should be faster than ${max_time_stroke}ms. Actual: ${stroke_time}ms`);
});
