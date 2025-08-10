import { NodeIterator } from './html/dom_core.js';

function repaintElement(element) {
  if (element && typeof element.repaint === 'function') {
    element.repaint();
  }
}

export function render(domElement, canvasContext) {
  const iterator = new NodeIterator(domElement, (el) => {
    if (el.nodeType === 1) { // ELEMENT_NODE
      repaintElement(el);
    }
  });
  iterator.start();
}
