import { BoxModel } from '../css/box_model.js';
import { ElementStyle, CssStyle } from '../css/css_style.js';
import { mixin } from '../../legacy/lang_util.js';
import { Element } from './dom_core.js';
import { BoxModelPainter } from '../css/box_paint.js';

const buttonIcons = {
	'blankIcon'				: new Image(),
	'checkedRadioIcon'	    : new Image(),
	'uncheckedRadioIcon' 	: new Image(),
	'checkedCheckBoxIcon'	: new Image(),
	'uncheckedCheckBoxIcon' : new Image()
};

buttonIcons.blankIcon.src             = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAIAAABvFaqvAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAgY0hSTQAAeiYAAICEAAD6AAAAgOgAAHUwAADqYAAAOpgAABdwnLpRPAAAADVJREFUOE9j/P//PwNVANAgqgAGqpgC8taoQQRDYDSMCAbRaDoiHESjYTQaRkSEAGElVCuPAAbjdOFsJI7xAAAAAElFTkSuQmCC";
buttonIcons.checkedRadioIcon.src      = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAIAAABvFaqvAAAABGdBTUEAALGPC/xhBQAAAG5JREFUOE9jZGZmZqAKABpEFcBAFVNA3hqZBv1HBfgDAWcYoZkC4eIxC7tBWE3BbxYBg+BOgBuNy1FYDELWw9DQAEFA/fjNGhIGYfUFOWGEbBBm9JEQ2BCl1ElHWM0iM2WTWiqM0GKEpGAafGEEAEBa8MJv2SpKAAAAAElFTkSuQmCC";
buttonIcons.uncheckedRadioIcon.src    = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAIAAABvFaqvAAAABGdBTUEAALGPC/xhBQAAAGpJREFUOE/l1N0KABAMBtBp7//MTErYj6ZdkF1RnOYjCREhpAgKKQhR6rH+hPJcdghqRovSpoYlQ6JiWxuot9BprSkBGvdoY849AVHbPJGTjEaIX58j7LY05h2J1uHL9v4Kn34jrpjuy6gALDQCtk6jFH4AAAAASUVORK5CYII=";
buttonIcons.checkedCheckBoxIcon.src   = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAIAAABvFaqvAAAABGdBTUEAALGPC/xhBQAAAIhJREFUOE/N1OsKgDAIBWBjL+6blzEwcZuXMpj0032chu5orUFJEVRSUKLcv1UPYb5kiCcROWemqH8DCBD7R9FfJmKiKz7EffK6RiUEKWuqRCG2VooPUYc8LG9XzYZ/2SM0HS8fUqFWQ5qDjFEPQRyqBrI3L5rI3V8Lyj4k8+3/+ML98ELukugCcyd7G9ldrsQAAAAASUVORK5CYII=";
buttonIcons.uncheckedCheckBoxIcon.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAIAAABvFaqvAAAABGdBTUEAALGPC/xhBQAAAElJREFUOE9jZGZmZqAKABpEFcBAFVNA3qK+QQ2kA2RHIFwENOc/KQCoftQgAgE2GkaEU9RoGA2SMCK1IMGe+yks4WhQQg4WFwEAizzaizrcI/MAAAAASUVORK5CYII=";

class InputRadioGroup {
	allRadios = [];

	registerRadio(radio) {
		this.allRadios.push(radio);
	}

	getRadioGroup(name) {
		const result = [];
		for (let i = 0; i < this.allRadios.length; i++) {
			if (this.allRadios[i].name === name) {
				result.push(this.allRadios[i]);
			}
		}
		return result;
	}

	getCheckedRadio(name) {
		const group = this.getRadioGroup(name);
		let radio = null;
		for (let i = 0; i < group.length; i++) {
			if (group[i].checked) {
				radio = group[i];
				break;
			}
		}
		return radio;
	}
}

const inputRadioGroup = new InputRadioGroup();

export const tags = {};

export function registerElement(tagName, name, constructorFunction) {
  tags[tagName.toUpperCase()] = constructorFunction;
  global[name] = constructorFunction;
}

export class HTMLCollection {
  length;
  options = [];

  constructor(nodes = []) {
    this.options = nodes;
    this.length = this.options.length;
  }

  item(i) { return this.options[i]; }
  namedItem(name) { throw new ReferenceError("HTMLCollection.namedItem(): not implemented"); }

  [Symbol.iterator]() {
    let index = 0;
    return {
      next: () => {
        if (index < this.options.length) {
          return { value: this.options[index++], done: false };
        } else {
          return { done: true };
        }
      }
    };
  }
}

export class HTMLElement extends Element {
  style;
  box;

  constructor(tag) {
    super(tag);
    this.box = new BoxModel();
    this.style = new ElementStyle(new CssStyle(), this);
    this.id = "";
    this.title = "";
    this.lang = "";
    this.dir = "";
    this.className = "";
  }

  getBoundingRect() {
    return this.box.getBorderBox();
  }

  getId() { return this.id; }
  setId(d) { this.id = d; }
  getTitle() { return this.title; }
  setTitle(t) { this.title = t; }
  getLang() { return this.lang; }
  setLang(l) { this.lang = l; }
  getDir() { return this.dir; }
  setDir(d) { this.dir = d; }
  getClassName() { return this.className; }
  setClassName(c) { this.className = c; }
}

class HTMLFormElement extends HTMLElement { constructor() { super("FORM"); } }
class HTMLBodyElement extends HTMLElement { constructor() { super("BODY"); } }
export class HTMLSpanElement extends HTMLElement { constructor() { super("SPAN"); } }
export class HTMLDivElement extends HTMLElement {
	constructor() {
		super("DIV");
		this.style.style.setProperty('display', 'block');
	}
}
class HTMLParagraphElement extends HTMLElement { constructor() { super("P"); } }

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

        this.addEventListener('click', (e) => {
            if (this.type === 'checkbox') {
                this.checked = !this.checked;
                this.requestRepaint();
            } else if (this.type === 'radio') {
                const group = inputRadioGroup.getRadioGroup(this.name);
                for (const radio of group) {
                    radio.checked = false;
                    radio.requestRepaint();
                }
                this.checked = true;
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
        } else if (this.type === 'checkbox') {
            const icon = this.checked ? buttonIcons.checkedCheckBoxIcon : buttonIcons.uncheckedCheckBoxIcon;
            this.painter.paintImage(ctx, icon, this.getBoundingRect());
        } else if (this.type === 'radio') {
            const icon = this.checked ? buttonIcons.checkedRadioIcon : buttonIcons.uncheckedRadioIcon;
            this.painter.paintImage(ctx, icon, this.getBoundingRect());
        } else if (this.type === 'button') {
            this.painter.paintBox(ctx, this, this.style);
            const contentBox = this.getContentBox();
            ctx.save();
            ctx.fillStyle = this.style.getFont().getTextColor();
            this.painter.paintText(ctx, contentBox, this.value, this.style.getFont());
            ctx.restore();
        }
    }

    hitTest(x, y) {
        return this.getBoundingRect().isPointInsideBox(x, y);
    }

    setAttribute(name, value) {
        super.setAttribute(name, value);
        if (name === 'type') {
            this.type = value;
            if (value === 'radio') {
                inputRadioGroup.registerRadio(this);
            }
        }
        if (name === 'value') this.value = value;
        if (name === 'name') this.name = value;
        if (name === 'checked') this.checked = true;
        if (name === 'disabled') this.disabled = true;
    }
}

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
        return new HTMLCollection(this.children.filter(c => c instanceof HTMLOptionElement));
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

class HTMLTextAreaElement extends HTMLElement { constructor() { super("TEXTAREA"); } }
class HTMLImageElement extends HTMLElement { constructor() { super("IMG"); } }
class HTMLButtonElement extends HTMLElement { constructor() { super("BUTTON"); } }
class HTMLLinkElement extends HTMLElement { constructor() { super("A"); } }

registerElement("FORM", "HTMLFormElement", HTMLFormElement);
registerElement("BODY", "HTMLBodyElement", HTMLBodyElement);
registerElement("SPAN", "HTMLSpanElement", HTMLSpanElement);
registerElement("DIV", "HTMLDivElement", HTMLDivElement);
registerElement("P", "HTMLParagraphElement", HTMLParagraphElement);
registerElement("INPUT", "HTMLInputElement", HTMLInputElement);
registerElement("SELECT", "HTMLSelectElement", HTMLSelectElement);
registerElement("OPTION", "HTMLOptionElement", HTMLOptionElement);
registerElement("OPTGROUP", "HTMLOptGroupElement", HTMLOptGroupElement);
registerElement("TEXTAREA", "HTMLTextAreaElement", HTMLTextAreaElement);
registerElement("IMG", "HTMLImageElement", HTMLImageElement);
registerElement("BUTTON", "HTMLButtonElement", HTMLButtonElement);
registerElement("A", "HTMLLinkElement", HTMLLinkElement);

export class HTMLArticleElement extends HTMLElement { constructor() { super("ARTICLE"); this.style.style.setProperty('display', 'block'); } }
export class HTMLSectionElement extends HTMLElement { constructor() { super("SECTION"); this.style.style.setProperty('display', 'block'); } }
export class HTMLNavElement extends HTMLElement { constructor() { super("NAV"); this.style.style.setProperty('display', 'block'); } }
export class HTMLAsideElement extends HTMLElement { constructor() { super("ASIDE"); this.style.style.setProperty('display', 'block'); } }
export class HTMLHeaderElement extends HTMLElement { constructor() { super("HEADER"); this.style.style.setProperty('display', 'block'); } }
export class HTMLFooterElement extends HTMLElement { constructor() { super("FOOTER"); this.style.style.setProperty('display', 'block'); } }
export class HTMLMainElement extends HTMLElement { constructor() { super("MAIN"); this.style.style.setProperty('display', 'block'); } }

registerElement("ARTICLE", "HTMLArticleElement", HTMLArticleElement);
registerElement("SECTION", "HTMLSectionElement", HTMLSectionElement);
registerElement("NAV", "HTMLNavElement", HTMLNavElement);
registerElement("ASIDE", "HTMLAsideElement", HTMLAsideElement);
registerElement("HEADER", "HTMLHeaderElement", HTMLHeaderElement);
registerElement("FOOTER", "HTMLFooterElement", HTMLFooterElement);
registerElement("MAIN", "HTMLMainElement", HTMLMainElement);
