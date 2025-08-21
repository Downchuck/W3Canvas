import { SVGElement } from './dom_svg_base.js';
import { registerElement } from '../html/dom_html_basic.js';

export class SVGLineElement extends SVGElement {
	constructor() {
		super('svg:line');
		this.x1 = 0;
		this.y1 = 0;
		this.x2 = 0;
		this.y2 = 0;
	}

	getX1() { return this.x1; }
	setX1(val) { this.x1 = val; }
	getY1() { return this.y1; }
	setY1(val) { this.y1 = val; }
	getX2() { return this.x2; }
	setX2(val) { this.x2 = val; }
	getY2() { return this.y2; }
	setY2(val) { this.y2 = val; }
}

export class Line extends SVGLineElement {
	constructor() {
		super();
		this.ctx = null;
	}

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
			console.error("Could not find canvas context to repaint line.");
			return;
		}
		this.ctx = ctx;

		ctx.save();
		this.applyTransform(ctx);

		const x1 = this.getX1() || 0;
		const y1 = this.getY1() || 0;
		const x2 = this.getX2() || 0;
		const y2 = this.getY2() || 0;
		const stroke = this.getStroke();
		const strokeWidth = this.getStrokeWidth();

		if (stroke) {
			this.ctx.beginPath();
			this.ctx.moveTo(x1, y1);
			this.ctx.lineTo(x2, y2);
			this.ctx.strokeStyle = stroke;
			this.ctx.lineWidth = strokeWidth;
			this.ctx.stroke();
		}

		ctx.restore();
	}
}

registerElement("svg:line", "SVGLineElement", Line);
