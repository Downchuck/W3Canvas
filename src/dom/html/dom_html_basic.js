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

  constructor(firstChild) {
    if (firstChild == null) {
      throw new ReferenceError("HTMLCollection(): Missing firstChild parameter");
    }
    let node = firstChild;
    while (node !== null) {
      this.options.push(node);
      node = node.getNextSibling();
    }
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
class HTMLSpanElement extends HTMLElement { constructor() { super("SPAN"); } }
class HTMLDivElement extends HTMLElement { constructor() { super("DIV"); } }
class HTMLParagraphElement extends HTMLElement { constructor() { super("P"); } }
class HTMLInputElement extends HTMLElement { constructor() { super("INPUT"); } }
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
registerElement("TEXTAREA", "HTMLTextAreaElement", HTMLTextAreaElement);
registerElement("IMG", "HTMLImageElement", HTMLImageElement);
registerElement("BUTTON", "HTMLButtonElement", HTMLButtonElement);
registerElement("A", "HTMLLinkElement", HTMLLinkElement);
