import { describe, it } from 'node:test';
import * as assert from 'node:assert';
import { png_load } from '../src/stb-image/png.js';
import { stbi_write_png_to_mem } from '../src/stb-image/png_write.js';
import { Context } from '../src/stb-image/context.js';

describe('PNG Conformance', () => {
    it(`should write and read a simple image correctly`, () => {
        const width = 1;
        const height = 1;
        const n = 4; // RGBA
        const pixels = new Uint8Array([255, 0, 0, 255]); // A single red pixel

        // 1. Encode the image data to PNG
        const out_len = { value: 0 };
        const written_data = stbi_write_png_to_mem(pixels, 0, width, height, n, out_len);
        assert.ok(written_data, "stbi_write_png_to_mem should return a result");
        assert.ok(out_len.value > 0, "out_len should be greater than 0");

        // 2. Decode the re-encoded PNG
        const s = new Context(written_data);
        const redecoded = png_load(s);
        assert.ok(redecoded, "redecoded png_load should return a result");

        // 3. Compare the pixel data
        assert.strictEqual(width, redecoded.w, "widths should be equal");
        assert.strictEqual(height, redecoded.h, "heights should be equal");
        assert.strictEqual(n, redecoded.n, "color components should be equal");
        assert.deepStrictEqual(pixels, redecoded.data, "pixel data should be equal");
    });
});
