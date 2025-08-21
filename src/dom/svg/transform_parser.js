// Regular expression to find transform functions and their arguments
const transformRegex = /(\w+)\s*\(([^)]+)\)/g;

/**
 * Parses a transform string and applies the transformations to a canvas context.
 * @param {CanvasRenderingContext2D} ctx The canvas context to apply transformations to.
 * @param {string} transformString The SVG transform string (e.g., "translate(10, 20) scale(1.5)").
 */
export function applyTransform(ctx, transformString) {
    if (!transformString) {
        return;
    }

    let match;
    // Reset regex state for each call since we are using a global regex
    transformRegex.lastIndex = 0;
    while ((match = transformRegex.exec(transformString)) !== null) {
        const func = match[1].toLowerCase();
        // Split arguments by whitespace or commas
        const args = match[2].trim().split(/[\s,]+/).map(parseFloat);

        switch (func) {
            case 'translate':
                if (args.length >= 1) {
                    const tx = args[0];
                    const ty = args.length > 1 ? args[1] : 0;
                    if (!isNaN(tx) && !isNaN(ty)) {
                        ctx.translate(tx, ty);
                    }
                }
                break;
            case 'scale':
                if (args.length >= 1) {
                    const sx = args[0];
                    const sy = args.length > 1 ? args[1] : sx;
                     if (!isNaN(sx) && !isNaN(sy)) {
                        ctx.scale(sx, sy);
                    }
                }
                break;
            case 'rotate':
                if (args.length >= 1) {
                    const angle = args[0] * (Math.PI / 180); // SVG rotate is in degrees
                    if (isNaN(angle)) continue;

                    if (args.length === 3) {
                        // cx, cy version
                        const cx = args[1];
                        const cy = args[2];
                        if (!isNaN(cx) && !isNaN(cy)) {
                            ctx.translate(cx, cy);
                            ctx.rotate(angle);
                            ctx.translate(-cx, -cy);
                        }
                    } else {
                        // rotate around origin (0,0)
                        ctx.rotate(angle);
                    }
                }
                break;
            // Other transforms like skewX, skewY, matrix could be added here in the future
        }
    }
}
