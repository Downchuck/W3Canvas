import { describe, it } from 'node:test';
import * as assert from 'node:assert';
import { stbi_zlib_compress, zlib_decode_malloc_guesssize_headerflag } from '../src/stb-image/zlib/index.js';

describe('Zlib Extended Tests', () => {
    it('should handle empty data', () => {
        const original_data = new Uint8Array(0);
        const out_len = { value: 0 };
        const compressed_data = stbi_zlib_compress(original_data, original_data.length, out_len, 8);
        assert.ok(compressed_data, "stbi_zlib_compress should return a result for empty data");
        assert.ok(out_len.value > 0, "out_len should be greater than 0 for empty data");

        const decompressed_data = zlib_decode_malloc_guesssize_headerflag(compressed_data, original_data.length, true);
        assert.deepStrictEqual(decompressed_data, original_data, "Decompressed empty data should match original");
    });

    it('should handle a large buffer', () => {
        const original_data = new Uint8Array(1024 * 1024); // 1MB
        for (let i = 0; i < original_data.length; i++) {
            original_data[i] = i % 256;
        }

        const out_len = { value: 0 };
        const compressed_data = stbi_zlib_compress(original_data, original_data.length, out_len, 8);
        assert.ok(compressed_data, "stbi_zlib_compress should return a result for a large buffer");
        assert.ok(out_len.value > 0, "out_len should be greater than 0 for a large buffer");

        const decompressed_data = zlib_decode_malloc_guesssize_headerflag(compressed_data, original_data.length, true);
        assert.deepStrictEqual(decompressed_data, original_data, "Decompressed large buffer should match original");
    });

    it('should handle data with repeating patterns', () => {
        const original_data = new Uint8Array(1024);
        for (let i = 0; i < 1024; i++) {
            original_data[i] = 42;
        }

        const out_len = { value: 0 };
        const compressed_data = stbi_zlib_compress(original_data, original_data.length, out_len, 8);
        assert.ok(compressed_data, "stbi_zlib_compress should return a result for repeating data");
        assert.ok(out_len.value > 0, "out_len should be greater than 0 for repeating data");
        assert.ok(out_len.value < original_data.length, "compressed data should be smaller than original for repeating data");

        const decompressed_data = zlib_decode_malloc_guesssize_headerflag(compressed_data, original_data.length, true);
        assert.deepStrictEqual(decompressed_data, original_data, "Decompressed repeating data should match original");
    });

    it('should handle data with repeating patterns', () => {
        const original_data = new Uint8Array(1024);
        for (let i = 0; i < 1024; i++) {
            original_data[i] = 42;
        }

        const out_len = { value: 0 };
        const compressed_data = stbi_zlib_compress(original_data, original_data.length, out_len, 8);
        assert.ok(compressed_data, "stbi_zlib_compress should return a result for repeating data");
        assert.ok(out_len.value > 0, "out_len should be greater than 0 for repeating data");
        assert.ok(out_len.value < original_data.length, "compressed data should be smaller than original for repeating data");

        const decompressed_data = zlib_decode_malloc_guesssize_headerflag(compressed_data, original_data.length, true);
        assert.deepStrictEqual(decompressed_data, original_data, "Decompressed repeating data should match original");
    });

    it('should compress and decompress with different quality levels', () => {
        const original_data = new Uint8Array(1024);
        for (let i = 0; i < 1024; i++) {
            original_data[i] = i % 256;
        }

        for (let quality = 1; quality <= 9; quality++) {
            const out_len = { value: 0 };
            const compressed_data = stbi_zlib_compress(original_data, original_data.length, out_len, quality);
            assert.ok(compressed_data, `stbi_zlib_compress should return a result for quality ${quality}`);
            assert.ok(out_len.value > 0, `out_len should be greater than 0 for quality ${quality}`);

            const decompressed_data = zlib_decode_malloc_guesssize_headerflag(compressed_data, original_data.length, true);
            assert.deepStrictEqual(decompressed_data, original_data, `Decompressed data should match original for quality ${quality}`);
        }
    });
});
