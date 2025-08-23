import { SVGElement } from './dom_svg.js';
import { registerElement } from '../html/dom_html_basic.js';

export { SVGElement };

class SVGSVGElement extends SVGElement {
    constructor() {
        super('svg');
        this.width = 0;
        this.height = 0;
    }

    getWidth() { return this.width; }
    setWidth(w) { this.width = w; }
    getHeight() { return this.height; }
    setHeight(h) { this.height = h; }

    repaint(ctx) {
        // If no context is provided, find it from the parent canvas
        if (!ctx) {
            let parent = this.getParent();
            while(parent && parent.tagName !== 'CANVAS') {
                parent = parent.getParent();
            }
            if (parent && parent.tagName === 'CANVAS') {
                ctx = parent.getContext('2d');
            }
        }

        if (!ctx) {
            console.error("Could not find canvas context for SVG element.");
            return;
        }

        ctx.save();
        this.applyTransform(ctx);

        // Repaint all child elements
        for (const child of this.children) {
            if (typeof child.repaint === 'function') {
                child.repaint(ctx);
            }
        }

        ctx.restore();
    }
}

export class SVG extends SVGSVGElement {
    constructor() {
        super();
    }
}

registerElement('svg:svg', 'SVGSVGElement', SVG);
