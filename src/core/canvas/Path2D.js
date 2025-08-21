export class Path2D {
  constructor(path) {
    this.path = [];
    if (path instanceof Path2D) {
      // Copy the path commands from the existing Path2D object
      this.path = [...path.path];
    } else if (typeof path === 'string') {
      // SVG path data string - not implemented yet
      console.warn('Path2D constructor with SVG path data is not implemented yet.');
    }
  }

  addPath(path, transform) {
    // Note: The 'transform' argument is not yet implemented.
    if (transform) {
      console.warn('The transform argument in addPath is not implemented yet.');
    }
    if (path instanceof Path2D) {
      this.path.push(...path.path);
    }
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

  bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y) {
    this.path.push({ type: 'bezier', cp1x, cp1y, cp2x, cp2y, x, y });
  }

  quadraticCurveTo(cpx, cpy, x, y) {
    // Find the last point in the path to use as the starting point.
    let x0 = 0;
    let y0 = 0;
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

    // Convert quadratic to cubic
    const cp1x = x0 + 2/3 * (cpx - x0);
    const cp1y = y0 + 2/3 * (cpy - y0);
    const cp2x = x + 2/3 * (cpx - x);
    const cp2y = y + 2/3 * (cpy - y);

    this.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y);
  }

  arc(x, y, radius, startAngle, endAngle, anticlockwise = false) {
    this.path.push({ type: 'arc', x, y, radius, startAngle, endAngle, anticlockwise });
  }

  arcTo(x1, y1, x2, y2, radius) {
    // Not implemented yet
    console.warn('arcTo is not implemented yet.');
  }

  ellipse(x, y, radiusX, radiusY, rotation, startAngle, endAngle, anticlockwise = false) {
    // This implementation is a simplified version that draws a full ellipse
    // aligned with the axes, matching the behavior in CanvasRenderingContext2D.
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

  rect(x, y, w, h) {
    this.moveTo(x, y);
    this.lineTo(x + w, y);
    this.lineTo(x + w, y + h);
    this.lineTo(x, y + h);
    this.closePath();
  }
}
