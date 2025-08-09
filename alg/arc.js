import { bresenham } from './bresenham.js';

export function drawArc(ctx, cx, cy, radius, startAngle, endAngle) {
    const steps = 100;
    const angleStep = (endAngle - startAngle) / steps;
    let prevX = cx + radius * Math.cos(startAngle);
    let prevY = cy + radius * Math.sin(startAngle);

    for (let i = 1; i <= steps; i++) {
        const angle = startAngle + i * angleStep;
        const x = cx + radius * Math.cos(angle);
        const y = cy + radius * Math.sin(angle);
        bresenham(ctx, prevX, prevY, x, y);
        prevX = x;
        prevY = y;
    }
}
