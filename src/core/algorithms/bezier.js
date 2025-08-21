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

// Solves a cubic equation ax^3 + bx^2 + cx + d = 0 for x.
// Returns an array of real roots.
export function solveCubic(a, b, c, d) {
    if (Math.abs(a) < 1e-8) { // Quadratic case, ax^2+bx+c=0
        a = b; b = c; c = d;
        if (Math.abs(a) < 1e-8) { // Linear case, ax+b=0
            a = b; b = c;
            if (Math.abs(a) < 1e-8) // Constant case
                return [];
            return [-b/a];
        }

        const D = b*b - 4*a*c;
        if (Math.abs(D) < 1e-8)
            return [-b/(2*a)];
        else if (D > 0)
            return [(-b+Math.sqrt(D))/(2*a), (-b-Math.sqrt(D))/(2*a)];
        return [];
    }

    // Convert to a depressed cubic t^3+pt+q = 0
    const p = (3*a*c - b*b)/(3*a*a);
    const q = (2*b*b*b - 9*a*b*c + 27*a*a*d)/(27*a*a*a);
    let roots;

    if (Math.abs(p) < 1e-8) { // One real root
        roots = [Math.cbrt(-q)];
    } else {
        const D = q*q/4 + p*p*p/27;
        if (Math.abs(D) < 1e-8) {       // Three real roots, at least two are equal
            roots = [ -1.5*q/p, 3*q/p ];
        } else if (D > 0) {             // One real root
            const u = Math.cbrt(-q/2 + Math.sqrt(D));
            roots = [ u - p/(3*u) ];
        } else {                        // Three real roots
            const u = 2*Math.sqrt(-p/3);
            const t = Math.acos(-q / (u*u*u/2)) / 3;
            const k = 2*Math.PI/3;
            roots = [ u*Math.cos(t), u*Math.cos(t-k), u*Math.cos(t-2*k) ];
        }
    }

    // Convert back from depressed cubic
    for (let i = 0; i < roots.length; i++)
        roots[i] -= b/(3*a);

    return roots;
}

// For a cubic bezier curve defined by p0, p1, p2, p3, find the t values
// where the curve intersects the horizontal line y.
// This implementation uses a stack-based recursive subdivision algorithm, which is
// more numerically stable for rendering than the analytic cubic solver.
export function getBezierYIntercepts(p0, p1, p2, p3, y) {
    const roots = [];
    const stack = [{p0, p1, p2, p3, t0: 0, t1: 1, level: 0}];
    const MAX_DEPTH = 12; // Prevents infinite recursion
    const TOLERANCE = 0.5; // Flatness tolerance, half a pixel

    while (stack.length > 0) {
        const curve = stack.pop();
        const { p0, p1, p2, p3, t0, t1, level } = curve;

        if (level > MAX_DEPTH) {
            continue;
        }

        const y_min = Math.min(p0.y, p1.y, p2.y, p3.y);
        const y_max = Math.max(p0.y, p1.y, p2.y, p3.y);

        if (y < y_min - TOLERANCE || y > y_max + TOLERANCE) {
            continue;
        }

        // A curve is considered flat if its y-range is smaller than the tolerance
        if (y_max - y_min < TOLERANCE) {
            // Intersect the line p0-p3 with the scanline y
            const dy03 = p3.y - p0.y;
            if (Math.abs(dy03) > 1e-6) {
                const t = (y - p0.y) / dy03;
                if (t >= 0 && t <= 1) {
                    const final_t = t0 + t * (t1 - t0);
                    roots.push(final_t);
                }
            }
            continue;
        }

        // Subdivide using De Casteljau's algorithm
        const p01 = { x: (p0.x + p1.x) / 2, y: (p0.y + p1.y) / 2 };
        const p12 = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };
        const p23 = { x: (p2.x + p3.x) / 2, y: (p2.y + p3.y) / 2 };
        const p012 = { x: (p01.x + p12.x) / 2, y: (p01.y + p12.y) / 2 };
        const p123 = { x: (p12.x + p23.x) / 2, y: (p12.y + p23.y) / 2 };
        const p0123 = { x: (p012.x + p123.x) / 2, y: (p012.y + p123.y) / 2 };

        const t_mid = (t0 + t1) / 2;

        // Push the second half first so we process the first half next
        stack.push({ p0: p0123, p1: p123, p2: p23, p3: p3, t0: t_mid, t1: t1, level: level + 1 });
        stack.push({ p0: p0, p1: p01, p2: p012, p3: p0123, t0: t0, t1: t_mid, level: level + 1 });
    }

    return roots;
}

// For a cubic bezier curve defined by p0, p1, p2, p3, find the x value at t
export function getBezierXforT(p0, p1, p2, p3, t) {
    const x0 = p0.x, x1 = p1.x, x2 = p2.x, x3 = p3.x;
    const t2 = t * t;
    const t3 = t2 * t;
    const mt = 1 - t;
    const mt2 = mt * mt;
    const mt3 = mt2 * mt;
    return (mt3 * x0) + (3 * mt2 * t * x1) + (3 * mt * t2 * x2) + (t3 * x3);
}

// Simple fixed-step bezier curve generation
export function getBezierPoints(x0, y0, x1, y1, x2, y2, x3, y3, points, pointOffset, stack) {
    const steps = 100; // number of line segments to approximate the curve
    let numPoints = 0;

    for (let i = 1; i <= steps; i++) {
        const t = i / steps;
        const t2 = t * t;
        const t3 = t2 * t;
        const mt = 1 - t;
        const mt2 = mt * mt;
        const mt3 = mt2 * mt;

        const x = (mt3 * x0) + (3 * mt2 * t * x1) + (3 * mt * t2 * x2) + (t3 * x3);
        const y = (mt3 * y0) + (3 * mt2 * t * y1) + (3 * mt * t2 * y2) + (t3 * y3);

        if (pointOffset + numPoints * 2 < points.length) {
            points[pointOffset + numPoints * 2] = x;
            points[pointOffset + numPoints * 2 + 1] = y;
            numPoints++;
        }
    }
    return numPoints;
}
