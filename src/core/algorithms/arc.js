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


export { drawArc, fillArcWithMidpoint };

function drawArc(ctx, color, cx, cy, radius, startAngle, endAngle) {
    // For now, we will just call the new midpoint algorithm.
    // The startAngle and endAngle are not yet supported.
    drawArcWithMidpoint(ctx, color, cx, cy, radius, startAngle, endAngle);
}
