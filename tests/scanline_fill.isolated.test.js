import { test } from 'node:test';
import assert from 'node:assert';
import { scanlineFill } from '../src/core/algorithms/scanline_fill.js';
import { CanvasGradient } from '../src/core/canvas/CanvasGradient.js';
import { CanvasPattern } from '../src/core/canvas/CanvasPattern.js';

// Helper function to get the color of a specific pixel
function getPixel(imageData, x, y) {
  const { width, data } = imageData;
  const index = (y * width + x) * 4;
  return { r: data[index], g: data[index + 1], b: data[index + 2], a: data[index + 3] };
}

test('Isolated ScanlineFill: Winding Rule', (t) => {
    const width = 100;
    const height = 100;

    const windingRulePath = [
        // Outer rectangle (CCW)
        { type: 'move', x: 90, y: 90 },
        { type: 'line', x: 10, y: 90 },
        { type: 'line', x: 10, y: 10 },
        { type: 'line', x: 90, y: 10 },
        { type: 'close' },
        // Inner rectangle (CW)
        { type: 'move', x: 30, y: 30 },
        { type: 'line', x: 70, y: 30 },
        { type: 'line', x: 70, y: 70 },
        { type: 'line', x: 30, y: 70 },
        { type: 'close' },
    ];

    // Mock dependencies
    const getTransformedPath = (path) => path;
    const shadowContextConstructor = () => {}; // Not used
    const getColorFromGradientAtPoint = () => ({ r: 0, g: 0, b: 0, a: 0 });
    const getColorFromPatternAtPoint = () => ({ r: 0, g: 0, b: 0, a: 0 });
    const parseColor = () => ({ r: 255, g: 0, b: 0, a: 255 });

    const imageData = scanlineFill(
        windingRulePath,
        width,
        height,
        'red', // fillStyle
        1.0,   // globalAlpha
        getTransformedPath,
        shadowContextConstructor,
        getColorFromGradientAtPoint,
        getColorFromPatternAtPoint,
        parseColor
    );

    const pixelInHole = getPixel(imageData, 50, 50);
    const pixelOnShape = getPixel(imageData, 15, 15);

    assert.deepStrictEqual(pixelInHole, { r: 0, g: 0, b: 0, a: 0 }, 'The hole should not be filled.');
    assert.deepStrictEqual(pixelOnShape, { r: 255, g: 0, b: 0, a: 255 }, 'The shape area should be filled red.');
});
