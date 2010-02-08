
// Whenever possible, follow the Java Sun convention for the interfaces.
// http://java.sun.com/j2se/1.4.2/docs/guide/plugin/dom/org/w3c/dom/html/HTMLOptionElement.html

colorjack.dom.tags = {};

colorjack.dom.registerElement = function(tagName, name, constructorFunction) {
  this.tags[tagName.toUpperCase()] = constructorFunction;
  this[name] = constructorFunction;
};


colorjack.dom.HTMLCollection = function(firstChild) {
  if (firstChild == null) {
    throw new ReferenceError("HTMLCollection(): Missing firstChild parameter");
  }
  var options = [];
  var node = firstChild;
  while (node !== null) {
    options.push(node);
    node = node.getNextSibling();
  }
  return {
    'length'  : options.length,
    'item'    : function(i)   { return options[i]; },
    'namedItem' : function(name) { throw new ReferenceError("HTMLCollection.namedItem(): not implemented"); }
  };
};

// Convention for HTMLElement: use getter/setter for consistency and correctness.

colorjack.dom.HTMLElement = function(element) {
  var HTMLElement = function() {
    var id      = "";
    var title    = "";
    var lang    = "";
    var dir      = "";
    var className  = "";
    
    return {
      'setId'      : function(d) { id = d; },
      'getId'     : function()  { return id; },
      'setTitle'    : function(t) { title = t; },
      'getTitle'    : function()  { return title; },
      'setLang'    : function(l) { lang = l; },
      'getLang'    : function()  { return lang; },
      'setDir'    : function(d) { dir = d; },
      'getDir'    : function()  { return dir; },
      'setClassName'  : function(c) { className = c; },
      'getClassName'  : function()  { return className; }
    };
  };
  var box = new colorjack.css.BoxModel();
  // ElementCSSInlineStyle
  element.style = new colorjack.css.ElementStyle(new colorjack.css.CssStyle(), new HTMLElement());
  element.getBoundingRect = function() { return box.getBorderBox(); };
  // colorjack.util.mixin (HTMLElement, Element); tagName = tagName.toUpper();
  return colorjack.util.mixin(element, box);
};

// Not using getter/setter convention, plain DOM Level 2
colorjack.dom.registerElement("FORM", "HTMLFormElement", function(element) {

/*
interface HTMLFormElement : HTMLElement {
  readonly attribute HTMLCollection  elements;
  readonly attribute long            length;
           attribute DOMString       name;
           attribute DOMString       acceptCharset;
           attribute DOMString       action;
           attribute DOMString       enctype;
           attribute DOMString       method;
           attribute DOMString       target;
  void               submit();
  void               reset();
};
*/

});

colorjack.dom.registerElement("BODY", "HTMLBodyElement", function(element) {
  var BodyElement = function() {  // Mostly color properties from HTML 4.01 (all deprecated, but not obsolete!?)
    // Should get the default properties from the browser
    var aLink     = "";
    var background  = "";
    var bgColor   = "";
    var link    = "";
    var text    = "";
    var vLink    = "";
    
    return {
      'getALink'    : function()  { return aLink; },
      'setALink'    : function(a) { aLink = a; },
      'getBackground'  : function()  { return background; },
      'setBackground' : function(b) { background = b; },
      'getBgColor'  : function()  { return bgColor; },
      'setBgColor'    : function(b) { bgColor = b; },
      'getLink'    : function()  { return link; },
      'setLink'    : function(l) { link = l; },
      'getText'    : function()  { return text; },
      'setText'       : function(t) { text = t; },
      'getVLink'    : function()  { return vLink; },
      'setVLink'    : function(v) { vLink = v; }
    };
  };
  var base = new colorjack.dom.HTMLElement(element);
  return colorjack.util.mixin(base, new BodyElement());
});

colorjack.dom.registerElement("SPAN", "HTMLSpanElement", function(element) {
  var SpanElement = function() { return {}; };
  var base = new colorjack.dom.HTMLElement(element);
  return colorjack.util.mixin(base, new SpanElement());
});

colorjack.dom.registerElement("DIV", "HTMLDivElement", function(element) {
  var DivElement = function() {
    var align = "";
    return {
      'getAlign'  : function() { return align; },
      'setAlign'  : function(a) { align = a; }
    };
  };
  var base = new colorjack.dom.HTMLElement(element);
  return colorjack.util.mixin(base, new DivElement());
});

colorjack.dom.registerElement("P", "HTMLParagraphElement", function(element) {
  var ParagraphElement = function() {
    var align = "";
    return {
      'getAlign'  : function() { return align; },
      'setAlign'  : function(a) { align = a; }
    };
  };
  var base = new colorjack.dom.HTMLElement(element);
  return colorjack.util.mixin(base, new ParagraphElement());
});


/*

http://www.w3.org/TR/DOM-Level-2-HTML/html.html

Note: Form is part of the HTMLInputElement. HTMLTextAreaElement
  readonly attribute HTMLFormElement form;

*/

colorjack.dom.registerElement("INPUT", "HTMLInputElement", function(element, typeParam) {

  var InputElement = function() { // For now, none of the variables are really used into the TextBox
    var defaultValue    = "";
    var defaultChecked    = false;
//  readonly attribute HTMLFormElement form;    
    var accept        = "";
    var accessKey      = "";
    var align        = "";
    var alt          = "";
    var checked        = false;
    var disabled      = false;
    var maxLength      = 0;
    var name        = "";
    var readOnly      = false;
    // DOM Level 2
    var size        = 0;  // # of pixels, unless type = "text"/"password" -> # of chars
    var src          = "";   // when type = "image", src is the location of the image
    var tabIndex      = 0;
    var type        = typeParam;
    var useMap        = "";
    
    var validTypes = /^(text|password|checkbox|radio|submit|reset|file|hidden|image|button|range)$/;
    
    var value = "";      // This is the one we care right now for TextBox
    
    var setType = function(t) {
      if (!validTypes.test(t)) {
        throw new TypeError("Invalid InputElement type: " + t);
      }
      else {
        type = t;
      }
    };
    
    var noOp = function() {};
    
    return {
      'getDefaultValue'   : function()  { return defaultValue; },
      'setDefaultValue'   : function(d) { defaultValue = d; },
      'getDefaultChecked' : function()  { return defaultChecked; },
      'setDefaultChecked' : function(d) { defaultChecked = d; },
      'getAccept'      : function()  { return accept; },
      'setAccept'      : function(a) { accept = a; },
      'getAccessKey'    : function()  { return accessKey; },
      'setAccessKey'    : function(a) { accessKey = a; },
      'getAlign'      : function()  { return align; },
      'setAlign'      : function(a) { align = a; },
      'getAlt'      : function()  { return alt; },
      'setAlt'      : function(a) { alt = a; },
      'isChecked'      : function()  { return checked; },
      'setChecked'    : function(c) { checked = c; },
      'isDisabled'    : function()  { return disabled; },
      'setDisabled'    : function(d) { disabled = d; },
      'getMaxLength'    : function()  { return maxLength; },
      'setMaxLength'    : function(m) { maxLength = m; },
      'getName'      : function()  { return name; },
      'setName'      : function(n) { name = n; },
      'isReadOnly'    : function()  { return readOnly; },
      'setReadOnly'    : function(r) { readOnly = r; },
      'getSize'      : function()  { return size; },
      'setSize'      : function(s) { size = s; },
      'getSrc'      : function()  { return src; },
      'setSrc'      : function(s) { src = s; },
      'getTabIndex'    : function()  { return tabIndex; },
      'setTabIndex'    : function(t) { tabIndex = t; },
      'getType'      : function()  { return type; },
      'setType'      : setType,
      'getUseMap'      : function()  { return useMap; },
      'setUseMap'      : function(u) { useMap = u; },
      
      'getValue'      : function()  { return value; },  // This is the one we care about
      'setValue'      : function(v) { value = v; },
      
      'focus'    : noOp,
      'blur'    : noOp,
      'select'  : noOp,
      'click'    : noOp
    };
  };  
  var base = new colorjack.dom.HTMLElement(element);
  return colorjack.util.mixin(base, new InputElement());
});

colorjack.dom.registerElement("TEXTAREA", "HTMLTextAreaElement", function(element) {

  var TextAreaElement = function() {  // For now, none of the variables are really used into the TextBox
    var defaultValue = "";
//  readonly attribute HTMLFormElement form;
    var accessKey = "";
    var cols = 80;
    var disabled = false;
    var name = "";
    var readOnly = false;
    var rows = 10;
    var tabIndex = -1;
      var type = "textarea";
    var value = "";          // This is the one we care right now for TextBox
    
    var noOp = function() {};

    return {
      'getDefaultValue'  : function()  { return defaultValue; },
      'setDefaultValue'  : function(v) { defaultValue = v; },
      'getAccessKey'    : function()  { return accessKey; },
      'setAccessKey'    : function(k) { accessKey = k; },
      'getCols'      : function()  { return cols; },
      'setCols'      : function(c) { cols = c; },
      'isDisabled'    : function()  { return disabled; },
      'setDisabled'    : function(d) { disabled = d; },
      'getName'      : function()  { return name },
      'setName'      : function(n) { name = n; },
      'isReadOnly'    : function()  { return readOnly; },
      'setReadOnly'    : function(r) { readOnly = r; },
      'getRows'      : function()  { return rows; },
      'setRows'      : function(r) { rows = r; },
      'getTabIndex'    : function()  { return tabIndex; },
      'setTabIndex'    : function(t) { tabIndex = t; },
      'getType'      : function()  { return type; },
      'setType'      : function(t) { type = t; },
      
      'getValue'  : function()  { return value; },
      'setValue'  : function(v) { value = v; },
      
      'blur'    : noOp,
      'focus'    : noOp,
      'select'  : noOp
    };
  };
  var base = new colorjack.dom.HTMLElement(element);
  return colorjack.util.mixin(base, new TextAreaElement());
});

colorjack.dom.registerElement("IMG", "HTMLImageElement", function(element) {
  // Important: do not access these properties directly, define the right getter/setter to the outside.
  // IMPORTANT: This is because of the colorjack.util.mixin() function: it returns a new object with copied properties.
  
  var base = new colorjack.dom.HTMLElement(element);

  var ImageElement = function() {
    var name = "";
    var align = "";
    var alt = "";
//  var border = "";  // Unfortunately, this is overriding and creating conflicts with our BoxModel 'border' property defined in HTMLElement
//  var height = 0;
    var hspace = 0;
    var isMap = false;
    var longDesc = "";
    var src = "";
    var useMap = "";
    var vspace = 0;
//  var width = 0;
    
    return {
      'getName'    : function()  { return name; },
      'setName'    : function(n) { name = n; },
      'getAlign'    : function()  { return align; },
      'setAlign'    : function(a) { align = a; },
      'getAlt'    : function()  { return alt; },
      'setAlt'    : function(a) { alt = a; },
      
      // "border" property? conflicting with base.border from the BoxModel property!
      //'getBorder'    : function()  { return base.border.top; },
      //'setBorder'    : function(s) { base.setBorder(s); },
      
      'getHeight'    : function()  { return base.contentArea.height; },
      'setHeight'   : function(h) { base.contentArea.height = h; },
      'getHspace'   : function()  { return hspace; },
      'setHspace'    : function(h) { hspace = h; },
      'getIsMap'    : function()  { isMap; },
      'setIsMap'    : function(m) { isMap = m; },
      'getLongDesc'  : function()  { return longDesc; },
      'setLongDesc'  : function(d) { longDesc = d; },
      'getSrc'    : function()  { return src; },
      'setSrc'    : function(s) { src = s; },
      'getUseMap'    : function()  { return useMap; },
      'setUseMap'    : function(u) { useMap = u; },
      'getVspace'    : function()  { return vspace; },
      'setVspace'    : function(v) { vspace = v; },
      'getWidth'    : function()  { return base.contentArea.width; },
      'setWidth'    : function(w) { base.contentArea.width = w; }
      ,
      'setSize'    : function(w,h) { this.setWidth(w); this.setHeight(h); }
    };
  };
  /*
  
  // Equivalent to above but into the prototype.
  
  ImageElement.prototype.setSize = function(w, h) { // Size must be in sync with the BoxModel
    this.setWidth(w);
    this.setHeight(h);
  };
  */

  return colorjack.util.mixin(base, new ImageElement());
});


colorjack.dom.registerElement("BUTTON", "HTMLButtonElement", function(element) {
  
  var ButtonElement = function() {
    var accessKey  = "";
    var disabled  = false;
    var name    = "";
    var tabIndex  = -1;
    var type    = "button";    // "submit" | "button" | "reset"
    var value    = "";
    
    return {
      'getAccessKey'  : function()  { return accessKey; },
      'setAccessKey'  : function(k) { accessKey = k; },
      'isDisabled'  : function()  { return disabled; },
      'setDisabled'  : function(d) { disabled = d; },
      'getName'    : function()  { return name; },
      'setName'    : function(n) { name = n; },
      'getTabIndex'  : function()  { return tabIndex; },
      'setTabIndex'  : function(t) { tabIndex = t; },
      
      'getType'    : function()  { return type; },
      'setType'    : function(t) { type = t; },
      
      'getValue'    : function()  { return value; },
      'setValue'    : function(v) { value = v; }
    };
  };
  var base = new colorjack.dom.HTMLElement(element);
  return colorjack.util.mixin(base, new ButtonElement());
});

colorjack.dom.registerElement("A", "HTMLLinkElement", function(element) {
  
  var LinkElement = function() {
    var disabled = false;  // only for stylesheet
    var charset  = "";
    var href     = "";    // URI
    var hreflang = "";
    var media    = "";
    var rel      = "";    // forward link type
    var rev      = "";    // reverse link type
    var target   = "";    // frame to show up
    var type     = "";    // hint: content type (mime type)
    
    return {
      'isDisabled'  : function()  { return disabled; },
      'setDisabled'  : function(d) { disabled = d; },
      'getCharset'  : function()  { return charset; },
      'setCharset'  : function(c) { charset = c; },
      'getHref'    : function()  { return href; },
      'setHref'    : function(h) { href = h; },
      'getHreflang'  : function()  { return hreflang; },
      'setHreflang'  : function(h) { hreflang = h; },
      'getMedia'    : function()  { return media; },
      'setMedia'    : function(m) { media = m; },
      'getRel'    : function()  { return rel; },
      'setRel'    : function(r) { rel = r; },
      'getTarget'    : function()  { return target; },
      'setTarget'    : function(t) { target = t; },
      'getType'    : function()  { return type; },
      'setType'    : function(t) { type = t; }
    };
  };
  var base = new colorjack.dom.HTMLElement(element);
  return colorjack.util.mixin(base, new LinkElement());  
});
