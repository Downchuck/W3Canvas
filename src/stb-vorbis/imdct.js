// These functions are a direct port of the highly optimized IMDCT code from stb_vorbis.c

export function imdct_step3_iter0_loop(lim, e, i_off, k_off, A) {
    let ee0 = i_off;
    let ee2 = i_off + k_off;
    let A_off = 0;

    for (let i = lim; i > 0; --i) {
        let k00_20, k01_21;
        k00_20  = e[ee0] - e[ee2];
        k01_21  = e[ee0 - 1] - e[ee2 - 1];
        e[ee0] += e[ee2];
        e[ee0 - 1] += e[ee2 - 1];
        e[ee2] = k00_20 * A[A_off] - k01_21 * A[A_off + 1];
        e[ee2 - 1] = k01_21 * A[A_off] + k00_20 * A[A_off + 1];
        A_off += 8;

        k00_20  = e[ee0 - 2] - e[ee2 - 2];
        k01_21  = e[ee0 - 3] - e[ee2 - 3];
        e[ee0 - 2] += e[ee2 - 2];
        e[ee0 - 3] += e[ee2 - 3];
        e[ee2 - 2] = k00_20 * A[A_off] - k01_21 * A[A_off + 1];
        e[ee2 - 3] = k01_21 * A[A_off] + k00_20 * A[A_off + 1];
        A_off += 8;

        k00_20  = e[ee0 - 4] - e[ee2 - 4];
        k01_21  = e[ee0 - 5] - e[ee2 - 5];
        e[ee0 - 4] += e[ee2 - 4];
        e[ee0 - 5] += e[ee2 - 5];
        e[ee2 - 4] = k00_20 * A[A_off] - k01_21 * A[A_off + 1];
        e[ee2 - 5] = k01_21 * A[A_off] + k00_20 * A[A_off + 1];
        A_off += 8;

        k00_20  = e[ee0 - 6] - e[ee2 - 6];
        k01_21  = e[ee0 - 7] - e[ee2 - 7];
        e[ee0 - 6] += e[ee2 - 6];
        e[ee0 - 7] += e[ee2 - 7];
        e[ee2 - 6] = k00_20 * A[A_off] - k01_21 * A[A_off + 1];
        e[ee2 - 7] = k01_21 * A[A_off] + k00_20 * A[A_off + 1];
        A_off += 8;

        ee0 -= 8;
        ee2 -= 8;
    }
}

export function imdct_step3_inner_r_loop(lim, e, d0, k_off, A, k1) {
    let A_off = 0;
    let e0 = d0;
    let e2 = e0 + k_off;

    for (let i = lim >> 2; i > 0; --i) {
        let k00_20 = e[e0 - 0] - e[e2 - 0];
        let k01_21 = e[e0 - 1] - e[e2 - 1];
        e[e0 - 0] += e[e2 - 0];
        e[e0 - 1] += e[e2 - 1];
        e[e2 - 0] = k00_20 * A[A_off] - k01_21 * A[A_off + 1];
        e[e2 - 1] = k01_21 * A[A_off] + k00_20 * A[A_off + 1];
        A_off += k1;

        k00_20 = e[e0 - 2] - e[e2 - 2];
        k01_21 = e[e0 - 3] - e[e2 - 3];
        e[e0 - 2] += e[e2 - 2];
        e[e0 - 3] += e[e2 - 3];
        e[e2 - 2] = k00_20 * A[A_off] - k01_21 * A[A_off + 1];
        e[e2 - 3] = k01_21 * A[A_off] + k00_20 * A[A_off + 1];
        A_off += k1;

        k00_20 = e[e0 - 4] - e[e2 - 4];
        k01_21 = e[e0 - 5] - e[e2 - 5];
        e[e0 - 4] += e[e2 - 4];
        e[e0 - 5] += e[e2 - 5];
        e[e2 - 4] = k00_20 * A[A_off] - k01_21 * A[A_off + 1];
        e[e2 - 5] = k01_21 * A[A_off] + k00_20 * A[A_off + 1];
        A_off += k1;

        k00_20 = e[e0 - 6] - e[e2 - 6];
        k01_21 = e[e0 - 7] - e[e2 - 7];
        e[e0 - 6] += e[e2 - 6];
        e[e0 - 7] += e[e2 - 7];
        e[e2 - 6] = k00_20 * A[A_off] - k01_21 * A[A_off + 1];
        e[e2 - 7] = k01_21 * A[A_off] + k00_20 * A[A_off + 1];
        A_off += k1;

        e0 -= 8;
        e2 -= 8;
    }
}

export function imdct_step3_inner_s_loop(n, e, i_off, k_off, A, a_off, k0) {
    const A0 = A[0], A1 = A[1];
    const A2 = A[a_off], A3 = A[a_off + 1];
    const A4 = A[a_off * 2], A5 = A[a_off * 2 + 1];
    const A6 = A[a_off * 3], A7 = A[a_off * 3 + 1];

    let ee0 = i_off;
    let ee2 = ee0 + k_off;

    for (let i = n; i > 0; --i) {
        let k00 = e[ee0] - e[ee2];
        let k11 = e[ee0 - 1] - e[ee2 - 1];
        e[ee0] += e[ee2];
        e[ee0 - 1] += e[ee2 - 1];
        e[ee2] = k00 * A0 - k11 * A1;
        e[ee2 - 1] = k11 * A0 + k00 * A1;

        k00 = e[ee0 - 2] - e[ee2 - 2];
        k11 = e[ee0 - 3] - e[ee2 - 3];
        e[ee0 - 2] += e[ee2 - 2];
        e[ee0 - 3] += e[ee2 - 3];
        e[ee2 - 2] = k00 * A2 - k11 * A3;
        e[ee2 - 3] = k11 * A2 + k00 * A3;

        k00 = e[ee0 - 4] - e[ee2 - 4];
        k11 = e[ee0 - 5] - e[ee2 - 5];
        e[ee0 - 4] += e[ee2 - 4];
        e[ee0 - 5] += e[ee2 - 5];
        e[ee2 - 4] = k00 * A4 - k11 * A5;
        e[ee2 - 5] = k11 * A4 + k00 * A5;

        k00 = e[ee0 - 6] - e[ee2 - 6];
        k11 = e[ee0 - 7] - e[ee2 - 7];
        e[ee0 - 6] += e[ee2 - 6];
        e[ee0 - 7] += e[ee2 - 7];
        e[ee2 - 6] = k00 * A6 - k11 * A7;
        e[ee2 - 7] = k11 * A6 + k00 * A7;

        ee0 -= k0;
        ee2 -= k0;
    }
}

export function iter_54(z, z_off) {
    const k00 = z[z_off] - z[z_off - 4];
    const y0 = z[z_off] + z[z_off - 4];
    const y2 = z[z_off - 2] + z[z_off - 6];
    const k22 = z[z_off - 2] - z[z_off - 6];

    z[z_off] = y0 + y2;
    z[z_off - 2] = y0 - y2;

    const k33 = z[z_off - 3] - z[z_off - 7];
    z[z_off - 4] = k00 + k33;
    z[z_off - 6] = k00 - k33;

    const k11 = z[z_off - 1] - z[z_off - 5];
    const y1 = z[z_off - 1] + z[z_off - 5];
    const y3 = z[z_off - 3] + z[z_off - 7];
    z[z_off - 1] = y1 + y3;
    z[z_off - 3] = y1 - y3;
    z[z_off - 5] = k11 - k22;
    z[z_off - 7] = k11 + k22;
}

export function imdct_step3_inner_s_loop_ld654(n, e, i_off, A, base_n) {
    const a_off = base_n >> 3;
    const A2 = A[a_off];
    let z_off = i_off;
    const base = z_off - 16 * n;

    while (z_off > base) {
        let k00 = e[z_off] - e[z_off - 8];
        let k11 = e[z_off - 1] - e[z_off - 9];
        let l00 = e[z_off - 2] - e[z_off - 10];
        let l11 = e[z_off - 3] - e[z_off - 11];
        e[z_off] += e[z_off - 8];
        e[z_off - 1] += e[z_off - 9];
        e[z_off - 2] += e[z_off - 10];
        e[z_off - 3] += e[z_off - 11];
        e[z_off - 8] = k00;
        e[z_off - 9] = k11;
        e[z_off - 10] = (l00 + l11) * A2;
        e[z_off - 11] = (l11 - l00) * A2;

        k00 = e[z_off - 4] - e[z_off - 12];
        k11 = e[z_off - 5] - e[z_off - 13];
        l00 = e[z_off - 6] - e[z_off - 14];
        l11 = e[z_off - 7] - e[z_off - 15];
        e[z_off - 4] += e[z_off - 12];
        e[z_off - 5] += e[z_off - 13];
        e[z_off - 6] += e[z_off - 14];
        e[z_off - 7] += e[z_off - 15];
        e[z_off - 12] = k11;
        e[z_off - 13] = -k00;
        e[z_off - 14] = (l11 - l00) * A2;
        e[z_off - 15] = (l00 + l11) * -A2;

        iter_54(e, z_off);
        iter_54(e, z_off - 8);
        z_off -= 16;
    }
}
