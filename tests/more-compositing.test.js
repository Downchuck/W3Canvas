import { test } from 'node:test';
import assert from 'node:assert';
import { CanvasRenderingContext2D } from '../src/core/canvas/CanvasRenderingContext2D.js';

function assertPixel(ctx, x, y, r, g, b, a, message) {
    const pixelData = ctx.getImageData(x, y, 1, 1).data;
    assert.strictEqual(pixelData[0], r, `${message} - red`);
    assert.strictEqual(pixelData[1], g, `${message} - green`);
    assert.strictEqual(pixelData[2], b, `${message} - blue`);
    assert(Math.abs(pixelData[3] - a) <= 1, `${message} - alpha`);
}

test('source-in compositing', () => {
    const ctx = new CanvasRenderingContext2D(100, 100);
    ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
    ctx.fillRect(20, 20, 50, 50);
    ctx.globalCompositeOperation = 'source-in';
    ctx.fillStyle = 'rgba(0, 0, 255, 1)';
    ctx.fillRect(40, 40, 50, 50);
    assertPixel(ctx, 50, 50, 0, 0, 255, 127, 'Overlapping pixel should be blue with 0.5 alpha');
});

test('source-out compositing', () => {
    const ctx = new CanvasRenderingContext2D(100, 100);
    ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
    ctx.fillRect(20, 20, 50, 50);
    ctx.globalCompositeOperation = 'source-out';
    ctx.fillStyle = 'rgba(0, 0, 255, 1)';
    ctx.fillRect(40, 40, 50, 50);
    assertPixel(ctx, 50, 50, 0, 0, 255, 127, 'Overlapping pixel should be blue with 0.5 alpha');
});

test('source-atop compositing', () => {
    const ctx = new CanvasRenderingContext2D(100, 100);
    ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
    ctx.fillRect(20, 20, 50, 50);
    ctx.globalCompositeOperation = 'source-atop';
    ctx.fillStyle = 'rgba(0, 0, 255, 1)';
    ctx.fillRect(40, 40, 50, 50);
    assertPixel(ctx, 50, 50, 0, 0, 255, 127, 'Overlapping pixel should be blue with 0.5 alpha');
    assertPixel(ctx, 30, 30, 255, 0, 0, 127, 'Non-overlapping destination pixel should be red');
});

test('destination-over compositing', () => {
    const ctx = new CanvasRenderingContext2D(100, 100);
    ctx.fillStyle = 'rgba(255, 0, 0, 1)';
    ctx.fillRect(20, 20, 50, 50);
    ctx.globalCompositeOperation = 'destination-over';
    ctx.fillStyle = 'rgba(0, 0, 255, 0.5)';
    ctx.fillRect(40, 40, 50, 50);
    assertPixel(ctx, 50, 50, 255, 0, 0, 255, 'Overlapping pixel should be red');
});

test('destination-in compositing', () => {
    const ctx = new CanvasRenderingContext2D(100, 100);
    ctx.fillStyle = 'rgba(255, 0, 0, 1)';
    ctx.fillRect(20, 20, 50, 50);
    ctx.globalCompositeOperation = 'destination-in';
    ctx.fillStyle = 'rgba(0, 0, 255, 0.5)';
    ctx.fillRect(40, 40, 50, 50);
    assertPixel(ctx, 50, 50, 255, 0, 0, 127, 'Overlapping pixel should be red with 0.5 alpha');
});

test('destination-out compositing', () => {
    const ctx = new CanvasRenderingContext2D(100, 100);
    ctx.fillStyle = 'rgba(255, 0, 0, 1)';
    ctx.fillRect(20, 20, 50, 50);
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillStyle = 'rgba(0, 0, 255, 0.5)';
    ctx.fillRect(40, 40, 50, 50);
    assertPixel(ctx, 30, 30, 255, 0, 0, 255, 'Non-overlapping destination pixel should be red');
    assertPixel(ctx, 50, 50, 255, 0, 0, 127, 'Overlapping pixel should be red with 0.5 alpha');
});

test('destination-atop compositing', () => {
    const ctx = new CanvasRenderingContext2D(100, 100);
    ctx.fillStyle = 'rgba(255, 0, 0, 1)';
    ctx.fillRect(20, 20, 50, 50);
    ctx.globalCompositeOperation = 'destination-atop';
    ctx.fillStyle = 'rgba(0, 0, 255, 0.5)';
    ctx.fillRect(40, 40, 50, 50);
    assertPixel(ctx, 50, 50, 255, 0, 0, 127, 'Overlapping pixel should be red with 0.5 alpha');
    assertPixel(ctx, 80, 80, 0, 0, 255, 127, 'Non-overlapping source pixel should be blue');
});

test('lighter compositing', () => {
    const ctx = new CanvasRenderingContext2D(100, 100);
    ctx.fillStyle = 'red';
    ctx.fillRect(20, 20, 50, 50);
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = 'blue';
    ctx.fillRect(40, 40, 50, 50);
    assertPixel(ctx, 50, 50, 255, 0, 255, 255, 'Overlapping pixel should be magenta');
});

test('copy compositing', () => {
    const ctx = new CanvasRenderingContext2D(100, 100);
    ctx.fillStyle = 'red';
    ctx.fillRect(20, 20, 50, 50);
    ctx.globalCompositeOperation = 'copy';
    ctx.fillStyle = 'blue';
    ctx.fillRect(40, 40, 50, 50);
    assertPixel(ctx, 30, 30, 0, 0, 0, 0, 'Non-overlapping destination pixel should be transparent');
    assertPixel(ctx, 50, 50, 0, 0, 255, 255, 'Overlapping pixel should be blue');
});

test('xor compositing', () => {
    const ctx = new CanvasRenderingContext2D(100, 100);
    ctx.fillStyle = 'red';
    ctx.fillRect(20, 20, 50, 50);
    ctx.globalCompositeOperation = 'xor';
    ctx.fillStyle = 'blue';
    ctx.fillRect(40, 40, 50, 50);
    assertPixel(ctx, 50, 50, 0, 0, 0, 0, 'Overlapping pixel should be transparent');
});

test('multiply compositing', () => {
    const ctx = new CanvasRenderingContext2D(100, 100);
    ctx.fillStyle = 'rgb(255, 128, 0)';
    ctx.fillRect(20, 20, 50, 50);
    ctx.globalCompositeOperation = 'multiply';
    ctx.fillStyle = 'rgb(0, 128, 255)';
    ctx.fillRect(40, 40, 50, 50);
    assertPixel(ctx, 50, 50, 0, 64, 0, 255, 'Overlapping pixel should be the product of the two colors');
});

test('screen compositing', () => {
    const ctx = new CanvasRenderingContext2D(100, 100);
    ctx.fillStyle = 'rgb(255, 128, 0)';
    ctx.fillRect(20, 20, 50, 50);
    ctx.globalCompositeOperation = 'screen';
    ctx.fillStyle = 'rgb(0, 128, 255)';
    ctx.fillRect(40, 40, 50, 50);
    assertPixel(ctx, 50, 50, 255, 192, 255, 255, 'Overlapping pixel should be the screen of the two colors');
});

test('overlay compositing', () => {
    const ctx = new CanvasRenderingContext2D(100, 100);
    ctx.fillStyle = 'rgb(255, 128, 0)';
    ctx.fillRect(20, 20, 50, 50);
    ctx.globalCompositeOperation = 'overlay';
    ctx.fillStyle = 'rgb(0, 128, 255)';
    ctx.fillRect(40, 40, 50, 50);
    assertPixel(ctx, 50, 50, 0, 128, 0, 255, 'Overlapping pixel should be the overlay of the two colors');
});

test('darken compositing', () => {
    const ctx = new CanvasRenderingContext2D(100, 100);
    ctx.fillStyle = 'rgb(255, 128, 0)';
    ctx.fillRect(20, 20, 50, 50);
    ctx.globalCompositeOperation = 'darken';
    ctx.fillStyle = 'rgb(0, 128, 255)';
    ctx.fillRect(40, 40, 50, 50);
    assertPixel(ctx, 50, 50, 0, 128, 0, 255, 'Overlapping pixel should be the darker of the two colors');
});

test('lighten compositing', () => {
    const ctx = new CanvasRenderingContext2D(100, 100);
    ctx.fillStyle = 'rgb(255, 128, 0)';
    ctx.fillRect(20, 20, 50, 50);
    ctx.globalCompositeOperation = 'lighten';
    ctx.fillStyle = 'rgb(0, 128, 255)';
    ctx.fillRect(40, 40, 50, 50);
    assertPixel(ctx, 50, 50, 255, 128, 255, 255, 'Overlapping pixel should be the lighter of the two colors');
});

test('color-dodge compositing', () => {
    const ctx = new CanvasRenderingContext2D(100, 100);
    ctx.fillStyle = 'rgb(128, 128, 128)';
    ctx.fillRect(20, 20, 50, 50);
    ctx.globalCompositeOperation = 'color-dodge';
    ctx.fillStyle = 'rgb(128, 128, 128)';
    ctx.fillRect(40, 40, 50, 50);
    assertPixel(ctx, 50, 50, 255, 255, 255, 255, 'Overlapping pixel should be dodged');
});

test('color-burn compositing', () => {
    const ctx = new CanvasRenderingContext2D(100, 100);
    ctx.fillStyle = 'rgb(128, 128, 128)';
    ctx.fillRect(20, 20, 50, 50);
    ctx.globalCompositeOperation = 'color-burn';
    ctx.fillStyle = 'rgb(128, 128, 128)';
    ctx.fillRect(40, 40, 50, 50);
    assertPixel(ctx, 50, 50, 0, 0, 0, 255, 'Overlapping pixel should be burned');
});

test('hard-light compositing', () => {
    const ctx = new CanvasRenderingContext2D(100, 100);
    ctx.fillStyle = 'rgb(255, 0, 0)';
    ctx.fillRect(20, 20, 50, 50);
    ctx.globalCompositeOperation = 'hard-light';
    ctx.fillStyle = 'rgb(0, 0, 255)';
    ctx.fillRect(40, 40, 50, 50);
    assertPixel(ctx, 50, 50, 0, 0, 0, 255, 'Overlapping pixel should be black');
});

test('soft-light compositing', () => {
    const ctx = new CanvasRenderingContext2D(100, 100);
    ctx.fillStyle = 'rgb(255, 0, 0)';
    ctx.fillRect(20, 20, 50, 50);
    ctx.globalCompositeOperation = 'soft-light';
    ctx.fillStyle = 'rgb(128, 128, 128)';
    ctx.fillRect(40, 40, 50, 50);
    assertPixel(ctx, 50, 50, 255, 0, 0, 255, 'Overlapping pixel should be red');
});

test('difference compositing', () => {
    const ctx = new CanvasRenderingContext2D(100, 100);
    ctx.fillStyle = 'rgb(255, 255, 255)';
    ctx.fillRect(20, 20, 50, 50);
    ctx.globalCompositeOperation = 'difference';
    ctx.fillStyle = 'rgb(128, 128, 128)';
    ctx.fillRect(40, 40, 50, 50);
    assertPixel(ctx, 50, 50, 127, 127, 127, 255, 'Overlapping pixel should be the difference');
});

test('exclusion compositing', () => {
    const ctx = new CanvasRenderingContext2D(100, 100);
    ctx.fillStyle = 'rgb(255, 255, 255)';
    ctx.fillRect(20, 20, 50, 50);
    ctx.globalCompositeOperation = 'exclusion';
    ctx.fillStyle = 'rgb(128, 128, 128)';
    ctx.fillRect(40, 40, 50, 50);
    assertPixel(ctx, 50, 50, 127, 127, 127, 255, 'Overlapping pixel should be the exclusion');
});
