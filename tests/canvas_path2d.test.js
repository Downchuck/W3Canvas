import { test } from 'node:test';
import assert from 'node:assert';
import { CanvasRenderingContext2D } from '../src/core/canvas/CanvasRenderingContext2D.js';
import { Path2D } from '../src/core/canvas/Path2D.js';

describe('Path2D API', () => {
    let ctx;

    beforeEach(() => {
        ctx = new CanvasRenderingContext2D(100, 100);
    });

    test('should fill a Path2D object', () => {
        // Create a path for a rectangle
        const path = new Path2D();
        path.rect(10, 10, 80, 80);

        // Fill the path
        ctx.fillStyle = 'red';
        ctx.fill(path);

        // Check a pixel inside the rectangle
        const pixelData = ctx.getImageData(50, 50, 1, 1).data;
        assert.strictEqual(pixelData[0], 255, 'Red channel should be 255');
        assert.strictEqual(pixelData[1], 0, 'Green channel should be 0');
        assert.strictEqual(pixelData[2], 0, 'Blue channel should be 0');
        assert.strictEqual(pixelData[3], 255, 'Alpha channel should be 255');

        // Check a pixel outside the rectangle
        const outsidePixelData = ctx.getImageData(5, 5, 1, 1).data;
        assert.strictEqual(outsidePixelData[3], 0, 'Outside pixel alpha should be 0');

        // Check if the context's default path is still empty
        assert.strictEqual(ctx.path.length, 0, "Context's default path should not be modified");
    });

    test('should stroke a Path2D object', () => {
        // Create a path for a rectangle
        const path = new Path2D();
        path.rect(10, 10, 80, 80);

        // Stroke the path
        ctx.strokeStyle = 'blue';
        ctx.lineWidth = 2; // Use an even number for easier pixel checking
        ctx.stroke(path);

        // Check a pixel on the top line of the stroked rectangle
        const pixelData = ctx.getImageData(50, 10, 1, 1).data;
        assert.strictEqual(pixelData[0], 0, 'Red channel should be 0');
        assert.strictEqual(pixelData[1], 0, 'Green channel should be 0');
        assert.strictEqual(pixelData[2], 255, 'Blue channel should be 255');
        assert.strictEqual(pixelData[3], 255, 'Alpha channel should be 255');

        // Check if the context's default path is still empty
        assert.strictEqual(ctx.path.length, 0, "Context's default path should not be modified");
    });

    test('should fill the default path when no Path2D is provided', () => {
        ctx.rect(10, 10, 80, 80);
        ctx.fillStyle = 'green';
        ctx.fill();

        const pixelData = ctx.getImageData(50, 50, 1, 1).data;
        assert.strictEqual(pixelData[1], 255, 'Green channel should be 255');
    });

    test('constructor should copy from another Path2D', () => {
        const path1 = new Path2D();
        path1.rect(10, 10, 50, 50);

        const path2 = new Path2D(path1);
        assert.deepStrictEqual(path2.path, path1.path, 'Path data should be copied');
        assert.notStrictEqual(path2.path, path1.path, 'Path data should be a deep copy, not a reference');
    });

    test('addPath should combine two paths', () => {
        const path1 = new Path2D();
        path1.rect(10, 10, 20, 20); // 5 commands: moveTo, lineTo, lineTo, lineTo, closePath

        const path2 = new Path2D();
        path2.moveTo(50, 50); // 1 command

        path2.addPath(path1);

        assert.strictEqual(path2.path.length, 6, 'Paths should be combined');
        assert.deepStrictEqual(path2.path[0], { type: 'move', x: 50, y: 50 });
        assert.deepStrictEqual(path2.path[1], { type: 'move', x: 10, y: 10 });
    });

    test('should use a Path2D object for clipping', () => {
        // Create a circular clipping path
        const clipPath = new Path2D();
        clipPath.rect(25, 25, 50, 50);

        ctx.clip(clipPath);

        // Fill a rectangle that is larger than the clipping path
        ctx.fillStyle = 'purple';
        ctx.fillRect(0, 0, 100, 100);

        // Check a pixel inside the clipping region
        const insidePixel = ctx.getImageData(50, 50, 1, 1).data;
        assert.strictEqual(insidePixel[0], 128, 'Inside pixel should be purple (red=128)');
        assert.strictEqual(insidePixel[3], 255, 'Inside pixel should be opaque');

        // Check a pixel outside the clipping region
        const outsidePixel = ctx.getImageData(10, 10, 1, 1).data;
        assert.strictEqual(outsidePixel[3], 0, 'Outside pixel should be transparent');
    });
});
