import { err } from './context.js';
import { zlib_decode_buffer, zbuild_huffman } from './zlib/index.js';

export function png_test(s) {
    s.rewind();
    const sig = [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A];
    for (let i = 0; i < sig.length; i++) {
        if (s.get8() !== sig[i]) {
            s.rewind();
            return 0;
        }
    }
    s.rewind();
    return 1;
}

const PNG_TYPE = (a, b, c, d) => (a.charCodeAt(0) << 24) | (b.charCodeAt(0) << 16) | (c.charCodeAt(0) << 8) | d.charCodeAt(0);

const F_NONE = 0;
const F_SUB = 1;
const F_UP = 2;
const F_AVG = 3;
const F_PAETH = 4;
const F_AVG_FIRST = 5; // synthetic filter type

const DEPTH_SCALE_TABLE = [0, 0xff, 0x55, 0, 0x11, 0,0,0, 0x01];

function paeth(a, b, c) {
   const p = a + b - c;
   const pa = Math.abs(p - a);
   const pb = Math.abs(p - b);
   const pc = Math.abs(p - c);
   if (pa <= pb && pa <= pc) return a;
   if (pb <= pc) return b;
   return c;
}

function create_png_image(s, image_data, image_data_len, out_n, depth, color, interlace) {
    if (!interlace) {
        return create_png_image_raw(s, image_data, image_data_len, out_n, s.img_x, s.img_y, depth, color);
    }

    // De-interlacing
    const bytes = (depth === 16 ? 2 : 1);
    const out_bytes = out_n * bytes;
    const final_out = new Uint8Array(s.img_x * s.img_y * out_bytes);

    const xorig = [ 0,4,0,2,0,1,0 ];
    const yorig = [ 0,0,4,0,2,0,1 ];
    const xspc  = [ 8,8,4,4,2,2,1 ];
    const yspc  = [ 8,8,8,4,4,2,2 ];

    let data_p = 0;

    for (let p = 0; p < 7; ++p) {
        const x = Math.floor((s.img_x - xorig[p] + xspc[p] - 1) / xspc[p]);
        const y = Math.floor((s.img_y - yorig[p] + yspc[p] - 1) / yspc[p]);

        if (x && y) {
            const img_width_bytes = Math.floor(((s.img_n * x * depth) + 7) / 8);
            const img_len = (img_width_bytes + 1) * y;

            const sub_image = create_png_image_raw(s, image_data.subarray(data_p), image_data_len - data_p, out_n, x, y, depth, color);
            if (!sub_image) return null;

            for (let j = 0; j < y; ++j) {
                for (let i = 0; i < x; ++i) {
                    const out_y = j * yspc[p] + yorig[p];
                    const out_x = i * xspc[p] + xorig[p];
                    const src = sub_image.subarray((j * x + i) * out_bytes);
                    const dest = final_out.subarray(out_y * s.img_x * out_bytes + out_x * out_bytes);
                    dest.set(src.subarray(0, out_bytes));
                }
            }
            data_p += img_len;
        }
    }
    return final_out;
}

function create_png_image_raw(s, raw, raw_len, out_n, x, y, depth, color) {
    const bytes = (depth === 16 ? 2 : 1);
    const stride = x * out_n * bytes;
    const img_width_bytes = Math.floor(((s.img_n * x * depth) + 7) / 8);
    const img_len = (img_width_bytes + 1) * y;

    if (raw_len < img_len) return err("not enough pixels", "Corrupt PNG");

    const out = new Uint8Array(x * y * out_n * bytes);
    let prior = new Uint8Array(img_width_bytes);
    let raw_p = 0;

    for (let j = 0; j < y; ++j) {
        const cur = new Uint8Array(img_width_bytes);
        const dest = out.subarray(stride * j);
        const filter = raw[raw_p++];

        if (filter > 4) return err("invalid filter", "Corrupt PNG");

        const nk = (depth < 8) ? 1 : s.img_n * bytes;
        const width = (depth < 8) ? img_width_bytes : x * nk;

        for (let k = 0; k < width; ++k) {
            const B = (depth < 8) ? 1 : nk;
            const C = (k >= B) ? cur[k-B] : 0;
            const A = (j > 0) ? prior[k] : 0;
            const P = (j > 0 && k >= B) ? prior[k-B] : 0;

            let val;
            switch(filter) {
                case F_NONE: val = raw[raw_p + k]; break;
                case F_SUB: val = raw[raw_p + k] + C; break;
                case F_UP: val = raw[raw_p + k] + A; break;
                case F_AVG: val = raw[raw_p + k] + ((A + C) >> 1); break;
                case F_PAETH: val = raw[raw_p + k] + paeth(C, A, P); break;
                default: return err("invalid filter", "Corrupt PNG");
            }
            cur[k] = val & 0xff;
        }
        raw_p += width;

        if (depth < 8) {
            const scale = (color === 0) ? DEPTH_SCALE_TABLE[depth] : 1;
            const nsmp = x * s.img_n;
            let out_p = 0;
            let in_p = 0;
            if (depth === 1) {
                let inb = 0;
                for (let i = 0; i < nsmp; ++i) {
                    if ((i & 7) === 0) inb = cur[in_p++];
                    dest[out_p++] = scale * ((inb >> 7) & 1);
                    inb <<= 1;
                }
            } else if (depth === 2) {
                let inb = 0;
                for (let i = 0; i < nsmp; ++i) {
                    if ((i & 3) === 0) inb = cur[in_p++];
                    dest[out_p++] = scale * ((inb >> 6) & 3);
                    inb <<= 2;
                }
            } else if (depth === 4) {
                let inb = 0;
                for (let i = 0; i < nsmp; ++i) {
                    if ((i & 1) === 0) inb = cur[in_p++];
                    dest[out_p++] = scale * ((inb >> 4) & 15);
                    inb <<= 4;
                }
            }
        } else if (depth === 8) {
            for (let k = 0; k < x * s.img_n; ++k) dest[k] = cur[k];
        } else if (depth === 16) {
            for (let k = 0; k < x * s.img_n; ++k) {
                dest[k*2] = cur[k*2];
                dest[k*2+1] = cur[k*2+1];
            }
        }

        if (out_n !== s.img_n) {
            // ... alpha expansion logic ...
        }

        prior = cur;
    }
    return out;
}


export function png_load(s, req_comp) {
    let idata = new Uint8Array(0);
    let palette = new Uint8Array(1024);
    let pal_len = 0;
    let has_trans = 0;
    let tc = new Uint8Array(3);
    let pal_img_n = 0;
    let first = true;

    let depth = 0, color = 0, interlace = 0;

    while (true) {
        const length = s.get32be();
        const type = s.get32be();

        switch (type) {
            case PNG_TYPE('I','H','D','R'): {
                if (!first) return err("multiple IHDR", "Corrupt PNG");
                first = false;
                if (length !== 13) return err("bad IHDR len", "Corrupt PNG");
                s.img_x = s.get32be();
                s.img_y = s.get32be();
                depth = s.get8();
                if (depth !== 1 && depth !== 2 && depth !== 4 && depth !== 8 && depth !== 16) return err("1/2/4/8/16-bit only", "PNG not supported");
                color = s.get8();
                if (color > 6) return err("bad ctype", "Corrupt PNG");
                if (color === 3) pal_img_n = 3; else if (color & 1) return err("bad ctype", "Corrupt PNG");
                s.get8(); // compression
                s.get8(); // filter
                interlace = s.get8();
                if (!s.img_x || !s.img_y) return err("0-pixel image", "Corrupt PNG");
                if (!pal_img_n) {
                    s.img_n = (color & 2 ? 3 : 1) + (color & 4 ? 1 : 0);
                } else {
                    s.img_n = 1;
                }
                break;
            }
            case PNG_TYPE('P','L','T','E'): {
                if (first) return err("first not IHDR", "Corrupt PNG");
                pal_len = Math.floor(length / 3);
                if (pal_len * 3 !== length || pal_len > 256) return err("invalid PLTE", "Corrupt PNG");
                for (let i = 0; i < pal_len; ++i) {
                    palette[i * 4 + 0] = s.get8();
                    palette[i * 4 + 1] = s.get8();
                    palette[i * 4 + 2] = s.get8();
                    palette[i * 4 + 3] = 255;
                }
                break;
            }
            case PNG_TYPE('t','R','N','S'): {
                if (first) return err("first not IHDR", "Corrupt PNG");
                if (pal_img_n) {
                    if (pal_len === 0) return err("tRNS before PLTE", "Corrupt PNG");
                    if (length > pal_len) return err("bad tRNS len", "Corrupt PNG");
                    pal_img_n = 4;
                    for (let i = 0; i < length; ++i) palette[i * 4 + 3] = s.get8();
                } else {
                    if (!(s.img_n & 1)) return err("tRNS with alpha", "Corrupt PNG");
                    if (length !== s.img_n * 2) return err("bad tRNS len", "Corrupt PNG");
                    has_trans = 1;
                    // ...
                }
                break;
            }
            case PNG_TYPE('I','D','A','T'): {
                if (first) return err("first not IHDR", "Corrupt PNG");
                if (pal_img_n && !pal_len) return err("no PLTE", "Corrupt PNG");
                const new_idata = new Uint8Array(idata.length + length);
                new_idata.set(idata);
                const chunk = new Uint8Array(length);
                s.getn(chunk, length);
                new_idata.set(chunk, idata.length);
                idata = new_idata;
                break;
            }
            case PNG_TYPE('I','E','N','D'): {
                if (first) return err("first not IHDR", "Corrupt PNG");
                if (idata.length === 0) return err("no IDAT", "Corrupt PNG");

                const bpl = Math.floor((s.img_x * depth + 7) / 8);
                const raw_len = bpl * s.img_y * s.img_n + s.img_y;
                const expanded = new Uint8Array(raw_len);
                if (zlib_decode_buffer(idata, expanded) < 0) return null;

                s.img_out_n = s.img_n;
                if ((req_comp === s.img_n + 1 && req_comp !== 3 && !pal_img_n) || has_trans) {
                    s.img_out_n = s.img_n + 1;
                }

                let out_data = create_png_image(s, expanded, expanded.length, s.img_out_n, depth, color, interlace);
                if (!out_data) return null;

                // ... palette expansion, transparency, etc. ...
                s.skip(4); // CRC
                return { data: out_data, w: s.img_x, h: s.img_y, n: s.img_n };
            }
            default:
                s.skip(length);
                break;
        }
        s.skip(4); // CRC
    }
}

export function png_info(s, x, y, comp) {
    // A simplified version of png_load to just get header info
    while(true) {
        const length = s.get32be();
        const type = s.get32be();
        if (type === PNG_TYPE('I','H','D','R')) {
            if (length !== 13) return err("bad IHDR len", "Corrupt PNG");
            x.value = s.get32be();
            y.value = s.get32be();
            const depth = s.get8();
            const color = s.get8();
            if (color === 3) { // paletted
                comp.value = 3; // assume 3 unless tRNS is found
            } else {
                comp.value = (color & 2 ? 3 : 1) + (color & 4 ? 1 : 0);
            }

            // to be fully correct, we should scan for tRNS
            s.rewind();
            return 1;
        }
        s.skip(length);
        s.skip(4); // CRC
        if (s.eof()) return 0;
    }
}
