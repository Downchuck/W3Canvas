const SDEFL_WIN_SIZ = 1 << 15;
const SDEFL_HASH_BITS = 15;
const SDEFL_HASH_SIZ = 1 << SDEFL_HASH_BITS;
const SDEFL_MIN_MATCH = 4;
const SDEFL_NIL = -1;

function hash32(data, pos) {
    const n = data[pos] | (data[pos+1] << 8) | (data[pos+2] << 16) | (data[pos+3] << 24);
    return ((n * 0x9E377989) >>> (32 - SDEFL_HASH_BITS)) & (SDEFL_HASH_SIZ - 1);
}

export function sdefl_compr(s, in_buf, blk_begin, blk_end, tbl, prv) {
    s.seq = [];

    let i = blk_begin;
    while (i < blk_end) {
        let m_len = 0;
        let m_off = 0;

        if (i + SDEFL_MIN_MATCH < blk_end) {
            const h = hash32(in_buf, i);
            let p = tbl[h];
            const limit = i > SDEFL_WIN_SIZ ? i - SDEFL_WIN_SIZ : 0;

            while (p >= limit) {
                if (in_buf[p+m_len] === in_buf[i+m_len] &&
                    (in_buf[p] | (in_buf[p+1] << 8) | (in_buf[p+2] << 16)) ===
                    (in_buf[i] | (in_buf[i+1] << 8) | (in_buf[i+2] << 16))) {

                    let n = SDEFL_MIN_MATCH;
                    while(n < 258 && i + n < blk_end && in_buf[p+n] === in_buf[i+n]) {
                        n++;
                    }
                    if (n > m_len) {
                        m_len = n;
                        m_off = i - p;
                    }
                }
                p = prv[p & (SDEFL_WIN_SIZ - 1)];
            }
            prv[i & (SDEFL_WIN_SIZ - 1)] = tbl[h];
            tbl[h] = i;
        }

        if (m_len >= SDEFL_MIN_MATCH) {
            s.seq.push({ off: -m_off, len: m_len });
            i += m_len;
        } else {
            s.seq.push({ off: i - blk_begin, len: 1 });
            i++;
        }
    }
}
