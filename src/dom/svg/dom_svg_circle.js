import { SVGElement } from './dom_svg_base.js';
import { registerElement } from '../html/dom_html_basic.js';

export class SVGCircleElement extends SVGElement {
	constructor() {
		super('svg:circle');
		this.cx = 0;
		this.cy = 0;
		this.r = 0;
	}

	getCx() { return this.cx; }
	setCx(val) { this.cx = val; }
	getCy() { return this.cy; }
	setCy(val) { this.cy = val; }
	getR() { return this.r; }
	setR(val) { this.r = val; }
}

export class Circle extends SVGCircleElement {
	constructor() {
		super();
		this.ctx = null;
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
			console.error("Could not find canvas context to repaint circle.");
			return;
		}

		const cx = this.getCx() || 0;
		const cy = this.getCy() || 0;
		const r = this.getR() || 0;
		const fill = this.getFill();
		const stroke = this.getStroke();

		this.ctx.beginPath();
		this.ctx.arc(cx, cy, r, 0, 2 * Math.PI, false);
		this.ctx.closePath();

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

registerElement("svg:circle", "SVGCircleElement", Circle);
