import { err } from './context.js';

export function psd_test(s) {
    s.rewind();
    const r = s.get32be() === 0x38425053;
    s.rewind();
    return r;
}

function psd_decode_rle(s, p, pixelCount) {
    let count = 0;
    let p_off = 0;
    while (count < pixelCount) {
        let len = s.get8();
        if (len === 128) {
            // no-op
        } else if (len < 128) {
            len++;
            if (count + len > pixelCount) return 0;
            for (let i = 0; i < len; ++i) {
                p[p_off] = s.get8();
                p_off += 4;
            }
            count += len;
        } else if (len > 128) {
            len = 257 - len;
            if (count + len > pixelCount) return 0;
            const val = s.get8();
            for (let i = 0; i < len; ++i) {
                p[p_off] = val;
                p_off += 4;
            }
            count += len;
        }
    }
    return 1;
}

export function psd_load(s, req_comp) {
    if (s.get32be() !== 0x38425053) return err("not PSD", "Corrupt PSD");
    if (s.get16be() !== 1) return err("wrong version", "Unsupported version of PSD");
    s.skip(6);
    const channelCount = s.get16be();
    if (channelCount < 0 || channelCount > 16) return err("wrong channel count", "Unsupported number of channels in PSD");
    s.img_y = s.get32be();
    s.img_x = s.get32be();
    const depth = s.get16be();
    if (depth !== 8) return err("unsupported bit depth", "PSD bit depth is not 8 bit");
    if (s.get16be() !== 3) return err("wrong color format", "PSD is not in RGB color format");
    s.skip(s.get32be()); // mode data
    s.skip(s.get32be()); // image resources
    s.skip(s.get32be()); // reserved
    const compression = s.get16be();
    if (compression > 1) return err("bad compression", "PSD has an unknown compression format");

    const out = new Uint8Array(4 * s.img_x * s.img_y);
    const pixelCount = s.img_x * s.img_y;

    if (compression) {
        s.skip(s.img_y * channelCount * 2); // skip RLE row lengths
        for (let channel = 0; channel < 4; channel++) {
            if (channel >= channelCount) {
                for (let i = 0; i < pixelCount; ++i) out[i * 4 + channel] = (channel === 3 ? 255 : 0);
            } else {
                if (!psd_decode_rle(s, out.subarray(channel), pixelCount)) {
                    return err("corrupt", "bad RLE data");
                }
            }
        }
    } else {
        // Uncompressed
        for (let channel = 0; channel < 4; channel++) {
            if (channel >= channelCount) {
                for (let i = 0; i < pixelCount; ++i) out[i * 4 + channel] = (channel === 3 ? 255 : 0);
            } else {
                for (let i = 0; i < pixelCount; ++i) out[i * 4 + channel] = s.get8();
            }
        }
    }
    return { data: out, w: s.img_x, h: s.img_y, n: 4 };
}

export function psd_info(s, x, y, comp) {
    s.rewind();
    if (s.get32be() !== 0x38425053) { s.rewind(); return 0; }
    if (s.get16be() !== 1) { s.rewind(); return 0; }
    s.skip(6);
    const channelCount = s.get16be();
    if (channelCount < 0 || channelCount > 16) { s.rewind(); return 0; }
    y.value = s.get32be();
    x.value = s.get32be();
    if (s.get16be() !== 8) { s.rewind(); return 0; }
    if (s.get16be() !== 3) { s.rewind(); return 0; }
    comp.value = 4;
    s.rewind();
    return 1;
}
