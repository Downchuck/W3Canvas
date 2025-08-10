import { CanvasRenderingContext2D } from '../src/core/canvas/CanvasRenderingContext2D.js';

function assertEqual(a, b, message) {
  if (a !== b) {
    throw new Error(`Assertion failed: ${message} - expected ${b}, but got ${a}`);
  }
}

function assertPixel(imageData, x, y, r, g, b, a) {
  const index = (y * imageData.width + x) * 4;
  assertEqual(imageData.data[index], r, `Red channel at (${x},${y})`);
  assertEqual(imageData.data[index + 1], g, `Green channel at (${x},${y})`);
  assertEqual(imageData.data[index + 2], b, `Blue channel at (${x},${y})`);
  assertEqual(imageData.data[index + 3], a, `Alpha channel at (${x},${y})`);
}

function testFillRect() {
  console.log('Running test: testFillRect');
  const ctx = new CanvasRenderingContext2D(100, 100);
  ctx.fillStyle = 'red';
  ctx.fillRect(10, 10, 20, 20);

  // Check a pixel inside the rectangle
  assertPixel(ctx.imageData, 15, 15, 255, 0, 0, 255);
  // Check a pixel outside the rectangle
  assertPixel(ctx.imageData, 5, 5, 0, 0, 0, 0);
  console.log('Passed test: testFillRect');
}

function testClearRect() {
  console.log('Running test: testClearRect');
  const ctx = new CanvasRenderingContext2D(100, 100);
  ctx.fillStyle = 'blue';
  ctx.fillRect(0, 0, 100, 100);
  ctx.clearRect(10, 10, 20, 20);

  // Check a pixel inside the cleared rectangle
  assertPixel(ctx.imageData, 15, 15, 0, 0, 0, 0);
  // Check a pixel outside the cleared rectangle
  assertPixel(ctx.imageData, 5, 5, 0, 0, 255, 255);
  console.log('Passed test: testClearRect');
}

function testStrokeRect() {
  console.log('Running test: testStrokeRect');
  const ctx = new CanvasRenderingContext2D(100, 100);
  ctx.strokeStyle = '#00FF00'; // green
  ctx.strokeRect(10, 10, 20, 20);

  // Check a pixel on the top line
  assertPixel(ctx.imageData, 15, 10, 0, 255, 0, 255);
  // Check a pixel on the right line
  assertPixel(ctx.imageData, 30, 15, 0, 255, 0, 255);
  // Check a pixel on the bottom line
  assertPixel(ctx.imageData, 15, 30, 0, 255, 0, 255);
  // Check a pixel on the left line
  assertPixel(ctx.imageData, 10, 15, 0, 255, 0, 255);
  // Check a pixel inside the rectangle (should be transparent)
  assertPixel(ctx.imageData, 15, 15, 0, 0, 0, 0);
  console.log('Passed test: testStrokeRect');
}

try {
  testFillRect();
  testClearRect();
  testStrokeRect();
  console.log('All tests passed!');
} catch (e) {
  console.error('A test failed:');
  console.error(e);
  process.exit(1);
}
