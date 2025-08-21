// This function is a port of the C# code from the answer at
// https://stackoverflow.com/questions/23363336/how-to-render-svg-elliptical-arc-in-swing
function svgArcToCenterParam(x1, y1, x2, y2, rx, ry, phi, fA, fS) {
    const PI = Math.PI;
    const PIx2 = PI * 2.0;

    if (rx < 0) rx = -rx;
    if (ry < 0) ry = -ry;

    if (rx === 0.0 || ry === 0.0) { // invalid arguments
        return null;
    }

    const s_phi = Math.sin(phi);
    const c_phi = Math.cos(phi);
    const hd_x = (x1 - x2) / 2.0;
    const hd_y = (y1 - y2) / 2.0;
    const hs_x = (x1 + x2) / 2.0;
    const hs_y = (y1 + y2) / 2.0;

    // F6.5.1
    const x1_ = c_phi * hd_x + s_phi * hd_y;
    const y1_ = -s_phi * hd_x + c_phi * hd_y;

    // F.6.6 Correction of out-of-range radii
    let L = (x1_ * x1_) / (rx * rx) + (y1_ * y1_) / (ry * ry);
    if (L > 1) {
        rx *= Math.sqrt(L);
        ry *= Math.sqrt(L);
    }

    // F6.5.2
    const rx_2 = rx * rx;
    const ry_2 = ry * ry;
    const x1__2 = x1_ * x1_;
    const y1__2 = y1_ * y1_;

    let s = (fA === fS ? -1 : 1) * Math.sqrt(
        Math.max(0, (rx_2 * ry_2 - rx_2 * y1__2 - ry_2 * x1__2)) / (rx_2 * y1__2 + ry_2 * x1__2)
    );
    if (isNaN(s)) s = 0;

    const cx_ = s * rx * y1_ / ry;
    const cy_ = s * -ry * x1_ / rx;

    // F6.5.3
    const cx = c_phi * cx_ - s_phi * cy_ + hs_x;
    const cy = s_phi * cx_ + c_phi * cy_ + hs_y;

    // F6.5.4
    const u = [(x1_ - cx_) / rx, (y1_ - cy_) / ry];
    const v = [(-x1_ - cx_) / rx, (-y1_ - cy_) / ry];

    // F6.5.5
    const a_start = Math.acos(u[0] / Math.sqrt(u[0] * u[0] + u[1] * u[1]));
    let startAngle = (u[1] < 0 ? -1 : 1) * a_start;

    // F6.5.6
    const a_delta = Math.acos((u[0] * v[0] + u[1] * v[1]) / (Math.sqrt(u[0] * u[0] + u[1] * u[1]) * Math.sqrt(v[0] * v[0] + v[1] * v[1])));
    let sweepAngle = a_delta;

    if (fS === 0 && sweepAngle > 0) {
        sweepAngle -= PIx2;
    }
    if (fS === 1 && sweepAngle < 0) {
        sweepAngle += PIx2;
    }

    return {
        cx: cx,
        cy: cy,
        rx: rx,
        ry: ry,
        startAngle: startAngle,
        endAngle: startAngle + sweepAngle,
        rotation: phi,
        anticlockwise: fS === 0
    };
}


export function parsePath(d) {
    const commands = [];
    const regex = /([MmLlZzHhVvCcSsQqTtAa])([^MmLlZzHhVvCcSsQqTtAa]*)/g;
    let match;
    let currentX = 0;
    let currentY = 0;
    let lastCubicControlX = 0;
    let lastCubicControlY = 0;
    let lastQuadraticControlX = 0;
    let lastQuadraticControlY = 0;

    while ((match = regex.exec(d)) !== null) {
        const command = match[1];
        const args = match[2].trim().split(/[\s,]+/).filter(s => s !== '').map(parseFloat);
        let x, y;

        switch (command) {
            case 'M': // moveto
                for (let i = 0; i < args.length; i += 2) {
                    x = args[i];
                    y = args[i+1];
                    commands.push({ type: 'M', x, y });
                    currentX = x;
                    currentY = y;
                }
                break;
            case 'm': // relative moveto
                for (let i = 0; i < args.length; i += 2) {
                    x = currentX + args[i];
                    y = currentY + args[i+1];
                    commands.push({ type: 'M', x, y });
                    currentX = x;
                    currentY = y;
                }
                break;
            case 'L': // lineto
                for (let i = 0; i < args.length; i += 2) {
                    x = args[i];
                    y = args[i+1];
                    commands.push({ type: 'L', x, y });
                    currentX = x;
                    currentY = y;
                }
                break;
            case 'l': // relative lineto
                for (let i = 0; i < args.length; i += 2) {
                    x = currentX + args[i];
                    y = currentY + args[i+1];
                    commands.push({ type: 'L', x, y });
                    currentX = x;
                    currentY = y;
                }
                break;
            case 'H': // horizontal lineto
                for (const arg of args) {
                    x = arg;
                    commands.push({ type: 'L', x, y: currentY });
                    currentX = x;
                }
                break;
            case 'h': // relative horizontal lineto
                for (const arg of args) {
                    x = currentX + arg;
                    commands.push({ type: 'L', x, y: currentY });
                    currentX = x;
                }
                break;
            case 'V': // vertical lineto
                for (const arg of args) {
                    y = arg;
                    commands.push({ type: 'L', x: currentX, y });
                    currentY = y;
                }
                break;
            case 'v': // relative vertical lineto
                for (const arg of args) {
                    y = currentY + arg;
                    commands.push({ type: 'L', x: currentX, y });
                    currentY = y;
                }
                break;
            case 'Z': // closepath
            case 'z':
                commands.push({ type: 'Z' });
                break;
            case 'C': // curveto
                for (let i = 0; i < args.length; i += 6) {
                    x = args[i+4];
                    y = args[i+5];
                    commands.push({ type: 'C', x1: args[i], y1: args[i+1], x2: args[i+2], y2: args[i+3], x, y });
                    lastCubicControlX = args[i+2];
                    lastCubicControlY = args[i+3];
                    currentX = x;
                    currentY = y;
                }
                break;
            case 'c': // relative curveto
                for (let i = 0; i < args.length; i += 6) {
                    const x1 = currentX + args[i];
                    const y1 = currentY + args[i+1];
                    const x2 = currentX + args[i+2];
                    const y2 = currentY + args[i+3];
                    x = currentX + args[i+4];
                    y = currentY + args[i+5];
                    commands.push({ type: 'C', x1, y1, x2, y2, x, y });
                    lastCubicControlX = x2;
                    lastCubicControlY = y2;
                    currentX = x;
                    currentY = y;
                }
                break;
            case 'S': // smooth curveto
                for (let i = 0; i < args.length; i += 4) {
                    const x1 = 2 * currentX - lastCubicControlX;
                    const y1 = 2 * currentY - lastCubicControlY;
                    const x2 = args[i];
                    const y2 = args[i+1];
                    x = args[i+2];
                    y = args[i+3];
                    commands.push({ type: 'C', x1, y1, x2, y2, x, y });
                    lastCubicControlX = x2;
                    lastCubicControlY = y2;
                    currentX = x;
                    currentY = y;
                }
                break;
            case 's': // relative smooth curveto
                for (let i = 0; i < args.length; i += 4) {
                    const x1 = 2 * currentX - lastCubicControlX;
                    const y1 = 2 * currentY - lastCubicControlY;
                    const x2 = currentX + args[i];
                    const y2 = currentY + args[i+1];
                    x = currentX + args[i+2];
                    y = currentY + args[i+3];
                    commands.push({ type: 'C', x1, y1, x2, y2, x, y });
                    lastCubicControlX = x2;
                    lastCubicControlY = y2;
                    currentX = x;
                    currentY = y;
                }
                break;
            case 'Q': // quadratic bezier
                for (let i = 0; i < args.length; i += 4) {
                    x = args[i+2];
                    y = args[i+3];
                    commands.push({ type: 'Q', x1: args[i], y1: args[i+1], x, y });
                    lastQuadraticControlX = args[i];
                    lastQuadraticControlY = args[i+1];
                    currentX = x;
                    currentY = y;
                }
                break;
            case 'q': // relative quadratic bezier
                for (let i = 0; i < args.length; i += 4) {
                    const x1 = currentX + args[i];
                    const y1 = currentY + args[i+1];
                    x = currentX + args[i+2];
                    y = currentY + args[i+3];
                    commands.push({ type: 'Q', x1, y1, x, y });
                    lastQuadraticControlX = x1;
                    lastQuadraticControlY = y1;
                    currentX = x;
                    currentY = y;
                }
                break;
            case 'T': // smooth quadratic bezier
                for (let i = 0; i < args.length; i += 2) {
                    const x1 = 2 * currentX - lastQuadraticControlX;
                    const y1 = 2 * currentY - lastQuadraticControlY;
                    x = args[i];
                    y = args[i+1];
                    commands.push({ type: 'Q', x1, y1, x, y });
                    lastQuadraticControlX = x1;
                    lastQuadraticControlY = y1;
                    currentX = x;
                    currentY = y;
                }
                break;
            case 't': // relative smooth quadratic bezier
                for (let i = 0; i < args.length; i += 2) {
                    const x1 = 2 * currentX - lastQuadraticControlX;
                    const y1 = 2 * currentY - lastQuadraticControlY;
                    x = currentX + args[i];
                    y = currentY + args[i+1];
                    commands.push({ type: 'Q', x1, y1, x, y });
                    lastQuadraticControlX = x1;
                    lastQuadraticControlY = y1;
                    currentX = x;
                    currentY = y;
                }
                break;
            case 'A': // elliptical arc
                for (let i = 0; i < args.length; i += 7) {
                    x = args[i+5];
                    y = args[i+6];
                    const arcParams = svgArcToCenterParam(currentX, currentY, x, y, args[i], args[i+1], args[i+2] * Math.PI / 180.0, args[i+3], args[i+4]);
                    if (arcParams) {
                        commands.push({ type: 'A', ...arcParams });
                    }
                    currentX = x;
                    currentY = y;
                }
                break;
            case 'a': // relative elliptical arc
                for (let i = 0; i < args.length; i += 7) {
                    x = currentX + args[i+5];
                    y = currentY + args[i+6];
                    const arcParams = svgArcToCenterParam(currentX, currentY, x, y, args[i], args[i+1], args[i+2] * Math.PI / 180.0, args[i+3], args[i+4]);
                    if (arcParams) {
                        commands.push({ type: 'A', ...arcParams });
                    }
                    currentX = x;
                    currentY = y;
                }
                break;
        }
    }
    return commands;
}
