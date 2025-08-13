import { NodeIterator } from './html/dom_core.js';
import { SVGElement } from './svg/dom_svg_base.js';

export function render(domElement, canvasContext) {
  const iterator = new NodeIterator(domElement, (el) => {
    if (el.nodeType === 1) { // ELEMENT_NODE
      if (el instanceof SVGElement) {
        if (el && typeof el.repaint === 'function') {
          el.repaint(canvasContext);
        }
      } else {
        // Handle non-SVG elements (HTML with box model)
        if (el && typeof el.repaint === 'function' && el.tagName !== 'CANVAS') {
           el.repaint(canvasContext);
        }
      }
    }
  });
  iterator.start();
}
