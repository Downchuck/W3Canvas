import { Document, NodeIterator, Element } from './dom_core.js';
import { tags, HTMLCollection } from './dom_html_basic.js';

export class HTMLDocument extends Document {
  constructor() {
    super();
    this.body = this.createElement("body");
  }

  createElement(tagName) {
    const ElementConstructor = tags[tagName.toUpperCase()];
    let elem;
    if (ElementConstructor) {
      elem = new ElementConstructor();
    } else {
      elem = new Element(tagName);
    }
    return elem;
  }

  createElementNS(namespace, tagName) {
    if (namespace === 'http://www.w3.org/2000/svg') {
      const qualifiedName = 'svg:' + tagName;
      const ElementConstructor = tags[qualifiedName.toUpperCase()];
      if (ElementConstructor) {
        return new ElementConstructor();
      }
    }
    // Fallback for unknown tags in any namespace
    return new Element(tagName);
  }

  getElementsByName(name) {
    return null;
  }

  getElementById(id) {
    let found = null;
    const iter = new NodeIterator(this.body, (node) => {
      if (node.getId && node.getId() === id) {
        found = node;
      }
    });
    iter.start();
    return found;
  }

  getElementsByTagName(tagName) {
    const results = [];
    const iter = new NodeIterator(this.body, (node) => {
      if (node.tagName && node.tagName.toLowerCase() === tagName.toLowerCase()) {
        results.push(node);
      }
    });
    iter.start();
    return new HTMLCollection(results);
  }

  querySelectorAll(selector) {
    const results = [];
    const iter = new NodeIterator(this.body, (node) => {
      if (this.matchesSelector(node, selector)) {
        results.push(node);
      }
    });
    iter.start();
    return new HTMLCollection(results);
  }

  querySelector(selector) {
    let result = null;
    const iter = new NodeIterator(this.body, (node) => {
      if (this.matchesSelector(node, selector)) {
        result = node;
        iter.traverse = function() {};
      }
    });
    iter.start();
    return result;
  }

  matchesSelector(node, selector) {
    if (selector.startsWith('#')) {
      return node.getId && node.getId() === selector.substring(1);
    } else if (selector.startsWith('.')) {
      return node.getClassName && node.getClassName().split(' ').indexOf(selector.substring(1)) !== -1;
    } else {
      return node.tagName && node.tagName.toLowerCase() === selector.toLowerCase();
    }
  }
}

export const currentDocument = new HTMLDocument();
