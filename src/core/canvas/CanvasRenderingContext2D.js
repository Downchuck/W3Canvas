import { bresenham } from '../algorithms/bresenham.js';
import { drawArc, fillArcWithMidpoint, getArcScanlineIntersections } from '../algorithms/arc.js';
import { getBezierPoints, getBezierYIntercepts, getBezierXforT } from '../algorithms/bezier.js';
import { strokePolyline } from '../algorithms/stroke.js';
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
    this.lineWidth = 1.0;
    this.lineJoin = 'miter';
    this.lineCap = 'butt';
    this.font = '10px sans-serif';
    this.textAlign = 'start';
    this.stateStack = [];
    this.textBaseline = 'alphabetic';
    this.path = [];
    this.clippingPath = null;
    this.clippingPathAsVertices = null;

    // Load font
    this.fontInfo = new FontInfo();
    const fontBuffer = fs.readFileSync('fonts/DejaVuSans.ttf');
    const fontData = new Uint8Array(fontBuffer);
    InitFont(this.fontInfo, fontData);

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

  clip() {
    this.clippingPath = [...this.path];

    // Convert path to vertices for _isPointInPath
    const vertices = [];
    let currentX = 0;
    let currentY = 0;

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
    if (w < 0) {
      x = x + w;
      w = -w;
    }
    if (h < 0) {
      y = y + h;
      h = -h;
    }

    let r = [0, 0, 0, 0];
    if (typeof radii === 'number') {
      r = [radii, radii, radii, radii];
    } else if (Array.isArray(radii)) {
      if (radii.length === 1) {
        r = [radii[0], radii[0], radii[0], radii[0]];
      } else if (radii.length === 2) {
        r = [radii[0], radii[1], radii[0], radii[1]];
      } else if (radii.length === 3) {
        r = [radii[0], radii[1], radii[2], radii[1]];
      } else {
        r = radii;
      }
    }

    const [tl, tr, br, bl] = r.map(radius => Math.min(Math.max(0, radius), w / 2, h / 2));

    this.moveTo(x + tl, y);
    this.lineTo(x + w - tr, y);
    this.quadraticCurveTo(x + w, y, x + w, y + tr);
    this.lineTo(x + w, y + h - br);
    this.quadraticCurveTo(x + w, y + h, x + w - br, y + h);
    this.lineTo(x + bl, y + h);
    this.quadraticCurveTo(x, y + h, x, y + h - bl);
    this.lineTo(x, y + tl);
    this.quadraticCurveTo(x, y, x + tl, y);
    this.closePath();
  }

  quadraticCurveTo(cp1x, cp1y, x, y) {
    const lastPoint = this.path.length > 0 ? this.path[this.path.length - 1] : { x: 0, y: 0 };
    if (lastPoint.type === 'move' || lastPoint.type === 'line' || lastPoint.type === 'bezier' || lastPoint.type === 'arc') {
      const startX = lastPoint.x;
      const startY = lastPoint.y;
      this.bezierCurveTo(
        startX + 2/3 * (cp1x - startX),
        startY + 2/3 * (cp1y - startY),
        x + 2/3 * (cp1x - x),
        y + 2/3 * (cp1y - y),
        x,
        y
      );
    }
  }

  bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y) {
    this.path.push({ type: 'bezier', cp1x, cp1y, cp2x, cp2y, x, y });
  }

  stroke() {
    if (this.path.length === 0) {
      return;
    }
    this._strokePath();
  }

  _legacyStroke() {
      let currentX = 0;
      let currentY = 0;
      let startX = 0;
      let startY = 0;
      for (const command of this.path) {
          switch (command.type) {
              case 'move': currentX = command.x; currentY = command.y; startX = command.x; startY = command.y; break;
              case 'line': this._drawLine(currentX, currentY, command.x, command.y); currentX = command.x; currentY = command.y; break;
              case 'bezier': {
                  // Explicitly draw the start point (like a round cap) to ensure it's there.
                  this._drawLine(currentX, currentY, currentX, currentY);
                  const numPoints = getBezierPoints(currentX, currentY, command.cp1x, command.cp1y, command.cp2x, command.cp2y, command.x, command.y, this.bezierPoints, 0, this.bezierStack);
                  for (let i = 0; i < numPoints; i++) {
                      this._drawLine(currentX, currentY, this.bezierPoints[i*2], this.bezierPoints[i*2+1]);
                      currentX = this.bezierPoints[i*2];
                      currentY = this.bezierPoints[i*2+1];
                  }
                  break;
              }
              case 'close': this._drawLine(currentX, currentY, startX, startY); currentX = startX; currentY = startY; break;
              case 'arc': {
                  const color = this._parseColor(this.strokeStyle);
                  drawArc(this, color, command.x, command.y, command.radius, command.startAngle, command.endAngle);
                  currentX = command.x + command.radius * Math.cos(command.endAngle);
                  currentY = command.y + command.radius * Math.sin(command.endAngle);
                  break;
              }
          }
      }
  }

  _strokePath() {
    const originalPath = this.path;
    const subPaths = [];
    let currentSubPath = [];

    // First, split the path into sub-paths
    for (const command of originalPath) {
        if (command.type === 'move') {
            if (currentSubPath.length > 0) {
                subPaths.push(currentSubPath);
            }
            currentSubPath = [command];
        } else {
            currentSubPath.push(command);
        }
    }
    if (currentSubPath.length > 0) {
        subPaths.push(currentSubPath);
    }

    // Clear the current path to build the new stroke path
    this.beginPath();

    for (const subPath of subPaths) {
        const points = [];
        let currentX = 0;
        let currentY = 0;

        // First, convert the entire sub-path into a single polyline
        for (const command of subPath) {
            if (command.type === 'move') {
                currentX = command.x;
                currentY = command.y;
                points.push({ x: currentX, y: currentY });
            } else if (command.type === 'line') {
                currentX = command.x;
                currentY = command.y;
                points.push({ x: currentX, y: currentY });
            } else if (command.type === 'bezier') {
                const fromX = currentX;
                const fromY = currentY;
                // We need to include the start point of the bezier curve
                if (points.length === 0 || points[points.length-1].x !== fromX || points[points.length-1].y !== fromY) {
                    points.push({x: fromX, y: fromY});
                }
                const numPoints = getBezierPoints(fromX, fromY, command.cp1x, command.cp1y, command.cp2x, command.cp2y, command.x, command.y, this.bezierPoints, 0, this.bezierStack);
                for (let i = 0; i < numPoints; i++) {
                    points.push({ x: this.bezierPoints[i*2], y: this.bezierPoints[i*2+1] });
                }
                currentX = command.x;
                currentY = command.y;
            } else if (command.type === 'arc') {
                const steps = 50; // Tessellation for arc in stroke
                for (let i = 0; i <= steps; i++) {
                    const angle = command.startAngle + (command.endAngle - command.startAngle) * (i / steps);
                    points.push({
                        x: command.x + command.radius * Math.cos(angle),
                        y: command.y + command.radius * Math.sin(angle)
                    });
                }
                currentX = command.x + command.radius * Math.cos(command.endAngle);
                currentY = command.y + command.radius * Math.sin(command.endAngle);
            }
        }

        // Now that we have a polyline, stroke it.
        const isClosed = subPath[subPath.length - 1].type === 'close';
        const polygon = strokePolyline(points, this.lineWidth, this.lineJoin, isClosed);

        if (polygon.length > 0) {
            this.moveTo(polygon[0].x, polygon[0].y);
            for (let i = 1; i < polygon.length; i++) {
                this.lineTo(polygon[i].x, polygon[i].y);
            }
            this.closePath();
        }
    }

    // If we built a new path to fill, fill it.
    if (this.path.length > 0) {
        const strokeFillStyle = this.strokeStyle;
        const oldFillStyle = this.fillStyle;
        this.fillStyle = strokeFillStyle;
        this.fill();
        this.fillStyle = oldFillStyle;
    }

    // Restore original path
    this.path = originalPath;
  }

  fill() {
    if (this.path.length === 0) {
      return;
    }
    this._scanlineFill();
  }

  _scanlineFill() {
    // Optimization: if the path is a single full circle, use a specialized fill algorithm.
    if (this.path.length === 1 && this.path[0].type === 'arc' && this.path[0].endAngle - this.path[0].startAngle >= 2 * Math.PI) {
        const command = this.path[0];
        const color = this._parseColor(this.fillStyle);
        fillArcWithMidpoint(this, color, command.x, command.y, command.radius, command.startAngle, command.endAngle);
        this.path = []; // Clear the path after filling
        return;
    }

    const allEdges = [];
    let currentX = 0;
    let currentY = 0;
    let startX = 0;
    let startY = 0;

    const addEdge = (edge) => {
        if (edge.y_min === edge.y_max) return; // Ignore horizontal edges
        allEdges.push(edge);
    };

    for (const command of this.path) {
        switch (command.type) {
            case 'move':
                currentX = command.x;
                currentY = command.y;
                startX = command.x;
                startY = command.y;
                break;
            case 'line': {
                const y_min = Math.min(currentY, command.y);
                const y_max = Math.max(currentY, command.y);
                const x_at_ymin = currentY < command.y ? currentX : command.x;
                const slope_inv = (command.x - currentX) / (command.y - currentY);
                addEdge({ type: 'line', y_min, y_max, x_at_ymin, slope_inv });
                currentX = command.x;
                currentY = command.y;
                break;
            }
            case 'bezier': {
                const p0 = { x: currentX, y: currentY };
                const p1 = { x: command.cp1x, y: command.cp1y };
                const p2 = { x: command.cp2x, y: command.cp2y };
                const p3 = { x: command.x, y: command.y };
                const y_min = Math.min(p0.y, p1.y, p2.y, p3.y);
                const y_max = Math.max(p0.y, p1.y, p2.y, p3.y);
                addEdge({ type: 'bezier', p0, p1, p2, p3, y_min, y_max });
                currentX = command.x;
                currentY = command.y;
                break;
            }
            case 'close':
                const y_min = Math.min(currentY, startY);
                const y_max = Math.max(currentY, startY);
                const x_at_ymin = currentY < startY ? currentX : startX;
                const slope_inv = (startX - currentX) / (startY - currentY);
                addEdge({ type: 'line', y_min, y_max, x_at_ymin, slope_inv });
                currentX = startX;
                currentY = startY;
                break;
            case 'arc': {
                const y_min = command.y - command.radius;
                const y_max = command.y + command.radius;
                addEdge({ type: 'arc', ...command, y_min, y_max });
                currentX = command.x + command.radius * Math.cos(command.endAngle);
                currentY = command.y + command.radius * Math.sin(command.endAngle);
                break;
            }
        }
    }

    if (allEdges.length === 0) {
        return;
    }

    const { data, width: canvasWidth } = this.imageData;
    let color;
    const isGradient = this.fillStyle instanceof CanvasGradient;

    let minY = Infinity;
    let maxY = -Infinity;
    for (const edge of allEdges) {
        minY = Math.min(minY, edge.y_min);
        maxY = Math.max(maxY, edge.y_max);
    }
    minY = Math.max(0, Math.floor(minY));
    maxY = Math.min(this.height, Math.ceil(maxY));

    const activeEdges = [];

    for (let y = minY; y < maxY; y++) {
        // Add edges from allEdges to activeEdges if they start at this scanline
        for (const edge of allEdges) {
            if (Math.round(edge.y_min) === y) {
                if (edge.type === 'line') {
                    activeEdges.push({ ...edge, current_x: edge.x_at_ymin });
                } else {
                    activeEdges.push({ ...edge });
                }
            }
        }

        // Remove edges from activeEdges if they end at this scanline
        for (let i = activeEdges.length - 1; i >= 0; i--) {
            if (y >= Math.round(activeEdges[i].y_max)) {
                activeEdges.splice(i, 1);
            }
        }

        const intersections = [];
        for (const edge of activeEdges) {
            if (edge.type === 'bezier') {
                const p0 = edge.p0, p1 = edge.p1, p2 = edge.p2, p3 = edge.p3;
                const roots = getBezierYIntercepts(p0, p1, p2, p3, y);
                for (const t of roots) {
                    if (t >= 0 && t <= 1) {
                        intersections.push(getBezierXforT(p0, p1, p2, p3, t));
                    }
                }
            } else if (edge.type === 'arc') {
                const arcIntersections = getArcScanlineIntersections(edge.x, edge.y, edge.radius, edge.startAngle, edge.endAngle, y);
                intersections.push(...arcIntersections);
            } else { // It's a line
                intersections.push(edge.current_x);
            }
        }

        intersections.sort((a, b) => a - b);

        for (let i = 0; i < intersections.length; i += 2) {
            if (i + 1 < intersections.length) {
                const x_start = Math.round(intersections[i]);
                const x_end = Math.round(intersections[i + 1]);
                for (let x = x_start; x < x_end; x++) {
                    if (x >= 0 && x < this.width) {
                         if (this.clippingPath && !this._isPointInPath(x, y, this.clippingPathAsVertices)) {
                            continue;
                        }
                        const index = (y * canvasWidth + x) * 4;
                        if (isGradient) {
                            color = this._getColorFromGradientAtPoint(x, y, this.fillStyle);
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

        // Update x for next scanline
        for (const edge of activeEdges) {
            if (edge.type === 'line') {
                edge.current_x += edge.slope_inv;
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
    // TODO: This is a very simple color parser. It needs to be expanded to
    // support all CSS color formats, like rgb(), rgba(), hsl(), etc.
    // It only handles a few named colors and hex codes, plus 'purple'
    // for testing.
    const colorMap = {
      'black': { r: 0, g: 0, b: 0, a: 255 },
      'white': { r: 255, g: 255, b: 255, a: 255 },
      'red': { r: 255, g: 0, b: 0, a: 255 },
      'green': { r: 0, g: 255, b: 0, a: 255 },
      'blue': { r: 0, g: 0, b: 255, a: 255 },
      'purple': { r: 128, g: 0, b: 128, a: 255 },
      'orange': { r: 255, g: 165, b: 0, a: 255 },
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
        if (this.clippingPath && !this._isPointInPath(i, j, this.clippingPathAsVertices)) {
            continue;
        }
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
        if (this.clippingPath && !this._isPointInPath(i, j, this.clippingPathAsVertices)) {
            continue;
        }
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
    if (this.clippingPath) {
        const plot = (x, y, c) => {
            if (this._isPointInPath(x, y, this.clippingPathAsVertices)) {
                if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
                    const index = (y * this.width + x) * 4;
                    this.imageData.data[index] = c.r;
                    this.imageData.data[index + 1] = c.g;
                    this.imageData.data[index + 2] = c.b;
                    this.imageData.data[index + 3] = c.a;
                }
            }
        };
        bresenham(this.imageData, color, x0, y0, x1, y1, plot);
    } else {
        bresenham(this.imageData, color, x0, y0, x1, y1);
    }
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
