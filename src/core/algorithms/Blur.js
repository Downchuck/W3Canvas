/**
 * Generates a 1D Gaussian kernel.
 * @param {number} sigma The standard deviation of the Gaussian distribution.
 * @returns {Array<number>} The 1D kernel.
 */
function generateGaussianKernel(sigma) {
    const radius = Math.ceil(sigma * 3); // Kernel size is roughly 3 times sigma
    const kernelSize = 2 * radius + 1;
    const kernel = new Array(kernelSize);
    const sigma2 = 2 * sigma * sigma;
    let sum = 0;

    for (let i = 0; i < kernelSize; i++) {
        const x = i - radius;
        const g = Math.exp(-(x * x) / sigma2) / Math.sqrt(Math.PI * sigma2);
        kernel[i] = g;
        sum += g;
    }

    // Normalize the kernel
    for (let i = 0; i < kernelSize; i++) {
        kernel[i] /= sum;
    }

    return kernel;
}

/**
 * Applies a Gaussian blur to an ImageData object.
 * @param {ImageData} imageData The ImageData to blur.
 * @param {number} radius The blur radius.
 */
export function gaussianBlur(imageData, radius) {
    if (radius <= 0) return;

    const sigma = radius / 2; // A common approximation
    const kernel = generateGaussianKernel(sigma);
    const kernelRadius = Math.floor(kernel.length / 2);

    const { data, width, height } = imageData;
    const tempR = new Float32Array(width * height);
    const tempG = new Float32Array(width * height);
    const tempB = new Float32Array(width * height);
    const tempA = new Float32Array(width * height);

    // Horizontal pass
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            let r = 0, g = 0, b = 0, a = 0;
            for (let i = -kernelRadius; i <= kernelRadius; i++) {
                const xi = Math.max(0, Math.min(width - 1, x + i));
                const index = (y * width + xi) * 4;
                const weight = kernel[i + kernelRadius];
                r += data[index] * weight;
                g += data[index + 1] * weight;
                b += data[index + 2] * weight;
                a += data[index + 3] * weight;
            }
            const destIndex = y * width + x;
            tempR[destIndex] = r;
            tempG[destIndex] = g;
            tempB[destIndex] = b;
            tempA[destIndex] = a;
        }
    }

    // Vertical pass
     for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            let r = 0, g = 0, b = 0, a = 0;
            for (let i = -kernelRadius; i <= kernelRadius; i++) {
                const yi = Math.max(0, Math.min(height - 1, y + i));
                const index = yi * width + x;
                const weight = kernel[i + kernelRadius];
                r += tempR[index] * weight;
                g += tempG[index] * weight;
                b += tempB[index] * weight;
                a += tempA[index] * weight;
            }
            const destIndex = (y * width + x) * 4;
            data[destIndex] = r;
            data[destIndex + 1] = g;
            data[destIndex + 2] = b;
            data[destIndex + 3] = a;
        }
    }
}
