
colorjack.dom = (function() {

  var NODE_TYPE_ELEMENT   = 1;
  var NODE_TYPE_TEXT      = 3;
  var NODE_TYPE_DOCUMENT  = 9;
  
  var ELEMENT_STATE_NORMAL	  = 1;
  var ELEMENT_STATE_HOVER	  	= 2;
  var ELEMENT_STATE_ACTIVE  	= 3;
  var ELEMENT_STATE_DISABLED	= 4;


  // Full spec:  http://www.w3.org/TR/DOM-Level-2-Core/core.html#ID-1950641247

  // Very very minimalistic implementation for dom.core.Node
  var Node = function(type) {
    if (!type) {
      throw new Error("Node: Need valid nodeType in the constructor.");
    }
    var nodeType      = type;
    var childNodeIdx  = -1;
    var parent        = null;
    var children      = [];
    var listeners     = {};

    var hasChildNodes = function() { return (children.length > 0); };

    var getNodeType = function() {
      return nodeType;
    };

    var getFirstChild = function() {
      return (hasChildNodes()? children[0] : null);
    };

    var getNextSibling = function() {
      var next = null;
      if (parent) {
        var siblings = parent.getChildren();
        if (childNodeIdx >= 0 && childNodeIdx < siblings.length-1) {
          next = siblings[childNodeIdx+1];
        }
      }
      return next;
    };

    var appendChild = function(newChild) {
      children.push(newChild);
      newChild.setParent(this);
      newChild.setChildNodeIdx(children.length-1); // if we remove nodes, re-index ChildNodeIdx
    };

    var getChildren = function() {
      return children;
    };

    var setChildNodeIdx = function(idx) {
      childNodeIdx = idx;
    };

    var setParent = function(p) {
      parent = p;
    };

    var getParent = function() {
      return parent;
    };

    var addEventListener = function(type, listener) {
        if (!listeners[type]) {
            listeners[type] = [];
        }
        listeners[type].push(listener);
    };

    var removeEventListener = function(type, listener) {
        if (listeners[type]) {
            var index = listeners[type].indexOf(listener);
            if (index > -1) {
                listeners[type].splice(index, 1);
            }
        }
    };

    var dispatchEvent = function(event) {
        if (listeners[event.type]) {
            listeners[event.type].forEach(function(listener) {
                listener(event);
            });
        }
        if (parent) {
            parent.dispatchEvent(event);
        }
    };

    return {
      'getNodeType'    : getNodeType,
      'hasChildNodes'    : hasChildNodes,
      'appendChild'    : appendChild,
      'getFirstChild'    : getFirstChild,
      'getNextSibling'  : getNextSibling,
      'getParent'      : getParent,
      'setChildNodeIdx'  : setChildNodeIdx,
      'setParent'      : setParent,
      'getChildren'    : getChildren,
      'addEventListener' : addEventListener,
      'removeEventListener' : removeEventListener,
      'dispatchEvent' : dispatchEvent
    };
  };


  var Element = function(tag) {
    if (!tag) {
      throw new Error("Element(): missing tag");
    }
    var node = new Node(NODE_TYPE_ELEMENT);
    node.tagName = tag;

    return node;
  };

  var TextNode = function(content) {  // Character Data (missing many methods)

    var TextHandler = function() {
      var data = (content === undefined)? "": content;
      var setData = function(c) { data = c; };
      var getData = function() { return data;  };

      return {
        'setData'  : setData,
        'getData'  : getData
      };
    };
    var node = new Node(NODE_TYPE_TEXT);
    var text = new TextHandler();
    return colorjack.util.mixin(node, text);
  };

  // We don't want to use "Document" so that we don't conflict with browser.document

  var Document = function() {
    var createElement = function(tag) { return new Element(tag);  };
    var createTextNode = function(content) { return new TextNode(content); };
    
    // Document should probably colorjack.util.mixin witn Node. -@DRE

    return {
      'createElement'  : createElement,
      'createTextNode': createTextNode
    };
  };

  var NodeIterator = function(elem, f) {
    var functor = f;
    var root = elem;

    var traverse = function(el) {
      if (el) {
        functor(el);
        if (el.hasChildNodes()) {
          var node = el.getFirstChild();
          while (node) {
            traverse(node);
            node = node.getNextSibling();
          }
        }
      }
    };

    return {
      'traverse' : function() { traverse(root); }
    };
  };
  
  return {
    NODE_TYPE_ELEMENT:  NODE_TYPE_ELEMENT,
    NODE_TYPE_TEXT:     NODE_TYPE_TEXT,
    NODE_TYPE_DOCUMENT: NODE_TYPE_DOCUMENT,

    ELEMENT_STATE_NORMAL:   ELEMENT_STATE_NORMAL,
    ELEMENT_STATE_HOVER:    ELEMENT_STATE_HOVER,
    ELEMENT_STATE_ACTIVE:   ELEMENT_STATE_ACTIVE,
    ELEMENT_STATE_DISABLED: ELEMENT_STATE_DISABLED,

    Node: Node,
    Element: Element,
    Document: Document,
    TextNode: TextNode,
    NodeIterator: NodeIterator
  };

})();
