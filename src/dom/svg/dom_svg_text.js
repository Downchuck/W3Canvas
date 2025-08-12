import { SVGElement } from './dom_svg_base.js';
import { registerElement } from '../html/dom_html_basic.js';

export class SVGTextElement extends SVGElement {
  constructor() {
    super('text');
    this.x = 0;
    this.y = 0;
    this.text = "";
  }

  setX(x) { this.x = x; }
  getX() { return this.x; }
  setY(y) { this.y = y; }
  getY() { return this.y; }
  setText(text) { this.text = text; }
  getText() { return this.text; }

  repaint(ctx) {
    const fontSize = this.style.getFontSize() || 16; // default font size
    const fontFamily = this.style.getFontFamily() || 'sans-serif';
    ctx.font = `${fontSize}px ${fontFamily}`;

    ctx.fillStyle = this.getFill();
    if (ctx.fillStyle && ctx.fillStyle !== 'none') {
        ctx.fillText(this.text, this.x, this.y);
    }

    ctx.strokeStyle = this.getStroke();
    if (ctx.strokeStyle && ctx.strokeStyle !== 'none') {
        ctx.strokeText(this.text, this.x, this.y);
    }
  }
}

registerElement("svg:text", "SVGTextElement", SVGTextElement);
