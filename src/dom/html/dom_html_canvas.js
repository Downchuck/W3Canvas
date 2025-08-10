import { HTMLElement, registerElement } from './dom_html_basic.js';
import { CanvasRenderingContext2D } from '../../core/canvas/CanvasRenderingContext2D.js';

class HTMLCanvasElement extends HTMLElement {
  constructor() {
    super('CANVAS');
    this.width = 0;
    this.height = 0;
    this.context = null;
  }

  getContext(contextId) {
    if (contextId === '2d') {
      if (!this.context) {
        this.context = new CanvasRenderingContext2D(this.width, this.height);
        this.context.canvas = this;
      }
      return this.context;
    }
    return null;
  }

  getWidth() {
    return this.width;
  }

  setWidth(w) {
    this.width = w;
    if (this.context) {
      this.context.width = w;
      this.context.imageData.width = w;
    }
  }

  getHeight() {
    return this.height;
  }

  setHeight(h) {
    this.height = h;
    if (this.context) {
      this.context.height = h;
      this.context.imageData.height = h;
    }
  }
}

registerElement("CANVAS", "HTMLCanvasElement", HTMLCanvasElement);
