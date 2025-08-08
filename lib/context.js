class CanvasRenderingContext2D {
    constructor(canvas) {
        this.canvas = canvas;
        this.fillStyle = { r: 0, g: 0, b: 0, a: 255 }; // Default black
        this.strokeStyle = { r: 0, g: 0, b: 0, a: 255 }; // Default black
        this._path = [];
        this._transform = [1, 0, 0, 1, 0, 0]; // Identity matrix
        this._transformStack = [];
    }

    save() {
        this._transformStack.push(this._transform.slice()); // Push a copy
    }

    restore() {
        if (this._transformStack.length > 0) {
            this._transform = this._transformStack.pop();
        }
    }

    translate(x, y) {
        this._transform = this._multiplyMatrix([1, 0, 0, 1, x, y], this._transform);
    }

    rotate(angle) {
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        this._transform = this._multiplyMatrix([cos, sin, -sin, cos, 0, 0], this._transform);
    }

    scale(sx, sy) {
        this._transform = this._multiplyMatrix([sx, 0, 0, sy, 0, 0], this._transform);
    }

    _applyTransform(x, y) {
        const [a, b, c, d, e, f] = this._transform;
        const newX = a * x + c * y + e;
        const newY = b * x + d * y + f;
        return { x: newX, y: newY };
    }

    _multiplyMatrix(a, b) {
        return [
            a[0] * b[0] + a[2] * b[1],
            a[1] * b[0] + a[3] * b[1],
            a[0] * b[2] + a[2] * b[3],
            a[1] * b[2] + a[3] * b[3],
            a[0] * b[4] + a[2] * b[5] + a[4],
            a[1] * b[4] + a[3] * b[5] + a[5]
        ];
    }

    fillRect(x, y, width, height) {
        const transformed = this._applyTransform(x, y);
        const newX = Math.round(transformed.x);
        const newY = Math.round(transformed.y);

        for (let i = newY; i < newY + height; i++) {
            for (let j = newX; j < newX + width; j++) {
                if (i >= 0 && i < this.canvas.height && j >= 0 && j < this.canvas.width) {
                    this.canvas.pixels[i][j] = this.fillStyle;
                }
            }
        }
    }

    beginPath() {
        this._path = [];
    }

    moveTo(x, y) {
        const transformed = this._applyTransform(x, y);
        this._path.push({ type: 'moveTo', x: transformed.x, y: transformed.y });
    }

    lineTo(x, y) {
        const transformed = this._applyTransform(x, y);
        this._path.push({ type: 'lineTo', x: transformed.x, y: transformed.y });
    }

    closePath() {
        if (this._path.length > 0) {
            let firstPoint = null;
            for (let i = 0; i < this._path.length; i++) {
                if (this._path[i].type === 'moveTo') {
                    firstPoint = this._path[i];
                }
            }
            if (firstPoint) {
                this.lineTo(firstPoint.x, firstPoint.y);
            }
        }
    }

    stroke() {
        if (this._path.length < 2) return;

        let lastPoint = null;
        for (const point of this._path) {
            if (point.type === 'moveTo') {
                lastPoint = point;
            } else if (point.type === 'lineTo' && lastPoint) {
                this._bresenham(lastPoint.x, lastPoint.y, point.x, point.y, this.strokeStyle);
                lastPoint = point;
            }
        }
    }

    _bresenham(x0, y0, x1, y1, color) {
        x0 = Math.round(x0);
        y0 = Math.round(y0);
        x1 = Math.round(x1);
        y1 = Math.round(y1);

        const dx = Math.abs(x1 - x0);
        const dy = Math.abs(y1 - y0);
        const sx = (x0 < x1) ? 1 : -1;
        const sy = (y0 < y1) ? 1 : -1;
        let err = dx - dy;

        while (true) {
            if (x0 >= 0 && x0 < this.canvas.width && y0 >= 0 && y0 < this.canvas.height) {
                this.canvas.pixels[y0][x0] = color;
            }

            if ((x0 === x1) && (y0 === y1)) break;

            const e2 = 2 * err;
            if (e2 > -dy) {
                err -= dy;
                x0 += sx;
            }
            if (e2 < dx) {
                err += dy;
                y0 += sy;
            }
        }
    }

    fill() {
        if (this._path.length < 3) return; // Need at least a triangle to fill

        // Find the bounding box of the polygon
        let minY = Infinity;
        let maxY = -Infinity;
        for (const point of this._path) {
            if (point.y < minY) minY = point.y;
            if (point.y > maxY) maxY = point.y;
        }

        // Iterate through each scanline
        for (let y = Math.round(minY); y <= Math.round(maxY); y++) {
            const intersections = [];
            // Find intersections with polygon edges
            for (let i = 0; i < this._path.length; i++) {
                const p1 = this._path[i];
                // Find the next point that is not a moveTo
                let p2 = null;
                for (let j = 1; j < this._path.length; j++) {
                    if (this._path[(i + j) % this._path.length].type === 'lineTo') {
                        p2 = this._path[(i + j) % this._path.length];
                        break;
                    }
                }

                if (p1.type === 'lineTo' && p2) {
                    const edge = [p1, p2];
                    const intersectX = this._getIntersection(y, edge);
                    if (intersectX !== null) {
                        intersections.push(intersectX);
                    }
                }
            }

            intersections.sort((a, b) => a - b);

            for (let i = 0; i < intersections.length; i += 2) {
                if (i + 1 < intersections.length) {
                    const x1 = Math.round(intersections[i]);
                    const x2 = Math.round(intersections[i + 1]);
                    for (let x = x1; x < x2; x++) {
                        if (x >= 0 && x < this.canvas.width && y >= 0 && y < this.canvas.height) {
                            this.canvas.pixels[y][x] = this.fillStyle;
                        }
                    }
                }
            }
        }
    }

    _getIntersection(y, edge) {
        const [p1, p2] = edge;
        if (p1.y === p2.y) return null; // Horizontal edge
        if (y < Math.min(p1.y, p2.y) || y > Math.max(p1.y, p2.y)) {
            return null; // Outside y-range
        }
        const x = (y - p1.y) * (p2.x - p1.x) / (p2.y - p1.y) + p1.x;
        return x;
    }
}

    arc(x, y, radius, startAngle, endAngle, anticlockwise = false) {
        if (radius < 0) {
            throw new Error("Radius can't be negative.");
        }

        if (anticlockwise) {
            [startAngle, endAngle] = [endAngle, startAngle];
        }

        const steps = 100; // Number of line segments to approximate the arc
        const angleStep = (endAngle - startAngle) / steps;

        for (let i = 0; i <= steps; i++) {
            const angle = startAngle + i * angleStep;
            const px = x + radius * Math.cos(angle);
            const py = y + radius * Math.sin(angle);

            if (i === 0) {
                if (this._path.length === 0) {
                    this.moveTo(px, py);
                } else {
                    this.lineTo(px, py);
                }
            } else {
                this.lineTo(px, py);
            }
        }
    }
}

module.exports = CanvasRenderingContext2D;
