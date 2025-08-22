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
        this.min = null;
        this.max = null;
        this.step = 1;
        this.painter = new BoxModelPainter();
        this.isFocused = false;
        this.isDragging = false;
        this.isColorPickerOpen = false;
        this.isDatePickerOpen = false;

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

        this.addEventListener('mousedown', (e) => {
            if (this.type === 'range') {
                this.isDragging = true;
            }
        });

        this.addEventListener('mouseup', (e) => {
            if (this.type === 'range') {
                this.isDragging = false;
            }
        });

        this.addEventListener('mousemove', (e) => {
            if (this.type === 'range' && this.isDragging) {
                const rect = this.getBoundingRect();
                const min = this.min || 0;
                const max = this.max || 100;
                const percent = (e.clientX - rect.x) / rect.width;
                let value = min + percent * (max - min);
                if (value < min) value = min;
                if (value > max) value = max;
                this.value = String(value);
                this.requestRepaint();
            }
        });

        this.addEventListener('click', (e) => {
            switch (this.type) {
                case 'checkbox':
                    this.handleClick_Checkbox(e);
                    break;
                case 'radio':
                    this.handleClick_Radio(e);
                    break;
                case 'number':
                    this.handleClick_Number(e);
                    break;
                case 'color':
                    this.handleClick_Color(e);
                    break;
                case 'date':
                    this.handleClick_Date(e);
                    break;
            }
        });
    }

    handleClick_Checkbox(e) {
        this.checked = !this.checked;
        this.requestRepaint();
    }

    handleClick_Radio(e) {
        const group = inputRadioGroup.getRadioGroup(this.name);
        for (const radio of group) {
            radio.checked = false;
            radio.requestRepaint();
        }
        this.checked = true;
        this.requestRepaint();
    }

    handleClick_Number(e) {
        const rect = this.getBoundingRect();
        const arrowWidth = 10;
        const arrowX = rect.x + rect.width - arrowWidth - 2;
        if (e.clientX >= arrowX) {
            let numValue = parseFloat(this.value) || 0;
            if (e.clientY < rect.y + rect.height / 2) {
                // Up arrow
                numValue += this.step;
            } else {
                // Down arrow
                numValue -= this.step;
            }
            if (this.max !== null && numValue > this.max) {
                numValue = this.max;
            }
            if (this.min !== null && numValue < this.min) {
                numValue = this.min;
            }
            this.value = String(numValue);
            this.requestRepaint();
        }
    }

    handleClick_Color(e) {
        if (this.isColorPickerOpen) {
            const rect = this.getBoundingRect();
            const pickerX = rect.x;
            const pickerY = rect.y + rect.height;
            const swatchSize = 20;
            const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#00ffff', '#ff00ff', '#ffffff', '#000000'];
            const col = Math.floor((e.clientX - pickerX) / swatchSize);
            const row = Math.floor((e.clientY - pickerY) / swatchSize);
            const index = row * 4 + col;
            if (index >= 0 && index < colors.length) {
                this.value = colors[index];
                this.isColorPickerOpen = false;
                this.requestRepaint();
            }
        } else {
            this.isColorPickerOpen = true;
            this.requestRepaint();
        }
    }

    handleClick_Date(e) {
        if (this.isDatePickerOpen) {
            const rect = this.getBoundingRect();
            const pickerX = rect.x;
            const pickerY = rect.y + rect.height;
            const daySize = 20;
            const date = new Date(this.value || Date.now());
            const year = date.getFullYear();
            const month = date.getMonth();
            const firstDay = new Date(year, month, 1).getDay();
            const daysInMonth = new Date(year, month + 1, 0).getDate();

            const col = Math.floor((e.clientX - pickerX) / daySize);
            const row = Math.floor((e.clientY - (pickerY + 35)) / daySize);
            const day = row * 7 + col - firstDay + 1;

            if (day > 0 && day <= daysInMonth) {
                this.value = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                this.isDatePickerOpen = false;
                this.requestRepaint();
            }
        } else {
            this.isDatePickerOpen = true;
            this.requestRepaint();
        }
    }

    repaint(ctx) {
        this.painter.paintBox(ctx, this, this.style);
        if (this.type === 'text' || this.type === 'email' || this.type === 'url' || this.type === 'search' || this.type === 'tel' || this.type === 'time' || this.type === 'datetime-local') {
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
        } else if (this.type === 'number') {
            this.painter.paintBox(ctx, this, this.style);
            const contentBox = this.getContentBox();
            ctx.save();
            ctx.fillStyle = this.style.getFont().getTextColor();
            this.painter.paintText(ctx, contentBox, this.value, this.style.getFont());

            const rect = this.getBoundingRect();
            const arrowWidth = 10;
            const arrowHeight = rect.height / 2;
            const arrowX = rect.x + rect.width - arrowWidth - 2;

            // Up arrow
            ctx.beginPath();
            ctx.moveTo(arrowX, arrowHeight);
            ctx.lineTo(arrowX + arrowWidth, arrowHeight);
            ctx.lineTo(arrowX + arrowWidth / 2, 0);
            ctx.closePath();
            ctx.fill();

            // Down arrow
            ctx.beginPath();
            ctx.moveTo(arrowX, arrowHeight);
            ctx.lineTo(arrowX + arrowWidth, arrowHeight);
            ctx.lineTo(arrowX + arrowWidth / 2, rect.height);
            ctx.closePath();
            ctx.fill();

            ctx.restore();
        } else if (this.type === 'range') {
            const rect = this.getBoundingRect();
            const trackHeight = 4;
            const trackY = rect.y + rect.height / 2 - trackHeight / 2;
            ctx.fillStyle = '#ccc';
            ctx.fillRect(rect.x, trackY, rect.width, trackHeight);

            const thumbSize = 10;
            const min = this.min || 0;
            const max = this.max || 100;
            const value = parseFloat(this.value) || 0;
            const percent = (value - min) / (max - min);
            const thumbX = rect.x + percent * (rect.width - thumbSize);
            ctx.fillStyle = '#666';
            ctx.fillRect(thumbX, rect.y, thumbSize, rect.height);
        } else if (this.type === 'color') {
            const rect = this.getBoundingRect();
            ctx.fillStyle = this.value || '#000000';
            ctx.fillRect(rect.x, rect.y, rect.width, rect.height);

            if (this.isColorPickerOpen) {
                const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#00ffff', '#ff00ff', '#ffffff', '#000000'];
                const pickerX = rect.x;
                const pickerY = rect.y + rect.height;
                const swatchSize = 20;
                for (let i = 0; i < colors.length; i++) {
                    ctx.fillStyle = colors[i];
                    ctx.fillRect(pickerX + (i % 4) * swatchSize, pickerY + Math.floor(i / 4) * swatchSize, swatchSize, swatchSize);
                }
            }
        } else if (this.type === 'date') {
            this.painter.paintBox(ctx, this, this.style);
            const contentBox = this.getContentBox();
            ctx.save();
            ctx.fillStyle = this.style.getFont().getTextColor();
            this.painter.paintText(ctx, contentBox, this.value, this.style.getFont());
            ctx.restore();

            if (this.isDatePickerOpen) {
                const rect = this.getBoundingRect();
                const pickerX = rect.x;
                const pickerY = rect.y + rect.height;
                const daySize = 20;
                const date = new Date(this.value || Date.now());
                const year = date.getFullYear();
                const month = date.getMonth();
                const firstDay = new Date(year, month, 1).getDay();
                const daysInMonth = new Date(year, month + 1, 0).getDate();

                // Draw month/year header
                ctx.fillStyle = '#000';
                ctx.fillText(`${year}-${month + 1}`, pickerX, pickerY - 5);

                // Draw days of the week
                const daysOfWeek = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
                for (let i = 0; i < 7; i++) {
                    ctx.fillText(daysOfWeek[i], pickerX + i * daySize, pickerY + 15);
                }

                // Draw days of the month
                for (let i = 1; i <= daysInMonth; i++) {
                    const day = new Date(year, month, i);
                    const col = (firstDay + i - 1) % 7;
                    const row = Math.floor((firstDay + i - 1) / 7);
                    ctx.fillText(i, pickerX + col * daySize, pickerY + 35 + row * daySize);
                }
            }
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
        if (name === 'min') this.min = parseFloat(value);
        if (name === 'max') this.max = parseFloat(value);
        if (name === 'step') this.step = parseFloat(value);
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

export class HTMLArticleElement extends HTMLElement { constructor() { super("ARTICLE"); this.style.style.setProperty('display', 'block'); } }
export class HTMLSectionElement extends HTMLElement { constructor() { super("SECTION"); this.style.style.setProperty('display', 'block'); } }
export class HTMLNavElement extends HTMLElement { constructor() { super("NAV"); this.style.style.setProperty('display', 'block'); } }
export class HTMLAsideElement extends HTMLElement { constructor() { super("ASIDE"); this.style.style.setProperty('display', 'block'); } }
export class HTMLHeaderElement extends HTMLElement { constructor() { super("HEADER"); this.style.style.setProperty('display', 'block'); } }
export class HTMLFooterElement extends HTMLElement { constructor() { super("FOOTER"); this.style.style.setProperty('display', 'block'); } }
export class HTMLMainElement extends HTMLElement { constructor() { super("MAIN"); this.style.style.setProperty('display', 'block'); } }

export class HTMLDetailsElement extends HTMLElement {
    constructor() {
        super("DETAILS");
        this.open = false;
        this.style.style.setProperty('display', 'block');
    }

    repaint(ctx) {
        this.painter.paintBox(ctx, this, this.style);
        const summary = this.children.find(c => c.tagName === 'summary');
        if (summary) {
            summary.repaint(ctx);
        }
        if (this.open) {
            for (const child of this.children) {
                if (child.tagName !== 'summary') {
                    child.repaint(ctx);
                }
            }
        }
    }
}

export class HTMLSummaryElement extends HTMLElement {
    constructor() {
        super("SUMMARY");
        this.addEventListener('click', (e) => {
            const details = this.parent;
            if (details && details.tagName === 'details') {
                details.open = !details.open;
                details.requestRepaint();
            }
        });
    }
}

export class HTMLProgressElement extends HTMLElement {
    constructor() {
        super("PROGRESS");
        this.value = 0;
        this.max = 1;
    }

    setAttribute(name, value) {
        super.setAttribute(name, value);
        if (name === 'value') this.value = parseFloat(value);
        if (name === 'max') this.max = parseFloat(value);
    }

    repaint(ctx) {
        this.painter.paintBox(ctx, this, this.style);
        const rect = this.getBoundingRect();
        const percent = this.value / this.max;
        ctx.fillStyle = 'green';
        ctx.fillRect(rect.x, rect.y, rect.width * percent, rect.height);
    }
}

export class HTMLMeterElement extends HTMLElement {
    constructor() {
        super("METER");
        this.value = 0;
        this.min = 0;
        this.max = 1;
        this.low = 0;
        this.high = 1;
        this.optimum = 0;
    }

    setAttribute(name, value) {
        super.setAttribute(name, value);
        if (name === 'value') this.value = parseFloat(value);
        if (name === 'min') this.min = parseFloat(value);
        if (name === 'max') this.max = parseFloat(value);
        if (name === 'low') this.low = parseFloat(value);
        if (name === 'high') this.high = parseFloat(value);
        if (name === 'optimum') this.optimum = parseFloat(value);
    }

    repaint(ctx) {
        this.painter.paintBox(ctx, this, this.style);
        const rect = this.getBoundingRect();
        const percent = (this.value - this.min) / (this.max - this.min);
        ctx.fillStyle = 'green';
        ctx.fillRect(rect.x, rect.y, rect.width * percent, rect.height);
    }
}

export class HTMLTimeElement extends HTMLElement {
    constructor() {
        super("TIME");
    }
}

export class HTMLMarkElement extends HTMLElement {
    constructor() {
        super("MARK");
    }
}

export class HTMLFigureElement extends HTMLElement {
    constructor() {
        super("FIGURE");
        this.style.style.setProperty('display', 'block');
    }
}

export class HTMLFigCaptionElement extends HTMLElement {
    constructor() {
        super("FIGCAPTION");
        this.style.style.setProperty('display', 'block');
    }
}

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
registerElement("ARTICLE", "HTMLArticleElement", HTMLArticleElement);
registerElement("SECTION", "HTMLSectionElement", HTMLSectionElement);
registerElement("NAV", "HTMLNavElement", HTMLNavElement);
registerElement("ASIDE", "HTMLAsideElement", HTMLAsideElement);
registerElement("HEADER", "HTMLHeaderElement", HTMLHeaderElement);
registerElement("FOOTER", "HTMLFooterElement", HTMLFooterElement);
registerElement("MAIN", "HTMLMainElement", HTMLMainElement);
registerElement("DETAILS", "HTMLDetailsElement", HTMLDetailsElement);
registerElement("SUMMARY", "HTMLSummaryElement", HTMLSummaryElement);
registerElement("PROGRESS", "HTMLProgressElement", HTMLProgressElement);
registerElement("METER", "HTMLMeterElement", HTMLMeterElement);
registerElement("TIME", "HTMLTimeElement", HTMLTimeElement);
registerElement("MARK", "HTMLMarkElement", HTMLMarkElement);
registerElement("FIGURE", "HTMLFigureElement", HTMLFigureElement);
registerElement("FIGCAPTION", "HTMLFigCaptionElement", HTMLFigCaptionElement);
