import { registerElement, HTMLElement, HTMLCollection } from './dom_html_basic.js';
import { BoxModelPainter } from '../css/box_paint.js';

export class HTMLSelectElement extends HTMLElement {
    constructor() {
        super("SELECT");
        this.disabled = false;
        this.multiple = false;
        this.name = "";
        this.size = 1;
        this.selectedIndex = -1;
        this.isOpen = false;
        this.painter = new BoxModelPainter();

        this.addEventListener('click', (e) => {
            this.isOpen = !this.isOpen;
            this.requestRepaint();
        });
    }

    get options() {
        return new HTMLCollection(this.children);
    }

    repaint(ctx) {
        this.painter.paintBox(ctx, this, this.style);

        let textToRender = '';
        if (this.selectedIndex > -1 && this.selectedIndex < this.options.length) {
            textToRender = this.options.item(this.selectedIndex).text;
        }

        const contentBox = this.getContentBox();
        ctx.save();
        ctx.fillStyle = this.style.getFont().getTextColor();
        this.painter.paintText(ctx, contentBox, textToRender, this.style.getFont());
        ctx.restore();

        if (this.isOpen) {
            const optionBox = this.getBoundingRect().clone();
            optionBox.y += optionBox.height;

            for (let i = 0; i < this.options.length; i++) {
                const option = this.options.item(i);
                option.getBoundingRect().set(optionBox.x, optionBox.y, optionBox.width, 20);
                option.repaint(ctx);
                optionBox.y += 20;
            }
        }
    }

    hitTest(x, y) {
        if (this.getBoundingRect().isPointInsideBox(x, y)) {
            return this;
        }
        if (this.isOpen) {
            for (let i = 0; i < this.options.length; i++) {
                const option = this.options.item(i);
                if (option.getBoundingRect().isPointInsideBox(x, y)) {
                    return option;
                }
            }
        }
        return null;
    }
}

