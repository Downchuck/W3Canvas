import { sdefl_compr } from './zlib/lz77.js';

class Sdefl {
    constructor() {
        this.bits = 0;
        this.bitcnt = 0;
        this.tbl = new Int32Array(1 << 15);
        this.prv = new Int32Array(1 << 15);
        this.seq_cnt = 0;
        this.seq = [];
        this.freq = { lit: new Uint32Array(288), off: new Uint32Array(32) };
        this.cod = {
            word: { lit: new Uint32Array(288), off: new Uint32Array(32) },
            len: { lit: new Uint8Array(288), off: new Uint8Array(32) }
        };
    }
}

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

    align_to_byte() {
        if(this.bitcnt > 0) {
            this.buffer[this.pos++] = this.bits & 0xFF;
        }
        this.bits = 0;
        this.bitcnt = 0;
    }
}


function sdefl_adler32(adler32, data, in_len) {
    const ADLER_MOD = 65521;
    let s1 = adler32 & 0xffff;
    let s2 = (adler32 >> 16) & 0xffff;
    let i = 0;
    while(i < in_len) {
        const blk_len = Math.min(in_len - i, 5552);
        for(let j=0; j<blk_len; ++j) { s1 += data[i+j]; s2 += s1; }
        s1 %= ADLER_MOD; s2 %= ADLER_MOD;
        i += blk_len;
    }
    return (s2 << 16) | s1;
}

function zsdeflate(s, out, input, n, lvl) {
    const SDEFL_ADLER_INIT = 1;
    const bb = new BitBuffer(out);
    bb.put(0x78, 8); bb.put(0x01, 8);

    const len = sdefl_compr(s, out.subarray(bb.pos), input, n, lvl);
    bb.pos += len;

    const a = sdefl_adler32(SDEFL_ADLER_INIT, input, n);
    bb.align_to_byte();
    bb.buffer[bb.pos++] = (a >> 24) & 0xFF; bb.buffer[bb.pos++] = (a >> 16) & 0xFF;
    bb.buffer[bb.pos++] = (a >> 8) & 0xFF; bb.buffer[bb.pos++] = a & 0xFF;
    return bb.pos;
}

export function stbi_zlib_compress(data, data_len, out_len, quality) {
    const s = new Sdefl();
    const out = new Uint8Array(data_len + 1024);
    const len = zsdeflate(s, out, data, data_len, quality);
    out_len.value = len;
    return out.slice(0, len);
}
