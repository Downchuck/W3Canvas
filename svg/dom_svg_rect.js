import { ElementStyle, CssStyle } from '../css/css_style.js';
import { BoxModel } from '../css/box_model.js';
import { mixin } from '../lang_util.js';
import { registerElement } from '../html/dom_html_basic.js';
import { currentDocument } from '../html/dom_html_doc.js';
import { scanlineFill } from '../alg/scanline_fill.js';
import { bresenham } from '../alg/bresenham.js';
import { drawBezier } from '../alg/bezier.js';

export class SVGAnimatable {
	constructor(element) {
	}
}

export class SVGElement extends BoxModel {
	style: ElementStyle;
	constructor(element) {
		super();
		const svgElement = new (function() {
			this.id = "";
			this.className = "";
			this.getId = () => this.id;
			this.setId = (d) => this.id = d;
			this.getClassName = () => this.className;
			this.setClassName = (c) => this.className = c;
		})();

		this.style = new ElementStyle(new CssStyle(), svgElement);
		const svgStyleable = new (function() {
			this.fill = "";
			this.stroke = "";
			this.currentColor = (color) => {
				if(color && color != 'currentColor') return color;
				if(typeof(element.style) != 'undefined') return element.style.getColor();
				return '';
			}
			this.setStroke = (s) => this.stroke = s;
			this.getStroke = () => this.currentColor(this.stroke);
			this.setFill = (f) => this.fill = f;
			this.getFill = () => this.currentColor(this.fill);
		})();
		mixin(this, svgStyleable);
		this.getBoundingRect = () => this.getBorderBox();
	}
}

registerElement("svg:rect", "SVGRectElement", function(element) {
	const RectElement = function() {
		this.width = 0;
		this.height = 0;
		this.x = 0;
		this.y = 0;
		this.rx = 0;
		this.ry = 0;
		this.getX = () => this.x;
		this.setX = (newX) => this.x = newX;
		this.getY = () => this.y;
		this.setY = (newY) => this.y = newY;
		this.getRy = () => this.ry;
		this.setRy = (newRy) => this.ry = newRy;
		this.getRx = () => this.rx;
		this.setRx = (newRx) => this.rx = newRx;
		this.getHeight = () => this.height;
		this.setHeight = (h) => this.height = h;
		this.getWidth = () => this.width;
		this.setWidth = (w) => this.width = w;
	};
	const base = new SVGElement(element);
	return mixin(base, new RectElement());
});

export class Rectangle {
	constructor(layer) {
		const rectEl = currentDocument.createElement("svg:rect");
		const ctx = layer.getContext('2d');

		const RectDisplay = function() {
			const RectDom = function (rect,fn) {
				const w = rect.hasAttribute('width') ? Number(rect.getAttribute('width')) : 0;
				const h = rect.hasAttribute('height') ? Number(rect.getAttribute('height')) : 0;
				const x = rect.hasAttribute('x') ? Number(rect.getAttribute('x')) : 0;
				const y = rect.hasAttribute('y') ? Number(rect.getAttribute('y')) : 0;
				let rx = rect.hasAttribute('rx') ? Number(rect.getAttribute('rx')) : 0;
				let ry = rect.hasAttribute('ry') ? Number(rect.getAttribute('ry')) : 0;
				if(w <= 0 || h <= 0) return;
				if ((rx == 0 || ry == 0) && !(rx == 0 && ry == 0)) {
					rx = (rx == 0) ? ry : rx;
					ry = (ry == 0) ? rx : ry;
				}
				if(typeof(fn) != 'function') fn = RectReflectString;
				return fn(x,y,w,h,rx,ry);
			};

			const RectReflectString = function (x,y,w,h,rx,ry) {
				if(!rx) return ['M'+x,y,'H'+(x+w),'L'+(h+y),'H'+x,'L'+y,'z'].join(',');
				return ['M'+x,y,
					'H'+(x+w),'C'+[x+w,y,x+w,y+ry,x+w,y+ry].join(','),
					'L'+(h+y),'C'+[x+w,y+h,x+w-rx,y+h,x+w-rx,y+h].join(','),
					'H'+x,'C'+[x,y+h,x,y+h-ry,x,y+h-ry].join(','),
					'L'+y,'C'+[x,y,x+rx,y,x+rx,y].join(','),'z'].join(',');
			};

			const RectPainter = function (x,y,w,h,rx,ry) {
				if(!rx) {
					ctx.beginPath();
					ctx.rect(x,y,w,h);
					ctx.closePath();
					return;
				}
				ctx.beginPath();
				ctx.moveTo(x+rx,y);
				ctx.lineTo(x+w-rx,y);
				ctx.bezierCurveTo(x+w,y,x+w,y+ry,x+w,y+ry);
				ctx.lineTo(x+w,y+h-ry);
				ctx.bezierCurveTo(x+w,y+h,x+w-rx,y+h,x+w-rx,y+h);
				ctx.lineTo(x+rx,y+h);
				ctx.bezierCurveTo(x,y+h,x,y+h-ry,x,y+h-ry);
				ctx.lineTo(x,y+ry);
				ctx.bezierCurveTo(x,y,x+rx,y,x+rx,y);
				ctx.closePath();
			};

			this.repaint = function() {
				const x = this.getX() || 0;
				const y = this.getY() || 0;
				const w = this.getWidth() || 300;
				const h = this.getHeight() || 150;
				const rx = this.getRx() || 0;
				const ry = this.getRy() || 0;
				const fill = this.getFill();
				const stroke = this.getStroke();

				ctx.fillStyle = fill;
				if (fill) {
					if (rx === 0 && ry === 0) {
						scanlineFill(ctx, x, y, w, h);
					} else {
						RectPainter(x, y, w, h, rx, ry);
						ctx.fill();
					}
				}

				ctx.strokeStyle = stroke;
				ctx.fillStyle = stroke;
				if (stroke) {
					if (rx === 0 && ry === 0) {
						bresenham(ctx, x, y, x + w, y);
						bresenham(ctx, x + w, y, x + w, y + h);
						bresenham(ctx, x + w, y + h, x, y + h);
						bresenham(ctx, x, y + h, x, y);
					} else {
						bresenham(ctx, x + rx, y, x + w - rx, y);
						drawBezier(ctx, x + w - rx, y, x + w, y, x + w, y + ry, x + w, y + ry);
						bresenham(ctx, x + w, y + ry, x + w, y + h - ry);
						drawBezier(ctx, x + w, y + h - ry, x + w, y + h, x + w - rx, y + h, x + w - rx, y + h);
						bresenham(ctx, x + w - rx, y + h, x + rx, y + h);
						drawBezier(ctx, x + rx, y + h, x, y + h, x, y + h - ry, x, y + h - ry);
						bresenham(ctx, x, y + h - ry, x, y + ry);
						drawBezier(ctx, x, y + ry, x, y, x + rx, y, x + rx, y);
					}
				}
			};

			this.getPainter = () => RectPainter;
			this.getDom = () => RectDom;
			this.getString = () => RectReflectString;
		};

		return mixin(rectEl, new RectDisplay());
	}
}
