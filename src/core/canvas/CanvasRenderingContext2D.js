import { bresenham } from '../algorithms/bresenham.js';
import { drawArc } from '../algorithms/arc.js';
import { getBezierPoints } from '../algorithms/bezier.js';
import { CanvasGradient } from './CanvasGradient.js';
import fs from 'fs';
import {
    FontInfo, InitFont, FindGlyphIndex, GetGlyphShape, GetCodepointHMetrics,
    GetCodepointKernAdvance, ScaleForPixelHeight, GetFontVMetrics,
    STBTT_vmove, STBTT_vline, STBTT_vcurve
} from '../../stb-truetype/index.js';


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
    this.font = '10px sans-serif';
    this.textAlign = 'start';
    this.stateStack = [];
    this.textBaseline = 'alphabetic';
    this.path = [];

    // Load font
    this.fontInfo = new FontInfo();
    const fontBuffer = fs.readFileSync('fonts/DejaVuSans.ttf');
    const fontData = new Uint8Array(fontBuffer);
    InitFont(this.fontInfo, fontData);
  }

  save() {
    this.stateStack.push({
      fillStyle: this.fillStyle,
      strokeStyle: this.strokeStyle,
      font: this.font,
      textAlign: this.textAlign,
      textBaseline: this.textBaseline,
    });
  }

  restore() {
    if (this.stateStack.length > 0) {
      const state = this.stateStack.pop();
      this.fillStyle = state.fillStyle;
      this.strokeStyle = state.strokeStyle;
      this.font = state.font;
      this.textAlign = state.textAlign;
      this.textBaseline = state.textBaseline;
    }
  }

  translate(x, y) {
    // TODO: Implement transformations
  }

  scale(x, y) {
    // TODO: Implement transformations
  }

  _parseFont() {
      const parts = this.font.split(' ');
      const size = parseFloat(parts[0]);
      const family = parts.slice(1).join(' ');
      return { size, family };
  }

  fillText(text, x, y) {
    const { size } = this._parseFont();
    const scale = ScaleForPixelHeight(this.fontInfo, size);
    const { ascent } = GetFontVMetrics(this.fontInfo);
    let currentX = x;
    const baseline = y + ascent * scale;

    for (let i = 0; i < text.length; i++) {
        const codepoint = text.charCodeAt(i);
        const glyphIndex = FindGlyphIndex(this.fontInfo, codepoint);
        const vertices = GetGlyphShape(this.fontInfo, glyphIndex);

        if (vertices) {
            this.beginPath();
            for (const v of vertices) {
                const vx = currentX + v.x * scale;
                const vy = baseline - v.y * scale;
                const vcx = currentX + v.cx * scale;
                const vcy = baseline - v.cy * scale;

                if (v.type === STBTT_vmove) {
                    this.moveTo(vx, vy);
                } else if (v.type === STBTT_vline) {
                    this.lineTo(vx, vy);
                } else if (v.type === STBTT_vcurve) {
                    this.bezierCurveTo(vcx, vcy, vcx, vcy, vx, vy);
                }
            }
            this.fill();
        }

        const { advanceWidth } = GetCodepointHMetrics(this.fontInfo, codepoint);
        currentX += advanceWidth * scale;

        if (i < text.length - 1) {
            const kern = GetCodepointKernAdvance(this.fontInfo, codepoint, text.charCodeAt(i + 1));
            currentX += kern * scale;
        }
    }
  }

  strokeText(text, x, y) {
    const { size } = this._parseFont();
    const scale = ScaleForPixelHeight(this.fontInfo, size);
    const { ascent } = GetFontVMetrics(this.fontInfo);
    let currentX = x;
    const baseline = y + ascent * scale;

    for (let i = 0; i < text.length; i++) {
        const codepoint = text.charCodeAt(i);
        const glyphIndex = FindGlyphIndex(this.fontInfo, codepoint);
        const vertices = GetGlyphShape(this.fontInfo, glyphIndex);

        if (vertices) {
            this.beginPath();
            for (const v of vertices) {
                const vx = currentX + v.x * scale;
                const vy = baseline - v.y * scale;
                const vcx = currentX + v.cx * scale;
                const vcy = baseline - v.cy * scale;

                if (v.type === STBTT_vmove) {
                    this.moveTo(vx, vy);
                } else if (v.type === STBTT_vline) {
                    this.lineTo(vx, vy);
                } else if (v.type === STBTT_vcurve) {
                    this.bezierCurveTo(vcx, vcy, vcx, vcy, vx, vy);
                }
            }
            this.stroke();
        }

        const { advanceWidth } = GetCodepointHMetrics(this.fontInfo, codepoint);
        currentX += advanceWidth * scale;

        if (i < text.length - 1) {
            const kern = GetCodepointKernAdvance(this.fontInfo, codepoint, text.charCodeAt(i + 1));
            currentX += kern * scale;
        }
    }
  }

  measureText(text) {
    const { size } = this._parseFont();
    const scale = ScaleForPixelHeight(this.fontInfo, size);
    let width = 0;
    for (let i = 0; i < text.length; i++) {
        const codepoint = text.charCodeAt(i);
        const { advanceWidth } = GetCodepointHMetrics(this.fontInfo, codepoint);
        width += advanceWidth * scale;
        if (i < text.length - 1) {
            const kern = GetCodepointKernAdvance(this.fontInfo, codepoint, text.charCodeAt(i + 1));
            width += kern * scale;
        }
    }
    return { width };
  }

  beginPath() {
    this.path = [];
  }

  closePath() {
    if (this.path.length > 0) {
      this.path.push({ type: 'close' });
    }
  }

  moveTo(x, y) {
    this.path.push({ type: 'move', x, y });
  }

  lineTo(x, y) {
    this.path.push({ type: 'line', x, y });
  }

  rect(x, y, w, h) {
    this.moveTo(x, y);
    this.lineTo(x + w, y);
    this.lineTo(x + w, y + h);
    this.lineTo(x, y + h);
    this.closePath();
  }

  bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y) {
    this.path.push({ type: 'bezier', cp1x, cp1y, cp2x, cp2y, x, y });
  }

  stroke() {
    if (this.path.length === 0) {
      return;
    }

    let currentX = 0;
    let currentY = 0;
    let startX = 0;
    let startY = 0;

    for (const command of this.path) {
      switch (command.type) {
        case 'move':
          currentX = command.x;
          currentY = command.y;
          startX = command.x;
          startY = command.y;
          break;
        case 'line':
          this._drawLine(currentX, currentY, command.x, command.y);
          currentX = command.x;
          currentY = command.y;
          break;
        case 'bezier': {
          getBezierPoints(currentX, currentY, command.cp1x, command.cp1y, command.cp2x, command.cp2y, command.x, command.y, (point) => {
            this._drawLine(currentX, currentY, point.x, point.y);
            currentX = point.x;
            currentY = point.y;
          });
          break;
        }
        case 'close':
          this._drawLine(currentX, currentY, startX, startY);
          currentX = startX;
          currentY = startY;
          break;
        case 'arc': {
          const color = this._parseColor(this.strokeStyle);
          drawArc(this, color, command.x, command.y, command.radius, command.startAngle, command.endAngle);
          // Update current position to the end of the arc
          currentX = command.x + command.radius * Math.cos(command.endAngle);
          currentY = command.y + command.radius * Math.sin(command.endAngle);
          break;
        }
      }
    }
  }

  fill() {
    if (this.path.length === 0) {
      return;
    }

    // This is a very simple polygon fill algorithm that only works for convex polygons.
    // It finds the bounding box of the polygon and then checks for each pixel
    // if it is inside the polygon. This is not efficient, but it is simple to implement.
    // A better implementation would use a scanline algorithm.

    const vertices = [];
    let currentX = 0;
    let currentY = 0;

    for (const command of this.path) {
      switch (command.type) {
        case 'move':
          currentX = command.x;
          currentY = command.y;
          vertices.push({ x: currentX, y: currentY });
          break;
        case 'line':
          currentX = command.x;
          currentY = command.y;
          vertices.push({ x: currentX, y: currentY });
          break;
        case 'bezier': {
          getBezierPoints(currentX, currentY, command.cp1x, command.cp1y, command.cp2x, command.cp2y, command.x, command.y, (point) => {
            vertices.push(point);
          });
          currentX = command.x;
          currentY = command.y;
          break;
        }
        case 'close':
          if (vertices.length > 0) {
            vertices.push({ x: vertices[0].x, y: vertices[0].y });
          }
          break;
        case 'arc': {
          const steps = 100;
          for (let i = 0; i <= steps; i++) {
              const angle = command.startAngle + (command.endAngle - command.startAngle) * (i / steps);
              const x = command.x + command.radius * Math.cos(angle);
              const y = command.y + command.radius * Math.sin(angle);
              vertices.push({ x, y });
          }
          currentX = command.x + command.radius * Math.cos(command.endAngle);
          currentY = command.y + command.radius * Math.sin(command.endAngle);
          break;
        }
      }
    }

    if (vertices.length < 3) {
      return;
    }

    const { data, width: canvasWidth } = this.imageData;

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    for (const vertex of vertices) {
      minX = Math.min(minX, vertex.x);
      minY = Math.min(minY, vertex.y);
      maxX = Math.max(maxX, vertex.x);
      maxY = Math.max(maxY, vertex.y);
    }

    minX = Math.max(0, Math.floor(minX));
    minY = Math.max(0, Math.floor(minY));
    maxX = Math.min(this.width, Math.ceil(maxX));
    maxY = Math.min(this.height, Math.ceil(maxY));

    for (let j = minY; j < maxY; j++) {
      for (let i = minX; i < maxX; i++) {
        if (this._isPointInPath(i, j, vertices)) {
          const index = (j * canvasWidth + i) * 4;
          let color;
          if (this.fillStyle instanceof CanvasGradient) {
              color = this._getColorFromGradientAtPoint(i, j, this.fillStyle);
          } else {
              color = this._parseColor(this.fillStyle);
          }
          data[index] = color.r;
          data[index + 1] = color.g;
          data[index + 2] = color.b;
          data[index + 3] = color.a;
        }
      }
    }
  }

  _isPointInPath(x, y, vertices) {
    // Ray-casting algorithm
    let inside = false;
    for (let i = 0, j = vertices.length - 1; i < vertices.length; j = i++) {
      const xi = vertices[i].x;
      const yi = vertices[i].y;
      const xj = vertices[j].x;
      const yj = vertices[j].y;

      const intersect = ((yi > y) !== (yj > y)) &&
        (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
      if (intersect) {
        inside = !inside;
      }
    }
    return inside;
  }

  getImageData(x, y, w, h) {
    const { data, width: canvasWidth } = this.imageData;
    const newData = new Uint8ClampedArray(w * h * 4);
    for (let j = 0; j < h; j++) {
      for (let i = 0; i < w; i++) {
        const sourceX = x + i;
        const sourceY = y + j;
        if (sourceX >= 0 && sourceX < canvasWidth && sourceY >= 0 && sourceY < this.height) {
            const sourceIndex = (sourceY * canvasWidth + sourceX) * 4;
            const destIndex = (j * w + i) * 4;
            newData[destIndex]     = data[sourceIndex];
            newData[destIndex + 1] = data[sourceIndex + 1];
            newData[destIndex + 2] = data[sourceIndex + 2];
            newData[destIndex + 3] = data[sourceIndex + 3];
        }
      }
    }
    return {
      data: newData,
      width: w,
      height: h
    };
  }

  putImageData(imageData, dx, dy) {
    const { data: sourceData, width: sourceWidth, height: sourceHeight } = imageData;
    const { data: destData, width: destWidth, height: destHeight } = this.imageData;

    for (let y = 0; y < sourceHeight; y++) {
      for (let x = 0; x < sourceWidth; x++) {
        const destX = dx + x;
        const destY = dy + y;

        if (destX >= 0 && destX < destWidth && destY >= 0 && destY < destHeight) {
          const sourceIndex = (y * sourceWidth + x) * 4;
          const destIndex = (destY * destWidth + destX) * 4;

          // Copy RGBA values
          destData[destIndex] = sourceData[sourceIndex];
          destData[destIndex + 1] = sourceData[sourceIndex + 1];
          destData[destIndex + 2] = sourceData[sourceIndex + 2];
          destData[destIndex + 3] = sourceData[sourceIndex + 3];
        }
      }
    }
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

  createLinearGradient(x0, y0, x1, y1) {
    return new CanvasGradient(x0, y0, x1, y1);
  }

  _getColorFromGradient(gradient, t) {
      const stops = gradient.colorStops;
      if (stops.length === 0) {
          return { r: 0, g: 0, b: 0, a: 0 }; // transparent black
      }

      let stop1 = stops[0];
      for(const stop of stops) {
          if (stop.offset <= t) {
              stop1 = stop;
          } else {
              break;
          }
      }

      let stop2 = stops[stops.length - 1];
      for(let i = stops.length - 1; i >= 0; i--) {
          const stop = stops[i];
          if (stop.offset >= t) {
              stop2 = stop;
          } else {
              break;
          }
      }

      if (stop1 === stop2) {
          return this._parseColor(stop1.color);
      }

      const c1 = this._parseColor(stop1.color);
      const c2 = this._parseColor(stop2.color);
      const range = stop2.offset - stop1.offset;

      const interp_ratio = range === 0 ? 0 : (t - stop1.offset) / range;

      const r = c1.r * (1 - interp_ratio) + c2.r * interp_ratio;
      const g = c1.g * (1 - interp_ratio) + c2.g * interp_ratio;
      const b = c1.b * (1 - interp_ratio) + c2.b * interp_ratio;
      const a = c1.a * (1 - interp_ratio) + c2.a * interp_ratio;

      return { r: Math.round(r), g: Math.round(g), b: Math.round(b), a: Math.round(a) };
  }

  _getColorFromGradientAtPoint(x, y, gradient) {
      const g_x0 = gradient.x0;
      const g_y0 = gradient.y0;
      const dx = gradient.x1 - g_x0;
      const dy = gradient.y1 - g_y0;
      const mag_sq = dx * dx + dy * dy;

      if (mag_sq === 0) {
          const lastColorStr = gradient.colorStops.length > 0 ? gradient.colorStops[gradient.colorStops.length - 1].color : 'black';
          return this._parseColor(lastColorStr);
      }

      const px = x - g_x0;
      const py = y - g_y0;
      let t = (px * dx + py * dy) / mag_sq;

      t = Math.max(0, Math.min(1, t)); // Clamp t

      return this._getColorFromGradient(gradient, t);
  }

  fillRect(x, y, width, height) {
    if (this.fillStyle instanceof CanvasGradient) {
      const { data, width: canvasWidth } = this.imageData;
      const xStart = Math.max(0, x);
      const yStart = Math.max(0, y);
      const xEnd = Math.min(this.width, x + width);
      const yEnd = Math.min(this.height, y + height);
      for (let j = yStart; j < yEnd; j++) {
        for (let i = xStart; i < xEnd; i++) {
          const color = this._getColorFromGradientAtPoint(i, j, this.fillStyle);
          const index = (j * canvasWidth + i) * 4;
          data[index] = color.r;
          data[index + 1] = color.g;
          data[index + 2] = color.b;
          data[index + 3] = color.a;
        }
      }
      return;
    }

    const color = this._parseColor(this.fillStyle);
    const { data, width: canvasWidth } = this.imageData;

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

  arc(x, y, radius, startAngle, endAngle, anticlockwise = false) {
    // This is a simplified implementation. The spec requires adding a line
    // from the current point to the start of the arc if the path is not empty.
    this.path.push({ type: 'arc', x, y, radius, startAngle, endAngle, anticlockwise });
  }

  ellipse(x, y, radiusX, radiusY, rotation, startAngle, endAngle) {
    // NOTE: rotation, startAngle, and endAngle are not implemented yet.
    // This implementation is a simplified version that draws a full ellipse
    // aligned with the axes.

    const kappa = 0.552284749831;
    const ox = radiusX * kappa; // control point offset horizontal
    const oy = radiusY * kappa; // control point offset vertical

    this.moveTo(x - radiusX, y);
    this.bezierCurveTo(x - radiusX, y - oy, x - ox, y - radiusY, x, y - radiusY);
    this.bezierCurveTo(x + ox, y - radiusY, x + radiusX, y - oy, x + radiusX, y);
    this.bezierCurveTo(x + radiusX, y + oy, x + ox, y + radiusY, x, y + radiusY);
    this.bezierCurveTo(x - ox, y + radiusY, x - radiusX, y + oy, x - radiusX, y);
    this.closePath();
  }

  drawImage(image, ...args) {
    console.log('drawImage called with image:', image.width, 'x', image.height);
    if (!image || !image.data) {
      // If the image is not loaded yet, do nothing.
      console.log('Image not loaded yet.');
      return;
    }

    let sx = 0;
    let sy = 0;
    let sWidth = image.width;
    let sHeight = image.height;
    let dx, dy, dWidth, dHeight;

    if (args.length === 2) {
      [dx, dy] = args;
      dWidth = image.width;
      dHeight = image.height;
    } else if (args.length === 4) {
      [dx, dy, dWidth, dHeight] = args;
    } else if (args.length === 8) {
      [sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight] = args;
    } else {
      throw new Error(`Invalid number of arguments for drawImage: ${args.length + 1}`);
    }

    const { data: sourceData, width: sourceWidth } = image;
    const { data: destData, width: destWidth } = this.imageData;

    // sx, sy, sWidth, sHeight define the source rectangle in the source image.
    // dx, dy, dWidth, dHeight define the destination rectangle in the canvas.

    for (let j = 0; j < dHeight; j++) {
      for (let i = 0; i < dWidth; i++) {
        // Find the corresponding pixel in the source image
        const sourceX = Math.floor(sx + (i / dWidth) * sWidth);
        const sourceY = Math.floor(sy + (j / dHeight) * sHeight);

        const destX = dx + i;
        const destY = dy + j;

        if (destX >= 0 && destX < this.width && destY >= 0 && destY < this.height) {
          const sourceIndex = (sourceY * sourceWidth + sourceX) * 4;
          const destIndex = (destY * destWidth + destX) * 4;

          // Copy RGBA values
          destData[destIndex]     = sourceData[sourceIndex];
          destData[destIndex + 1] = sourceData[sourceIndex + 1];
          destData[destIndex + 2] = sourceData[sourceIndex + 2];
          destData[destIndex + 3] = sourceData[sourceIndex + 3];
        }
      }
    }
  }
}
