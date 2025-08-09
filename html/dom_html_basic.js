import { BoxModel } from '../../css/box_model.js';
import { ElementStyle, CssStyle } from '../../css/css_style.js';
import { mixin } from '../../lang_util.js';
import { Node } from './dom_core.js';

export const tags = {};

export function registerElement(tagName, name, constructorFunction) {
  tags[tagName.toUpperCase()] = constructorFunction;
  this[name] = constructorFunction;
}

export class HTMLCollection {
  length: number;
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

export class HTMLElement extends Node {
  style: ElementStyle;

  constructor(element) {
    super(element.nodeType);
    const htmlElement = new (function() {
      this.id = "";
      this.title = "";
      this.lang = "";
      this.dir = "";
      this.className = "";
      this.getId = () => this.id;
      this.setId = (d) => this.id = d;
      this.getTitle = () => this.title;
      this.setTitle = (t) => this.title = t;
      this.getLang = () => this.lang;
      this.setLang = (l) => this.lang = l;
      this.getDir = () => this.dir;
      this.setDir = (d) => this.dir = d;
      this.getClassName = () => this.className;
      this.setClassName = (c) => this.className = c;
    })();

    const box = new BoxModel();
    this.style = new ElementStyle(new CssStyle(), htmlElement);
    this.getBoundingRect = () => box.getBorderBox();
    return mixin(this, box);
  }
}

registerElement("FORM", "HTMLFormElement", function(element) {
});

registerElement("BODY", "HTMLBodyElement", function(element) {
  const BodyElement = function() {
    this.aLink = "";
    this.background = "";
    this.bgColor = "";
    this.link = "";
    this.text = "";
    this.vLink = "";
    this.getALink = () => this.aLink;
    this.setALink = (a) => this.aLink = a;
    this.getBackground = () => this.background;
    this.setBackground = (b) => this.background = b;
    this.getBgColor = () => this.bgColor;
    this.setBgColor = (b) => this.bgColor = b;
    this.getLink = () => this.link;
    this.setLink = (l) => this.link = l;
    this.getText = () => this.text;
    this.setText = (t) => this.text = t;
    this.getVLink = () => this.vLink;
    this.setVLink = (v) => this.vLink = v;
  };
  const base = new HTMLElement(element);
  return mixin(base, new BodyElement());
});

registerElement("SPAN", "HTMLSpanElement", function(element) {
  const SpanElement = function() { return {}; };
  const base = new HTMLElement(element);
  return mixin(base, new SpanElement());
});

registerElement("DIV", "HTMLDivElement", function(element) {
  const DivElement = function() {
    this.align = "";
    this.getAlign = () => this.align;
    this.setAlign = (a) => this.align = a;
  };
  const base = new HTMLElement(element);
  return mixin(base, new DivElement());
});

registerElement("P", "HTMLParagraphElement", function(element) {
  const ParagraphElement = function() {
    this.align = "";
    this.getAlign = () => this.align;
    this.setAlign = (a) => this.align = a;
  };
  const base = new HTMLElement(element);
  return mixin(base, new ParagraphElement());
});

registerElement("INPUT", "HTMLInputElement", function(element, typeParam) {
  const InputElement = function() {
    this.defaultValue = "";
    this.defaultChecked = false;
    this.accept = "";
    this.accessKey = "";
    this.align = "";
    this.alt = "";
    this.checked = false;
    this.disabled = false;
    this.maxLength = 0;
    this.name = "";
    this.readOnly = false;
    this.size = 0;
    this.src = "";
    this.tabIndex = 0;
    this.type = typeParam;
    this.useMap = "";
    this.value = "";
    const validTypes = /^(text|password|checkbox|radio|submit|reset|file|hidden|image|button|range)$/;
    this.setType = (t) => {
      if (!validTypes.test(t)) {
        throw new TypeError("Invalid InputElement type: " + t);
      }
      else {
        this.type = t;
      }
    };
    const noOp = function() {};
    this.getDefaultValue = () => this.defaultValue;
    this.setDefaultValue = (d) => this.defaultValue = d;
    this.getDefaultChecked = () => this.defaultChecked;
    this.setDefaultChecked = (d) => this.defaultChecked = d;
    this.getAccept = () => this.accept;
    this.setAccept = (a) => this.accept = a;
    this.getAccessKey = () => this.accessKey;
    this.setAccessKey = (a) => this.accessKey = a;
    this.getAlign = () => this.align;
    this.setAlign = (a) => this.align = a;
    this.getAlt = () => this.alt;
    this.setAlt = (a) => this.alt = a;
    this.isChecked = () => this.checked;
    this.setChecked = (c) => this.checked = c;
    this.isDisabled = () => this.disabled;
    this.setDisabled = (d) => this.disabled = d;
    this.getMaxLength = () => this.maxLength;
    this.setMaxLength = (m) => this.maxLength = m;
    this.getName = () => this.name;
    this.setName = (n) => this.name = n;
    this.isReadOnly = () => this.readOnly;
    this.setReadOnly = (r) => this.readOnly = r;
    this.getSize = () => this.size;
    this.setSize = (s) => this.size = s;
    this.getSrc = () => this.src;
    this.setSrc = (s) => this.src = s;
    this.getTabIndex = () => this.tabIndex;
    this.setTabIndex = (t) => this.tabIndex = t;
    this.getType = () => this.type;
    this.getUseMap = () => this.useMap;
    this.setUseMap = (u) => this.useMap = u;
    this.getValue = () => this.value;
    this.setValue = (v) => this.value = v;
    this.focus = noOp;
    this.blur = noOp;
    this.select = noOp;
    this.click = noOp;
  };
  const base = new HTMLElement(element);
  return mixin(base, new InputElement());
});

registerElement("TEXTAREA", "HTMLTextAreaElement", function(element) {
  const TextAreaElement = function() {
    this.defaultValue = "";
    this.accessKey = "";
    this.cols = 80;
    this.disabled = false;
    this.name = "";
    this.readOnly = false;
    this.rows = 10;
    this.tabIndex = -1;
    this.type = "textarea";
    this.value = "";
    const noOp = function() {};
    this.getDefaultValue = () => this.defaultValue;
    this.setDefaultValue = (v) => this.defaultValue = v;
    this.getAccessKey = () => this.accessKey;
    this.setAccessKey = (k) => this.accessKey = k;
    this.getCols = () => this.cols;
    this.setCols = (c) => this.cols = c;
    this.isDisabled = () => this.disabled;
    this.setDisabled = (d) => this.disabled = d;
    this.getName = () => this.name;
    this.setName = (n) => this.name = n;
    this.isReadOnly = () => this.readOnly;
    this.setReadOnly = (r) => this.readOnly = r;
    this.getRows = () => this.rows;
    this.setRows = (r) => this.rows = r;
    this.getTabIndex = () => this.tabIndex;
    this.setTabIndex = (t) => this.tabIndex = t;
    this.getType = () => this.type;
    this.setType = (t) => this.type = t;
    this.getValue = () => this.value;
    this.setValue = (v) => this.value = v;
    this.blur = noOp;
    this.focus = noOp;
    this.select = noOp;
  };
  const base = new HTMLElement(element);
  return mixin(base, new TextAreaElement());
});

registerElement("IMG", "HTMLImageElement", function(element) {
  const base = new HTMLElement(element);
  const ImageElement = function() {
    this.name = "";
    this.align = "";
    this.alt = "";
    this.hspace = 0;
    this.isMap = false;
    this.longDesc = "";
    this.src = "";
    this.useMap = "";
    this.vspace = 0;
    this.getName = () => this.name;
    this.setName = (n) => this.name = n;
    this.getAlign = () => this.align;
    this.setAlign = (a) => this.align = a;
    this.getAlt = () => this.alt;
    this.setAlt = (a) => this.alt = a;
    this.getHeight = () => base.contentArea.height;
    this.setHeight = (h) => base.contentArea.height = h;
    this.getHspace = () => this.hspace;
    this.setHspace = (h) => this.hspace = h;
    this.getIsMap = () => this.isMap;
    this.setIsMap = (m) => this.isMap = m;
    this.getLongDesc = () => this.longDesc;
    this.setLongDesc = (d) => this.longDesc = d;
    this.getSrc = () => this.src;
    this.setSrc = (s) => this.src = s;
    this.getUseMap = () => this.useMap;
    this.setUseMap = (u) => this.useMap = u;
    this.getVspace = () => this.vspace;
    this.setVspace = (v) => this.vspace = v;
    this.getWidth = () => base.contentArea.width;
    this.setWidth = (w) => base.contentArea.width = w;
    this.setSize = (w,h) => { this.setWidth(w); this.setHeight(h); };
  };
  return mixin(base, new ImageElement());
});

registerElement("BUTTON", "HTMLButtonElement", function(element) {
  const ButtonElement = function() {
    this.accessKey = "";
    this.disabled = false;
    this.name = "";
    this.tabIndex = -1;
    this.type = "button";
    this.value = "";
    this.getAccessKey = () => this.accessKey;
    this.setAccessKey = (k) => this.accessKey = k;
    this.isDisabled = () => this.disabled;
    this.setDisabled = (d) => this.disabled = d;
    this.getName = () => this.name;
    this.setName = (n) => this.name = n;
    this.getTabIndex = () => this.tabIndex;
    this.setTabIndex = (t) => this.tabIndex = t;
    this.getType = () => this.type;
    this.setType = (t) => this.type = t;
    this.getValue = () => this.value;
    this.setValue = (v) => this.value = v;
  };
  const base = new HTMLElement(element);
  return mixin(base, new ButtonElement());
});

registerElement("A", "HTMLLinkElement", function(element) {
  const LinkElement = function() {
    this.disabled = false;
    this.charset = "";
    this.href = "";
    this.hreflang = "";
    this.media = "";
    this.rel = "";
    this.rev = "";
    this.target = "";
    this.type = "";
    this.isDisabled = () => this.disabled;
    this.setDisabled = (d) => this.disabled = d;
    this.getCharset = () => this.charset;
    this.setCharset = (c) => this.charset = c;
    this.getHref = () => this.href;
    this.setHref = (h) => this.href = h;
    this.getHreflang = () => this.hreflang;
    this.setHreflang = (h) => this.hreflang = h;
    this.getMedia = () => this.media;
    this.setMedia = (m) => this.media = m;
    this.getRel = () => this.rel;
    this.setRel = (r) => this.rel = r;
    this.getTarget = () => this.target;
    this.setTarget = (t) => this.target = t;
    this.getType = () => this.type;
    this.setType = (t) => this.type = t;
  };
  const base = new HTMLElement(element);
  return mixin(base, new LinkElement());
});
