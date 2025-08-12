import { err } from './context.js';

export function bmp_test(s) {
    s.rewind();
    if (s.get8() !== 'B'.charCodeAt(0) || s.get8() !== 'M'.charCodeAt(0)) {
        s.rewind();
        return 0;
    }
    s.rewind();
    return 1;
}

function bmp_parse_header(s, info) {
    if (s.get8() !== 'B'.charCodeAt(0) || s.get8() !== 'M'.charCodeAt(0)) return null;
    s.get32le(); // filesize
    s.get16le(); // reserved
    s.get16le(); // reserved
    info.offset = s.get32le();
    info.hsz = s.get32le();

    if (info.hsz !== 12 && info.hsz !== 40 && info.hsz !== 56 && info.hsz !== 108 && info.hsz !== 124) return null;

    if (info.hsz === 12) {
        s.img_x = s.get16le();
        s.img_y = s.get16le();
    } else {
        s.img_x = s.get32le();
        s.img_y = s.get32le();
    }
    if (s.get16le() !== 1) return null;
    info.bpp = s.get16le();

    if (info.hsz !== 12) {
        const compress = s.get32le();
        if (compress === 1 || compress === 2) return err("BMP RLE", "BMP type not supported: RLE");
        // ... more header parsing for masks etc. ...
    }
    return 1;
}

export function bmp_load(s, req_comp) {
    const info = {};
    if (!bmp_parse_header(s, info)) return null;

    const flip_vertically = s.img_y > 0;
    s.img_y = Math.abs(s.img_y);

    s.img_n = info.bpp === 32 ? 4 : 3; // Default, will be updated for palettes
    const target = req_comp ? req_comp : s.img_n;

    const out = new Uint8Array(s.img_x * s.img_y * target);

    const psize = (info.hsz === 12) ? (info.offset - 26) / 3 : (info.offset - 14 - info.hsz) >> 2;

    if (info.bpp < 16) {
        s.img_n = 1;
        if (psize === 0 || psize > 256) return err("invalid BMP", "Invalid BMP palette size");
        const pal = new Uint8Array(256 * 4);
        for (let i=0; i<psize; ++i) {
            pal[i*4+2] = s.get8();
            pal[i*4+1] = s.get8();
            pal[i*4+0] = s.get8();
            if (info.hsz !== 12) s.get8();
            pal[i*4+3] = 255;
        }
        s.skip(info.offset - (14 + info.hsz) - psize * (info.hsz === 12 ? 3 : 4));

        const width = (info.bpp === 1) ? Math.ceil(s.img_x / 8) : (info.bpp === 4) ? Math.ceil(s.img_x / 2) : s.img_x;
        const pad = (-width) & 3;

        for(let j=0; j<s.img_y; ++j) {
            const row = flip_vertically ? s.img_y - 1 - j : j;
            let p_out = row * s.img_x * target;
            if (info.bpp === 8) {
                for(let i=0; i<s.img_x; ++i) {
                    const p_idx = s.get8();
                    out[p_out++] = pal[p_idx*4];
                    if (target > 1) out[p_out++] = pal[p_idx*4+1];
                    if (target > 2) out[p_out++] = pal[p_idx*4+2];
                    if (target > 3) out[p_out++] = 255;
                }
            } else {
                 return err("1/4-bit BMP not supported", "1/4-bit BMP not supported yet");
            }
            s.skip(pad);
        }
    } else if (info.bpp === 24) {
        s.skip(info.offset - (14 + info.hsz));
        const pad = (-s.img_x * 3) & 3;
        for (let j=0; j < s.img_y; ++j) {
            const row = flip_vertically ? s.img_y - 1 - j : j;
            let p_out = row * s.img_x * target;
            for (let i=0; i < s.img_x; ++i) {
                const B = s.get8();
                const G = s.get8();
                const R = s.get8();
                out[p_out++] = R;
                if (target > 1) out[p_out++] = G;
                if (target > 2) out[p_out++] = B;
                if (target > 3) out[p_out++] = 255;
            }
            s.skip(pad);
        }
    } else {
        return err("unsupported BMP bpp", "Only 8 and 24-bit BMPs are supported for now");
    }

    return { data: out, w: s.img_x, h: s.img_y, n: target };
}

export function bmp_info(s, x, y, comp) {
    const info = {};
    if (!bmp_parse_header(s, info)) return 0;
    x.value = s.img_x;
    y.value = s.img_y;
    comp.value = info.bpp === 32 ? 4 : 3;
    return 1;
}
