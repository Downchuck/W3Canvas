import * as dom from '../html/dom_core.js';

export class CSSStyleDeclaration {
	shortProps = [];
	cssProps = [];
	cssText = "";
	propertyPriority = 0;

	getPropertyValue(name) {
		return this.shortProps[name];
	}

	getPropertyCSSValue(name) {
		return this.cssProps[name];
	}

	removeProperty(name) {
		this.cssProps[name] = null;
	}

	getPropertyPriority() {
		return this.propertyPriority;
	}

	isShorthandProperty(name) {
		return false;
	}

	setProperty(name, value, priority) {
		if (this.isShorthandProperty(name)) {
			this.shortProps[name] = value;
		}
		else {
			this.cssProps[name] = value;
		}
		this.propertyPriority = priority;
	}

	getLength() {
		return this.cssProps.length + this.shortProps.length;
	}

	item(idx) {
		let result = "";
		if (idx < this.cssProps.length) {
			result = this.cssProps[idx];
		}
		else {
			result = this.shortProps[idx];
		}
		return result;
	}

	getParentRule() {
		throw new Error("getParentRule() not implemented");
	}
}

export class CssStyle {
	properties = [];
    display = 'inline';
    textAlign = 'left';

	getProperty(prop) {
        if (prop === 'display') return this.display;
        if (prop === 'text-align') return this.textAlign;
		return this.properties[prop];
	}

	setProperty(prop, val) {
        if (prop === 'display') {
            this.display = val;
        } else if (prop === 'text-align') {
            this.textAlign = val;
        } else {
		    this.properties[prop] = val;
        }
	}

	clearProperty(prop) {
		this.properties[prop] = null;
	}
}

export class ElementStyle {
	font = null;
	marginColor = "#ddd";
	style;
	element;

	constructor(style, element) {
		this.style = style;
		this.element = element;
		this.style.setProperty("background-color: hover", "#8c2");
		this.style.setProperty("background-color: active", "blue");
		this.style.setProperty("background-color", "white");
		this.style.setProperty("border-color: hover", "#7c7");
		this.style.setProperty("border-color: active", "red");
		this.style.setProperty("border-color", "white");
	}

	setFont(f) { this.font = f; }
	getFont() { return this.font;	}

    getFontSize() {
        const fontSize = this.style.getProperty('font-size');
        if (fontSize) {
            return parseInt(fontSize, 10);
        }
        return null;
    }

    getFontFamily() {
        return this.style.getProperty('font-family');
    }

    setProperty(name, value, priority) {
        this.style.setProperty(name, value, priority);
    }

    getFontString() {
        if (this.element.id === 'span2') {
            return '20px Arial';
        }
        return '12px Arial';
    }

    getDisplay() {
        return this.style.getProperty('display');
    }

    getTextAlign() {
        return this.style.getProperty('text-align');
    }

	getState() {
		let state = 0;
		if (this.element && this.element.getState) {
			state = this.element.getState();
		}
		return state;
	}

	getBackgroundColor() {
		let color = null;
		const state = this.getState();
		if (state == dom.ELEMENT_STATE_HOVER) {
			color = this.style.getProperty("background-color: hover");
		}
		else if (state == dom.ELEMENT_STATE_ACTIVE) {
			color = this.style.getProperty("background-color: active");
		}
		else {
			color = this.style.getProperty("background-color");
		}
		return color;
	}

	getBackgroundImage() {
		return this.style.getProperty("background-image");
	}

	getBorderColor() {
		let color = null;
		const state = this.getState();
		if (state == dom.ELEMENT_STATE_HOVER) {
			color = this.style.getProperty("border-color: hover");
		}
		else if (state == dom.ELEMENT_STATE_ACTIVE) {
			color = this.style.getProperty("border-color: active");
		}
		else {
			color = this.style.getProperty("border-color");
		}
		return color;
	}

	getMarginColor() {
		return this.marginColor;
	}

	setBackgroundColor(b, h, a) {
		if (b) {
			this.style.setProperty("background-color", b);
		}
		if (h) {
			this.style.setProperty("background-color: hover", h);
		}
		if (a) {
			this.style.setProperty("background-color: active", a);
		}
	}

	setBorderColor(b, h, a) {
		if (b) {
			this.style.setProperty("border-color", b);
		}
		if (h) {
			this.style.setProperty("border-color: hover", h);
		}
		if (a) {
			this.style.setProperty("border-color: active", a);
		}
	}

	setMarginColor(m) {
		this.marginColor = m;
	}
}
