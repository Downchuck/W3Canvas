export function bresenham(imageData, color, x0, y0, x1, y1) {
    console.log(`bresenham called with: (${x0}, ${y0}) to (${x1}, ${y1})`);
    const data = imageData.data;
    const width = imageData.width;

    const dx = Math.abs(x1 - x0);
    const dy = Math.abs(y1 - y0);
    const sx = (x0 < x1) ? 1 : -1;
    const sy = (y0 < y1) ? 1 : -1;
    let err = dx - dy;

    while (true) {
        console.log(`bresenham loop: (${x0}, ${y0})`);
        if (x0 >= 0 && x0 < width && y0 >= 0 && y0 < imageData.height) {
            const index = (y0 * width + x0) * 4;
            data[index] = color.r;
            data[index + 1] = color.g;
            data[index + 2] = color.b;
            data[index + 3] = color.a;
        }

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
