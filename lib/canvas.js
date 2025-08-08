const CanvasRenderingContext2D = require('./context.js');

class Canvas {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        const defaultPixel = { r: 0, g: 0, b: 0, a: 0 }; // Transparent black
        this.pixels = Array(height).fill(null).map(() => Array(width).fill(defaultPixel));
        this._context = null;
    }

    getContext(contextId) {
        if (contextId === '2d') {
            if (!this._context) {
                this._context = new CanvasRenderingContext2D(this);
            }
            return this._context;
        }
        return null;
    }

    getPixel(x, y) {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
            return undefined; // Out of bounds
        }
        return this.pixels[y][x];
    }
}

module.exports = Canvas;
