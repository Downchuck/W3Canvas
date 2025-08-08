class Canvas {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        // Initialize a 2D array representing the pixel buffer
        // For simplicity, we'll use a single value per pixel for now.
        // A more complete implementation would use an object like {r, g, b, a}.
        this.pixels = Array(height).fill(null).map(() => Array(width).fill(0));
    }

    fillRect(x, y, width, height, color) {
        for (let i = y; i < y + height; i++) {
            for (let j = x; j < x + width; j++) {
                if (i >= 0 && i < this.height && j >= 0 && j < this.width) {
                    this.pixels[i][j] = color;
                }
            }
        }
    }

    getPixel(x, y) {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
            return undefined; // Out of bounds
        }
        return this.pixels[y][x];
    }
}

module.exports = Canvas;
