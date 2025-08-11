import { ElementStyle, CssStyle } from '../css/css_style.js';
import { Element } from '../html/dom_core.js';
import { mixin } from '../../legacy/lang_util.js';
import { registerElement } from '../html/dom_html_basic.js';
import { currentDocument } from '../html/dom_html_doc.js';

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

		this.ctx.beginPath();
		this.rectPainter(x, y, w, h, rx, ry);
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

	rectPainter(x,y,w,h,rx,ry) {
		if(!rx) {
			this.ctx.rect(x,y,w,h);
			return;
		}
		this.ctx.moveTo(x+rx,y);
		this.ctx.lineTo(x+w-rx,y);
		this.ctx.bezierCurveTo(x+w,y,x+w,y+ry,x+w,y+ry);
		this.ctx.lineTo(x+w,y+h-ry);
		this.ctx.bezierCurveTo(x+w,y+h,x+w-rx,y+h,x+w-rx,y+h);
		this.ctx.lineTo(x+rx,y+h);
		this.ctx.bezierCurveTo(x,y+h,x,y+h-ry,x,y+h-ry);
		this.ctx.lineTo(x,y+ry);
		this.ctx.bezierCurveTo(x,y,x+rx,y,x+rx,y);
	}
}

registerElement("svg:rect", "SVGRectElement", Rectangle);
