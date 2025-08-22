import { registerElement, HTMLElement } from './dom_html_basic.js';
import { BoxModelPainter } from '../css/box_paint.js';

export class HTMLOptionElement extends HTMLElement {
    constructor() {
        super("OPTION");
        this.selected = false;
        this.disabled = false;
        this.label = "";
        this.value = "";
        this.painter = new BoxModelPainter();
    }

    get text() {
        return this.textContent;
    }

    repaint(ctx) {
        this.painter.paintBox(ctx, this, this.style);
        const contentBox = this.getContentBox();
        ctx.save();
        ctx.fillStyle = this.style.getFont().getTextColor();
        this.painter.paintText(ctx, contentBox, this.text, this.style.getFont());
        ctx.restore();
    }
}

export class HTMLOptGroupElement extends HTMLElement {
    constructor() {
        super("OPTGROUP");
        this.disabled = true;
        this.label = "";
    }
}

