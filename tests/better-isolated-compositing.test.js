import { test } from 'node:test';
import assert from 'node:assert';
import { compositeImageData } from '../src/core/canvas/compositing-rgba32.js';

function assertPixel(actual, expected, message) {
    assert.strictEqual(actual[0], expected[0], `${message} - red`);
    assert.strictEqual(actual[1], expected[1], `${message} - green`);
    assert.strictEqual(actual[2], expected[2], `${message} - blue`);
    assert.strictEqual(actual[3], expected[3], `${message} - alpha`);
}

test('better isolated source-atop compositing', () => {
    const dest = {
        width: 1,
        height: 1,
        data: new Uint8ClampedArray([100, 0, 0, 100])
    };
    const src = {
        width: 1,
        height: 1,
        data: new Uint8ClampedArray([0, 0, 100, 100])
    };

    compositeImageData(dest, src, 'source-atop');
    assertPixel(dest.data, new Uint8ClampedArray([39, 0, 61, 100]), 'source-atop');
});
