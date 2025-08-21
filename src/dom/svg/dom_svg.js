import { Element } from '../html/dom_core.js';
import { applyTransform as applyTransformString } from './transform_parser.js';

export class SVGElement extends Element {
	constructor(tag) {
		super(tag);
		this.fill = "";
		this.stroke = "";
		this.strokeWidth = 1;
	}

    setTransform(t) { this.setAttribute('transform', t); }
    getTransform() { return this.getAttribute('transform') || ''; }

    applyTransform(ctx) {
        const transformString = this.getTransform();
        if (transformString) {
            applyTransformString(ctx, transformString);
        }
    }

	currentColor(color) {
		if(color && color != 'currentColor') return color;
		if(typeof(this.style) != 'undefined' && this.style.getFont()) return this.style.getFont().color;
		return '';
	}

	setStroke(s) { this.setAttribute('stroke', s); }
	getStroke() { return this.currentColor(this.getAttribute('stroke')); }
	setStrokeWidth(sw) { this.setAttribute('stroke-width', sw); }
	getStrokeWidth() { return this.getAttribute('stroke-width') || 1; }
	setFill(f) { this.setAttribute('fill', f); }
	getFill() { return this.currentColor(this.getAttribute('fill')); }
	getBoundingRect() { return this.getBorderBox(); }
}
