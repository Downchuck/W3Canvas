import { CanvasRenderingContext2D } from '../src/core/canvas/CanvasRenderingContext2D.js';
import { JSDOM } from 'jsdom';

const dom = new JSDOM(`<!DOCTYPE html>`);
global.document = dom.window.document;

function assertEqual(a, b, message) {
  if (a !== b) {
    throw new Error(`Assertion failed: ${message} - expected ${b}, but got ${a}`);
  }
}

function assertPixel(imageData, x, y, r, g, b, a, tolerance = 0) {
  const index = (y * imageData.width + x) * 4;
  if (tolerance > 0) {
    const r_ok = Math.abs(imageData.data[index] - r) <= tolerance;
    const g_ok = Math.abs(imageData.data[index + 1] - g) <= tolerance;
    const b_ok = Math.abs(imageData.data[index + 2] - b) <= tolerance;
    const a_ok = Math.abs(imageData.data[index + 3] - a) <= tolerance;
    if (r_ok && g_ok && b_ok && a_ok) {
      return;
    }
  }
  assertEqual(imageData.data[index], r, `Red channel at (${x},${y})`);
  assertEqual(imageData.data[index + 1], g, `Green channel at (${x},${y})`);
  assertEqual(imageData.data[index + 2], b, `Blue channel at (${x},${y})`);
  assertEqual(imageData.data[index + 3], a, `Alpha channel at (${x},${y})`);
}


function testFillText() {
  console.log('Running test: testFillText');
  const ctx = new CanvasRenderingContext2D(100, 100);
  ctx.fillStyle = 'red';
  ctx.font = '20px sans-serif';
  ctx.fillText('Hello', 10, 10);

  // It's hard to test text rendering with exact pixel values due to anti-aliasing.
  // We'll check a few pixels to see if they are reddish.
  assertPixel(ctx.imageData, 15, 20, 255, 0, 0, 255, 200); // Check for a reddish pixel in the text area
  console.log('Passed test: testFillText');
}

function testStrokeText() {
  console.log('Running test: testStrokeText');
  const ctx = new CanvasRenderingContext2D(100, 100);
  ctx.strokeStyle = 'blue';
  ctx.font = '20px sans-serif';
  ctx.strokeText('Hello', 10, 50);

  // Check for a blueish pixel in the text area
  assertPixel(ctx.imageData, 15, 60, 0, 0, 255, 255, 200);
  console.log('Passed test: testStrokeText');
}

function testMeasureText() {
    console.log('Running test: testMeasureText');
    const ctx = new CanvasRenderingContext2D(100, 100);
    ctx.font = '20px sans-serif';
    const metrics = ctx.measureText('Hello');
    assertEqual(metrics.width > 20, true, 'Text width should be greater than 20');
    console.log('Passed test: testMeasureText');
}

try {
  testFillText();
  testStrokeText();
  testMeasureText();
  console.log('All text tests passed!');
} catch (e) {
  console.error('A text test failed:');
  console.error(e);
  process.exit(1);
}
