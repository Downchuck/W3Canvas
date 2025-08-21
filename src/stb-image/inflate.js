// A port of the sinfl.h single-file DEFLATE decompressor.

import { HuffTable, build_huff_table, HuffmanDecoder } from './huffman.js';

export const SINFL_LEN_CNT = 288; // For testing
export const SINFL_DST_CNT = 32; // For testing
const SINFL_HUF_CNT = (SINFL_LEN_CNT + SINFL_DST_CNT);
const SINFL_MAX_SB_CNT = 19;

const SINFL_LEN_OFF = 257;
const SINFL_LEN_BITS = 5;
const SINFL_DST_OFF = 1;
const SINFL_DST_BITS = 5;
const SINFL_SB_OFF = 4;
const SINFL_SB_BITS = 3;

export class InflateState { // Export for testing
    constructor(in_buffer, out_buffer) {
        this.in_buffer = in_buffer;
        this.in_len = in_buffer.length;
        this.in_off = 0;

        this.out_buffer = out_buffer;
        this.out_cap = out_buffer.length;
        this.out_off = 0;

        this.bits = 0;
        this.bit_len = 0;

        this.lt = new HuffTable();
        this.dst = new HuffTable();

        this.last = 0;
        this.stop = 0;
    }
}

const sb_ord = new Uint8Array([16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15]);
const len_ext = new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 0]);
const len_base = new Uint16Array([3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 15, 17, 19, 23, 27, 31, 35, 43, 51, 59, 67, 83, 99, 115, 131, 163, 195, 227, 258]);
const dst_ext = new Uint8Array([0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13]);
const dst_base = new Uint16Array([1, 2, 3, 4, 5, 7, 9, 13, 17, 25, 33, 49, 65, 97, 129, 193, 257, 385, 513, 769, 1025, 1537, 2049, 3073, 4097, 6145, 8193, 12289, 16385, 24577]);
export const len_bits = new Uint8Array([8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,8,8,8,8,8,8,8,8]); // For testing
const dst_bits = new Uint8Array([5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5]);

InflateState.prototype.get_bits = function(num) {
    if (this.bit_len < num) {
        while (this.bit_len < num) {
            const byte = (this.in_off < this.in_len) ? this.in_buffer[this.in_off++] : 0;
            this.bits |= byte << this.bit_len;
            this.bit_len += 8;
        }
    }
    const res = this.bits & ((1 << num) - 1);
    this.bits >>>= num;
    this.bit_len -= num;
    return res;
}

InflateState.prototype.huff_decode = function(h) {
    const decoder = new HuffmanDecoder(this, h);
    return decoder.decode();
}

InflateState.prototype.zlib_header = function() {
    const cmf = this.get_bits(8);
    const flg = this.get_bits(8);
}

InflateState.prototype.decode_block = function(lt, dst) {
    while (true) {
        let val = this.huff_decode(lt);
        if (val < 0) { this.stop = 1; return; }
        if (val < 256) {
            if (this.out_off < this.out_cap) {
                this.out_buffer[this.out_off] = val;
            }
            this.out_off++;
        } else if (val > 256) {
            val -= SINFL_LEN_OFF;
            let len = len_base[val] + this.get_bits(len_ext[val]);
            let dst_val = this.huff_decode(dst);
            if (dst_val < 0) { this.stop = 1; return; }
            let dst = dst_base[dst_val] + this.get_bits(dst_ext[dst_val]);

            let src = this.out_off - dst;
            while (len-- > 0) {
                if (this.out_off < this.out_cap) {
                    this.out_buffer[this.out_off] = this.out_buffer[src];
                }
                this.out_off++;
                src++;
            }
        } else { // val === 256
            break; // End of block
        }
    }
}

InflateState.prototype.fixed = function() {
    build_huff_table(this.lt, len_bits, SINFL_LEN_CNT);
    build_huff_table(this.dst, dst_bits, SINFL_DST_CNT);
    console.log("Decoding fixed block");
    this.decode_block(this.lt, this.dst);
}

InflateState.prototype.build_sym_table = function() {
    const sb = new HuffTable();
    const bit_len = new Uint8Array(SINFL_HUF_CNT);
    const hlit = this.get_bits(5) + 257;
    const hdist = this.get_bits(5) + 1;
    const hclen = this.get_bits(4) + 4;

    for (let i = 0; i < hclen; i++) {
        const len = this.get_bits(3);
        bit_len[sb_ord[i]] = len;
    }

    build_huff_table(sb, bit_len, SINFL_MAX_SB_CNT);

    let n = 0;
    while (n < (hlit + hdist)) {
        let val = this.huff_decode(sb);
        if (val < 16) {
            bit_len[n++] = val;
        } else {
            let len = 0;
            let cnt = 0;
            if (val === 16) {
                len = bit_len[n - 1];
                cnt = 3 + this.get_bits(2);
            } else if (val === 17) {
                cnt = 3 + this.get_bits(3);
            } else if (val === 18) {
                cnt = 11 + this.get_bits(7);
            }
            while (cnt-- > 0) {
                bit_len[n++] = len;
            }
        }
    }
    build_huff_table(this.lt, bit_len, hlit);
    build_huff_table(this.dst, bit_len.subarray(hlit), hdist);
}

InflateState.prototype.dynamic = function() {
    this.build_sym_table();
    this.decode_block(this.lt, this.dst);
}

// Main entry point
export function inflate(in_buffer, out_buffer, parse_header = true) {
    const s = new InflateState(in_buffer, out_buffer);
    if (parse_header) {
        s.zlib_header();
    }

    while (!s.stop) {
        if (s.last) {
            s.stop = 1;
        } else {
            s.last = s.get_bits(1);
            const type = s.get_bits(2);
            switch (type) {
                case 0: // uncompressed
                    s.stop = 1;
                    break;
                case 1: // fixed
                    s.fixed();
                    break;
                case 2: // dynamic
                    s.dynamic();
                    break;
                default:
                    s.stop = 1;
                    break;
            }
        }
    }

    return s.out_off;
}
