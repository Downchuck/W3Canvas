import { parsePath as parseSvgPath } from '../../dom/svg/path_parser.js';

export class Path2D {
  constructor(path) {
    this.path = [];
    if (path instanceof Path2D) {
      this.path = [...path.path];
    } else if (typeof path === 'string') {
      const svgCommands = parseSvgPath(path);
      this._convertSvgPath(svgCommands);
    }
  }

  _convertSvgPath(svgCommands) {
    for (const cmd of svgCommands) {
      switch (cmd.type) {
        case 'M': this.moveTo(cmd.x, cmd.y); break;
        case 'L': this.lineTo(cmd.x, cmd.y); break;
        case 'C': this.bezierCurveTo(cmd.x1, cmd.y1, cmd.x2, cmd.y2, cmd.x, cmd.y); break;
        case 'Q': this.quadraticCurveTo(cmd.x1, cmd.y1, cmd.x, cmd.y); break;
        case 'A': this.ellipse(cmd.cx, cmd.cy, cmd.rx, cmd.ry, cmd.rotation, cmd.startAngle, cmd.endAngle, cmd.anticlockwise); break;
        case 'Z': this.closePath(); break;
      }
    }
  }

  addPath(path, transform) {
    const commands = path.path;
    if (transform) {
      const m = transform;
      for (const cmd of commands) {
        const newCmd = { ...cmd };
        if (cmd.x !== undefined) {
          const p = this._transformPoint(cmd.x, cmd.y, m);
          newCmd.x = p.x;
          newCmd.y = p.y;
        }
        if (cmd.cp1x !== undefined) {
          const p1 = this._transformPoint(cmd.cp1x, cmd.cp1y, m);
          newCmd.cp1x = p1.x;
          newCmd.cp1y = p1.y;
        }
        if (cmd.cp2x !== undefined) {
          const p2 = this._transformPoint(cmd.cp2x, cmd.cp2y, m);
          newCmd.cp2x = p2.x;
          newCmd.cp2y = p2.y;
        }
        this.path.push(newCmd);
      }
    } else {
      this.path.push(...commands);
    }
  }

  _transformPoint(x, y, m) {
    return {
      x: m.a * x + m.c * y + m.e,
      y: m.b * x + m.d * y + m.f,
    };
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
    if (this.path.length === 0) {
        this.moveTo(x1, y1);
        return;
    }
    console.warn('arcTo is not fully implemented. It will draw a line to the first point.');
    this.lineTo(x1, y1);
  }

  ellipse(x, y, radiusX, radiusY, rotation, startAngle, endAngle, anticlockwise = false) {
    const kappa = 0.552284749831;
    const ox = radiusX * kappa;
    const oy = radiusY * kappa;
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
