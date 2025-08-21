import { gaussianBlur } from '../algorithms/Blur.js';

/**
 * Renders a shadow for a given path and composites it onto the main canvas context.
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

    const shadowColorParsed = ctx._parseColor(shadowColor);
    // Do not draw a shadow if it's fully transparent or has no blur and no offset.
    if (shadowColorParsed.a === 0 || (shadowBlur <= 0 && shadowOffsetX === 0 && shadowOffsetY === 0)) {
        return;
    }

    const shadowCtx = new ctx.constructor(width, height, { isShadowContext: true });
    shadowCtx.fillStyle = 'black';
    shadowCtx.strokeStyle = 'black';
    shadowCtx.lineWidth = ctx.lineWidth;
    shadowCtx.lineJoin = ctx.lineJoin;
    shadowCtx.lineCap = ctx.lineCap;
    shadowCtx.miterLimit = ctx.miterLimit;

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

    if (isStroke) {
        shadowCtx._strokePath(offsetPathCommands);
    } else {
        shadowCtx._scanlineFill(offsetPathCommands);
    }

    if (shadowBlur > 0) {
        gaussianBlur(shadowCtx.imageData, shadowBlur);
    }

    tintImageData(shadowCtx.imageData, shadowColorParsed);

    compositeImageData(ctx, shadowCtx.imageData);
}

function tintImageData(imageData, color) {
    const data = imageData.data;
    const alpha = color.a / 255;
    for (let i = 0; i < data.length; i += 4) {
        if (data[i + 3] > 0) {
            data[i] = color.r;
            data[i + 1] = color.g;
            data[i + 2] = color.b;
            data[i + 3] = Math.round(data[i + 3] * alpha);
        }
    }
}

function compositeImageData(destCtx, srcImageData) {
    const destData = destCtx.imageData.data;
    const srcData = srcImageData.data;

    for (let i = 0; i < srcData.length; i += 4) {
        const srcA = srcData[i + 3] / 255;
        if (srcA === 0) continue;

        const destA = destData[i + 3] / 255;
        const outA = srcA + destA * (1 - srcA);
        if (outA === 0) continue;

        destData[i] = (srcData[i] * srcA + destData[i] * destA * (1 - srcA)) / outA;
        destData[i + 1] = (srcData[i + 1] * srcA + destData[i + 1] * destA * (1 - srcA)) / outA;
        destData[i + 2] = (srcData[i + 2] * srcA + destData[i + 2] * destA * (1 - srcA)) / outA;
        destData[i + 3] = outA * 255;
    }
}
