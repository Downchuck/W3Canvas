/**
 * Converts a polyline into a fillable polygon representing the stroke.
 * @param {Array<{x: number, y: number}>} points The points of the polyline.
 * @param {number} lineWidth The width of the stroke.
 * @param {boolean} isClosed Whether the polyline is closed (e.g., from closePath).
 * @returns {Array<{x: number, y: number}>} The vertices of the polygon.
 */
export function strokePolyline(points, lineWidth, lineJoin, isClosed) {
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

    // Generate joins
    for (let i = 1; i < points.length - 1; i++) {
        const p_prev = points[i-1];
        const p_curr = points[i];
        const p_next = points[i+1];
        const n1 = segments[i - 1];
        const n2 = segments[i];

        const v1x = p_curr.x - p_prev.x;
        const v1y = p_curr.y - p_prev.y;
        const v2x = p_next.x - p_curr.x;
        const v2y = p_next.y - p_curr.y;
        const cross_product_z = v1x * v2y - v1y * v2x;

        const miterNx = (n1.nx + n2.nx) / 2;
        const miterNy = (n1.ny + n2.ny) / 2;
        const miterLen = Math.sqrt(miterNx * miterNx + miterNy * miterNy);
        const miterScale = (miterLen === 0) ? 0 : 1 / miterLen;

        switch (lineJoin) {
            case 'bevel': {
                const miterX = miterNx * miterScale * halfWidth;
                const miterY = miterNy * miterScale * halfWidth;

                if (cross_product_z > 0) { // Left turn, right side is outer
                    leftPoints.push({ x: p_curr.x + miterX, y: p_curr.y + miterY }); // Inner corner is miter
                    rightPoints.push({ x: p_curr.x - n1.nx * halfWidth, y: p_curr.y - n1.ny * halfWidth });
                    rightPoints.push({ x: p_curr.x - n2.nx * halfWidth, y: p_curr.y - n2.ny * halfWidth });
                } else { // Right turn, left side is outer
                    leftPoints.push({ x: p_curr.x + n1.nx * halfWidth, y: p_curr.y + n1.ny * halfWidth });
                    leftPoints.push({ x: p_curr.x + n2.nx * halfWidth, y: p_curr.y + n2.ny * halfWidth });
                    rightPoints.push({ x: p_curr.x - miterX, y: p_curr.y - miterY }); // Inner corner is miter
                }
                break;
            }
            case 'round': {
                const miterX = miterNx * miterScale * halfWidth;
                const miterY = miterNy * miterScale * halfWidth;
                const angle_diff = Math.acos(n1.nx * n2.nx + n1.ny * n2.ny);
                const numSegments = Math.max(1, Math.ceil(angle_diff / 0.2));

                if (cross_product_z > 0) { // Left turn, right side is outer
                    leftPoints.push({ x: p_curr.x + miterX, y: p_curr.y + miterY }); // Inner corner

                    const startAngle = Math.atan2(-n1.ny, -n1.nx);
                    for (let i = 0; i <= numSegments; i++) {
                        const angle = startAngle + angle_diff * i / numSegments;
                        rightPoints.push({
                            x: p_curr.x + Math.cos(angle) * halfWidth,
                            y: p_curr.y + Math.sin(angle) * halfWidth
                        });
                    }
                } else { // Right turn, left side is outer
                    const startAngle = Math.atan2(n1.ny, n1.nx);
                    for (let i = 0; i <= numSegments; i++) {
                        const angle = startAngle - angle_diff * i / numSegments;
                        leftPoints.push({
                            x: p_curr.x + Math.cos(angle) * halfWidth,
                            y: p_curr.y + Math.sin(angle) * halfWidth
                        });
                    }
                    rightPoints.push({ x: p_curr.x - miterX, y: p_curr.y - miterY }); // Inner corner
                }
                break;
            }
            case 'miter':
            default:
                if (miterLen === 0) {
                     leftPoints.push({x: p_curr.x + n1.nx * halfWidth, y: p_curr.y + n1.ny * halfWidth});
                     rightPoints.push({x: p_curr.x - n1.nx * halfWidth, y: p_curr.y - n1.ny * halfWidth});
                     continue;
                }
                leftPoints.push({
                    x: p_curr.x + miterNx * miterScale * halfWidth,
                    y: p_curr.y + miterNy * miterScale * halfWidth
                });
                rightPoints.push({
                    x: p_curr.x - miterNx * miterScale * halfWidth,
                    y: p_curr.y - miterNy * miterScale * halfWidth
                });
                break;
        }
    }

    // Generate offset points for the end cap
    const lastSegment = segments[segments.length - 1];
    const p_last = points[points.length - 1];

    // HACK: Extend the cap slightly to deal with rasterization errors
    if (points.length > 1) {
        const p_prev = points[points.length - 2];
        const dx = p_last.x - p_prev.x;
        const dy = p_last.y - p_prev.y;
        const len = Math.sqrt(dx*dx + dy*dy);
        if (len > 0) {
            const ex = dx/len;
            const ey = dy/len;

            leftPoints.push({
                x: p_last.x + lastSegment.nx * halfWidth + ex*0.5,
                y: p_last.y + lastSegment.ny * halfWidth + ey*0.5
            });
            rightPoints.push({
                x: p_last.x - lastSegment.nx * halfWidth + ex*0.5,
                y: p_last.y - lastSegment.ny * halfWidth + ey*0.5
            });
        } else {
             leftPoints.push({ x: p_last.x + lastSegment.nx * halfWidth, y: p_last.y + lastSegment.ny * halfWidth });
             rightPoints.push({ x: p_last.x - lastSegment.nx * halfWidth, y: p_last.y - lastSegment.ny * halfWidth });
        }
    } else {
        leftPoints.push({ x: p_last.x + lastSegment.nx * halfWidth, y: p_last.y + lastSegment.ny * halfWidth });
        rightPoints.push({ x: p_last.x - lastSegment.nx * halfWidth, y: p_last.y - lastSegment.ny * halfWidth });
    }

    // Combine the paths: go down the left side, then back up the right side
    return leftPoints.concat(rightPoints.reverse());
}
