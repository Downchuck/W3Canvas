import { test } from 'node:test';
import assert from 'node:assert';
import { CanvasRenderingContext2D } from '../src/core/canvas/CanvasRenderingContext2D.js';
import { CanvasGradient } from '../src/core/canvas/CanvasGradient.js';

test('CanvasRenderingContext2D.createLinearGradient creates a CanvasGradient object', () => {
    const ctx = new CanvasRenderingContext2D(100, 100);
    const gradient = ctx.createLinearGradient(0, 0, 100, 100);
    assert.ok(gradient instanceof CanvasGradient, 'should return a CanvasGradient instance');
    assert.strictEqual(gradient.x0, 0);
    assert.strictEqual(gradient.y0, 0);
    assert.strictEqual(gradient.x1, 100);
    assert.strictEqual(gradient.y1, 100);
});

test('CanvasGradient.addColorStop adds color stops correctly', () => {
    const gradient = new CanvasGradient(0, 0, 100, 100);
    gradient.addColorStop(0, 'black');
    gradient.addColorStop(1, 'white');
    gradient.addColorStop(0.5, 'red');
    assert.strictEqual(gradient.colorStops.length, 3, 'should have 3 color stops');
    assert.deepStrictEqual(gradient.colorStops[0], { offset: 0, color: 'black' });
    assert.deepStrictEqual(gradient.colorStops[1], { offset: 0.5, color: 'red' });
    assert.deepStrictEqual(gradient.colorStops[2], { offset: 1, color: 'white' });
});

test('Gradient fillStyle renders a gradient', () => {
    const ctx = new CanvasRenderingContext2D(2, 1);
    const gradient = ctx.createLinearGradient(0, 0, 1, 0);
    gradient.addColorStop(0, '#000000');
    gradient.addColorStop(1, '#ffffff');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 2, 1);

    const imageData = ctx.getImageData(0, 0, 2, 1);
    // First pixel should be close to black
    assert.ok(imageData.data[0] < 10, 'First pixel R channel should be near 0');
    assert.ok(imageData.data[1] < 10, 'First pixel G channel should be near 0');
    assert.ok(imageData.data[2] < 10, 'First pixel B channel should be near 0');
    // Last pixel should be close to white
    assert.ok(imageData.data[4] > 245, 'Second pixel R channel should be near 255');
    assert.ok(imageData.data[5] > 245, 'Second pixel G channel should be near 255');
    assert.ok(imageData.data[6] > 245, 'Second pixel B channel should be near 255');
});
