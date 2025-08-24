import { test } from 'node:test';
import assert from 'node:assert';
import { compositeImageData } from '../src/core/canvas/compositing-rgba32.js';

function assertPixel(actual, expected, message) {
    assert(Math.abs(actual[0] - expected[0]) <= 1, `${message} - red`);
    assert(Math.abs(actual[1] - expected[1]) <= 1, `${message} - green`);
    assert(Math.abs(actual[2] - expected[2]) <= 1, `${message} - blue`);
    assert(Math.abs(actual[3] - expected[3]) <= 1, `${message} - alpha`);
}

test('isolated source-over compositing', () => {
    const dest = {
        width: 1,
        height: 1,
        data: new Uint8ClampedArray([128, 0, 0, 128])
    };
    const src = {
        width: 1,
        height: 1,
        data: new Uint8ClampedArray([0, 0, 255, 255])
    };

    compositeImageData(dest, src, 'source-over');
    assertPixel(dest.data, new Uint8ClampedArray([64, 0, 128, 192]), 'source-over');
});

test('isolated source-in compositing', () => {
    const dest = {
        width: 1,
        height: 1,
        data: new Uint8ClampedArray([128, 0, 0, 128])
    };
    const src = {
        width: 1,
        height: 1,
        data: new Uint8ClampedArray([0, 0, 255, 255])
    };

    compositeImageData(dest, src, 'source-in');
    assertPixel(dest.data, new Uint8ClampedArray([0, 0, 128, 128]), 'source-in');
});

test('isolated source-out compositing', () => {
    const dest = {
        width: 1,
        height: 1,
        data: new Uint8ClampedArray([128, 0, 0, 128])
    };
    const src = {
        width: 1,
        height: 1,
        data: new Uint8ClampedArray([0, 0, 255, 255])
    };

    compositeImageData(dest, src, 'source-out');
    assertPixel(dest.data, new Uint8ClampedArray([0, 0, 127, 127]), 'source-out');
});

test('isolated source-atop compositing', () => {
    const dest = {
        width: 1,
        height: 1,
        data: new Uint8ClampedArray([128, 0, 0, 128])
    };
    const src = {
        width: 1,
        height: 1,
        data: new Uint8ClampedArray([0, 0, 255, 255])
    };

    compositeImageData(dest, src, 'source-atop');
    assertPixel(dest.data, new Uint8ClampedArray([64, 0, 64, 128]), 'source-atop');
});

test('isolated destination-over compositing', () => {
    const dest = {
        width: 1,
        height: 1,
        data: new Uint8ClampedArray([128, 0, 0, 128])
    };
    const src = {
        width: 1,
        height: 1,
        data: new Uint8ClampedArray([0, 0, 255, 255])
    };

    compositeImageData(dest, src, 'destination-over');
    assertPixel(dest.data, new Uint8ClampedArray([64, 0, 128, 192]), 'destination-over');
});

test('isolated destination-in compositing', () => {
    const dest = {
        width: 1,
        height: 1,
        data: new Uint8ClampedArray([128, 0, 0, 128])
    };
    const src = {
        width: 1,
        height: 1,
        data: new Uint8ClampedArray([0, 0, 255, 255])
    };

    compositeImageData(dest, src, 'destination-in');
    assertPixel(dest.data, new Uint8ClampedArray([128, 0, 0, 128]), 'destination-in');
});

test('isolated destination-out compositing', () => {
    const dest = {
        width: 1,
        height: 1,
        data: new Uint8ClampedArray([128, 0, 0, 128])
    };
    const src = {
        width: 1,
        height: 1,
        data: new Uint8ClampedArray([0, 0, 255, 255])
    };

    compositeImageData(dest, src, 'destination-out');
    assertPixel(dest.data, new Uint8ClampedArray([128, 0, 0, 0]), 'destination-out');
});

test('isolated destination-atop compositing', () => {
    const dest = {
        width: 1,
        height: 1,
        data: new Uint8ClampedArray([128, 0, 0, 128])
    };
    const src = {
        width: 1,
        height: 1,
        data: new Uint8ClampedArray([0, 0, 255, 255])
    };

    compositeImageData(dest, src, 'destination-atop');
    assertPixel(dest.data, new Uint8ClampedArray([64, 0, 128, 255]), 'destination-atop');
});

test('isolated lighter compositing', () => {
    const dest = {
        width: 1,
        height: 1,
        data: new Uint8ClampedArray([128, 0, 0, 128])
    };
    const src = {
        width: 1,
        height: 1,
        data: new Uint8ClampedArray([0, 0, 255, 255])
    };

    compositeImageData(dest, src, 'lighter');
    assertPixel(dest.data, new Uint8ClampedArray([128, 0, 255, 255]), 'lighter');
});

test('isolated copy compositing', () => {
    const dest = {
        width: 1,
        height: 1,
        data: new Uint8ClampedArray([128, 0, 0, 128])
    };
    const src = {
        width: 1,
        height: 1,
        data: new Uint8ClampedArray([0, 0, 255, 255])
    };

    compositeImageData(dest, src, 'copy');
    assertPixel(dest.data, new Uint8ClampedArray([0, 0, 255, 255]), 'copy');
});

test('isolated xor compositing', () => {
    const dest = {
        width: 1,
        height: 1,
        data: new Uint8ClampedArray([128, 0, 0, 128])
    };
    const src = {
        width: 1,
        height: 1,
        data: new Uint8ClampedArray([0, 0, 255, 255])
    };

    compositeImageData(dest, src, 'xor');
    assertPixel(dest.data, new Uint8ClampedArray([0, 0, 127, 127]), 'xor');
});

test('isolated multiply compositing', () => {
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

    compositeImageData(dest, src, 'multiply');
    assertPixel(dest.data, new Uint8ClampedArray([0, 64, 0, 255]), 'multiply');
});

test('isolated screen compositing', () => {
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

    compositeImageData(dest, src, 'screen');
    assertPixel(dest.data, new Uint8ClampedArray([255, 192, 255, 255]), 'screen');
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

test('isolated darken compositing', () => {
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

    compositeImageData(dest, src, 'darken');
    assertPixel(dest.data, new Uint8ClampedArray([0, 128, 0, 255]), 'darken');
});

test('isolated lighten compositing', () => {
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

    compositeImageData(dest, src, 'lighten');
    assertPixel(dest.data, new Uint8ClampedArray([255, 128, 255, 255]), 'lighten');
});

test('isolated color-dodge compositing', () => {
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

    compositeImageData(dest, src, 'color-dodge');
    assertPixel(dest.data, new Uint8ClampedArray([255, 255, 255, 255]), 'color-dodge');
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

test('isolated soft-light compositing', () => {
    const dest = {
        width: 1,
        height: 1,
        data: new Uint8ClampedArray([255, 0, 0, 255])
    };
    const src = {
        width: 1,
        height: 1,
        data: new Uint8ClampedArray([128, 128, 128, 255])
    };

    compositeImageData(dest, src, 'soft-light');
    assertPixel(dest.data, new Uint8ClampedArray([255, 0, 0, 255]), 'soft-light');
});

test('isolated difference compositing', () => {
    const dest = {
        width: 1,
        height: 1,
        data: new Uint8ClampedArray([255, 255, 255, 255])
    };
    const src = {
        width: 1,
        height: 1,
        data: new Uint8ClampedArray([128, 128, 128, 255])
    };

    compositeImageData(dest, src, 'difference');
    assertPixel(dest.data, new Uint8ClampedArray([127, 127, 127, 255]), 'difference');
});

test('isolated exclusion compositing', () => {
    const dest = {
        width: 1,
        height: 1,
        data: new Uint8ClampedArray([255, 255, 255, 255])
    };
    const src = {
        width: 1,
        height: 1,
        data: new Uint8ClampedArray([128, 128, 128, 255])
    };

    compositeImageData(dest, src, 'exclusion');
    assertPixel(dest.data, new Uint8ClampedArray([127, 127, 127, 255]), 'exclusion');
});
