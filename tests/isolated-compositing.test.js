import { test } from 'node:test';
import assert from 'node:assert';
import { compositeImageData } from '../src/core/canvas/compositing-rgba32.js';

function assertPixel(actual, expected, message) {
    assert.strictEqual(actual[0], expected[0], `${message} - red`);
    assert.strictEqual(actual[1], expected[1], `${message} - green`);
    assert.strictEqual(actual[2], expected[2], `${message} - blue`);
    assert.strictEqual(actual[3], expected[3], `${message} - alpha`);
}

test('isolated source-atop compositing', () => {
    const dest = {
        width: 1,
        height: 1,
        data: new Uint8ClampedArray([255, 0, 0, 128])
    };
    const src = {
        width: 1,
        height: 1,
        data: new Uint8ClampedArray([0, 0, 255, 255])
    };

    compositeImageData(dest, src, 'source-atop');
    assertPixel(dest.data, new Uint8ClampedArray([0, 0, 255, 128]), 'source-atop');
});

test('isolated destination-atop compositing', () => {
    const dest = {
        width: 1,
        height: 1,
        data: new Uint8ClampedArray([255, 0, 0, 128])
    };
    const src = {
        width: 1,
        height: 1,
        data: new Uint8ClampedArray([0, 0, 255, 255])
    };

    compositeImageData(dest, src, 'destination-atop');
    assertPixel(dest.data, new Uint8ClampedArray([255, 0, 0, 255]), 'destination-atop');
});

test('isolated overlay compositing', () => {
    const dest = {
        width: 1,
        height: 1,
        data: new Uint8ClampedArray([255, 128, 0, 255])
    };
    const src = {
        width: 1,
        height: 1,
        data: new Uint8ClampedArray([0, 128, 255, 255])
    };

    compositeImageData(dest, src, 'overlay');
    assertPixel(dest.data, new Uint8ClampedArray([0, 128, 0, 255]), 'overlay');
});

test('isolated color-burn compositing', () => {
    const dest = {
        width: 1,
        height: 1,
        data: new Uint8ClampedArray([128, 128, 128, 255])
    };
    const src = {
        width: 1,
        height: 1,
        data: new Uint8ClampedArray([128, 128, 128, 255])
    };

    compositeImageData(dest, src, 'color-burn');
    assertPixel(dest.data, new Uint8ClampedArray([0, 0, 0, 255]), 'color-burn');
});

test('isolated hard-light compositing', () => {
    const dest = {
        width: 1,
        height: 1,
        data: new Uint8ClampedArray([255, 0, 0, 255])
    };
    const src = {
        width: 1,
        height: 1,
        data: new Uint8ClampedArray([0, 0, 255, 255])
    };

    compositeImageData(dest, src, 'hard-light');
    assertPixel(dest.data, new Uint8ClampedArray([0, 0, 0, 255]), 'hard-light');
});
