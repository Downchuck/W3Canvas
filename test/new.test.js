const test = require('node:test');
const assert = require('node:assert');
const Canvas = require('../lib/canvas.js');

test('fillRect should fill a rectangle with the current fillStyle', () => {
    const canvas = new Canvas(10, 10);
    const ctx = canvas.getContext('2d');
    const x = 2;
    const y = 2;
    const width = 5;
    const height = 5;
    const color = { r: 255, g: 0, b: 0, a: 255 }; // Red

    ctx.fillStyle = color;
    ctx.fillRect(x, y, width, height);

    // Check some pixels to ensure the rectangle was filled
    assert.deepStrictEqual(canvas.getPixel(x, y), color, 'Top-left pixel should be filled');
    assert.deepStrictEqual(canvas.getPixel(x + width - 1, y + height - 1), color, 'Bottom-right pixel should be filled');
    assert.deepStrictEqual(canvas.getPixel(x + 2, y + 2), color, 'A middle pixel should be filled');

    // Check some pixels outside the rectangle to ensure they were not filled
    const defaultPixel = { r: 0, g: 0, b: 0, a: 0 };
    assert.deepStrictEqual(canvas.getPixel(x - 1, y - 1), defaultPixel, 'Pixel outside (top-left) should not be filled');
    assert.deepStrictEqual(canvas.getPixel(x + width, y + height), defaultPixel, 'Pixel outside (bottom-right) should not be filled');
});
