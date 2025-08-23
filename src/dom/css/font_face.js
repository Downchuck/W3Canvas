import fs from 'fs/promises';

export class FontFace {
    family;
    source;
    style;
    weight;
    stretch;
    display;
    descriptors;
    status;
    #fontData = null; // Private field for the ArrayBuffer

    constructor(family, source, descriptors = {}) {
        this.family = family;
        this.source = source;
        this.descriptors = descriptors;

        this.style = descriptors.style || 'normal';
        this.weight = descriptors.weight || 'normal';
        this.stretch = descriptors.stretch || 'normal';
        this.display = descriptors.display || 'auto';
        this.status = 'unloaded'; // Initial status is always 'unloaded'

        // We no longer automatically load data here. The `load()` method is responsible for that.
    }

    get fontData() {
        return this.#fontData;
    }

    async load() {
        if (this.status === 'loaded') {
            return this;
        }
        if (this.status === 'loading') {
            // In a real implementation, we would wait for the existing load to complete.
            // For now, we'll just throw an error.
            throw new Error("Already loading.");
        }

        this.status = 'loading';

        try {
            if (typeof this.source === 'string') {
                if (this.source.startsWith('http://') || this.source.startsWith('https://')) {
                    const response = await fetch(this.source);
                    if (!response.ok) {
                        throw new Error(`Failed to fetch font: ${response.statusText}`);
                    }
                    this.#fontData = await response.arrayBuffer();
                } else if (this.source.startsWith('file:///')) {
                    const filePath = new URL(this.source).pathname;
                    this.#fontData = await fs.readFile(filePath);
                } else {
                    // Assuming it's a local path for the Node.js environment
                    this.#fontData = await fs.readFile(this.source);
                }
            } else if (this.source instanceof ArrayBuffer || this.source instanceof Uint8Array) {
                this.#fontData = this.source;
            } else {
                throw new Error("Unsupported font source type.");
            }

            this.status = 'loaded';
            return this;
        } catch (e) {
            this.status = 'error';
            console.error(`Failed to load font ${this.family}: ${e.message}`);
            throw e;
        }
    }
}

export class FontFaceSet {
    #faces = new Set();
    #loadingPromises = new Set();
    #readyPromise = Promise.resolve(this);

    onloading = null;
    onloadingdone = null;
    onloadingerror = null;

    constructor() {
        // The `ready` promise is now a getter.
    }

    add(fontFace) {
        this.#faces.add(fontFace);
        // When a font is added, we might need to update the 'ready' promise
        // if the font is not already loaded.
        if (fontFace.status !== 'loaded') {
            // Trigger onloading if this is the first font to be loaded
            if (this.#loadingPromises.size === 0 && this.onloading) {
                this.onloading({ type: 'loading', target: this });
            }

            const loadingPromise = fontFace.load()
                .catch(err => {
                    if (this.onloadingerror) {
                        const event = { type: 'loadingerror', target: this, error: err, fontFace };
                        this.onloadingerror(event);
                    }
                    // Rethrow to allow Promise.allSettled to see it as rejected.
                    throw err;
                });

            this.#loadingPromises.add(loadingPromise);

            this.#readyPromise = Promise.allSettled(this.#loadingPromises)
                .then(() => {
                    if (this.onloadingdone) {
                        this.onloadingdone({ type: 'loadingdone', target: this });
                    }
                    return this;
                });
        }
    }

    delete(fontFace) {
        this.#faces.delete(fontFace);
        // Note: For simplicity, we don't remove from `#loadingPromises`.
        // A more robust implementation might handle this.
    }

    clear() {
        this.#faces.clear();
        this.#loadingPromises.clear();
        this.#readyPromise = Promise.resolve(this);
    }

    get ready() {
        return this.#readyPromise;
    }

    check(font, text) {
        const fontRegex = /(italic|normal|oblique)?\s*(bold|normal|\d+)?\s*(\d+px)\s*(.*)/;
        const match = font.match(fontRegex);
        if (!match) return false;

        const style = match[1] || 'normal';
        const weight = match[2] || 'normal';
        let family = match[4].replace(/['"]/g, ''); // Simplified family parsing

        for (const face of this.#faces) {
            if (face.family === family && face.status === 'loaded') {
                // This is a simplified check. A real implementation would consider weight/style matching more carefully.
                return true;
            }
        }
        return false;
    }

    find(family, options = {}) {
        const weight = options.weight || 'normal';
        const style = options.style || 'normal';

        for (const face of this.#faces) {
            if (face.family === family && face.weight === weight && face.style === style) {
                return face;
            }
        }
        for (const face of this.#faces) {
            if (face.family === family) {
                return face;
            }
        }
        return null;
    }
}
