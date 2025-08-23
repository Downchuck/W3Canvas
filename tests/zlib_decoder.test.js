import { test } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import { zlib_decode_malloc_guesssize_headerflag } from '../src/stb-image/zlib/index.js';

function extract_idat_data(png_filepath) {
    const png_data = fs.readFileSync(png_filepath);
    let all_idat_data = Buffer.alloc(0);

    // Skip PNG signature
    let offset = 8;

    while (offset < png_data.length) {
        const length = png_data.readUInt32BE(offset);
        offset += 4;

        const type = png_data.toString('ascii', offset, offset + 4);
        offset += 4;

        if (type === 'IDAT') {
            const idat_chunk_data = png_data.slice(offset, offset + length);
            all_idat_data = Buffer.concat([all_idat_data, idat_chunk_data]);
        } else if (type === 'IEND') {
            break; // Stop after IEND
        }

        offset += length; // data
        offset += 4; // CRC
    }
    return all_idat_data;
}


test('Zlib decoder should decompress zlib stream from PNG IDAT chunk', () => {
    const idat_data = extract_idat_data('test/images/tp1n3p08.png');
    const expected_size = 1056; // 32x32 pixels (RGBA) + 32 filter bytes = 32*32*1 + 32 = 1056. Paletted image 1 byte per pixel.

    // The IDAT chunk data is a zlib stream, so we need to parse the header.
    const expanded = zlib_decode_malloc_guesssize_headerflag(idat_data, expected_size, true);

    assert(expanded, 'zlib_decode should return a result');
    assert.strictEqual(expanded.length, expected_size, `Decompressed size should be ${expected_size}, but was ${expanded.length}`);

    console.log('Zlib decoder test passed!');
});
