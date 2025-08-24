import { test } from 'node:test';
import assert from 'node:assert';
import { stbi_zlib_compress } from '../src/stb-image/zlib/index.js';
import { inflateSync } from 'zlib';

test.describe('Minimal Failing Tests', () => {
    test('should correctly compress a small block of zeros', () => {
        const input = Buffer.from([0, 0, 0, 0, 0]);
        const compressed = stbi_zlib_compress(input);
        const decompressed = inflateSync(Buffer.from(compressed));
        assert.deepStrictEqual(decompressed, input, 'Decompressed data should match original');
    });
});
