export class FontFace {
    family;
    source;
    descriptors;
    #fontData; // Private field for the ArrayBuffer

    constructor(family, source, descriptors = {}) {
        this.family = family;
        this.source = source;
        this.descriptors = descriptors;
        this.#fontData = null;

        if (source instanceof Uint8Array) {
            this.#fontData = source;
        }
    }

    get fontData() {
        return this.#fontData;
    }

    load() {
        if (this.#fontData) {
            return Promise.resolve(this);
        } else {
            return Promise.reject(new Error("Loading from URL not yet implemented."));
        }
    }
}

class FontFaceSet {
    #faces = new Set();

    add(fontFace) {
        this.#faces.add(fontFace);
    }

    delete(fontFace) {
        this.#faces.delete(fontFace);
    }

    clear() {
        this.#faces.clear();
    }

    get(family) {
        for (const face of this.#faces) {
            if (face.family === family) {
                return face;
            }
        }
        return null;
    }
}

// This will act as the global `document.fonts` object.
// We attach it to the global object to ensure it's a singleton
// across different module resolution contexts in our test environment.
if (typeof global.fontFaceSet === 'undefined') {
    global.fontFaceSet = new FontFaceSet();
}
export const fontFaceSet = global.fontFaceSet;
