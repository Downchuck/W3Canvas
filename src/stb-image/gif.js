import { err } from './context.js';

export function gif_test(s) {
    s.rewind();
    if (s.get8()!=='G'.charCodeAt(0) || s.get8()!=='I'.charCodeAt(0) || s.get8()!=='F'.charCodeAt(0) || s.get8()!=='8') {
        s.rewind();
        return 0;
    }
    const sz = s.get8();
    if (sz !== '9' && sz !== '7') {
        s.rewind();
        return 0;
    }
    if (s.get8() !== 'a') {
        s.rewind();
        return 0;
    }
    s.rewind();
    return 1;
}

export function gif_load(s, req_comp) {
    // Simplified GIF loader, no animation support
    if (s.get8()!=='G' || s.get8()!=='I' || s.get8()!=='F' || s.get8()!=='8') return err("not GIF", "Corrupt GIF");
    const version = s.get8();
    if (version !== '7' && version !== '9') return err("not GIF", "Corrupt GIF");
    if (s.get8() !== 'a') return err("not GIF", "Corrupt GIF");

    s.img_x = s.get16le();
    s.img_y = s.get16le();
    const flags = s.get8();
    s.get8(); // bgindex
    s.get8(); // ratio

    const pal = new Uint8Array(256 * 4);
    if (flags & 0x80) {
        const psize = 2 << (flags & 7);
        for(let i=0; i<psize; ++i) {
            pal[i*4+2] = s.get8();
            pal[i*4+1] = s.get8();
            pal[i*4+0] = s.get8();
            pal[i*4+3] = 255;
        }
    }

    let transparent = -1;
    let tag;
    do {
        tag = s.get8();
        if (tag === 0x21) { // Extension
            const ext = s.get8();
            if (ext === 0xF9) { // Graphic Control
                const len = s.get8();
                if (len === 4) {
                    const eflags = s.get8();
                    s.get16le(); // delay
                    if (eflags & 1) transparent = s.get8();
                    else s.skip(1);
                } else {
                    s.skip(len);
                }
            }
            let len;
            while((len = s.get8()) !== 0) s.skip(len);
        }
    } while(tag !== 0x2C && tag !== 0x3B);

    if (tag === 0x3B) return null;

    s.skip(8);
    const lflags = s.get8();
    if (lflags & 0x80) return err("local color table not supported", "GIF with local color table not supported");

    const lzw_cs = s.get8();
    if (lzw_cs > 12) return null;
    const clear = 1 << lzw_cs;
    const eoi = clear + 1;
    let avail = clear + 2;
    let oldcode = -1;

    const codes = Array.from({length: 8192}, () => ({ prefix: -1, first: 0, suffix: 0 }));
    for (let i = 0; i < clear; ++i) {
        codes[i].first = i;
        codes[i].suffix = i;
    }

    let bits = 0, valid_bits = 0, block_len = 0;
    let codesize = lzw_cs + 1;
    let codemask = (1 << codesize) - 1;

    const out = new Uint8Array(s.img_x * s.img_y);
    let out_p = 0;

    const out_gif_code = (code) => {
        if (codes[code].prefix >= 0) out_gif_code(codes[code].prefix);
        if (out_p < out.length) out[out_p++] = codes[code].suffix;
    };

    while(true) {
        if (valid_bits < codesize) {
            if (block_len === 0) {
                block_len = s.get8();
                if (block_len === 0) break;
            }
            --block_len;
            bits |= s.get8() << valid_bits;
            valid_bits += 8;
        } else {
            let code = bits & codemask;
            bits >>= codesize;
            valid_bits -= codesize;

            if (code === clear) {
                codesize = lzw_cs + 1;
                codemask = (1 << codesize) - 1;
                avail = clear + 2;
                oldcode = -1;
            } else if (code === eoi) {
                break;
            } else if (code <= avail) {
                if (oldcode >= 0) {
                    const p = codes[avail++];
                    if (avail > 8192) return err("too many codes", "Corrupt GIF");
                    p.prefix = oldcode;
                    p.first = codes[oldcode].first;
                    p.suffix = (code === avail-1) ? p.first : codes[code].first;
                }
                out_gif_code(code);
                if ((avail & codemask) === 0 && avail <= 0x0FFF) {
                    codesize++;
                    codemask = (1 << codesize) - 1;
                }
                oldcode = code;
            } else {
                return err("illegal code in raster", "Corrupt GIF");
            }
        }
    }

    // Convert to output format
    const target = req_comp || 4;
    if (target < 1 || target > 4) return err("bad req_comp", "bad req_comp");

    const final_out = new Uint8Array(s.img_x * s.img_y * target);
    for(let i=0; i<s.img_x * s.img_y; ++i) {
        const p_idx = out[i];
        const p_out = i * target;
        if (p_idx === transparent) {
            for(let j=0; j<target; ++j) final_out[p_out + j] = 0;
        } else {
            const R = pal[p_idx*4+0];
            const G = pal[p_idx*4+1];
            const B = pal[p_idx*4+2];
            if (target === 1) {
                final_out[p_out] = (R*299 + G*587 + B*114) / 1000;
            } else {
                final_out[p_out] = R;
                final_out[p_out+1] = G;
                final_out[p_out+2] = B;
                if (target === 4) final_out[p_out+3] = 255;
            }
        }
    }

    return { data: final_out, w: s.img_x, h: s.img_y, n: target };
}

export function gif_info(s, x, y, comp) {
    s.rewind();
    if (!gif_test(s)) { s.rewind(); return 0; }
    s.get8(); s.get8(); s.get8(); s.get8(); s.get8(); s.get8();
    x.value = s.get16le();
    y.value = s.get16le();
    comp.value = 4;
    s.rewind();
    return 1;
}
