import { test } from 'node:test';
import assert from 'node:assert';
import { compositeImageData } from '../src/core/canvas/compositing-rgba32.js';

function assertPixel(actual, expected, message) {
    assert(Math.abs(actual[0] - expected[0]) <= 1, `${message} - red`);
    assert(Math.abs(actual[1] - expected[1]) <= 1, `${message} - green`);
    assert(Math.abs(actual[2] - expected[2]) <= 1, `${message} - blue`);
    assert(Math.abs(actual[3] - expected[3]) <= 1, `${message} - alpha`);
}

test('isolated source-atop compositing', () => {
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

    compositeImageData(dest, src, 'source-atop');
    assertPixel(dest.data, new Uint8ClampedArray([0, 0, 255, 255]), 'source-atop');
});

test('isolated destination-atop compositing', () => {
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
