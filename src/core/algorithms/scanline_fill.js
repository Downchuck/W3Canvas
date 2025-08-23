import { getBezierYIntercepts, getBezierXforT } from './bezier.js';
import { getArcScanlineIntersections } from './arc.js';
import { CanvasGradient } from '../canvas/CanvasGradient.js';
import { CanvasPattern } from '../canvas/CanvasPattern.js';

export function scanlineFill(pathCommands, width, height, fillStyle, globalAlpha, getTransformedPath, shadowContextConstructor, getColorFromGradientAtPoint, getColorFromPatternAtPoint, parseColor) {

    const transformedPathCommands = getTransformedPath(pathCommands);

    const shapeCtxImageData = {
      data: new Uint8ClampedArray(width * height * 4),
      width: width,
      height: height,
    };

    const allEdges = [];
    let currentX = 0;
    let currentY = 0;
    let startX = 0;
    let startY = 0;

    const addEdge = (edge) => {
        if (Math.abs(edge.y_min - edge.y_max) < 1e-9) return; // Ignore horizontal edges with a tolerance
        allEdges.push(edge);
    };

    for (const command of transformedPathCommands) {
        switch (command.type) {
            case 'move':
                currentX = command.x;
                currentY = command.y;
                startX = command.x;
                startY = command.y;
                break;
            case 'line': {
                const y_min = Math.min(currentY, command.y);
                const y_max = Math.max(currentY, command.y);
                const x_at_ymin = currentY < command.y ? currentX : command.x;
                const slope_inv = (command.x - currentX) / (command.y - currentY);
                const direction = Math.sign(command.y - currentY);
                addEdge({ type: 'line', y_min, y_max, x_at_ymin, slope_inv, direction });
                currentX = command.x;
                currentY = command.y;
                break;
            }
            case 'bezier': {
                const p0 = { x: currentX, y: currentY };
                const p1 = { x: command.cp1x, y: command.cp1y };
                const p2 = { x: command.cp2x, y: command.cp2y };
                const p3 = { x: command.x, y: command.y };
                const y_min = Math.min(p0.y, p1.y, p2.y, p3.y);
                const y_max = Math.max(p0.y, p1.y, p2.y, p3.y);
                const direction = Math.sign(p3.y - p0.y);
                addEdge({ type: 'bezier', p0, p1, p2, p3, y_min, y_max, direction });
                currentX = command.x;
                currentY = command.y;
                break;
            }
            case 'close':
                const y_min = Math.min(currentY, startY);
                const y_max = Math.max(currentY, startY);
                const x_at_ymin = currentY < startY ? currentX : startX;
                const slope_inv = (startX - currentX) / (startY - currentY);
                const direction = Math.sign(startY - currentY);
                addEdge({ type: 'line', y_min, y_max, x_at_ymin, slope_inv, direction });
                currentX = startX;
                currentY = startY;
                break;
            case 'arc': {
                const y_min = command.y - command.radius;
                const y_max = command.y + command.radius;
                const direction = command.anticlockwise ? -1 : 1;
                addEdge({ type: 'arc', ...command, y_min, y_max, direction });
                currentX = command.x + command.radius * Math.cos(command.endAngle);
                currentY = command.y + command.radius * Math.sin(command.endAngle);
                break;
            }
        }
    }

    if (allEdges.length === 0) {
        return shapeCtxImageData;
    }

    let minY = Infinity;
    let maxY = -Infinity;
    for (const edge of allEdges) {
        minY = Math.min(minY, edge.y_min);
        maxY = Math.max(maxY, edge.y_max);
    }
    minY = Math.max(0, Math.floor(minY));
    maxY = Math.min(height, Math.ceil(maxY));

    const activeEdges = [];

    for (let y = minY; y < maxY; y++) {
        for (const edge of allEdges) {
            if (Math.round(edge.y_min) === y) {
                if (edge.type === 'line') activeEdges.push({ ...edge, current_x: edge.x_at_ymin });
                else activeEdges.push({ ...edge });
            }
        }
        for (let i = activeEdges.length - 1; i >= 0; i--) {
            if (y >= Math.round(activeEdges[i].y_max)) activeEdges.splice(i, 1);
        }

        const intersectionPoints = [];
        for (const edge of activeEdges) {
            if (edge.type === 'bezier') {
                const roots = getBezierYIntercepts(edge.p0, edge.p1, edge.p2, edge.p3, y);
                for (const t of roots) {
                    if (t >= 0 && t <= 1) {
                        intersectionPoints.push({ x: getBezierXforT(edge.p0, edge.p1, edge.p2, edge.p3, t), direction: edge.direction });
                    }
                }
            } else if (edge.type === 'arc') {
                const xs = getArcScanlineIntersections(edge.x, edge.y, edge.radius, edge.startAngle, edge.endAngle, y);
                for (const x of xs) {
                    intersectionPoints.push({ x, direction: edge.direction });
                }
            } else {
                intersectionPoints.push({ x: edge.current_x, direction: edge.direction });
            }
        }

        intersectionPoints.sort((a, b) => a.x - b.x);

        let windingNumber = 0;
        for (let i = 0; i < intersectionPoints.length - 1; i++) {
            windingNumber += intersectionPoints[i].direction;

            if (windingNumber !== 0) {
                const startX = Math.round(intersectionPoints[i].x);
                const endX = Math.round(intersectionPoints[i+1].x);
                for (let x = startX; x < endX; x++) {
                    if (x >= 0 && x < width) {
                        const index = (y * width + x) * 4;
                        let color;
                        if (fillStyle instanceof CanvasGradient) color = getColorFromGradientAtPoint(x, y, fillStyle);
                        else if (fillStyle instanceof CanvasPattern) color = getColorFromPatternAtPoint(x, y, fillStyle);
                        else color = parseColor(fillStyle);
                        const finalColor = { ...color };
                        finalColor.a = Math.round(finalColor.a * globalAlpha);
                        shapeCtxImageData.data[index] = finalColor.r;
                        shapeCtxImageData.data[index + 1] = finalColor.g;
                        shapeCtxImageData.data[index + 2] = finalColor.b;
                        shapeCtxImageData.data[index + 3] = finalColor.a;
                    }
                }
            }
        }
        for (const edge of activeEdges) {
            if (edge.type === 'line') edge.current_x += edge.slope_inv;
        }
    }
    return shapeCtxImageData;
}
