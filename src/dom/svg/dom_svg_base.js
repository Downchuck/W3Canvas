import { Element } from '../html/dom_core.js';

export class SVGElement extends Element {
	constructor(tag) {
		super(tag);
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
