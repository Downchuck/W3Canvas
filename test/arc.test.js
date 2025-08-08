const test = require('node:test');
const assert = require('node:assert');
const Canvas = require('../lib/canvas.js');

test('arc should add an arc to the path', () => {
    const canvas = new Canvas(30, 30);
    const ctx = canvas.getContext('2d');
    const color = { r: 255, g: 165, b: 0, a: 255 }; // Orange

    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.arc(15, 15, 10, 0, Math.PI); // Draw a semicircle
    ctx.stroke();

    // Check a few pixels on the arc
    // Top of the arc
    assert.deepStrictEqual(canvas.getPixel(15, 5), color, 'Pixel on top of arc should be stroked');
    // Right side of the arc
    assert.deepStrictEqual(canvas.getPixel(25, 15), color, 'Pixel on right of arc should be stroked');
    // Left side of the arc
    assert.deepStrictEqual(canvas.getPixel(5, 15), color, 'Pixel on left of arc should be stroked');

    // Check a pixel that should not be part of the semicircle
    assert.deepStrictEqual(canvas.getPixel(15, 25), { r: 0, g: 0, b: 0, a: 0 }, 'Pixel on bottom should not be stroked');
});
