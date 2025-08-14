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

    while (stackPointer > 0) {
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
