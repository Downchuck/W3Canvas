import { registerElement, HTMLElement } from './dom_html_basic.js';
import { BoxModelPainter } from '../css/box_paint.js';

export class HTMLInputElement extends HTMLElement {
    constructor() {
        super("INPUT");
        this.type = 'text';
        this.value = '';
        this.name = '';
        this.checked = false;
        this.disabled = false;
        this.painter = new BoxModelPainter();
        this.isFocused = false;

        this.addEventListener('focus', (e) => {
            this.isFocused = true;
            this.requestRepaint();
        });

        this.addEventListener('blur', (e) => {
            this.isFocused = false;
            this.requestRepaint();
        });

        this.addEventListener('keydown', (e) => {
            if (!this.isFocused) return;
            if (e.key.length === 1) {
                this.value += e.key;
                this.requestRepaint();
            } else if (e.key === 'Backspace') {
                this.value = this.value.slice(0, -1);
                this.requestRepaint();
            }
        });
    }

    repaint(ctx) {
        this.painter.paintBox(ctx, this, this.style);
        if (this.type === 'text') {
            const contentBox = this.getContentBox();
            ctx.save();
            ctx.fillStyle = this.style.getFont().getTextColor();
            let textToRender = this.value;
            if (this.isFocused) {
                textToRender += '|'; // Simple cursor
            }
            this.painter.paintText(ctx, contentBox, textToRender, this.style.getFont());
            ctx.restore();
        }
    }

    hitTest(x, y) {
        return this.getBoundingRect().isPointInsideBox(x, y);
    }

    setAttribute(name, value) {
        super.setAttribute(name, value);
        if (name === 'type') this.type = value;
        if (name === 'value') this.value = value;
        if (name === 'name') this.name = value;
        if (name === 'checked') this.checked = true;
        if (name === 'disabled') this.disabled = true;
    }
}
