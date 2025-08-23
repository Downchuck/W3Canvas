import { test } from 'node:test';
import assert from 'node:assert';
import { sdefl_huff } from '../src/stb-image/zlib/index.js';

test.describe('Huffman Coding Correctness', () => {
    test('should generate correct codes for a simple case', () => {
        const freqs = new Uint32Array(288).fill(0);
        freqs[65] = 3; // 'A'
        freqs[66] = 2; // 'B'
        freqs[67] = 1; // 'C'

        const lens = new Uint8Array(288).fill(0);
        const codes = new Uint16Array(288).fill(0);

        sdefl_huff(lens, codes, freqs, 288, 15);

        const expected_lens = { 65: 1, 66: 2, 67: 2 };
        const expected_codes = { 65: 0, 66: 2, 67: 3 };

        for (let i = 0; i < 288; i++) {
            if (freqs[i] > 0) {
                assert.strictEqual(lens[i], expected_lens[i], `Incorrect length for symbol ${i}`);
                assert.strictEqual(codes[i], expected_codes[i], `Incorrect code for symbol ${i}`);
            }
        }
    });
});
