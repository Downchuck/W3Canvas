import { SVGElement } from './dom_svg_base.js';

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
    if (this.getFill()) {
      ctx.fillStyle = this.getFill();
      ctx.fillText(this.text, this.x, this.y);
    }
    if (this.getStroke()) {
      ctx.strokeStyle = this.getStroke();
      ctx.strokeText(this.text, this.x, this.y);
    }
  }
}
