colorjack.alg.scanlineFill = function(ctx, x, y, width, height) {
    // A basic scanline fill implementation for a rectangle.
    // It iterates through each row of the rectangle and draws a horizontal line.
    for (var i = 0; i < height; i++) {
        // Use the native `fillRect` to draw a horizontal line of 1px height.
        // This is not the most performant way, but it's a simple implementation.
        // A more optimized version would manipulate pixel data directly.
        ctx.fillRect(x, y + i, width, 1);
    }
};
