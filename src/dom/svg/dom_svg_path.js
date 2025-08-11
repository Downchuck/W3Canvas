import { SVGElement } from './dom_svg_base.js';
import { registerElement } from '../html/dom_html_basic.js';

export class SVGPathElement extends SVGElement {
    constructor() {
        super('svg:path');
        this.d = '';
    }

    setD(d) { this.d = d; }
    getD() { return this.d; }

    parsePath(d) {
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

    repaint() {
        if (!this.ctx) {
            let parent = this.getParent();
            while(parent && parent.tagName !== 'CANVAS') {
                parent = parent.getParent();
            }
            if (parent && parent.tagName === 'CANVAS') {
                this.ctx = parent.getContext('2d');
            }
        }

        if (!this.ctx) {
            console.error("Could not find canvas context to repaint path.");
            return;
        }

        const pathCommands = this.parsePath(this.d);

        this.ctx.beginPath();

        for (const command of pathCommands) {
            switch (command.type) {
                case 'M':
                    this.ctx.moveTo(command.x, command.y);
                    break;
                case 'L':
                    this.ctx.lineTo(command.x, command.y);
                    break;
                case 'Z':
                    this.ctx.closePath();
                    break;
            }
        }

        const fill = this.getFill();
        const stroke = this.getStroke();

        if (fill) {
            this.ctx.fillStyle = fill;
            this.ctx.fill();
        }

        if (stroke) {
            this.ctx.strokeStyle = stroke;
            this.ctx.stroke();
        }
    }
}

registerElement("svg:path", "SVGPathElement", SVGPathElement);
