import { err } from './context.js';

const ZFAST_BITS = 9;
const ZFAST_MASK = (1 << ZFAST_BITS) - 1;
const ZNSYMS = 288;

export class Huffman {
    constructor() {
        this.fast = new Uint16Array(1 << ZFAST_BITS);
        this.firstcode = new Uint16Array(16);
        this.maxcode = new Int32Array(17);
        this.firstsymbol = new Uint16Array(16);
        this.size = new Uint8Array(ZNSYMS);
        this.value = new Uint16Array(ZNSYMS);
    }
}

function bitreverse16(n) {
    n = ((n & 0x5555) << 1) | ((n & 0xAAAA) >>> 1);
    n = ((n & 0x3333) << 2) | ((n & 0xCCCC) >>> 2);
    n = ((n & 0x0F0F) << 4) | ((n & 0xF0F0) >>> 4);
    n = ((n & 0x00FF) << 8) | ((n & 0xFF00) >>> 8);
    return n;
}

function bit_reverse(v, bits) {
    return bitreverse16(v) >>> (16 - bits);
}

export function zbuild_huffman(z, sizelist, num) {
    const sizes = new Int32Array(17);
    const next_code = new Int32Array(16);
    let k = 0;

    for (let i = 0; i < num; i++) {
        sizes[sizelist[i]]++;
    }
    sizes[0] = 0;

    for (let i = 1; i < 16; i++) {
        if (sizes[i] > (1 << i)) {
            return err("bad sizes", "invalid data");
        }
    }

    let code = 0;
    for (let i = 1; i < 16; i++) {
        next_code[i] = code;
        z.firstcode[i] = code;
        z.firstsymbol[i] = k;
        code += sizes[i];
        if (sizes[i] > 0) {
            if (code - 1 >= (1 << i)) return err("bad codelengths", "invalid data");
        }
        z.maxcode[i] = code << (16 - i);
        code <<= 1;
        k += sizes[i];
    }

    z.maxcode[16] = 0x10000;

    for (let i = 0; i < num; i++) {
        const s = sizelist[i];
        if (s > 0) {
            const c = next_code[s] - z.firstcode[s] + z.firstsymbol[s];
            const fastv = (s << 9) | i;
            z.size[c] = s;
            z.value[c] = i;
            if (s <= ZFAST_BITS) {
                let j = bit_reverse(next_code[s], s);
                while (j < (1 << ZFAST_BITS)) {
                    z.fast[j] = fastv;
                    j += (1 << s);
                }
            }
            next_code[s]++;
        }
    }
    return 1;
}

const ZLENGTH_BASE = [
   3,4,5,6,7,8,9,10,11,13,
   15,17,19,23,27,31,35,43,51,59,
   67,83,99,115,131,163,195,227,258,0,0
];
const ZLENGTH_EXTRA = [0,0,0,0,0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,0,0,0];
const ZDIST_BASE = [1,2,3,4,5,7,9,13,17,25,33,49,65,97,129,193,257,385,513,769,1025,1537,2049,3073,4097,6145,8193,12289,16385,24577,0,0];
const ZDIST_EXTRA = [0,0,0,0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,12,12,13,13];

class Zlib {
    constructor(buffer) {
        this.zbuffer = buffer;
        this.zbuffer_pos = 0;
        this.num_bits = 0;
        this.code_buffer = 0;
        this.hit_zeof_once = false;

        this.zout = null;
        this.zout_pos = 0;
        this.zout_len = 0;
        this.z_expandable = true;

        this.z_length = new Huffman();
        this.z_distance = new Huffman();
    }

    zeof() { return this.zbuffer_pos >= this.zbuffer.length; }
    zget8() { return this.zeof() ? 0 : this.zbuffer[this.zbuffer_pos++]; }

    fill_bits() {
        do {
            this.code_buffer |= this.zget8() << this.num_bits;
            this.num_bits += 8;
        } while (this.num_bits <= 24);
    }

    zreceive(n) {
        if (this.num_bits < n) this.fill_bits();
        const k = this.code_buffer & ((1 << n) - 1);
        this.code_buffer >>>= n;
        this.num_bits -= n;
        return k;
    }

    zhuffman_decode_slowpath(z) {
        const k = bit_reverse(this.code_buffer, 16);
        let s;
        for (s = ZFAST_BITS + 1; ; ++s) {
            if (k < z.maxcode[s]) break;
        }
        if (s >= 16) return -1;

        const b = (k >>> (16 - s)) - z.firstcode[s] + z.firstsymbol[s];
        if (b >= ZNSYMS) return -1;
        if (z.size[b] !== s) return -1;

        this.code_buffer >>>= s;
        this.num_bits -= s;
        return z.value[b];
    }

    zhuffman_decode(z) {
        if (this.num_bits < 16) {
            if (this.zeof()) {
                if (!this.hit_zeof_once) {
                    this.hit_zeof_once = true;
                    this.num_bits += 16;
                } else {
                    return -1;
                }
            } else {
                this.fill_bits();
            }
        }
        const b = z.fast[this.code_buffer & ZFAST_MASK];
        if (b) {
            const s = b >> 9;
            this.code_buffer >>>= s;
            this.num_bits -= s;
            return b & 511;
        }
        return this.zhuffman_decode_slowpath(z);
    }

    zexpand(n) {
        if (!this.z_expandable) return err("output buffer limit", "invalid data");

        const old_len = this.zout_len;
        let new_len = old_len;
        if (new_len === 0) new_len = 1; // Start with 1, will be doubled
        while (this.zout_pos + n > new_len) {
            new_len *= 2;
        }

        const new_out = new Uint8Array(new_len);
        if (this.zout) {
            new_out.set(this.zout);
        }
        this.zout = new_out;
        this.zout_len = new_len;
        return 1;
    }

    parse_huffman_block() {
        while(true) {
            let z = this.zhuffman_decode(this.z_length);
            if (z < 256) {
                if (z < 0) return err("bad huffman code", "invalid data");
                if (this.zout_pos >= this.zout_len) {
                    if (!this.zexpand(1)) return 0;
                }
                this.zout[this.zout_pos++] = z;
            } else {
                if (z === 256) {
                    return 1;
                }
                z -= 257;
                let len = ZLENGTH_BASE[z];
                if (ZLENGTH_EXTRA[z] > 0) len += this.zreceive(ZLENGTH_EXTRA[z]);

                z = this.zhuffman_decode(this.z_distance);
                if (z < 0 || z >= 30) return err("bad huffman code", "invalid data");

                let dist = ZDIST_BASE[z];
                if (ZDIST_EXTRA[z] > 0) dist += this.zreceive(ZDIST_EXTRA[z]);

                if (this.zout_pos < dist) return err("bad dist", "invalid data");

                if (this.zout_pos + len > this.zout_len) {
                    if (!this.zexpand(len)) return 0;
                }

                const p = this.zout_pos - dist;
                if (dist === 1) {
                    const v = this.zout[p];
                    for(let i=0; i<len; ++i) this.zout[this.zout_pos++] = v;
                } else {
                    for(let i=0; i<len; ++i) this.zout[this.zout_pos++] = this.zout[p+i];
                }
            }
        }
    }

    compute_huffman_codes() {
        const length_dezigzag = [16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15];
        const z_codelength = new Huffman();
        const lencodes = new Uint8Array(286+32+137);
        const codelength_sizes = new Uint8Array(19);

        const hlit = this.zreceive(5) + 257;
        const hdist = this.zreceive(5) + 1;
        const hclen = this.zreceive(4) + 4;
        const ntot = hlit + hdist;

        for (let i = 0; i < hclen; ++i) {
            const s = this.zreceive(3);
            codelength_sizes[length_dezigzag[i]] = s;
        }
        if (!zbuild_huffman(z_codelength, codelength_sizes, 19)) return 0;

        let n = 0;
        while (n < ntot) {
            const c = this.zhuffman_decode(z_codelength);
            if (c < 0 || c >= 19) return err("bad codelengths", "invalid data");
            if (c < 16) {
                lencodes[n++] = c;
            } else {
                let fill = 0;
                if (c === 16) {
                    const count = this.zreceive(2) + 3;
                    if (n === 0) return err("bad codelengths", "invalid data");
                    fill = lencodes[n - 1];
                    for(let i=0; i<count; ++i) lencodes[n+i] = fill;
                    n += count;
                } else if (c === 17) {
                    const count = this.zreceive(3) + 3;
                    for(let i=0; i<count; ++i) lencodes[n+i] = 0;
                    n += count;
                } else if (c === 18) {
                    const count = this.zreceive(7) + 11;
                    for(let i=0; i<count; ++i) lencodes[n+i] = 0;
                    n += count;
                }
            }
        }
        if (n !== ntot) return err("bad codelengths", "invalid data");
        if (!zbuild_huffman(this.z_length, lencodes, hlit)) return 0;
        if (!zbuild_huffman(this.z_distance, lencodes.subarray(hlit), hdist)) return 0;
        return 1;
    }

    parse_uncompressed_block() {
        const header = new Uint8Array(4);
        if (this.num_bits & 7) this.zreceive(this.num_bits & 7);

        let k = 0;
        while (this.num_bits > 0) {
            header[k++] = this.code_buffer & 255;
            this.code_buffer >>>= 8;
            this.num_bits -= 8;
        }
        if (this.num_bits < 0) return err("zlib corrupt", "invalid data");

        while (k < 4) header[k++] = this.zget8();

        const len = header[1] * 256 + header[0];
        const nlen = header[3] * 256 + header[2];

        if (nlen !== (len ^ 0xffff)) return err("zlib corrupt", "invalid data");
        if (this.zbuffer_pos + len > this.zbuffer.length) return err("read past buffer", "invalid data");

        if (this.zout_pos + len > this.zout_len) {
            if(!this.zexpand(len)) return 0;
        }

        this.zout.set(this.zbuffer.subarray(this.zbuffer_pos, this.zbuffer_pos + len), this.zout_pos);
        this.zbuffer_pos += len;
        this.zout_pos += len;
        return 1;
    }

    parse_zlib_header() {
        const cmf = this.zget8();
        const cm = cmf & 15;
        const flg = this.zget8();
        if (this.zeof()) return err("bad zlib header", "invalid data");
        if ((cmf * 256 + flg) % 31 !== 0) return err("bad zlib header", "invalid data");
        if (flg & 32) return err("no preset dict", "invalid data");
        if (cm !== 8) return err("bad compression", "invalid data");
        return 1;
    }

    parse_zlib(parse_header) {
        if (parse_header) {
            if (!this.parse_zlib_header()) return 0;
        }
        this.num_bits = 0;
        this.code_buffer = 0;
        this.hit_zeof_once = false;

        let final, type;
        do {
            final = this.zreceive(1);
            type = this.zreceive(2);
            if (type === 0) {
                if (!this.parse_uncompressed_block()) return 0;
            } else if (type === 3) {
                return 0;
            } else {
                if (type === 1) {
                    const ZDEFAULT_LENGTH = new Uint8Array([
                        8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8, 8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,
                        8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8, 8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,
                        8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8, 8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,
                        8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8, 8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,
                        8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8, 9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,
                        9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9, 9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,
                        9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9, 9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,
                        9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9, 9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,
                        7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7, 7,7,7,7,7,7,7,7,8,8,8,8,8,8,8,8
                    ]);
                    const ZDEFAULT_DISTANCE = new Uint8Array([5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5]);
                    if (!zbuild_huffman(this.z_length, ZDEFAULT_LENGTH, ZNSYMS)) return 0;
                    if (!zbuild_huffman(this.z_distance, ZDEFAULT_DISTANCE, 32)) return 0;
                } else {
                    if (!this.compute_huffman_codes()) return 0;
                }
                if (!this.parse_huffman_block()) return 0;
            }
        } while (!final);
        return 1;
    }
}

export function zlib_decode_malloc_guesssize_headerflag(buffer, initial_size, parse_header) {
    const a = new Zlib(buffer);
    a.zout = new Uint8Array(initial_size);
    a.zout_len = initial_size;

    if (a.parse_zlib(parse_header)) {
        return a.zout.slice(0, a.zout_pos);
    } else {
        return null;
    }
}

export function zlib_decode_buffer(inputBuffer, outputBuffer) {
    const a = new Zlib(inputBuffer);
    a.zout = outputBuffer;
    a.zout_len = outputBuffer.length;
    a.z_expandable = false;

    if (a.parse_zlib(true)) {
        return a.zout_pos;
    } else {
        return -1;
    }
}

// SDEFL compression
const SDEFL_MAX_OFF = 1 << 15;
const SDEFL_WIN_SIZ = SDEFL_MAX_OFF;
const SDEFL_HASH_BITS = 15;
const SDEFL_HASH_SIZ = 1 << SDEFL_HASH_BITS;
const SDEFL_MIN_MATCH = 4;
const SDEFL_NIL = -1;
const SDEFL_MAX_MATCH = 258;
const SDEFL_LIT_LEN_CODES = 14;
const SDEFL_OFF_CODES = 15;
const SDEFL_PRE_CODES = 7;
const SDEFL_EOB = 256;

class Sdefl {
    constructor() {
        this.tbl = new Int32Array(SDEFL_HASH_SIZ);
        this.prv = new Int32Array(SDEFL_WIN_SIZ);
        this.out = null;
        this.out_pos = 0;
        this.bits = 0;
        this.bitcnt = 0;
        this.cod = {
            len: {
                lit: new Uint8Array(ZNSYMS),
                off: new Uint8Array(32),
            },
            word: {
                lit: new Uint16Array(ZNSYMS),
                off: new Uint16Array(32),
            }
        };
        this.freq = {
            lit: new Uint32Array(ZNSYMS),
            off: new Uint32Array(32),
        };
        this.seq = [];
    }
}

function sdefl_hash32(data, pos) {
    const n = data[pos] | (data[pos+1] << 8) | (data[pos+2] << 16) | (data[pos+3] << 24);
    return ((n * 0x9E377989) >>> (32 - SDEFL_HASH_BITS)) & (SDEFL_HASH_SIZ - 1);
}

function sdefl_put(s, code, bitcnt) {
    s.bits |= (code << s.bitcnt);
    s.bitcnt += bitcnt;
    while (s.bitcnt >= 8) {
        s.out[s.out_pos++] = s.bits & 0xFF;
        s.bits >>>= 8;
        s.bitcnt -= 8;
    }
}

function sdefl_match_codes(dist, len) {
    let l_slot = 0;
    if (len > 0) {
        let l = len;
        while (l > ZLENGTH_BASE[l_slot+1]) l_slot++;
    }

    let d_slot = 0;
    if (dist > 0) {
        let d = dist;
        while (d > ZDIST_BASE[d_slot+1]) d_slot++;
    }

    return {
        lcode: 257 + l_slot,
        dcode: d_slot,
        lextra: len - ZLENGTH_BASE[l_slot],
        dextra: dist - ZDIST_BASE[d_slot],
        lextra_bits: ZLENGTH_EXTRA[l_slot],
        dextra_bits: ZDIST_EXTRA[d_slot],
    };
}

function sdefl_huff(lens, codes, freqs, num_syms, max_code_len) {
    const len_cnt = new Uint32Array(max_code_len + 1);
    for (let i = 0; i < num_syms; i++) {
        if(freqs[i] > 0) {
            len_cnt[1]++;
        }
    }

    for (let len = max_code_len; len > 0; len--) {
        if (len_cnt[len] > 0) {
            let j = len_cnt[len];
            while(j>0) {
                let k = 0;
                for(let i=0; i<num_syms; ++i) {
                    if(freqs[i] > k && lens[i] == 0) {
                        k = freqs[i];
                    }
                }
                let l = 0;
                for(let i=0; i<num_syms; ++i) {
                    if(freqs[i] == k && lens[i] == 0) {
                        lens[i] = len;
                        l++;
                    }
                }
                j -= l;
            }
        }
    }

    const next_code = new Uint16Array(max_code_len + 1);
    let code = 0;
    for(let bits = 1; bits <= max_code_len; bits++) {
        code = (code + len_cnt[bits-1]) << 1;
        next_code[bits] = code;
    }

    for (let n = 0; n < num_syms; n++) {
        let len = lens[n];
        if (len !== 0) {
            codes[n] = bit_reverse(next_code[len]++, len);
        }
    }
}

function sdefl_flush(s, in_buf, is_last) {
    s.freq.lit[SDEFL_EOB]++;

    sdefl_huff(s.cod.len.lit, s.cod.word.lit, s.freq.lit, ZNSYMS, SDEFL_LIT_LEN_CODES);
    sdefl_huff(s.cod.len.off, s.cod.word.off, s.freq.off, 32, SDEFL_OFF_CODES);

    sdefl_put(s, is_last, 1);
    sdefl_put(s, 2, 2); // dynamic huffman

    // ... write trees ...

    for(let i=0; i<s.seq.length; ++i) {
        const seq = s.seq[i];
        if (seq.off >= 0) {
            for(let j=0; j<seq.len; ++j) {
                const c = in_buf[seq.off+j];
                sdefl_put(s, s.cod.word.lit[c], s.cod.len.lit[c]);
            }
        } else {
            const codes = sdefl_match_codes(-seq.off, seq.len);
            sdefl_put(s, s.cod.word.lit[codes.lcode], s.cod.len.lit[codes.lcode]);
            if(codes.lextra_bits) sdefl_put(s, codes.lextra, codes.lextra_bits);
            sdefl_put(s, s.cod.word.off[codes.dcode], s.cod.len.off[codes.dcode]);
            if(codes.dextra_bits) sdefl_put(s, codes.dextra, codes.dextra_bits);
        }
    }

    sdefl_put(s, s.cod.word.lit[SDEFL_EOB], s.cod.len.lit[SDEFL_EOB]);

    s.seq = [];
    s.freq.lit.fill(0);
    s.freq.off.fill(0);
}

function sdefl_compr(s, in_buf) {
    const in_len = in_buf.length;
    let i = 0;
    let litlen = 0;

    for(let j=0; j<SDEFL_HASH_SIZ; ++j) s.tbl[j] = SDEFL_NIL;

    while(i < in_len) {
        let m_len = 0;
        let m_off = 0;

        if (i + SDEFL_MIN_MATCH < in_len) {
            const h = sdefl_hash32(in_buf, i);
            let p = s.tbl[h];
            const limit = i > SDEFL_WIN_SIZ ? i - SDEFL_WIN_SIZ : 0;

            while (p >= limit) {
                if (in_buf[p+m_len] === in_buf[i+m_len] &&
                    (in_buf[p] | (in_buf[p+1] << 8) | (in_buf[p+2] << 16)) ===
                    (in_buf[i] | (in_buf[i+1] << 8) | (in_buf[i+2] << 16))) {

                    let n = SDEFL_MIN_MATCH;
                    while(n < 258 && i + n < in_len && in_buf[p+n] === in_buf[i+n]) {
                        n++;
                    }
                    if (n > m_len) {
                        m_len = n;
                        m_off = i - p;
                    }
                }
                p = s.prv[p & (SDEFL_WIN_SIZ - 1)];
            }
            s.prv[i & (SDEFL_WIN_SIZ - 1)] = s.tbl[h];
            s.tbl[h] = i;
        }

        if (m_len >= SDEFL_MIN_MATCH) {
            if(litlen > 0) {
                s.seq.push({off: i-litlen, len: litlen});
                litlen = 0;
            }
            s.seq.push({off: -m_off, len: m_len});
            const codes = sdefl_match_codes(m_off, m_len);
            s.freq.lit[codes.lcode]++;
            s.freq.off[codes.dcode]++;
            i += m_len;
        } else {
            s.freq.lit[in_buf[i]]++;
            litlen++;
            i++;
        }
    }
    if(litlen > 0) {
        s.seq.push({off: i-litlen, len: litlen});
    }
    sdefl_flush(s, in_buf, true);

    return s.out_pos;
}

export function stbi_zlib_compress(buffer) {
    const s = new Sdefl();
    s.out = new Uint8Array(buffer.length * 2);

    // zlib header
    sdefl_put(s, 0x78, 8);
    sdefl_put(s, 0x01, 8);

    sdefl_compr(s, buffer);

    // adler32
    let s1 = 1, s2 = 0;
    for(let j=0; j<buffer.length; ++j) {
        s1 = (s1 + buffer[j]) % 65521;
        s2 = (s2 + s1) % 65521;
    }
    const adler = (s2 << 16) | s1;

    sdefl_put(s, adler >>> 24, 8);
    sdefl_put(s, (adler >>> 16) & 0xff, 8);
    sdefl_put(s, (adler >>> 8) & 0xff, 8);
    sdefl_put(s, adler & 0xff, 8);

    return s.out.slice(0, s.out_pos);
}
