import { err } from './context.js';

export function tga_test(s) {
    s.rewind();
    const id_len = s.get8();
    const color_map_type = s.get8();
    const image_type = s.get8();
    if (color_map_type > 1 || (image_type !== 1 && image_type !== 2 && image_type !== 3 && image_type !== 9 && image_type !== 10 && image_type !== 11)) {
        s.rewind();
        return 0;
    }
    s.rewind();
    return 1;
}

export function tga_load(s, req_comp) {
    const id_len = s.get8();
    const color_map_type = s.get8();
    let image_type = s.get8();

    if (color_map_type > 1) return err("unsupported TGA type", "Unsupported TGA color map type");

    s.skip(9); // Cmap spec
    s.img_x = s.get16le();
    s.img_y = s.get16le();
    if (s.img_x === 0 || s.img_y === 0) return err("bad dimensions", "TGA with 0-size dimension");

    const bpp = s.get8();
    const inverted = s.get8();

    if (bpp !== 8 && bpp !== 15 && bpp !== 16 && bpp !== 24 && bpp !== 32) return err("unsupported TGA bpp", "Unsupported TGA bpp");
    s.img_n = (bpp === 15 || bpp === 16) ? 3 : bpp / 8;

    const target = req_comp ? req_comp : s.img_n;
    const out = new Uint8Array(s.img_x * s.img_y * target);

    s.skip(id_len);
    if (color_map_type === 1) return err("paletted TGA not supported", "Paletted TGA not supported yet");

    const is_RLE = image_type > 8;
    if (is_RLE) image_type -= 8;

    if (image_type !== 1 && image_type !== 2 && image_type !== 3) return err("unsupported TGA type", "Unsupported TGA image type");

    let RLE_count = 0;
    let RLE_repeating = 0;
    let read_next_pixel = true;
    const raw_data = new Uint8Array(4);

    for (let i = 0; i < s.img_x * s.img_y; ++i) {
        if (is_RLE) {
            if (RLE_count === 0) {
                const RLE_cmd = s.get8();
                RLE_count = 1 + (RLE_cmd & 127);
                RLE_repeating = RLE_cmd >> 7;
                read_next_pixel = true;
            } else if (!RLE_repeating) {
                read_next_pixel = true;
            }
        } else {
            read_next_pixel = true;
        }

        if (read_next_pixel) {
            if (bpp === 8) {
                raw_data[0] = s.get8();
            } else if (bpp === 15 || bpp === 16) {
                const px = s.get16le();
                raw_data[2] = (px >> 10) & 31;
                raw_data[1] = (px >> 5) & 31;
                raw_data[0] = px & 31;
            } else {
                raw_data[2] = s.get8(); // B
                raw_data[1] = s.get8(); // G
                raw_data[0] = s.get8(); // R
                if (bpp === 32) raw_data[3] = s.get8();
            }
            read_next_pixel = false;
        }

        const p = out.subarray(i * target);
        if (bpp === 8) {
            p[0] = raw_data[0];
            if (target > 1) p[1] = raw_data[0];
            if (target > 2) p[2] = raw_data[0];
            if (target > 3) p[3] = 255;
        } else if (bpp === 15 || bpp === 16) {
            p[0] = (raw_data[0] * 255) / 31;
            p[1] = (raw_data[1] * 255) / 31;
            p[2] = (raw_data[2] * 255) / 31;
            if (target === 4) p[3] = 255;
        } else {
            p[0] = raw_data[0];
            p[1] = raw_data[1];
            p[2] = raw_data[2];
            if (bpp === 32) p[3] = raw_data[3];
            else if (target === 4) p[3] = 255;
        }

        if (is_RLE) --RLE_count;
    }

    if (inverted & 0x20) {
        // flip vertically
        const row_size = s.img_x * target;
        for (let j = 0; j * 2 < s.img_y; ++j) {
            const p1 = out.subarray(j * row_size, (j + 1) * row_size);
            const p2 = out.subarray((s.img_y - 1 - j) * row_size, (s.img_y - j) * row_size);
            const temp = new Uint8Array(p1);
            p1.set(p2);
            p2.set(temp);
        }
    }

    return { data: out, w: s.img_x, h: s.img_y, n: s.img_n };
}

export function tga_info(s, x, y, comp) {
    s.skip(12);
    x.value = s.get16le();
    y.value = s.get16le();
    const bpp = s.get8();
    if (bpp !== 8 && bpp !== 16 && bpp !== 24 && bpp !== 32) return 0;
    comp.value = Math.floor(bpp / 8);
    s.rewind();
    return 1;
}
