/**
 * Converts a polyline into a set of fillable polygons representing the stroke.
 */
export function strokePolyline(points, lineWidth, lineJoin, isClosed, lineDashList = [], lineDashOffset = 0, miterLimit = 10) {
    if (points.length < 2 || lineWidth <= 0) {
        return [];
    }

    // If there's no dash pattern, generate a single solid stroke
    if (lineDashList.length === 0) {
        const { leftPoints, rightPoints } = getStrokeGeometry(points, lineWidth, lineJoin, isClosed, miterLimit);
        if (leftPoints.length < 2) return [];
        return [leftPoints.concat(rightPoints.reverse())];
    }

    const dashLength = lineDashList.reduce((a, b) => a + b, 0);
    if (dashLength === 0) {
        return [];
    }

    // --- Create sub-paths for each dash ---
    const dashPaths = [];
    let currentDashPath = [];

    // --- State for dashing ---
    let dashIndex = 0;
    let isDrawingDash = true;
    let dashRemaining = lineDashList[0];

    // --- Normalize and apply the initial offset ---
    let offset = lineDashOffset;
    while (offset > 0) {
        const consume = Math.min(offset, dashRemaining);
        dashRemaining -= consume;
        offset -= consume;
        if (dashRemaining === 0) {
            dashIndex = (dashIndex + 1) % lineDashList.length;
            isDrawingDash = dashIndex % 2 === 0;
            dashRemaining = lineDashList[dashIndex];
        }
    }

    // --- Walk the polyline and create dash sub-paths ---
    for (let i = 0; i < points.length - 1; i++) {
        const p1 = points[i];
        const p2 = points[i + 1];
        const segDx = p2.x - p1.x;
        const segDy = p2.y - p1.y;
        const segLen = Math.sqrt(segDx * segDx + segDy * segDy);
        let segDist = 0;

        while (segDist < segLen) {
            const consume = Math.min(dashRemaining, segLen - segDist);
            const startRatio = segDist / segLen;
            const endRatio = (segDist + consume) / segLen;
            const startPoint = { x: p1.x + segDx * startRatio, y: p1.y + segDy * startRatio };
            const endPoint = { x: p1.x + segDx * endRatio, y: p1.y + segDy * endRatio };

            if (isDrawingDash) {
                if (currentDashPath.length === 0) {
                    currentDashPath.push(startPoint);
                }
                currentDashPath.push(endPoint);
            }

            segDist += consume;
            dashRemaining -= consume;

            if (dashRemaining === 0) {
                if (isDrawingDash && currentDashPath.length > 1) {
                    dashPaths.push(currentDashPath);
                }
                currentDashPath = [];
                dashIndex = (dashIndex + 1) % lineDashList.length;
                isDrawingDash = dashIndex % 2 === 0;
                dashRemaining = lineDashList[dashIndex];
            }
        }
    }

    if (isDrawingDash && currentDashPath.length > 1) {
        dashPaths.push(currentDashPath);
    }

    // --- Stroke each dash sub-path individually ---
    const finalPolygons = [];
    for (const path of dashPaths) {
        const { leftPoints, rightPoints } = getStrokeGeometry(path, lineWidth, lineJoin, false, miterLimit);
        if (leftPoints.length > 1) {
            finalPolygons.push(leftPoints.concat(rightPoints.reverse()));
        }
    }

    return finalPolygons;
}


/**
 * Generates the left and right contours of a stroked polyline.
 */
function getStrokeGeometry(points, lineWidth, lineJoin, isClosed, miterLimit) {
    const halfWidth = lineWidth / 2;
    let leftPoints = [];
    let rightPoints = [];

    // Calculate normals for each segment
    const segments = [];
    for (let i = 0; i < points.length - 1; i++) {
        const p1 = points[i];
        const p2 = points[i + 1];
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const len = Math.sqrt(dx * dx + dy * dy);
        if (len === 0) {
            segments.push({ nx: 0, ny: 0 });
        } else {
            segments.push({ nx: -dy / len, ny: dx / len });
        }
    }
    if (segments.length === 0) return { leftPoints, rightPoints };

    // Start cap
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
        const p_curr = points[i];
        const n1 = segments[i - 1];
        const n2 = segments[i];

        const v1x = p_curr.x - points[i-1].x;
        const v1y = p_curr.y - points[i-1].y;
        const v2x = points[i+1].x - p_curr.x;
        const v2y = points[i+1].y - p_curr.y;
        const cross_product_z = v1x * v2y - v1y * v2x;

        const miterNx = (n1.nx + n2.nx) / 2;
        const miterNy = (n1.ny + n2.ny) / 2;
        const miterLenSq = miterNx * miterNx + miterNy * miterNy;

        if (miterLenSq < 1e-9) { // Almost straight line
            leftPoints.push({ x: p_curr.x + n1.nx * halfWidth, y: p_curr.y + n1.ny * halfWidth });
            rightPoints.push({ x: p_curr.x - n1.nx * halfWidth, y: p_curr.y - n1.ny * halfWidth });
            continue;
        }

        const miterRatio = 1 / Math.sqrt(miterLenSq);

        if (lineJoin === 'miter' && miterRatio <= miterLimit) {
            const scale = (halfWidth / miterLenSq);
            leftPoints.push({ x: p_curr.x + miterNx * scale, y: p_curr.y + miterNy * scale });
            rightPoints.push({ x: p_curr.x - miterNx * scale, y: p_curr.y - miterNy * scale });
        } else { // Bevel join or miter limit exceeded
            const miterScale = 1 / Math.sqrt(miterLenSq);
            if (cross_product_z > 0) { // Left turn
                leftPoints.push({ x: p_curr.x + miterNx * miterScale * halfWidth, y: p_curr.y + miterNy * miterScale * halfWidth });
                rightPoints.push({ x: p_curr.x - n1.nx * halfWidth, y: p_curr.y - n1.ny * halfWidth });
                rightPoints.push({ x: p_curr.x - n2.nx * halfWidth, y: p_curr.y - n2.ny * halfWidth });
            } else { // Right turn
                leftPoints.push({ x: p_curr.x + n1.nx * halfWidth, y: p_curr.y + n1.ny * halfWidth });
                leftPoints.push({ x: p_curr.x + n2.nx * halfWidth, y: p_curr.y + n2.ny * halfWidth });
                rightPoints.push({ x: p_curr.x - miterNx * miterScale * halfWidth, y: p_curr.y - miterNy * miterScale * halfWidth });
            }
        }
    }

    // End cap
    const lastSegment = segments[segments.length - 1];
    const p_last = points[points.length - 1];
    leftPoints.push({ x: p_last.x + lastSegment.nx * halfWidth, y: p_last.y + lastSegment.ny * halfWidth });
    rightPoints.push({ x: p_last.x - lastSegment.nx * halfWidth, y: p_last.y - lastSegment.ny * halfWidth });

    return { leftPoints, rightPoints };
}
