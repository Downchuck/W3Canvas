// Javascript port of https://github.com/vurtun/lib/blob/master/sdefl.h

const SDEFL_MAX_OFF = (1 << 15);
const SDEFL_WIN_SIZ = SDEFL_MAX_OFF;
const SDEFL_WIN_MSK = (SDEFL_WIN_SIZ - 1);

const SDEFL_HASH_BITS = 15;
const SDEFL_HASH_SIZ = (1 << SDEFL_HASH_BITS);
const SDEFL_HASH_MSK = (SDEFL_HASH_SIZ - 1);

const SDEFL_MIN_MATCH = 4;
const SDEFL_BLK_MAX = (256 * 1024);
const SDEFL_MAX_MATCH = 258;
const SDEFL_NIL = -1;
const SDEFL_RAW_BLK_SIZE = 65535;

const SDEFL_SYM_MAX = 288;
const SDEFL_OFF_MAX = 32;
const SDEFL_PRE_MAX = 19;
const SDEFL_LIT_LEN_CODES = 14;
const SDEFL_OFF_CODES = 15;
const SDEFL_PRE_CODES = 7;
const SDEFL_EOB = 256;

const SDEFL_MAX_CODE_LEN = 15;
const SDEFL_SYM_BITS = 10;
const SDEFL_SYM_MSK = (1 << SDEFL_SYM_BITS) - 1;

class BitBuffer {
    constructor(buffer) {
        this.buffer = buffer;
        this.bits = 0;
        this.bitcnt = 0;
        this.pos = 0;
    }

    put(code, bitcnt) {
        this.bits |= (code << this.bitcnt);
        this.bitcnt += bitcnt;
        while (this.bitcnt >= 8) {
            this.buffer[this.pos++] = this.bits & 0xFF;
            this.bits >>= 8;
            this.bitcnt -= 8;
        }
    }

    put16(x) {
        this.buffer[this.pos++] = x & 0xff;
        this.buffer[this.pos++] = (x >> 8) & 0xff;
    }

    align_to_byte() {
        if(this.bitcnt > 0) {
            this.buffer[this.pos++] = this.bits & 0xFF;
        }
        this.bits = 0;
        this.bitcnt = 0;
    }
}

class Sdefl {
    constructor() {
        this.bits = 0;
        this.bitcnt = 0;
        this.tbl = new Int32Array(SDEFL_HASH_SIZ);
        this.prv = new Int32Array(SDEFL_WIN_SIZ);
        this.seq_cnt = 0;
        this.seq = [];
        this.freq = { lit: new Uint32Array(SDEFL_SYM_MAX), off: new Uint32Array(SDEFL_OFF_MAX) };
        this.cod = {
            word: { lit: new Uint32Array(SDEFL_SYM_MAX), off: new Uint32Array(SDEFL_OFF_MAX) },
            len: { lit: new Uint8Array(SDEFL_SYM_MAX), off: new Uint8Array(SDEFL_OFF_MAX) }
        };
    }
}

function sdefl_uload32(p, i) { return p[i] | (p[i+1] << 8) | (p[i+2] << 16) | (p[i+3] << 24); }
function sdefl_hash32(p, i) { return (((sdefl_uload32(p, i) * 0x9E377989) >> (32 - SDEFL_HASH_BITS)) >>> 0); }

function sdefl_put(bb, code, bitcnt) {
    bb.bits |= (code << bb.bitcnt);
    bb.bitcnt += bitcnt;
    while (bb.bitcnt >= 8) {
        bb.buffer[bb.pos++] = bb.bits & 0xFF;
        bb.bits >>= 8;
        bb.bitcnt -= 8;
    }
}

function sdefl_heap_sub(A, len, sub) {
    let p = sub;
    const v = A[sub];
    while (true) {
        let c = p << 1;
        if (c > len) break;
        if (c < len && A[c + 1] > A[c]) c++;
        if (v >= A[c]) break;
        A[p] = A[c];
        p = c;
    }
    A[p] = v;
}

function sdefl_heap_array(A, len) {
    for (let sub = Math.floor(len / 2); sub >= 0; sub--) sdefl_heap_sub(A, len-1, sub);
}

function sdefl_heap_sort(A, n) {
    sdefl_heap_array(A, n);
    while (n >= 2) {
        const tmp = A[n - 1];
        A[n - 1] = A[0];
        A[0] = tmp;
        n--;
        sdefl_heap_sub(A, n, 0);
    }
}

function sdefl_sort_sym(sym_cnt, freqs, lens, sym_out) {
    const SDEFL_CNT_NUM = (n) => (((Math.floor((n)+3/4))+3)&~3);
    const cnt_num = SDEFL_CNT_NUM(sym_cnt);
    const cnts = new Uint32Array(cnt_num);
    let used_sym = 0;
    for (let sym = 0; sym < sym_cnt; sym++) cnts[Math.min(freqs[sym], cnt_num - 1)]++;
    for (let i = 1; i < cnt_num; i++) {
        const cnt = cnts[i];
        cnts[i] = used_sym;
        used_sym += cnt;
    }
    for (let sym = 0; sym < sym_cnt; sym++) {
        const freq = freqs[sym];
        if (freq) {
            const idx = Math.min(freq, cnt_num - 1);
            sym_out[cnts[idx]++] = sym | (freq << SDEFL_SYM_BITS);
        } else lens[sym] = 0;
    }
    if(cnts[cnt_num - 2] < cnts[cnt_num - 1])
        sdefl_heap_sort(sym_out.subarray(cnts[cnt_num - 2]), cnts[cnt_num - 1] - cnts[cnt_num - 2]);
    return used_sym;
}

function sdefl_build_tree(A, sym_cnt) {
    let i = 0, b = 0, e = 0;
    do {
        let m, n;
        if (i !== sym_cnt && (b === e || (A[i] >> SDEFL_SYM_BITS) <= (A[b] >> SDEFL_SYM_BITS))) m = i++; else m = b++;
        if (i !== sym_cnt && (b === e || (A[i] >> SDEFL_SYM_BITS) <= (A[b] >> SDEFL_SYM_BITS))) n = i++; else n = b++;
        const freq_shift = (A[m] & ~SDEFL_SYM_MSK) + (A[n] & ~SDEFL_SYM_MSK);
        A[m] = (A[m] & SDEFL_SYM_MSK) | (e << SDEFL_SYM_BITS);
        A[n] = (A[n] & SDEFL_SYM_MSK) | (e << SDEFL_SYM_BITS);
        A[e] = (A[e] & SDEFL_SYM_MSK) | freq_shift;
    } while (sym_cnt - ++e > 1);
}

function sdefl_gen_len_cnt(A, root, len_cnt, max_code_len) {
    for (let i = 0; i <= max_code_len; i++) len_cnt[i] = 0;
    if(root < 0) return;
    A[root] &= SDEFL_SYM_MSK;
    for (let n = root; n >= 0; n--) {
        const p = A[n] >> SDEFL_SYM_BITS;
        const pdepth = n === root ? 0 : A[p] >> SDEFL_SYM_BITS;
        const depth = pdepth + 1;
        let len = depth;
        A[n] = (A[n] & SDEFL_SYM_MSK) | (depth << SDEFL_SYM_BITS);
        if(n > root) continue;
        if (len >= max_code_len) {
            len = max_code_len;
            do len--; while (!len_cnt[len]);
        }
        len_cnt[len]--;
        len_cnt[len + 1] += 2;
    }
}

function sdefl_gen_codes(A, lens, len_cnt, max_code_word_len, sym_cnt) {
    const nxt = new Uint32Array(SDEFL_MAX_CODE_LEN + 2);
    for (let i = 0, len = max_code_word_len; len >= 1; len--) {
        const cnt = len_cnt[len];
        for(let j=0; j<cnt; ++j) lens[A[i++] & SDEFL_SYM_MSK] = len;
    }
    for (let len = 2; len <= max_code_word_len; len++) nxt[len] = (nxt[len - 1] + len_cnt[len - 1]) << 1;
    for (let sym = 0; sym < sym_cnt; sym++) A[sym] = nxt[lens[sym]]++;
}

function sdefl_rev(c, n) {
    c = ((c & 0x5555) << 1) | ((c & 0xAAAA) >> 1); c = ((c & 0x3333) << 2) | ((c & 0xCCCC) >> 2);
    c = ((c & 0x0F0F) << 4) | ((c & 0xF0F0) >> 4); c = ((c & 0x00FF) << 8) | ((c & 0xFF00) >> 8);
    return c >> (16 - n);
}

function sdefl_huff(lens, codes, freqs, num_syms, max_code_len) {
    const A = codes;
    const len_cnt = new Uint32Array(SDEFL_MAX_CODE_LEN + 2);
    const used_syms = sdefl_sort_sym(num_syms, freqs, lens, A);
    if (!used_syms) return;
    if (used_syms === 1) {
        const s = A[0] & SDEFL_SYM_MSK;
        const i = s ? s : 1;
        codes[0] = 0; lens[0] = 1;
        codes[i] = 1; lens[i] = 1;
        return;
    }
    sdefl_build_tree(A, used_syms);
    sdefl_gen_len_cnt(A, used_syms - 2, len_cnt, max_code_len);
    sdefl_gen_codes(A, lens, len_cnt, max_code_len, num_syms);
    for (let c = 0; c < num_syms; c++) {
        codes[c] = sdefl_rev(codes[c], lens[c]);
    }
}

function sdefl_precode(cnt, freqs, items, litlen, offlen) {
    let at = 0;
    let run_start = 0;
    const lens = new Uint8Array(SDEFL_SYM_MAX + SDEFL_OFF_MAX);
    for (cnt.lit = SDEFL_SYM_MAX; cnt.lit > 257; cnt.lit--) if (litlen[cnt.lit - 1]) break;
    for (cnt.off = SDEFL_OFF_MAX; cnt.off > 1; cnt.off--) if (offlen[cnt.off - 1]) break;
    const total = cnt.lit + cnt.off;
    lens.set(litlen.subarray(0, cnt.lit));
    lens.set(offlen.subarray(0, cnt.off), cnt.lit);

    do {
        const len = lens[run_start];
        let run_end = run_start;
        do run_end++; while (run_end !== total && len === lens[run_end]);
        if (!len) {
            let rem = run_end - run_start;
            while(rem >= 11) { const n = Math.min(rem - 11, 0x7f); freqs[18]++; items[at++] = 18 | (n << 5); rem -= 11 + n; }
            if (rem >= 3) { const n = Math.min(rem - 3, 0x7); freqs[17]++; items[at++] = 17 | (n << 5); rem -= 3 + n; }
        } else if ((run_end - run_start) >= 4) {
            freqs[len]++; items[at++] = len; run_start++;
            do { const n = Math.min((run_end - run_start) - 3, 0x03); items[at++] = 16 | (n << 5); run_start += 3+n; freqs[16]++; } while((run_end-run_start) >= 3);
        }
        while (run_start !== run_end) { freqs[len]++; items[at++] = len; run_start++; }
    } while (run_start !== total);
    cnt.items = at;
}

function sdefl_match_codes(cod, dist, len) {
    const dxmax = [0,6,12,24,48,96,192,384,768,1536,3072,6144,12288,24576];
    const lslot = [0,0,0,0,1,2,3,4,5,6,7,8,8,9,9,10,10,11,11,12,12,12,12,13,13,13,13,14,14,14,14,15,15,15,15,16,16,16,16,16,16,16,16,17,17,17,17,17,17,17,17,18,18,18,18,18,18,18,18,19,19,19,19,19,19,19,19,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,21,21,21,21,21,21,21,21,21,21,21,21,21,21,21,21,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,27,28];
    cod.ls = lslot[len]; cod.lc = 257 + cod.ls;
    const npow2 = 1 << (Math.ceil(Math.log2(dist)) + 1);
    cod.dx = Math.floor(Math.log2(npow2 >> 2));
    cod.dc = cod.dx ? ((cod.dx + 1) << 1) + (dist > dxmax[cod.dx]?1:0) : dist-1;
}

function sdefl_match(bb, s, dist, len) {
    const lxn = [0,0,0,0,0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,0];
    const lmin = [3,4,5,6,7,8,9,10,11,13,15,17,19,23,27,31,35,43,51,59,67,83,99,115,131,163,195,227,258];
    const dmin = [1,2,3,4,5,7,9,13,17,25,33,49,65,97,129,193,257,385,513,769,1025,1537,2049,3073,4097,6145,8193,12289,16385,24577];
    const cod = {};
    sdefl_match_codes(cod, dist, len);
    sdefl_put(bb, s.cod.word.lit[cod.lc], s.cod.len.lit[cod.lc]);
    sdefl_put(bb, len - lmin[cod.ls], lxn[cod.ls]);
    sdefl_put(bb, s.cod.word.off[cod.dc], s.cod.len.off[cod.dc]);
    sdefl_put(bb, dist - dmin[cod.dc], cod.dx);
}

function sdefl_flush(bb, s, is_last, input, blk_begin, blk_end) {
    const perm = [16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15];
    const codes = new Uint32Array(SDEFL_PRE_MAX);
    const lens = new Uint8Array(SDEFL_PRE_MAX);
    const freqs = new Uint32Array(SDEFL_PRE_MAX);
    const items = new Uint32Array(SDEFL_SYM_MAX + SDEFL_OFF_MAX);
    const symcnt = {};

    s.freq.lit[SDEFL_EOB]++;
    sdefl_huff(s.cod.len.lit, s.cod.word.lit, s.freq.lit, SDEFL_SYM_MAX, SDEFL_LIT_LEN_CODES);
    sdefl_huff(s.cod.len.off, s.cod.word.off, s.freq.off, SDEFL_OFF_MAX, SDEFL_OFF_CODES);
    sdefl_precode(symcnt, freqs, items, s.cod.len.lit, s.cod.len.off);
    sdefl_huff(lens, codes, freqs, SDEFL_PRE_MAX, SDEFL_PRE_CODES);
    let item_cnt = SDEFL_PRE_MAX;
    for (; item_cnt > 4; item_cnt--) if (lens[perm[item_cnt - 1]]) break;

    sdefl_put(bb, !!is_last, 1);
    sdefl_put(bb, 0x02, 2);
    sdefl_put(bb, symcnt.lit - 257, 5);
    sdefl_put(bb, symcnt.off - 1, 5);
    sdefl_put(bb, item_cnt - 4, 4);
    for (let i = 0; i < item_cnt; ++i) sdefl_put(bb, lens[perm[i]], 3);
    for (let i = 0; i < symcnt.items; ++i) {
        const sym = items[i] & 0x1F;
        sdefl_put(bb, codes[sym], lens[sym]);
        if (sym < 16) continue;
        if (sym === 16) sdefl_put(bb, items[i] >> 5, 2);
        else if(sym === 17) sdefl_put(bb, items[i] >> 5, 3);
        else sdefl_put(bb, items[i] >> 5, 7);
    }
    for (let i = 0; i < s.seq_cnt; ++i) {
        if (s.seq[i].off >= 0) {
            for (let j = 0; j < s.seq[i].len; ++j) {
                const c = input[s.seq[i].off + j];
                sdefl_put(bb, s.cod.word.lit[c], s.cod.len.lit[c]);
            }
        } else {
            sdefl_match(bb, s, -s.seq[i].off, s.seq[i].len);
        }
    }
    sdefl_put(bb, s.cod.word.lit[SDEFL_EOB], s.cod.len.lit[SDEFL_EOB]);

    s.freq.lit.fill(0);
    s.freq.off.fill(0);
    s.seq_cnt = 0;
}

function sdefl_fnd(m, s, chain_len, max_match, input, p, in_len) {
    let i = s.tbl[sdefl_hash32(input, p)];
    const limit = (p > SDEFL_WIN_SIZ) ? p - SDEFL_WIN_SIZ : SDEFL_NIL;

    while (i > limit) {
        if (input[i + m.len] === input[p + m.len] && sdefl_uload32(input, i) === sdefl_uload32(input, p)) {
            let n = SDEFL_MIN_MATCH;
            while (n < max_match && input[i + n] === input[p + n]) n++;
            if (n > m.len) {
                m.len = n; m.off = p - i;
                if (n === max_match) break;
            }
        }
        if (--chain_len === 0) break;
        i = s.prv[i & SDEFL_WIN_MSK];
    }
}

export function sdefl_compr(s, out, input, in_len, lvl) {
    const bb = new BitBuffer(out);
    const pref = [8,10,14,24,30,48,65,96,130];
    const max_chain = (lvl < 8) ? (1 << (lvl + 1)): (1 << 13);
    let i = 0, litlen = 0;
    for (let n = 0; n < SDEFL_HASH_SIZ; ++n) s.tbl[n] = SDEFL_NIL;

    do {
        const blk_begin = i;
        const blk_end = Math.min(i + SDEFL_BLK_MAX, in_len);
        while (i < blk_end) {
            let m = {len: 0, off: 0};
            const left = blk_end - i;
            const max_match = Math.min(left, SDEFL_MAX_MATCH);
            const nice_match = Math.min(pref[lvl], max_match);
            let run = 1, inc = 1;

            if (max_match >= SDEFL_MIN_MATCH) sdefl_fnd(m, s, max_chain, max_match, input, i, in_len);
            if (lvl >= 5 && m.len >= SDEFL_MIN_MATCH && m.len + 1 < nice_match) {
                let m2 = {len: 0, off: 0};
                sdefl_fnd(m2, s, max_chain, m.len + 1, input, i + 1, in_len);
                if(m2.len > m.len) m.len = 0;
            }
            if (m.len >= SDEFL_MIN_MATCH) {
                if (litlen) { s.seq.push({off: i - litlen, len: litlen}); litlen = 0; }
                s.seq.push({off: -m.off, len: m.len});
                const cod = {}; sdefl_match_codes(cod, m.off, m.len);
                s.freq.lit[cod.lc]++; s.freq.off[cod.dc]++;
                run = (lvl < 2 && m.len >= nice_match) ? m.len : 1;
                inc = m.len;
            } else {
                s.freq.lit[input[i]]++; litlen++;
            }
            if (in_len - (i + run) > SDEFL_MIN_MATCH) {
                for(let j=0; j<run; ++j) {
                    const h = sdefl_hash32(input, i);
                    s.prv[i&SDEFL_WIN_MSK] = s.tbl[h];
                    s.tbl[h] = i; i+=inc;
                }
            } else {
                i += run;
            }
        }
        if (litlen) s.seq.push({off: i - litlen, len: litlen});
        s.seq_cnt = s.seq.length;
        sdefl_flush(bb, s, blk_end === in_len, input, blk_begin, blk_end);
        s.seq = [];
    } while (i < in_len);

    if (bb.bitcnt) sdefl_put(bb, 0x00, 8 - bb.bitcnt);
    return bb.pos;
}
