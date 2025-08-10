import { bresenham } from './bresenham.js';

export function drawBezier(ctx, color, x0, y0, x1, y1, x2, y2, x3, y3) {
    // x0, y0: start point
    // x1, y1: control point 1
    // x2, y2: control point 2
    // x3, y3: end point

    const steps = 100; // number of line segments to approximate the curve
    let prevX = x0;
    let prevY = y0;

    for (let i = 1; i <= steps; i++) {
        const t = i / steps;
        const t2 = t * t;
        const t3 = t2 * t;
        const mt = 1 - t;
        const mt2 = mt * mt;
        const mt3 = mt2 * mt;

        const x = (mt3 * x0) + (3 * mt2 * t * x1) + (3 * mt * t2 * x2) + (t3 * x3);
        const y = (mt3 * y0) + (3 * mt2 * t * y1) + (3 * mt * t2 * y2) + (t3 * y3);

        bresenham(ctx.imageData, color, prevX, prevY, x, y);
        prevX = x;
        prevY = y;
    }
}
