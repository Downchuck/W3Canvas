import { Document, NodeIterator, Element } from './dom_core.js';
import { tags, HTMLCollection } from './dom_html_basic.js';
import { mixin } from '../../legacy/lang_util.js';

export class HTMLDocument extends Document {
  constructor(domDoc) {
    super();
    const doc = domDoc || new Document();

    const DocumentImpl = function() {
      this.elems = [];
      this.createElement = (tagName) => {
        tagName = tagName.toUpperCase();
        const ElementConstructor = tags[tagName];
        let elem;
        if (ElementConstructor) {
          elem = new ElementConstructor();
        } else {
          elem = new Element(tagName);
        }
        this.elems.push(elem);
        return elem;
      };

      this.body = this.createElement("body");

      this.getElementsByName = (name) => {
        return null;
      };

      this.getElementById = (id) => {
        let found = null;
        const iter = new NodeIterator(this.body, (node) => {
          if (node.getId && node.getId() === id) {
            found = node;
          }
        });
        iter.start();
        return found;
      };

      this.getElementsByTagName = (tagName) => {
        const results = [];
        const iter = new NodeIterator(this.body, (node) => {
          if (node.tagName && node.tagName.toLowerCase() === tagName.toLowerCase()) {
            results.push(node);
          }
        });
        iter.start();
        return new HTMLCollection(results[0]);
      };

      this.querySelectorAll = (selector) => {
        const results = [];
        const iter = new NodeIterator(this.body, (node) => {
          if (this.matchesSelector(node, selector)) {
            results.push(node);
          }
        });
        iter.start();
        return new HTMLCollection(results[0]);
      };

      this.querySelector = (selector) => {
        let result = null;
        const iter = new NodeIterator(this.body, (node) => {
          if (this.matchesSelector(node, selector)) {
            result = node;
            iter.traverse = function() {};
          }
        });
        iter.start();
        return result;
      };

      this.matchesSelector = (node, selector) => {
        if (selector.startsWith('#')) {
          return node.getId && node.getId() === selector.substring(1);
        } else if (selector.startsWith('.')) {
          return node.getClassName && node.getClassName().split(' ').indexOf(selector.substring(1)) !== -1;
        } else {
          return node.tagName && node.tagName.toLowerCase() === selector.toLowerCase();
        }
      };
    };
    return mixin(doc, new DocumentImpl());
  }
}

export const currentDocument = new HTMLDocument();
