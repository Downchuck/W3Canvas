import { test } from 'node:test';
import assert from 'node:assert';
import { CanvasRenderingContext2D } from '../src/core/canvas/CanvasRenderingContext2D.js';

function assertPixel(ctx, x, y, r, g, b, a, message) {
    const pixelData = ctx.getImageData(x, y, 1, 1).data;
    console.log(`[${message}] Actual pixel at (${x},${y}): [${pixelData[0]}, ${pixelData[1]}, ${pixelData[2]}, ${pixelData[3]}]`);
    const tolerance = 5;
    assert(Math.abs(pixelData[0] - r) <= tolerance, `${message} - red`);
    assert(Math.abs(pixelData[1] - g) <= tolerance, `${message} - green`);
    assert(Math.abs(pixelData[2] - b) <= tolerance, `${message} - blue`);
    assert(Math.abs(pixelData[3] - a) <= tolerance, `${message} - alpha`);
}

test('globalAlpha with source-over', () => {
    const ctx = new CanvasRenderingContext2D(100, 100);
    ctx.fillStyle = 'rgba(255, 0, 0, 1)';
    ctx.fillRect(20, 20, 50, 50);

    ctx.globalAlpha = 0.5;
    ctx.fillStyle = 'rgba(0, 0, 255, 1)';
    ctx.fillRect(40, 40, 50, 50);

    // Overlapping pixel should be a blend of red and semi-transparent blue
    // Final Alpha = 1 * 0.5 + 1 * (1 - 0.5) = 1
    // Final Red = (0*0.5 + 255*1*(1-0.5))/1 = 127.5
    // Final Blue = (255*0.5 + 0*1*(1-0.5))/1 = 127.5
    assertPixel(ctx, 50, 50, 128, 0, 128, 255, 'Overlapping pixel should be a blend');
});

test('globalAlpha with multiply', () => {
    const ctx = new CanvasRenderingContext2D(100, 100);
    ctx.fillStyle = 'rgb(255, 255, 0)'; // Yellow
    ctx.fillRect(20, 20, 50, 50);

    ctx.globalAlpha = 0.5;
    ctx.fillStyle = 'rgb(0, 255, 255)'; // Cyan
    ctx.fillRect(40, 40, 50, 50);

    // My trace shows Red should be 128.
    assertPixel(ctx, 50, 50, 128, 255, 0, 255, 'Overlapping pixel should be a greenish yellow');
});

test('globalAlpha with source-atop', () => {
    const ctx = new CanvasRenderingContext2D(100, 100);
    ctx.fillStyle = 'rgba(255, 0, 0, 0.5)'; // Semi-transparent red
    ctx.fillRect(20, 20, 50, 50);

    ctx.globalAlpha = 0.5;
    ctx.fillStyle = 'rgba(0, 0, 255, 1)'; // Blue
    ctx.fillRect(40, 40, 50, 50);

    // Src blue's alpha becomes 0.5 * 1 = 0.5.
    // Dest red's alpha is 0.5.
    // Formula: Co = sC*dA + dC*(1-sA), Ao = dA
    // Ao = 0.5.
    // R = sR*dA + dR*(1-sA) = 0*0.5 + 255*(1-0.5) = 127.5
    // B = sB*dA + dB*(1-sA) = 255*0.5 + 0*(1-0.5) = 127.5
    assertPixel(ctx, 50, 50, 128, 0, 128, 128, 'Overlapping pixel should be a blend');
});
