import { SVGElement } from './dom_svg_base.js';
import { registerElement } from '../html/dom_html_basic.js';

export class SVGGElement extends SVGElement {
    constructor() {
        super('g');
    }

    repaint(ctx) {
        if (!ctx) {
            console.error("Cannot repaint <g> element without a canvas context.");
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

class G extends SVGGElement {
    constructor() {
        super();
    }
}

registerElement('svg:g', 'SVGGElement', G);
