const test = require('node:test');
const assert = require('node:assert');
const Canvas = require('../lib/canvas.js');

test('fillRect should fill a rectangle with the specified color', () => {
    const canvas = new Canvas(10, 10);
    const x = 2;
    const y = 2;
    const width = 5;
    const height = 5;
    const color = 1; // Using 1 for the color

    canvas.fillRect(x, y, width, height, color);

    // Check some pixels to ensure the rectangle was filled
    assert.strictEqual(canvas.getPixel(x, y), color, 'Top-left pixel should be filled');
    assert.strictEqual(canvas.getPixel(x + width - 1, y + height - 1), color, 'Bottom-right pixel should be filled');
    assert.strictEqual(canvas.getPixel(x + 2, y + 2), color, 'A middle pixel should be filled');

    // Check some pixels outside the rectangle to ensure they were not filled
    assert.strictEqual(canvas.getPixel(x - 1, y - 1), 0, 'Pixel outside (top-left) should not be filled');
    assert.strictEqual(canvas.getPixel(x + width, y + height), 0, 'Pixel outside (bottom-right) should not be filled');
});
