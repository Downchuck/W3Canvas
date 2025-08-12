export class Context {
    constructor(buffer) {
        this.buffer = new Uint8Array(buffer);
        this.pos = 0;
        this.img_x = 0;
        this.img_y = 0;
        this.img_n = 0;
        this.img_out_n = 0;
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

    get16be() {
        const b0 = this.get8();
        const b1 = this.get8();
        return (b0 << 8) | b1;
    }

    get32be() {
        const b0 = this.get16be();
        const b1 = this.get16be();
        return (b0 << 16) | b1;
    }

    getn(buffer, n) {
        if (this.pos + n > this.buffer.length) {
            return 0; // Not enough data
        }
        for (let i = 0; i < n; i++) {
            buffer[i] = this.get8();
        }
        return 1; // Success
    }

    skip(n) {
        this.pos += n;
    }

    rewind() {
        this.pos = 0;
    }
}

export let g_failure_reason = "";
export function err(str, reason) {
    g_failure_reason = reason;
    console.error(reason);
    return 0;
}
