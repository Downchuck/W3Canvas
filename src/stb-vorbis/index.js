import { Context } from './context.js';
import { Vorbis, STBVorbisError } from './vorbis.js';

function pump_first_frame(f) {
    const len = { value: 0 };
    const left = { value: 0 };
    const right = { value: 0 };
    const mode = { value: 0 };

    if (!f.decode_initial(left, {value:0}, right, {value:0}, mode)) {
        return 0;
    }
    const m = f.mode_config[mode.value];
    // This is a simplified version of the decode_packet call
    if (!f.decode_packet_rest(len, m, left.value, 0, right.value, 0, left)) {
        return 0;
    }
    f.finish_frame(len.value, left.value, right.value);
    return 1;
}

export function stb_vorbis_open_memory(buffer) {
    const context = new Context(buffer);
    const f = new Vorbis();
    f.stream = context;
    f.stream_len = buffer.byteLength;

    if (!f.start_decoder()) {
        return null;
    }

    pump_first_frame(f);

    return f;
}

export function stb_vorbis_get_frame_float(f) {
    const len = { value: 0 };
    const left = { value: 0 };
    const right = { value: 0 };
    const mode = { value: 0 };

    if (!f.decode_initial(left, {value:0}, right, {value:0}, mode)) {
        f.channel_buffer_start = f.channel_buffer_end = 0;
        return 0;
    }

    const m = f.mode_config[mode.value];
    if (!f.decode_packet_rest(len, m, left.value, 0, right.value, 0, left)) {
        return 0;
    }

    const frame_len = f.finish_frame(len.value, left.value, right.value);

    const outputs = [];
    for (let i = 0; i < f.channels; ++i) {
        outputs[i] = f.channel_buffers[i].subarray(left.value, left.value + frame_len);
    }

    f.channel_buffer_start = left.value;
    f.channel_buffer_end = left.value + frame_len;

    return {
        channels: f.channels,
        samples: frame_len,
        output: outputs,
    };
}

export function stb_vorbis_get_info(f) {
    return {
        channels: f.channels,
        sample_rate: f.sample_rate,
        max_frame_size: f.blocksize_1 >> 1,
    };
}

export function stb_vorbis_close(f) {
    // In JS, garbage collection handles memory, so we just null out references
    // to potentially large objects to help it along.
    f.stream = null;
    f.channel_buffers = null;
    f.previous_window = null;
    f.finalY = null;
}

export function stb_vorbis_stream_length_in_samples(f) {
    if (f.total_samples === 0) {
        const restore_offset = f.stream.tell();
        const end = { value: 0 };
        const last = { value: 0 };

        let previous_safe = f.stream_len >= 65536 ? f.stream_len - 65536 : 0;
        f.stream.seek(previous_safe);

        while (f.find_page(end, last)) {
            if (last.value) {
                break;
            }
            f.stream.seek(end.value);
        }

        const header = new Uint8Array(27);
        f.getn(header, 27);
        const lo = header[6] + (header[7] << 8) + (header[8] << 16) + (header[9] << 24);
        const hi = header[10] + (header[11] << 8) + (header[12] << 16) + (header[13] << 24);

        if (hi) f.total_samples = 0xfffffffe;
        else f.total_samples = lo;

        f.stream.seek(restore_offset);
    }
    return f.total_samples;
}
