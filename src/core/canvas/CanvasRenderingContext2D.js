import { bresenham } from '../algorithms/bresenham.js';

export class CanvasRenderingContext2D {
  constructor(width, height) {
    this.canvas = { width, height };
    this.width = width;
    this.height = height;
    this.imageData = {
      data: new Uint8ClampedArray(width * height * 4),
      width: width,
      height: height,
    };
    this.fillStyle = 'black';
    this.strokeStyle = 'black';
  }

  getImageData(x, y, w, h) {
    // This is a simplified implementation. A real implementation would
    // need to handle cases where the requested area is a sub-rectangle
    // of the full canvas.
    return this.imageData;
  }

  putImageData(imageData, x, y) {
    // This is a simplified implementation. A real implementation would
    // need to handle cases where the provided imageData is smaller than
    // the canvas and needs to be placed at a specific (x, y) offset.
    this.imageData = imageData;
  }

  _parseColor(colorStr) {
    // This is a very simple color parser.
    // It only handles a few named colors and hex codes.
    const colorMap = {
      'black': { r: 0, g: 0, b: 0, a: 255 },
      'white': { r: 255, g: 255, b: 255, a: 255 },
      'red': { r: 255, g: 0, b: 0, a: 255 },
      'green': { r: 0, g: 255, b: 0, a: 255 },
      'blue': { r: 0, g: 0, b: 255, a: 255 },
    };

    if (colorMap[colorStr]) {
      return colorMap[colorStr];
    }

    if (colorStr.startsWith('#')) {
      const hex = colorStr.slice(1);
      if (hex.length === 3) {
        const r = parseInt(hex[0] + hex[0], 16);
        const g = parseInt(hex[1] + hex[1], 16);
        const b = parseInt(hex[2] + hex[2], 16);
        return { r, g, b, a: 255 };
      }
      if (hex.length === 6) {
        const r = parseInt(hex.slice(0, 2), 16);
        const g = parseInt(hex.slice(2, 4), 16);
        const b = parseInt(hex.slice(4, 6), 16);
        return { r, g, b, a: 255 };
      }
    }

    // Default to black if color is not recognized
    return colorMap['black'];
  }

  fillRect(x, y, width, height) {
    const color = this._parseColor(this.fillStyle);
    const { data, width: canvasWidth } = this.imageData;

    // Clip the rectangle to the canvas boundaries
    const xStart = Math.max(0, x);
    const yStart = Math.max(0, y);
    const xEnd = Math.min(this.width, x + width);
    const yEnd = Math.min(this.height, y + height);

    for (let j = yStart; j < yEnd; j++) {
      for (let i = xStart; i < xEnd; i++) {
        const index = (j * canvasWidth + i) * 4;
        data[index] = color.r;
        data[index + 1] = color.g;
        data[index + 2] = color.b;
        data[index + 3] = color.a;
      }
    }
  }

  clearRect(x, y, width, height) {
    const { data, width: canvasWidth } = this.imageData;

    const xStart = Math.max(0, x);
    const yStart = Math.max(0, y);
    const xEnd = Math.min(this.width, x + width);
    const yEnd = Math.min(this.height, y + height);

    for (let j = yStart; j < yEnd; j++) {
      for (let i = xStart; i < xEnd; i++) {
        const index = (j * canvasWidth + i) * 4;
        data[index] = 0;
        data[index + 1] = 0;
        data[index + 2] = 0;
        data[index + 3] = 0;
      }
    }
  }

  strokeRect(x, y, width, height) {
    const x0 = x;
    const y0 = y;
    const x1 = x + width;
    const y1 = y + height;

    this._drawLine(x0, y0, x1, y0); // top
    this._drawLine(x1, y0, x1, y1); // right
    this._drawLine(x1, y1, x0, y1); // bottom
    this._drawLine(x0, y1, x0, y0); // left
  }

  _drawLine(x0, y0, x1, y1) {
    const color = this._parseColor(this.strokeStyle);
    bresenham(this.imageData, color, x0, y0, x1, y1);
  }
}
