import { BoxModel } from '../css/box_model.js';
import { ElementStyle, CssStyle } from '../css/css_style.js';
import { mixin } from '../../legacy/lang_util.js';
import { Element } from './dom_core.js';

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
import { HTMLInputElement } from './dom_html_input.js';
import { HTMLSelectElement } from './dom_html_select.js';
import { HTMLOptionElement, HTMLOptGroupElement } from './dom_html_option.js';
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

class HTMLArticleElement extends HTMLElement { constructor() { super("ARTICLE"); this.style.style.setProperty('display', 'block'); } }
class HTMLSectionElement extends HTMLElement { constructor() { super("SECTION"); this.style.style.setProperty('display', 'block'); } }
class HTMLNavElement extends HTMLElement { constructor() { super("NAV"); this.style.style.setProperty('display', 'block'); } }
class HTMLAsideElement extends HTMLElement { constructor() { super("ASIDE"); this.style.style.setProperty('display', 'block'); } }
class HTMLHeaderElement extends HTMLElement { constructor() { super("HEADER"); this.style.style.setProperty('display', 'block'); } }
class HTMLFooterElement extends HTMLElement { constructor() { super("FOOTER"); this.style.style.setProperty('display', 'block'); } }
class HTMLMainElement extends HTMLElement { constructor() { super("MAIN"); this.style.style.setProperty('display', 'block'); } }

registerElement("ARTICLE", "HTMLArticleElement", HTMLArticleElement);
registerElement("SECTION", "HTMLSectionElement", HTMLSectionElement);
registerElement("NAV", "HTMLNavElement", HTMLNavElement);
registerElement("ASIDE", "HTMLAsideElement", HTMLAsideElement);
registerElement("HEADER", "HTMLHeaderElement", HTMLHeaderElement);
registerElement("FOOTER", "HTMLFooterElement", HTMLFooterElement);
registerElement("MAIN", "HTMLMainElement", HTMLMainElement);
