import { NodeIterator } from './html/dom_core.js';
import { SVGElement } from './svg/dom_svg_base.js';

const dirtyElements = new Set();

export function requestRepaint(element) {
    dirtyElements.add(element);
}

export function render(domElement, canvasContext) {
    // Full repaint
    const iterator = new NodeIterator(domElement, (el) => {
        if (el.nodeType === 1) { // ELEMENT_NODE
            if (el instanceof SVGElement) {
                if (el && typeof el.repaint === 'function') {
                    el.repaint(canvasContext);
                }
            } else {
                if (el && typeof el.repaint === 'function' && el.tagName !== 'CANVAS') {
                    el.repaint(canvasContext);
                }
            }
        }
    });
    iterator.start();

    // Partial repaint of dirty elements
    for (const el of dirtyElements) {
        el.repaint(canvasContext);
    }
    dirtyElements.clear();
}
