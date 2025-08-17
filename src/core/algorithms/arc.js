import { bresenham } from './bresenham.js';

function drawArcWithMidpoint(ctx, color, cx, cy, radius, startAngle, endAngle) {
    let x = radius;
    let y = 0;
    let err = 0;

    const plot = (px, py) => {
        const angle = Math.atan2(py - cy, px - cx);
        let normalizedAngle = angle < 0 ? angle + 2 * Math.PI : angle;

        if (normalizedAngle >= startAngle && normalizedAngle <= endAngle) {
            if (px >= 0 && px < ctx.imageData.width && py >= 0 && py < ctx.imageData.height) {
                const index = (py * ctx.imageData.width + px) * 4;
                ctx.imageData.data[index] = color.r;
                ctx.imageData.data[index + 1] = color.g;
                ctx.imageData.data[index + 2] = color.b;
                ctx.imageData.data[index + 3] = color.a;
            }
        }
    };

    while (x >= y) {
        plot(cx + x, cy + y);
        plot(cx + y, cy + x);
        plot(cx - y, cy + x);
        plot(cx - x, cy + y);
        plot(cx - x, cy - y);
        plot(cx - y, cy - x);
        plot(cx + y, cy - x);
        plot(cx + x, cy - y);

        if (err <= 0) {
            y += 1;
            err += 2 * y + 1;
        }

        if (err > 0) {
            x -= 1;
            err -= 2 * x + 1;
        }
    }
}

function fillArcWithMidpoint(ctx, color, cx, cy, radius, startAngle, endAngle) {
    // For now, we will just fill a full circle.
    // The startAngle and endAngle are not yet supported.

    let x = radius;
    let y = 0;
    let err = 0;

    const hline = (x1, x2, y) => {
        for (let x = x1; x <= x2; x++) {
            if (x < 0 || x >= ctx.imageData.width || y < 0 || y >= ctx.imageData.height) {
                continue;
            }
            const index = (y * ctx.imageData.width + x) * 4;
            ctx.imageData.data[index] = color.r;
            ctx.imageData.data[index + 1] = color.g;
            ctx.imageData.data[index + 2] = color.b;
            ctx.imageData.data[index + 3] = color.a;
        }
    };

    while (x >= y) {
        hline(cx - x, cx + x, cy + y);
        hline(cx - x, cx + x, cy - y);
        hline(cx - y, cx + y, cy + x);
        hline(cx - y, cx + y, cy - x);

        if (err <= 0) {
            y += 1;
            err += 2 * y + 1;
        }

        if (err > 0) {
            x -= 1;
            err -= 2 * x + 1;
        }
    }
}


export { drawArc, fillArcWithMidpoint, getArcScanlineIntersections };

function getArcScanlineIntersections(cx, cy, radius, startAngle, endAngle, y) {
    const intersections = [];

    const dy = y - cy;
    if (Math.abs(dy) > radius) {
        return intersections; // Scanline is outside the circle's Y-range
    }

    // Solve for x: (x - cx)^2 + (y - cy)^2 = radius^2
    const dx = Math.sqrt(radius * radius - dy * dy);
    const x1 = cx - dx;
    const x2 = cx + dx;

    // Normalize angles to be in [0, 2*PI)
    let sa = startAngle % (2 * Math.PI);
    if (sa < 0) sa += 2 * Math.PI;
    let ea = endAngle % (2 * Math.PI);
    if (ea < 0) ea += 2 * Math.PI;

    const checkAngle = (x) => {
        let angle = Math.atan2(y - cy, x - cx);
        if (angle < 0) angle += 2 * Math.PI;

        if (sa < ea) { // Standard case
            if (angle >= sa && angle <= ea) {
                intersections.push(x);
            }
        } else { // Arc crosses the 0-radian line
            if (angle >= sa || angle <= ea) {
                intersections.push(x);
            }
        }
    };

    checkAngle(x1);
    // Avoid adding the same point twice if dx is zero
    if (dx > 1e-8) {
        checkAngle(x2);
    }

    return intersections;
}

function drawArc(ctx, color, cx, cy, radius, startAngle, endAngle) {
    // For now, we will just call the new midpoint algorithm.
    // The startAngle and endAngle are not yet supported.
    drawArcWithMidpoint(ctx, color, cx, cy, radius, startAngle, endAngle);
}
