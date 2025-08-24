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
            sourceOver(destImageData, srcImageData);
            break;
    }
}

function blend(dest, src, mix) {
    const destData = dest.data;
    const srcData = src.data;
    for (let i = 0; i < srcData.length; i += 4) {
        const sR = srcData[i], sG = srcData[i+1], sB = srcData[i+2], sA = srcData[i+3];
        const dR = destData[i], dG = destData[i+1], dB = destData[i+2], dA = destData[i+3];
        if (sA === 0) continue;

        const sA_f = sA / 255;
        const dA_f = dA / 255;
        const sR_f = sR / 255, sG_f = sG / 255, sB_f = sB / 255;
        const dR_f = dR / 255, dG_f = dG / 255, dB_f = dB / 255;

        const outA_f = sA_f + dA_f * (1 - sA_f);
        if (outA_f === 0) {
            destData[i] = 0; destData[i+1] = 0; destData[i+2] = 0; destData[i+3] = 0;
            continue;
        }

        const mixed_r = mix(sR_f, dR_f);
        const mixed_g = mix(sG_f, dG_f);
        const mixed_b = mix(sB_f, dB_f);

        const outR_f = (sR_f * sA_f * (1 - dA_f) + dR_f * dA_f * (1 - sA_f) + mixed_r * sA_f * dA_f) / outA_f;
        const outG_f = (sG_f * sA_f * (1 - dA_f) + dG_f * dA_f * (1 - sA_f) + mixed_g * sA_f * dA_f) / outA_f;
        const outB_f = (sB_f * sA_f * (1 - dA_f) + dB_f * dA_f * (1 - sA_f) + mixed_b * sA_f * dA_f) / outA_f;

        destData[i] = outR_f * 255;
        destData[i+1] = outG_f * 255;
        destData[i+2] = outB_f * 255;
        destData[i+3] = outA_f * 255;
    }
}

function sourceOver(dest, src) {
    const destData = dest.data;
    const srcData = src.data;
    for (let i = 0; i < srcData.length; i += 4) {
        const sA = srcData[i + 3];
        if (sA === 0) continue;
        const dA = destData[i + 3];
        const sA_f = sA / 255;
        const dA_f = dA / 255;
        const outA_f = sA_f + dA_f * (1 - sA_f);
        destData[i+3] = outA_f * 255;
        if (outA_f === 0) continue;
        destData[i] = (srcData[i] * sA_f + destData[i] * dA_f * (1 - sA_f)) / outA_f;
        destData[i+1] = (srcData[i+1] * sA_f + destData[i+1] * dA_f * (1 - sA_f)) / outA_f;
        destData[i+2] = (srcData[i+2] * sA_f + destData[i+2] * dA_f * (1 - sA_f)) / outA_f;
    }
}

function sourceIn(dest, src) {
    const destData = dest.data;
    const srcData = src.data;
    for (let i = 0; i < srcData.length; i += 4) {
        const sA = srcData[i+3];
        if (sA === 0) { destData[i+3] = 0; continue; }
        const dA_f = destData[i+3] / 255;
        const outA_f = (sA/255) * dA_f;
        destData[i] = srcData[i];
        destData[i+1] = srcData[i+1];
        destData[i+2] = srcData[i+2];
        destData[i+3] = outA_f * 255;
    }
}

function sourceOut(dest, src) {
    const destData = dest.data;
    const srcData = src.data;
    for (let i = 0; i < srcData.length; i += 4) {
        const sA = srcData[i+3];
        if (sA === 0) continue;
        const dA_f = destData[i+3] / 255;
        const outA_f = (sA/255) * (1 - dA_f);
        destData[i] = srcData[i];
        destData[i+1] = srcData[i+1];
        destData[i+2] = srcData[i+2];
        destData[i+3] = outA_f * 255;
    }
}

function sourceAtop(dest, src) {
    const destData = dest.data;
    const srcData = src.data;
    for (let i = 0; i < srcData.length; i += 4) {
        const sA = srcData[i+3], dA = destData[i+3];
        if (sA === 0 && dA === 0) continue;
        const sA_f = sA / 255, dA_f = dA / 255;
        const sR = srcData[i], dR = destData[i];
        const sG = srcData[i+1], dG = destData[i+1];
        const sB = srcData[i+2], dB = destData[i+2];
        destData[i+3] = dA;
        destData[i]   = sR * sA_f + dR * (1 - sA_f);
        destData[i+1] = sG * sA_f + dG * (1 - sA_f);
        destData[i+2] = sB * sA_f + dB * (1 - sA_f);
    }
}

function destinationOver(dest, src) {
    const destData = dest.data;
    const srcData = src.data;
    for (let i = 0; i < srcData.length; i += 4) {
        const sA = srcData[i + 3];
        if (sA === 255) continue;
        if (sA === 0) continue;
        const dA = destData[i + 3];
        const sA_f = sA / 255;
        const dA_f = dA / 255;
        const outA_f = dA_f + sA_f * (1 - dA_f);
        destData[i+3] = outA_f * 255;
        if (outA_f === 0) continue;
        destData[i] = (destData[i] * dA_f + srcData[i] * sA_f * (1 - dA_f)) / outA_f;
        destData[i+1] = (destData[i+1] * dA_f + srcData[i+1] * sA_f * (1 - dA_f)) / outA_f;
        destData[i+2] = (destData[i+2] * dA_f + srcData[i+2] * sA_f * (1 - dA_f)) / outA_f;
    }
}

function destinationIn(dest, src) {
    const destData = dest.data;
    const srcData = src.data;
    for (let i = 0; i < srcData.length; i += 4) {
        const sA_f = srcData[i+3] / 255;
        destData[i+3] = (destData[i+3]/255) * sA_f * 255;
    }
}

function destinationOut(dest, src) {
    const destData = dest.data;
    const srcData = src.data;
    for (let i = 0; i < srcData.length; i += 4) {
        const sA_f = srcData[i+3] / 255;
        destData[i+3] = (destData[i+3]/255) * (1-sA_f) * 255;
    }
}

function destinationAtop(dest, src) {
    const destData = dest.data;
    const srcData = src.data;
    for (let i = 0; i < srcData.length; i += 4) {
        const sA = srcData[i+3], dA = destData[i+3];
        if (sA === 0 && dA === 0) continue;
        const sA_f = sA / 255, dA_f = dA / 255;
        const sR = srcData[i], dR = destData[i];
        const sG = srcData[i+1], dG = destData[i+1];
        const sB = srcData[i+2], dB = destData[i+2];
        destData[i+3] = sA;
        destData[i]   = dR * dA_f + sR * (1 - dA_f);
        destData[i+1] = dG * dA_f + sG * (1 - dA_f);
        destData[i+2] = dB * dA_f + sB * (1 - dA_f);
    }
}

function lighter(dest, src) {
    const destData = dest.data;
    const srcData = src.data;
    for (let i = 0; i < srcData.length; i += 4) {
        const sA = srcData[i+3], dA = destData[i+3];
        if (sA === 0 && dA === 0) continue;
        const sA_f = sA / 255, dA_f = dA / 255;
        const outA = Math.min(1, sA_f + dA_f);
        destData[i+3] = outA * 255;
        if (outA === 0) continue;
        const sR_p = srcData[i]*sA_f, sG_p = srcData[i+1]*sA_f, sB_p = srcData[i+2]*sA_f;
        const dR_p = destData[i]*dA_f, dG_p = destData[i+1]*dA_f, dB_p = destData[i+2]*dA_f;
        destData[i] = Math.min(255, (sR_p + dR_p) / outA);
        destData[i+1] = Math.min(255, (sG_p + dG_p) / outA);
        destData[i+2] = Math.min(255, (sB_p + dB_p) / outA);
    }
}

function copy(dest, src) {
    dest.data.set(src.data);
}

function xor(dest, src) {
    const destData = dest.data;
    const srcData = src.data;
    for (let i = 0; i < srcData.length; i += 4) {
        const sA = srcData[i+3], dA = destData[i+3];
        if (sA === 0 && dA === 0) continue;
        const sA_f = sA / 255;
        const dA_f = dA / 255;
        const outA_f = sA_f + dA_f - 2 * sA_f * dA_f;
        destData[i+3] = outA_f * 255;
        if (outA_f < 1/255) {
            destData[i] = 0; destData[i+1] = 0; destData[i+2] = 0;
            continue;
        }
        const sR_p = srcData[i]*sA_f, sG_p = srcData[i+1]*sA_f, sB_p = srcData[i+2]*sA_f;
        const dR_p = destData[i]*dA_f, dG_p = destData[i+1]*dA_f, dB_p = destData[i+2]*dA_f;
        destData[i]   = (sR_p * (1 - dA_f) + dR_p * (1 - sA_f)) / outA_f;
        destData[i+1] = (sG_p * (1 - dA_f) + dG_p * (1 - sA_f)) / outA_f;
        destData[i+2] = (sB_p * (1 - dA_f) + dB_p * (1 - sA_f)) / outA_f;
    }
}

function multiply(dest, src) { blend(dest, src, (s, d) => s * d); }
function screen(dest, src) { blend(dest, src, (s, d) => s + d - s * d); }
function darken(dest, src) { blend(dest, src, (s, d) => Math.min(s, d)); }
function lighten(dest, src) { blend(dest, src, (s, d) => Math.max(s, d)); }
function difference(dest, src) { blend(dest, src, (s, d) => Math.abs(s - d)); }
function exclusion(dest, src) { blend(dest, src, (s, d) => s + d - 2 * s * d); }
function overlay(dest, src) {
    blend(dest, src, (s, d) => (d <= 0.5) ? (2 * s * d) : (1 - 2 * (1 - s) * (1 - d)));
}
function colorDodge(dest, src) {
    blend(dest, src, (s, d) => {
        if (d === 0) return 0;
        if (s === 1) return 1;
        return Math.min(1, d / (1 - s));
    });
}
function colorBurn(dest, src) {
    blend(dest, src, (s, d) => {
        if (d === 1) return 1;
        if (s === 0) return 0;
        return Math.max(0, 1 - (1 - d) / s);
    });
}
function hardLight(dest, src) {
    blend(dest, src, (s, d) => (s <= 0.5) ? (2 * s * d) : (1 - 2 * (1 - s) * (1 - d)));
}
function softLight(dest, src) {
    blend(dest, src, (s, d) => {
        if (s <= 0.5) {
            return d - (1 - 2 * s) * d * (1 - d);
        } else {
            const D = (d <= 0.25) ? ((16 * d - 12) * d + 4) * d : Math.sqrt(d);
            return d + (2 * s - 1) * (D - d);
        }
    });
}
