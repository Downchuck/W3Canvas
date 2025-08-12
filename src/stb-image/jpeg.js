import { err } from './context.js';

const MARKER_NONE = 0xFF;
const MARKER_SOI = 0xD8;
const MARKER_SOF0 = 0xC0;
const MARKER_SOF1 = 0xC1;
const MARKER_SOF2 = 0xC2;
const MARKER_SOS = 0xDA;
const MARKER_DHT = 0xC4;
const MARKER_DQT = 0xDB;
const MARKER_DRI = 0xDD;
const MARKER_APP0 = 0xE0;
const MARKER_EOI = 0xD9;

const DEZIGZAG = [
 0, 1, 8, 16, 9, 2, 3, 10, 17, 24, 32, 25, 18, 11, 4, 5, 12, 19, 26, 33, 40, 48, 41, 34, 27, 20, 13, 6, 7, 14, 21, 28, 35, 42, 49, 56, 57, 50, 43, 36, 29, 22, 15, 23, 30, 37, 44, 51, 58, 59, 52, 45, 38, 31, 39, 46, 53, 60, 61, 54, 47, 55, 62, 63,
];

export function jpeg_test(s) {
    s.rewind();
    if (s.get8() !== 0xFF || s.get8() !== MARKER_SOI) {
        s.rewind();
        return 0;
    }
    s.rewind();
    return 1;
}

class JpegHuffman {
    constructor() {
        this.fast = new Uint8Array(1 << 9);
        this.code = new Uint16Array(256);
        this.values = new Uint8Array(256);
        this.size = new Uint8Array(257);
        this.maxcode = new Uint32Array(18);
        this.delta = new Int32Array(17);
    }
}

class Jpeg {
    constructor(s) {
        this.s = s;
        this.huff_dc = Array.from({length: 4}, () => new JpegHuffman());
        this.huff_ac = Array.from({length: 4}, () => new JpegHuffman());
        this.dequant = Array.from({length: 4}, () => new Uint16Array(64));
        this.fast_ac = Array.from({length: 4}, () => new Int16Array(1 << 9));

        this.img_comp = Array.from({length: 4}, () => ({
            id: 0, h: 0, v: 0, tq: 0, hd: 0, ha: 0, dc_pred: 0,
            x: 0, y: 0, w2: 0, h2: 0, data: null, raw_data: null,
            linebuf: null, coeff: null, coeff_w: 0, coeff_h: 0,
        }));

        this.code_buffer = 0;
        this.code_bits = 0;
        this.marker = MARKER_NONE;
        this.nomore = 0;

        this.progressive = 0;
        this.order = new Int32Array(4);
        this.restart_interval = 0;
        this.todo = 0;

        this.img_h_max = 0;
        this.img_v_max = 0;
        this.img_mcu_w = 0;
        this.img_mcu_h = 0;
        this.img_mcu_x = 0;
        this.img_mcu_y = 0;
    }

    grow_buffer_unsafe() {
        do {
            let b = this.nomore ? 0 : this.s.get8();
            if (b === 0xFF) {
                const c = this.s.get8();
                if (c !== 0) {
                    this.marker = c;
                    this.nomore = 1;
                    return;
                }
            }
            this.code_buffer |= b << (24 - this.code_bits);
            this.code_bits += 8;
        } while (this.code_bits <= 24);
    }

    huff_decode(h) {
        if (this.code_bits < 16) this.grow_buffer_unsafe();
        const c = (this.code_buffer >>> (32 - 9)) & ((1 << 9) - 1);
        const k = h.fast[c];
        if (k < 255) {
            const s = h.size[k];
            if (s > this.code_bits) return -1;
            this.code_buffer <<= s;
            this.code_bits -= s;
            return h.values[k];
        }

        const temp = this.code_buffer >>> 16;
        let s;
        for (s = 10; ; ++s) {
            if (temp < h.maxcode[s]) break;
        }
        if (s === 17) {
            this.code_bits -= 16;
            return -1;
        }
        if (s > this.code_bits) return -1;
        const code = ((this.code_buffer >>> (32 - s)) & BMASK[s]) + h.delta[s];
        if (code >= 256) return -1;
        this.code_bits -= s;
        this.code_buffer <<= s;
        return h.values[code];
    }

    extend_receive(n) {
        if (this.code_bits < n) this.grow_buffer_unsafe();
        if (this.code_bits < n) return 0;
        const sgn = this.code_buffer >> 31;
        const k = (this.code_buffer << n) | (this.code_buffer >>> (32 - n));
        this.code_buffer = k & ~BMASK[n];
        const val = k & BMASK[n];
        this.code_bits -= n;
        return val + (JBIAS[n] & (sgn - 1));
    }

    decode_block(data, hdc, hac, fac, comp_idx, dequant) {
        if (this.code_bits < 16) this.grow_buffer_unsafe();
        let t = this.huff_decode(hdc);
        if (t < 0 || t > 15) return err("bad huffman code", "Corrupt JPEG");
        data.fill(0);
        const diff = t ? this.extend_receive(t) : 0;
        const dc = this.img_comp[comp_idx].dc_pred + diff;
        this.img_comp[comp_idx].dc_pred = dc;
        data[0] = dc * dequant[0];
        let k = 1;
        do {
            if (this.code_bits < 16) this.grow_buffer_unsafe();
            const c = (this.code_buffer >>> (32 - 9)) & ((1 << 9) - 1);
            const r = fac[c];
            if (r) {
                k += (r >> 4) & 15;
                const s = r & 15;
                if (s > this.code_bits) return err("bad huffman code", "Corrupt JPEG");
                this.code_buffer <<= s;
                this.code_bits -= s;
                const zig = DEZIGZAG[k++];
                data[zig] = (r >> 8) * dequant[zig];
            } else {
                const rs = this.huff_decode(hac);
                if (rs < 0) return err("bad huffman code", "Corrupt JPEG");
                const s = rs & 15;
                const r_run = rs >> 4;
                if (s === 0) {
                    if (rs !== 0xf0) break;
                    k += 16;
                } else {
                    k += r_run;
                    const zig = DEZIGZAG[k++];
                    data[zig] = this.extend_receive(s) * dequant[zig];
                }
            }
        } while (k < 64);
        return 1;
    }
}

const JBIAS = [0,-1,-3,-7,-15,-31,-63,-127,-255,-511,-1023,-2047,-4095,-8191,-16383,-32767];
const BMASK = [0,1,3,7,15,31,63,127,255,511,1023,2047,4095,8191,16383,32767,65535];

function build_fast_ac(fast_ac, h) {
    for (let i = 0; i < (1 << 9); ++i) {
        const fast = h.fast[i];
        fast_ac[i] = 0;
        if (fast < 255) {
            const rs = h.values[fast];
            const run = (rs >> 4) & 15;
            const magbits = rs & 15;
            const len = h.size[fast];

            if (magbits && len + magbits <= 9) {
                let k = ((i << len) & ((1 << 9) - 1)) >>> (9 - magbits);
                const m = 1 << (magbits - 1);
                if (k < m) k += (~0 << magbits) + 1;
                if (k >= -128 && k <= 127) {
                    fast_ac[i] = (k * 256) + (run * 16) + (len + magbits);
                }
            }
        }
    }
}


function build_jpeg_huffman(j, h, count) {
    let k = 0;
    for (let i = 0; i < 16; ++i) {
        for (let j = 0; j < count[i]; ++j) {
            h.size[k++] = i + 1;
        }
    }
    h.size[k] = 0;

    let code = 0;
    k = 0;
    for (let j = 1; j <= 16; ++j) {
        h.delta[j] = k - code;
        if (h.size[k] === j) {
            while (h.size[k] === j) {
                h.code[k++] = code++;
            }
            if (code - 1 >= (1 << j)) return err("bad code lengths", "Corrupt JPEG");
        }
        h.maxcode[j] = code << (16 - j);
        code <<= 1;
    }
    h.maxcode[j] = 0xFFFFFFFF;

    h.fast.fill(255);
    for (let i = 0; i < k; ++i) {
        const s = h.size[i];
        if (s <= 9) {
            let c = h.code[i] << (9 - s);
            const m = 1 << (9 - s);
            for (let j = 0; j < m; ++j) {
                h.fast[c + j] = i;
            }
        }
    }
    return 1;
}

function get_marker(j) {
    if (j.marker !== MARKER_NONE) {
        const x = j.marker;
        j.marker = MARKER_NONE;
        return x;
    }
    let x = j.s.get8();
    if (x !== 0xFF) return MARKER_NONE;
    while (x === 0xFF) x = j.s.get8();
    return x;
}

function process_marker(j, m) {
    const s = j.s;
    let L = s.get16be();
    if (L < 2) return err("bad marker len", "Corrupt JPEG");
    L -= 2;

    switch (m) {
        case MARKER_DQT: {
            while (L > 0) {
                const q = s.get8();
                const p = q >> 4;
                const sixteen = p !== 0;
                const t = q & 15;
                if (t > 3) return err("bad DQT table", "Corrupt JPEG");
                for (let i = 0; i < 64; ++i) {
                    j.dequant[t][DEZIGZAG[i]] = sixteen ? s.get16be() : s.get8();
                }
                L -= (sixteen ? 129 : 65);
            }
            return L === 0;
        }
        case MARKER_DHT: {
            while (L > 0) {
                const q = s.get8();
                const tc = q >> 4;
                const th = q & 15;
                if (tc > 1 || th > 3) return err("bad DHT header", "Corrupt JPEG");
                const count = new Uint8Array(16);
                let n = 0;
                for (let i=0; i<16; ++i) {
                    count[i] = s.get8();
                    n += count[i];
                }
                L -= 17;
                const h = (tc === 0) ? j.huff_dc[th] : j.huff_ac[th];
                if (!build_jpeg_huffman(j, h, count)) return 0;
                for (let i=0; i<n; ++i) h.values[i] = s.get8();
                if (tc !== 0) {
                    build_fast_ac(j.fast_ac[th], h);
                }
                L -= n;
            }
            return L === 0;
        }
        case MARKER_DRI: {
            if (L !== 2) return err("bad DRI len", "Corrupt JPEG");
            j.restart_interval = s.get16be();
            return 1;
        }
        default:
            s.skip(L);
            return 1;
    }
}

function process_frame_header(j, scan) {
    const s = j.s;
    let Lf = s.get16be();
    if (Lf < 11) return err("bad SOF len", "Corrupt JPEG");
    const p = s.get8();
    if (p !== 8) return err("only 8-bit", "JPEG format not supported: 8-bit only");
    s.img_y = s.get16be();
    s.img_x = s.get16be();
    if (s.img_y === 0 || s.img_x === 0) return err("0-pixel image", "Corrupt JPEG");
    const c = s.get8();
    if (c !== 1 && c !== 3 && c !== 4) return err("bad component count", "Corrupt JPEG");
    s.img_n = c;

    if (Lf !== 8 + 3 * s.img_n) return err("bad SOF len", "Corrupt JPEG");

    for (let i = 0; i < s.img_n; ++i) {
        const comp = j.img_comp[i];
        comp.id = s.get8();
        const q = s.get8();
        comp.h = (q >> 4);
        comp.v = q & 15;
        if (!comp.h || comp.h > 4 || !comp.v || comp.v > 4) return err("bad H/V", "Corrupt JPEG");
        comp.tq = s.get8();
        if (comp.tq > 3) return err("bad TQ", "Corrupt JPEG");
    }

    if (scan !== 1) return 1; // 1 means load

    let h_max = 1, v_max = 1;
    for (let i=0; i < s.img_n; ++i) {
        if (j.img_comp[i].h > h_max) h_max = j.img_comp[i].h;
        if (j.img_comp[i].v > v_max) v_max = j.img_comp[i].v;
    }
    j.img_h_max = h_max;
    j.img_v_max = v_max;
    j.img_mcu_w = h_max * 8;
    j.img_mcu_h = v_max * 8;
    j.img_mcu_x = Math.ceil(s.img_x / j.img_mcu_w);
    j.img_mcu_y = Math.ceil(s.img_y / j.img_mcu_h);

    for (let i = 0; i < s.img_n; ++i) {
        const comp = j.img_comp[i];
        comp.x = Math.ceil(s.img_x * comp.h / j.img_h_max);
        comp.y = Math.ceil(s.img_y * comp.v / j.img_v_max);
        comp.w2 = j.img_mcu_x * comp.h * 8;
        comp.h2 = j.img_mcu_y * comp.v * 8;
        comp.data = new Uint8Array(comp.w2 * comp.h2);

        if(j.progressive) {
            // progressive-specific allocations would go here
        }
    }

    return 1;
}

function decode_jpeg_header(j, scan) {
    j.marker = MARKER_NONE;
    let m = get_marker(j);
    if (m !== MARKER_SOI) return err("no SOI", "Corrupt JPEG");
    if (scan === 2) return 1; // 2 means type scan

    m = get_marker(j);
    while (m !== MARKER_SOF0 && m !== MARKER_SOF1 && m !== MARKER_SOF2) {
        if (!process_marker(j, m)) return 0;
        m = get_marker(j);
        if (m === MARKER_NONE) return err("no SOF", "Corrupt JPEG");
    }
    j.progressive = m === MARKER_SOF2;
    return process_frame_header(j, scan);
}

export function jpeg_info(s, x, y, comp) {
    const j = new Jpeg(s);
    if (!decode_jpeg_header(j, 2)) { // 2 means header scan
        s.rewind();
        return 0;
    }
    x.value = s.img_x;
    y.value = s.img_y;
    comp.value = s.img_n >= 3 ? 3 : 1;
    return 1;
}

export function jpeg_load(s, req_comp) {
    const j = new Jpeg(s);
    const result = load_jpeg_image(j, req_comp);
    return result;
}

function load_jpeg_image(j, req_comp) {
    if (!decode_jpeg_image(j)) return null;

    const s = j.s;
    req_comp = req_comp ? req_comp : s.img_n >= 3 ? 4 : 1;
    if (req_comp < 1 || req_comp > 4) return err("bad req_comp", "Internal error");

    const out = new Uint8Array(s.img_x * s.img_y * req_comp);

    const res_comp = [];
    for (let k = 0; k < s.img_n; ++k) {
        const r = {};
        const comp = j.img_comp[k];
        comp.linebuf = new Uint8Array(s.img_x + 3);
        r.hs = j.img_h_max / comp.h;
        r.vs = j.img_v_max / comp.v;
        r.ystep = r.vs >> 1;
        r.w_lores = Math.ceil(s.img_x / r.hs);
        r.ypos = 0;
        r.line0 = r.line1 = comp.data;

        if (r.hs === 1 && r.vs === 1) r.resample = (out, in_near) => in_near;
        else if (r.hs === 1 && r.vs === 2) r.resample = resample_row_v_2;
        else if (r.hs === 2 && r.vs === 1) r.resample = resample_row_h_2;
        else if (r.hs === 2 && r.vs === 2) r.resample = resample_row_hv_2;
        else r.resample = resample_row_generic;
        res_comp.push(r);
    }

    const coutput = [new Uint8Array(s.img_x), new Uint8Array(s.img_x), new Uint8Array(s.img_x), new Uint8Array(s.img_x)];

    for (let j_row = 0; j_row < s.img_y; ++j_row) {
        const out_row = out.subarray(j_row * s.img_x * req_comp);
        for (let k = 0; k < s.img_n; ++k) {
            const r = res_comp[k];
            const comp = j.img_comp[k];
            const y_bot = r.ystep >= (r.vs >> 1);
            coutput[k] = r.resample(comp.linebuf, y_bot ? r.line1 : r.line0, y_bot ? r.line0 : r.line1, r.w_lores, r.hs);
            if (++r.ystep >= r.vs) {
                r.ystep = 0;
                r.line0 = r.line1;
                if (++r.ypos < comp.y) {
                    r.line1 = comp.data.subarray(r.ypos * comp.w2);
                }
            }
        }

        if (req_comp >= 3) {
            YCbCr_to_RGB_row(out_row, coutput[0], coutput[1], coutput[2], s.img_x, req_comp);
        } else {
            // ... grayscale conversion ...
            for(let i=0; i<s.img_x; ++i) out_row[i] = coutput[0][i];
        }
    }

    return { data: out, w: s.img_x, h: s.img_y, n: req_comp };
}

function decode_jpeg_image(j) {
    j.restart_interval = 0;
    if (!decode_jpeg_header(j, 1)) return 0;
    let m = get_marker(j);
    while (m !== MARKER_EOI) {
        if (m === MARKER_SOS) {
            if (!process_scan_header(j)) return 0;
            if (!parse_entropy_coded_data(j)) return 0;
            m = get_marker(j);
            if (m === MARKER_NONE) {
                // handle junk at end of file
                while(!j.s.eof()) {
                    let x = j.s.get8();
                    if (x === 0xFF) {
                        if (j.s.buffer[j.s.pos] !== 0x00) {
                            m = j.s.buffer[j.s.pos];
                            break;
                        }
                    }
                }
            }
        } else {
            if (!process_marker(j, m)) return 0;
            m = get_marker(j);
        }
    }
    return 1;
}

function process_scan_header(j) {
    const s = j.s;
    const Ls = s.get16be();
    j.scan_n = s.get8();
    if (j.scan_n < 1 || j.scan_n > 4 || j.scan_n > s.img_n) return err("bad SOS component count", "Corrupt JPEG");
    if (Ls !== 6 + 2 * j.scan_n) return err("bad SOS len", "Corrupt JPEG");
    for (let i = 0; i < j.scan_n; ++i) {
        const id = s.get8();
        const q = s.get8();
        let which;
        for(which = 0; which < s.img_n; ++which) {
            if (j.img_comp[which].id === id) break;
        }
        if (which === s.img_n) return 0;
        j.img_comp[which].hd = q >> 4;
        j.img_comp[which].ha = q & 15;
        j.order[i] = which;
    }
    s.skip(3); // spec_start, spec_end, succ_high/low
    return 1;
}

function jpeg_reset(j) {
    j.code_bits = 0;
    j.code_buffer = 0;
    j.nomore = 0;
    j.img_comp[0].dc_pred = j.img_comp[1].dc_pred = j.img_comp[2].dc_pred = j.img_comp[3].dc_pred = 0;
    j.marker = MARKER_NONE;
    j.todo = j.restart_interval ? j.restart_interval : 0x7FFFFFFF;
}

function parse_entropy_coded_data(j) {
    jpeg_reset(j);
    if (j.scan_n === 1) {
        const n = j.order[0];
        const comp = j.img_comp[n];
        const w = Math.ceil(comp.x / 8);
        const h = Math.ceil(comp.y / 8);
        const data = new Int16Array(64);
        for (let j_mcu = 0; j_mcu < h; ++j_mcu) {
            for (let i_mcu = 0; i_mcu < w; ++i_mcu) {
                const ha = comp.ha;
                if (!j.decode_block(data, j.huff_dc[comp.hd], j.huff_ac[ha], j.fast_ac[ha], n, j.dequant[comp.tq])) return 0;
                idct_block(comp.data.subarray((j_mcu*8*comp.w2) + (i_mcu*8)), comp.w2, data);
                if (--j.todo <= 0) {
                    if (j.code_bits < 24) j.grow_buffer_unsafe();
                    const m = get_marker(j);
                    if (m >= 0xD0 && m <= 0xD7) { // is restart
                        jpeg_reset(j);
                    } else if (m !== MARKER_NONE) {
                        return err("marker after RST interval", "Corrupt JPEG");
                    }
                }
            }
        }
        return 1;
    } else { // Interleaved
        const data = new Int16Array(64);
        for (let j_mcu = 0; j_mcu < j.img_mcu_y; ++j_mcu) {
            for (let i_mcu = 0; i_mcu < j.img_mcu_x; ++i_mcu) {
                for (let k = 0; k < j.scan_n; ++k) {
                    const n = j.order[k];
                    const comp = j.img_comp[n];
                    for (let y = 0; y < comp.v; ++y) {
                        for (let x = 0; x < comp.h; ++x) {
                            const x2 = (i_mcu * comp.h + x) * 8;
                            const y2 = (j_mcu * comp.v + y) * 8;
                            const ha = comp.ha;
                            if (!j.decode_block(data, j.huff_dc[comp.hd], j.huff_ac[ha], j.fast_ac[ha], n, j.dequant[comp.tq])) return 0;
                            idct_block(comp.data.subarray(y2*comp.w2 + x2), comp.w2, data);
                        }
                    }
                }
                if (--j.todo <= 0) {
                    if (j.code_bits < 24) j.grow_buffer_unsafe();
                    const m = get_marker(j);
                    if (m >= 0xD0 && m <= 0xD7) {
                        jpeg_reset(j);
                    } else if (m !== MARKER_NONE) {
                        return err("marker after RST interval", "Corrupt JPEG");
                    }
                }
            }
        }
        return 1;
    }
}

function clamp(x) {
    if (x < 0) return 0;
    if (x > 255) return 255;
    return x;
}

function YCbCr_to_RGB_row(out, y, pcb, pcr, count, step) {
    for (let i = 0; i < count; ++i) {
        const y_ = y[i];
        const cb_ = pcb[i] - 128;
        const cr_ = pcr[i] - 128;

        let r = y_ + 1.402 * cr_;
        let g = y_ - 0.34414 * cb_ - 0.71414 * cr_;
        let b = y_ + 1.772 * cb_;

        const out_off = i * step;
        out[out_off] = clamp(r);
        out[out_off + 1] = clamp(g);
        out[out_off + 2] = clamp(b);
        if (step === 4) out[out_off + 3] = 255;
    }
}

function dequantize(data, dequant) {
    for (let i = 0; i < 64; ++i) {
        data[i] *= dequant[i];
    }
}

function resample_row_v_2(out, in_near, in_far, w, hs) {
    return in_near;
}

function resample_row_h_2(out, in_near, in_far, w, hs) {
    let i;
    const j = 0;
    for (i = 0; i < w; ++i) {
        out[i] = (3 * in_near[j+i] + in_near[j+i+1] + 2) >> 2;
    }
    return out;
}

function resample_row_hv_2(out, in_near, in_far, w, hs) {
    let i;
    const j = 0;
    for (i = 0; i < w; ++i) {
        out[i] = (3 * in_near[j+i] + in_far[j+i] + 2) >> 2;
    }
    return out;
}

function resample_row_generic(out, in_near, in_far, w, hs) {
    let i, j;
    for (i = 0, j = 0; i < w; ++i, j += hs) {
        out[i] = in_near[j];
    }
    return out;
}

function idct_block(out, out_stride, data) {
    const f2f = (x) => Math.floor(x * 4096 + 0.5);
    const fsh = (x) => x * 4096;
    const val = new Int32Array(64);

    // Columns
    for (let i = 0; i < 8; ++i) {
        const d = data.subarray(i);
        const v = val.subarray(i);
        if (d[8]===0 && d[16]===0 && d[24]===0 && d[32]===0 && d[40]===0 && d[48]===0 && d[56]===0) {
            const dcterm = d[0] * 4;
            v[0] = v[8] = v[16] = v[24] = v[32] = v[40] = v[48] = v[56] = dcterm;
        } else {
            const s0=d[0], s1=d[8], s2=d[16], s3=d[24], s4=d[32], s5=d[40], s6=d[48], s7=d[56];
            let p2 = s2, p3 = s6;
            let p1 = (p2+p3) * f2f(0.5411961);
            let t2 = p1 + p3*f2f(-1.847759065), t3 = p1 + p2*f2f(0.765366865);
            p2 = s0; p3 = s4;
            let t0 = fsh(p2+p3), t1 = fsh(p2-p3);
            let x0 = t0+t3, x3 = t0-t3, x1 = t1+t2, x2 = t1-t2;
            t0 = s7; t1 = s5; t2 = s3; t3 = s1;
            p3 = t0+t2; let p4 = t1+t3;
            p1 = t0+t3; p2 = t1+t2;
            let p5 = (p3+p4)*f2f(1.175875602);
            t0 = t0*f2f(0.298631336); t1 = t1*f2f(2.053119869); t2 = t2*f2f(3.072711026); t3 = t3*f2f(1.501321110);
            p1 = p5 + p1*f2f(-0.899976223); p2 = p5 + p2*f2f(-2.562915447);
            p3 = p3*f2f(-1.961570560); p4 = p4*f2f(-0.390180644);
            t3 += p1+p4; t2 += p2+p3; t1 += p2+p4; t0 += p1+p3;

            v[0] = (x0+t3+512)>>10; v[56] = (x0-t3+512)>>10;
            v[8] = (x1+t2+512)>>10; v[48] = (x1-t2+512)>>10;
            v[16] = (x2+t1+512)>>10; v[40] = (x2-t1+512)>>10;
            v[24] = (x3+t0+512)>>10; v[32] = (x3-t0+512)>>10;
        }
    }

    // Rows
    for (let i=0; i < 8; ++i) {
        const o = out.subarray(out_stride * i);
        const s0=val[i*8+0], s1=val[i*8+1], s2=val[i*8+2], s3=val[i*8+3], s4=val[i*8+4], s5=val[i*8+5], s6=val[i*8+6], s7=val[i*8+7];
        let p2 = s2, p3 = s6;
        let p1 = (p2+p3) * f2f(0.5411961);
        let t2 = p1 + p3*f2f(-1.847759065), t3 = p1 + p2*f2f(0.765366865);
        p2 = s0; p3 = s4;
        let t0 = fsh(p2+p3), t1 = fsh(p2-p3);
        let x0 = t0+t3, x3 = t0-t3, x1 = t1+t2, x2 = t1-t2;
        t0 = s7; t1 = s5; t2 = s3; t3 = s1;
        p3 = t0+t2; let p4 = t1+t3;
        p1 = t0+t3; p2 = t1+t2;
        let p5 = (p3+p4)*f2f(1.175875602);
        t0 = t0*f2f(0.298631336); t1 = t1*f2f(2.053119869); t2 = t2*f2f(3.072711026); t3 = t3*f2f(1.501321110);
        p1 = p5 + p1*f2f(-0.899976223); p2 = p5 + p2*f2f(-2.562915447);
        p3 = p3*f2f(-1.961570560); p4 = p4*f2f(-0.390180644);
        t3 += p1+p4; t2 += p2+p3; t1 += p2+p4; t0 += p1+p3;

        x0 += 65536 + (128<<17); x1 += 65536 + (128<<17); x2 += 65536 + (128<<17); x3 += 65536 + (128<<17);
        o[0] = clamp((x0+t3) >> 17); o[7] = clamp((x0-t3) >> 17);
        o[1] = clamp((x1+t2) >> 17); o[6] = clamp((x1-t2) >> 17);
        o[2] = clamp((x2+t1) >> 17); o[5] = clamp((x2-t1) >> 17);
        o[3] = clamp((x3+t0) >> 17); o[4] = clamp((x3-t0) >> 17);
    }
}
