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

        if (source instanceof ArrayBuffer) {
            this.#fontData = source;
        }
    }

    get fontData() {
        return this.#fontData;
    }

    load() {
        // For now, we only support loading from an ArrayBuffer provided in the constructor.
        // We will add network loading later.
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

    // A very simplified `check()` that just sees if a font family is in the set.
    // A real implementation would need to match descriptors.
    check(font, text) {
        const family = font.split(' ')[1]; // Super simple parsing
        for (const face of this.#faces) {
            if (face.family === family) {
                return true;
            }
        }
        return false;
    }

    // A simplified `get()` to find a font face by family.
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
export const fontFaceSet = new FontFaceSet();
