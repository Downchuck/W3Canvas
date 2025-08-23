import { describe, it } from 'node:test';
import * as assert from 'node:assert';
import * as fs from 'node:fs';
import { png_load } from '../src/stb-image/png.js';
import { stbi_write_png_to_mem } from '../src/stb-image/png_write.js';
import { Context } from '../src/stb-image/context.js';

function test_png_cycle(image_path) {
    it(`should read and write ${image_path} correctly`, () => {
        const original_data = fs.readFileSync(image_path);
        const s_orig = new Context(original_data);
        const original_png = png_load(s_orig);
        assert.ok(original_png, "png_load should return a result for the original image");

        const out_len = { value: 0 };
        const written_data = stbi_write_png_to_mem(original_png.data, 0, original_png.w, original_png.h, original_png.n, out_len);
        assert.ok(written_data, "stbi_write_png_to_mem should return a result");
        assert.ok(out_len.value > 0, "out_len should be greater than 0");

        const s_written = new Context(written_data);
        const redecoded_png = png_load(s_written);
        assert.ok(redecoded_png, "png_load should return a result for the re-encoded image");

        assert.strictEqual(original_png.w, redecoded_png.w, "widths should be equal");
        assert.strictEqual(original_png.h, redecoded_png.h, "heights should be equal");
        assert.strictEqual(original_png.n, redecoded_png.n, "color components should be equal");
        assert.deepStrictEqual(original_png.data, redecoded_png.data, "pixel data should be equal");
    });
}

describe('PNG Suite Conformance', () => {
    const pngsuite_dir = 'data/pngsuite/';
    test_png_cycle(pngsuite_dir + 'basn0g01.png');
    test_png_cycle(pngsuite_dir + 'basn2c08.png');
    test_png_cycle(pngsuite_dir + 'basn3p01.png');
    test_png_cycle(pngsuite_dir + 'basn4a08.png');
    test_png_cycle(pngsuite_dir + 'basn6a08.png');
    test_png_cycle(pngsuite_dir + 'basi0g01.png');
    test_png_cycle(pngsuite_dir + 'basi2c08.png');
    test_png_cycle(pngsuite_dir + 'basi3p01.png');
    test_png_cycle(pngsuite_dir + 'basi4a08.png');
    test_png_cycle(pngsuite_dir + 'basi6a08.png');
});
