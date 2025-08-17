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
// where the curve intersects the horizontal line y
export function getBezierYIntercepts(p0, p1, p2, p3, y) {
    const y0 = p0.y, y1 = p1.y, y2 = p2.y, y3 = p3.y;

    const a = -y0 + 3*y1 - 3*y2 + y3;
    const b = 3*y0 - 6*y1 + 3*y2;
    const c = -3*y0 + 3*y1;
    const d = y0 - y;

    return solveCubic(a, b, c, d);
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

// New adaptive bezier curve generation (iterative implementation)
export function getBezierPoints(x0, y0, x1, y1, x2, y2, x3, y3, points, pointOffset, stack) {
    const flatness = 0.5;
    let stackPointer = 0;
    let numPoints = 0;

    // Push initial curve
    stack[stackPointer++] = x0; stack[stackPointer++] = y0;
    stack[stackPointer++] = x1; stack[stackPointer++] = y1;
    stack[stackPointer++] = x2; stack[stackPointer++] = y2;
    stack[stackPointer++] = x3; stack[stackPointer++] = y3;

    let iterations = 0;
    while (stackPointer > 0) {
        iterations++;
        if (iterations > 200000) { // safety break
             console.error("Bezier curve generation took too many iterations.");
             break;
        }
        // Pop curve
        const cur_y3 = stack[--stackPointer]; const cur_x3 = stack[--stackPointer];
        const cur_y2 = stack[--stackPointer]; const cur_x2 = stack[--stackPointer];
        const cur_y1 = stack[--stackPointer]; const cur_x1 = stack[--stackPointer];
        const cur_y0 = stack[--stackPointer]; const cur_x0 = stack[--stackPointer];

        const dx = cur_x3 - cur_x0;
        const dy = cur_y3 - cur_y0;

        if (dx === 0 && dy === 0) {
            if (pointOffset + numPoints * 2 < points.length) {
                points[pointOffset + numPoints * 2] = cur_x3;
                points[pointOffset + numPoints * 2 + 1] = cur_y3;
                numPoints++;
            }
            continue;
        }

        const d1 = Math.abs((cur_x1 - cur_x3) * dy - (cur_y1 - cur_y3) * dx);
        const d2 = Math.abs((cur_x2 - cur_x3) * dy - (cur_y2 - cur_y3) * dx);

        if ((d1 + d2) * (d1 + d2) < flatness * (dx * dx + dy * dy)) {
            if (pointOffset + numPoints * 2 < points.length) {
                points[pointOffset + numPoints * 2] = cur_x3;
                points[pointOffset + numPoints * 2 + 1] = cur_y3;
                numPoints++;
            }
            continue;
        }

        // Subdivide the curve
        const x01 = (cur_x0 + cur_x1) / 2; const y01 = (cur_y0 + cur_y1) / 2;
        const x12 = (cur_x1 + cur_x2) / 2; const y12 = (cur_y1 + cur_y2) / 2;
        const x23 = (cur_x2 + cur_x3) / 2; const y23 = (cur_y2 + cur_y3) / 2;
        const x012 = (x01 + x12) / 2;   const y012 = (y01 + y12) / 2;
        const x123 = (x12 + x23) / 2;   const y123 = (y12 + y23) / 2;
        const x0123 = (x012 + x123) / 2; const y0123 = (y012 + y123) / 2;

        if (stackPointer + 16 > stack.length) {
            console.error("Bezier stack overflow");
            return numPoints;
        }

        // Push second half
        stack[stackPointer++] = x0123; stack[stackPointer++] = y0123;
        stack[stackPointer++] = x123;  stack[stackPointer++] = y123;
        stack[stackPointer++] = x23;   stack[stackPointer++] = y23;
        stack[stackPointer++] = cur_x3;  stack[stackPointer++] = cur_y3;

        // Push first half
        stack[stackPointer++] = cur_x0;  stack[stackPointer++] = cur_y0;
        stack[stackPointer++] = x01;   stack[stackPointer++] = y01;
        stack[stackPointer++] = x012;  stack[stackPointer++] = y012;
        stack[stackPointer++] = x0123; stack[stackPointer++] = y0123;
    }
    return numPoints;
}
