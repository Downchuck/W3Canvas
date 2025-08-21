import { FontFaceSet } from './css/font_face.js';

/**
 * Represents a global scope, similar to `window` in a browser or `self` in a worker.
 * This allows us to create isolated environments for the main thread and for workers,
 * each with its own set of global properties like `fonts`.
 */
export class GlobalScope {
    constructor() {
        // Each global scope has its own FontFaceSet.
        this.fonts = new FontFaceSet();

        // We can add other global properties here as needed.
        // For example, `self` should refer to the scope itself.
        this.self = this;
    }
}

// We can also create a default global scope for the main thread.
// In a real browser environment, this would be the `window` object.
// For our Node.js-based environment, we'll just export a default instance.
export const mainThreadScope = new GlobalScope();
