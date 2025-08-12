import { err } from './context.js';

export function pnm_test(s) {
    s.rewind();
    const p = s.get8();
    const t = s.get8();
    s.rewind();
    return (p === 'P'.charCodeAt(0) && (t === '5'.charCodeAt(0) || t === '6'.charCodeAt(0)));
}

function pnm_get_integer(s) {
    let c = String.fromCharCode(s.get8());
    while (/\s/.test(c)) c = String.fromCharCode(s.get8());
    if (c === '#') {
        while(c !== '\n' && c !== '\r') c = String.fromCharCode(s.get8());
        return pnm_get_integer(s);
    }
    let i = 0;
    while (/\d/.test(c)) {
        i = i * 10 + (c.charCodeAt(0) - '0'.charCodeAt(0));
        c = String.fromCharCode(s.get8());
    }
    return i;
}

export function pnm_load(s, req_comp) {
    s.get8(); // P
    const type = s.get8();
    s.img_n = (type === '6'.charCodeAt(0)) ? 3 : 1;
    s.img_x = pnm_get_integer(s);
    s.img_y = pnm_get_integer(s);
    pnm_get_integer(s); // maxv

    const target = req_comp || s.img_n;
    const out = new Uint8Array(s.img_x * s.img_y * target);
    const data = new Uint8Array(s.img_x * s.img_y * s.img_n);
    s.getn(data, data.length);

    // For now, no conversion if req_comp is different
    if (target === s.img_n) {
        return { data: data, w: s.img_x, h: s.img_y, n: s.img_n };
    } else {
        return err("req_comp not supported for PNM yet", "PNM req_comp not supported");
    }
}

export function pnm_info(s, x, y, comp) {
    s.rewind();
    s.get8();
    const type = s.get8();
    comp.value = (type === '6'.charCodeAt(0)) ? 3 : 1;
    x.value = pnm_get_integer(s);
    y.value = pnm_get_integer(s);
    s.rewind();
    return 1;
}
