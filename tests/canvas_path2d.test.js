import { test } from 'node:test';
import assert from 'node:assert';
import { CanvasRenderingContext2D } from '../src/core/canvas/CanvasRenderingContext2D.js';
import { Path2D } from '../src/core/canvas/Path2D.js';

test('should fill a Path2D object', () => {
    const ctx = new CanvasRenderingContext2D(100, 100);
    const path = new Path2D();
    path.rect(10, 10, 80, 80);
    ctx.fillStyle = 'red';
    ctx.fill(path);
    const pixelData = ctx.getImageData(50, 50, 1, 1).data;
    assert.strictEqual(pixelData[0], 255);
});

test('should stroke a Path2D object', () => {
    const ctx = new CanvasRenderingContext2D(100, 100);
    const path = new Path2D();
    path.rect(10, 10, 80, 80);
    ctx.strokeStyle = 'blue';
    ctx.stroke(path);
    const pixelData = ctx.getImageData(50, 10, 1, 1).data;
    assert.strictEqual(pixelData[2], 255);
});

test('should fill the default path when no Path2D is provided', () => {
    const ctx = new CanvasRenderingContext2D(100, 100);
    ctx.rect(10, 10, 80, 80);
    ctx.fillStyle = 'green';
    ctx.fill();
    const pixelData = ctx.getImageData(50, 50, 1, 1).data;
    assert.strictEqual(pixelData[1], 255);
});

test('constructor should copy from another Path2D', () => {
    const path1 = new Path2D();
    path1.rect(10, 10, 50, 50);
    const path2 = new Path2D(path1);
    assert.deepStrictEqual(path2.path, path1.path);
});

test('addPath should combine two paths', () => {
    const path1 = new Path2D();
    path1.rect(10, 10, 20, 20);
    const path2 = new Path2D();
    path2.moveTo(50, 50);
    path2.addPath(path1);
    assert.strictEqual(path2.path.length, 6);
});

test('should use a Path2D object for clipping', () => {
    const ctx = new CanvasRenderingContext2D(100, 100);
    const clipPath = new Path2D();
    clipPath.rect(25, 25, 50, 50);
    ctx.clip(clipPath);
    ctx.fillStyle = 'purple';
    ctx.fillRect(0, 0, 100, 100);
    const insidePixel = ctx.getImageData(50, 50, 1, 1).data;
    assert.strictEqual(insidePixel[0], 128);
    const outsidePixel = ctx.getImageData(10, 10, 1, 1).data;
    assert.strictEqual(outsidePixel[3], 0);
});

test('constructor with SVG path data should create a path', () => {
    const ctx = new CanvasRenderingContext2D(100, 100);
    const path = new Path2D('M 10 10 h 80 v 80 h -80 Z');
    ctx.fillStyle = 'orange';
    ctx.fill(path);
    const pixelData = ctx.getImageData(50, 50, 1, 1).data;
    assert.strictEqual(pixelData[0], 255);
});

test.skip('addPath with transform should apply the transformation', () => {
    const ctx = new CanvasRenderingContext2D(100, 100);
    const path1 = new Path2D('M 10 10 h 20 v 20 h -20 Z');
    const path2 = new Path2D();
    const transform = { a: 1, b: 0, c: 0, d: 1, e: 50, f: 50 };
    path2.addPath(path1, transform);
    ctx.fillStyle = 'cyan';
    ctx.fill(path2);
    const transformedPos = ctx.getImageData(70, 70, 1, 1).data;
    assert.strictEqual(transformedPos[1], 255);
});

test('arcTo should draw a line to the first point (as a placeholder)', () => {
    const path = new Path2D();
    path.moveTo(10, 10);
    path.arcTo(50, 10, 50, 50, 20);
    assert.strictEqual(path.path.length, 2);
    assert.strictEqual(path.path[1].type, 'line');
});

test.skip('filling a transformed path should work', () => {
    const ctx = new CanvasRenderingContext2D(100, 100);
    const path = new Path2D('M 10 10 h 20 v 20 h -20 Z');
    ctx.translate(50, 50);
    ctx.fillStyle = 'cyan';
    ctx.fill(path);
    const transformedPos = ctx.getImageData(70, 70, 1, 1).data;
    assert.strictEqual(transformedPos[1], 255);
});
