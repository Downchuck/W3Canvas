const test = require('node:test');
const assert = require('node:assert');
const Canvas = require('../lib/canvas.js');

test('translate should offset the drawing', () => {
    const canvas = new Canvas(20, 20);
    const ctx = canvas.getContext('2d');
    const color = { r: 0, g: 0, b: 255, a: 255 }; // Blue

    ctx.fillStyle = color;
    ctx.translate(5, 5);
    ctx.fillRect(0, 0, 10, 10);

    // Check a pixel inside the translated rectangle
    assert.deepStrictEqual(canvas.getPixel(10, 10), color, 'Pixel inside translated rect should be filled');

    // Check a pixel where the rectangle would have been without translation
    assert.deepStrictEqual(canvas.getPixel(2, 2), { r: 0, g: 0, b: 0, a: 0 }, 'Pixel at original location should not be filled');
});

test('save and restore should manage transformation state', () => {
    const canvas = new Canvas(30, 30);
    const ctx = canvas.getContext('2d');
    const color1 = { r: 255, g: 0, b: 0, a: 255 }; // Red
    const color2 = { r: 0, g: 255, b: 0, a: 255 }; // Green

    ctx.fillStyle = color1;
    ctx.save();
    ctx.translate(10, 10);
    ctx.fillRect(0, 0, 10, 10); // Draws a red square at (10, 10)
    ctx.restore();

    ctx.fillStyle = color2;
    ctx.fillRect(0, 0, 10, 10); // Draws a green square at (0, 0)

    assert.deepStrictEqual(canvas.getPixel(15, 15), color1, 'Pixel in saved-state rect should be red');
    assert.deepStrictEqual(canvas.getPixel(5, 5), color2, 'Pixel in restored-state rect should be green');
});
