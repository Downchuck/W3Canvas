import { SVGElement } from './dom_svg_base.js';
import { registerElement } from '../html/dom_html_basic.js';
import { parsePath } from './path_parser.js';

export class SVGPathElement extends SVGElement {
    constructor() {
        super('svg:path');
        this.d = '';
    }

    setD(d) { this.d = d; }
    getD() { return this.d; }

    repaint(ctx) {
        if (!ctx) {
			// Fallback for tests that don't pass a context
			let parent = this.getParent();
			while(parent && parent.tagName !== 'CANVAS') {
				parent = parent.getParent();
			}
			if (parent && parent.tagName === 'CANVAS') {
				ctx = parent.getContext('2d');
			}
		}
        if (!ctx) {
            console.error("Could not find canvas context to repaint path.");
            return;
        }
        this.ctx = ctx;

        ctx.save();
        this.applyTransform(ctx);

        const pathCommands = parsePath(this.getD());

        this.ctx.beginPath();

        for (const command of pathCommands) {
            switch (command.type) {
                case 'M':
                    this.ctx.moveTo(command.x, command.y);
                    break;
                case 'L':
                    this.ctx.lineTo(command.x, command.y);
                    break;
                case 'C':
                    this.ctx.bezierCurveTo(command.x1, command.y1, command.x2, command.y2, command.x, command.y);
                    break;
                case 'Q':
                    this.ctx.quadraticCurveTo(command.x1, command.y1, command.x, command.y);
                    break;
                case 'A':
                    this.ctx.ellipse(command.cx, command.cy, command.rx, command.ry, command.rotation, command.startAngle, command.endAngle, command.anticlockwise);
                    break;
                case 'Z':
                    this.ctx.closePath();
                    break;
            }
        }

        const fill = this.getFill();
        const stroke = this.getStroke();
        const strokeWidth = this.getStrokeWidth();

        if (fill) {
            this.ctx.fillStyle = fill;
            this.ctx.fill();
        }

        if (stroke) {
            this.ctx.lineWidth = strokeWidth;
            this.ctx.strokeStyle = stroke;
            this.ctx.stroke();
        }

        ctx.restore();
    }
}

registerElement("svg:path", "SVGPathElement", SVGPathElement);
