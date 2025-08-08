const test = require('node:test');
const assert = require('node:assert');
const Canvas = require('../lib/canvas.js');

test('stroke should draw lines along a path', () => {
    const canvas = new Canvas(20, 20);
    const ctx = canvas.getContext('2d');
    const color = { r: 0, g: 255, b: 0, a: 255 }; // Green

    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.moveTo(5, 5);
    ctx.lineTo(15, 5);
    ctx.lineTo(15, 15);
    ctx.closePath();
    ctx.stroke();

    // Check a few pixels on the lines
    assert.deepStrictEqual(canvas.getPixel(10, 5), color, 'Pixel on top line should be stroked');
    assert.deepStrictEqual(canvas.getPixel(15, 10), color, 'Pixel on right line should be stroked');
    assert.deepStrictEqual(canvas.getPixel(5, 10), color, 'Pixel on left line should be stroked');

    // Check a pixel inside the shape to ensure it's not filled
    assert.deepStrictEqual(canvas.getPixel(10, 10), { r: 0, g: 0, b: 0, a: 0 }, 'Pixel inside shape should not be stroked');
});
