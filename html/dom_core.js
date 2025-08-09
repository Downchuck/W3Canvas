import { mixin } from '../lang_util.js';

export const NODE_TYPE_ELEMENT   = 1;
export const NODE_TYPE_TEXT      = 3;
export const NODE_TYPE_DOCUMENT  = 9;

export const ELEMENT_STATE_NORMAL	  = 1;
export const ELEMENT_STATE_HOVER	  	= 2;
export const ELEMENT_STATE_ACTIVE  	= 3;
export const ELEMENT_STATE_DISABLED	= 4;

export class Node {
  nodeType: number;
  childNodeIdx = -1;
  parent = null;
  children = [];
  listeners = {};

  constructor(type) {
    if (!type) {
      throw new Error("Node: Need valid nodeType in the constructor.");
    }
    this.nodeType = type;
  }

  hasChildNodes() { return (this.children.length > 0); }

  getNodeType() {
    return this.nodeType;
  }

  getFirstChild() {
    return (this.hasChildNodes()? this.children[0] : null);
  }

  getNextSibling() {
    let next = null;
    if (this.parent) {
      const siblings = this.parent.getChildren();
      if (this.childNodeIdx >= 0 && this.childNodeIdx < siblings.length-1) {
        next = siblings[this.childNodeIdx+1];
      }
    }
    return next;
  }

  appendChild(newChild) {
    this.children.push(newChild);
    newChild.setParent(this);
    newChild.setChildNodeIdx(this.children.length-1);
  }

  getChildren() {
    return this.children;
  }

  setChildNodeIdx(idx) {
    this.childNodeIdx = idx;
  }

  setParent(p) {
    this.parent = p;
  }

  getParent() {
    return this.parent;
  }

  addEventListener(type, listener) {
    if (!this.listeners[type]) {
        this.listeners[type] = [];
    }
    this.listeners[type].push(listener);
  }

  removeEventListener(type, listener) {
    if (this.listeners[type]) {
        const index = this.listeners[type].indexOf(listener);
        if (index > -1) {
            this.listeners[type].splice(index, 1);
        }
    }
  }

  dispatchEvent(event) {
    if (this.listeners[event.type]) {
        this.listeners[event.type].forEach(function(listener) {
            listener(event);
        });
    }
    if (this.parent) {
        this.parent.dispatchEvent(event);
    }
  }
}

export class Element extends Node {
  tagName: string;

  constructor(tag) {
    if (!tag) {
      throw new Error("Element(): missing tag");
    }
    super(NODE_TYPE_ELEMENT);
    this.tagName = tag;
  }
}

class TextHandler {
  data: string;

  constructor(content) {
    this.data = (content === undefined)? "": content;
  }

  setData(c) { this.data = c; }
  getData() { return this.data; }
}

export class TextNode extends Node {
  constructor(content) {
    super(NODE_TYPE_TEXT);
    const text = new TextHandler(content);
    return mixin(this, text);
  }
}

export class Document {
  createElement(tag) { return new Element(tag); }
  createTextNode(content) { return new TextNode(content); }
}

export class NodeIterator {
  functor: any;
  root: any;

  constructor(elem, f) {
    this.functor = f;
    this.root = elem;
  }

  traverse(el) {
    if (el) {
      this.functor(el);
      if (el.hasChildNodes()) {
        let node = el.getFirstChild();
        while (node) {
          this.traverse(node);
          node = node.getNextSibling();
        }
      }
    }
  }

  start() {
    this.traverse(this.root);
  }
}
