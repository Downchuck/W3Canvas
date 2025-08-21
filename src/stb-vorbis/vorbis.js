import { Context } from './context.js';
import {
    imdct_step3_iter0_loop,
    imdct_step3_inner_r_loop,
    imdct_step3_inner_s_loop,
    iter_54,
    imdct_step3_inner_s_loop_ld654
} from './imdct.js';

// --- Constants from stb_vorbis.c ---

const MAX_CHANNELS = 16;
const MAX_BLOCKSIZE_LOG = 13;
const MAX_BLOCKSIZE = 1 << MAX_BLOCKSIZE_LOG;

const VORBIS_packet_id = 1;
const VORBIS_packet_comment = 3;
const VORBIS_packet_setup = 5;

const PAGEFLAG_continued_packet = 1;
const PAGEFLAG_first_page = 2;
const PAGEFLAG_last_page = 4;

const EOP = -1;
const NO_CODE = 255;
const STB_VORBIS_FAST_HUFFMAN_LENGTH = 10;
const FAST_HUFFMAN_TABLE_SIZE = 1 << STB_VORBIS_FAST_HUFFMAN_LENGTH;

export const STBVorbisError = {
    VORBIS__no_error: 0,
    VORBIS_need_more_data: 1,
    VORBIS_invalid_api_mixing: 2,
    VORBIS_outofmem: 3,
    VORBIS_feature_not_supported: 4,
    VORBIS_too_many_channels: 5,
    VORBIS_file_open_failure: 6,
    VORBIS_seek_without_length: 7,
    VORBIS_unexpected_eof: 10,
    VORBIS_seek_invalid: 11,
    VORBIS_invalid_setup: 20,
    VORBIS_invalid_stream: 21,
    VORBIS_missing_capture_pattern: 30,
    VORBIS_invalid_stream_structure_version: 31,
    VORBIS_continued_packet_flag_invalid: 32,
    VORBIS_incorrect_stream_serial_number: 33,
    VORBIS_invalid_first_page: 34,
    VORBIS_bad_packet_type: 35,
    VORBIS_cant_find_last_page: 36,
    VORBIS_seek_failed: 37,
    VORBIS_ogg_skeleton_not_supported: 38,
};

class Codebook {
    constructor() {
        this.dimensions = 0;
        this.entries = 0;
        this.codeword_lengths = null; // Uint8Array
        this.minimum_value = 0.0;
        this.delta_value = 0.0;
        this.value_bits = 0;
        this.lookup_type = 0;
        this.sequence_p = 0;
        this.sparse = 0;
        this.lookup_values = 0;
        this.multiplicands = null; // Float32Array
        this.codewords = null; // Uint32Array
        this.fast_huffman = null; // Int16Array or Int32Array
        this.sorted_codewords = null; // Uint32Array
        this.sorted_values = null; // Int32Array
        this.sorted_entries = 0;
    }
}

class Floor1 {
    constructor() {
        this.partitions = 0;
        this.partition_class_list = new Uint8Array(32);
        this.class_dimensions = new Uint8Array(16);
        this.class_subclasses = new Uint8Array(16);
        this.class_masterbooks = new Uint8Array(16);
        this.subclass_books = Array(16).fill(null).map(() => new Int16Array(8));
        this.Xlist = new Uint16Array(31 * 8 + 2);
        this.sorted_order = new Uint8Array(31 * 8 + 2);
        this.neighbors = Array(31 * 8 + 2).fill(null).map(() => new Uint8Array(2));
        this.floor1_multiplier = 0;
        this.rangebits = 0;
        this.values = 0;
    }
}

// In the C code, Floor is a union. Here, we'll just have a single class
// and the floor_type will tell us how to interpret it. We only support type 1.
class Floor {
    constructor() {
        this.floor1 = new Floor1();
        // floor0 is not supported by stb_vorbis and thus not implemented here.
    }
}

class Residue {
    constructor() {
        this.begin = 0;
        this.end = 0;
        this.part_size = 0;
        this.classifications = 0;
        this.classbook = 0;
        this.classdata = null; // Array of Uint8Array
        this.residue_books = null; // Array of Int16Array(8)
    }
}

class MappingChannel {
    constructor() {
        this.magnitude = 0;
        this.angle = 0;
        this.mux = 0;
    }
}

class Mapping {
    constructor() {
        this.coupling_steps = 0;
        this.chan = []; // Array of MappingChannel
        this.submaps = 0;
        this.submap_floor = new Uint8Array(15);
        this.submap_residue = new Uint8Array(15);
    }
}

class Mode {
    constructor() {
        this.blockflag = 0;
        this.mapping = 0;
        this.windowtype = 0;
        this.transformtype = 0;
    }
}

class CRCscan {
    constructor() {
        this.goal_crc = 0;
        this.bytes_left = 0;
        this.crc_so_far = 0;
        this.bytes_done = 0;
        this.sample_loc = 0;
    }
}

class ProbedPage {
    constructor() {
        this.page_start = 0;
        this.page_end = 0;
        this.last_decoded_sample = 0;
    }
}

export class Vorbis {
    constructor() {
        // user-accessible info
        this.sample_rate = 0;
        this.channels = 0;

        this.setup_memory_required = 0;
        this.temp_memory_required = 0;
        this.setup_temp_memory_required = 0;

        this.vendor = "";
        this.comment_list_length = 0;
        this.comment_list = [];

        // input config
        this.stream = null; // Uint8Array
        this.stream_start = null;
        this.stream_end = null;
        this.stream_len = 0;
        this.push_mode = false;
        this.first_audio_page_offset = 0;

        this.p_first = new ProbedPage();
        this.p_last = new ProbedPage();

        // memory management (simplified for JS)
        // alloc, setup_offset, temp_offset are not directly needed

        // run-time results
        this.eof = false;
        this.error = STBVorbisError.VORBIS__no_error;

        // header info
        this.blocksize = [0, 0];
        this.blocksize_0 = 0;
        this.blocksize_1 = 0;
        this.codebook_count = 0;
        this.codebooks = null; // Array of Codebook
        this.floor_count = 0;
        this.floor_types = new Uint16Array(64);
        this.floor_config = null; // Array of Floor
        this.residue_count = 0;
        this.residue_types = new Uint16Array(64);
        this.residue_config = null; // Array of Residue
        this.mapping_count = 0;
        this.mapping = null; // Array of Mapping
        this.mode_count = 0;
        this.mode_config = Array(64).fill(null).map(() => new Mode());

        this.total_samples = 0;

        // decode buffer
        this.channel_buffers = Array(MAX_CHANNELS).fill(null); // Array of Float32Array
        this.outputs = Array(MAX_CHANNELS).fill(null); // Array of Float32Array views

        this.previous_window = Array(MAX_CHANNELS).fill(null); // Array of Float32Array
        this.previous_length = 0;

        this.finalY = Array(MAX_CHANNELS).fill(null); // Array of Int16Array

        this.current_loc = 0;
        this.current_loc_valid = false;

        // per-blocksize precomputed data
        this.A = [null, null];
        this.B = [null, null];
        this.C = [null, null];
        this.window = [null, null];
        this.bit_reverse = [null, null];

        // current page/packet/segment streaming info
        this.serial = 0;
        this.last_page = 0;
        this.segment_count = 0;
        this.segments = new Uint8Array(255);
        this.page_flag = 0;
        this.bytes_in_seg = 0;
        this.first_decode = false;
        this.next_seg = 0;
        this.last_seg = false;
        this.last_seg_which = 0;
        this.acc = 0;
        this.valid_bits = 0;
        this.packet_bytes = 0;
        this.end_seg_with_known_loc = 0;
        this.known_loc_for_packet = 0;
        this.discard_samples_deferred = 0;
        this.samples_output = 0;

        // push mode scanning
        this.page_crc_tests = 0;
        this.scan = Array(4).fill(null).map(() => new CRCscan());

        // sample-access
        this.channel_buffer_start = 0;
        this.channel_buffer_end = 0;
    }
}

// --- Helper functions and tables ---

const CRC32_POLY = 0x04c11db7;
const crc_table = new Uint32Array(256);
let crc_table_initialized = false;

function crc32_init() {
    if (crc_table_initialized) return;
    for (let i = 0; i < 256; i++) {
        let s = i << 24;
        for (let j = 0; j < 8; j++) {
            s = (s << 1) ^ (s >= (1 << 31) ? CRC32_POLY : 0);
        }
        crc_table[i] = s;
    }
    crc_table_initialized = true;
}

function crc32_update(crc, byte) {
    return (crc << 8) ^ crc_table[byte ^ (crc >>> 24)];
}

function bit_reverse(n) {
    n = ((n & 0xAAAAAAAA) >>> 1) | ((n & 0x55555555) << 1);
    n = ((n & 0xCCCCCCCC) >>> 2) | ((n & 0x33333333) << 2);
    n = ((n & 0xF0F0F0F0) >>> 4) | ((n & 0x0F0F0F0F) << 4);
    n = ((n & 0xFF00FF00) >>> 8) | ((n & 0x00FF00FF) << 8);
    return (n >>> 16) | (n << 16);
}

// Custom log2 function from the spec
const log2_4 = new Int8Array([0, 1, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4]);
function ilog(n) {
    if (n < 0) return 0;
    if (n < (1 << 14)) {
        if (n < (1 << 4)) return 0 + log2_4[n];
        else if (n < (1 << 9)) return 5 + log2_4[n >>> 5];
        else return 10 + log2_4[n >>> 10];
    } else if (n < (1 << 24)) {
        if (n < (1 << 19)) return 15 + log2_4[n >>> 15];
        else return 20 + log2_4[n >>> 20];
    } else if (n < (1 << 29)) {
        return 25 + log2_4[n >>> 25];
    } else {
        return 30 + log2_4[n >>> 30];
    }
}

function float32_unpack(x) {
    const mantissa = x & 0x1fffff;
    const sign = x & 0x80000000;
    const exp = (x & 0x7fe00000) >>> 21;
    const res = sign ? -mantissa : mantissa;
    return res * Math.pow(2, exp - 788);
}

function square(x) {
    return x * x;
}

const VORBIS_sig = new Uint8Array(['v'.charCodeAt(0), 'o'.charCodeAt(0), 'r'.charCodeAt(0), 'b'.charCodeAt(0), 'i'.charCodeAt(0), 's'.charCodeAt(0)]);
function vorbis_validate(data) {
    for (let i = 0; i < 6; i++) {
        if (data[i] !== VORBIS_sig[i]) return false;
    }
    return true;
}

function add_entry(c, huff_code, symbol, count, len, values) {
    if (!c.sparse) {
        c.codewords[symbol] = huff_code;
    } else {
        c.codewords[count] = huff_code;
        c.codeword_lengths[count] = len;
        values[count] = symbol;
    }
}

function compute_codewords(c, lengths, n, values) {
    let k = 0;
    while (k < n && lengths[k] === NO_CODE) {
        k++;
    }
    if (k === n) {
        c.sorted_entries = 0;
        return true;
    }

    const available = new Uint32Array(32);
    let m = 0;

    add_entry(c, 0, k, m++, lengths[k], values);

    for (let i = 1; i <= lengths[k]; i++) {
        available[i] = 1 << (32 - i);
    }

    for (let i = k + 1; i < n; i++) {
        let z = lengths[i];
        if (z === NO_CODE) continue;

        while (z > 0 && available[z] === 0) {
            z--;
        }
        if (z === 0) return false;

        const res = available[z];
        available[z] = 0;
        add_entry(c, bit_reverse(res), i, m++, lengths[i], values);

        if (z !== lengths[i]) {
            for (let y = lengths[i]; y > z; y--) {
                available[y] = res + (1 << (32 - y));
            }
        }
    }
    return true;
}

function include_in_sort(c, len) {
    if (c.sparse) return true;
    if (len === NO_CODE) return false;
    if (len > STB_VORBIS_FAST_HUFFMAN_LENGTH) return true;
    return false;
}

function compute_accelerated_huffman(c) {
    c.fast_huffman = new Int16Array(FAST_HUFFMAN_TABLE_SIZE);
    for (let i = 0; i < FAST_HUFFMAN_TABLE_SIZE; i++) {
        c.fast_huffman[i] = -1;
    }

    const len = c.sparse ? c.sorted_entries : c.entries;

    for (let i = 0; i < len; i++) {
        if (c.codeword_lengths[i] <= STB_VORBIS_FAST_HUFFMAN_LENGTH) {
            const z = c.sparse ? bit_reverse(c.sorted_codewords[i]) : c.codewords[i];
            let k = 0;
            while (k < (1 << (STB_VORBIS_FAST_HUFFMAN_LENGTH - c.codeword_lengths[i]))) {
                c.fast_huffman[z + (k << c.codeword_lengths[i])] = i;
                k++;
            }
        }
    }
}

function compute_sorted_huffman(c, lengths, values) {
    if (!c.sparse) {
        let k = 0;
        for (let i = 0; i < c.entries; i++) {
            if (include_in_sort(c, lengths[i])) {
                c.sorted_codewords[k++] = bit_reverse(c.codewords[i]);
            }
        }
    } else {
        for (let i = 0; i < c.sorted_entries; i++) {
            c.sorted_codewords[i] = bit_reverse(c.codewords[i]);
        }
    }

    const sorted_codewords_with_indices = Array.from(c.sorted_codewords).map((code, index) => ({code, index}));
    sorted_codewords_with_indices.sort((a, b) => a.code - b.code);

    const original_indices = sorted_codewords_with_indices.map(item => item.index);
    c.sorted_codewords = new Uint32Array(sorted_codewords_with_indices.map(item => item.code));

    const len = c.sparse ? c.sorted_entries : c.entries;
    c.sorted_values = new Int32Array(c.sorted_entries);

    for (let i = 0; i < len; i++) {
        const huff_len = c.sparse ? lengths[values[i]] : lengths[i];
        if (include_in_sort(c, huff_len)) {
            const code = bit_reverse(c.codewords[i]);
            let x = 0, n = c.sorted_entries;
            while (n > 1) {
                const m = x + (n >> 1);
                if (c.sorted_codewords[m] <= code) {
                    x = m;
                    n -= (n >> 1);
                } else {
                    n >>= 1;
                }
            }

            if (c.sparse) {
                c.sorted_values[x] = values[i];
                c.codeword_lengths[x] = huff_len;
            } else {
                c.sorted_values[x] = i;
            }
        }
    }
}

function lookup1_values(entries, dim) {
    let r = Math.floor(Math.exp(Math.log(entries) / dim));
    if (Math.floor(Math.pow(r + 1, dim)) <= entries) {
        r++;
    }
    if (Math.pow(r + 1, dim) <= entries) {
        return -1;
    }
    if (Math.floor(Math.pow(r, dim)) > entries) {
        return -1;
    }
    return r;
}

function compute_twiddle_factors(n, A, B, C) {
    const n4 = n >> 2, n8 = n >> 3;
    for (let k = 0, k2 = 0; k < n4; ++k, k2 += 2) {
        A[k2] = Math.cos(4 * k * Math.PI / n);
        A[k2 + 1] = -Math.sin(4 * k * Math.PI / n);
        B[k2] = Math.cos((k2 + 1) * Math.PI / n / 2) * 0.5;
        B[k2 + 1] = Math.sin((k2 + 1) * Math.PI / n / 2) * 0.5;
    }
    for (let k = 0, k2 = 0; k < n8; ++k, k2 += 2) {
        C[k2] = Math.cos(2 * (k2 + 1) * Math.PI / n);
        C[k2 + 1] = -Math.sin(2 * (k2 + 1) * Math.PI / n);
    }
}

function compute_window(n, window) {
    const n2 = n >> 1;
    for (let i = 0; i < n2; ++i) {
        window[i] = Math.sin(0.5 * Math.PI * square(Math.sin((i + 0.5) / n2 * 0.5 * Math.PI)));
    }
}

function compute_bitreverse(n, rev) {
    const ld = ilog(n) - 1;
    const n8 = n >> 3;
    for (let i = 0; i < n8; ++i) {
        rev[i] = (bit_reverse(i) >>> (32 - ld + 3)) << 2;
    }
}

function init_blocksize(f, b, n) {
    const n2 = n >> 1, n4 = n >> 4, n8 = n >> 3;
    f.A[b] = new Float32Array(n2);
    f.B[b] = new Float32Array(n2);
    f.C[b] = new Float32Array(n4);
    compute_twiddle_factors(n, f.A[b], f.B[b], f.C[b]);
    f.window[b] = new Float32Array(n2);
    compute_window(n, f.window[b]);
    f.bit_reverse[b] = new Uint16Array(n8);
    compute_bitreverse(n, f.bit_reverse[b]);
    return true;
}


// Attach methods to Vorbis class

const inverse_db_table = new Float32Array([
    1.0649863e-07, 1.1341951e-07, 1.2079015e-07, 1.2863978e-07, 1.3699951e-07, 1.4590251e-07, 1.5538408e-07, 1.6548181e-07,
    1.7623575e-07, 1.8768855e-07, 1.9988561e-07, 2.1287530e-07, 2.2670913e-07, 2.4144197e-07, 2.5713223e-07, 2.7384213e-07,
    2.9163793e-07, 3.1059021e-07, 3.3077411e-07, 3.5226968e-07, 3.7516214e-07, 3.9954229e-07, 4.2550680e-07, 4.5315863e-07,
    4.8260743e-07, 5.1396998e-07, 5.4737065e-07, 5.8294187e-07, 6.2082472e-07, 6.6116941e-07, 7.0413592e-07, 7.4989464e-07,
    7.9862701e-07, 8.5052630e-07, 9.0579828e-07, 9.6466216e-07, 1.0273513e-06, 1.0941144e-06, 1.1652161e-06, 1.2409384e-06,
    1.3215816e-06, 1.4074654e-06, 1.4989305e-06, 1.5963394e-06, 1.7000785e-06, 1.8105592e-06, 1.9282195e-06, 2.0535261e-06,
    2.1869758e-06, 2.3290978e-06, 2.4804557e-06, 2.6416497e-06, 2.8133190e-06, 2.9961443e-06, 3.1908506e-06, 3.3982101e-06,
    3.6190449e-06, 3.8542308e-06, 4.1047004e-06, 4.3714470e-06, 4.6555282e-06, 4.9580707e-06, 5.2802740e-06, 5.6234160e-06,
    5.9888572e-06, 6.3780469e-06, 6.7925283e-06, 7.2339451e-06, 7.7040476e-06, 8.2047000e-06, 8.7378876e-06, 9.3057248e-06,
    9.9104632e-06, 1.0554501e-05, 1.1240392e-05, 1.1970856e-05, 1.2748789e-05, 1.3577278e-05, 1.4459606e-05, 1.5399272e-05,
    1.6400004e-05, 1.7465768e-05, 1.8600792e-05, 1.9809576e-05, 2.1096914e-05, 2.2467911e-05, 2.3928002e-05, 2.5482978e-05,
    2.7139006e-05, 2.8902651e-05, 3.0780908e-05, 3.2781225e-05, 3.4911534e-05, 3.7180282e-05, 3.9596466e-05, 4.2169667e-05,
    4.4910090e-05, 4.7828601e-05, 5.0936773e-05, 5.4246931e-05, 5.7772202e-05, 6.1526565e-05, 6.5524908e-05, 6.9783085e-05,
    7.4317983e-05, 7.9147585e-05, 8.4291040e-05, 8.9768747e-05, 9.5602426e-05, 0.00010181521, 0.00010843174, 0.00011547824,
    0.00012298267, 0.00013097477, 0.00013948625, 0.00014855085, 0.00015820453, 0.00016848555, 0.00017943469, 0.00019109536,
    0.00020351382, 0.00021673929, 0.00023082423, 0.00024582449, 0.00026179955, 0.00027881276, 0.00029693158, 0.00031622787,
    0.00033677814, 0.00035866388, 0.00038197188, 0.00040679456, 0.00043323036, 0.00046138411, 0.00049136745, 0.00052329927,
    0.00055730621, 0.00059352311, 0.00063209358, 0.00067317058, 0.00071691700, 0.00076350630, 0.00081312324, 0.00086596457,
    0.00092223983, 0.00098217216, 0.0010459992, 0.0011139742, 0.0011863665, 0.0012634633, 0.0013455702, 0.0014330129,
    0.0015261382, 0.0016253153, 0.0017309374, 0.0018434235, 0.0019632195, 0.0020908006, 0.0022266726, 0.0023713743,
    0.0025254795, 0.0026895994, 0.0028643847, 0.0030505286, 0.0032487691, 0.0034598925, 0.0036847358, 0.0039241906,
    0.0041792066, 0.0044507950, 0.0047400328, 0.0050480668, 0.0053761186, 0.0057254891, 0.0060975636, 0.0064938176,
    0.0069158225, 0.0073652516, 0.0078438871, 0.0083536271, 0.0088964928, 0.009474637, 0.010090352, 0.010746080,
    0.011444421, 0.012188144, 0.012980198, 0.013823725, 0.014722068, 0.015678791, 0.016697687, 0.017782797,
    0.018938423, 0.020169149, 0.021479854, 0.022875735, 0.024362330, 0.025945531, 0.027631618, 0.029427276,
    0.031339626, 0.033376252, 0.035545228, 0.037855157, 0.040315199, 0.042935108, 0.045725273, 0.048696758,
    0.051861348, 0.055231591, 0.058820850, 0.062643361, 0.066714279, 0.071049749, 0.075666962, 0.080584227,
    0.085821044, 0.091398179, 0.097337747, 0.10366330, 0.11039993, 0.11757434, 0.12521498, 0.13335215,
    0.14201813, 0.15124727, 0.16107617, 0.17154380, 0.18269168, 0.19456402, 0.20720788, 0.22067342,
    0.23501402, 0.25028656, 0.26655159, 0.28387361, 0.30232132, 0.32196786, 0.34289114, 0.36517414,
    0.38890521, 0.41417847, 0.44109412, 0.46975890, 0.50028648, 0.53279791, 0.56742212, 0.60429640,
    0.64356699, 0.68538959, 0.72993007, 0.77736504, 0.82788260, 0.88168307, 0.9389798, 1.0
]);

function draw_line(output, x0, y0, x1, y1, n) {
    const dy = y1 - y0;
    const adx = x1 - x0;
    const ady = Math.abs(dy);
    let x = x0;
    let y = y0;
    let err = 0;

    const base = Math.floor(dy / adx);
    const sy = dy < 0 ? base - 1 : base + 1;

    const ady_err = ady - Math.abs(base) * adx;

    if (x1 > n) x1 = n;

    if (x < x1) {
        output[x] *= inverse_db_table[y & 255];
        for (++x; x < x1; ++x) {
            err += ady_err;
            if (err >= adx) {
                err -= adx;
                y += sy;
            } else {
                y += base;
            }
            output[x] *= inverse_db_table[y & 255];
        }
    }
}

Object.assign(Vorbis.prototype, {
    // --- Ogg Page Handling ---

    get8() {
        if (this.stream.eof()) this.eof = true;
        return this.stream.get8();
    },

    get32() {
        return this.stream.get32le();
    },

    getn(buffer, n) {
        if (this.stream.eof()) this.eof = true;
        return this.stream.getn(buffer, n);
    },

    skip(n) {
        this.stream.skip(n);
    },

    capture_pattern() {
        if (this.get8() !== 0x4f) return false;
        if (this.get8() !== 0x67) return false;
        if (this.get8() !== 0x67) return false;
        if (this.get8() !== 0x53) return false;
        return true;
    },

    start_page_no_capturepattern() {
        if (this.get8() !== 0) {
            this.error = STBVorbisError.VORBIS_invalid_stream_structure_version;
            return false;
        }

        this.page_flag = this.get8();
        const loc0 = this.get32();
        const loc1 = this.get32(); // ignoring 64-bit case
        this.serial = this.get32();
        this.last_page = this.get32();
        this.get32(); // crc
        this.segment_count = this.get8();
        this.getn(this.segments, this.segment_count);

        if (this.eof) {
            this.error = STBVorbisError.VORBIS_unexpected_eof;
            return false;
        }

        this.end_seg_with_known_loc = -2;
        if (loc0 !== ~0 || loc1 !== ~0) {
            for (let i = this.segment_count - 1; i >= 0; i--) {
                if (this.segments[i] < 255) {
                    this.end_seg_with_known_loc = i;
                    this.known_loc_for_packet = loc0;
                    break;
                }
            }
        }

        if (this.first_decode) {
            // ... logic for p_first, p_last ...
        }

        this.next_seg = 0;
        return true;
    },

    start_page() {
        if (!this.capture_pattern()) {
            this.error = STBVorbisError.VORBIS_missing_capture_pattern;
            return false;
        }
        return this.start_page_no_capturepattern();
    },

    // --- Ogg Packet Handling ---

    start_packet() {
        while (this.next_seg === -1) {
            if (!this.start_page()) return false;
            if (this.page_flag & PAGEFLAG_continued_packet) {
                this.error = STBVorbisError.VORBIS_continued_packet_flag_invalid;
                return false;
            }
        }
        this.last_seg = false;
        this.valid_bits = 0;
        this.packet_bytes = 0;
        this.bytes_in_seg = 0;
        return true;
    },

    next_segment() {
        if (this.last_seg) return 0;

        if (this.next_seg === -1) {
            this.last_seg_which = this.segment_count - 1;
            if (!this.start_page()) {
                this.last_seg = true;
                return 0;
            }
            if (!(this.page_flag & PAGEFLAG_continued_packet)) {
                 this.error = STBVorbisError.VORBIS_continued_packet_flag_invalid;
                 return 0;
            }
        }

        let len = this.segments[this.next_seg++];
        if (len < 255) {
            this.last_seg = true;
            this.last_seg_which = this.next_seg - 1;
        }

        if (this.next_seg >= this.segment_count) {
            this.next_seg = -1;
        }

        this.bytes_in_seg = len;
        return len;
    },

    get8_packet_raw() {
        if (this.bytes_in_seg === 0) {
            if (this.last_seg) return EOP;
            if (this.next_segment() === 0) return EOP;
        }

        this.bytes_in_seg--;
        this.packet_bytes++;
        return this.get8();
    },

    get8_packet() {
        const x = this.get8_packet_raw();
        this.valid_bits = 0;
        return x;
    },

    get32_packet() {
        let x = this.get8_packet();
        x += this.get8_packet() << 8;
        x += this.get8_packet() << 16;
        x += this.get8_packet() << 24;
        return x;
    },

    // --- Bit-level reading ---

    prep_huffman() {
        if (this.valid_bits <= 24) {
            if (this.valid_bits === 0) this.acc = 0;
            do {
                if (this.last_seg && this.bytes_in_seg === 0) return;
                const z = this.get8_packet_raw();
                if (z === EOP) return;
                this.acc += z << this.valid_bits;
                this.valid_bits += 8;
            } while (this.valid_bits <= 24);
        }
    },

    get_bits(n) {
        if (this.valid_bits < 0) return 0;

        if (this.valid_bits < n) {
            if (n > 24) {
                // The accumulator technique below would not work correctly in this case
                let z = this.get_bits(24);
                z += this.get_bits(n - 24) << 24;
                return z;
            }
            if (this.valid_bits === 0) this.acc = 0;
            while (this.valid_bits < n) {
                const z = this.get8_packet_raw();
                if (z === EOP) {
                    this.valid_bits = -1; // INVALID_BITS
                    return 0;
                }
                this.acc += z << this.valid_bits;
                this.valid_bits += 8;
            }
        }

        if (this.valid_bits < 0) return 0;

        const z = this.acc & ((1 << n) - 1);
        this.acc >>>= n;
        this.valid_bits -= n;
        return z;
    },

    flush_packet() {
        while (this.get8_packet_raw() !== EOP);
    },

    // --- Decoder Setup ---

    start_decoder() {
        // first page, first packet
        this.first_decode = true;

        if (!this.start_page()) return false;

        // validate page flag
        if (!(this.page_flag & PAGEFLAG_first_page)) { this.error = STBVorbisError.VORBIS_invalid_first_page; return false; }
        if (this.page_flag & PAGEFLAG_last_page) { this.error = STBVorbisError.VORBIS_invalid_first_page; return false; }
        if (this.page_flag & PAGEFLAG_continued_packet) { this.error = STBVorbisError.VORBIS_invalid_first_page; return false; }
        if (this.segment_count !== 1) { this.error = STBVorbisError.VORBIS_invalid_first_page; return false; }
        if (this.segments[0] !== 30) { this.error = STBVorbisError.VORBIS_invalid_first_page; return false; }

        // read packet
        // check packet header
        if (this.get8() !== VORBIS_packet_id) { this.error = STBVorbisError.VORBIS_invalid_first_page; return false; }
        let header = new Uint8Array(6);
        this.getn(header, 6);
        if (!vorbis_validate(header)) { this.error = STBVorbisError.VORBIS_invalid_first_page; return false; }

        // vorbis_version
        if (this.get32() !== 0) { this.error = STBVorbisError.VORBIS_invalid_first_page; return false; }

        this.channels = this.get8();
        if (!this.channels) { this.error = STBVorbisError.VORBIS_invalid_first_page; return false; }
        if (this.channels > MAX_CHANNELS) { this.error = STBVorbisError.VORBIS_too_many_channels; return false; }

        this.sample_rate = this.get32();
        if (!this.sample_rate) { this.error = STBVorbisError.VORBIS_invalid_first_page; return false; }

        this.get32(); // bitrate_maximum
        this.get32(); // bitrate_nominal
        this.get32(); // bitrate_minimum

        const x = this.get8();
        const log0 = x & 15;
        const log1 = x >>> 4;
        this.blocksize_0 = 1 << log0;
        this.blocksize_1 = 1 << log1;

        if (log0 < 6 || log0 > 13) { this.error = STBVorbisError.VORBIS_invalid_setup; return false; }
        if (log1 < 6 || log1 > 13) { this.error = STBVorbisError.VORBIS_invalid_setup; return false; }
        if (log0 > log1) { this.error = STBVorbisError.VORBIS_invalid_setup; return false; }

        // framing_flag
        const framing_flag = this.get8();
        if (!(framing_flag & 1)) { this.error = STBVorbisError.VORBIS_invalid_first_page; return false; }

        // Now, we need to parse the comment and setup headers.
        // This is a placeholder for the next steps.

        // --- Comment Header ---
        if (!this.start_page()) return false;
        if (!this.start_packet()) return false;

        if (this.get8_packet() !== VORBIS_packet_comment) { this.error = STBVorbisError.VORBIS_invalid_setup; return false; }
        for (let i = 0; i < 6; i++) header[i] = this.get8_packet();
        if (!vorbis_validate(header)) { this.error = STBVorbisError.VORBIS_invalid_setup; return false; }

        let len = this.get32_packet();
        let vendor_string_array = [];
        for (let i = 0; i < len; i++) {
            vendor_string_array.push(String.fromCharCode(this.get8_packet()));
        }
        this.vendor = vendor_string_array.join('');

        this.comment_list_length = this.get32_packet();
        for (let i = 0; i < this.comment_list_length; i++) {
            len = this.get32_packet();
            let comment_array = [];
            for (let j = 0; j < len; j++) {
                comment_array.push(String.fromCharCode(this.get8_packet()));
            }
            this.comment_list.push(comment_array.join(''));
        }

        const framing_flag_c = this.get8_packet();
        if (!(framing_flag_c & 1)) { this.error = STBVorbisError.VORBIS_invalid_setup; return false; }

        this.flush_packet();

        // --- Setup Header ---
        if (!this.start_packet()) return false;

        if (this.get8_packet() !== VORBIS_packet_setup) { this.error = STBVorbisError.VORBIS_invalid_setup; return false; }
        for (let i = 0; i < 6; i++) header[i] = this.get8_packet();
        if (!vorbis_validate(header)) { this.error = STBVorbisError.VORBIS_invalid_setup; return false; }

        // codebooks
        this.codebook_count = this.get_bits(8) + 1;
        this.codebooks = Array(this.codebook_count).fill(null).map(() => new Codebook());
        for (let i = 0; i < this.codebook_count; i++) {
            const c = this.codebooks[i];
            let x, y;

            x = this.get_bits(8); if (x !== 0x42) { this.error = STBVorbisError.VORBIS_invalid_setup; return false; }
            x = this.get_bits(8); if (x !== 0x43) { this.error = STBVorbisError.VORBIS_invalid_setup; return false; }
            x = this.get_bits(8); if (x !== 0x56) { this.error = STBVorbisError.VORBIS_invalid_setup; return false; }

            x = this.get_bits(8);
            y = this.get_bits(8);
            c.dimensions = (y << 8) + x;

            x = this.get_bits(8);
            y = this.get_bits(8);
            let z = this.get_bits(8);
            c.entries = (z << 16) + (y << 8) + x;

            const ordered = this.get_bits(1);
            c.sparse = ordered ? 0 : this.get_bits(1);

            let lengths;
            let total = 0;

            if (c.sparse) {
                lengths = new Uint8Array(c.entries);
            } else {
                c.codeword_lengths = new Uint8Array(c.entries);
                lengths = c.codeword_lengths;
            }

            if (ordered) {
                let current_entry = 0;
                let current_length = this.get_bits(5) + 1;
                while (current_entry < c.entries) {
                    const limit = c.entries - current_entry;
                    const n = this.get_bits(ilog(limit));
                    if (current_entry + n > c.entries) { this.error = STBVorbisError.VORBIS_invalid_setup; return false; }
                    for (let j = 0; j < n; j++) lengths[current_entry + j] = current_length;
                    current_entry += n;
                    current_length++;
                }
            } else {
                for (let j = 0; j < c.entries; j++) {
                    const present = c.sparse ? this.get_bits(1) : 1;
                    if (present) {
                        lengths[j] = this.get_bits(5) + 1;
                        total++;
                    } else {
                        lengths[j] = NO_CODE;
                    }
                }
            }

            if (c.sparse && total >= c.entries >> 2) {
                c.codeword_lengths = new Uint8Array(c.entries);
                for(let j=0; j<c.entries; ++j) c.codeword_lengths[j] = lengths[j];
                lengths = c.codeword_lengths;
                c.sparse = 0;
            }

            let sorted_count = 0;
            if (c.sparse) {
                sorted_count = total;
            } else {
                for (let j=0; j < c.entries; ++j) {
                    if (lengths[j] > STB_VORBIS_FAST_HUFFMAN_LENGTH && lengths[j] !== NO_CODE) {
                        sorted_count++;
                    }
                }
            }

            c.sorted_entries = sorted_count;
            let values = null;

            if (!c.sparse) {
                c.codewords = new Uint32Array(c.entries);
            } else {
                if (c.sorted_entries) {
                    c.codeword_lengths = new Uint8Array(c.sorted_entries);
                    c.codewords = new Uint32Array(c.sorted_entries);
                    values = new Uint32Array(c.sorted_entries);
                }
            }

            if (!compute_codewords(c, lengths, c.entries, values)) {
                this.error = STBVorbisError.VORBIS_invalid_setup; return false;
            }

            if (c.sorted_entries) {
                c.sorted_codewords = new Uint32Array(c.sorted_entries);
                compute_sorted_huffman(c, lengths, values);
            }

            compute_accelerated_huffman(c);

            c.lookup_type = this.get_bits(4);
            if (c.lookup_type > 2) { this.error = STBVorbisError.VORBIS_invalid_setup; return false; }
            if (c.lookup_type > 0) {
                c.minimum_value = float32_unpack(this.get_bits(32));
                c.delta_value = float32_unpack(this.get_bits(32));
                c.value_bits = this.get_bits(4) + 1;
                c.sequence_p = this.get_bits(1);

                if (c.lookup_type === 1) {
                    c.lookup_values = lookup1_values(c.entries, c.dimensions);
                } else {
                    c.lookup_values = c.entries * c.dimensions;
                }
                if (c.lookup_values === 0) { this.error = STBVorbisError.VORBIS_invalid_setup; return false; }

                const mults = new Uint16Array(c.lookup_values);
                for (let j = 0; j < c.lookup_values; j++) {
                    mults[j] = this.get_bits(c.value_bits);
                }

                // The C code has an optimization to pre-expand lookup1 style codebooks.
                // For simplicity in this port, we will handle it during decoding.
                // Here, we just store the raw multiplicands.
                c.multiplicands = new Float32Array(c.lookup_values);
                let last = 0;
                for (let j = 0; j < c.lookup_values; j++) {
                    const val = mults[j] * c.delta_value + c.minimum_value + last;
                    c.multiplicands[j] = val;
                    if (c.sequence_p) {
                        last = val;
                    }
                }
            }
            // precompute classdata
            const codebook = this.codebooks[r.classbook];
            r.classdata = Array(codebook.entries).fill(null).map(() => new Uint8Array(codebook.dimensions));
            for (let j = 0; j < codebook.entries; j++) {
                let temp = j;
                let classwords = codebook.dimensions;
                for (let k = classwords - 1; k >= 0; k--) {
                    r.classdata[j][k] = temp % r.classifications;
                    temp = Math.floor(temp / r.classifications);
                }
            }
        }

        // time domain transfers (not used)
        const num_time_domain_transfers = this.get_bits(6) + 1;
        for (let i = 0; i < num_time_domain_transfers; i++) {
            this.get_bits(16);
        }

        // Floors
        this.floor_count = this.get_bits(6) + 1;
        this.floor_config = Array(this.floor_count).fill(null).map(() => new Floor());
        for (let i = 0; i < this.floor_count; i++) {
            this.floor_types[i] = this.get_bits(16);
            if (this.floor_types[i] > 1) { this.error = STBVorbisError.VORBIS_invalid_setup; return false; }
            if (this.floor_types[i] === 0) {
                // Floor 0 not supported
                this.error = STBVorbisError.VORBIS_feature_not_supported;
                return false;
            } else {
                const g = this.floor_config[i].floor1;
                let max_class = -1;
                g.partitions = this.get_bits(5);
                for (let j = 0; j < g.partitions; j++) {
                    g.partition_class_list[j] = this.get_bits(4);
                    if (g.partition_class_list[j] > max_class) max_class = g.partition_class_list[j];
                }
                for (let j = 0; j <= max_class; j++) {
                    g.class_dimensions[j] = this.get_bits(3) + 1;
                    g.class_subclasses[j] = this.get_bits(2);
                    if (g.class_subclasses[j] !== 0) {
                        g.class_masterbooks[j] = this.get_bits(8);
                        if (g.class_masterbooks[j] >= this.codebook_count) { this.error = STBVorbisError.VORBIS_invalid_setup; return false; }
                    }
                    for (let k = 0; k < (1 << g.class_subclasses[j]); k++) {
                        g.subclass_books[j][k] = this.get_bits(8) - 1;
                        if (g.subclass_books[j][k] >= this.codebook_count && g.subclass_books[j][k] !== -1) { this.error = STBVorbisError.VORBIS_invalid_setup; return false; }
                    }
                }
                g.floor1_multiplier = this.get_bits(2) + 1;
                g.rangebits = this.get_bits(4);
                g.Xlist[0] = 0;
                g.Xlist[1] = 1 << g.rangebits;
                g.values = 2;
                for (let j = 0; j < g.partitions; j++) {
                    const c = g.partition_class_list[j];
                    for (let k = 0; k < g.class_dimensions[c]; k++) {
                        g.Xlist[g.values] = this.get_bits(g.rangebits);
                        g.values++;
                    }
                }
                const p = Array(g.values).fill(null).map(() => ({x:0, id:0}));
                for (let j=0; j < g.values; ++j) {
                    p[j].x = g.Xlist[j];
                    p[j].id = j;
                }
                p.sort((a,b) => a.x - b.x);
                for (let j=0; j < g.values; ++j) {
                    g.sorted_order[j] = p[j].id;
                }

                // precompute neighbors
                for (let j=2; j < g.values; ++j) {
                    let low = -1, high = 65536;
                    let plow = 0, phigh = 0;
                    for (let k=0; k < j; ++k) {
                        if (g.Xlist[k] > low && g.Xlist[k] < g.Xlist[j]) {
                            plow = k;
                            low = g.Xlist[k];
                        }
                        if (g.Xlist[k] < high && g.Xlist[k] > g.Xlist[j]) {
                            phigh = k;
                            high = g.Xlist[k];
                        }
                    }
                    g.neighbors[j][0] = plow;
                    g.neighbors[j][1] = phigh;
                }
            }
        }

        // Residue
        this.residue_count = this.get_bits(6) + 1;
        this.residue_config = Array(this.residue_count).fill(null).map(() => new Residue());
        for (let i = 0; i < this.residue_count; i++) {
            const r = this.residue_config[i];
            this.residue_types[i] = this.get_bits(16);
            if (this.residue_types[i] > 2) { this.error = STBVorbisError.VORBIS_invalid_setup; return false; }
            r.begin = this.get_bits(24);
            r.end = this.get_bits(24);
            r.part_size = this.get_bits(24) + 1;
            r.classifications = this.get_bits(6) + 1;
            r.classbook = this.get_bits(8);
            if (r.classbook >= this.codebook_count) { this.error = STBVorbisError.VORBIS_invalid_setup; return false; }
            const residue_cascade = new Uint8Array(64);
            for (let j = 0; j < r.classifications; j++) {
                const low_bits = this.get_bits(3);
                const high_bits = this.get_bits(1) ? this.get_bits(5) : 0;
                residue_cascade[j] = high_bits * 8 + low_bits;
            }
            r.residue_books = Array(r.classifications).fill(null).map(() => new Int16Array(8));
            for (let j = 0; j < r.classifications; j++) {
                for (let k = 0; k < 8; k++) {
                    if (residue_cascade[j] & (1 << k)) {
                        r.residue_books[j][k] = this.get_bits(8);
                        if (r.residue_books[j][k] >= this.codebook_count) { this.error = STBVorbisError.VORBIS_invalid_setup; return false; }
                    } else {
                        r.residue_books[j][k] = -1;
                    }
                }
            }
        }

        // Mappings
        this.mapping_count = this.get_bits(6) + 1;
        this.mapping = Array(this.mapping_count).fill(null).map(() => new Mapping());
        for (let i = 0; i < this.mapping_count; i++) {
            const m = this.mapping[i];
            const mapping_type = this.get_bits(16);
            if (mapping_type !== 0) { this.error = STBVorbisError.VORBIS_invalid_setup; return false; }
            m.submaps = this.get_bits(1) ? this.get_bits(4) + 1 : 1;
            if (this.get_bits(1)) {
                m.coupling_steps = this.get_bits(8) + 1;
                for (let k = 0; k < m.coupling_steps; k++) {
                    const mag = this.get_bits(ilog(this.channels - 1));
                    const ang = this.get_bits(ilog(this.channels - 1));
                    if (mag >= this.channels || ang >= this.channels || mag === ang) { this.error = STBVorbisError.VORBIS_invalid_setup; return false; }
                    const mc = new MappingChannel();
                    mc.magnitude = mag;
                    mc.angle = ang;
                    m.chan.push(mc);
                }
            } else {
                m.coupling_steps = 0;
            }
            if (this.get_bits(2) !== 0) { this.error = STBVorbisError.VORBIS_invalid_setup; return false; }
            if (m.submaps > 1) {
                for (let j = 0; j < this.channels; j++) {
                    if (!m.chan[j]) m.chan[j] = new MappingChannel();
                    m.chan[j].mux = this.get_bits(4);
                    if (m.chan[j].mux >= m.submaps) { this.error = STBVorbisError.VORBIS_invalid_setup; return false; }
                }
            }
            for (let j = 0; j < m.submaps; j++) {
                this.get_bits(8); // placeholder
                m.submap_floor[j] = this.get_bits(8);
                m.submap_residue[j] = this.get_bits(8);
                if (m.submap_floor[j] >= this.floor_count) { this.error = STBVorbisError.VORBIS_invalid_setup; return false; }
                if (m.submap_residue[j] >= this.residue_count) { this.error = STBVorbisError.VORBIS_invalid_setup; return false; }
            }
        }

        // Modes
        this.mode_count = this.get_bits(6) + 1;
        for (let i = 0; i < this.mode_count; i++) {
            const m = this.mode_config[i];
            m.blockflag = this.get_bits(1);
            m.windowtype = this.get_bits(16);
            m.transformtype = this.get_bits(16);
            m.mapping = this.get_bits(8);
            if (m.windowtype !== 0 || m.transformtype !== 0 || m.mapping >= this.mapping_count) { this.error = STBVorbisError.VORBIS_invalid_setup; return false; }
        }

        this.flush_packet();

        this.previous_length = 0;

        let longest_floorlist = 0;
        for (let i=0; i<this.floor_count; ++i) {
            if (this.floor_types[i] === 1) {
                if (this.floor_config[i].floor1.values > longest_floorlist) {
                    longest_floorlist = this.floor_config[i].floor1.values;
                }
            }
        }

        for (let i = 0; i < this.channels; i++) {
            this.channel_buffers[i] = new Float32Array(this.blocksize_1);
            this.previous_window[i] = new Float32Array(this.blocksize_1 >> 1);
            this.finalY[i] = new Int16Array(longest_floorlist);
        }

        if (!init_blocksize(this, 0, this.blocksize_0)) return false;
        if (!init_blocksize(this, 1, this.blocksize_1)) return false;
        this.blocksize[0] = this.blocksize_0;
        this.blocksize[1] = this.blocksize_1;

        return true;
    },

    // --- Core Decoding ---

    decode_scalar_raw(c) {
        if (!c.codewords && !c.sorted_codewords) return -1;

        // Fallback to binary search for long codes
        if (c.sorted_codewords) {
            const code = bit_reverse(this.acc);
            let x = 0, n = c.sorted_entries;
            while (n > 1) {
                const m = x + (n >> 1);
                if (c.sorted_codewords[m] <= code) {
                    x = m;
                    n -= (n >> 1);
                } else {
                    n >>= 1;
                }
            }

            const len = c.codeword_lengths[x];
            if (this.valid_bits >= len) {
                this.acc >>>= len;
                this.valid_bits -= len;
                return c.sparse ? c.sorted_values[x] : x; // In C, non-sparse returns sorted_values[x] which is the symbol index
            }
            this.valid_bits = 0;
            return -1;
        }

        // Fallback to linear search for small codebooks without sorted lists
        for (let i = 0; i < c.entries; i++) {
            if (c.codeword_lengths[i] === NO_CODE) continue;
            if (c.codewords[i] === (this.acc & ((1 << c.codeword_lengths[i]) - 1))) {
                if (this.valid_bits >= c.codeword_lengths[i]) {
                    this.acc >>>= c.codeword_lengths[i];
                    this.valid_bits -= c.codeword_lengths[i];
                    return i;
                }
                this.valid_bits = 0;
                return -1;
            }
        }

        this.error = STBVorbisError.VORBIS_invalid_stream;
        this.valid_bits = 0;
        return -1;
    },

    decode_scalar(c) {
        this.prep_huffman();
        const i = c.fast_huffman[this.acc & (FAST_HUFFMAN_TABLE_SIZE - 1)];

        if (i >= 0) {
            const len = c.codeword_lengths[i];
            this.acc >>>= len;
            this.valid_bits -= len;
            if (this.valid_bits < 0) { this.valid_bits = 0; return -1; }
            return c.sparse ? c.sorted_values[i] : i;
        }

        return this.decode_scalar_raw(c);
    },

    codebook_decode_start(c) {
        if (c.lookup_type === 0) {
            this.error = STBVorbisError.VORBIS_invalid_stream;
            return -1;
        }

        const z = this.decode_scalar(c);
        if (z < 0) {
            if (!this.bytes_in_seg && this.last_seg) return z;
            this.error = STBVorbisError.VORBIS_invalid_stream;
        }
        return z;
    },

    codebook_decode(c, output, offset, len) {
        const z = this.codebook_decode_start(c);
        if (z < 0) return false;

        if (len > c.dimensions) len = c.dimensions;

        if (c.lookup_type === 1) {
            let last = 0;
            let div = 1;
            for (let i = 0; i < len; i++) {
                const off = Math.floor(z / div) % c.lookup_values;
                const val = c.multiplicands[off] + last;
                output[offset + i] += val;
                if (c.sequence_p) last = val;
                div *= c.lookup_values;
            }
        } else { // lookup_type 2
            let z_offset = z * c.dimensions;
            let last = 0;
            if (c.sequence_p) {
                for (let i = 0; i < len; i++) {
                    const val = c.multiplicands[z_offset + i] + last;
                    output[offset + i] += val;
                    last = val;
                }
            } else {
                for (let i = 0; i < len; i++) {
                    output[offset + i] += c.multiplicands[z_offset + i];
                }
            }
        }
        return true;
    },

    codebook_decode_step(c, output, offset, len, step) {
        const z = this.codebook_decode_start(c);
        if (z < 0) return false;

        let last = 0;
        if (len > c.dimensions) len = c.dimensions;

        if (c.lookup_type === 1) {
            let div = 1;
            for (let i = 0; i < len; i++) {
                const off = Math.floor(z / div) % c.lookup_values;
                const val = c.multiplicands[off] + last;
                output[offset + i * step] += val;
                if (c.sequence_p) last = val;
                div *= c.lookup_values;
            }
        } else { // lookup_type 2
            let z_offset = z * c.dimensions;
            for (let i = 0; i < len; i++) {
                const val = c.multiplicands[z_offset + i] + last;
                output[offset + i * step] += val;
                if (c.sequence_p) last = val;
            }
        }
        return true;
    },

    codebook_decode_deinterleave_repeat(c, outputs, ch, c_inter_p, p_inter_p, len, total_decode) {
        let c_inter = c_inter_p.value;
        let p_inter = p_inter_p.value;
        let effective = c.dimensions;

        while (total_decode > 0) {
            const z = this.codebook_decode_start(c);
            if (z < 0) return false;

            if (c_inter + p_inter * ch + effective > len * ch) {
                effective = len * ch - (p_inter * ch + c_inter);
            }

            if (c.lookup_type === 1) {
                let last = 0;
                let div = 1;
                for (let i = 0; i < effective; i++) {
                    const off = Math.floor(z / div) % c.lookup_values;
                    const val = c.multiplicands[off] + last;
                    if (outputs[c_inter]) {
                        outputs[c_inter][p_inter] += val;
                    }
                    if (++c_inter === ch) { c_inter = 0; p_inter++; }
                    if (c.sequence_p) last = val;
                    div *= c.lookup_values;
                }
            } else {
                let z_offset = z * c.dimensions;
                let last = 0;
                if (c.sequence_p) {
                    for (let i = 0; i < effective; i++) {
                        const val = c.multiplicands[z_offset + i] + last;
                        if (outputs[c_inter]) {
                            outputs[c_inter][p_inter] += val;
                        }
                        if (++c_inter === ch) { c_inter = 0; p_inter++; }
                        last = val;
                    }
                } else {
                    for (let i = 0; i < effective; i++) {
                        const val = c.multiplicands[z_offset + i] + last;
                        if (outputs[c_inter]) {
                            outputs[c_inter][p_inter] += val;
                        }
                        if (++c_inter === ch) { c_inter = 0; p_inter++; }
                    }
                }
            }
            total_decode -= effective;
        }

        c_inter_p.value = c_inter;
        p_inter_p.value = p_inter;
        return true;
    },

    residue_decode(book, target, offset, n, rtype) {
        if (rtype === 0) {
            const step = n / book.dimensions;
            for (let k = 0; k < step; k++) {
                if (!this.codebook_decode_step(book, target, offset + k, n - offset - k, step)) {
                    return false;
                }
            }
        } else {
            for (let k = 0; k < n; ) {
                if (!this.codebook_decode(book, target, offset, n - k)) {
                    return false;
                }
                k += book.dimensions;
                offset += book.dimensions;
            }
        }
        return true;
    },

    decode_residue(residue_buffers, ch, n, rn, do_not_decode) {
        const r = this.residue_config[rn];
        const rtype = this.residue_types[rn];
        const c = this.codebooks[r.classbook];
        const classwords = c.dimensions;

        const n_read = r.end - r.begin;
        const part_read = n_read / r.part_size;

        const part_classdata = Array(ch).fill(null).map(() => new Uint8Array(part_read));

        for (let i = 0; i < ch; i++) {
            if (!do_not_decode[i]) {
                residue_buffers[i].fill(0);
            }
        }

        if (rtype === 2 && ch !== 1) {
            // ... type 2 logic (interleaved) ...
            for (let pass = 0; pass < 8; pass++) {
                let pcount = 0;
                let class_set = 0;
                if (ch === 2) {
                    while (pcount < part_read) {
                        const z = r.begin + pcount * r.part_size;
                        const c_inter = { value: z & 1 };
                        const p_inter = { value: z >> 1 };
                        if (pass === 0) {
                            const q = this.decode_scalar(c);
                            if (q === EOP) return;
                            part_classdata[0][class_set] = r.classdata[q];
                            part_classdata[1][class_set] = r.classdata[q];
                        }
                        for (let i = 0; i < classwords && pcount < part_read; i++, pcount++) {
                            const c_val = part_classdata[0][class_set][i];
                            const b = r.residue_books[c_val][pass];
                            if (b >= 0) {
                                if (!this.codebook_decode_deinterleave_repeat(this.codebooks[b], residue_buffers, ch, c_inter, p_inter, n, r.part_size)) return;
                            } else {
                                c_inter.value += r.part_size;
                            }
                        }
                        class_set++;
                    }
                }
                // ... more complex stereo cases would go here ...
            }
            return;
        }

        for (let pass = 0; pass < 8; pass++) {
            let pcount = 0;
            let class_set = 0;
            while (pcount < part_read) {
                if (pass === 0) {
                    for (let j = 0; j < ch; j++) {
                        if (!do_not_decode[j]) {
                            const temp = this.decode_scalar(c);
                            if (temp === EOP) return;
                            part_classdata[j][class_set] = r.classdata[temp];
                        }
                    }
                }
                for (let i = 0; i < classwords && pcount < part_read; i++, pcount++) {
                    for (let j = 0; j < ch; j++) {
                        if (!do_not_decode[j]) {
                            const c_val = part_classdata[j][class_set][i];
                            const b = r.residue_books[c_val][pass];
                            if (b >= 0) {
                                const target = residue_buffers[j];
                                const offset = r.begin + pcount * r.part_size;
                                if (!this.residue_decode(this.codebooks[b], target, offset, r.part_size, rtype)) return;
                            }
                        }
                    }
                }
                class_set++;
            }
        }
    },

    do_floor(map, i, n, target, finalY) {
        const n2 = n >> 1;
        const s = map.chan[i].mux;
        const floor = map.submap_floor[s];

        if (this.floor_types[floor] === 0) {
            this.error = STBVorbisError.VORBIS_feature_not_supported;
            return false;
        }

        const g = this.floor_config[floor].floor1;
        let lx = 0;
        let ly = finalY[0] * g.floor1_multiplier;

        for (let q = 1; q < g.values; q++) {
            const j = g.sorted_order[q];
            if (finalY[j] >= 0) {
                const hy = finalY[j] * g.floor1_multiplier;
                const hx = g.Xlist[j];
                if (lx !== hx) {
                    draw_line(target, lx, ly, hx, hy, n2);
                }
                lx = hx;
                ly = hy;
            }
        }
        if (lx < n2) {
            for (let j = lx; j < n2; j++) {
                target[j] *= inverse_db_table[ly & 255];
            }
        }
        return true;
    },

    inverse_mdct(buffer, n, blocktype) {
        const n2 = n >> 1, n4 = n >> 2, n8 = n >> 3;
        const ld = ilog(n) - 1;

        // IMDCT algorithm from "The use of multirate filter banks for coding of high quality digital audio"
        const buf2 = new Float32Array(n2);
        const A = this.A[blocktype];

        // Step 1: Merged into step 2
        let d_off = n2 - 2;
        let AA_off = 0;
        let e_off = 0;
        const e_stop = n2;
        while (e_off < e_stop) {
            buf2[d_off + 1] = buffer[e_off] * A[AA_off] - buffer[e_off + 2] * A[AA_off + 1];
            buf2[d_off] = buffer[e_off] * A[AA_off + 1] + buffer[e_off + 2] * A[AA_off];
            d_off -= 2;
            AA_off += 2;
            e_off += 4;
        }

        e_off = n2 - 3;
        while (d_off >= 0) {
            buf2[d_off + 1] = -buffer[e_off + 2] * A[AA_off] - -buffer[e_off] * A[AA_off + 1];
            buf2[d_off] = -buffer[e_off + 2] * A[AA_off + 1] + -buffer[e_off] * A[AA_off];
            d_off -= 2;
            AA_off += 2;
            e_off -= 4;
        }

        const u = buffer;
        const v = buf2;

        // Step 2
        AA_off = n2 - 8;
        let e0_off = n4;
        let e1_off = 0;
        let d0_off = n4;
        let d1_off = 0;
        while (AA_off >= 0) {
            const v41_21 = v[e0_off + 1] - v[e1_off + 1];
            const v40_20 = v[e0_off] - v[e1_off];
            u[d0_off + 1] = v[e0_off + 1] + v[e1_off + 1];
            u[d0_off] = v[e0_off] + v[e1_off];
            u[d1_off + 1] = v41_21 * A[AA_off + 4] - v40_20 * A[AA_off + 5];
            u[d1_off] = v40_20 * A[AA_off + 4] + v41_21 * A[AA_off + 5];

            const v41_21_2 = v[e0_off + 3] - v[e1_off + 3];
            const v40_20_2 = v[e0_off + 2] - v[e1_off + 2];
            u[d0_off + 3] = v[e0_off + 3] + v[e1_off + 3];
            u[d0_off + 2] = v[e0_off + 2] + v[e1_off + 2];
            u[d1_off + 3] = v41_21_2 * A[AA_off] - v40_20_2 * A[AA_off + 1];
            u[d1_off + 2] = v40_20_2 * A[AA_off] + v41_21_2 * A[AA_off + 1];

            AA_off -= 8;
            d0_off += 4;
            d1_off += 4;
            e0_off += 4;
            e1_off += 4;
        }

        // Step 3
        imdct_step3_iter0_loop(n >> 4, u, n2 - 1 - n4 * 0, -(n >> 3), A);
        imdct_step3_iter0_loop(n >> 4, u, n2 - 1 - n4 * 1, -(n >> 3), A);

        imdct_step3_inner_r_loop(n >> 5, u, n2 - 1 - n8 * 0, -(n >> 4), A, 16);
        imdct_step3_inner_r_loop(n >> 5, u, n2 - 1 - n8 * 1, -(n >> 4), A, 16);
        imdct_step3_inner_r_loop(n >> 5, u, n2 - 1 - n8 * 2, -(n >> 4), A, 16);
        imdct_step3_inner_r_loop(n >> 5, u, n2 - 1 - n8 * 3, -(n >> 4), A, 16);

        let l = 2;
        for (; l < (ld - 3) >> 1; ++l) {
            const k0 = n >> (l + 2);
            const k0_2 = k0 >> 1;
            const lim = 1 << (l + 1);
            for (let i = 0; i < lim; ++i) {
                imdct_step3_inner_r_loop(n >> (l + 4), u, n2 - 1 - k0 * i, -k0_2, A, 1 << (l + 3));
            }
        }

        for (; l < ld - 6; ++l) {
            const k0 = n >> (l + 2);
            const k1 = 1 << (l + 3);
            const k0_2 = k0 >> 1;
            const rlim = n >> (l + 6);
            let i_off = n2 - 1;
            let A_off = 0;
            for (let r = rlim; r > 0; --r) {
                imdct_step3_inner_s_loop(1 << (l + 1), u, i_off, -k0_2, A.subarray(A_off), k1, k0);
                A_off += k1 * 4;
                i_off -= 8;
            }
        }

        imdct_step3_inner_s_loop_ld654(n >> 5, u, n2 - 1, A, n);

        // Step 4, 5, 6
        const bitrev = this.bit_reverse[blocktype];
        d0_off = n4 - 4;
        d1_off = n2 - 4;
        let bitrev_off = 0;
        while (d0_off >= 0) {
            let k4 = bitrev[bitrev_off];
            v[d1_off + 3] = u[k4];
            v[d1_off + 2] = u[k4 + 1];
            v[d0_off + 3] = u[k4 + 2];
            v[d0_off + 2] = u[k4 + 3];

            k4 = bitrev[bitrev_off + 1];
            v[d1_off + 1] = u[k4];
            v[d1_off] = u[k4 + 1];
            v[d0_off + 1] = u[k4 + 2];
            v[d0_off] = u[k4 + 3];

            d0_off -= 4;
            d1_off -= 4;
            bitrev_off += 2;
        }

        // Step 7
        const C = this.C[blocktype];
        let C_off = 0;
        d0_off = 0;
        let e_off_7 = n2 - 4;
        while (d0_off < e_off_7) {
            let a02 = v[d0_off] - v[e_off_7 + 2];
            let a11 = v[d0_off + 1] + v[e_off_7 + 3];
            let b0 = C[C_off + 1] * a02 + C[C_off] * a11;
            let b1 = C[C_off + 1] * a11 - C[C_off] * a02;
            let b2 = v[d0_off] + v[e_off_7 + 2];
            let b3 = v[d0_off + 1] - v[e_off_7 + 3];
            v[d0_off] = b2 + b0;
            v[d0_off + 1] = b3 + b1;
            v[e_off_7 + 2] = b2 - b0;
            v[e_off_7 + 3] = b1 - b3;

            a02 = v[d0_off + 2] - v[e_off_7];
            a11 = v[d0_off + 3] + v[e_off_7 + 1];
            b0 = C[C_off + 3] * a02 + C[C_off + 2] * a11;
            b1 = C[C_off + 3] * a11 - C[C_off + 2] * a02;
            b2 = v[d0_off + 2] + v[e_off_7];
            b3 = v[d0_off + 3] - v[e_off_7 + 1];
            v[d0_off + 2] = b2 + b0;
            v[d0_off + 3] = b3 + b1;
            v[e_off_7] = b2 - b0;
            v[e_off_7 + 1] = b1 - b3;

            C_off += 4;
            d0_off += 4;
            e_off_7 -= 4;
        }

        // Step 8
        const B = this.B[blocktype];
        let B_off = n2 - 8;
        let e_off_8 = n2 - 8;
        d0_off = 0;
        d1_off = n2 - 4;
        let d2_off = n2;
        let d3_off = n - 4;

        while (e_off_8 >= 0) {
            let p0, p1, p2, p3;

            p3 = v[e_off_8 + 6] * B[B_off + 7] - v[e_off_8 + 7] * B[B_off + 6];
            p2 = -v[e_off_8 + 6] * B[B_off + 6] - v[e_off_8 + 7] * B[B_off + 7];
            buffer[d0_off] = p3;
            buffer[d1_off + 3] = -p3;
            buffer[d2_off] = p2;
            buffer[d3_off + 3] = p2;

            p1 = v[e_off_8 + 4] * B[B_off + 5] - v[e_off_8 + 5] * B[B_off + 4];
            p0 = -v[e_off_8 + 4] * B[B_off + 4] - v[e_off_8 + 5] * B[B_off + 5];
            buffer[d0_off + 1] = p1;
            buffer[d1_off + 2] = -p1;
            buffer[d2_off + 1] = p0;
            buffer[d3_off + 2] = p0;

            p3 = v[e_off_8 + 2] * B[B_off + 3] - v[e_off_8 + 3] * B[B_off + 2];
            p2 = -v[e_off_8 + 2] * B[B_off + 2] - v[e_off_8 + 3] * B[B_off + 3];
            buffer[d0_off + 2] = p3;
            buffer[d1_off + 1] = -p3;
            buffer[d2_off + 2] = p2;
            buffer[d3_off + 1] = p2;

            p1 = v[e_off_8] * B[B_off + 1] - v[e_off_8 + 1] * B[B_off];
            p0 = -v[e_off_8] * B[B_off] - v[e_off_8 + 1] * B[B_off + 1];
            buffer[d0_off + 3] = p1;
            buffer[d1_off] = -p1;
            buffer[d2_off + 3] = p0;
            buffer[d3_off] = p0;

            B_off -= 8;
            e_off_8 -= 8;
            d0_off += 4;
            d2_off += 4;
            d1_off -= 4;
            d3_off -= 4;
        }
    },

    get_window(len) {
        len <<= 1;
        if (len === this.blocksize_0) return this.window[0];
        if (len === this.blocksize_1) return this.window[1];
        return null;
    },

    decode_packet_rest(len_ptr, m, left_start, left_end, right_start, right_end, p_left) {
        const n = this.blocksize[m.blockflag];
        const n2 = n >> 1;
        const map = this.mapping[m.mapping];

        const zero_channel = new Array(this.channels).fill(false);
        const really_zero_channel = new Array(this.channels).fill(false);

        // Decode floors
        for (let i = 0; i < this.channels; ++i) {
            const s = map.chan[i].mux;
            const floor = map.submap_floor[s];
            if (this.floor_types[floor] === 0) {
                return false; // error
            } else {
                const g = this.floor_config[floor].floor1;
                if (this.get_bits(1)) {
                    const finalY = this.finalY[i];
                    finalY.fill(0);
                    const range_list = [256, 128, 86, 64];
                    const range = range_list[g.floor1_multiplier - 1];
                    let offset = 2;
                    finalY[0] = this.get_bits(ilog(range) - 1);
                    finalY[1] = this.get_bits(ilog(range) - 1);
                    for (let j = 0; j < g.partitions; j++) {
                        const pclass = g.partition_class_list[j];
                        const cdim = g.class_dimensions[pclass];
                        const cbits = g.class_subclasses[pclass];
                        const csub = (1 << cbits) - 1;
                        let cval = 0;
                        if (cbits !== 0) {
                            cval = this.decode_scalar(this.codebooks[g.class_masterbooks[pclass]]);
                        }
                        for (let k = 0; k < cdim; k++) {
                            const book = g.subclass_books[pclass][cval & csub];
                            cval >>>= cbits;
                            if (book >= 0) {
                                const temp = this.decode_scalar(this.codebooks[book]);
                                finalY[offset++] = temp;
                            } else {
                                finalY[offset++] = 0;
                            }
                        }
                    }
                    // The rest of floor decoding (step 2) is deferred until after residue
                    // In our simplified port, we mark which Y values are non-zero
                    for(let j=2; j<g.values; ++j) {
                        if (finalY[j] === 0) finalY[j] = -1; // Mark as not explicitly set
                    }

                } else {
                    zero_channel[i] = true;
                }
            }
        }

        // residue decode
        really_zero_channel.splice(0, this.channels, ...zero_channel);
        for (let i = 0; i < map.coupling_steps; ++i) {
            if (!zero_channel[map.chan[i].magnitude] || !zero_channel[map.chan[i].angle]) {
                zero_channel[map.chan[i].magnitude] = zero_channel[map.chan[i].angle] = false;
            }
        }

        for (let i = 0; i < map.submaps; ++i) {
            const residue_buffers = [];
            const do_not_decode = [];
            let ch = 0;
            for (let j = 0; j < this.channels; ++j) {
                if (map.chan[j] && map.chan[j].mux === i) {
                    do_not_decode[ch] = zero_channel[j];
                    residue_buffers[ch] = this.channel_buffers[j];
                    ch++;
                }
            }
            const r = map.submap_residue[i];
            this.decode_residue(residue_buffers, ch, n2, r, do_not_decode);
        }

        // inverse coupling
        for (let i = map.coupling_steps - 1; i >= 0; --i) {
            const m_ch = this.channel_buffers[map.chan[i].magnitude];
            const a_ch = this.channel_buffers[map.chan[i].angle];
            for (let j = 0; j < n2; ++j) {
                let m2, a2;
                if (m_ch[j] > 0) {
                    if (a_ch[j] > 0) { m2 = m_ch[j]; a2 = m_ch[j] - a_ch[j]; }
                    else { a2 = m_ch[j]; m2 = m_ch[j] + a_ch[j]; }
                } else {
                    if (a_ch[j] > 0) { m2 = m_ch[j]; a2 = m_ch[j] + a_ch[j]; }
                    else { a2 = m_ch[j]; m2 = m_ch[j] - a_ch[j]; }
                }
                m_ch[j] = m2;
                a_ch[j] = a2;
            }
        }

        // finish decoding the floors
        for (let i = 0; i < this.channels; ++i) {
            if (really_zero_channel[i]) {
                this.channel_buffers[i].fill(0, 0, n2);
            } else {
                this.do_floor(map, i, n, this.channel_buffers[i], this.finalY[i]);
            }
        }

        // inverse mdct
        for (let i = 0; i < this.channels; ++i) {
            this.inverse_mdct(this.channel_buffers[i], n, m.blockflag);
        }

        this.flush_packet();

        len_ptr.value = right_end;
        return true;
    },

    decode_initial(p_left_start, p_left_end, p_right_start, p_right_end, mode) {
        if (this.eof) return false;
        if (!this.start_packet()) return false;

        if (this.get_bits(1) !== 0) {
            // packet is not audio
            return false;
        }

        const mode_num = this.get_bits(ilog(this.mode_count - 1));
        if (mode_num === -1 || mode_num >= this.mode_count) return false;

        mode.value = mode_num;
        const m = this.mode_config[mode_num];
        const n = m.blockflag ? this.blocksize_1 : this.blocksize_0;
        const window_center = n >> 1;

        if (m.blockflag) {
            const prev = this.get_bits(1);
            const next = this.get_bits(1);
            if (!prev) {
                p_left_start.value = (n - this.blocksize_0) >> 2;
                p_left_end.value = (n + this.blocksize_0) >> 2;
            } else {
                p_left_start.value = 0;
                p_left_end.value = window_center;
            }
            if (!next) {
                p_right_start.value = (n * 3 - this.blocksize_0) >> 2;
                p_right_end.value = (n * 3 + this.blocksize_0) >> 2;
            } else {
                p_right_start.value = window_center;
                p_right_end.value = n;
            }
        } else {
            p_left_start.value = 0;
            p_left_end.value = window_center;
            p_right_start.value = window_center;
            p_right_end.value = n;
        }

        return true;
    },

    finish_frame(len, left, right) {
        if (this.previous_length > 0) {
            const n = this.previous_length;
            const w = this.get_window(n);
            for (let i = 0; i < this.channels; i++) {
                for (let j = 0; j < n; j++) {
                    this.channel_buffers[i][left + j] = this.channel_buffers[i][left + j] * w[j] + this.previous_window[i][j] * w[n-1-j];
                }
            }
        }

        const prev_len = this.previous_length;
        this.previous_length = len - right;

        for (let i = 0; i < this.channels; i++) {
            for (let j = 0; right + j < len; j++) {
                this.previous_window[i][j] = this.channel_buffers[i][right + j];
            }
        }

        if (!prev_len) return 0;

        if (len < right) right = len;

        this.samples_output += right - left;
        return right - left;
    },

    find_page(end, last) {
        while(true) {
            if (this.eof) return false;
            let n = this.get8();
            if (n === 0x4f) { // page header candidate
                const retry_loc = this.stream.tell();
                if (retry_loc - 25 > this.stream_len) return false;

                if (this.get8() !== 0x67 || this.get8() !== 0x67 || this.get8() !== 0x53) {
                    this.stream.seek(retry_loc);
                    continue;
                }

                const header = new Uint8Array(27);
                header.set([0x4f, 0x67, 0x67, 0x53]);
                this.getn(header.subarray(4), 23);
                if (this.eof) return false;

                if (header[4] !== 0) {
                    this.stream.seek(retry_loc);
                    continue;
                }

                const goal = header[22] + (header[23] << 8) + (header[24] << 16) + (header[25] << 24);
                header[22] = header[23] = header[24] = header[25] = 0;

                let crc = 0;
                for (let i=0; i<27; ++i) crc = crc32_update(crc, header[i]);

                let len = 0;
                const segment_table = new Uint8Array(header[26]);
                this.getn(segment_table, header[26]);
                for (let i=0; i<header[26]; ++i) {
                    crc = crc32_update(crc, segment_table[i]);
                    len += segment_table[i];
                }

                if (len && this.stream.tell() + len > this.stream_len) return false;

                for (let i=0; i<len; ++i) crc = crc32_update(crc, this.get8());

                if (crc === goal) {
                    if (end) end.value = this.stream.tell();
                    if (last) last.value = (header[5] & 0x04) ? 1 : 0;
                    this.stream.seek(retry_loc - 1);
                    return true;
                }

                this.stream.seek(retry_loc);
            }
        }
    }
});
