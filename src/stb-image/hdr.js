import { err } from './context.js';

export function hdr_test(s) {
    s.rewind();
    const sig = "#?RADIANCE\n";
    for(let i=0; i<sig.length; ++i) {
        if (s.get8() !== sig.charCodeAt(i)) {
            s.rewind();
            return 0;
        }
    }
    s.rewind();
    return 1;
}

function hdr_get_token(s) {
    let buf = '';
    let c = '';
    while(!s.eof() && (c = String.fromCharCode(s.get8())) !== '\n') {
        buf += c;
    }
    return buf;
}

export function hdr_load(s, req_comp) {
    if (!hdr_test(s)) return err("not HDR", "Corrupt HDR");
    let valid = false;
    while(true) {
        const token = hdr_get_token(s);
        if (token.length === 0) break;
        if (token === "FORMAT=32-bit_rle_rgbe") valid = true;
    }
    if (!valid) return err("unsupported format", "Unsupported HDR format");

    const dim_token = hdr_get_token(s);
    const parts = dim_token.split(' ');
    s.img_y = parseInt(parts[1]);
    s.img_x = parseInt(parts[3]);

    // ... RLE decoding and float conversion ...
    return err("HDR not fully implemented", "HDR decoding not fully implemented");
}

export function hdr_info(s, x, y, comp) {
    s.rewind();
    if (!hdr_test(s)) { s.rewind(); return 0; }

    let valid = false;
    while(true) {
        const token = hdr_get_token(s);
        if (token.length === 0) break;
        if (token === "FORMAT=32-bit_rle_rgbe") valid = true;
    }
    if (!valid) { s.rewind(); return 0; }

    const dim_token = hdr_get_token(s);
    const parts = dim_token.split(' ');
    if (parts.length !== 4 || parts[0] !== '-Y' || parts[2] !== '+X') { s.rewind(); return 0; }

    y.value = parseInt(parts[1]);
    x.value = parseInt(parts[3]);
    comp.value = 3;
    s.rewind();
    return 1;
}
