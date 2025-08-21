import { test } from 'node:test';
import assert from 'node:assert';
import { CanvasRenderingContext2D } from '../src/core/canvas/CanvasRenderingContext2D.js';
import { assertPixelIsColor } from './test-helpers.js';

// Create a simple 2x2 image for the pattern:
// Red | Green
// Blue| Black
const patternImage = {
    width: 2,
    height: 2,
    data: new Uint8ClampedArray([
        255, 0, 0, 255,   // Red
        0, 255, 0, 255,   // Green
        0, 0, 255, 255,   // Blue
        0, 0, 0, 255,     // Black
    ]),
};

test('createPattern with "repeat"', (t) => {
    const ctx = new CanvasRenderingContext2D(10, 10);
    const pattern = ctx.createPattern(patternImage, 'repeat');
    ctx.fillStyle = pattern;
    ctx.fillRect(0, 0, 10, 10);
    const img = ctx.getImageData(0, 0, 10, 10);

    // Top-left of original pattern
    assertPixelIsColor(img, 0, 0, [255, 0, 0, 255]);
    // Top-right of original pattern
    assertPixelIsColor(img, 1, 0, [0, 255, 0, 255]);
    // Bottom-left of original pattern
    assertPixelIsColor(img, 0, 1, [0, 0, 255, 255]);
    // Bottom-right of original pattern
    assertPixelIsColor(img, 1, 1, [0, 0, 0, 255]);

    // Check repeated pattern
    assertPixelIsColor(img, 2, 2, [255, 0, 0, 255]); // Same as (0,0)
    assertPixelIsColor(img, 3, 2, [0, 255, 0, 255]); // Same as (1,0)
    assertPixelIsColor(img, 2, 3, [0, 0, 255, 255]); // Same as (0,1)
});

test('createPattern with "repeat-x"', (t) => {
    const ctx = new CanvasRenderingContext2D(10, 10);
    const pattern = ctx.createPattern(patternImage, 'repeat-x');
    ctx.fillStyle = pattern;
    ctx.fillRect(0, 0, 10, 10);
    const img = ctx.getImageData(0, 0, 10, 10);

    // Check horizontal repeat
    assertPixelIsColor(img, 2, 0, [255, 0, 0, 255]); // Same as (0,0)
    assertPixelIsColor(img, 3, 1, [0, 0, 0, 255]); // Same as (1,1)

    // Check vertical non-repeat (should be transparent black)
    assertPixelIsColor(img, 0, 2, [0, 0, 0, 0]);
    assertPixelIsColor(img, 1, 3, [0, 0, 0, 0]);
});

test('createPattern with "repeat-y"', (t) => {
    const ctx = new CanvasRenderingContext2D(10, 10);
    const pattern = ctx.createPattern(patternImage, 'repeat-y');
    ctx.fillStyle = pattern;
    ctx.fillRect(0, 0, 10, 10);
    const img = ctx.getImageData(0, 0, 10, 10);

    // Check vertical repeat
    assertPixelIsColor(img, 0, 2, [255, 0, 0, 255]); // Same as (0,0)
    assertPixelIsColor(img, 1, 3, [0, 0, 0, 255]); // Same as (1,1)

    // Check horizontal non-repeat (should be transparent black)
    assertPixelIsColor(img, 2, 0, [0, 0, 0, 0]);
    assertPixelIsColor(img, 3, 1, [0, 0, 0, 0]);
});

test('createPattern with "no-repeat"', (t) => {
    const ctx = new CanvasRenderingContext2D(10, 10);
    const pattern = ctx.createPattern(patternImage, 'no-repeat');
    ctx.fillStyle = pattern;
    ctx.fillRect(0, 0, 10, 10);
    const img = ctx.getImageData(0, 0, 10, 10);

    // Check original pattern
    assertPixelIsColor(img, 1, 1, [0, 0, 0, 255]);

    // Check non-repeat (should be transparent black)
    assertPixelIsColor(img, 2, 0, [0, 0, 0, 0]);
    assertPixelIsColor(img, 0, 2, [0, 0, 0, 0]);
});
