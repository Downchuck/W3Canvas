import { scanlineFill } from './src/core/algorithms/scanline_fill.js';
import { getWindingDirection } from './src/core/algorithms/path.js';
import { CanvasRenderingContext2D } from './src/core/canvas/CanvasRenderingContext2D.js';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import { PNG } from 'pngjs';
import assert from 'node:assert';

function writeImageDataToFile(imageData, filename) {
    const { width, height, data } = imageData;
    const png = new PNG({ width, height });
    png.data = Buffer.from(data.buffer);
    const buffer = PNG.sync.write(png);

    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const outputPath = path.join(__dirname, 'jules-scratch', 'rasterizer-debug');

    if (!fs.existsSync(outputPath)) {
        fs.mkdirSync(outputPath, { recursive: true });
    }

    fs.writeFileSync(path.join(outputPath, filename), buffer);
    console.log(`Wrote debug image to ${path.join(outputPath, filename)}`);
}

function getPixel(imageData, x, y) {
  const { width, data } = imageData;
  const index = (y * width + x) * 4;
  return { r: data[index], g: data[index + 1], b: data[index + 2], a: data[index + 3] };
}


const width = 100;
const height = 100;

const ctx = new CanvasRenderingContext2D(width, height);

// Winding rule test case
const outerPath = [
    { type: 'move', x: 90, y: 90 },
    { type: 'line', x: 10, y: 90 },
    { type: 'line', x: 10, y: 10 },
    { type: 'line', x: 90, y: 10 },
    { type: 'close' },
];
const innerPath = [
    { type: 'move', x: 30, y: 30 },
    { type: 'line', x: 30, y: 70 },
    { type: 'line', x: 70, y: 70 },
    { type: 'line', x: 70, y: 30 },
    { type: 'close' },
];

const windingRulePath = [...outerPath, ...innerPath];

const outerDir = getWindingDirection(outerPath);
const innerDir = getWindingDirection(innerPath);

console.log('Outer path direction:', outerDir);
console.log('Inner path direction:', innerDir);

assert.strictEqual(outerDir, 1, 'Outer path should be CCW');
assert.strictEqual(innerDir, -1, 'Inner path should be CW');

const imageData = scanlineFill(
    windingRulePath,
    width,
    height,
    'red', // fillStyle
    1.0,   // globalAlpha
    (path) => path, // mock getTransformedPath
    CanvasRenderingContext2D, // shadowContextConstructor
    ctx._getColorFromGradientAtPoint.bind(ctx),
    ctx._getColorFromPatternAtPoint.bind(ctx),
    ctx._parseColor.bind(ctx)
);

writeImageDataToFile(imageData, 'winding-rule-debug.png');

// Assertions
const pixelInHole = getPixel(imageData, 50, 50);
assert.deepStrictEqual(pixelInHole, { r: 0, g: 0, b: 0, a: 0 }, 'The hole should not be filled.');

console.log('Debug script finished successfully!');
