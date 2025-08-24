import { test } from 'node:test';
import assert from 'node:assert';
import { compositeImageData } from '../src/core/canvas/compositing-rgba32.js';

function assertPixel(actual, expected, message) {
    console.log('actual', actual);
    console.log('expected', expected);
    assert.strictEqual(actual[0], expected[0], `${message} - red`);
    assert.strictEqual(actual[1], expected[1], `${message} - green`);
    assert.strictEqual(actual[2], expected[2], `${message} - blue`);
    assert.strictEqual(actual[3], expected[3], `${message} - alpha`);
}

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

    console.log('before src', src.data);
    console.log('before dest', dest.data);
    compositeImageData(dest, src, 'overlay');
    console.log('after dest', dest.data);

    assertPixel(dest.data, new Uint8ClampedArray([0, 128, 0, 255]), 'overlay');
});
