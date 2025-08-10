import { ElementStyle, CssStyle } from '../css/css_style.js';
import { Element } from '../html/dom_core.js';
import { mixin } from '../../legacy/lang_util.js';
import { registerElement } from '../html/dom_html_basic.js';
import { currentDocument } from '../html/dom_html_doc.js';
import { scanlineFill } from '../../core/algorithms/scanline_fill.js';
import { bresenham } from '../../core/algorithms/bresenham.js';
import { drawBezier } from '../../core/algorithms/bezier.js';

export class SVGElement extends Element {
	constructor(tag) {
		super(tag);
		this.style = new ElementStyle(new CssStyle(), this);
		this.fill = "";
		this.stroke = "";
	}

	currentColor(color) {
		if(color && color != 'currentColor') return color;
		if(typeof(this.style) != 'undefined' && this.style.getFont()) return this.style.getFont().color;
		return '';
	}

	setStroke(s) { this.stroke = s; }
	getStroke() { return this.currentColor(this.stroke); }
	setFill(f) { this.fill = f; }
	getFill() { return this.currentColor(this.fill); }
	getBoundingRect() { return this.getBorderBox(); }
}

export class SVGRectElement extends SVGElement {
	constructor() {
		super('svg:rect');
		this.width = 0;
		this.height = 0;
		this.x = 0;
		this.y = 0;
		this.rx = 0;
		this.ry = 0;
	}

	getX() { return this.x; }
	setX(newX) { this.x = newX; }
	getY() { return this.y; }
	setY(newY) { this.y = newY; }
	getRy() { return this.ry; }
	setRy(newRy) { this.ry = newRy; }
	getRx() { return this.rx; }
	setRx(newRx) { this.rx = newRx; }
	getHeight() { return this.height; }
	setHeight(h) { this.height = h; }
	getWidth() { return this.width; }
	setWidth(w) { this.width = w; }
}

export class Rectangle extends SVGRectElement {
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
			console.error("Could not find canvas context to repaint rectangle.");
			return;
		}

		const x = this.getX() || 0;
		const y = this.getY() || 0;
		const w = this.getWidth() || 300;
		const h = this.getHeight() || 150;
		const rx = this.getRx() || 0;
		const ry = this.getRy() || 0;
		const fill = this.getFill();
		const stroke = this.getStroke();

		this.ctx.fillStyle = fill;
		if (fill) {
			if (rx === 0 && ry === 0) {
				this.ctx.fillRect(x, y, w, h);
			} else {
				this.rectPainter(x, y, w, h, rx, ry);
				this.ctx.fill();
			}
		}

		this.ctx.strokeStyle = stroke;
		this.ctx.fillStyle = stroke;
		if (stroke) {
			if (rx === 0 && ry === 0) {
				bresenham(this.ctx, x, y, x + w, y);
				bresenham(this.ctx, x + w, y, x + w, y + h);
				bresenham(this.ctx, x + w, y + h, x, y + h);
				bresenham(this.ctx, x, y + h, x, y);
			} else {
				bresenham(this.ctx, x + rx, y, x + w - rx, y);
				drawBezier(this.ctx, x + w - rx, y, x + w, y, x + w, y + ry, x + w, y + ry);
				bresenham(this.ctx, x + w, y + ry, x + w, y + h - ry);
				drawBezier(this.ctx, x + w, y + h - ry, x + w, y + h, x + w - rx, y + h, x + w - rx, y + h);
				bresenham(this.ctx, x + w - rx, y + h, x + rx, y + h);
				drawBezier(this.ctx, x + rx, y + h, x, y + h, x, y + h - ry, x, y + h - ry);
				bresenham(this.ctx, x, y + h - ry, x, y + ry);
				drawBezier(this.ctx, x, y + ry, x, y, x + rx, y, x + rx, y);
			}
		}
	}

	rectPainter(x,y,w,h,rx,ry) {
		if(!rx) {
			this.ctx.beginPath();
			this.ctx.rect(x,y,w,h);
			this.ctx.closePath();
			return;
		}
		this.ctx.beginPath();
		this.ctx.moveTo(x+rx,y);
		this.ctx.lineTo(x+w-rx,y);
		this.ctx.bezierCurveTo(x+w,y,x+w,y+ry,x+w,y+ry);
		this.ctx.lineTo(x+w,y+h-ry);
		this.ctx.bezierCurveTo(x+w,y+h,x+w-rx,y+h,x+w-rx,y+h);
		this.ctx.lineTo(x+rx,y+h);
		this.ctx.bezierCurveTo(x,y+h,x,y+h-ry,x,y+h-ry);
		this.ctx.lineTo(x,y+ry);
		this.ctx.bezierCurveTo(x,y,x+rx,y,x+rx,y);
		this.ctx.closePath();
	}
}

registerElement("svg:rect", "SVGRectElement", Rectangle);
