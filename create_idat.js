import fs from 'fs';

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
fs.writeFileSync('test/images/tp1n3p08.idat', idat_data);
console.log('test/images/tp1n3p08.idat created.');
