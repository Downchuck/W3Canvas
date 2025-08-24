import { test } from 'node:test';
import assert from 'node:assert';
import { compositeImageData } from '../src/core/canvas/compositing-rgba32.js';

function assertPixel(actual, expected, message) {
    const tolerance = 5;
    assert(Math.abs(actual[0] - expected[0]) <= tolerance, `${message} - red`);
    assert(Math.abs(actual[1] - expected[1]) <= tolerance, `${message} - green`);
    assert(Math.abs(actual[2] - expected[2]) <= tolerance, `${message} - blue`);
    assert(Math.abs(actual[3] - expected[3]) <= tolerance, `${message} - alpha`);
}

test('isolated globalAlpha with source-atop', () => {
    // This simulates the state for the failing test in globalalpha.test.js

    // dest is a single pixel of semi-transparent red
    const dest = {
        width: 1,
        height: 1,
        data: new Uint8ClampedArray([255, 0, 0, 128])
    };

    // src is a single pixel of blue, with globalAlpha=0.5 applied to its alpha channel
    const src = {
        width: 1,
        height: 1,
        data: new Uint8ClampedArray([0, 0, 255, 128]) // 255 * 0.5 = 127.5, rounds to 128
    };

    compositeImageData(dest, src, 'source-atop');

    // Expected result based on my trace of the correct formula:
    // Ao = dA = 0.5 -> 128
    // R = sR*sA + dR*(1-sA) = 0*0.5 + 255*(1-0.5) = 127.5 -> 128
    // B = sB*sA + dB*(1-sA) = 255*0.5 + 0*(1-0.5) = 127.5 -> 128
    const expected = new Uint8ClampedArray([128, 0, 128, 128]);

    assertPixel(dest.data, expected, 'isolated source-atop with globalAlpha');
});
