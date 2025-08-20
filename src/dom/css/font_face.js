export class FontFace {
    family;
    source;
    style;
    weight;
    stretch;
    display;
    descriptors;
    #fontData; // Private field for the ArrayBuffer

    constructor(family, source, descriptors = {}) {
        this.family = family;
        this.source = source;
        this.descriptors = descriptors;

        this.style = descriptors.style || 'normal';
        this.weight = descriptors.weight || 'normal';
        this.stretch = descriptors.stretch || 'normal';
        this.display = descriptors.display || 'auto';
        this.status = 'unloaded';

        this.#fontData = null;

        if (source instanceof Uint8Array) {
            this.#fontData = source;
            this.status = 'loaded';
        }
    }

    get fontData() {
        return this.#fontData;
    }

    load() {
        if (this.status === 'loaded') {
            return Promise.resolve(this);
        }
        if (this.status === 'loading') {
            // This would be more complex in a real implementation
            return Promise.reject(new Error("Already loading."));
        }

        // For now, we only support ArrayBuffer sources which are loaded instantly.
        // A real implementation would handle URL fetching here.
        this.status = 'loading';
        if (this.#fontData) {
            this.status = 'loaded';
            return Promise.resolve(this);
        } else {
            this.status = 'error';
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

    // A very simplified `check()` method. A real implementation is much more complex.
    check(font, text) {
        // Improved parsing for font string
        const fontRegex = /(italic|normal|oblique)?\s*(bold|normal|\d+)?\s*(\d+px)\s*(.*)/;
        const match = font.match(fontRegex);
        if (!match) return false;

        const style = match[1] || 'normal';
        const weight = match[2] || 'normal';
        let family = match[4];

        // Remove quotes from family name
        if (family.startsWith('"') && family.endsWith('"')) {
            family = family.substring(1, family.length - 1);
        } else if (family.startsWith("'") && family.endsWith("'")) {
            family = family.substring(1, family.length - 1);
        }

        return !!this.find(family, { weight, style });
    }

    find(family, options = {}) {
        const weight = options.weight || 'normal';
        const style = options.style || 'normal';

        for (const face of this.#faces) {
            if (face.family === family && face.weight === weight && face.style === style) {
                return face;
            }
        }

        // Basic fallback: ignore weight and style if no exact match is found
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
