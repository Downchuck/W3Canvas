import { inflate } from './inflate.js';

export function zlib_decode_malloc_guesssize_headerflag(buffer, initial_size, parse_header) {
    const out_buffer = new Uint8Array(initial_size);
    const result_len = inflate(buffer, out_buffer, parse_header);

    if (result_len > 0) {
        return out_buffer.slice(0, result_len);
    } else {
        return null;
    }
}
