export const NODE_TYPE_ELEMENT   = 1;
export const NODE_TYPE_TEXT      = 3;
export const NODE_TYPE_DOCUMENT  = 9;

export const ELEMENT_STATE_NORMAL	  = 1;
export const ELEMENT_STATE_HOVER	  	= 2;
export const ELEMENT_STATE_ACTIVE  	= 3;
export const ELEMENT_STATE_DISABLED	= 4;

export class Node {
  nodeType;
  childNodeIdx = -1;
  parent = null;
  children = [];
  listeners = {};
  ownerDocument = null;

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
    if (!event.target) {
        event.target = this;
    }

    if (this.listeners[event.type]) {
        const listeners = [...this.listeners[event.type]];
        for (const listener of listeners) {
            if (!event.bubbles) {
                break;
            }
            listener.call(this, event);
        }
    }

    if (this.parent && event.bubbles) {
        this.parent.dispatchEvent(event);
    }
  }
}

import { requestRepaint } from '../renderer.js';
import { Event } from '../event.js';
import { ElementStyle, CssStyle } from '../css/css_style.js';
import { ContentFragment } from './textbox/basic_model.js';
import { LineWrapper } from '../css/text_wrap.js';
import { BoxModel } from '../css/box_model.js';
import { BoxModelPainter } from '../css/box_paint.js';

export class Element extends Node {
  tagName;
  style;
  boxModel;
  id = '';
  attributes = {};

  setAttribute(name, value) {
    this.attributes[name] = value;
    if (name === 'id') {
      this.id = value;
    }
  }

  getAttribute(name) {
    return this.attributes[name];
  }

  constructor(tag) {
    if (!tag) {
      throw new Error("Element(): missing tag");
    }
    super(NODE_TYPE_ELEMENT);
    this.tagName = tag.toLowerCase();
    this.style = new ElementStyle(new CssStyle(), this);
    this.boxModel = new BoxModel();
  }

  doLayout(ctx) {
    if (this.style.getDisplay() === 'block') {
      const fragments = [];
      let child = this.getFirstChild();
      while(child) {
        if (child.nodeType === NODE_TYPE_TEXT) {
          fragments.push(new ContentFragment(child.getData(), this.style.getFontString()));
        } else if (child.nodeType === NODE_TYPE_ELEMENT) {
          if (child.style.getDisplay() === 'inline') {
            let grandchild = child.getFirstChild();
            while (grandchild) {
              if (grandchild.nodeType === NODE_TYPE_TEXT) {
                fragments.push(new ContentFragment(grandchild.getData(), child.style.getFontString()));
              }
              grandchild = grandchild.getNextSibling();
            }
          } else {
            child.doLayout(ctx);
          }
        }
        child = child.getNextSibling();
      }

      if (fragments.length > 0) {
        const wrapper = new LineWrapper();
        const contentBox = this.boxModel.getContentBox();
        const padding = this.boxModel.padding;
        this.lineBoxes = wrapper.createLineBoxes(fragments, ctx, 12, contentBox.width, 200, padding.left, padding.top, false);

        if (this.lineBoxes.length > 0) {
            const textAlign = this.style.getTextAlign();
            for (const line of this.lineBoxes) {
                line.align(textAlign);
            }

            const lastLine = this.lineBoxes[this.lineBoxes.length - 1];
            this.boxModel.contentArea.height = lastLine.getBottom();
        }
      }
    }
  }

  repaint(ctx) {
    this.doLayout(ctx);

    const painter = new BoxModelPainter();
    painter.paintBox(ctx, this.boxModel, this.style);

    if (this.lineBoxes) {
        for (const line of this.lineBoxes) {
            for (const box of line.getBoxes()) {
                ctx.font = box.contentFragment.style;
                ctx.fillText(box.contentFragment.content, box.x, box.y + line.height);
            }
        }
    }
  }

  hitTest(x, y) {
    // Check if the point is within the element's border box
    if (this.boxModel.isPointInsideBorder(x, y)) {
        // If it is, check its children in reverse order (topmost first)
        for (let i = this.children.length - 1; i >= 0; i--) {
            const child = this.children[i];
            if (child.nodeType === NODE_TYPE_ELEMENT) {
                const hit = child.hitTest(x, y);
                if (hit) {
                    return hit;
                }
            }
        }
        // If no child was hit, this element is the target
        return this;
    }
    return null;
  }

  requestRepaint() {
    requestRepaint(this);
  }
}

export class TextNode extends Node {
  data;

  constructor(content) {
    super(NODE_TYPE_TEXT);
    this.data = (content === undefined)? "": content;
  }

  setData(c) { this.data = c; }
  getData() { return this.data; }
}

export const NODE_TYPE_COMMENT = 8;

export class Comment extends Node {
    data;

    constructor(content) {
        super(NODE_TYPE_COMMENT);
        this.data = (content === undefined) ? "" : content;
    }

    setData(c) { this.data = c; }
    getData() { return this.data; }
}

export class Document extends Node {
  doctype = null;
  body = null;

  constructor() {
    super(NODE_TYPE_DOCUMENT);
  }

  createElement(tag) {
    return new Element(tag);
  }

  createTextNode(content) {
    return new TextNode(content);
  }

  createComment(data) {
    return new Comment(data);
  }
}

export class NodeIterator {
  functor;
  root;

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
