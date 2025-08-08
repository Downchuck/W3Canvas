const test = require('node:test');
const assert = require('node:assert');
const Canvas = require('../lib/canvas.js');

test('fill should fill a closed path', () => {
    const canvas = new Canvas(20, 20);
    const ctx = canvas.getContext('2d');
    const color = { r: 255, g: 0, b: 255, a: 255 }; // Magenta

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(5, 5);
    ctx.lineTo(15, 5);
    ctx.lineTo(15, 15);
    ctx.lineTo(5, 15);
    ctx.closePath();
    ctx.fill();

    // Check a pixel inside the shape
    assert.deepStrictEqual(canvas.getPixel(10, 10), color, 'Pixel inside shape should be filled');

    // Check a pixel on the border (should be filled by this algorithm)
    assert.deepStrictEqual(canvas.getPixel(5, 10), color, 'Pixel on the border should be filled');

    // Check a pixel outside the shape
    assert.deepStrictEqual(canvas.getPixel(4, 10), { r: 0, g: 0, b: 0, a: 0 }, 'Pixel outside shape should not be filled');
});
