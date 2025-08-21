/**
 * Composites a source image onto a destination image using the specified operation.
 * @param {ImageData} destImageData The destination image data.
 * @param {ImageData} srcImageData The source image data.
 * @param {string} operation The compositing operation to use.
 */
export function compositeImageData(destImageData, srcImageData, operation) {
    switch (operation) {
        case 'source-over':
            sourceOver(destImageData, srcImageData);
            break;
        default:
            console.warn(`Unsupported globalCompositeOperation: ${operation}`);
            sourceOver(destImageData, srcImageData);
            break;
    }
}

/**
 * Implements the "source-over" compositing operation.
 * This is the default compositing operation.
 * @param {ImageData} dest The destination image data.
 * @param {ImageData} src The source image data.
 */
function sourceOver(dest, src) {
    const destData = dest.data;
    const srcData = src.data;

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
