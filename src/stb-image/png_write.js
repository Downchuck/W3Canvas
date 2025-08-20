// Port of stb_image_write.h's PNG writer
// Not all features are supported.

import { stbi_zlib_compress } from './zlib_write.js'; // Assuming a separate file for the zlib port

function stbiw__crc32(buffer, len) {
   const crc_table = [
      0x00000000, 0x77073096, 0xEE0E612C, 0x990951BA, 0x076DC419, 0x706AF48F, 0xE963A535, 0x9E6495A3,
      0x0eDB8832, 0x79DCB8A4, 0xE0D5E91E, 0x97D2D988, 0x09B64C2B, 0x7EB17CBD, 0xE7B82D07, 0x90BF1D91,
      0x1DB71064, 0x6AB020F2, 0xF3B97148, 0x84BE41DE, 0x1ADAD47D, 0x6DDDE4EB, 0xF4D4B551, 0x83D385C7,
      0x136C9856, 0x646BA8C0, 0xFD62F97A, 0x8A65C9EC, 0x14015C4F, 0x63066CD9, 0xFA0F3D63, 0x8D080DF5,
      0x3B6E20C8, 0x4C69105E, 0xD56041E4, 0xA2677172, 0x3C03E4D1, 0x4B04D447, 0xD20D85FD, 0xA50AB56B,
      0x35B5A8FA, 0x42B2986C, 0xDBBBC9D6, 0xACBCF940, 0x32D86CE3, 0x45DF5C75, 0xDCD60DCF, 0xABD13D59,
      0x26D930AC, 0x51DE003A, 0xC8D75180, 0xBFD06116, 0x21B4F4B5, 0x56B3C423, 0xCFBA9599, 0xB8BDA50F,
      0x2802B89E, 0x5F058808, 0xC60CD9B2, 0xB10BE924, 0x2F6F7C87, 0x58684C11, 0xC1611DAB, 0xB6662D3D,
      0x76DC4190, 0x01DB7106, 0x98D220BC, 0xEFD5102A, 0x71B18589, 0x06B6B51F, 0x9FBFE4A5, 0xE8B8D433,
      0x7807C9A2, 0x0F00F934, 0x9609A88E, 0xE10E9818, 0x7F6A0DBB, 0x086D3D2D, 0x91646C97, 0xE6635C01,
      0x6B6B51F4, 0x1C6C6162, 0x856530D8, 0xF262004E, 0x6C0695ED, 0x1B01A57B, 0x8208F4C1, 0xF50FC457,
      0x65B0D9C6, 0x12B7E950, 0x8BBEB8EA, 0xFCB9887C, 0x62DD1DDF, 0x15DA2D49, 0x8CD37CF3, 0xFBD44C65,
      0x4DB26158, 0x3AB551CE, 0xA3BC0074, 0xD4BB30E2, 0x4ADFA541, 0x3DD895D7, 0xA4D1C46D, 0xD3D6F4FB,
      0x4369E96A, 0x346ED9FC, 0xAD678846, 0xDA60B8D0, 0x44042D73, 0x33031DE5, 0xAA0A4C5F, 0xDD0D7CC9,
      0x5005713C, 0x270241AA, 0xBE0B1010, 0xC90C2086, 0x5768B525, 0x206F85B3, 0xB966D409, 0xCE61E49F,
      0x5EDEF90E, 0x29D9C998, 0xB0D09822, 0xC7D7A8B4, 0x59B33D17, 0x2EB40D81, 0xB7BD5C3B, 0xC0BA6CAD,
      0xEDB88320, 0x9ABFB3B6, 0x03B6E20C, 0x74B1D29A, 0xEAD54739, 0x9DD277AF, 0x04DB2615, 0x73DC1683,
      0xE3630B12, 0x94643B84, 0x0D6D6A3E, 0x7A6A5AA8, 0xE40ECF0B, 0x9309FF9D, 0x0A00AE27, 0x7D079EB1,
      0xF00F9344, 0x8708A3D2, 0x1E01F268, 0x6906C2FE, 0xF762575D, 0x806567CB, 0x196C3671, 0x6E6B06E7,
      0xFED41B76, 0x89D32BE0, 0x10DA7A5A, 0x67DD4ACC, 0xF9B9DF6F, 0x8EBEEFF9, 0x17B7BE43, 0x60B08ED5,
      0xD6D6A3E8, 0xA1D1937E, 0x38D8C2C4, 0x4FDFF252, 0xD1BB67F1, 0xA6BC5767, 0x3FB506DD, 0x48B2364B,
      0xD80D2BDA, 0xAF0A1B4C, 0x36034AF6, 0x41047A60, 0xDF60EFC3, 0xA867DF55, 0x316E8EEF, 0x4669BE79,
      0xCB61B38C, 0xBC66831A, 0x256FD2A0, 0x5268E236, 0xCC0C7795, 0xBB0B4703, 0x220216B9, 0x5505262F,
      0xC5BA3BBE, 0xB2BD0B28, 0x2BB45A92, 0x5CB36A04, 0xC2D7FFA7, 0xB5D0CF31, 0x2CD99E8B, 0x5BDEAE1D,
      0x9B64C2B0, 0xEC63F226, 0x756AA39C, 0x026D930A, 0x9C0906A9, 0xEB0E363F, 0x72076785, 0x05005713,
      0x95BF4A82, 0xE2B87A14, 0x7BB12BAE, 0x0CB61B38, 0x92D28E9B, 0xE5D5BE0D, 0x7CDCEFB7, 0x0BDBDF21,
      0x86D3D2D4, 0xF1D4E242, 0x68DDB3F8, 0x1FDA836E, 0x81BE16CD, 0xF6B9265B, 0x6FB077E1, 0x18B74777,
      0x88085AE6, 0xFF0F6A70, 0x66063BCA, 0x11010B5C, 0x8F659EFF, 0xF862AE69, 0x616BFFD3, 0x166CCF45,
      0xA00AE278, 0xD70DD2EE, 0x4E048354, 0x3903B3C2, 0xA7672661, 0xD06016F7, 0x4969474D, 0x3E6E77DB,
      0xAED16A4A, 0xD9D65ADC, 0x40DF0B66, 0x37D83BF0, 0xA9BCAE53, 0xDEBB9EC5, 0x47B2CF7F, 0x30B5FFE9,
      0xBDBDF21C, 0xCABAC28A, 0x53B39330, 0x24B4A3A6, 0xBAD03605, 0xCDD70693, 0x54DE5729, 0x23D967BF,
      0xB3667A2E, 0xC4614AB8, 0x5D681B02, 0x2A6F2B94, 0xB40BBE37, 0xC30C8EA1, 0x5A05DF1B, 0x2D02EF8D
   ];

   let crc = ~0;
   for (let i = 0; i < len; ++i)
      crc = (crc >>> 8) ^ crc_table[buffer[i] ^ (crc & 0xff)];
   return ~crc;
}

function stbiw__wpcrc(data, chunk_data) {
   const crc = stbiw__crc32(chunk_data, chunk_data.length);
   stbiw__wp32(data, crc);
}

const UCHAR = (x) => x & 0xff;

function stbiw__wp32(data, v) {
    data.push(UCHAR(v >> 24));
    data.push(UCHAR(v >> 16));
    data.push(UCHAR(v >> 8));
    data.push(UCHAR(v));
}

function stbiw__wptag(data, s) {
    data.push(s.charCodeAt(0));
    data.push(s.charCodeAt(1));
    data.push(s.charCodeAt(2));
    data.push(s.charCodeAt(3));
}

function stbiw__paeth(a, b, c) {
   const p = a + b - c;
   const pa = Math.abs(p - a);
   const pb = Math.abs(p - b);
   const pc = Math.abs(p - c);
   if (pa <= pb && pa <= pc) return a;
   if (pb <= pc) return b;
   return c;
}

function stbiw__encode_png_line(pixels, stride_bytes, width, height, y, n, filter_type, line_buffer) {
   const mapping = [0, 1, 2, 3, 4];
   const firstmap = [0, 1, 0, 5, 6];
   const mymap = (y !== 0) ? mapping : firstmap;
   const type = mymap[filter_type];
   const z = pixels.subarray(y * stride_bytes);
   const signed_stride = stride_bytes; // Simplified: not handling vertical flip

    // first loop isn't optimized since it's just one pixel
    for (let i = 0; i < n; ++i) {
        switch (type) {
            case 1: line_buffer[i] = z[i]; break;
            case 2: line_buffer[i] = z[i] - (y > 0 ? z[i - signed_stride] : 0); break;
            case 3: line_buffer[i] = z[i] - (y > 0 ? z[i - signed_stride] >> 1 : 0); break;
            case 4: line_buffer[i] = UCHAR(z[i] - stbiw__paeth(0, y > 0 ? z[i-signed_stride] : 0, 0)); break;
            case 5: line_buffer[i] = z[i]; break;
            case 6: line_buffer[i] = z[i]; break;
        }
    }
    switch (type) {
        case 1: for (let i=n; i < width*n; ++i) line_buffer[i] = z[i] - z[i-n]; break;
        case 2: for (let i=n; i < width*n; ++i) line_buffer[i] = z[i] - (y > 0 ? z[i-signed_stride] : 0); break;
        case 3: for (let i=n; i < width*n; ++i) line_buffer[i] = z[i] - ((z[i-n] + (y > 0 ? z[i-signed_stride] : 0)) >> 1); break;
        case 4: for (let i=n; i < width*n; ++i) line_buffer[i] = z[i] - stbiw__paeth(z[i-n], y > 0 ? z[i-signed_stride] : 0, y > 0 ? z[i-signed_stride-n] : 0); break;
        case 5: for (let i=n; i < width*n; ++i) line_buffer[i] = z[i] - (z[i-n]>>1); break;
        case 6: for (let i=n; i < width*n; ++i) line_buffer[i] = z[i] - stbiw__paeth(z[i-n], 0, 0); break;
    }
}


export function stbi_write_png_to_mem(pixels, stride_bytes, x, y, n, out_len_obj) {
   const force_filter = -1; // Default
   const ctype = [-1, 0, 4, 2, 6];
   const sig = [137, 80, 78, 71, 13, 10, 26, 10];
   let filt, zlib;
   let line_buffer;
   let j, zlen;

   if (stride_bytes === 0)
      stride_bytes = x * n;

   filt = new Uint8Array((x * n + 1) * y);
   if (!filt) return null;
   line_buffer = new Int8Array(x * n);
   if (!line_buffer) return null;

   for (j = 0; j < y; ++j) {
      let filter_type;
      if (force_filter > -1) {
         filter_type = force_filter;
         stbiw__encode_png_line(pixels, stride_bytes, x, y, j, n, force_filter, line_buffer);
      } else {
         let best_filter = 0, best_filter_val = 0x7fffffff, est;
         for (filter_type = 0; filter_type < 5; filter_type++) {
            stbiw__encode_png_line(pixels, stride_bytes, x, y, j, n, filter_type, line_buffer);
            est = 0;
            for (let i = 0; i < x * n; ++i) {
               est += Math.abs(line_buffer[i]);
            }
            if (est < best_filter_val) {
               best_filter_val = est;
               best_filter = filter_type;
            }
         }
         if (filter_type !== best_filter) {
            stbiw__encode_png_line(pixels, stride_bytes, x, y, j, n, best_filter, line_buffer);
            filter_type = best_filter;
         }
      }
      filt[j * (x * n + 1)] = filter_type;
      filt.set(line_buffer, j * (x * n + 1) + 1);
   }

   const zlib_out_len = { value: 0 };
   zlib = stbi_zlib_compress(filt, y * (x * n + 1), zlib_out_len, 8); //
   zlen = zlib_out_len.value;
   if (!zlib) return null;

   const out = [];
   sig.forEach(b => out.push(b));

   const IHDR_chunk = [];
   stbiw__wptag(IHDR_chunk, "IHDR");
   stbiw__wp32(IHDR_chunk, x);
   stbiw__wp32(IHDR_chunk, y);
   IHDR_chunk.push(8);
   IHDR_chunk.push(ctype[n]);
   IHDR_chunk.push(0);
   IHDR_chunk.push(0);
   IHDR_chunk.push(0);

   stbiw__wp32(out, 13);
   IHDR_chunk.forEach(b => out.push(b));
   stbiw__wpcrc(out, new Uint8Array(IHDR_chunk));

   const IDAT_chunk = [];
   stbiw__wptag(IDAT_chunk, "IDAT");
   zlib.forEach(b => IDAT_chunk.push(b));

   stbiw__wp32(out, zlen);
   IDAT_chunk.forEach(b => out.push(b));
   stbiw__wpcrc(out, new Uint8Array(IDAT_chunk));

   const IEND_chunk = [];
   stbiw__wptag(IEND_chunk, "IEND");
   stbiw__wp32(out, 0);
   IEND_chunk.forEach(b => out.push(b));
   stbiw__wpcrc(out, new Uint8Array(IEND_chunk));

   out_len_obj.value = out.length;
   return new Uint8Array(out);
}
