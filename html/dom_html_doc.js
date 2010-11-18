
colorjack.dom.HTMLDocument = function(domDoc) {
  // In theory, we could pass as parameter: window.document (as the factory for our needs), but we don't have the exact same apis
  var doc = domDoc || new colorjack.dom.Document();
  
  var Document = function() {  
    var elems = []; // make sure to sync if we remove elements (not done yet)
  
    var createElement = function(tagName) {  // override createElement from the superclass.
      tagName = tagName.toUpperCase();
      
      var elem = doc.createElement(tagName);
      
      if (typeof(window) != 'undefined' && domDoc === window.document) {
        // domDoc creates the required HTMLElement by the browser implementation
      } else {
        var ElementConstructor = colorjack.dom.tags[tagName];
        if (ElementConstructor) {
          elem = new ElementConstructor(elem);
          elem.constructor = ElementConstructor;
        } else {
          throw new ReferenceError("HTMLDocument.createElement() doesn't support this tag yet: " + tagName);
        }
      }  
      elems.push(elem);
      return elem;
    };

    var body = createElement("body");
    
    function getElementsByName(name) {
      // What's the "name" of an HTMLElement?
      // Collection getElementsByName(elementName) matching "name" in elems[]
      return null;  
    };
    
    return {
      'body':              body,
      'createElement':     createElement,
      'getElementsByName': getElementsByName
    };
  };
  return colorjack.util.mixin(doc, new Document());  // colorjack.util.mixin: properties are overwritten (by the more specialized class...
};

colorjack.currentDocument = new colorjack.dom.HTMLDocument(); // Global singleton
