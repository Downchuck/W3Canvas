import { HTMLElement, registerElement } from './dom_html_basic.js';
import { mixin } from '../lang_util.js';

registerElement("CANVAS", "HTMLCanvasElement", function(element) {
  const CanvasElement = function() {
    this.width = 0;
    this.height = 0;
    this.getContext = (contextId) => {
      if (contextId === '2d') {
        // This will be replaced by our custom context
        return {};
      }
      return null;
    };
    this.getWidth = () => this.width;
    this.setWidth = (w) => this.width = w;
    this.getHeight = () => this.height;
    this.setHeight = (h) => this.height = h;
  };
  const base = new HTMLElement(element);
  return mixin(base, new CanvasElement());
});
