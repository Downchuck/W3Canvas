export function getWindingDirection(path) {
    let area = 0;
    const points = [];

    // First, convert path commands to a simple array of points
    for (const command of path) {
        if (command.type === 'move' || command.type === 'line') {
            points.push({ x: command.x, y: command.y });
        } else if (command.type === 'bezier') {
            // For simplicity, we'll just use the end point of the bezier curve.
            // A more accurate implementation would need to tessellate the curve.
            points.push({ x: command.x, y: command.y });
        }
    }

    if (points.length < 3) {
        return 0; // Not a polygon
    }

    for (let i = 0; i < points.length; i++) {
        const p1 = points[i];
        const p2 = points[(i + 1) % points.length];
        area += (p1.x * p2.y) - (p2.x * p1.y);
    }

    // The sign of the area determines the winding direction.
    // The standard shoelace formula gives a positive area for CCW paths.
    // However, since the canvas y-axis is inverted, a "visual" CCW path
    // will have a negative area.
    // We want to return -1 for CCW and +1 for CW.
    return Math.sign(area);
}
