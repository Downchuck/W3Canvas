import { bresenham } from '../algorithms/bresenham.js';
import { drawArc, fillArcWithMidpoint, getArcScanlineIntersections } from '../algorithms/arc.js';
import { getBezierPoints, getBezierYIntercepts, getBezierXforT } from '../algorithms/bezier.js';
import { strokePolyline } from '../algorithms/stroke.js';
import { scanlineFill } from '../algorithms/scanline_fill.js';
import { CanvasGradient } from './CanvasGradient.js';
import { CanvasPattern } from './CanvasPattern.js';
import { Path2D } from './Path2D.js';
import { DOMMatrix } from './DOMMatrix.js';
import { drawShadow } from './Shadow.js';
import { compositeImageData } from './compositing.js';
import fs from 'fs';
import {
    FontInfo, InitFont, FindGlyphIndex, GetGlyphShape, GetCodepointHMetrics,
    GetCodepointKernAdvance, ScaleForPixelHeight, GetFontVMetrics,
    STBTT_vmove, STBTT_vline, STBTT_vcurve
} from '../../stb-truetype/index.js';

export class OffscreenCanvas {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.imageData = {
            data: new Uint8ClampedArray(width * height * 4),
            width: width,
            height: height,
        };
        this._context = null;
    }

    getContext(contextType, contextAttributes = {}) {
        if (contextType === '2d') {
            if (!this._context) {
                this._context = new OffscreenCanvasRenderingContext2D(this, contextAttributes);
            }
            return this._context;
        }
        return null;
    }

    transferToImageBitmap() {
        // In a browser, this would return an ImageBitmap object.
        // For this environment, we can return an object that mimics
        // the structure of an ImageData object, which our `drawImage` can use.
        return {
            width: this.width,
            height: this.height,
            data: new Uint8ClampedArray(this.imageData.data), // Return a copy
        };
    }
}

export class OffscreenCanvasRenderingContext2D {
  constructor(offscreenCanvas, options = {}) {
    this.canvas = offscreenCanvas;
    this.isShadowContext = !!options.isShadowContext;
    this.width = offscreenCanvas.width;
    this.height = offscreenCanvas.height;
    this.imageData = offscreenCanvas.imageData;
    this.fillStyle = 'black';
    this.strokeStyle = 'black';
    this.lineWidth = 1.0;
    this.lineJoin = 'miter';
    this.lineCap = 'butt';
    this.font = '10px sans-serif';
    this.textAlign = 'start';
    this.textBaseline = 'alphabetic';
    this.shadowBlur = 0;
    this.shadowColor = 'rgba(0, 0, 0, 0)';
    this.shadowOffsetX = 0;
    this.shadowOffsetY = 0;
    this.globalAlpha = 1.0;
    this.globalCompositeOperation = 'source-over';
    this.miterLimit = 10;
    this.lineDashOffset = 0.0;
    this.lineDashList = [];
    this.stateStack = [];
    this.path = [];
    this.clippingPath = null;
    this.clippingPathAsVertices = null;
    this.transformMatrix = [1, 0, 0, 1, 0, 0]; // [a, b, c, d, e, f]

    // Load font, but not for shadow contexts, to avoid recursion
    if (!options.isShadowContext) {
      this.fontInfo = new FontInfo();
      const fontBuffer = fs.readFileSync('fonts/DejaVuSans.ttf');
      const fontData = new Uint8Array(fontBuffer);
      InitFont(this.fontInfo, fontData);
    }

    this.bezierStack = new Float64Array(1000 * 8);
    this.bezierPoints = new Float64Array(10000 * 2);
  }

  save() {
    this.stateStack.push({
      fillStyle: this.fillStyle,
      strokeStyle: this.strokeStyle,
      lineWidth: this.lineWidth,
      lineJoin: this.lineJoin,
      lineCap: this.lineCap,
      font: this.font,
      textAlign: this.textAlign,
      textBaseline: this.textBaseline,
      shadowBlur: this.shadowBlur,
      shadowColor: this.shadowColor,
      shadowOffsetX: this.shadowOffsetX,
      shadowOffsetY: this.shadowOffsetY,
      globalAlpha: this.globalAlpha,
      globalCompositeOperation: this.globalCompositeOperation,
      miterLimit: this.miterLimit,
      lineDashOffset: this.lineDashOffset,
      lineDashList: [...this.lineDashList],
      transformMatrix: [...this.transformMatrix],
    });
  }

  restore() {
    if (this.stateStack.length > 0) {
      const state = this.stateStack.pop();
      this.fillStyle = state.fillStyle;
      this.strokeStyle = state.strokeStyle;
      this.lineWidth = state.lineWidth;
      this.lineJoin = state.lineJoin;
      this.lineCap = state.lineCap;
      this.font = state.font;
      this.textAlign = state.textAlign;
      this.textBaseline = state.textBaseline;
      this.shadowBlur = state.shadowBlur;
      this.shadowColor = state.shadowColor;
      this.shadowOffsetX = state.shadowOffsetX;
      this.shadowOffsetY = state.shadowOffsetY;
      this.globalAlpha = state.globalAlpha;
      this.globalCompositeOperation = state.globalCompositeOperation;
      this.miterLimit = state.miterLimit;
      this.lineDashOffset = state.lineDashOffset;
      this.lineDashList = state.lineDashList;
      if (state.transformMatrix) {
        this.transformMatrix = state.transformMatrix;
      }
    }
  }

  _transformPoint(x, y) {
    const m = this.transformMatrix;
    return {
      x: m[0] * x + m[2] * y + m[4],
      y: m[1] * x + m[3] * y + m[5],
    };
  }

  _getTransformedPath(pathCommands) {
    if (!pathCommands) return [];
    const transformedPath = [];
    for (const command of pathCommands) {
        const newCommand = { ...command };
        if (command.type === 'move' || command.type === 'line') {
            const p = this._transformPoint(command.x, command.y);
            newCommand.x = p.x;
            newCommand.y = p.y;
        } else if (command.type === 'bezier') {
            const p = this._transformPoint(command.x, command.y);
            newCommand.x = p.x;
            newCommand.y = p.y;
            const cp1 = this._transformPoint(command.cp1x, command.cp1y);
            newCommand.cp1x = cp1.x;
            newCommand.cp1y = cp1.y;
            const cp2 = this._transformPoint(command.cp2x, command.cp2y);
            newCommand.cp2x = cp2.x;
            newCommand.cp2y = cp2.y;
        } else if (command.type === 'arc') {
            const p = this._transformPoint(command.x, command.y);
            newCommand.x = p.x;
            newCommand.y = p.y;
            // NOTE: Radius is not transformed, so non-uniform scales will look incorrect.
        }
        transformedPath.push(newCommand);
    }
    return transformedPath;
  }

  getTransform() {
    return new DOMMatrix(this.transformMatrix);
  }

  setTransform(a, b, c, d, e, f) {
     if (a instanceof DOMMatrix) {
       [a, b, c, d, e, f] = a.toFloat64Array();
     }
     this.transformMatrix = [a, b, c, d, e, f];
  }

  resetTransform() {
    this.transformMatrix = [1, 0, 0, 1, 0, 0];
  }

  transform(a, b, c, d, e, f) {
    const m1 = this.transformMatrix;
    const m2 = [a, b, c, d, e, f];

    const a_new = m1[0] * m2[0] + m1[2] * m2[1];
    const b_new = m1[1] * m2[0] + m1[3] * m2[1];
    const c_new = m1[0] * m2[2] + m1[2] * m2[3];
    const d_new = m1[1] * m2[2] + m1[3] * m2[3];
    const e_new = m1[0] * m2[4] + m1[2] * m2[5] + m1[4];
    const f_new = m1[1] * m2[4] + m1[3] * m2[5] + m1[5];

    this.transformMatrix = [a_new, b_new, c_new, d_new, e_new, f_new];
  }

  translate(x, y) {
    this.transform(1, 0, 0, 1, x, y);
  }

  scale(x, y) {
    this.transform(x, 0, 0, y, 0, 0);
  }

  rotate(angle) {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    this.transform(cos, sin, -sin, cos, 0, 0);
  }

  _parseFont() {
      const parts = this.font.split(' ');
      const size = parseFloat(parts[0]);
      const family = parts.slice(1).join(' ');
      return { size, family };
  }

  _renderText(text, x, y, action) {
      const { size } = this._parseFont();
      if (size <= 0) return;

      const scale = ScaleForPixelHeight(this.fontInfo, size);
      const { ascent } = GetFontVMetrics(this.fontInfo);
      let currentX = x;
      const baseline = y + ascent * scale;

      this.beginPath();

      for (let i = 0; i < text.length; i++) {
          const codepoint = text.charCodeAt(i);
          const glyphIndex = FindGlyphIndex(this.fontInfo, codepoint);
          const vertices = GetGlyphShape(this.fontInfo, glyphIndex);

          if (vertices) {
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
                      this.quadraticCurveTo(vcx, vcy, vx, vy);
                  }
              }
          }

          const { advanceWidth } = GetCodepointHMetrics(this.fontInfo, codepoint);
          currentX += advanceWidth * scale;

          if (i < text.length - 1) {
              const kern = GetCodepointKernAdvance(this.fontInfo, codepoint, text.charCodeAt(i + 1));
              currentX += kern * scale;
          }
      }

      if (action === 'fill') {
          this.fill();
      } else if (action === 'stroke') {
          this.stroke();
      }
  }

  fillText(text, x, y) {
    this._renderText(text, x, y, 'fill');
  }

  strokeText(text, x, y) {
    this._renderText(text, x, y, 'stroke');
  }

  getLineDash() {
    return [...this.lineDashList];
  }

  setLineDash(segments) {
    if (!Array.isArray(segments) || segments.some(isNaN)) {
        return;
    }
    if (segments.length % 2 !== 0) {
        this.lineDashList = [...segments, ...segments];
    } else {
        this.lineDashList = [...segments];
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

  clip(pathOrFillRule, fillRule) {
    let path;
    if (pathOrFillRule instanceof Path2D) {
      path = pathOrFillRule.path;
    } else {
      path = this.path;
    }

    this.clippingPath = [...path];
    const vertices = [];
    let currentX = 0, currentY = 0;
    for (const command of this.clippingPath) {
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
    this.clippingPathAsVertices = vertices;
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

  roundRect(x, y, w, h, radii) {
    if (typeof radii === 'undefined') radii = 0;
    if (typeof radii === 'number') radii = [radii];
    if (radii.some(r => r < 0)) throw new RangeError('Radii must be non-negative');
    let r1, r2, r3, r4;
    if (radii.length === 1) r1 = r2 = r3 = r4 = radii[0];
    else if (radii.length === 2) { r1 = r3 = radii[0]; r2 = r4 = radii[1]; }
    else if (radii.length === 3) { r1 = radii[0]; r2 = r4 = radii[1]; r3 = radii[2]; }
    else if (radii.length === 4) [r1, r2, r3, r4] = radii;
    else return;
    this.beginPath();
    this.moveTo(x + r1, y);
    this.lineTo(x + w - r2, y);
    this.arc(x + w - r2, y + r2, r2, -Math.PI / 2, 0);
    this.lineTo(x + w, y + h - r3);
    this.arc(x + w - r3, y + h - r3, r3, 0, Math.PI / 2);
    this.lineTo(x + r4, y + h);
    this.arc(x + r4, y + h - r4, r4, Math.PI / 2, Math.PI);
    this.lineTo(x, y + r1);
    this.arc(x + r1, y + r1, r1, Math.PI, Math.PI * 1.5);
    this.closePath();
  }

  bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y) {
    this.path.push({ type: 'bezier', cp1x, cp1y, cp2x, cp2y, x, y });
  }

  quadraticCurveTo(cpx, cpy, x, y) {
    let x0 = 0, y0 = 0;
    if (this.path.length > 0) {
        for (let i = this.path.length - 1; i >= 0; i--) {
            if (this.path[i].x !== undefined && this.path[i].y !== undefined) {
                if(this.path[i].type === 'move' || this.path[i].type === 'line' || this.path[i].type === 'bezier') {
                    x0 = this.path[i].x;
                    y0 = this.path[i].y;
                    break;
                }
                 if(this.path[i].type === 'arc') {
                    x0 = this.path[i].x + this.path[i].radius * Math.cos(this.path[i].endAngle);
                    y0 = this.path[i].y + this.path[i].radius * Math.sin(this.path[i].endAngle);
                    break;
                 }
            }
        }
    }
    const cp1x = x0 + 2/3 * (cpx - x0);
    const cp1y = y0 + 2/3 * (cpy - y0);
    const cp2x = x + 2/3 * (cpx - x);
    const cp2y = y + 2/3 * (cpy - y);
    this.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y);
  }

  stroke(path) {
    this._strokePath(path instanceof Path2D ? path.path : this.path);
  }

  _strokePath(pathCommands) {
    if (!this.isShadowContext) drawShadow(this, pathCommands, true);
    const transformedPathCommands = this._getTransformedPath(pathCommands);
    const originalPath = this.path;
    const subPaths = [];
    let currentSubPath = [];
    for (const command of transformedPathCommands) {
        if (command.type === 'move') {
            if (currentSubPath.length > 0) subPaths.push(currentSubPath);
            currentSubPath = [command];
        } else {
            currentSubPath.push(command);
        }
    }
    if (currentSubPath.length > 0) subPaths.push(currentSubPath);
    this.beginPath();
    for (const subPath of subPaths) {
        const points = [];
        let currentX = 0, currentY = 0;
        for (const command of subPath) {
            if (command.type === 'move') {
                currentX = command.x; currentY = command.y;
                points.push({ x: currentX, y: currentY });
            } else if (command.type === 'line') {
                currentX = command.x; currentY = command.y;
                points.push({ x: currentX, y: currentY });
            } else if (command.type === 'bezier') {
                const fromX = currentX, fromY = currentY;
                if (points.length === 0 || points[points.length-1].x !== fromX || points[points.length-1].y !== fromY) {
                    points.push({x: fromX, y: fromY});
                }
                const numPoints = getBezierPoints(fromX, fromY, command.cp1x, command.cp1y, command.cp2x, command.cp2y, command.x, command.y, this.bezierPoints, 0, this.bezierStack);
                for (let i = 0; i < numPoints; i++) {
                    points.push({ x: this.bezierPoints[i*2], y: this.bezierPoints[i*2+1] });
                }
                currentX = command.x; currentY = command.y;
            } else if (command.type === 'arc') {
                const steps = 50;
                for (let i = 0; i <= steps; i++) {
                    const angle = command.startAngle + (command.endAngle - command.startAngle) * (i / steps);
                    points.push({ x: command.x + command.radius * Math.cos(angle), y: command.y + command.radius * Math.sin(angle) });
                }
                currentX = command.x + command.radius * Math.cos(command.endAngle);
                currentY = command.y + command.radius * Math.sin(command.endAngle);
            }
        }
        const isClosed = subPath[subPath.length - 1].type === 'close';
        const polygons = strokePolyline(points, this.lineWidth, this.lineJoin, isClosed, this.lineDashList, this.lineDashOffset, this.miterLimit);
        for (const polygon of polygons) {
            if (polygon.length > 0) {
                this.moveTo(polygon[0].x, polygon[0].y);
                for (let i = 1; i < polygon.length; i++) this.lineTo(polygon[i].x, polygon[i].y);
                this.closePath();
            }
        }
    }
    if (this.path.length > 0) {
        const strokeFillStyle = this.strokeStyle;
        const oldFillStyle = this.fillStyle;
        this.fillStyle = strokeFillStyle;
        const m = this.getTransform();
        this.resetTransform();
        this._scanlineFill(this.path);
        this.setTransform(m);
        this.fillStyle = oldFillStyle;
    }
    this.path = originalPath;
  }

  fill(pathOrFillRule, fillRule) {
    let path = this.path;
    if (typeof pathOrFillRule === 'string') { /* TODO: handle fillRule */ }
    else if (pathOrFillRule instanceof Path2D) path = pathOrFillRule.path;
    if (path.length > 0) this._scanlineFill(path);
  }

  _scanlineFill(pathCommands) {
    if (!this.isShadowContext) drawShadow(this, pathCommands, false);
    const filledImageData = scanlineFill(
        pathCommands, this.width, this.height, this.fillStyle, this.globalAlpha,
        this._getTransformedPath.bind(this), this.constructor,
        this._getColorFromGradientAtPoint.bind(this),
        this._getColorFromPatternAtPoint.bind(this),
        this._parseColor.bind(this)
    );
    compositeImageData(this.imageData, filledImageData, this.globalCompositeOperation);
  }

  _isPointInPath(x, y, vertices) {
    let inside = false;
    for (let i = 0, j = vertices.length - 1; i < vertices.length; j = i++) {
      const xi = vertices[i].x, yi = vertices[i].y;
      const xj = vertices[j].x, yj = vertices[j].y;
      if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) inside = !inside;
    }
    return inside;
  }

  getImageData(x, y, w, h) {
    const { data, width: canvasWidth } = this.imageData;
    const newData = new Uint8ClampedArray(w * h * 4);
    for (let j = 0; j < h; j++) {
      for (let i = 0; i < w; i++) {
        const sourceX = x + i, sourceY = y + j;
        if (sourceX >= 0 && sourceX < canvasWidth && sourceY >= 0 && sourceY < this.height) {
            const sourceIndex = (sourceY * canvasWidth + sourceX) * 4;
            const destIndex = (j * w + i) * 4;
            newData[destIndex] = data[sourceIndex];
            newData[destIndex + 1] = data[sourceIndex + 1];
            newData[destIndex + 2] = data[sourceIndex + 2];
            newData[destIndex + 3] = data[sourceIndex + 3];
        }
      }
    }
    return { data: newData, width: w, height: h };
  }

  putImageData(imageData, dx, dy) {
    const { data: sourceData, width: sourceWidth, height: sourceHeight } = imageData;
    const { data: destData, width: destWidth, height: destHeight } = this.imageData;
    for (let y = 0; y < sourceHeight; y++) {
      for (let x = 0; x < sourceWidth; x++) {
        const destX = dx + x, destY = dy + y;
        if (destX >= 0 && destX < destWidth && destY >= 0 && destY < destHeight) {
          const sourceIndex = (y * sourceWidth + x) * 4;
          const destIndex = (destY * destWidth + destX) * 4;
          destData[destIndex] = sourceData[sourceIndex];
          destData[destIndex + 1] = sourceData[sourceIndex + 1];
          destData[destIndex + 2] = sourceData[sourceIndex + 2];
          destData[destIndex + 3] = sourceData[sourceIndex + 3];
        }
      }
    }
  }

  _parseColor(colorStr) {
    if (typeof colorStr !== 'string') return { r: 0, g: 0, b: 0, a: 0 };
    const colorMap = {
      'black': { r: 0, g: 0, b: 0, a: 255 }, 'white': { r: 255, g: 255, b: 255, a: 255 },
      'red': { r: 255, g: 0, b: 0, a: 255 }, 'green': { r: 0, g: 255, b: 0, a: 255 },
      'blue': { r: 0, g: 0, b: 255, a: 255 }, 'purple': { r: 128, g: 0, b: 128, a: 255 },
      'orange': { r: 255, g: 165, b: 0, a: 255 }, 'yellow': { r: 255, g: 255, b: 0, a: 255 },
      'transparent': { r: 0, g: 0, b: 0, a: 0 },
    };
    if (colorMap[colorStr]) return colorMap[colorStr];
    if (colorStr.startsWith('#')) {
      const hex = colorStr.slice(1);
      if (hex.length === 3) {
        const r = parseInt(hex[0] + hex[0], 16), g = parseInt(hex[1] + hex[1], 16), b = parseInt(hex[2] + hex[2], 16);
        return { r, g, b, a: 255 };
      }
      if (hex.length === 6) {
        const r = parseInt(hex.slice(0, 2), 16), g = parseInt(hex.slice(2, 4), 16), b = parseInt(hex.slice(4, 6), 16);
        return { r, g, b, a: 255 };
      }
    }
    let match = colorStr.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
    if (match) {
        return {
            r: parseInt(match[1]), g: parseInt(match[2]), b: parseInt(match[3]),
            a: match[4] !== undefined ? Math.round(parseFloat(match[4]) * 255) : 255,
        };
    }
    return colorMap['black'];
  }

  createLinearGradient(x0, y0, x1, y1) {
    return new CanvasGradient({ type: 'linear', x0, y0, x1, y1 });
  }

  createRadialGradient(x0, y0, r0, x1, y1, r1) {
    return new CanvasGradient({ type: 'radial', x0, y0, r0, x1, y1, r1 });
  }

  createConicGradient(startAngle, x, y) {
    return new CanvasGradient({ type: 'conic', startAngle, x, y });
  }

  createPattern(image, repetition) {
    return new CanvasPattern(image, repetition);
  }

  _getColorFromGradient(gradient, t) {
      const stops = gradient.colorStops;
      if (stops.length === 0) return { r: 0, g: 0, b: 0, a: 0 };
      let stop1 = stops[0];
      for(const stop of stops) {
          if (stop.offset <= t) stop1 = stop;
          else break;
      }
      let stop2 = stops[stops.length - 1];
      for(let i = stops.length - 1; i >= 0; i--) {
          const stop = stops[i];
          if (stop.offset >= t) stop2 = stop;
          else break;
      }
      if (stop1 === stop2) return this._parseColor(stop1.color);
      const c1 = this._parseColor(stop1.color), c2 = this._parseColor(stop2.color);
      const range = stop2.offset - stop1.offset;
      const interp_ratio = range === 0 ? 0 : (t - stop1.offset) / range;
      const r = c1.r * (1 - interp_ratio) + c2.r * interp_ratio;
      const g = c1.g * (1 - interp_ratio) + c2.g * interp_ratio;
      const b = c1.b * (1 - interp_ratio) + c2.b * interp_ratio;
      const a = c1.a * (1 - interp_ratio) + c2.a * interp_ratio;
      return { r: Math.round(r), g: Math.round(g), b: Math.round(b), a: Math.round(a) };
  }

  _getColorFromGradientAtPoint(x, y, gradient) {
    if (gradient.type === 'linear') return this._getColorFromLinearGradientAtPoint(x, y, gradient);
    if (gradient.type === 'radial') return this._getColorFromRadialGradientAtPoint(x, y, gradient);
    if (gradient.type === 'conic') return this._getColorFromConicGradientAtPoint(x, y, gradient);
    return { r: 0, g: 0, b: 0, a: 0 };
  }

  _getColorFromPatternAtPoint(x, y, pattern) {
    const { image, repetition } = pattern;
    const { width, height, data } = image;
    let sx = x, sy = y;
    if (repetition === 'repeat') {
        sx = sx % width; sy = sy % height;
        if (sx < 0) sx += width; if (sy < 0) sy += height;
    } else if (repetition === 'repeat-x') {
        if (y < 0 || y >= height) return { r: 0, g: 0, b: 0, a: 0 };
        sx = sx % width; if (sx < 0) sx += width;
    } else if (repetition === 'repeat-y') {
        if (x < 0 || x >= width) return { r: 0, g: 0, b: 0, a: 0 };
        sy = sy % height; if (sy < 0) sy += height;
    } else {
        if (x < 0 || x >= width || y < 0 || y >= height) return { r: 0, g: 0, b: 0, a: 0 };
    }
    const index = (Math.floor(sy) * width + Math.floor(sx)) * 4;
    return { r: data[index], g: data[index + 1], b: data[index + 2], a: data[index + 3] };
  }

  _getColorFromConicGradientAtPoint(x, y, gradient) {
    const { startAngle, x: gx, y: gy } = gradient;
    let angle = Math.atan2(y - gy, x - gx);
    angle -= startAngle;
    angle %= (2 * Math.PI);
    if (angle < 0) angle += 2 * Math.PI;
    const t = angle / (2 * Math.PI);
    return this._getColorFromGradient(gradient, t);
  }

  _getColorFromLinearGradientAtPoint(x, y, gradient) {
    const { x0, y0, x1, y1 } = gradient;
    const dx = x1 - x0, dy = y1 - y0;
    const mag_sq = dx * dx + dy * dy;
    if (mag_sq === 0) return this._parseColor(gradient.colorStops.length > 0 ? gradient.colorStops[gradient.colorStops.length - 1].color : 'black');
    const px = x - x0, py = y - y0;
    let t = (px * dx + py * dy) / mag_sq;
    t = Math.max(0, Math.min(1, t));
    return this._getColorFromGradient(gradient, t);
  }

  _getColorFromRadialGradientAtPoint(x, y, gradient) {
    const { x0, y0, r0, x1, y1, r1 } = gradient;
    const dx = x1 - x0, dy = y1 - y0, dr = r1 - r0;
    const a = dx * dx + dy * dy - dr * dr;
    if (a === 0) {
        const dist = Math.sqrt((x - x0) ** 2 + (y - y0) ** 2);
        return this._getColorFromGradient(gradient, Math.max(0, Math.min(1, (dist - r0) / dr)));
    }
    const b = 2 * ((x - x0) * dx + (y - y0) * dy - r0 * dr);
    const c = (x - x0) ** 2 + (y - y0) ** 2 - r0 * r0;
    const discriminant = b * b - 4 * a * c;
    if (discriminant < 0) return { r: 0, g: 0, b: 0, a: 0 };
    const t1 = (-b + Math.sqrt(discriminant)) / (2 * a);
    const t2 = (-b - Math.sqrt(discriminant)) / (2 * a);
    let t = -1;
    if (t1 >= 0 && t1 <= 1) t = t1;
    if (t2 >= 0 && t2 <= 1 && (t === -1 || t2 < t)) t = t2;
    if (t === -1) return { r: 0, g: 0, b: 0, a: 0 };
    return this._getColorFromGradient(gradient, Math.max(0, Math.min(1, t)));
  }

  fillRect(x, y, width, height) {
    const oldPath = this.path;
    this.beginPath();
    this.rect(x, y, width, height);
    this.fill();
    this.path = oldPath;
  }

  clearRect(x, y, width, height) {
    const { data, width: canvasWidth } = this.imageData;
    const xStart = Math.max(0, x), yStart = Math.max(0, y);
    const xEnd = Math.min(this.width, x + width), yEnd = Math.min(this.height, y + height);
    for (let j = yStart; j < yEnd; j++) {
      for (let i = xStart; i < xEnd; i++) {
        const index = (j * canvasWidth + i) * 4;
        data[index] = data[index + 1] = data[index + 2] = data[index + 3] = 0;
      }
    }
  }

  strokeRect(x, y, width, height) {
    const oldPath = this.path;
    this.beginPath();
    this.rect(x, y, width, height);
    this.stroke();
    this.path = oldPath;
  }

  arc(x, y, radius, startAngle, endAngle, anticlockwise = false) {
    this.path.push({ type: 'arc', x, y, radius, startAngle, endAngle, anticlockwise });
  }

  ellipse(x, y, radiusX, radiusY, rotation, startAngle, endAngle) {
    const kappa = 0.552284749831;
    const ox = radiusX * kappa, oy = radiusY * kappa;
    this.moveTo(x - radiusX, y);
    this.bezierCurveTo(x - radiusX, y - oy, x - ox, y - radiusY, x, y - radiusY);
    this.bezierCurveTo(x + ox, y - radiusY, x + radiusX, y - oy, x + radiusX, y);
    this.bezierCurveTo(x + radiusX, y + oy, x + ox, y + radiusY, x, y + radiusY);
    this.bezierCurveTo(x - ox, y + radiusY, x - radiusX, y + oy, x - radiusX, y);
    this.closePath();
  }

  drawImage(image, ...args) {
    if (!image || !image.data) return;
    let sx = 0, sy = 0, sWidth = image.width, sHeight = image.height;
    let dx, dy, dWidth, dHeight;
    if (args.length === 2) { [dx, dy] = args; dWidth = image.width; dHeight = image.height; }
    else if (args.length === 4) [dx, dy, dWidth, dHeight] = args;
    else if (args.length === 8) [sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight] = args;
    else throw new Error(`Invalid number of arguments for drawImage: ${args.length + 1}`);
    const p1 = this._transformPoint(dx, dy), p2 = this._transformPoint(dx + dWidth, dy);
    const p3 = this._transformPoint(dx + dWidth, dy + dHeight), p4 = this._transformPoint(dx, dy + dHeight);
    const minX = Math.floor(Math.min(p1.x, p2.x, p3.x, p4.x));
    const minY = Math.floor(Math.min(p1.y, p2.y, p3.y, p4.y));
    const maxX = Math.ceil(Math.max(p1.x, p2.x, p3.x, p4.x));
    const maxY = Math.ceil(Math.max(p1.y, p2.y, p3.y, p4.y));
    const { data: sourceData, width: sourceWidth } = image;
    const { data: destData, width: destWidth } = this.imageData;
    const inv = this.getTransform().inverse().toFloat64Array();
    for (let j = minY; j < maxY; j++) {
      for (let i = minX; i < maxX; i++) {
        const orig_x = i * inv[0] + j * inv[2] + inv[4];
        const orig_y = i * inv[1] + j * inv[3] + inv[5];
        const u = (orig_x - dx) / dWidth, v = (orig_y - dy) / dHeight;
        if (u >= 0 && u < 1 && v >= 0 && v < 1) {
          const sourceX = Math.floor(sx + u * sWidth), sourceY = Math.floor(sy + v * sHeight);
          if (i >= 0 && i < this.width && j >= 0 && j < this.height) {
            const sourceIndex = (sourceY * sourceWidth + sourceX) * 4;
            const destIndex = (j * destWidth + i) * 4;
            destData[destIndex] = sourceData[sourceIndex];
            destData[destIndex + 1] = sourceData[sourceIndex + 1];
            destData[destIndex + 2] = sourceData[sourceIndex + 2];
            destData[destIndex + 3] = sourceData[sourceIndex + 3];
          }
        }
      }
    }
  }
}
