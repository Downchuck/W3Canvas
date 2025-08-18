/**
 * Converts a polyline into a fillable polygon representing the stroke.
 * @param {Array<{x: number, y: number}>} points The points of the polyline.
 * @param {number} lineWidth The width of the stroke.
 * @param {boolean} isClosed Whether the polyline is closed (e.g., from closePath).
 * @returns {Array<{x: number, y: number}>} The vertices of the polygon.
 */
export function strokePolyline(points, lineWidth, isClosed) {
    if (points.length < 2) {
        return [];
    }

    const halfWidth = lineWidth / 2;
    const leftPoints = [];
    const rightPoints = [];

    // Calculate normals for each segment
    const segments = [];
    for (let i = 0; i < points.length - 1; i++) {
        const p1 = points[i];
        const p2 = points[i+1];
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const len = Math.sqrt(dx * dx + dy * dy);
        if (len === 0) {
            segments.push({ nx: 0, ny: 0 });
        } else {
            segments.push({ nx: -dy / len, ny: dx / len });
        }
    }

    // Generate offset points for the start cap
    leftPoints.push({
        x: points[0].x + segments[0].nx * halfWidth,
        y: points[0].y + segments[0].ny * halfWidth
    });
    rightPoints.push({
        x: points[0].x - segments[0].nx * halfWidth,
        y: points[0].y - segments[0].ny * halfWidth
    });

    // Generate miter joins
    for (let i = 1; i < points.length - 1; i++) {
        const n1 = segments[i - 1];
        const n2 = segments[i];
        const p = points[i];

        // Simplified miter logic: average the normals
        // A real implementation would calculate the intersection of the offset lines
        const miterNx = (n1.nx + n2.nx) / 2;
        const miterNy = (n1.ny + n2.ny) / 2;
        const miterLen = Math.sqrt(miterNx * miterNx + miterNy * miterNy);

        if (miterLen === 0) { // Should not happen for non-collinear lines
             leftPoints.push({x: p.x + n1.nx * halfWidth, y: p.y + n1.ny * halfWidth});
             rightPoints.push({x: p.x - n1.nx * halfWidth, y: p.y - n1.ny * halfWidth});
             continue;
        }

        const miterScale = 1 / miterLen; // This can be large for sharp angles

        leftPoints.push({
            x: p.x + miterNx * miterScale * halfWidth,
            y: p.y + miterNy * miterScale * halfWidth
        });
        rightPoints.push({
            x: p.x - miterNx * miterScale * halfWidth,
            y: p.y - miterNy * miterScale * halfWidth
        });
    }

    // Generate offset points for the end cap
    const lastSegment = segments[segments.length - 1];
    leftPoints.push({
        x: points[points.length - 1].x + lastSegment.nx * halfWidth,
        y: points[points.length - 1].y + lastSegment.ny * halfWidth
    });
    rightPoints.push({
        x: points[points.length - 1].x - lastSegment.nx * halfWidth,
        y: points[points.length - 1].y - lastSegment.ny * halfWidth
    });

    // Combine the paths: go down the left side, then back up the right side
    return leftPoints.concat(rightPoints.reverse());
}
