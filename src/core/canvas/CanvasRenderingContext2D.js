import { bresenham } from '../algorithms/bresenham.js';
import { drawArc, fillArcWithMidpoint, getArcScanlineIntersections } from '../algorithms/arc.js';
import { getBezierPoints, getBezierYIntercepts, getBezierXforT } from '../algorithms/bezier.js';
import { strokePolyline } from '../algorithms/stroke.js';
import { CanvasGradient } from './CanvasGradient.js';
import { CanvasPattern } from './CanvasPattern.js';
import { Path2D } from './Path2D.js';
import { drawShadow } from './Shadow.js';
import fs from 'fs';
import {
    FontInfo, InitFont, FindGlyphIndex, GetGlyphShape, GetCodepointHMetrics,
    GetCodepointKernAdvance, ScaleForPixelHeight, GetFontVMetrics,
    STBTT_vmove, STBTT_vline, STBTT_vcurve
} from '../../stb-truetype/index.js';


export class CanvasRenderingContext2D {
  constructor(width, height, options = {}) {
    this.isShadowContext = !!options.isShadowContext;
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
    this.textBaseline = 'alphabetic';
    this.shadowBlur = 0;
    this.shadowColor = 'rgba(0, 0, 0, 0)';
    this.shadowOffsetX = 0;
    this.shadowOffsetY = 0;
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

  getTransform() {
    return [...this.transformMatrix];
  }

  setTransform(a, b, c, d, e, f) {
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

                  // Apply transformation
                  const p = this._transformPoint(vx, vy);
                  const cp = this._transformPoint(vcx, vcy);

                  if (v.type === STBTT_vmove) {
                      this.moveTo(p.x, p.y);
                  } else if (v.type === STBTT_vline) {
                      this.lineTo(p.x, p.y);
                  } else if (v.type === STBTT_vcurve) {
                      this.quadraticCurveTo(cp.x, cp.y, p.x, p.y);
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
      // TODO: Handle fillRule
    } else {
      path = this.path;
      // TODO: Handle pathOrFillRule as fillRule
    }

    this.clippingPath = [...path];

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
    // Normalize radii
    if (typeof radii === 'undefined') {
      radii = 0;
    }
    if (typeof radii === 'number') {
      radii = [radii];
    }
    if (radii.some(r => r < 0)) {
        throw new RangeError('Radii must be non-negative');
    }

    let r1, r2, r3, r4;
    if (radii.length === 1) {
        r1 = r2 = r3 = r4 = radii[0];
    } else if (radii.length === 2) {
        r1 = r3 = radii[0];
        r2 = r4 = radii[1];
    } else if (radii.length === 3) {
        r1 = radii[0];
        r2 = r4 = radii[1];
        r3 = radii[2];
    } else if (radii.length === 4) {
        [r1, r2, r3, r4] = radii;
    } else {
        return;
    }

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
    // Find the last point in the path to use as the starting point.
    let x0 = 0;
    let y0 = 0;
    if (this.path.length > 0) {
        // Find the last point with coordinates in the path
        for (let i = this.path.length - 1; i >= 0; i--) {
            if (this.path[i].x !== undefined && this.path[i].y !== undefined) {
                 // Check for 'move' or 'line' or 'bezier' end points
                if(this.path[i].type === 'move' || this.path[i].type === 'line' || this.path[i].type === 'bezier') {
                    x0 = this.path[i].x;
                    y0 = this.path[i].y;
                    break;
                }
                 // For arcs, the last point is more complex, but we can approximate
                 if(this.path[i].type === 'arc') {
                    x0 = this.path[i].x + this.path[i].radius * Math.cos(this.path[i].endAngle);
                    y0 = this.path[i].y + this.path[i].radius * Math.sin(this.path[i].endAngle);
                    break;
                 }
            }
        }
    }

    // Convert quadratic to cubic
    const cp1x = x0 + 2/3 * (cpx - x0);
    const cp1y = y0 + 2/3 * (cpy - y0);
    const cp2x = x + 2/3 * (cpx - x);
    const cp2y = y + 2/3 * (cpy - y);

    this.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y);
  }

  stroke(path) {
    if (path instanceof Path2D) {
      if (path.path.length > 0) {
        this._strokePath(path.path);
      }
    } else {
      if (this.path.length > 0) {
        this._strokePath(this.path);
      }
    }
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

  _strokePath(pathCommands) {
    if (!this.isShadowContext) {
        drawShadow(this, pathCommands, true);
    }

    const originalPath = this.path; // Save the context's current default path
    const subPaths = [];
    let currentSubPath = [];

    // First, split the given path into sub-paths
    for (const command of pathCommands) {
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

    // Temporarily clear the context's default path to build the new stroke outline path
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

        // Now that we have a polyline, stroke it by creating a new path that is the outline
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

    // If we built a new path to fill, fill it using the stroke style.
    if (this.path.length > 0) {
        const strokeFillStyle = this.strokeStyle;
        const oldFillStyle = this.fillStyle;
        this.fillStyle = strokeFillStyle;
        this._scanlineFill(this.path); // Fill the new path
        this.fillStyle = oldFillStyle;
    }

    // Restore original default path
    this.path = originalPath;
  }

  fill(pathOrFillRule, fillRule) {
    let path;
    // Overload: fill(fillRule)
    if (typeof pathOrFillRule === 'string') {
      // TODO: handle fillRule
      path = this.path;
    }
    // Overload: fill(path, fillRule)
    else if (pathOrFillRule instanceof Path2D) {
      path = pathOrFillRule.path;
      // TODO: handle fillRule
    }
    // Overload: fill()
    else {
      path = this.path;
    }

    if (path.length === 0) {
      return;
    }
    this._scanlineFill(path);
  }

  _scanlineFill(pathCommands) {
    if (!this.isShadowContext) {
        drawShadow(this, pathCommands, false);
    }

    // Optimization: if the path is a single full circle, use a specialized fill algorithm.
    if (pathCommands.length === 1 && pathCommands[0].type === 'arc' && pathCommands[0].endAngle - pathCommands[0].startAngle >= 2 * Math.PI) {
        const command = pathCommands[0];
        const color = this._parseColor(this.fillStyle);
        fillArcWithMidpoint(this, color, command.x, command.y, command.radius, command.startAngle, command.endAngle);
        // Do not clear the path here, the caller is responsible.
        return;
    }

    const allEdges = [];
    let currentX = 0;
    let currentY = 0;
    let startX = 0;
    let startY = 0;

    const addEdge = (edge) => {
        if (Math.abs(edge.y_min - edge.y_max) < 1e-9) return; // Ignore horizontal edges with a tolerance
        allEdges.push(edge);
    };

    for (const command of pathCommands) {
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
    const isPattern = this.fillStyle instanceof CanvasPattern;

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
                        } else if (isPattern) {
                            color = this._getColorFromPatternAtPoint(x, y, this.fillStyle);
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
    if (typeof colorStr !== 'string') {
        return { r: 0, g: 0, b: 0, a: 0 };
    }
    // TODO: This is a very simple color parser. It needs to be expanded to
    // support all CSS color formats, like hsl(), etc.
    const colorMap = {
      'black': { r: 0, g: 0, b: 0, a: 255 },
      'white': { r: 255, g: 255, b: 255, a: 255 },
      'red': { r: 255, g: 0, b: 0, a: 255 },
      'green': { r: 0, g: 255, b: 0, a: 255 },
      'blue': { r: 0, g: 0, b: 255, a: 255 },
      'purple': { r: 128, g: 0, b: 128, a: 255 },
      'orange': { r: 255, g: 165, b: 0, a: 255 },
      'yellow': { r: 255, g: 255, b: 0, a: 255 },
      'transparent': { r: 0, g: 0, b: 0, a: 0 },
    };

    if (colorMap[colorStr]) {
      return colorMap[colorStr];
    }

    // Handle hex
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

    // Handle rgba(r, g, b, a)
    let match = colorStr.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
    if (match) {
        return {
            r: parseInt(match[1]),
            g: parseInt(match[2]),
            b: parseInt(match[3]),
            a: match[4] !== undefined ? Math.round(parseFloat(match[4]) * 255) : 255,
        };
    }

    // Default to black if color is not recognized
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
    if (gradient.type === 'linear') {
      return this._getColorFromLinearGradientAtPoint(x, y, gradient);
    } else if (gradient.type === 'radial') {
      return this._getColorFromRadialGradientAtPoint(x, y, gradient);
    } else if (gradient.type === 'conic') {
      return this._getColorFromConicGradientAtPoint(x, y, gradient);
    }
    return { r: 0, g: 0, b: 0, a: 0 }; // Should not happen
  }

  _getColorFromPatternAtPoint(x, y, pattern) {
    const { image, repetition } = pattern;
    const { width, height, data } = image;

    let sx = x;
    let sy = y;

    if (repetition === 'repeat') {
        sx = sx % width;
        sy = sy % height;
        if (sx < 0) sx += width;
        if (sy < 0) sy += height;
    } else if (repetition === 'repeat-x') {
        if (y < 0 || y >= height) return { r: 0, g: 0, b: 0, a: 0 };
        sx = sx % width;
        if (sx < 0) sx += width;
    } else if (repetition === 'repeat-y') {
        if (x < 0 || x >= width) return { r: 0, g: 0, b: 0, a: 0 };
        sy = sy % height;
        if (sy < 0) sy += height;
    } else { // no-repeat
        if (x < 0 || x >= width || y < 0 || y >= height) {
            return { r: 0, g: 0, b: 0, a: 0 };
        }
    }

    const index = (Math.floor(sy) * width + Math.floor(sx)) * 4;
    return {
        r: data[index],
        g: data[index + 1],
        b: data[index + 2],
        a: data[index + 3],
    };
  }

  _getColorFromConicGradientAtPoint(x, y, gradient) {
    const { startAngle, x: gx, y: gy } = gradient;
    let angle = Math.atan2(y - gy, x - gx);
    angle -= startAngle;
    angle = angle % (2 * Math.PI);
    if (angle < 0) {
        angle += 2 * Math.PI;
    }
    const t = angle / (2 * Math.PI);
    return this._getColorFromGradient(gradient, t);
  }

  _getColorFromLinearGradientAtPoint(x, y, gradient) {
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

  _getColorFromRadialGradientAtPoint(x, y, gradient) {
    const { x0, y0, r0, x1, y1, r1 } = gradient;

    const dx = x1 - x0;
    const dy = y1 - y0;
    const dr = r1 - r0;

    const a = dx * dx + dy * dy - dr * dr;

    // If the circles are concentric or have the same radius and position
    if (a === 0) {
        const dist = Math.sqrt((x - x0) ** 2 + (y - y0) ** 2);
        const t = (dist - r0) / dr;
        const clampedT = Math.max(0, Math.min(1, t));
        return this._getColorFromGradient(gradient, clampedT);
    }

    const b = 2 * ((x - x0) * dx + (y - y0) * dy - r0 * dr);
    const c = (x - x0) ** 2 + (y - y0) ** 2 - r0 * r0;

    const discriminant = b * b - 4 * a * c;

    if (discriminant < 0) {
      return { r: 0, g: 0, b: 0, a: 0 }; // Outside the gradient
    }

    const t1 = (-b + Math.sqrt(discriminant)) / (2 * a);
    const t2 = (-b - Math.sqrt(discriminant)) / (2 * a);

    // The spec requires using the solution for t that results in the smallest positive radius.
    // However, a simpler interpretation that works for most cases is to pick the
    // t value that is between 0 and 1. If both are, we need to decide which one.
    // For now, we will prefer the smaller positive t.
    let t = -1;
    if (t1 >= 0 && t1 <= 1) {
        t = t1;
    }
    if (t2 >= 0 && t2 <= 1) {
        if (t === -1 || t2 < t) {
            t = t2;
        }
    }

    if (t === -1) {
        return { r: 0, g: 0, b: 0, a: 0 };
    }

    const clampedT = Math.max(0, Math.min(1, t));
    console.log(`RADIAL GRADIENT: x=${x}, y=${y}, dist=${dist}, t=${t}, clampedT=${clampedT}`);
    return this._getColorFromGradient(gradient, clampedT);
  }

  fillRect(x, y, width, height) {
    const oldPath = this.path;
    this.beginPath();

    const p1 = this._transformPoint(x, y);
    const p2 = this._transformPoint(x + width, y);
    const p3 = this._transformPoint(x + width, y + height);
    const p4 = this._transformPoint(x, y + height);

    this.moveTo(p1.x, p1.y);
    this.lineTo(p2.x, p2.y);
    this.lineTo(p3.x, p3.y);
    this.lineTo(p4.x, p4.y);
    this.closePath();

    this._scanlineFill(this.path);

    this.path = oldPath;
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
    const p1 = this._transformPoint(x, y);
    const p2 = this._transformPoint(x + width, y);
    const p3 = this._transformPoint(x + width, y + height);
    const p4 = this._transformPoint(x, y + height);

    this._drawLine(p1.x, p1.y, p2.x, p2.y);
    this._drawLine(p2.x, p2.y, p3.x, p3.y);
    this._drawLine(p3.x, p3.y, p4.x, p4.y);
    this._drawLine(p4.x, p4.y, p1.x, p1.y);
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
    if (!image || !image.data) {
      return;
    }

    let sx = 0, sy = 0, sWidth = image.width, sHeight = image.height;
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

    const p1 = this._transformPoint(dx, dy);
    const p2 = this._transformPoint(dx + dWidth, dy);
    const p3 = this._transformPoint(dx + dWidth, dy + dHeight);
    const p4 = this._transformPoint(dx, dy + dHeight);

    const minX = Math.floor(Math.min(p1.x, p2.x, p3.x, p4.x));
    const minY = Math.floor(Math.min(p1.y, p2.y, p3.y, p4.y));
    const maxX = Math.ceil(Math.max(p1.x, p2.x, p3.x, p4.x));
    const maxY = Math.ceil(Math.max(p1.y, p2.y, p3.y, p4.y));

    const { data: sourceData, width: sourceWidth } = image;
    const { data: destData, width: destWidth } = this.imageData;

    const inv = this.getTransform();
    const det = inv[0] * inv[3] - inv[1] * inv[2];
    if (det === 0) return; // Non-invertible matrix

    const invDet = 1 / det;
    const inv_a = inv[3] * invDet;
    const inv_b = -inv[1] * invDet;
    const inv_c = -inv[2] * invDet;
    const inv_d = inv[0] * invDet;
    const inv_e = (inv[2] * inv[5] - inv[3] * inv[4]) * invDet;
    const inv_f = (inv[1] * inv[4] - inv[0] * inv[5]) * invDet;

    for (let j = minY; j < maxY; j++) {
      for (let i = minX; i < maxX; i++) {
        const orig_x = i * inv_a + j * inv_c + inv_e;
        const orig_y = i * inv_b + j * inv_d + inv_f;

        const u = (orig_x - dx) / dWidth;
        const v = (orig_y - dy) / dHeight;

        if (u >= 0 && u < 1 && v >= 0 && v < 1) {
          const sourceX = Math.floor(sx + u * sWidth);
          const sourceY = Math.floor(sy + v * sHeight);

          if (i >= 0 && i < this.width && j >= 0 && j < this.height) {
            const sourceIndex = (sourceY * sourceWidth + sourceX) * 4;
            const destIndex = (j * destWidth + i) * 4;

            destData[destIndex]     = sourceData[sourceIndex];
            destData[destIndex + 1] = sourceData[sourceIndex + 1];
            destData[destIndex + 2] = sourceData[sourceIndex + 2];
            destData[destIndex + 3] = sourceData[sourceIndex + 3];
          }
        }
      }
    }
  }
}
