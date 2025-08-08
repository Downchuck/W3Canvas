"use strict";
colorjack.dom.HTMLDocument = function (domDoc) {
    // In theory, we could pass as parameter: window.document (as the factory for our needs), but we don't have the exact same apis
    var doc = domDoc || new colorjack.dom.Document();
    var Document = function () {
        var elems = []; // make sure to sync if we remove elements (not done yet)
        var createElement = function (tagName) {
            tagName = tagName.toUpperCase();
            var elem = doc.createElement(tagName);
            if (typeof (window) != 'undefined' && domDoc === window.document) {
                // domDoc creates the required HTMLElement by the browser implementation
            }
            else {
                var ElementConstructor = colorjack.dom.tags[tagName];
                if (ElementConstructor) {
                    elem = new ElementConstructor(elem);
                    elem.constructor = ElementConstructor;
                }
                else {
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
        }
        ;
        var getElementById = function (id) {
            var found = null;
            var iter = new colorjack.dom.NodeIterator(body, function (node) {
                if (node.getId && node.getId() === id) {
                    found = node;
                }
            });
            iter.traverse();
            return found;
        };
        return {
            'body': body,
            'createElement': createElement,
            'getElementsByName': getElementsByName,
            'getElementById': getElementById,
            'getElementsByTagName': getElementsByTagName,
            'querySelector': querySelector,
            'querySelectorAll': querySelectorAll
        };
        var getElementsByTagName = function (tagName) {
            var results = [];
            var iter = new colorjack.dom.NodeIterator(body, function (node) {
                if (node.tagName && node.tagName.toLowerCase() === tagName.toLowerCase()) {
                    results.push(node);
                }
            });
            iter.traverse();
            return new colorjack.dom.HTMLCollection(results[0]);
        };
        var querySelectorAll = function (selector) {
            var results = [];
            var iter = new colorjack.dom.NodeIterator(body, function (node) {
                if (matchesSelector(node, selector)) {
                    results.push(node);
                }
            });
            iter.traverse();
            return new colorjack.dom.HTMLCollection(results[0]);
        };
        var querySelector = function (selector) {
            var result = null;
            var iter = new colorjack.dom.NodeIterator(body, function (node) {
                if (matchesSelector(node, selector)) {
                    result = node;
                    // a bit of a hack to stop iteration
                    iter.traverse = function () { };
                }
            });
            iter.traverse();
            return result;
        };
        var matchesSelector = function (node, selector) {
            if (selector.startsWith('#')) {
                return node.getId && node.getId() === selector.substring(1);
            }
            else if (selector.startsWith('.')) {
                return node.getClassName && node.getClassName().split(' ').indexOf(selector.substring(1)) !== -1;
            }
            else {
                return node.tagName && node.tagName.toLowerCase() === selector.toLowerCase();
            }
        };
    };
    return colorjack.util.mixin(doc, new Document()); // colorjack.util.mixin: properties are overwritten (by the more specialized class...
};
colorjack.currentDocument = new colorjack.dom.HTMLDocument(); // Global singleton
