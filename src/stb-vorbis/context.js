/**
 * A class for reading from a Uint8Array as a stream.
 * This is modeled after the context in stb-image.
 */
export class Context {
    constructor(buffer) {
        this.buffer = new Uint8Array(buffer);
        this.pos = 0;
    }

    eof() {
        return this.pos >= this.buffer.length;
    }

    get8() {
        if (this.eof()) return 0;
        return this.buffer[this.pos++];
    }

    get16le() {
        const b0 = this.get8();
        const b1 = this.get8();
        return b0 | (b1 << 8);
    }

    get32le() {
        const b0 = this.get16le();
        const b1 = this.get16le();
        // JavaScript bitwise operations are 32-bit signed, so this is safe.
        return b0 | (b1 << 16);
    }

    getn(buffer, n) {
        if (this.pos + n > this.buffer.length) {
            return 0; // Not enough data
        }
        // The buffer passed in is expected to be a Uint8Array or similar
        buffer.set(this.buffer.subarray(this.pos, this.pos + n));
        this.pos += n;
        return 1; // Success
    }

    skip(n) {
        this.pos += n;
    }

    rewind() {
        this.pos = 0;
    }

    seek(pos) {
        this.pos = pos;
    }

    tell() {
        return this.pos;
    }
}

export let g_failure_reason = "";
export function err(reason) {
    g_failure_reason = reason;
    // In a real app, you might throw an error or use a more robust logging system.
    console.error(`STB-Vorbis Error: ${reason}`);
    return 0;
}
