export function parsePath(d) {
    const commands = [];
    const regex = /([MmLlZzHhVvCcSsQqTtAa])([^MmLlZzHhVvCcSsQqTtAa]*)/g;
    let match;
    while ((match = regex.exec(d)) !== null) {
        const command = match[1];
        const args = match[2].trim().split(/[\s,]+/).filter(s => s !== '').map(parseFloat);

        switch (command) {
            case 'M': // moveto
            case 'L': // lineto
                for (let i = 0; i < args.length; i += 2) {
                    commands.push({ type: command, x: args[i], y: args[i+1] });
                }
                break;
            case 'Z': // closepath
            case 'z':
                commands.push({ type: 'Z' });
                break;
            // TODO: Add other path commands (H, V, C, S, Q, T, A)
            // TODO: Add relative versions (m, l, h, v, etc.)
        }
    }
    return commands;
}
