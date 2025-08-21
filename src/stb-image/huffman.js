// Huffman coding implementation for DEFLATE.

const SINFL_HUF_CNT = 288 + 32;
const SINFL_HFAST_BITS = 10;
const SINFL_HFAST_SIZE = (1 << SINFL_HFAST_BITS);
const SINFL_HFAST_MASK = (SINFL_HFAST_SIZE - 1);

export class HuffTable {
    constructor() {
        this.fast = new Uint16Array(SINFL_HFAST_SIZE);
        this.list = new Uint16Array(SINFL_HUF_CNT);
        this.bits = new Uint8Array(SINFL_HUF_CNT);
    }
}

export function rev_bits(v, bits) {
    v = ((v & 0x5555) << 1) | ((v & 0xAAAA) >>> 1);
    v = ((v & 0x3333) << 2) | ((v & 0xCCCC) >>> 2);
    v = ((v & 0x0F0F) << 4) | ((v & 0xF0F0) >>> 4);
    v = ((v & 0x00FF) << 8) | ((v & 0xFF00) >>> 8);
    return v >>> (16 - bits);
}

export function build_huff_table(h, bit_len, cnt) {
    const bl_count = new Uint16Array(16);
    for (let i = 0; i < cnt; ++i) {
        bl_count[bit_len[i]]++;
    }

    const next_code = new Uint16Array(16);
    let code = 0;
    bl_count[0] = 0;
    for (let i = 1; i < 16; i++) {
        code = (code + bl_count[i - 1]) << 1;
        next_code[i] = code;
    }

    for (let i = 0; i < cnt; i++) {
        let len = bit_len[i];
        if (len !== 0) {
            let code = next_code[len]++;
            let rev_code = rev_bits(code, len);
            h.bits[i] = len;
            h.list[i] = rev_code;

            if (len <= SINFL_HFAST_BITS) {
                let j = rev_code;
                let step = 1 << len;
                while (j < SINFL_HFAST_SIZE) {
                    h.fast[j] = (i << 4) | len;
                    j += step;
                }
            }
        }
    }
}

export class HuffmanDecoder {
    constructor(state, table) {
        this.state = state;
        this.table = table;
    }

    decode() {
        const s = this.state;
        const h = this.table;

        if (s.bit_len < 16) {
             while (s.bit_len < 16) {
                if (s.in_off >= s.in_len) break;
                const byte = s.in_buffer[s.in_off++];
                s.bits |= byte << s.bit_len;
                s.bit_len += 8;
            }
        }

        let code = s.bits;
        let fast = h.fast[code & SINFL_HFAST_MASK];
        if (fast) {
            let len = fast & 15;
            if (s.bit_len < len) return -1;
            s.bits >>>= len;
            s.bit_len -= len;
            return fast >> 4;
        }

        let i = 0;
        let len = SINFL_HFAST_BITS + 1;
        do {
            let code_prefix = code & ((1 << len) - 1);
            for (; i < SINFL_HUF_CNT; ++i) {
                if (h.bits[i] !== len) continue;
                if (h.list[i] === code_prefix) {
                    s.bits >>>= len;
                    s.bit_len -= len;
                    return i;
                }
            }
        } while (++len < 16);

        return -1;
    }
}
