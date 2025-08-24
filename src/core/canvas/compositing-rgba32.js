export function compositeImageData(destImageData, srcImageData, operation) {
    switch (operation) {
        case 'source-over':
            sourceOver(destImageData, srcImageData);
            break;
        case 'source-in':
            sourceIn(destImageData, srcImageData);
            break;
        case 'source-out':
            sourceOut(destImageData, srcImageData);
            break;
        case 'source-atop':
            sourceAtop(destImageData, srcImageData);
            break;
        case 'destination-over':
            destinationOver(destImageData, srcImageData);
            break;
        case 'destination-in':
            destinationIn(destImageData, srcImageData);
            break;
        case 'destination-out':
            destinationOut(destImageData, srcImageData);
            break;
        case 'destination-atop':
            destinationAtop(destImageData, srcImageData);
            break;
        case 'lighter':
            lighter(destImageData, srcImageData);
            break;
        case 'copy':
            copy(destImageData, srcImageData);
            break;
        case 'xor':
            xor(destImageData, srcImageData);
            break;
        case 'multiply':
            multiply(destImageData, srcImageData);
            break;
        case 'screen':
            screen(destImageData, srcImageData);
            break;
        case 'overlay':
            overlay(destImageData, srcImageData);
            break;
        case 'darken':
            darken(destImageData, srcImageData);
            break;
        case 'lighten':
            lighten(destImageData, srcImageData);
            break;
        case 'color-dodge':
            colorDodge(destImageData, srcImageData);
            break;
        case 'color-burn':
            colorBurn(destImageData, srcImageData);
            break;
        case 'hard-light':
            hardLight(destImageData, srcImageData);
            break;
        case 'soft-light':
            softLight(destImageData, srcImageData);
            break;
        case 'difference':
            difference(destImageData, srcImageData);
            break;
        case 'exclusion':
            exclusion(destImageData, srcImageData);
            break;
        default:
            console.warn(`Unsupported globalCompositeOperation: ${operation}`);
            sourceOver(destImageData, srcImageData);
            break;
    }
}

function copy(dest, src) {
    const destData = dest.data;
    const srcData = src.data;

    for (let i = 0; i < srcData.length; i += 4) {
        destData[i] = srcData[i];
        destData[i+1] = srcData[i+1];
        destData[i+2] = srcData[i+2];
        destData[i + 3] = srcData[i+3]
    }
}

function sourceOver(dest, src) {
    const destData = dest.data;
    const srcData = src.data;

    for (let i = 0; i < srcData.length; i += 4) {
        const srcA = srcData[i + 3];
        if (srcA === 0) continue;

        const destA = destData[i + 3];
        const outA = srcA + (destA * (255 - srcA) >> 8);
        if (outA === 0) continue;

        destData[i] = (srcData[i] * srcA + destData[i] * destA * (255 - srcA) / 255) / outA;
        destData[i + 1] = (srcData[i+1] * srcA + destData[i+1] * destA * (255 - srcA) / 255) / outA;
        destData[i + 2] = (srcData[i+2] * srcA + destData[i+2] * destA * (255 - srcA) / 255) / outA;
        destData[i + 3] = outA;
    }
}

function destinationOver(dest, src) {
    const destData = dest.data;
    const srcData = src.data;

    for (let i = 0; i < srcData.length; i += 4) {
        const srcA = srcData[i + 3];
        const destA = destData[i + 3];
        const outA = (srcA * (255 - destA) >> 8) + destA;

        destData[i] = (srcData[i] * (255-destA) / 255 + destData[i]);
        destData[i + 1] = (srcData[i+1] * (255-destA) / 255 + destData[i+1]);
        destData[i + 2] = (srcData[i+2] * (255-destA) / 255 + destData[i+2]);
        destData[i + 3] = outA;
    }
}

function sourceIn(dest, src) {
    const destData = dest.data;
    const srcData = src.data;

    for (let i = 0; i < srcData.length; i += 4) {
        const destA = destData[i + 3];
        const srcA = srcData[i+3];
        const outA = srcA * destA >> 8;

        destData[i] = srcData[i];
        destData[i + 1] = srcData[i+1];
        destData[i + 2] = srcData[i+2];
        destData[i + 3] = outA;
    }
}

function destinationIn(dest, src) {
    const destData = dest.data;
    const srcData = src.data;

    for (let i = 0; i < srcData.length; i += 4) {
        const srcA = srcData[i + 3];
        const destA = destData[i + 3];
        const outA = srcA * destA >> 8;

        destData[i] = destData[i];
        destData[i + 1] = destData[i+1];
        destData[i + 2] = destData[i+2];
        destData[i + 3] = outA;
    }
}

function sourceOut(dest, src) {
    const destData = dest.data;
    const srcData = src.data;

    for (let i = 0; i < srcData.length; i += 4) {
        const srcA = srcData[i + 3];
        const destA = destData[i + 3];
        const outA = srcA * (255-destA) >> 8;

        destData[i] = srcData[i];
        destData[i + 1] = srcData[i+1];
        destData[i + 2] = srcData[i+2];
        destData[i + 3] = outA;
    }
}

function destinationOut(dest, src) {
    const destData = dest.data;
    const srcData = src.data;

    for (let i = 0; i < srcData.length; i += 4) {
        const srcA = srcData[i + 3];
        const destA = destData[i + 3];
        const outA = destA * (255-srcA) >> 8;

        destData[i] = destData[i];
        destData[i + 1] = destData[i+1];
        destData[i + 2] = destData[i+2];
        destData[i + 3] = outA;
    }
}

function sourceAtop(dest, src) {
    const destData = dest.data;
    const srcData = src.data;

    for (let i = 0; i < srcData.length; i += 4) {
        const srcR = srcData[i];
        const srcG = srcData[i+1];
        const srcB = srcData[i+2];
        const srcA = srcData[i + 3];

        const destR = destData[i];
        const destG = destData[i+1];
        const destB = destData[i+2];
        const destA = destData[i + 3];

        const outA = destA;

        const outR = (srcR * destA + destR * (255 - srcA)) >> 8;
        const outG = (srcG * destA + destG * (255 - srcA)) >> 8;
        const outB = (srcB * destA + destB * (255 - srcA)) >> 8;

        destData[i] = outR;
        destData[i + 1] = outG;
        destData[i + 2] = outB;
        destData[i + 3] = outA;
    }
}

function destinationAtop(dest, src) {
    const destData = dest.data;
    const srcData = src.data;

    for (let i = 0; i < srcData.length; i += 4) {
        const srcA = srcData[i + 3];
        const destA = destData[i + 3];
        const outA = srcA;

        destData[i] = (srcData[i] * (255-destA) + destData[i] * srcA) >> 8;
        destData[i + 1] = (srcData[i+1] * (255-destA) + destData[i+1] * srcA) >> 8;
        destData[i + 2] = (srcData[i+2] * (255-destA) + destData[i+2] * srcA) >> 8;
        destData[i + 3] = outA;
    }
}

function xor(dest, src) {
    const destData = dest.data;
    const srcData = src.data;

    for (let i = 0; i < srcData.length; i += 4) {
        const srcA = srcData[i + 3];
        const destA = destData[i + 3];
        const outA = srcA + destA - 2 * srcA * destA / 255;

        destData[i] = srcData[i] * (255-destA) / 255 + destData[i] * (255-srcA) / 255;
        destData[i + 1] = srcData[i+1] * (255-destA) / 255 + destData[i+1] * (255-srcA) / 255;
        destData[i + 2] = srcData[i+2] * (255-destA) / 255 + destData[i+2] * (255-srcA) / 255;
        destData[i + 3] = outA;
    }
}

function lighter(dest, src) {
    const destData = dest.data;
    const srcData = src.data;

    for (let i = 0; i < srcData.length; i += 4) {
        const srcA = srcData[i + 3];
        const destA = destData[i + 3];
        const outA = Math.min(255, srcA + destA);

        destData[i] = Math.min(255, srcData[i] + destData[i]);
        destData[i + 1] = Math.min(255, srcData[i+1] + destData[i+1]);
        destData[i + 2] = Math.min(255, srcData[i+2] + destData[i+2]);
        destData[i + 3] = outA;
    }
}

function blend(dest, src, mix) {
    const destData = dest.data;
    const srcData = src.data;

    for (let i = 0; i < srcData.length; i += 4) {
        const srcR = srcData[i];
        const srcG = srcData[i+1];
        const srcB = srcData[i+2];
        const srcA = srcData[i + 3];

        const destR = destData[i];
        const destG = destData[i+1];
        const destB = destData[i+2];
        const destA = destData[i + 3];

        const outA = srcA + (destA * (255 - srcA) >> 8);

        const outR = (mix(srcR, destR) * srcA * destA / 255 + srcR * srcA * (255 - destA) / 255 + destR * destA * (255 - srcA) / 255) / outA;
        const outG = (mix(srcG, destG) * srcA * destA / 255 + srcG * srcA * (255 - destA) / 255 + destG * destA * (255 - srcA) / 255) / outA;
        const outB = (mix(srcB, destB) * srcA * destA / 255 + srcB * srcA * (255 - destA) / 255 + destB * destA * (255 - srcA) / 255) / outA;

        destData[i] = outR;
        destData[i + 1] = outG;
        destData[i + 2] = outB;
        destData[i + 3] = outA;
    }
}

function multiply(dest, src) {
    blend(dest, src, (s, d) => s * d / 255);
}

function screen(dest, src) {
    blend(dest, src, (s, d) => s + d - s * d / 255);
}

function overlay(dest, src) {
    blend(dest, src, (s, d) => {
        if (s <= 128) return 2 * s * d / 255;
        return 255 - 2 * (255-s) * (255-d) / 255;
    });
}

function darken(dest, src) {
    blend(dest, src, (s, d) => Math.min(s, d));
}

function lighten(dest, src) {
    blend(dest, src, (s, d) => Math.max(s, d));
}

function colorDodge(dest, src) {
    blend(dest, src, (s, d) => {
        if (d === 255) return 255;
        if (s === 255) return 255;
        const v = d * 255 / (255 - s);
        return v > 255 ? 255 : v;
    });
}

function colorBurn(dest, src) {
    blend(dest, src, (s, d) => {
        if (d === 0) return 0;
        if (s === 0) return 0;
        const v = 255 - (255-d)*255/s;
        return v < 0 ? 0 : v;
    });
}

function hardLight(dest, src) {
    blend(dest, src, (s, d) => {
        if (s <= 128) return 2 * s * d / 255;
        return 255 - 2 * (255-s) * (255-d) / 255;
    });
}

function softLight(dest, src) {
    blend(dest, src, (s, d) => {
        if (s <= 128) return d - (255 - 2 * s) * d * (255 - d) / 65025;
        const D = (d <= 64) ? ((16 * d - 12*255) * d/255 + 4*255*255) * d/255 : Math.sqrt(d*255)*16;
        return d + (2 * s - 255) * (D - d) / 255;
    });
}

function difference(dest, src) {
    blend(dest, src, (s, d) => Math.abs(s - d));
}

function exclusion(dest, src) {
    blend(dest, src, (s, d) => s + d - 2 * s * d / 255);
}
