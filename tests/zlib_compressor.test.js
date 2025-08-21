// File: tests/zlib_compressor.test.js
import { test } from 'node:test';
import assert from 'node:assert';
import { stbi_zlib_compress } from '../src/stb-image/zlib_write.js';
import { zlib_decode_malloc_guesssize_headerflag } from '../src/stb-image/zlib.js';

test('Zlib compressor should produce a valid deflate stream', () => {
    const original_data = new Uint8Array(256);
    for (let i = 0; i < 256; i++) original_data[i] = i;

    const out_len = { value: 0 };
    const compressed_data = stbi_zlib_compress(original_data, original_data.length, out_len, 8);

    assert(compressed_data, 'stbi_zlib_compress should return a result');
    assert(out_len.value > 0, 'Compressed data should not be empty');

    const decompressed_data = zlib_decode_malloc_guesssize_headerflag(compressed_data, original_data.length, true);

    assert.deepStrictEqual(decompressed_data, original_data, 'Decompressed data should match original');
    console.log('Zlib compressor test passed!');
});
