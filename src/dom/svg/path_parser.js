export function parsePath(d) {
    const commands = [];
    const regex = /([MmLlZzHhVvCcSsQqTtAa])([^MmLlZzHhVvCcSsQqTtAa]*)/g;
    let match;
    let currentX = 0;
    let currentY = 0;

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
                    currentX = x;
                    currentY = y;
                }
                break;
            // TODO: Add other path commands (S, Q, T, A)
        }
    }
    return commands;
}
