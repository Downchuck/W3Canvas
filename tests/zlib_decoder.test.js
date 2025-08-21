import { test } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import { zlib_decode_malloc_guesssize_headerflag } from '../src/stb-image/zlib.js';

test('Zlib decoder should decompress raw deflate stream', () => {
    const idat_data = fs.readFileSync('test/images/tp1n3p08.idat');
    const expected_size = 1056; // 32x32 pixels + 32 filter bytes

    const expanded = zlib_decode_malloc_guesssize_headerflag(idat_data, expected_size, false);

    assert(expanded, 'zlib_decode should return a result');
    assert.strictEqual(expanded.length, expected_size, `Decompressed size should be ${expected_size}`);

    console.log('Zlib decoder test passed!');
});
