import { test } from 'node:test';
import assert from 'node:assert';
import zlib from 'node:zlib';
import { zlib_decode_malloc_guesssize_headerflag, zlib_decode_buffer, stbi_zlib_compress, sdefl_bound } from '../src/stb-image/zlib.js';

// --- Test Data Generation ---
const allZeros = Buffer.alloc(256, 0);
const repeatingPattern = Buffer.from('abababababababab'.repeat(16));
const randomBytes = Buffer.alloc(256);
for (let i = 0; i < randomBytes.length; i++) {
    randomBytes[i] = Math.floor(Math.random() * 256);
}
const smallText = Buffer.from('Hello, this is a test of the zlib compression algorithm.');
const largeText = Buffer.from(smallText.toString().repeat(1000));

const testVectors = [
    { name: 'all zeros', data: allZeros },
    { name: 'repeating pattern', data: repeatingPattern },
    { name: 'random bytes', data: randomBytes },
    { name: 'small text', data: smallText },
    { name: 'large text', data: largeText },
];

// --- Golden Compressed Vectors ---
const goldenCompressed = testVectors.map(vector => {
    return {
        name: vector.name,
        original: vector.data,
        compressed: zlib.deflateSync(vector.data),
    };
});

// --- Decompression Tests ---
test.describe('Zlib Decompression Correctness', () => {
    goldenCompressed.forEach(vector => {
        test(`should correctly decompress "${vector.name}"`, () => {
            const decompressed = zlib_decode_malloc_guesssize_headerflag(vector.compressed, vector.original.length, true);
            assert(decompressed, `Decompression of "${vector.name}" failed (returned null)`);
            assert.deepStrictEqual(Buffer.from(decompressed), vector.original, `Decompressed data for "${vector.name}" does not match original`);
        });
    });
});

test.describe('Zlib In-Place Decompression', () => {
    goldenCompressed.forEach(vector => {
        test(`should correctly decompress "${vector.name}" into a pre-allocated buffer`, () => {
            const outputBuffer = new Uint8Array(vector.original.length);
            const bytesWritten = zlib_decode_buffer(vector.compressed, outputBuffer);
            assert.strictEqual(bytesWritten, vector.original.length, `Bytes written for "${vector.name}" should be ${vector.original.length}, but was ${bytesWritten}`);
            assert.deepStrictEqual(Buffer.from(outputBuffer), vector.original, `Decompressed data for "${vector.name}" does not match original`);
        });
    });
});

// --- Compression Tests ---
test.describe('Zlib Compression Correctness', () => {
    goldenCompressed.forEach(vector => {
        test(`should correctly compress "${vector.name}"`, () => {
            const compressed = stbi_zlib_compress(vector.original);
            assert(compressed, `Compression of "${vector.name}" failed (returned null)`);
            const decompressed = zlib.inflateSync(Buffer.from(compressed));
            assert.deepStrictEqual(decompressed, vector.original, `Decompressed output of compressed data for "${vector.name}" does not match original`);
        });
    });
});

test.describe('sdefl_bound', () => {
    test('should return a value greater than or equal to the compressed size', () => {
        goldenCompressed.forEach(vector => {
            const bound = sdefl_bound(vector.original.length);
            const compressed = stbi_zlib_compress(vector.original);
            assert(bound >= compressed.length, `Bound for "${vector.name}" should be >= ${compressed.length}, but was ${bound}`);
        });
    });
});

test.describe('Zlib In-Place Compression', () => {
    goldenCompressed.forEach(vector => {
        test(`should correctly compress "${vector.name}" into a pre-allocated buffer`, () => {
            const bound = sdefl_bound(vector.original.length);
            const outputBuffer = new Uint8Array(bound);
            const bytesWritten = stbi_zlib_compress_buffer(outputBuffer, vector.original);
            const compressed = outputBuffer.slice(0, bytesWritten);
            const decompressed = zlib.inflateSync(Buffer.from(compressed));
            assert.deepStrictEqual(decompressed, vector.original, `Decompressed output of compressed data for "${vector.name}" does not match original`);
        });
    });
});
