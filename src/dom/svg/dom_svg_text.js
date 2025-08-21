import { SVGElement } from './dom_svg_base.js';
import { registerElement } from '../html/dom_html_basic.js';

export class SVGTextElement extends SVGElement {
  constructor() {
    super('text');
    this.x = 0;
    this.y = 0;
    this.dx = 0;
    this.dy = 0;
    this.text = "";
  }

  setX(x) { this.x = x; }
  getX() { return this.x; }
  setY(y) { this.y = y; }
  getY() { return this.y; }
  setDx(dx) { this.dx = dx; }
  getDx() { return this.dx; }
  setDy(dy) { this.dy = dy; }
  getDy() { return this.dy; }
  setText(text) { this.text = text; }
  getText() {
    if (this.children.length > 0 && this.children[0].nodeType === 3) { // TEXT_NODE
        return this.children[0].getData();
    }
    return this.text;
  }
  getTextAnchor() { return this.getAttribute('text-anchor') || 'start'; }

  repaint(ctx) {
    if (!ctx) {
		// Fallback for tests that don't pass a context
		let parent = this.getParent();
		while(parent && parent.tagName !== 'CANVAS') {
			parent = parent.getParent();
		}
		if (parent && parent.tagName === 'CANVAS') {
			ctx = parent.getContext('2d');
		}
	}
    if (!ctx) {
      console.error("Could not find canvas context to repaint text.");
      return;
    }
    this.ctx = ctx;

    ctx.save();
    this.applyTransform(ctx);

    const x = (this.getX() || 0) + (this.getDx() || 0);
    const y = (this.getY() || 0) + (this.getDy() || 0);
    const text = this.getText();
    const anchor = this.getTextAnchor();

    const fontSize = this.style.getFontSize() || 16; // default font size
    const fontFamily = this.style.getFontFamily() || 'sans-serif';
    ctx.font = `${fontSize}px ${fontFamily}`;

    if (anchor === 'middle') {
        ctx.textAlign = 'center';
    } else if (anchor === 'end') {
        ctx.textAlign = 'end';
    } else {
        ctx.textAlign = 'start';
    }

    ctx.fillStyle = this.getFill();
    if (ctx.fillStyle && ctx.fillStyle !== 'none') {
        ctx.fillText(text, x, y);
    }

    ctx.strokeStyle = this.getStroke();
    if (ctx.strokeStyle && ctx.strokeStyle !== 'none') {
        ctx.strokeText(text, x, y);
    }

    ctx.restore();
  }
}

registerElement("svg:text", "SVGTextElement", SVGTextElement);
