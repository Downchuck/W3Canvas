import { SVGElement } from './dom_svg_base.js';
import { Font } from './font.js';
import { registerElement } from '../html/dom_html_basic.js';

export class SVGTextElement extends SVGElement {
  constructor() {
    super('text');
    this.x = 0;
    this.y = 0;
    this.text = "";
    this.font = new Font('examples/Z_testing_select_old/Arial.svg'); // Hardcoded for now
  }

  setX(x) { this.x = x; }
  getX() { return this.x; }
  setY(y) { this.y = y; }
  getY() { return this.y; }
  setText(text) { this.text = text; }
  getText() { return this.text; }

  repaint(ctx) {
    const fontSize = this.style.getFontSize() || 16; // default font size
    ctx.fillStyle = this.getFill();
    ctx.strokeStyle = this.getStroke();
    this.font.renderText(ctx, this.text, this.x, this.y, fontSize);
  }
}

registerElement("svg:text", "SVGTextElement", SVGTextElement);
