import { SVGElement } from './dom_svg_base.js';
import { registerElement } from '../html/dom_html_basic.js';

export class SVGEllipseElement extends SVGElement {
	constructor() {
		super('svg:ellipse');
		this.cx = 0;
		this.cy = 0;
		this.rx = 0;
		this.ry = 0;
	}

	getCx() { return this.cx; }
	setCx(val) { this.cx = val; }
	getCy() { return this.cy; }
	setCy(val) { this.cy = val; }
	getRx() { return this.rx; }
	setRx(val) { this.rx = val; }
	getRy() { return this.ry; }
	setRy(val) { this.ry = val; }
}

export class Ellipse extends SVGEllipseElement {
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
			console.error("Could not find canvas context to repaint ellipse.");
			return;
		}

		const cx = this.getCx() || 0;
		const cy = this.getCy() || 0;
		const rx = this.getRx() || 0;
		const ry = this.getRy() || 0;
		const fill = this.getFill();
		const stroke = this.getStroke();
		const strokeWidth = this.getStrokeWidth();

		this.ctx.beginPath();
		// The ellipse method signature is: ellipse(x, y, radiusX, radiusY, rotation, startAngle, endAngle)
		this.ctx.ellipse(cx, cy, rx, ry, 0, 0, 2 * Math.PI);

		if (fill) {
			this.ctx.fillStyle = fill;
			this.ctx.fill();
		}

		if (stroke) {
			this.ctx.lineWidth = strokeWidth;
			this.ctx.strokeStyle = stroke;
			this.ctx.stroke();
		}
	}
}

registerElement("svg:ellipse", "SVGEllipseElement", Ellipse);
