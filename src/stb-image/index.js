import { Context, g_failure_reason } from './context.js';
import { png_test, png_load, png_info } from './png.js';
import { jpeg_test, jpeg_load, jpeg_info } from './jpeg.js';
import { bmp_test, bmp_load, bmp_info } from './bmp.js';
import { gif_test, gif_load, gif_info } from './gif.js';
import { tga_test, tga_load, tga_info } from './tga.js';
import { psd_test, psd_load, psd_info } from './psd.js';
import { pnm_test, pnm_load, pnm_info } from './pnm.js';
import { pic_test, pic_load, pic_info } from './pic.js';
import { hdr_test, hdr_load, hdr_info } from './hdr.js';

function loadImageFromMemory(buffer, req_comp) {
    const s = new Context(buffer);
    if (png_test(s)) return png_load(s, req_comp);
    s.rewind();
    if (jpeg_test(s)) return jpeg_load(s, req_comp);
    s.rewind();
    if (bmp_test(s)) return bmp_load(s, req_comp);
    s.rewind();
    if (tga_test(s)) return tga_load(s, req_comp);
    s.rewind();
    if (gif_test(s)) return gif_load(s, req_comp);
    s.rewind();
    if (psd_test(s)) return psd_load(s, req_comp);
    s.rewind();
    if (pnm_test(s)) return pnm_load(s, req_comp);
    s.rewind();
    if (pic_test(s)) return pic_load(s, req_comp);
    s.rewind();
    if (hdr_test(s)) return hdr_load(s, req_comp);
    s.rewind();
    // ... other formats
    return null;
}

function getImageInfoFromMemory(buffer) {
    const s = new Context(buffer);
    const x = {value: 0}, y = {value: 0}, comp = {value: 0};
    if (png_test(s) && png_info(s, x, y, comp)) {
        return { x: x.value, y: y.value, comp: comp.value };
    }
    s.rewind();
    if (jpeg_test(s) && jpeg_info(s, x, y, comp)) {
        return { x: x.value, y: y.value, comp: comp.value };
    }
    s.rewind();
    if (bmp_test(s) && bmp_info(s, x, y, comp)) {
        return { x: x.value, y: y.value, comp: comp.value };
    }
    s.rewind();
    if (tga_test(s) && tga_info(s, x, y, comp)) {
        return { x: x.value, y: y.value, comp: comp.value };
    }
    s.rewind();
    if (gif_test(s) && gif_info(s, x, y, comp)) {
        return { x: x.value, y: y.value, comp: comp.value };
    }
    s.rewind();
    if (psd_test(s) && psd_info(s, x, y, comp)) {
        return { x: x.value, y: y.value, comp: comp.value };
    }
    s.rewind();
    if (pnm_test(s) && pnm_info(s, x, y, comp)) {
        return { x: x.value, y: y.value, comp: comp.value };
    }
    s.rewind();
    if (pic_test(s) && pic_info(s, x, y, comp)) {
        return { x: x.value, y: y.value, comp: comp.value };
    }
    s.rewind();
    if (hdr_test(s) && hdr_info(s, x, y, comp)) {
        return { x: x.value, y: y.value, comp: comp.value };
    }
    return null;
}

function loadImageFromMemoryAsync(buffer, req_comp) {
    return new Promise((resolve, reject) => {
        try {
            const result = loadImageFromMemory(buffer, req_comp);
            if (result) {
                resolve(result);
            } else {
                reject(new Error(g_failure_reason || "Unknown error during loading"));
            }
        } catch (e) {
            reject(e);
        }
    });
}

function getImageInfoFromMemoryAsync(buffer) {
    return new Promise((resolve, reject) => {
        try {
            const result = getImageInfoFromMemory(buffer);
            if (result) {
                resolve(result);
            } else {
                reject(new Error(g_failure_reason || "Unknown error during info parsing"));
            }
        } catch (e) {
            reject(e);
        }
    });
}

export const loadImageFromMemorySync = loadImageFromMemory;
export const getImageInfoFromMemorySync = getImageInfoFromMemory;
export {
    loadImageFromMemory,
    getImageInfoFromMemory,
    loadImageFromMemoryAsync,
    getImageInfoFromMemoryAsync,
};
