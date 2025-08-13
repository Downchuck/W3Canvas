export function bresenham(imageData, color, x0, y0, x1, y1, plot) {
    const data = imageData.data;
    const width = imageData.width;

    const plotPixel = plot || function(x, y, c) {
        if (x >= 0 && x < width && y >= 0 && y < imageData.height) {
            const index = (y * width + x) * 4;
            data[index] = c.r;
            data[index + 1] = c.g;
            data[index + 2] = c.b;
            data[index + 3] = c.a;
        }
    };

    const dx = Math.abs(x1 - x0);
    const dy = Math.abs(y1 - y0);
    const sx = (x0 < x1) ? 1 : -1;
    const sy = (y0 < y1) ? 1 : -1;
    let err = dx - dy;

    while (true) {
        plotPixel(x0, y0, color);

        if ((x0 === x1) && (y0 === y1)) {
            break;
        }

        const e2 = 2 * err;
        if (e2 > -dy) {
            err -= dy;
            x0 += sx;
        }
        if (e2 < dx) {
            err += dx;
            y0 += sy;
        }
    }
}
