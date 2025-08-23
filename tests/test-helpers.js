import assert from 'node:assert';
import fs from 'fs';
import path from 'path';
import { PNG } from 'pngjs';
import { fileURLToPath } from 'url';

export function writeImageDataToFile(imageData, filename) {
    const { width, height, data } = imageData;
    const png = new PNG({ width, height });
    png.data = Buffer.from(data.buffer);
    const buffer = PNG.sync.write(png);

    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const outputPath = path.join(__dirname, '..', 'jules-scratch', 'test-output');

    if (!fs.existsSync(outputPath)) {
        fs.mkdirSync(outputPath, { recursive: true });
    }

    fs.writeFileSync(path.join(outputPath, filename), buffer);
    console.log(`Wrote debug image to ${path.join(outputPath, filename)}`);
}

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
