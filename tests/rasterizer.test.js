import { test } from 'node:test';
import assert from 'node:assert';
import { CanvasRenderingContext2D } from '../src/core/canvas/CanvasRenderingContext2D.js';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import { PNG } from 'pngjs';


// Helper function to get the color of a specific pixel
function getPixel(ctx, x, y) {
  const imageData = ctx.getImageData(x, y, 1, 1);
  const data = imageData.data;
  return { r: data[0], g: data[1], b: data[2], a: data[3] };
}

// Helper function to save the canvas to a PNG file for debugging
function writeCanvasToFile(ctx, filename) {
    const { width, height, data } = ctx.imageData;
    const png = new PNG({ width, height });
    png.data = Buffer.from(data.buffer);
    const buffer = PNG.sync.write(png);

    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const outputPath = path.join(__dirname, '..', 'jules-scratch', 'rasterizer-tests');

    if (!fs.existsSync(outputPath)) {
        fs.mkdirSync(outputPath, { recursive: true });
    }

    fs.writeFileSync(path.join(outputPath, filename), buffer);
}

test('Rasterizer: Winding Rule (Even-Odd vs Non-Zero)', (t) => {
    const width = 100;
    const height = 100;
    const ctx = new CanvasRenderingContext2D(width, height);

    ctx.fillStyle = 'red';

    // Outer rectangle (counter-clockwise)
    ctx.moveTo(90, 90);
    ctx.lineTo(10, 90);
    ctx.lineTo(10, 10);
    ctx.lineTo(90, 10);
    ctx.closePath();

    // Inner rectangle (clockwise)
    ctx.lineTo(30, 30); // Connect the two paths
    ctx.moveTo(30, 30);
    ctx.lineTo(70, 30);
    ctx.lineTo(70, 70);
    ctx.lineTo(30, 70);
    ctx.closePath();

    ctx.fill();

    // With the non-zero winding rule, the inside should be empty.
    // The current (incorrect) even-odd rule will fill it.
    const pixelInHole = getPixel(ctx, 50, 50);
    const pixelOnShape = getPixel(ctx, 15, 15);

    // Assert that the hole is not filled (should be transparent black)
    assert.deepStrictEqual(pixelInHole, { r: 0, g: 0, b: 0, a: 0 }, 'The hole should not be filled.');

    // Assert that the shape itself is filled
    assert.deepStrictEqual(pixelOnShape, { r: 255, g: 0, b: 0, a: 255 }, 'The shape area should be filled red.');

    // For debugging, write the output to a file
    writeCanvasToFile(ctx, 'winding-rule.png');
});

test('Rasterizer: Self-Intersecting Shape (Bowtie)', (t) => {
    const width = 100;
    const height = 100;
    const ctx = new CanvasRenderingContext2D(width, height);

    ctx.fillStyle = 'blue';

    // Create a "bowtie" shape
    ctx.beginPath();
    ctx.moveTo(20, 20);
    ctx.lineTo(80, 80);
    ctx.lineTo(80, 20);
    ctx.lineTo(20, 80);
    ctx.closePath();

    ctx.fill();

    // With the non-zero winding rule, both lobes should be filled.
    // The current (incorrect) even-odd rule also fills both lobes, so this test
    // will pass initially but is important for ensuring the new implementation is correct.
    const pixelInLeftLobe = getPixel(ctx, 30, 50);
    const pixelInRightLobe = getPixel(ctx, 70, 50);

    assert.deepStrictEqual(pixelInLeftLobe, { r: 0, g: 0, b: 255, a: 255 }, 'The left lobe of the bowtie should be filled blue.');
    assert.deepStrictEqual(pixelInRightLobe, { r: 0, g: 0, b: 255, a: 255 }, 'The right lobe of the bowtie should be filled blue.');

    writeCanvasToFile(ctx, 'bowtie.png');
});

test('Rasterizer: Minimal Failing Font Path (B)', (t) => {
    const width = 50;
    const height = 50;
    const ctx = new CanvasRenderingContext2D(width, height);

    ctx.fillStyle = 'green';

    const pathB = [{"type":"move","x":10.843120805369127,"y":31.711409395973156},{"type":"line","x":13.670302013422818,"y":31.711409395973156},{"type":"bezier","cp1x":14.496644295302014,"cp1y":31.711409395973156,"cp2x":15.011744966442953,"cp2y":31.95469798657718,"x":15.21224832214765,"y":32.40268456375839},{"type":"bezier","cp1x":15.41275167785235,"cp1y":32.850671140939595,"cp2x":15.41275167785235,"cp2y":33.40268456375839,"x":15.41275167785235,"y":33.88221476510067},{"type":"bezier","cp1x":15.41275167785235,"cp1y":34.36174496644295,"cp2x":15.11744966442953,"cp2y":34.80973154362416,"x":14.769295302013422,"y":34.991610738255034},{"type":"line","x":11.690436241610739,"y":34.991610738255034},{"type":"line","x":11.690436241610739,"y":35.63758389261745},{"type":"line","x":14.80218120805369,"y":35.63758389261745},{"type":"bezier","cp1x":15.548489932885905,"cp1y":35.84865771812081,"cp2x":15.810906040268457,"cp2y":36.328187919463085,"x":15.810906040268457,"y":36.87919463087248},{"type":"bezier","cp1x":15.810906040268457,"cp1y":37.43120805369127,"cp2x":15.479362416107382,"cp2y":37.87919463087248,"x":15.11744966442953,"y":38.07973154362416},{"type":"line","x":10.843120805369127,"y":38.07973154362416},{"type":"line","x":10.843120805369127,"y":31.711409395973156},{"type":"move","x":11.690436241610739,"y":32.40268456375839},{"type":"line","x":11.690436241610739,"y":34.27852348993289},{"type":"line","x":14.009228187919463,"y":34.27852348993289},{"type":"bezier","cp1x":14.561241610738255,"cp1y":34.27852348993289,"cp2x":14.856540268456376,"cp2y":34.183221476510065,"x":14.856540268456376,"y":33.88221476510067},{"type":"bezier","cp1x":14.856540268456376,"cp1y":33.58120805369127,"cp2x":14.561241610738255,"cp2y":33.485906040268456,"x":14.009228187919463,"y":33.485906040268456},{"type":"line","x":11.690436241610739,"y":33.485906040268456},{"type":"line","x":11.690436241610739,"y":32.40268456375839},{"type":"move","x":11.690436241610739,"y":36.42281879194631},{"type":"line","x":14.076845637583892,"y":36.42281879194631},{"type":"bezier","cp1x":14.736073825503355,"cp1y":36.42281879194631,"cp2x":15.031372483221476,"cp2y":36.55134228187919,"x":15.031372483221476,"y":36.87919463087248},{"type":"bezier","cp1x":15.031372483221476,"cp1y":37.20704697986577,"cp2x":14.736073825503355,"cp2y":37.335570469798654,"x":14.076845637583892,"y":37.335570469798654},{"type":"line","x":11.690436241610739,"y":37.335570469798654},{"type":"line","x":11.690436241610739,"y":36.42281879194631}];

    ctx.beginPath();
    ctx.path = pathB;
    ctx.fill();

    // Assert a pixel in the body of the 'B' is filled.
    const pixelInBody = getPixel(ctx, 12, 32);
    assert.deepStrictEqual(pixelInBody, { r: 0, g: 255, b: 0, a: 255 }, "A pixel inside the 'B' character body should be filled green.");

    // Assert a pixel in the top hole of the 'B' is not filled.
    const pixelInTopHole = getPixel(ctx, 13, 33);
    assert.deepStrictEqual(pixelInTopHole, { r: 0, g: 0, b: 0, a: 0 }, "A pixel inside the 'B' character top hole should not be filled.");

    // Assert a pixel in the bottom hole of the 'B' is not filled.
    const pixelInBottomHole = getPixel(ctx, 13, 37);
    assert.deepStrictEqual(pixelInBottomHole, { r: 0, g: 0, b: 0, a: 0 }, "A pixel inside the 'B' character bottom hole should not be filled.");

    writeCanvasToFile(ctx, 'font-path-B.png');
});
