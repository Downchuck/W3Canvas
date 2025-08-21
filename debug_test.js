import fs from 'fs';
import zlib from 'zlib';
import { zlib_decode_malloc_guesssize_headerflag } from './src/stb-image/zlib.js';

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

const idat_data = extract_idat_data('test/images/tp1n3p08.png');

try {
    // Expected output from Node's native zlib
    const expected_output = zlib.inflateSync(idat_data);
    console.log(`Node.js zlib decompressed to ${expected_output.length} bytes.`);

    // Actual output from our zlib.js
    const actual_output = zlib_decode_malloc_guesssize_headerflag(idat_data, expected_output.length, true);

    if (!actual_output) {
        console.log("zlib.js decoder returned null.");
    } else {
        console.log(`zlib.js decoder decompressed to ${actual_output.length} bytes.`);

        let first_mismatch = -1;
        const len = Math.min(expected_output.length, actual_output.length);
        for (let i = 0; i < len; i++) {
            if (expected_output[i] !== actual_output[i]) {
                first_mismatch = i;
                break;
            }
        }

        if (first_mismatch !== -1) {
            console.log(`Mismatch found at byte ${first_mismatch}`);
            console.log(`Expected: ${expected_output[first_mismatch]}, Actual: ${actual_output[first_mismatch]}`);
            console.log("Expected (10 bytes around mismatch):", Buffer.from(expected_output.buffer, first_mismatch - 5, 10).toString('hex'));
            console.log("Actual   (10 bytes around mismatch):", Buffer.from(actual_output.buffer, first_mismatch - 5, 10).toString('hex'));
        } else if (expected_output.length !== actual_output.length) {
            console.log("Outputs match up to the length of the shorter buffer, but lengths are different.");
            console.log(`Expected length: ${expected_output.length}, Actual length: ${actual_output.length}`);
        } else {
            console.log("Success! Outputs match perfectly.");
        }
    }

} catch (e) {
    console.error("An error occurred:", e);
}
