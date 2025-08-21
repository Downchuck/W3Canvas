import { SVGElement } from './dom_svg.js';
import { registerElement } from '../html/dom_html_basic.js';

export { SVGElement };

class SVGSVGElement extends SVGElement {
    constructor() {
        super('svg');
    }
}


registerElement('svg:svg', 'SVGSVGElement', SVGSVGElement);
