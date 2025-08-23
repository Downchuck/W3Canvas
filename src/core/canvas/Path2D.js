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

  _getLastPoint() {
    if (this.path.length === 0) {
      return { x: 0, y: 0 };
    }
    for (let i = this.path.length - 1; i >= 0; i--) {
      const cmd = this.path[i];
      if (cmd.x !== undefined && cmd.y !== undefined) {
        if (cmd.type === 'arc' || cmd.type === 'arcTo') {
           return {
             x: cmd.x + cmd.radius * Math.cos(cmd.endAngle),
             y: cmd.y + cmd.radius * Math.sin(cmd.endAngle),
           };
        } else {
          return { x: cmd.x, y: cmd.y };
        }
      }
    }
    return { x: 0, y: 0 };
  }

  quadraticCurveTo(cpx, cpy, x, y) {
    const { x: x0, y: y0 } = this._getLastPoint();
    const cp1x = x0 + 2 / 3 * (cpx - x0);
    const cp1y = y0 + 2 / 3 * (cpy - y0);
    const cp2x = x + 2 / 3 * (cpx - x);
    const cp2y = y + 2 / 3 * (cpy - y);
    this.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y);
  }

  arc(x, y, radius, startAngle, endAngle, anticlockwise = false) {
    this.path.push({ type: 'arc', x, y, radius, startAngle, endAngle, anticlockwise });
  }

  arcTo(x1, y1, x2, y2, radius) {
    const { x: x0, y: y0 } = this._getLastPoint();

    const p0 = { x: x0, y: y0 };
    const p1 = { x: x1, y: y1 };
    const p2 = { x: x2, y: y2 };

    if ((p1.x - p0.x) * (p2.y - p1.y) - (p1.y - p0.y) * (p2.x - p1.x) === 0) {
      this.lineTo(p1.x, p1.y);
      return;
    }

    const a = Math.sqrt((p1.x - p0.x) ** 2 + (p1.y - p0.y) ** 2);
    const b = Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2);
    const c = Math.sqrt((p2.x - p0.x) ** 2 + (p2.y - p0.y) ** 2);

    const angle = Math.acos(((p1.x - p0.x) * (p1.x - p2.x) + (p1.y - p0.y) * (p1.y - p2.y)) / (a * b));
    const t = radius / Math.tan(angle / 2);

    const t0x = p1.x - t * (p1.x - p0.x) / a;
    const t0y = p1.y - t * (p1.y - p0.y) / a;
    const t1x = p1.x - t * (p1.x - p2.x) / b;
    const t1y = p1.y - t * (p1.y - p2.y) / b;

    this.lineTo(t0x, t0y);

    const cx = t0x + radius * (p1.y - p0.y) / a;
    const cy = t0y - radius * (p1.x - p0.x) / a;

    const startAngle = Math.atan2(t0y - cy, t0x - cx);
    const endAngle = Math.atan2(t1y - cy, t1x - cx);

    this.arc(cx, cy, radius, startAngle, endAngle, (p1.x - p0.x) * (p2.y - p0.y) - (p1.y - p0.y) * (p2.x - p0.x) > 0);
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

  roundRect(x, y, w, h, radii = 0) {
    const tl = radii.length ? radii[0] : radii;
    const tr = radii.length > 1 ? radii[1] : tl;
    const br = radii.length > 2 ? radii[2] : tl;
    const bl = radii.length > 3 ? radii[3] : tl;
    this.moveTo(x + tl, y);
    this.lineTo(x + w - tr, y);
    this.arcTo(x + w, y, x + w, y + tr, tr);
    this.lineTo(x + w, y + h - br);
    this.arcTo(x + w, y + h, x + w - br, y + h, br);
    this.lineTo(x + bl, y + h);
    this.arcTo(x, y + h, x, y + h - bl, bl);
    this.lineTo(x, y + tl);
    this.arcTo(x, y, x + tl, y, tl);
    this.closePath();
  }
}
