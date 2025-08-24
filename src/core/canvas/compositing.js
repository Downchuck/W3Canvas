import { compositeImageData as compositeImageDataRGBA32 } from './compositing-rgba32.js';

/**
 * Composites a source image onto a destination image using the specified operation.
 * @param {ImageData} destImageData The destination image data.
 * @param {ImageData} srcImageData The source image data.
 * @param {string} operation The compositing operation to use.
 */
export function compositeImageData(destImageData, srcImageData, operation) {
    // For now, we only support RGBA32
    compositeImageDataRGBA32(destImageData, srcImageData, operation);
}
