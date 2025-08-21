/* eslint-disable no-bitwise -- used for calculations */
/* eslint-disable unicorn/prefer-query-selector -- aiming at
  backward-compatibility */
/**
* StackBlur - a fast almost Gaussian Blur For Canvas
*
* @copyright (c) 2010 Mario Klingemann
*
* Permission is hereby granted, free of charge, to any person
* obtaining a copy of this software and associated documentation
* files (the "Software"), to deal in the Software without
* restriction, including without limitation the rights to use,
* copy, modify, merge, publish, distribute, sublicense, and/or sell
* copies of the Software, and to permit persons to whom the
* Software is furnished to do so, subject to the following
* conditions:
*
* The above copyright notice and this permission notice shall be
* included in all copies or substantial portions of the Software.
*
* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
* EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
* OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
* NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
* HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
* WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
* FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
* OTHER DEALINGS IN THE SOFTWARE.
*/

const mulTable = [
    512, 512, 456, 512, 328, 456, 335, 512, 405, 328, 271, 456, 388, 335, 292,
    512, 454, 405, 364, 328, 298, 271, 496, 456, 420, 388, 360, 335, 312, 292,
    273, 512, 482, 454, 428, 405, 383, 364, 345, 328, 312, 298, 284, 271, 259,
    496, 475, 456, 437, 420, 404, 388, 374, 360, 347, 335, 323, 312, 302, 292,
    282, 273, 265, 512, 497, 482, 468, 454, 441, 428, 417, 405, 394, 383, 373,
    364, 354, 345, 337, 328, 320, 312, 305, 298, 291, 284, 278, 271, 265, 259,
    507, 496, 485, 475, 465, 456, 446, 437, 428, 420, 412, 404, 396, 388, 381,
    374, 367, 360, 354, 347, 341, 335, 329, 323, 318, 312, 307, 302, 297, 292,
    287, 282, 278, 273, 269, 265, 261, 512, 505, 497, 489, 482, 475, 468, 461,
    454, 447, 441, 435, 428, 422, 417, 411, 405, 399, 394, 389, 383, 378, 373,
    368, 364, 359, 354, 350, 345, 341, 337, 332, 328, 324, 320, 316, 312, 309,
    305, 301, 298, 294, 291, 287, 284, 281, 278, 274, 271, 268, 265, 262, 259,
    257, 507, 501, 496, 491, 485, 480, 475, 470, 465, 460, 456, 451, 446, 442,
    437, 433, 428, 424, 420, 416, 412, 408, 404, 400, 396, 392, 388, 385, 381,
    377, 374, 370, 367, 363, 360, 357, 354, 350, 347, 344, 341, 338, 335, 332,
    329, 326, 323, 320, 318, 315, 312, 310, 307, 304, 302, 299, 297, 294, 292,
    289, 287, 285, 282, 280, 278, 275, 273, 271, 269, 267, 265, 263, 261, 259
];

const shgTable = [
    9, 11, 12, 13, 13, 14, 14, 15, 15, 15, 15, 16, 16, 16, 16, 17,
    17, 17, 17, 17, 17, 17, 18, 18, 18, 18, 18, 18, 18, 18, 18, 19,
    19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 20, 20, 20,
    20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 21,
    21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21,
    21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 22, 22, 22, 22, 22, 22,
    22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22,
    22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 23,
    23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23,
    23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23,
    23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23,
    23, 23, 23, 23, 23, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24,
    24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24,
    24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24,
    24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24,
    24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24
];

class BlurStack {
    constructor() {
        this.r = 0;
        this.g = 0;
        this.b = 0;
        this.a = 0;
        this.next = null;
    }
}

function processImageDataRGBA(imageData, topX, topY, width, height, radius) {
    const pixels = imageData.data;
    const div = 2 * radius + 1;
    const widthMinus1 = width - 1;
    const heightMinus1 = height - 1;
    const radiusPlus1 = radius + 1;
    const sumFactor = radiusPlus1 * (radiusPlus1 + 1) / 2;
    const stackStart = new BlurStack();
    let stack = stackStart;
    let stackEnd;
    for (let i = 1; i < div; i++) {
        stack = stack.next = new BlurStack();
        if (i === radiusPlus1) {
            stackEnd = stack;
        }
    }
    stack.next = stackStart;
    let stackIn = null;
    let stackOut = null;
    let yw = 0;
    let yi = 0;
    const mulSum = mulTable[radius];
    const shgSum = shgTable[radius];
    for (let y = 0; y < height; y++) {
        stack = stackStart;
        const pr = pixels[yi];
        const pg = pixels[yi + 1];
        const pb = pixels[yi + 2];
        const pa = pixels[yi + 3];
        for (let i = 0; i < radiusPlus1; i++) {
            stack.r = pr;
            stack.g = pg;
            stack.b = pb;
            stack.a = pa;
            stack = stack.next;
        }
        let rInSum = 0, gInSum = 0, bInSum = 0, aInSum = 0;
        let rOutSum = radiusPlus1 * pr;
        let gOutSum = radiusPlus1 * pg;
        let bOutSum = radiusPlus1 * pb;
        let aOutSum = radiusPlus1 * pa;
        let rSum = sumFactor * pr;
        let gSum = sumFactor * pg;
        let bSum = sumFactor * pb;
        let aSum = sumFactor * pa;
        for (let i = 1; i < radiusPlus1; i++) {
            const p = yi + ((widthMinus1 < i ? widthMinus1 : i) << 2);
            const r = pixels[p];
            const g = pixels[p + 1];
            const b = pixels[p + 2];
            const a = pixels[p + 3];
            const rbs = radiusPlus1 - i;
            rSum += (stack.r = r) * rbs;
            gSum += (stack.g = g) * rbs;
            bSum += (stack.b = b) * rbs;
            aSum += (stack.a = a) * rbs;
            rInSum += r;
            gInSum += g;
            bInSum += b;
            aInSum += a;
            stack = stack.next;
        }
        stackIn = stackStart;
        stackOut = stackEnd;
        for (let x = 0; x < width; x++) {
            const paInitial = (aSum * mulSum) >>> shgSum;
            pixels[yi + 3] = paInitial;
            if (paInitial !== 0) {
                const a = 255 / paInitial;
                pixels[yi] = ((rSum * mulSum) >>> shgSum) * a;
                pixels[yi + 1] = ((gSum * mulSum) >>> shgSum) * a;
                pixels[yi + 2] = ((bSum * mulSum) >>> shgSum) * a;
            } else {
                pixels[yi] = pixels[yi + 1] = pixels[yi + 2] = 0;
            }
            rSum -= rOutSum;
            gSum -= gOutSum;
            bSum -= bOutSum;
            aSum -= aOutSum;
            rOutSum -= stackIn.r;
            gOutSum -= stackIn.g;
            bOutSum -= stackIn.b;
            aOutSum -= stackIn.a;
            let p = x + radius + 1;
            p = (yw + (p < widthMinus1 ? p : widthMinus1)) << 2;
            rInSum += (stackIn.r = pixels[p]);
            gInSum += (stackIn.g = pixels[p + 1]);
            bInSum += (stackIn.b = pixels[p + 2]);
            aInSum += (stackIn.a = pixels[p + 3]);
            rSum += rInSum;
            gSum += gInSum;
            bSum += bInSum;
            aSum += aInSum;
            stackIn = stackIn.next;
            const { r, g, b, a } = stackOut;
            rOutSum += r;
            gOutSum += g;
            bOutSum += b;
            aOutSum += a;
            rInSum -= r;
            gInSum -= g;
            bInSum -= b;
            aInSum -= a;
            stackOut = stackOut.next;
            yi += 4;
        }
        yw += width;
    }
    for (let x = 0; x < width; x++) {
        yi = x << 2;
        let pr = pixels[yi];
        let pg = pixels[yi + 1];
        let pb = pixels[yi + 2];
        let pa = pixels[yi + 3];
        let rOutSum = radiusPlus1 * pr;
        let gOutSum = radiusPlus1 * pg;
        let bOutSum = radiusPlus1 * pb;
        let aOutSum = radiusPlus1 * pa;
        let rSum = sumFactor * pr;
        let gSum = sumFactor * pg;
        let bSum = sumFactor * pb;
        let aSum = sumFactor * pa;
        stack = stackStart;
        for (let i = 0; i < radiusPlus1; i++) {
            stack.r = pr;
            stack.g = pg;
            stack.b = pb;
            stack.a = pa;
            stack = stack.next;
        }
        let yp = width;
        let gInSum = 0, bInSum = 0, aInSum = 0, rInSum = 0;
        for (let i = 1; i <= radius; i++) {
            yi = (yp + x) << 2;
            const rbs = radiusPlus1 - i;
            rSum += (stack.r = (pr = pixels[yi])) * rbs;
            gSum += (stack.g = (pg = pixels[yi + 1])) * rbs;
            bSum += (stack.b = (pb = pixels[yi + 2])) * rbs;
            aSum += (stack.a = (pa = pixels[yi + 3])) * rbs;
            rInSum += pr;
            gInSum += pg;
            bInSum += pb;
            aInSum += pa;
            stack = stack.next;
            if (i < heightMinus1) {
                yp += width;
            }
        }
        yi = x;
        stackIn = stackStart;
        stackOut = stackEnd;
        for (let y = 0; y < height; y++) {
            let p = yi << 2;
            pixels[p + 3] = pa = (aSum * mulSum) >>> shgSum;
            if (pa > 0) {
                pa = 255 / pa;
                pixels[p] = ((rSum * mulSum) >>> shgSum) * pa;
                pixels[p + 1] = ((gSum * mulSum) >>> shgSum) * pa;
                pixels[p + 2] = ((bSum * mulSum) >>> shgSum) * pa;
            } else {
                pixels[p] = pixels[p + 1] = pixels[p + 2] = 0;
            }
            rSum -= rOutSum;
            gSum -= gOutSum;
            bSum -= bOutSum;
            aSum -= aOutSum;
            rOutSum -= stackIn.r;
            gOutSum -= stackIn.g;
            bOutSum -= stackIn.b;
            aOutSum -= stackIn.a;
            p = (x + (((p = y + radiusPlus1) < heightMinus1 ? p : heightMinus1) * width)) << 2;
            rSum += (rInSum += (stackIn.r = pixels[p]));
            gSum += (gInSum += (stackIn.g = pixels[p + 1]));
            bSum += (bInSum += (stackIn.b = pixels[p + 2]));
            aSum += (aInSum += (stackIn.a = pixels[p + 3]));
            stackIn = stackIn.next;
            rOutSum += (pr = stackOut.r);
            gOutSum += (pg = stackOut.g);
            bOutSum += (pb = stackOut.b);
            aOutSum += (pa = stackOut.a);
            rInSum -= pr;
            gInSum -= pg;
            bInSum -= pb;
            aInSum -= pa;
            stackOut = stackOut.next;
            yi += width;
        }
    }
    return imageData;
}


/**
 * Renders a shadow for a given path and composites it onto the main canvas context.
 * @param {CanvasRenderingContext2D} ctx - The main canvas rendering context.
 * @param {Array} pathCommands - The path to create a shadow for.
 * @param {boolean} isStroke - True if the shadow is for a stroke, false for a fill.
 */
export function drawShadow(ctx, pathCommands, isStroke) {
    const {
        shadowBlur,
        shadowColor,
        shadowOffsetX,
        shadowOffsetY,
        width,
        height
    } = ctx;

    // Check if a shadow is necessary
    const shadowColorParsed = ctx._parseColor(shadowColor);
    if (shadowColorParsed.a === 0) {
        return;
    }

    // 1. Create a temporary canvas context to draw the shadow shape
    // Pass isShadowContext to prevent recursive font loading.
    const shadowCtx = new ctx.constructor(width, height, { isShadowContext: true });
    // Draw the shape in opaque black first, to create the alpha mask for blurring.
    shadowCtx.fillStyle = 'black';
    shadowCtx.strokeStyle = 'black';
    shadowCtx.lineWidth = ctx.lineWidth;
    shadowCtx.lineJoin = ctx.lineJoin;
    shadowCtx.lineCap = ctx.lineCap;

    // 2. Create a new path with the offset applied
    const offsetPathCommands = pathCommands.map(command => {
        const newCommand = { ...command };
        if (newCommand.x !== undefined) newCommand.x += shadowOffsetX;
        if (newCommand.y !== undefined) newCommand.y += shadowOffsetY;
        if (newCommand.cp1x !== undefined) newCommand.cp1x += shadowOffsetX;
        if (newCommand.cp1y !== undefined) newCommand.cp1y += shadowOffsetY;
        if (newCommand.cp2x !== undefined) newCommand.cp2x += shadowOffsetX;
        if (newCommand.cp2y !== undefined) newCommand.cp2y += shadowOffsetY;
        return newCommand;
    });

    // 3. Draw the offset shape onto the temporary context
    if (isStroke) {
        shadowCtx._strokePath(offsetPathCommands);
    } else {
        shadowCtx._scanlineFill(offsetPathCommands);
    }

    // 4. Apply blur to the temporary context's imageData
    if (shadowBlur > 0) {
        processImageDataRGBA(shadowCtx.imageData, 0, 0, width, height, shadowBlur);
    }

    // 5. Tint the blurred alpha mask with the shadow color
    tintImageData(shadowCtx.imageData, shadowColorParsed);

    // 6. Composite the blurred, tinted shadow onto the main canvas
    compositeImageData(ctx, shadowCtx.imageData);
}

/**
 * Tints an imageData buffer with a given color.
 * The source imageData is modified in place.
 * @param {ImageData} imageData - The image data to tint.
 * @param {object} color - The color to apply, with r, g, b, a properties.
 */
function tintImageData(imageData, color) {
    const data = imageData.data;
    const alpha = color.a / 255;
    for (let i = 0; i < data.length; i += 4) {
        // Only tint pixels that have some opacity
        if (data[i + 3] > 0) {
            data[i] = color.r;
            data[i + 1] = color.g;
            data[i + 2] = color.b;
            // Modulate the blurred alpha with the shadow color's alpha
            data[i + 3] = Math.round(data[i + 3] * alpha);
        }
    }
}

/**
 * Composites a source imageData onto a destination context's imageData using the source-over blend mode.
 * @param {CanvasRenderingContext2D} destCtx - The destination context.
 * @param {ImageData} srcImageData - The source image data to composite.
 */
function compositeImageData(destCtx, srcImageData) {
    const destData = destCtx.imageData.data;
    const srcData = srcImageData.data;

    for (let i = 0; i < srcData.length; i += 4) {
        const srcA = srcData[i + 3] / 255;
        if (srcA === 0) continue; // Skip transparent pixels

        const destA = destData[i + 3] / 255;
        const outA = srcA + destA * (1 - srcA);

        if (outA === 0) continue;

        const srcR = srcData[i];
        const srcG = srcData[i + 1];
        const srcB = srcData[i + 2];

        const destR = destData[i];
        const destG = destData[i + 1];
        const destB = destData[i + 2];

        destData[i] = (srcR * srcA + destR * destA * (1 - srcA)) / outA;
        destData[i + 1] = (srcG * srcA + destG * destA * (1 - srcA)) / outA;
        destData[i + 2] = (srcB * srcA + destB * destA * (1 - srcA)) / outA;
        destData[i + 3] = outA * 255;
    }
}
