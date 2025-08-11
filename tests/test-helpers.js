import assert from 'node:assert';

export function assertPixelIsColor(imageData, x, y, color) {
    const i = (y * imageData.width + x) * 4;
    assert.strictEqual(imageData.data[i], color[0], `Pixel R channel at (${x},${y})`);
    assert.strictEqual(imageData.data[i+1], color[1], `Pixel G channel at (${x},${y})`);
    assert.strictEqual(imageData.data[i+2], color[2], `Pixel B channel at (${x},${y})`);
    assert.strictEqual(imageData.data[i+3], color[3], `Pixel A channel at (${x},${y})`);
}

export function assertPixelIsCloseToColor(imageData, x, y, color, tolerance = 15) {
    const i = (y * imageData.width + x) * 4;
    assert.ok(Math.abs(imageData.data[i] - color[0]) <= tolerance, `Pixel R channel at (${x},${y}) is not close to ${color[0]}`);
    assert.ok(Math.abs(imageData.data[i+1] - color[1]) <= tolerance, `Pixel G channel at (${x},${y}) is not close to ${color[1]}`);
    assert.ok(Math.abs(imageData.data[i+2] - color[2]) <= tolerance, `Pixel B channel at (${x},${y}) is not close to ${color[2]}`);
    assert.ok(Math.abs(imageData.data[i+3] - color[3]) <= tolerance, `Pixel A channel at (${x},${y}) is not close to ${color[3]}`);
}
