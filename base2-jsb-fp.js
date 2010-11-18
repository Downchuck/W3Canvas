/*
  base2 - Copyright 2007-2010, Dean Edwards
    http://code.google.com/p/base2/

  License:
    http://www.opensource.org/licenses/mit-license.php

  Contributors:
    Doeke Zanstra
*/

// timestamp: Mon, 11 Jan 2010 15:44:59

var base2 = {
  name:      "base2",
  version:   "2.0 (alpha1)"
};

(function(global) { // begin: package

// =========================================================================
// base2/header.js
// =========================================================================

/*@cc_on @*/

var undefined,
    base2     = global.base2,
    document  = global.document,
    Undefined = K(),
    Null      = K(null),
    True      = K(true),
    False     = K(false),
    This      = function(){return this};

base2.namespace = "";

var _Object_prototype   =  Object.prototype,
    _Function_prototype =  Function.prototype,
    _Array_prototype    =  Array.prototype,
    _concat             = _Array_prototype.concat,
    _slice              = _Array_prototype.slice,
    _toString           = _Object_prototype.toString,
    _Object_toString    = _toString.call({}),
    _Array_toString     = _toString.call([]),
    _Date_toString      = _toString.call(new Date),
    _RegExp_toString    = _toString.call(/./);

var _PRIMITIVE_TYPE     = /boolean|number|string/,
    _FORMAT             = /%([1-9])/g,
    _LTRIM              = /^\s\s*/,
    _RTRIM              = /\s\s*$/,
    _DECOMPILATION      = /try/.test(detect),                      // some platforms don't allow decompilation
    _TEST_TRUE          = {test: True},
    _BASE               = _DECOMPILATION ? /\bbase\b/ : _TEST_TRUE,
    _THIS               = _DECOMPILATION ? /\bthis\b/ : _TEST_TRUE,
    _MUTABLE            = ["constructor", "toLocaleString", "toString"], // only override these when prototyping
    _OBJECT_HIDDEN   = {
      constructor: 1,
      hasOwnProperty: 1,
      isPrototypeOf: 1,
      propertyIsEnumerable: 1,
      toLocaleString: 1,
      toString: 1,
      valueOf: 1
    },
    _FUNCTION_HIDDEN = extend(pcopy(_OBJECT_HIDDEN), {
      apply: 1,
      bind: 1,
      call: 1,
      length: 1,
      prototype: 1
    }),
    _BASE_HIDDEN = extend(pcopy(_OBJECT_HIDDEN), {
      base: 1,
      extend: 1
    });

_Object_forEach_check();

// Private data

var _private = global.$$base2;
if (!_private) {
   _private = global.$$base2 = {"0": global, inc: 1, anon: []};
}

// Packages and Modules can be anonymous but still define namespaces.

function Anonymous(object) {
  object.toString = K("[$$base2.anon[" + _private.anon.length + "]]");
  _private.anon.push(object);
  return object;
};

// =========================================================================
// base2/Base.js
// =========================================================================

// http://dean.edwards.name/weblog/2006/03/base/

var Base_static = {
  ancestor: Object,

  ancestorOf: function(klass) {
    return klass && klass.prototype instanceof this;
  },

  base: function() {
    // Call this method from any other method to invoke that method's ancestor.
  },

  extend: function(_instance, _static) {
    // Build the prototype.
    base2.__prototyping = this.prototype;
    var _prototype = new this;
    if (_instance) extend(_prototype, _instance);
    _prototype.base = function() {
      // Call this method from any other method to invoke that method's ancestor.
    };
    delete base2.__prototyping;

    // Create the wrapper for the constructor function.
    var _constructor = _prototype.constructor;
    function _base2_constructor() {
      // Don't call the constructor function when prototyping.
      if (!base2.__prototyping) {
        if (this.constructor == _base2_constructor || this.__constructing) {
          // Instantiation.
          this.__constructing = true;
          _constructor.apply(this, arguments);
          delete this.__constructing;
        } else {
          // Casting.
          var object = arguments[0];
          // Convert primitives to objects.
          if (_PRIMITIVE_TYPE.test(typeof object)) {
            object = new object.constructor(object);
          }
          base2.__casting = true;
          extend(object, _prototype);
          delete base2.__casting;

          return object;
        }
      }
      return this; // for strict engines
    };
    _prototype.constructor = _base2_constructor;

    // Build the static interface.
    for (var i in Base_static) _base2_constructor[i] = this[i];
    if (_static) extend(_base2_constructor, _static);
    _base2_constructor.ancestor = this;
    _base2_constructor.base = _prototype.base;
    _base2_constructor.prototype = _prototype;
    if (_base2_constructor.init) _base2_constructor.init();

    // introspection (removed when packed)
    ;;; _base2_constructor["#implements"] = [];
    ;;; _base2_constructor["#implemented_by"] = [];

    return _base2_constructor;
  },

  forEach: function(object, eacher, context) {
    Object_forEach(object, eacher, context, this);
  },

  implement: function(_interface) {
    if (typeof _interface == "function") {
      ;;; if (_interface.prototype instanceof Base) {
        // introspection (removed when packed)
        ;;; this["#implements"].push(_interface);
        ;;; _interface["#implemented_by"].push(this);
      ;;; }
      _interface = _interface.prototype;
    }
    // Add the interface using the extend() function.
    extend(this.prototype, _interface);
    return this;
  }
};

var Base = Base_static.extend.call(Object, {
  constructor: function(properties) {
    if (properties) extend(this, properties);
  },

  extend: delegate(extend),

  toString: function() {
    if (this.constructor.toString == _Function_prototype.toString) {
      return "[object base2.Base]";
    } else {
      return "[object " + this.constructor.toString().slice(1, -1) + "]";
    }
  }
}, Base_static);

// =========================================================================
// base2/Abstract.js
// =========================================================================

var Abstract = Base.extend({
  constructor: function() {
    throw new TypeError("Abstract class cannot be instantiated.");
  }
});

// =========================================================================
// base2/Package.js
// =========================================================================

var Package = Base.extend({
  constructor: function(properties) {
    var names = {};

    if (properties) {
      extend(this, properties);
      if (properties != base2 && !("parent" in properties)) {
        this.parent = base2;
      }
    }

    var packageID = this.name;
    if (packageID) {
      if (this.parent instanceof Package) {
        this.parent.addName(packageID, this);
        packageID = this.parent.toString().slice(1, -1) + "." + packageID;
      }
      this.toString = K("[" + packageID + "]");
      if (packageID != this.name) this.namespace = "var " + this.name + "=" + packageID + ";";
    } else {
      Anonymous(this);
      packageID = this.toString().slice(1, -1);
    }

    var self = this;
    function addName(value, name) {
      self[name] = value;
      if (!names[name]) {
        names[name] = true;
        if (self.exports) self.exports += ",";
        self.exports += name;
        self.namespace += "var " + name + "=" + packageID + "." + name + ";";
      }
      // Provide objects and classes with pretty toString methods
      if (value && value.ancestorOf) { // it's a class
        var classID = packageID + "." + name;
        if (value.namespace) {
          var anonID = value.toString().slice(1, -1);
          value.namespace = "var " + name + "=" + classID + ";" +
            value.namespace.replace(new RegExp(rescape(anonID), "g"), name);
        }
        value.toString = K("[" + classID + "]");
      }
      return value;
    };

    var exports = this.exports;
    this.exports = "";
    if (typeof exports == "object") forEach(exports, addName);
    this.addName = flip(addName);
  },

  exports: "",
  name: "",
  namespace: "",
  parent: null
});


// =========================================================================
// base2/Module.js
// =========================================================================

var Module = Abstract.extend(null, {
  namespace: "",

  extend: function(methods, _static) {
    // Extend a module to create a new module.
    var module = Anonymous(this.base());
    // Inherit static methods.
    for (var name in this) {
      var method = this[name];
      if (typeof method == "function" && !method._isModuleMethod && !Base_static[name]) {
        module[name] = method;
      }
    }
    module.namespace = "";
    // Inherit module methods.
    module.implement(this);
    // Implement module  methods.
    if (methods) module.implement(methods);
    // Implement static properties and methods.
    if (_static) extend(module, _static);
    return module;
  },

  forEach: function(eacher, context) {
    // Members of a Module are the methods that it provides.
    for (var name in this) {
      var method = this[name];
      if (method && method._isModuleMethod) {
        eacher.call(context, method, name, this);
      }
    }
  },

  implement: function(methods) {
    var moduleID = this.toString().slice(1, -1);
    if (typeof methods == "object") {
      // Add new methods from an object literal.
      extendModule(this, methods, true);

      // Rebuild the namespace
      this.namespace = "";

      // Loop through module methods to build the namespace.
      for (name in this) {
        method = this[name];
        if (method && method._isModuleMethod) {
          this.namespace += "var " + name + "=" + moduleID + "." + name + ";";
          if (_THIS.test(method)) {
            method = this[name] = bind(method, this);
            method._isModuleMethod = true;
          }
        }
      }
    } else if (Module.ancestorOf(methods)) {
      // Implement the methods from another Module.
      this.base(methods);
      for (var name in methods) {
        var method = methods[name];
        if (method && method._isModuleMethod) {
          this[name] = method;
          this.namespace += "var " + name + "=" + moduleID + "." + name + ";";
        }
      }
    }
    return this;
  },

  partial: function() {
    // Return a clone of the Module that contains all of its methods after
    // partial evaluation.
    return extendModule(Module.extend(), map(this, partial), true);
  }
});

function extendModule(module, methods, detected) {
  // Extend a Module with an object literal.
  // Allow for base2's detect() notation.
  var proto = module.prototype;
  for (var name in methods) {
    var method = methods[name];
    if (name.indexOf("@") === 0) { // object detection
      extendModule(module, method, detected && detect(name.slice(1)));
    } else if (method instanceof Function) {
      if (!module[name] && (!detected || _THIS.test(method))) {
        module[name] = createDelegate(name, method);
      }
      if (detected) {
        if (_BASE.test(method)) {
          method = _override(module, name, method);
        } else {
          module[name] = method;
        }
        proto[name] = createModuleMethod(module, name);
      }
      method._isModuleMethod = true;
    }
  }
  return module;
};

function createModuleMethod(module, name) {
  // Pass "this" and all other arguments to the underlying module method.
  return function() {
    return module[name].apply(module, _concat.apply([this], arguments));
  };
};

function createDelegate(name, method) {
  function _delegate(object) {
    var ancestor = object[name].ancestor;
    if (ancestor) object.base = ancestor;
    var method = ancestor ? "base" : name;
    var args = _slice.call(arguments, 1);
    /*@if (@_jscript_version < 5.8)
      return object[method](args[0], args[1], args[2], args[3]);
    @else @*/
      return object[method].apply(object, args);
    /*@end @*/
  };
  _delegate._isModuleMethod = true;
  return _delegate;
};

// =========================================================================
// base2/Enumerable.js
// =========================================================================

var Enumerable_methods = {
  every: every,
  filter: filter,
  invoke: invoke,
  map: map,
  plant: plant,
  pluck: pluck,
  reduce: reduce,
  some: some
};

var Enumerable = Module.extend(Enumerable_methods);

function every(enumerable, checker, context) {
  var result = true;
  try {
    forEach (enumerable, function(item, key) {
      result = checker.call(context, item, key, enumerable);
      if (!result) throw StopIteration;
    });
  } catch (error) {
    if (error != StopIteration) throw error;
  }
  return !!result; // cast to boolean
};

function filter(enumerable, checker, context) {
  if (enumerable instanceof Map) {
    return enumerable.filter(checker, context);
  } else if (Array2_like(enumerable)) {
    return Array2.filter(enumerable, checker, context);
  } else {
    var result = {};
    forEach (enumerable, function(item, key) {
      if (checker.call(context, item, key, enumerable)) {
        result[key] = item;
      }
    });
    return result;
  }
};

function invoke(enumerable, method) {
  // Apply a method to each item in the enumerated enumerable.
  var args = _slice.call(arguments, 2);
  return map (enumerable, typeOf(method) == "function" ? function(item) {
    return item == null ? undefined : method.apply(item, args);
  } : function(item) {
    return item == null ? undefined : item[method].apply(item, args);
  });
};

function map(enumerable, mapper, context) {
  if (enumerable instanceof Map) {
    return enumerable.map(mapper, context);
  } else {
    var result = Array2_like(enumerable) ? [] : {};
    forEach (enumerable, function(item, key) {
      result[key] = mapper.call(context, item, key, enumerable);
    });
    return result;
  }
};

function plant(enumerable, propertyName, value) {
  forEach (enumerable, typeOf(value) == "function" ? function(item) {
    if (item != null) item[propertyName] = value(item, propertyName);
  } : function(item) {
    if (item != null) item[propertyName] = value;
  });
};

function pluck(enumerable, propertyName) {
  return map(enumerable, function(item) {
    return item == null ? undefined : item[propertyName];
  });
};

function reduce(enumerable, reducer, result) {
  var initialised = arguments.length > 2;
  forEach (enumerable, function(item, key) {
    if (initialised) {
      result = reducer(result, item, key, enumerable);
    } else {
      result = item;
      initialised = true;
    }
  });
  if (!initialised) throw new TypeError("Nothing to reduce.");
  return result;
};

function some(enumerable, checker, context) {
  return !every(enumerable, not(checker), context);
};

// =========================================================================
// base2/Map.js
// =========================================================================

// http://wiki.ecmascript.org/doku.php?id=proposals:dictionary

var HASH = "#";
var VALUES = HASH;

var Map = Base.extend({
  constructor: function(values) {
    this[VALUES] = {};
    if (values) this.merge(values);
  },

  clear: function() {
    this[VALUES] = {};
    return this;
  },

  copy: function() {
    var result = copy(this, true);
    result[VALUES] = copy(this[VALUES]);
    return result;
  },

  forEach: function(eacher, context) {
    var values = this[VALUES];
    for (var HASH_key in values) {
      eacher.call(context, values[HASH_key], HASH_key.slice(1), this);
    }
  },

  get: function(key) {
    // Avoid warnings in strict engines.
    var value = this[VALUES][HASH + key];
    return value;
  },

  getKeys: function() {
    var result = [], i = 0;
    for (var HASH_key in this[VALUES]) {
      result[i++] = HASH_key.slice(1);
    }
    return result; // returns an Array
  },

  getValues: function() {
    var result = [], i = 0,
        values = this[VALUES];
    for (var HASH_key in values) {
      result[i++] = values[HASH_key];
    }
    return result; // returns an Array
  },

  has: function(key) {
    return HASH + key in this[VALUES];
  },

  merge: function(values /*, values2, values3, .. ,valuesN */) {
    for (var i = 0; i < arguments.length; i++) {
      values = arguments[i];
      if (values && typeof values == "object" && values != this) {
        if (values instanceof Map) {
          values = values[VALUES];
          for (var HASH_key in values) {
            this.put(HASH_key.slice(1), values[HASH_key]);
          }
        } else {
          for (var key in values) if (!_OBJECT_HIDDEN[key]) {
            this.put(key, values[key]);
          }
        }
      }
    }
    return this;
  },

  put: function(key, value) {
    if (arguments.length == 1) value = key;
    // Create the new entry (or overwrite the old entry).
    return this[VALUES][HASH + key] = value;
  },

  remove: function(key) {
    delete this[VALUES][HASH + key];
  },

  size: function() {
    // This is expensive because we are not storing the keys.
    var size = 0;
    for (var HASH_key in this[VALUES]) size++;
    return size;
  },

  union: function(values /*, values2, values3, .. ,valuesN */) {
    return this.merge.apply(this.copy(), arguments);
  }
});

Map.implement(Enumerable);

// Optimise map/filter methods.

Map.implement({
  filter: function(checker, context) {
    // Returns a clone of the current object with its members filtered by "checker".
    var result = copy(this, true),
        resultValues = result[VALUES] = {},
        values = this[VALUES];
    for (var HASH_key in values) {
      var value = values[HASH_key];
      if (checker.call(context, value, HASH_key.slice(1), this)) {
        resultValues[HASH_key] = value;
      }
    }
    return result; // returns a Map
  },

  map: function(mapper, context) {
    // Returns a new Map containing the mapped values.
    var result = new Map,
        resultValues = result[VALUES],
        values = this[VALUES];
    for (var HASH_key in values) {
      resultValues[HASH_key] = mapper.call(context, values[HASH_key], HASH_key.slice(1), this);
    }
    return result; // returns a Map
  }
});

// =========================================================================
// base2/Collection.js
// =========================================================================

// A Map that is more array-like (accessible by index).

// Collection classes have a special (optional) property: Item
// The Item property points to a constructor function.
// Members of the collection must be an instance of Item.

// The static createItem() method is responsible for construction of collection items.
// Instance methods that add new items (add, put, insertAt, putAt) pass their arguments
// to the static createItem() method. If you want to modify the way collection items are
// created then you only need to override the createItem() method for custom collections.

var KEYS  = ".";
var ITEMS = VALUES;

var ERR_DUPLICATE_KEY       = new ReferenceError("Duplicate key.");
var ERR_INDEX_OUT_OF_BOUNDS = new ReferenceError("Index out of bounds.");

var Collection = Map.extend({
  constructor: function(items) {
    this[KEYS] = [];
    this.base(items);
  },

  add: function(key, item) {
    // Duplicates not allowed using add().
    // But you can still overwrite entries using put().
    if (HASH + key in this[ITEMS]) throw ERR_DUPLICATE_KEY;
    return this.put.apply(this, arguments);
  },

  clear: function() {
    this[KEYS].length = 0;
    this[ITEMS] = {};
    return this;
  },

  copy: function() {
    var result = this.base();
    result[KEYS] = this[KEYS].concat();
    return result;
  },

  filter: function(checker, context) {
    // Returns a clone of the current object with its members filtered by "test".
    var keys = this[KEYS],
        items = this[ITEMS],
        size = keys.length,
        result = copy(this, true),
        resultKeys = result[KEYS] = [],
        resultItems = result[ITEMS] = {};
    for (var i = 0, j = 0, key, HASH_key; i < size; i++) {
      var item = items[HASH_key = HASH + (key = keys[i])];
      if (checker.call(context, item, key, this)) {
        resultKeys[j++] = key;
        resultItems[HASH_key] = item;
      }
    }
    return result;
  },

  forEach: function(eacher, context) {
    var keys = this[KEYS].concat(), key,
        items = this[ITEMS],
        size = keys.length;
    for (var i = 0; i < size; i++) {
      eacher.call(context, items[HASH + (key = keys[i])], key, this);
    }
  },

  getAt: function(index) {
    var key = Array2_item(this[KEYS], index); // Allow negative indexes.
    return key == null ? undefined : this[ITEMS][HASH + key];
  },

  getKeys: function() {
    return this[KEYS].concat(); // returns an Array
  },

  getValues: function() {
    var keys = this[KEYS],
        items = this[ITEMS],
        i = keys.length,
        result = [];
    while (i--) result[i] = items[HASH + keys[i]];
    return result; // returns an Array
  },

  imap: function(mapper, context) { // the same as Array.map(this.getValues(), ..) but faster.
    var keys = this[KEYS],
        items = this[ITEMS],
        size = keys.length,
        result = [];
    for (var i = 0; i < size; i++) {
      result[i] = mapper.call(context, items[HASH + keys[i]], i, this);
    }
    return result; // returns an Array
  },

  indexOf: function(key) {
    return HASH + key in this[ITEMS] ? Array2.indexOf(this[KEYS], String(key)) : -1;
  },

  insertAt: function(index, key, item) {
    var keys = this[KEYS],
        items = this[ITEMS],
        HASH_key = HASH + key;
    if (HASH_key in items) throw ERR_DUPLICATE_KEY;
    if (Array2_item(keys, index) == null) throw ERR_INDEX_OUT_OF_BOUNDS;
    keys.splice(index, 0, String(key));
    items[HASH_key] = "{placeholder}";
    return this.put.apply(this, _slice.call(arguments, 1));
  },

  item: function(keyOrIndex) {
    return this[typeof keyOrIndex == "number" ? "getAt" : "get"](keyOrIndex);
  },

  join: function(separator) {
    return this.getValues().join(separator);
  },

  keyAt: function(index) {
    return Array2_item(this[KEYS], index); // Allow negative indexes.
  },

  map: function(mapper, context) {
    // Returns a new Collection containing the mapped items.
    var keys = this[KEYS], key, HASH_key,
        items = this[ITEMS],
        size = keys.length,
        result = new Collection,
        resultItems = result[ITEMS];
    result[KEYS] = keys.concat();
    for (var i = 0; i < size; i++) {
      resultItems[HASH_key = HASH + (key = keys[i])] =
        mapper.call(context, items[HASH_key], key, this);
    }
    return result; // returns a Collection
  },

  put: function(key, item) {
    if (arguments.length == 1) item = key;

    var klass = this.constructor;
    if (klass.Item && !(item instanceof klass.Item)) {
      item = klass.createItem.apply(klass, arguments);
    }
    var keys, items = this[ITEMS];
    if (!(HASH + key in items)) {
      (keys = this[KEYS])[keys.length] = String(key);
    }
    items[HASH + key] = item;
    return item;
  },

  putAt: function(index, item) {
    var key = Array2_item(this[KEYS], index); // Allow negative indexes.
    if (key == null) throw ERR_INDEX_OUT_OF_BOUNDS;
    arguments[0] = key;
    return this.put.apply(this, arguments);
  },

  remove: function(key) {
    // The remove() method can be slow so check if the key exists first.
    var items = this[ITEMS];
    if (HASH + key in items) {
      delete items[HASH + key];
      var keys = this[KEYS],
          index = Array2.indexOf(keys, String(key));
      if (index !== -1) keys.splice(index, 1);
    }
  },

  removeAt: function(index) {
    var removed = this[KEYS].splice(index, 1);
    if (removed.length) {
      delete this[ITEMS][HASH + removed[0]];
    }
  },

  reverse: function() {
    this[KEYS].reverse();
    return this;
  },

  size: function() {
    return this[KEYS].length;
  },

  slice: function(start, end) {
    var result = this.copy();
    if (arguments.length > 0) {
      var removed = result[KEYS],
          size = removed.length;
      start = clamp(start, size);
      end = isNaN(end) ? size : clamp(end, size);
      var keys = removed.splice(start, end - start),
          i = removed.length,
          resultItems = result[ITEMS];
      while (i--) delete resultItems[HASH + removed[i]];
      result[KEYS] = keys;
    }
    return result;
  },

  sort: function(compare) {
    if (compare) {
      var items = this[ITEMS];
      this[KEYS].sort(function(key1, key2) {
        return compare(items[HASH + key1], items[HASH + key2], key1, key2);
      });
    } else {
      this[KEYS].sort();
    }
    return this;
  },

  toString: function() {
    return "(" + (this[KEYS] || "") + ")";
  }
}, {
  Item: null, // If specified, all members of the collection must be instances of Item.

  createItem: function(key, item) {
    return this.Item ? new this.Item(key, item) : item;
  },

  extend: function(_instance, _static) {
    var klass = this.base(_instance);
    klass.createItem = this.createItem;
    if (_static) extend(klass, _static);
    if (!klass.Item) {
      klass.Item = this.Item;
    } else if (typeof klass.Item != "function") {
      klass.Item = (this.Item || Base).extend(klass.Item);
    }
    if (klass.init) klass.init();
    return klass;
  }
});

// =========================================================================
// base2/RegGrp.js
// =========================================================================

// A collection of regular expressions and their associated replacement values.
// A Base class for creating parsers.

var PATTERNS = KEYS;
var COMPILED = "_";

var REGGRP_BACK_REF        = /\\(\d+)/g,
    REGGRP_ESCAPE_COUNT    = /\[(\\.|[^\]\\])+\]|\\.|\(\?/g,
    REGGRP_PAREN           = /\(/g,
    REGGRP_LOOKUP          = /\$(\d+)/,
    REGGRP_LOOKUP_SIMPLE   = /^\$\d+$/,
    REGGRP_LOOKUPS         = /(\[(\\.|[^\]\\])+\]|\\.|\(\?)|\(/g,
    REGGRP_DICT_ENTRY      = /^<#\w+>$/,
    REGGRP_DICT_ENTRIES    = /<#(\w+)>/g;

var RegGrp = Collection.extend({
  constructor: function(dictionary, values) {
    if (arguments.length == 1) {
      values = dictionary;
      dictionary = null;
    }
    if (dictionary) {
      this.dictionary = new RegGrp.Dict(dictionary);
    }
    this.base(values);
  },

  dictionary: null,
  ignoreCase: false,

  clear: _recompile,

  copy: function() {
    var result = this.base();
    if (this.dictionary) {
      result.dictionary = this.dictionary.copy();
    }
    return result;
  },

  exec: function(string, _replacement /* optional */) {
    string += "";
    var group = this,
        patterns = group[PATTERNS],
        items = group[ITEMS];
    if (!patterns.length) return string;
    if (!group[COMPILED] || group[COMPILED].ignoreCase != group.ignoreCase) {
      group[COMPILED] = new RegExp(group, group.ignoreCase ? "gi" : "g");
    }
    return string.replace(group[COMPILED], function(match) {
      var args = [], item, offset = 1, i = arguments.length;
      while (--i) args[i] = arguments[i] || ""; // some platforms return null/undefined for non-matching sub-expressions
      // Loop through the RegGrp items.
      while ((item = items[HASH + patterns[i++]])) {
        var next = offset + item.length + 1;
        if (args[offset]) { // do we have a result?
          var replacement = _replacement == null ? item.replacement : _replacement;
          switch (typeof replacement) {
            case "function":
              return replacement.apply(group, args.slice(offset, next));
            case "number":
              return args[offset + replacement];
            case "object":
              if (replacement instanceof RegGrp) {
                return replacement.exec(args[offset]);
              }
            default:
              return replacement;
          }
        }
        offset = next;
      }
      return match;
    });
  },

  reverse: _recompile,
  sort: _recompile,

  test: function(string) { // The slow way to do it. Hopefully, this isn't called too often. :)
    return this.exec(string) != string;
  },

  toString: function() {
    var patterns = this[PATTERNS].concat();
    var string = patterns.join(")|(");
    if (/\\\d/.test(string)) { // back refs
      var offset = 1,
          items = this[ITEMS], item;
      for (var i = 0; item = items[HASH + patterns[i]]; i++) {
        patterns[i] = item.source.replace(REGGRP_BACK_REF, function(match, index) {
          return "\\" + (offset + ~~index);
        });
        offset += item.length + 1;
      }
      string = patterns.join(")|(");
    }
    return "(" + string + ")";
  }
}, {
  IGNORE: null, // a null replacement value means that there is no replacement.

  Item: {
    constructor: function(source, replacement) {
      if (replacement == null) {
        replacement = 0;
      } else if (typeof replacement.replacement != "undefined") {
        replacement = replacement.replacement;
      } else if (typeof replacement == "number") {
        replacement = String(replacement);
      }

      var length = source.indexOf("(") === -1 ? 0 : RegGrp.count(source);

      // Does the expression use sub-expression lookups?
      if (typeof replacement == "string" && REGGRP_LOOKUP.test(replacement)) {
        if (REGGRP_LOOKUP_SIMPLE.test(replacement)) { // A simple lookup? (e.g. "$2").
          // Store the index (used for fast retrieval of matched strings).
          var index = replacement.slice(1) - 0;
          if (index && index <= length) replacement = index;
        } else {
          // A complicated lookup (e.g. "Hello $2 $1.").
          var lookup = replacement;
          replacement = function(match) {
            return match.replace(new RegExp(source, "g" + (this.ignoreCase ? "i": "")), lookup);
          };
        }
      }

      this.length = length;
      this.source = String(source);
      this.replacement = replacement;
    },

    length: 0,
    source: "",
    replacement: "",

    toString: function() {
      return this.source;
    }
  },

  count: function(expression) {
    return (String(expression).replace(REGGRP_ESCAPE_COUNT, "").match(REGGRP_PAREN) || "").length;
  }
});

forEach ("add,get,has,indexOf,insertAt,remove,put".split(","), function(name) {
  var index     = name === "insertAt" ? 1 : 0,
      recompile = name === "put" || name === "remove";
  _override(this, name, function() {
    var expression = arguments[index];
    if (expression instanceof RegExp) expression = expression.source;
    if (this.dictionary) {  //  <<<===   THIS  NEEDS  TO  MOVE  !!!
      expression = REGGRP_DICT_ENTRY.test(expression)
        ? this.dictionary.exec(expression)
        : parsePhrase(this.dictionary, expression);
    }
    arguments[index] = expression;
    if (recompile) delete this[COMPILED];
    return this.base.apply(this, arguments);
  });
}, RegGrp.prototype);

RegGrp.Dict = RegGrp.extend({
  constructor: function(values) { // Ensure that dictionaries don't have dictionaries.
    this.base(values);
  },

  put: function(expression, replacement) {
    // Get the underlying replacement value.
    if (replacement instanceof RegGrp.Item) {
      replacement = replacement.replacement;
    } else if (replacement instanceof RegExp) {
      replacement = replacement.source;
    }
    if (typeof replacement == "string") { // Don't translate functions.
      // Translate the replacement.
      // The result is the original replacement recursively parsed by this dictionary.
      var nonCapturing = replacement.replace(REGGRP_LOOKUPS, _nonCapture);
      replacement = parsePhrase(this, replacement);
      nonCapturing = parsePhrase(this, nonCapturing);
    }
    var item = this.base(expression, replacement);
    item._nonCapturing = nonCapturing;
    return item;
  },

  toString: function() {
    return "(<#" + this[PATTERNS].join(">)|(<#") + ">)";
  }
});

function parsePhrase(dictionary, phrase) {
  // Prevent sub-expressions in dictionary entries from capturing.
  var entries = dictionary[ITEMS];
  return phrase.replace(REGGRP_DICT_ENTRIES, function(match, entry) {
    entry = entries[HASH + entry];
    return entry ? entry._nonCapturing : match;
  });
};

function _recompile() {
  delete this[COMPILED];
  return this.base.apply(this, arguments);
};

function _nonCapture(match, escaped) {
  return escaped || "(?:"; // non-capturing
};

// =========================================================================
// base2/assignID.js
// =========================================================================

function assignID(object, name) {
  // Assign a unique ID to an object.
  if (!name) name = object.nodeType === 1 ? "uniqueID" : "base2ID";
  if (!object[name]) object[name] = "b2_" + _private.inc++;
  return object[name];
};

// =========================================================================
// base2/detect.js
// =========================================================================

function detect() {
  // Two types of detection:
  //  1. Object detection
  //    e.g. detect("(java)");
  //    e.g. detect("!(document.addEventListener)");
  //  2. Platform detection (browser sniffing)
  //    e.g. detect("MSIE");
  //    e.g. detect("MSIE|Opera");

  base2.userAgent = "";
  var jscript = NaN/*@cc_on||@_jscript_version@*/, // http://dean.edwards.name/weblog/2007/03/sniff/#comment85164
      args = "global,element,form,input,style,jscript";
  if (global.navigator) { // browser
    var MSIE    = /MSIE[\d.]+/g,
        element = document.createElement("span"),
        form    = document.createElement("form"),
        input   = document.createElement("input"),
        style   = element.style,
        // Close up the space between name and version number.
        //  e.g. MSIE 6 -> MSIE6
        userAgent = navigator.userAgent.replace(/([a-z])[\s\/](\d)/gi, "$1$2");
    // Fix Opera's (and others) user agent string.
    if (!jscript) userAgent = userAgent.replace(MSIE, "");
    if (/MSIE/.test(userAgent)) {
      userAgent = userAgent.match(MSIE)[0] + ";" + userAgent
        .replace(MSIE, "")
        .replace(/user\-agent.*$/i, ""); // crap gets appended here
    }
    ;;; userAgent = userAgent.replace(/\.NET CLR[\d\.]*/g, "");
    // Chrome is different enough that it counts as a different vendor.
    // Sniff for Webkit unless you specifically want either Chrome or Safari.
    // Arora is treated as Safari.
    if (/Chrome/.test(userAgent)) userAgent = userAgent.replace(/Safari[\d.]*/gi, "");
    if (/Gecko/.test(userAgent)) userAgent = userAgent.replace(/Gecko/g, "Gecko/").replace(/rv:/, "Gecko");
    else if (!("java" in global)) args += ",java"; // http://code.google.com/p/base2/issues/detail?id=127
    if (!/^CSS/.test(document.compatMode)) userAgent += ";QuirksMode";
    base2.userAgent = userAgent.replace(/like \w+/gi, "") + ";platform=" + navigator.platform;
  }

  var cache = {};
  detect = function(expression) {
    var negated = expression.indexOf("!") == 0;
    if (negated) expression = expression.slice(1);
    if (cache[expression] == null) {
      var returnValue = false,
          test = expression;
      if (test.indexOf("(") == 0) { // Feature detection
        if (base2.dom) {
          test = test
            .replace(/(hasFeature)/, "document.implementation.$1")
            .replace(/\bstyle\.(\w+)/g, function(match, propertyName) {
              if (!style[propertyName]) {
                propertyName = base2.dom.CSSStyleDeclaration.getPropertyName(propertyName);
              }
              return "style." + propertyName;
            });
        }
        test = test
          .replace(/^\((\w+\.[\w\.]+)\)$/, function(match, feature) {
            feature = feature.split(".");
            var propertyName = feature.pop(), object = feature.join(".");
            return "(" +
              (jscript < 5.6
                ? object + "." + propertyName + "!==undefined"
                : "'" + propertyName + "' in " + object
              ) +
            ")";
          });
        try {
          returnValue = new Function(args, "return !!" + test)(global,element,form,input,style,jscript);
        } catch (x) {
          // the test failed
        }
      } else {
        // Browser sniffing.
        returnValue = new RegExp("(" + test + ")", "i").test(base2.userAgent);
      }
      cache[expression] = returnValue;
    }
    return !!(negated ^ cache[expression]);
  };

  detect.MSIE  = !!jscript;
  detect.MSIE5 = jscript < 5.6;

  return detect(arguments[0]);
};

// =========================================================================
// lang/package.js
// =========================================================================

var lang = {
  name:      "lang",
  version:   base2.version,
  namespace: "",

  match: function(string, expression) {
    // Same as String.match() except that this function will return an
    // empty array if there is no match.
    return String(string).match(expression) || [];
  }
};

// =========================================================================
// lang/assert.js
// =========================================================================

function assert(condition, message, ErrorClass) {
  if (!condition) {
    throw new (ErrorClass || Error)(message || "Assertion failed.");
  }
};

function assertArity(args, arity, message) {
  if (arity == null) arity = args.callee.length; //-@DRE (callee not allowed in strict mode)
  if (args.length < arity) {
    throw new SyntaxError(message || "Not enough arguments.");
  }
};

function assertType(object, type, message) {
  if (typeof type == "function" ? !instanceOf(object, type) : typeOf(object) != type) {
    throw new TypeError(message || "Invalid type.");
  }
};

// =========================================================================
// lang/copy.js
// =========================================================================

function copy(object, preserveClassInfo) {
  if (preserveClassInfo) {
    base2.__prototyping = true; // We are not really prototyping but it stops base2's [[Construct]] being called.
    var result = new object.constructor;
    delete base2.__prototyping;
    for (var i in result) if (result[i] !== object[i]) {
      result[i] = object[i];
    }
  } else {
    result = {};
    for (var i in object) result[i] = object[i];
  }
  return result;
};

function _PCopier(){};

function pcopy(object) { // Prototype-base copy.
  // Doug Crockford / Richard Cornford
  _PCopier.prototype = object;
  return new _PCopier;
};

// =========================================================================
// lang/extend.js
// =========================================================================

function extend(object, source) { // or extend(object, key, value)
  if (object && source) {
    var enumerateHiddenMembers = !!base2.__prototyping;
    if (arguments.length === 2) { // Extending with an object.
      var isFunction = typeof source == "function" && source.call;
    } else { // Extending with a key/value pair.
      enumerateHiddenMembers = _OBJECT_HIDDEN[key];
      var key = source;
      source = {};
      source[key] = arguments[2];
    }

    if (enumerateHiddenMembers) { // Add constructor, toString etc
      var proto = isFunction ? _Function_prototype : _Object_prototype,
          i = _MUTABLE.length, key;
      while ((key = _MUTABLE[--i])) {
        var value = source[key];
        if (value != proto[key]) {
          if (_BASE.test(value)) {
            _override(object, key, value);
          } else {
            object[key] = value;
          }
        }
      }
    }
    // Copy each of the source object's properties to the target object.
    var immutable = isFunction ? _FUNCTION_HIDDEN : base2.__casting ? _BASE_HIDDEN : _OBJECT_HIDDEN;
    for (key in source) if (!immutable[key]) {
      value = source[key];
      // Object detection.
      if (key.indexOf("@") === 0) {
        if (detect(key.slice(1))) extend(object, value);
      } else if (key in object) {
        var ancestor = object[key];
        if (value !== ancestor) { // Check for method overriding.
          if (typeof value == "function") {
            if (_BASE.test(value)) {
              _override(object, key, value);
            } else {
              value.ancestor = ancestor;
              object[key] = value;
            }
          } else if (!base2.__casting) {
            object[key] = value;
          }
        }
      } else {
        object[key] = value;
      }
    }
  }
  // http://www.hedgerwow.com/360/dhtml/ie6_memory_leak_fix/
  /*@if (@_jscript) {
    try {
      return object;
    } finally {
      object = null;
    }
  }
  @else @*/
    return object;
  /*@end @*/
};

function _override(object, name, method) {
  // Return a method that overrides an existing method.
  var ancestor = object[name];
  var superObject = base2.__prototyping; // late binding for prototypes
  if (superObject && ancestor != superObject[name]) superObject = null;
  function base() {
    var previous = this.base;
    this.base = superObject ? superObject[name] : ancestor;
    var returnValue = method.apply(this, arguments);
    this.base = previous;
    return returnValue;
  };
  base.ancestor = ancestor;
  // introspection (removed when packed)
  ;;; base.toString = K(method.toString());
  object[name] = base;
  return base;
};

// =========================================================================
// lang/forEach.js
// =========================================================================

// http://dean.edwards.name/weblog/2006/07/enum/

if (!global.StopIteration) {
  global.StopIteration = new Error("StopIteration");
}

function forEach(object, eacher, context, fn) {
  if (object == null) return;
  if (!fn) {
    if (typeof object == "function" && object.call) {
      // Functions are a special case.
      fn = Function;
    } else if (typeof object.forEach == "function" && object.forEach != forEach) {
      // The object implements a custom forEach method.
      object.forEach(eacher, context);
      return;
    } else if (typeof object.length == "number") {
      // The object is array-like.
      Array2_forEach(object, eacher, context);
      return;
    }
  }
  Object_forEach(object, eacher, context, fn);
};

forEach.csv = function(string, eacher, context) {
  forEach (csv(string), eacher, context);
};

forEach.detect = function(object, eacher, context) {
  var process = function(value, key) {
    if (key.indexOf("@") === 0) { // object/feature detection
      if (detect(key.slice(1))) forEach (value, process);
    } else eacher.call(context, value, key, object);
  };
  forEach (object, process);
};

// These are the two core enumeration methods. All other forEach methods
// eventually call one of these methods.

function Object_forEach(object, eacher, context, fn) {
  // Enumerate an object and compare its keys with fn's prototype.
  var _proto = fn ? fn == Function ? _FUNCTION_HIDDEN : fn.prototype : _OBJECT_HIDDEN;
  for (var key in object) if (!(key in _proto)) {
    eacher.call(context, object[key], key, object);
  }
};

function Array2_forEach(array, eacher, context) {
  var enumerable = array;
  if (array == null) {
    enumerable = array = global;
  } else if (typeof array == "string") {
    enumerable = array.split("");
  }
  var length = array.length || 0, i; // preserve length
  for (i = 0; i < length; i++) if (i in enumerable) {
    eacher.call(context, enumerable[i], i, array);
  }
};

// http://code.google.com/p/base2/issues/detail?id=10
function _Object_forEach_check() {
  // Run the test for Safari's buggy enumeration.
  var Temp = function(){this.i=1};
  Temp.prototype = {i:1};
  var count = 0;
  for (var i in new Temp) count++;

  if (count > 1) { // Safari (pre version 3) fix.
    Object_forEach = function(object, eacher, context, fn) {
      var processed = {},
         _proto = fn ? fn == Function ? _FUNCTION_HIDDEN : fn.prototype : _OBJECT_HIDDEN;
      for (var key in object) {
        if (!processed[key] && !(key in _proto)) {
          processed[key] = true;
          eacher.call(context, object[key], key, object);
        }
      }
    };
  }
};

// =========================================================================
// lang/instanceOf.js
// =========================================================================

function instanceOf(object, klass) {
  // Handle exceptions where the target object originates from another frame.
  // This is handy for JSON parsing (amongst other things).

  if (!(klass instanceof Function)) {
    throw new TypeError("Invalid 'instanceof' operand.");
  }

  if (object == null) return false;

  // COM objects don't have a constructor
  /*@if (@_jscript)
    if (typeof object.constructor != "function") return false;
  /*@end @*/

  if (object instanceof klass) return true;

  switch (klass) {
    case Array:
      return _toString.call(object) === _Array_toString;
    case Date:
      return _toString.call(object) === _Date_toString;
    case RegExp:
      return _toString.call(object) === _RegExp_toString;
    case Function:
      return typeOf(object) === "function";
    case String:
    case Number:
    case Boolean:
      return typeof object === typeof klass.prototype.valueOf();
    case Object:
      return true;
  }
  return false;
};

// =========================================================================
// lang/typeOf.js
// =========================================================================

// http://wiki.ecmascript.org/doku.php?id=proposals:typeof

var _MSIE_NATIVE_FUNCTION = detect("(jscript)")
  ? new RegExp("^" + rescape(isNaN).replace(/isNaN/, "\\w+") + "$")
  : {test: False};

function typeOf(object) {
  var type = typeof object;
  switch (type) {
    case "object":
      return object == null
        ? "null"
        : typeof object.constructor != "function" // COM object
          ? _MSIE_NATIVE_FUNCTION.test(object)
            ? "function"
            : type
          : _toString.call(object) == _Date_toString
            ? type
            : typeof object.constructor.prototype.valueOf(); // underlying type
    case "function":
      return typeof object.call == "function" ? type : "object";
    default:
      return type;
  }
};

// =========================================================================
// js/header.js
// =========================================================================

function _createObject2(name, _constructor, generics, constants, extensions) {
  // Clone native objects and extend them.

  var Native = global[name],
      proto = Native.prototype,
      name2 = name + 2,
      Native2 = function() {
        var object2 = this.constructor == Native2 ? _constructor.apply(null, arguments) : arguments[0];
        return extend(object2, proto2);
      },
      proto2 = Native2.prototype,
      namespace = "var " + name2 + "=base2." + name2 + ";";

  // http://developer.mozilla.org/en/docs/New_in_JavaScript_1.6#Array_and_String_generics
  generics = generics.split(",");
  for (var i = 0; name = generics[i]; i++) {
    Native2[name] = Native[name] || unbind(proto[name]);
    namespace += "var " + name + "=" + name2 + "." + name + ";";
  }

  for (name in constants) {
    Native2[name] = constants[name];
    namespace += "var " + name + "=" + name2 + "." + name + ";";
  }

  for (var i = 4, methods; methods = arguments[i]; i++) {
    for (name in methods) {
      var method = methods[name],
          protoMethod = proto[name];
      Native2[name] = Native[name] || protoMethod ? unbind(protoMethod) : method;
      if (!protoMethod) proto2[name] = delegate(method);
      namespace += "var " + name + "=" + name2 + "." + name + ";";
    }
  }

  Native2.namespace = namespace;

  // Temporarily support documentation system. -@DRE
  ;;; Native2.ancestor = Object;
  ;;; Native2.ancestorOf = Base.ancestorOf;

  // introspection (removed when packed)
  ;;; Native2["#implements"] = [];
  ;;; Native2["#implemented_by"] = [];

  return Native2;
};

// =========================================================================
// js/~/Date.js
// =========================================================================

// Fix Date.get/setYear() (IE5-7)

if ((new Date).getYear() > 1900) {
  Date.prototype.getYear = function() {
    return this.getFullYear() - 1900;
  };
  Date.prototype.setYear = function(year) {
    return this.setFullYear(year + 1900);
  };
}

// https://bugs.webkit.org/show_bug.cgi?id=9532

var _testDate = new Date(Date.UTC(2006, 1, 20));
_testDate.setUTCDate(15);
if (_testDate.getUTCHours() != 0) {
  forEach.csv("FullYear,Month,Date,Hours,Minutes,Seconds,Milliseconds", function(type) {
    extend(Date.prototype, "setUTC" + type, function() {
      var value = this.base.apply(this, arguments);
      if (value >= 57722401000) {
        value -= 3600000;
        this.setTime(value);
      }
      return value;
    });
  });
}

// =========================================================================
// js/~/String.js
// =========================================================================

// A KHTML bug.
if ("".replace(/^/, K("$$")) == "$") {
  extend(String.prototype, "replace", function(expression, replacement) {
    if (typeof replacement == "function") {
      var fn = replacement;
      replacement = function() {
        return String(fn.apply(null, arguments)).split("$").join("$$");
      };
    }
    return this.base(expression, replacement);
  });
}

// =========================================================================
// js/Array2.js
// =========================================================================

var Array2 = _createObject2(
  "Array",
  Array,
  "concat,join,pop,push,reverse,shift,slice,sort,splice,unshift", // generics
  null, // constants
  Enumerable_methods, {
    batch: Array2_batch,
    combine: Array2_combine,
    contains: Array2_contains,
    copy: Array2_copy,
    filter: Array2_filter,
    flatten: Array2_flatten,
    forEach: Array2_forEach,
    indexOf: Array2_indexOf,
    insertAt: Array2_insertAt,
    item: Array2_item,
    lastIndexOf: Array2_lastIndexOf,
    remove: Array2_remove,
    removeAt: Array2_removeAt,
    swap: Array2_swap
  }
);

function Array2_batch(array, block, timeout, oncomplete, context) {
  var index = 0,
      length = array.length;
  function _batch_function() {
    var now = Date2.now(), start = now, k = 0;
    while (index < length && (now - start < timeout)) {
      block.call(context, array[index], index++, array);
      if (k++ < 5 || k % 50 === 0) now = Date2.now();
    }
    if (index < length) {
      setTimeout(_batch_function, 10);
    } else {
      if (oncomplete) oncomplete.call(context);
    }
  };
  setTimeout(_batch_function, 1);
};

function Array2_combine(keys, values) {
  // Combine two arrays to make a hash.
  if (!values) values = keys;
  return Array2.reduce(keys, function(hash, key, index) {
    hash[key] = values[index];
    return hash;
  }, {});
};

function Array2_contains(array, item) {
  return Array2.indexOf(array, item) !== -1;
};

function Array2_copy(array) {
  var result = _slice.call(array);
  if (array.swap) Array2(result); // cast to Array2
  return result;
};

function Array2_filter(array, checker, context) {
  var result = [], i = 0;
  Array2_forEach (array, function(item, index) {
    if (checker.call(context, item, index, array)) {
      result[i++] = item;
    }
  });
  return result;
};

function Array2_flatten(array) {
  var i = 0;
  function _flatten(result, item) {
    if (Array2_like(item)) {
      Array2.reduce(item, _flatten, result);
    } else {
      result[i++] = item;
    }
    return result;
  };
  return Array2.reduce(array, _flatten, []);
};

function Array2_indexOf(array, item, fromIndex) {
  if (array) {
    var length = array.length;
    if (fromIndex == null) {
      fromIndex = 0;
    } else if (fromIndex < 0) {
      fromIndex = Math.max(0, length + fromIndex);
    }
    for (var i = fromIndex; i < length; i++) {
      if (array[i] === item) return i;
    }
  }
  return -1;
};

function Array2_insertAt(array, index, item) {
  Array2.splice(array, index, 0, item);
};

function Array2_item(array, index) {
  var item;
  if ((index -= 0) < 0) index += array.length;
  if (index >= 0) item = array[index];
  return item;
};

function Array2_lastIndexOf(array, item, fromIndex) {
  if (array) {
    var length = array.length;
    if (fromIndex == null) {
      fromIndex = length - 1;
    } else if (fromIndex < 0) {
      fromIndex = Math.max(0, length + fromIndex);
    }
    for (var i = fromIndex; i >= 0; i--) {
      if (array[i] === item) return i;
    }
  }
  return -1;
};

function Array2_remove(array, item) {
  var index = Array2.indexOf(array, item);
  if (index !== -1) Array2.splice(array, index, 1);
};

function Array2_removeAt(array, index) {
  Array2.splice(array, index, 1);
};

function Array2_slice(array, start, end) {
  if (!array || !array.length) return [];
  if (array.constructor) return _slice.apply(array, _slice.call(arguments, 1));

  var result = [],
      length = array.length;

  start = clamp(start, length);
  end = isNaN(end) ? length : clamp(end, length);

  for (var i = start, j = 0; i < end; i++) {
    result[j++] = array[i];
  }

  return result;
};

function Array2_swap(array, index1, index2) {
  if (index1 < 0) index1 += array.length; // starting from the end
  if (index2 < 0) index2 += array.length;
  var temp = array[index1];
  array[index1] = array[index2];
  array[index2] = temp;
  return array;
};

function Array2_like(object) {
  // is the object like an array?
  return object && typeof object == "object" && typeof object.length == "number";
};

try {
  var canSliceNodeLists = _slice.call(document.childNodes) instanceof Array;
} catch(x) {}

if (!canSliceNodeLists) {
  Array2.slice = Array2_slice;
}

Array2.like = Array2_like;

function clamp(value, length) {
  value -= 0;
  if (value < 0) value += length;
  return value < 0 ? 0 : value > length ? length : value;
};

// introspection (removed when packed)
;;; Enumerable["#implemented_by"].push(Array2);
;;; Array2["#implements"].push(Enumerable);

// =========================================================================
// js/Date2.js
// =========================================================================

// http://developer.mozilla.org/es4/proposals/date_and_time.html

// big, ugly, regular expression
var _DATE_PATTERN = /^(([+-]\d{6}|\d{4})(-(\d{2})(-(\d{2}))?)?)?(T(\d{2})(:(\d{2})(:(\d{2})(\.(\d{1,3})(\d)?\d*)?)?)?)?(([+-])(\d{2})(:(\d{2}))?|Z)?$/,
    _DATE_PARTS   = { // indexes to the sub-expressions of the RegExp above
      FullYear: 2,
      Month: 4,
      Date: 6,
      Hours: 8,
      Minutes: 10,
      Seconds: 12,
      Milliseconds: 14
    },
    _TIMEZONE_PARTS = { // idem, but without the getter/setter usage on Date object
      Hectomicroseconds: 15, // :-P
      UTC: 16,
      Sign: 17,
      Hours: 18,
      Minutes: 20
    };

var Date2 = _createObject2(
  "Date",
  function(yy, mm, dd, h, m, s, ms) { // faux constructor
    switch (arguments.length) {
      case 0: return new Date;
      case 1: return typeof yy == "string" ? new Date(Date2.parse(yy)) : new Date(yy.valueOf());
      default: return new Date(yy, mm, arguments.length === 2 ? 1 : dd, h || 0, m || 0, s || 0, ms || 0);
    }
  },
  "", null, {
    toISOString: function(date) {
      var string = "####-##-##T##:##:##.###";
      for (var part in _DATE_PARTS) {
        string = string.replace(/#+/, function(digits) {
          var value = date["getUTC" + part]();
          if (part === "Month") value++; // js month starts at zero
          return ("000" + value).slice(-digits.length); // pad
        });
      }
      //// remove trailing zeroes, and remove UTC timezone, when time's absent
      //return string.replace(_TRIM_ZEROES, "").replace(_TRIM_TIMEZONE, "$1Z");
      return string + "Z";
    }
  }
);

Date2.now = now;

function now() {
  return (new Date).valueOf(); // milliseconds since the epoch
};

var Date_parse = Date.parse;

Date2.parse = Date_parse("T00:00") === Date_parse("1970") === 0 ? Date_parse : Date2_parse;

function Date2_parse(string) {
  // parse ISO date
  var parts = lang.match(string, _DATE_PATTERN);
  if (parts.length) {
    var month = parts[_DATE_PARTS.Month];
    if (month) parts[_DATE_PARTS.Month] = String(month - 1); // js months start at zero
    // round milliseconds on 3 digits
    if (parts[_TIMEZONE_PARTS.Hectomicroseconds] >= 5) parts[_DATE_PARTS.Milliseconds]++;
    var utc = parts[_TIMEZONE_PARTS.UTC] || parts[_TIMEZONE_PARTS.Hours] ? "UTC" : "";
    var date = new Date(0);
    if (parts[_DATE_PARTS.Date]) date["set" + utc + "Date"](14);
    for (var part in _DATE_PARTS) {
      var value = parts[_DATE_PARTS[part]];
      if (value) {
        // set a date part
        date["set" + utc + part](value);
        // make sure that this setting does not overflow
        if (date["get" + utc + part]() != parts[_DATE_PARTS[part]]) {
          return NaN;
        }
      }
    }
    // timezone can be set, without time being available
    // without a timezone, local timezone is respected
    if (parts[_TIMEZONE_PARTS.Hours]) {
      var hours = Number(parts[_TIMEZONE_PARTS.Sign] + parts[_TIMEZONE_PARTS.Hours]);
      var minutes = Number(parts[_TIMEZONE_PARTS.Sign] + (parts[_TIMEZONE_PARTS.Minutes] || 0));
      date.setUTCMinutes(date.getUTCMinutes() + (hours * 60) + minutes);
    }
    return date.valueOf();
  } else {
    return /^[TZ\d:.+-]+$/.test(string) ? NaN : Date_parse(string);
  }
};

// =========================================================================
// js/String2.js
// =========================================================================

var String2 = _createObject2(
  "String",
  function(string) { // faux constructor
    return new String(arguments.length == 0 ? "" : string);
  },
  "charAt,charCodeAt,concat,indexOf,lastIndexOf,match,replace,search,slice,split,substr,substring,toLowerCase,toUpperCase", // generics
  null, // constants
  {
    csv: csv,
    format: format,
    rescape: rescape,
    trim: trim
  }
);

// http://blog.stevenlevithan.com/archives/faster-trim-javascript
function trim(string) {
  return String(string).replace(_LTRIM, "").replace(_RTRIM, "");
};

function csv(string) {
  return string ? String(string).split(/\s*,\s*/) : [];
};

function format(string) {
  // Replace %n with arguments[n].
  // e.g. format("%1 %2%3 %2a %1%3", "she", "se", "lls");
  // ==> "she sells sea shells"
  // Only %1 - %9 supported.
  var args = arguments;
  var pattern = new RegExp("%([1-" + (arguments.length - 1) + "])", "g");
  return String(string).replace(pattern, function _formatter(match, index) {
    return args[index];
  });
};

function rescape(string) {
  // Make a string safe for creating a RegExp.
  return String(string).replace(/([\/()[\]{}|*+-.,^$?\\])/g, "\\$1");
};

// =========================================================================
// js/Function2.js
// =========================================================================

var Function2 = _createObject2(
  "Function",
  Function,
  "", {
    I: I,
    II: II,
    K: K
  }, {
    bind: bind,
    compose: compose,
    deferUntil: deferUntil,
    delegate: delegate,
    flip: flip,
    not: not,
    partial: partial,
    unbind: unbind
  }
);

function I(i) { // Return first argument.
  return i;
};

function II(i, ii) { // Return second argument.
  return ii;
};

function K(k) {
  return function() {
    return k;
  };
};

function bind(fn, context) {
  var lateBound = typeof fn != "function";
  if (arguments.length > 2) {
    var args = _slice.call(arguments, 2);
    return function() {
      return (lateBound ? context[fn] : fn).apply(context, _concat.apply(args, arguments));
    };
  } else { // Faster if there are no additional arguments.
    return function() {
      return (lateBound ? context[fn] : fn).apply(context, arguments);
    };
  }
};

function compose(fn1, fn2 /*, fn3, .., fnN */) {
  var fns = _slice.call(arguments);
  return function() {
    var i = fns.length, result = fns[--i].apply(this, arguments);
    while (i--) result = fns[i].call(this, result);
    return result;
  };
};

function deferUntil(fn, until, interval, timeout) {
  var startTime = now();
  var tick = function() {
    try {
      var passed = until();
    } catch (x) {
      // fall through
    }
    if (passed) fn();
    else if (!timeout || (now() - startTime < timeout)) {
      setTimeout(tick, interval || 4);
    }
  };
  if (interval === 0) tick();
  else setTimeout(tick, interval || 4);
};

function delegate(fn, context) {
  var lateBound = typeof fn != "function";
  return function() {
    return (lateBound ? context[fn] : fn).apply(context, _concat.apply([this], arguments));
  };
};

function flip(fn) {
  // Swap the first two arguments in a function.
  return function() {
    return fn.apply(this, Array2_swap(arguments, 0, 1));
  };
};

function not(fn) {
  // Negate the return value of a function.
  return function() {
    return !fn.apply(this, arguments);
  };
};

function partial(fn) { // Based on Oliver Steele's version.
  // Partial evaluation.
  var args = _slice.call(arguments, 1);
  return function() {
    var specialised = args.concat(), i = 0, j = 0;
    while (i < args.length && j < arguments.length) {
      if (typeof specialised[i] == "undefined") specialised[i] = arguments[j++];
      i++;
    }
    while (j < arguments.length) {
      specialised[i++] = arguments[j++];
    }
    if (Array2.indexOf(specialised, undefined) !== -1) {
      specialised.unshift(fn);
      return partial.apply(null, specialised);
    }
    return fn.apply(this, specialised);
  };
};

function unbind(fn) {
  return function(context) {
    return fn.apply(context, _slice.call(arguments, 1));
  };
};

// =========================================================================
// js/JSON.js
// =========================================================================

// This code is loosely based on Douglas Crockford's original:
//  http://www.json.org/json.js

var JSON_STRING_VALID  = /^("(\\.|[^"\\\n\r])*"|[,:{}\[\]0-9.\-+Eaeflnr-u \n\r\t])*$/;

var JSON_STRING_ESCAPE = new RegGrp({
  '\b':   '\\b',
  '\\t':  '\\t',
  '\\n':  '\\n',
  '\\f':  '\\f',
  '\\r':  '\\r',
  '"':    '\\"',
  '\\\\': '\\\\',
  '[\\x00-\\x1f\\x7f-\\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]':
    function(chr) {
      var charCode = chr.charCodeAt(0);
      return '\\u00' + (~~(charCode / 16)).toString(16) + (charCode % 16).toString(16);
    }
});

base2.JSON = {
  parse: function(string) {
    try {
      if (JSON_STRING_VALID.test(string)) {
        return new Function("window,self,parent,top,document,frames", "return " + string).call({}); // global eval().
      }
    } catch (x) {}

    throw new SyntaxError("JSON.parse");
  },

  stringify: function(object) {
    switch (typeof object) {
      case "boolean":
        return String(object);

      case "number":
        return isFinite(object) ? String(object) : "null";

      case "string":
        return '"' + JSON_STRING_ESCAPE.exec(object) + '"';

      case "object":
        if (object == null) return "null";

        switch (_toString.call(object)) {
          case _Date_toString:
            return '"' + Date2.toISOString(object) + '"';

          case _Array_toString:
            var strings = [],
                i = object.length;
            while (i--) {
              var value = this.stringify(object[i]);
              strings[i] = value === "undefined" ? "null" : value;
            }
            return "[" + strings.join(",") + "]";

          case _Object_toString:
            strings = [];
            i = 0;
            for (var name in object) if (!_OBJECT_PROTECTED[name]) {
              value = this.stringify(object[name]);
              if (value !== "undefined") {
                strings[i++] = this.stringify(name) + ":" + value;
              }
            }
            return "{" + strings.join(",") + "}";
        }
    }
    return "undefined";
  },

  toString: K("[object base2.JSON]")
};

// =========================================================================
// base2/exports.js
// =========================================================================

base2.exports = {
  Undefined: Undefined,
  Null: Null,
  False: False,
  True: True,
  This : This,
  Base: Base,
  Package: Package,
  Abstract: Abstract,
  Module: Module,
  Enumerable: Enumerable,
  Map: Map,
  Collection: Collection,
  RegGrp: RegGrp,
  JSON: base2.JSON,
  Array2: Array2,
  Date2: Date2,
  Function2: Function2,
  String2: String2,
  assignID: assignID,
  detect: detect,
  global: global
};

base2 = global.base2 = new Package(base2);

base2.bind = function(host) {
  forEach.csv("Array,Date,String,Function", function(name) {
    extend(host[name], base2[name+2]);
    base2[name+2](host[name].prototype); // cast
  });
  host.Function.bind = Function2.bind;
  if (!host.JSON) host.JSON = base2.JSON;
  return host;
};

if (global.JSON) {
  base2.namespace = base2.namespace.replace(/var JSON[^;]+;/, "");
}

// =========================================================================
// base2/lang/exports.js
// =========================================================================

lang.exports = {
  assert: assert,
  assertArity: assertArity,
  assertType: assertType,
  bind: bind,
  copy: copy,
  extend: extend,
  forEach: forEach,
  format: format,
  instanceOf: instanceOf,
  match: lang.match,
  pcopy: pcopy,
  rescape: rescape,
  trim: trim,
  typeOf: typeOf
};

lang = new Package(lang);

// =========================================================================
// base2/require.js
// =========================================================================

base2.host = "";

base2.require = require;

function require(requirements, callback) {
  if (typeof requirements == "string") {
    requirements = csv(requirements);
  }
  if (requirements instanceof Array) {
    var strings = requirements;
    requirements = {};
    for (var i = 0; i < strings.length; i++) {
      var parts = strings[i].split("#");
      if (parts.length == 1) { // base2
        var objectID = parts[0];
        if (!/^base2/.test(objectID)) {
          objectID = "base2." + objectID;
        }
        requirements[objectID] = base2.host + objectID.replace(/\./g, "/") + ".js";
      } else { // 3rd party
        requirements[parts[1]] = parts[0];
      }
    }
  }
  return new Requirements(requirements, callback);
};

require.TIMEOUT = 10000; // 10 seconds

base2.exec = function(fn) {
  exec(fn, "");
};

base2.__ready = function(fn) {
  setTimeout(fn, 1);
};

function exec(fn, namespace) {
  fn.call(null,
    "var undefined,base2=$$base2[0].base2;" +
    base2.namespace +
    Enumerable.namespace +
    Function2.namespace +

    namespace +

    lang.namespace
  );
};

if (document) {
  if (document.addEventListener ) {
    document.addEventListener("DOMContentLoaded", function _checkReadyState() {
      _private.isReady = true;
      this.removeEventListener("DOMContentLoaded", _checkReadyState, false);
    }, false);
  }

  var host = location.pathname,
      scripts = document.getElementsByTagName("script"), script, lastScript,
      i = 0;
  while ((script = scripts[i++])) {
    if (script.id === "base2.js") break;
    if (script.src.indexOf("base2") !== -1) lastScript = script;
  }
  host = (script || lastScript || "").src || host;

  base2.host = host.replace(/[\?#].*$/, "").replace(/[^\/]*$/, "");

  base2.__ready = function(fn) {
    base2.require("dom", function() {
      deferUntil(fn, function(){return _private.isReady});
    });
  };
}

// =========================================================================
// base2/Requirements.js
// =========================================================================

var loadedScripts = {};

var Requirements = Collection.extend({
  constructor: function(requirements, callback) {
    this.base(requirements);

    var already = _private.isReady || "complete" === document.readyState; // Meh.

    var self = this;

    deferUntil(function() {
      exec(callback, self.reduce(function(namespace, requirement) {
        return namespace += requirement.object.namespace || "";
      }, ""));
      // Cater for occassions when scripts are required in the <head> but
      // the DOMContentLoaded event has passed before the required script is loaded.
      if (!already && _private.isReady && _private.dispatchReady) {
        _private.dispatchReady(document);
      }
    }, function() {
      self.invoke("tick");
      return self.every(function(requirement) {
        return requirement.object;
      });
    }, 0, require.TIMEOUT);
  }
}, {
  Item: {
    constructor: function(objectID, src) {
      this.tick = bind(new Function("try{this.object=" + objectID + "}catch(x){}"), this);
      this.tick();
      if (!this.object && src) this.load(src);
    },

    // Provide support for non-browser platforms later. -@DRE

    load: function(src) {
      throw new Error("base2.require is not supported on this platform.");
    },

    "@(document&&navigator)": {
      load: function(src) {
        // load the external script
        var script = document.createElement("script");
        script.src = src;
        if (!loadedScripts[script.src]) { // only load a script once
          loadedScripts[script.src] = true;
          var head = document.getElementsByTagName("head")[0] || document.documentElement;
          head.insertBefore(script, head.firstChild);
        }
        this.tick();
      }
    }
  }
});

})(this); // end: package

;;; base2.host = "/base2/trunk/src/build.php?src=";

base2.exec(function(namespace) { // begin: package

// =========================================================================
// dom/header.js
// =========================================================================

// Thanks to Diego Perini for help and inspiration.

/*@cc_on @*/

eval(namespace);

var _private = $$base2;

var document = global.document;

var _PREFIXES = "get,set,has,remove".split(",");

var _TEXT_CONTENT = detect("(element.textContent)") ? "textContent" : "innerText",
    _PARENT = detect("(element.parentElement)") ? "parentElement" : "parentNode";

var _USE_IFLAG      = /^(action|cite|codebase|data|dynsrc|href|longdesc|lowsrc|src|usemap|url)$/i,
    _USE_OUTER_HTML = /^(type|value)$/i; //-@DRE

var _MATCH_TYPE  = /type="?([^\s">]*)"?/i,
    _MATCH_VALUE = /value="?([^\s">]*)"?/i;

var _ATTRIBUTES = {
  "class": "className",
  "for": "htmlFor"
};

// These mappings are for MSIE5.x
var _HTML_ATTRIBUTES = // A lot of these attributes are deprecated in HTML5 and I could probably safely remove them. -@DRE
  "accessKey,allowTransparency,cellPadding,cellSpacing,codeBase,codeType,colSpan,dateTime,"+
  "frameBorder,longDesc,maxLength,noHref,noResize,noShade,noWrap,readOnly,rowSpan,tabIndex,useMap,vAlign";
// Convert the list of strings to a hash, mapping the lowercase name to the camelCase name.
extend(_ATTRIBUTES, Array2.combine(_HTML_ATTRIBUTES.toLowerCase().split(","), _HTML_ATTRIBUTES.split(",")));

var _createElement = document.createElement,
    _element = document.createElement("span"),
    _style   = _element.style;

var _boundElementIDs   = {},
    _removedAttributes = {},
    _lowerCaseTags     = {},
    _parents1          = [], // used by compareDocumentPosition()
    _classList_element = detect("(jscript<5.7)") ? "document[this._data]" : "this._data";

function _gecko_bind(node) {
  return extend(this.base(node), "removeEventListener", delegate(EventTarget.removeEventListener));
};

function _matchesSelector(element, selector) {
  var test = _cachedDOMQueries.test[selector];
  try {
    if (test) {
      return test(element);
    } else {
      return new Selector(selector).test(element);
    }
  } catch (x) {
    _throwSelectorError(selector, element)
  }
  return false;
};

// =========================================================================
// dom/Binding.js
// =========================================================================

// A Binding represents a real world object, not just an abstract interface.
// e.g Nodes, elements, events etc.

var Binding = Module.extend(null, {
  bind: function(object) {
    return extend(object, this.prototype);
  }
});

// =========================================================================
// dom/Node.js
// =========================================================================

// http://www.w3.org/TR/DOM-Level-3-Core/core.html#ID-1950641247

var Node = Binding.extend({
  // http://www.w3.org/TR/DOM-Level-3-Core/core.html#Node3-compareDocumentPosition
  "@!(element.compareDocumentPosition)" : {
    compareDocumentPosition: function(node1, node2) {
      if (node1 == node2) return 0;

      var child2,
          length1,
          i = 0,
          node = node1;

      _parents1.length = 0;
      while (node) {
        _parents1[i++] = node;
        node = node.parentNode;
        if (node == node2) return 10; // DOCUMENT_POSITION_PRECEDING|DOCUMENT_POSITION_CONTAINS
      }
      length1 = i;

      node = node2;
      while (node) {
        i = 0;
        while (i < length1) {
          if (node == _parents1[i]) {
            node = _parents1[i - 1];
            do {
              node = node.nextSibling;
              if (node == child2) return 4; // DOCUMENT_POSITION_FOLLOWING
            } while (node)
            return 2; // DOCUMENT_POSITION_PRECEDING
          }
          i++;
        }
        child2 = node;
        node = node.parentNode;
        if (node == node1) return 20; // DOCUMENT_POSITION_FOLLOWING|DOCUMENT_POSITION_IS_CONTAINED
      }

      return 33; // DOCUMENT_POSITION_DISCONNECTED|DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC
    }
  }
});

// =========================================================================
// dom/Element.js
// =========================================================================

// http://www.w3.org/TR/DOM-Level-3-Core/core.html#ID-745549614

// getAttribute() will return null if the attribute is not specified. This is
//  contrary to the specification but has become the de facto standard.

// Damn. Attributes are hard. All the browsers disagree on how it should be done.

detect("(element.className='test',element.expando=true)"); // Initialise feature detection

var Element = Node.extend({
  // The spec says return an empty string, most browsers disagree and return null.
  // base2 agrees with most browsers.
  "@(element.getAttribute('made-up')===''||element.getAttribute('id')!=null||element.getAttribute('expando'))": {
    getAttribute: _getAttribute,
    hasAttribute: _hasAttribute
  },

  // MSIE5-7 has its own dictionary of attribute names
  "@!(element.getAttribute('class'))": {
    "@(jscript)": {
      removeAttribute: function(element, name) {
        name = _ATTRIBUTES[name.toLowerCase()] || name;
        if (!(document.documentMode >= 8) && typeof element[name] == "boolean") {
          element[name] = false;
          _removedAttributes[element.uniqueID + "." + name] = true;
        } else {
          var method = "removeAttribute";
          if (element["_" + method]) method = "_" + method;
          element[method](name);
        }
      },

      setAttribute: function(element, name, value) {
        name = _ATTRIBUTES[name.toLowerCase()] || name;
        if (name === "style") {
          element.style.cssText = value;
        } else if (!(document.documentMode >= 8) && typeof element[name] == "boolean") {
          element[name] = true;
          delete _removedAttributes[element.uniqueID + "." + name];
        } else {
          var method = "setAttribute";
          if (element["_" + method]) method = "_" + method;
          element[method](name, String(value));
        }
      }
    },

    "@!(jscript)": {
      removeAttribute: function(element, name) {
        this.base(element, _ATTRIBUTES[name.toLowerCase()] || name);
      },

      setAttribute: function(element, name, value) {
        this.base(element, _ATTRIBUTES[name.toLowerCase()] || name, value);
      }
    }
  },

  "@!(element.hasAttribute)": {
    hasAttribute: _hasAttribute
  },

  "@(element.matchesSelector)": {
    matchesSelector: function(element, selector) {
      if (!_USE_BASE2.test(selector)) {
        try {
          return this.base(element, selector);
        } catch (x) {
          // assume it's an unsupported selector
        }
      }
      return _matchesSelector(element, selector);
    }
  },

  "@!(element.matchesSelector)": {
    matchesSelector: _matchesSelector
  }
}, {
  "@Gecko": {
    bind: _gecko_bind
  }
});

function _getAttribute(element, name) {
  name = _ATTRIBUTES[name.toLowerCase()] || name;

  var attribute = element.getAttributeNode ? element.getAttributeNode(name) : element.attributes[name],
      specified = attribute && attribute.specified;

  /*@if (@_jscript)
    if (element[name] && typeof element[name] == "boolean") return name.toLowerCase();
    if (_removedAttributes[element.uniqueID + "." + name]) return null;
    if (element.nodeName === "INPUT" && _USE_OUTER_HTML.test(name)) {
      var outerHTML = element.outerHTML;
      if (outerHTML) {
        with (outerHTML) outerHTML = slice(0, indexOf(">") + 1);
        return match(outerHTML, name === "type" ? _MATCH_TYPE : _MATCH_VALUE)[1] || null;
      }
    }
    if ((specified && _USE_IFLAG.test(name)) || (!attribute && @_jscript_version < 5.6)) {
      var method = "getAttribute";
      if (element["_" + method]) method = "_" + method;
      return element[method](name, 2);
    }
    if (name === "style") return element.style.cssText.toLowerCase() || null;
  /*@end @*/

  return specified ? String(attribute.nodeValue) : null;
};

function _hasAttribute(element, name) {
  return _getAttribute(element, name) != null;
};

// =========================================================================
// dom/Document.js
// =========================================================================

var Document = Node.extend(null, {
  bind: function(document) {
    extend(document, "createElement", function(tagName) {
      return dom.bind(this.base(tagName));
    });
    //extend(document, "createDocumentFragment", function() { // throws an error in IE5.5
    //  return dom.bind(this.base());
    //});
    if (!document.defaultView) {
      document.defaultView = Traversal.getDefaultView(document);
    }
    AbstractView.bind(document.defaultView);
    return this.base(document);
  },

  "@Gecko": {
    bind: _gecko_bind
  }
});

// =========================================================================
// dom/DocumentFragment.js
// =========================================================================

// http://www.w3.org/TR/DOM-Level-3-Core/core.html#ID-B63ED1A3

var DocumentFragment = Node.extend();

// =========================================================================
// dom/Traversal.js
// =========================================================================

// DOM Traversal. Just the basics.
var Traversal = Module.extend({
  contains: _contains,

  getFirstElementChild: function(node) {
    return _getElementChild(node, "first");
  },

  getLastElementChild: function(node) {
    return _getElementChild(node, "last");
  },

  getNextElementSibling: function(node) {
    return _getElementSibling(node, "next");
  },

  getNodeIndex: function(node) {
    var index = 0;
    while (node && (node = node.previousSibling)) index++;
    return index;
  },

  getOwnerDocument: function(node) {
    return node.ownerDocument;
  },

  getPreviousElementSibling: function(node) {
    return _getElementSibling(node, "previous");
  },

  getTextContent: function(node, isHTML) {
    return node[node.nodeType === 1 ? isHTML ? "innerHTML" : _TEXT_CONTENT : "nodeValue"];
  },

  includes: function(node, target) {
    return !!target && (node == target || _contains(node, target));
  },

  isEmpty: _isEmpty,

  setTextContent: function(node, text, isHTML) {
    node[node.nodeType === 1 ? isHTML ? "innerHTML" : _TEXT_CONTENT : "nodeValue"] = text;
  },

  "@(jscript<5.6)": {
    getOwnerDocument: function(node) {
      return node.document.parentWindow.document;
    }
  }
}, {
  TEXT_CONTENT: _TEXT_CONTENT,

  getDefaultView: function(nodeOrWindow) {
    // return the document object
    return (nodeOrWindow.ownerDocument || nodeOrWindow.document || nodeOrWindow).defaultView;
  },

  getDocument: function(nodeOrWindow) {
    // return the document object
    return this.isDocument(nodeOrWindow) ? nodeOrWindow
      : nodeOrWindow.nodeType ? this.getOwnerDocument(nodeOrWindow) : nodeOrWindow.document;
  },

  isDocument: function(node) {
    return !!node && node.nodeType === 9;
  },

  isElement: function(node) {
    return !!node && node.nodeType === 1;
  },

  isXML: function(node) {
    return !this.getDocument(node).getElementById;
  },

  "@!(document.defaultView)": {
    getDefaultView: function(nodeOrWindow) {
      return (nodeOrWindow.document || nodeOrWindow).parentWindow;
    }
  },

  "@(jscript<5.6)": {
    isDocument: function(node) {
      return !!(node && (node.nodeType === 9 || node.getElementById));
    },

    isElement: function(node) {
      return !!node && node.nodeType === 1 && node.nodeName !== "!";
    }
  }
});

function _contains(node, target) {
  while (target && (target = target.parentNode) && node != target) continue;
  return !!target;
};

function _getElementChild(node, type) {
  node = node[type + "Child"];
  if (!node) return null;
  if (node.nodeType === 1)
  /*@if (@_jscript_version < 5.6)
    if (node.nodeName !== "!")
  /*@end @*/
    return node;
  return _getElementSibling(node, type === "first" ? "next" : "previous");
};

function _getElementSibling(node, type) {
  type += "Sibling";
  do {
    node = node[type];
    if (node && node.nodeType === 1)
    /*@if (@_jscript_version < 5.6)
      if (node.nodeName !== "!")
    /*@end @*/
      break;
  } while (node);
  return node;
};

function _isEmpty(node) {
  node = node.firstChild;
  while (node) {
    if (node.nodeType === 3) return false;
    if (node.nodeType === 1)
    /*@if (@_jscript_version < 5.6)
      if (node.nodeName !== "!")
    /*@end @*/
      return false;
    node = node.nextSibling;
  }
  return true;
};

// =========================================================================
// dom/views/AbstractView.js
// =========================================================================

var AbstractView = Binding.extend();

// =========================================================================
// dom/views/implementations.js
// =========================================================================

// none

// =========================================================================
// dom/events/header.js
// =========================================================================

// TO DO: textInput event

var _CAPTURING_PHASE = 1,
    _AT_TARGET       = 2,
    _BUBBLING_PHASE  = 3;


var _BUTTON_MAP      = {"2": 2, "4": 1},
    _EVENT_MAP       = {focusin: "focus", focusout: "blur"},
    _MOUSE_BUTTON    = /^mouse(up|down)|click$/,
    _MOUSE_CLICK     = /click$/,
    _NO_BUBBLE       = /^((before|un)?load|focus|blur|stop|(readystate|property|filter)change|losecapture)$/,
    _CANCELABLE      = /^((dbl)?click|mouse(down|up|over|out|wheel)|key(down|up|press)|submit|DOMActivate|(before)?(cut|copy|paste)|contextmenu|drag(start|enter|over)?|drop|before(de)?activate)$/,
    _CANNOT_DELEGATE = /^(abort|error|load|scroll|(readystate|property|filter)change)$/;
    //_CAN_DELEGATE = /^(submit|reset|select|change|blur)$|^(mouse|key|focus)|click$/;

var _wrappedListeners = {},
    _wrappedTypes = extend({}, {
  DOMContentLoaded: "base2ContentLoaded",
  mouseenter: "mouseover",
  mouseleave: "mouseout",
  "@Gecko": {
    mousewheel: "DOMMouseScroll"
  }
});

function _wrap(type, listener, wrapper) {
  var key = type + "#" + assignID(listener);
  if (!_wrappedListeners[key]) {
    _wrappedListeners[key] = wrapper;
  }
  return _wrappedListeners[key];
};

function _unwrap(type, listener) {
  return _wrappedListeners[type + "#" + listener.base2ID] || listener;
};

function _handleEvent(target, listener, event) {
  if (typeof listener == "function") {
    listener.call(target, event);
  } else {
    listener.handleEvent(event);
  }
};

// break out of clsoures to attach events in MSIE
if (!_private.listeners) extend(_private, {
  suppress: {},
  listeners: {},
  handlers: {},

  attachEvent: function(target, type, listener) {
    var listenerID = assignID(listener);
    var handleEvent = this.handlers[listenerID];
    if (!handleEvent) {
      this.listeners[listenerID] = listener;
      handleEvent = this.handlers[listenerID] = new Function("e", "$$base2.listeners['" + listenerID + "'](e)");
    }
    target.attachEvent(type, handleEvent);
  },

  detachEvent: function(target, type, listener, permanent) {
    var listenerID = listener.base2ID;
    target.detachEvent(type, this.handlers[listenerID]);
    if (permanent) {
      delete this.listeners[listenerID];
      delete this.handlers[listenerID];
    }
  }
});

// =========================================================================
// dom/events/Event.js
// =========================================================================

// http://www.w3.org/TR/DOM-Level-2-Events/events.html#Events-Event

var Event = Binding.extend({
  "@!(document.createEvent)": {
    initEvent: function(event, type, bubbles, cancelable) {
      event.type = String(type);
      event.bubbles = !!bubbles;
      event.cancelable = !!cancelable;
    },

    stopPropagation: function(event) {
      event.cancelBubble = true;
    },

    preventDefault: function(event) {
      if (event.cancelable !== false) event.returnValue = false;
      if (event.type == "mousedown") { // cancel a mousedown event
        var body = Traversal.getDocument(event.target).body;
        var onbeforedeactivate = function(event) {
          _private.detachEvent(body, "onbeforedeactivate", onbeforedeactivate, true);
          event.returnValue = false;
        };
        _private.attachEvent(body, "onbeforedeactivate", onbeforedeactivate);
      }
    }
  }
}, {
  cloneEvent: function(event) {
    if (event.isClone) return event;
    var clone = copy(event);
    clone.isClone = true;
    clone.stopPropagation = function() {
      event.stopPropagation();
      this.cancelBubble = true;
    };
    clone.preventDefault = function() {
      event.preventDefault();
      this.returnValue = false;
    };
    return clone;
  },

  "@!(document.createEvent)": {
    bind: function(event) {
      if (!event.timeStamp) {
        event.bubbles = !_NO_BUBBLE.test(event.type);
        event.cancelable = _CANCELABLE.test(event.type);
        event.timeStamp = new Date().valueOf();
      }
      event.relatedTarget = event[(event.target == event.fromElement ? "to" : "from") + "Element"];
      return this.base(event);
    }
  }
});

// =========================================================================
// dom/events/EventDispatcher.js
// =========================================================================

// this enables a real execution context for each event.
if (detect.MSIE && !detect("element.dispatchEvent")) {
  var _fire = document.createElement(/^CSS/.test(document.compatMode) ? "meta" : "marquee"),
      _base2Event = _private.base2Event = {};

  _fire.base2Events = 0;
  _fire.attachEvent("onpropertychange", new Function('e', '\
if (e.propertyName=="base2Events"){\
var d=$$base2.base2Event;\
if(typeof d.listener=="function")d.listener.call(d.target,d.event);\
else d.listener.handleEvent(d.event);\
delete d.target;delete d.event;delete d.listener\
}'));

  document.getElementsByTagName("head")[0].appendChild(_fire);

  var EventDispatcher = Base.extend({
    constructor: function(state) {
      this.state = state;
    },

    dispatch: function(nodes, event, phase, map) {
      event.eventPhase = phase;
      var i = nodes.length;
      while (i-- && !event.cancelBubble) {
        var target = nodes[i],
            listeners = map[target.nodeType === 1 ? target.uniqueID : target.base2ID];
        if (listeners) {
          listeners = copy(listeners);
          event.currentTarget = target;
          event.eventPhase = target == event.target ? _AT_TARGET : phase;
          for (var listenerID in listeners) {
            _base2Event.event = event;
            _base2Event.target = target;
            _base2Event.listener = listeners[listenerID];
            _fire.base2Events++; // dispatch the event
            if (event.returnValue === false) {
              event.preventDefault();
            }
          }
        }
      }
    },

    handleEvent: function(event) {
      event = Event.cloneEvent(Event.bind(event));
      var type = event.type;
      if (_EVENT_MAP[type]) {
        type = event.type = _EVENT_MAP[type];
        event.bubbles = !_NO_BUBBLE.test(type);
      }

      var typeMap = this.state.events[type];
      if (typeMap && !_private.suppress[type]) {
        // Fix the mouse button (left=0, middle=1, right=2)
        if (_MOUSE_BUTTON.test(type)) {
          var button = _MOUSE_CLICK.test(type) ? this.state._button : event.button;
          event.button = _BUTTON_MAP[button] || 0;
        }

        // Collect nodes in the event hierarchy
        var target = event.target, nodes = [], i = 0;
        while (target) {
          nodes[i++] = target;
          target = target.parentNode;
        }
        /*@if (@_jscript_version < 5.6)
        if (nodes[0].nodeType === 1 && !nodes[i - 1].documentElement) {
          nodes[i] = Traversal.getDocument(nodes[0]);
        }
        /*@end @*/

        // Dispatch.
        var map = typeMap[_CAPTURING_PHASE];
        if (map) this.dispatch(nodes, event, _CAPTURING_PHASE, map);
        map = typeMap[_BUBBLING_PHASE];
        if (map && !event.cancelBubble) {
          if (event.bubbles) {
            nodes.reverse();
          } else {
            nodes.length = 1;
          }
          this.dispatch(nodes, event, _BUBBLING_PHASE, map);
        }
      }
      return event.returnValue !== false;
    }
  });
}

// =========================================================================
// dom/events/EventTarget.js
// =========================================================================

// http://www.w3.org/TR/DOM-Level-2-Events/events.html#Events-Registration-interfaces

var EventTarget = Module.extend({
  "@!(element.addEventListener)": {
    addEventListener: function(target, type, listener, useCapture) {
      var documentState = _DocumentState.getInstance(target);

      // assign a unique id to both objects
      var targetID = assignID(target),
          listenerID = assignID(listener),
      // create a hash table of event types for the target object
          phase = useCapture ? _CAPTURING_PHASE : _BUBBLING_PHASE,
          typeMap = documentState.registerEvent(type, target),
          phaseMap = typeMap[phase];

      if (!phaseMap) phaseMap = typeMap[phase] = {};
      // create a hash table of event listeners for each object/event pair
      var listeners = phaseMap[targetID];
      if (!listeners) listeners = phaseMap[targetID] = {};
      // store the event listener in the hash table
      listeners[listenerID] = listener;
    },

    dispatchEvent: function(target, event) {
      event.target = target;
      event._userGenerated = true;
      return _DocumentState.getInstance(target).handleEvent(event);
    },

    removeEventListener: function(target, type, listener, useCapture) {
      var events = _DocumentState.getInstance(target).events;
      // delete the event listener from the hash table
      var typeMap = events[type];
      if (typeMap) {
        var phaseMap = typeMap[useCapture ? _CAPTURING_PHASE : _BUBBLING_PHASE];
        if (phaseMap) {
          var listeners = phaseMap[target.nodeType === 1 ? target.uniqueID : target.base2ID];
          if (listeners) delete listeners[listener.base2ID];
        }
      }
    }
  },

  addEventListener: function(target, type, listener, useCapture) {
    var originalListener = listener;
    if (type == "DOMContentLoaded") {
      listener = _wrap(type, originalListener, function(event) {
        event = Event.cloneEvent(event);
        event.type = type;
        event.bubbles = event.cancelable = false;
        EventTarget.removeEventListener(target, type, originalListener, useCapture);
        _handleEvent(this, originalListener, event);
      });
    } else if (type == "mouseenter" || type == "mouseleave") {
      listener = _wrap(type, originalListener, function(event) {
        if (Traversal.includes(this, event.target) && !Traversal.includes(this, event.relatedTarget)) {
          event = copy(event);
          event.target = this;
          event.type = type;
          event.bubbles = event.cancelable = false;
          _handleEvent(this, originalListener, event);
        }
      });
    }
    this.base(target, _wrappedTypes[type] || type, listener, useCapture);
  },

  removeEventListener: function(target, type, listener, useCapture) {
    this.base(target, _wrappedTypes[type] || type, _unwrap(type, listener), useCapture);
  },

  "@Gecko": {
    addEventListener: function(target, type, listener, useCapture) {
      if (type == "mousewheel") {
        var originalListener = listener;
        listener = _wrap(type, originalListener, function(event) {
          event = Event.cloneEvent(event);
          event.type = type;
          event.wheelDelta = (-event.detail * 40) || 0;
          _handleEvent(this, originalListener, event);
        });
      }
      this.base(target, type, listener, useCapture);
    }
  },

  "@Gecko1\\.[0-3]|Webkit[1-4]|KHTML3": {
    addEventListener: function(target, type, listener, useCapture) {
      if (/^mouse/.test(type)) {
        var originalListener = listener;
        listener = _wrap(type, originalListener, function(event) {
          try {
            if (event.target.nodeType == 3) {
              event = Event.cloneEvent(event);
              event.target = event.target.parentNode;
            }
          } catch (x) {
            // sometimes the target is an anonymous node, ignore these
            return;
          }
          _handleEvent(this, originalListener, event);
        });
      }
      this.base(target, type, listener, useCapture);
    }
  },

  // http://unixpapa.com/js/mouse.html
  "@Webkit[1-4]|KHTML3": {
    addEventListener: function(target, type, listener, useCapture) {
      var originalListener = listener;
      if (_MOUSE_BUTTON.test(type)) {
        listener = _wrap(type, originalListener, function(event) {
          var button = _BUTTON_MAP[event.button] || 0;
          if (event.button != button) {
            event = Event.cloneEvent(event);
            event.button = button;
          }
          _handleEvent(this, originalListener, event);
        });
      } else if (typeof listener == "object") {
        listener = _wrap(type, originalListener, bind("handleEvent", listener));
      }
      this.base(target, type, listener, useCapture);
    }
  },

  // http://unixpapa.com/js/key.html
  "@Linux|Mac|Opera": {
    addEventListener: function(target, type, listener, useCapture) {
      // Some browsers do not fire repeated "keydown" events when a key
      // is held down. They do fire repeated "keypress" events though.
      // Cancelling the "keydown" event does not cancel the repeated
      // "keypress" events. We fix all of this here...
      if (type == "keydown") {
        var originalListener = listener;
        listener = _wrap(type, originalListener, function(keydownEvent) {
          var firedCount = 0, cancelled = false;
          extend(keydownEvent, "preventDefault", function() {
            this.base();
            cancelled = true;
          });
          function handleEvent(event) {
            if (cancelled) event.preventDefault();
            if (event == keydownEvent || firedCount > 1) {
              _handleEvent(this, originalListener, keydownEvent);
            }
            firedCount++;
          };
          var onkeyup = function() {
            this.removeEventListener("keypress", handleEvent, true);
            this.removeEventListener("keyup", onkeyup, true);
          };
          handleEvent.call(this, keydownEvent);
          this.addEventListener("keyup", onkeyup, true);
          this.addEventListener("keypress", handleEvent, true);
        });
      }
      this.base(target, type, listener, useCapture);
    }
  }
});

if (detect("Gecko")) { // this needs to be here
  delete EventTarget.prototype.removeEventListener;
}

// =========================================================================
// dom/events/DocumentEvent.js
// =========================================================================

// http://www.w3.org/TR/DOM-Level-2-Events/events.html#Events-DocumentEvent

var DocumentEvent = Module.extend({
  "@!(document.createEvent)": {
    createEvent: function(document, type) {
      return Event({
        bubbles: false,
        cancelable: false,
        eventPhase: 0,
        target: document,
        currentTarget: null,
        relatedTarget: null,
        timeStamp: new Date().valueOf()
      });
    }
  },

  "@(document.createEvent)": {
    "@!(document.createEvent('Events'))": { // before Safari 3
      createEvent: function(document, type) {
        return this.base(document, type == "Events" ? "UIEvents" : type);
      }
    }
  }
});

// =========================================================================
// dom/events/DOMContentLoadedEvent.js
// =========================================================================

// http://dean.edwards.name/weblog/2006/06/again

var DOMContentLoadedEvent = Base.extend({
  constructor: function(document) {
    var fired = false,
        self  = this;
    this.fire = function() {
      if (document == global.document) _private.isReady = true;
      if (!fired) {
        fired = true;
        if (!self.__constructing) _private.dispatchReady(document);
      }
    };
    if ("complete" === document.readyState) this.fire();
    else this.listen(document);
  },

  listen: function(document) {
    // if all else fails fall back on window.onload
    EventTarget.addEventListener(Traversal.getDefaultView(document), "load", this.fire, false);
  },

  "@(document.addEventListener)": {
    constructor: function(document) {
      this.base(document);
      // use the real event for browsers that support it
      var self = this;
      document.addEventListener("DOMContentLoaded", function _listen() {
        document.removeEventListener("DOMContentLoaded", _listen, false);
        self.fire();
      }, false);
    }
  },

  "@MSIE": {
    listen: function(document) {
      deferUntil(this.fire, function() {
        // Diego Perini: http://javascript.nwbox.com/IEContentLoaded/
        return document.body && (document.body.doScroll("left") || true);
      }, 0);
    }
  },

  "@KHTML": {
    listen: function(document) {
      this.base(document);
      deferUntil(this.fire, function() {
        return /loaded|complete/.test(document.readyState);
      }, 0);
    }
  }
});

_private.dispatchReady = function(document) {
  var event = DocumentEvent.createEvent(document, "Events");
  Event.initEvent(event, "base2ContentLoaded", false, false);
  EventTarget.dispatchEvent(document, event);
};

// =========================================================================
// dom/events/implementations.js
// =========================================================================

Document.implement(DocumentEvent);

Document.implement(EventTarget);
Element.implement(EventTarget);

// =========================================================================
// dom/style/header.js
// =========================================================================

var _NUMBER  = /\d/,
    _PIXEL   = /\dpx$/i,
    _METRICS = /(width|height|top|bottom|left|right|fontSize)$/i,
    _COLOR   = /color$/i;

var _DASH = /\-/,
    _DASH_LOWER = /\-([a-z])/g,
    _CHAR_UPPER = /[A-Z]/g;

var _NAMED_BORDER_WIDTH = {
  thin: 1,
  medium: 2,
  thick: 4
};

var _SPECIAL = {
  "@MSIE": {
    opacity: 1,
    cursor: 1
  }
};

var _CALCULATED_STYLE_PROPERTIES = "backgroundPosition,boxSizing,clip,cssFloat,opacity".split(",");

function _getPropertyName(propertyName, asAttribute) {
  propertyName += "";
  if (propertyName === "float" || propertyName === "cssFloat" || propertyName === "styleFloat") {
    return asAttribute ? "float" : _style.cssFloat == null ? "styleFloat" : "cssFloat";
  }
  if (_DASH.test(propertyName)) {
    propertyName = propertyName.replace(_DASH_LOWER, _toUpperCase);
  }
  if (_style[propertyName] == null) {
    var borderRadiusCorner = /^border(\w+)Radius$/;
    if (ViewCSS.prefix === "Moz" && borderRadiusCorner.test(propertyName)) {
      propertyName = propertyName.replace(borderRadiusCorner, function(match, corner) {
        return "borderRadius" + corner.charAt(0) + corner.slice(1).toLowerCase();
      });
    }
    var vendorPropertyName = ViewCSS.prefix + propertyName.charAt(0).toUpperCase() + propertyName.slice(1);
    if (_style[vendorPropertyName] != null) {
      propertyName = vendorPropertyName;
    }
  }
  if (asAttribute) {
    propertyName = propertyName.replace(_CHAR_UPPER, _dash_lower);
  }
  return propertyName;
};

function _dash_lower(chr) {
  return "-" + chr.toLowerCase();
};

var _toUpperCase = flip(String2.toUpperCase),
    _parseInt16  = partial(parseInt, undefined, 16);

function _MSIE_getPixelValue(element, value) {
  var styleLeft = element.style.left;
  var runtimeStyleLeft = element.runtimeStyle.left;
  element.runtimeStyle.left = element.currentStyle.left;
  element.style.left = value;
  value = element.style.pixelLeft;
  element.style.left = styleLeft;
  element.runtimeStyle.left = runtimeStyleLeft;
  return value + "px";
};

var _colorDocument;
/*@if (@_jscript)
  try {
    _colorDocument = new ActiveXObject("htmlfile");
    _colorDocument.write("");
    _colorDocument.close();
  } catch (x) {
    if (global.createPopup) {
      _colorDocument = createPopup().document;
    }
  }
/*@end @*/

var _MSIE_getColorValue = _colorDocument ? function(color) {
  var body  = _colorDocument.body,
      range = body.createTextRange();
  body.style.color = color.toLowerCase();
  var value = range.queryCommandValue("ForeColor");
  return format("rgb(%1, %2, %3)", value & 0xff, (value & 0xff00) >> 8,  (value & 0xff0000) >> 16);
} : I;

function _toRGB(value) {
  if (value.indexOf("rgb") === 0) return value.replace(/(\d)\s,/g, "$1,");
  if (value.indexOf("#") !== 0) return value;
  var hex = value.slice(1);
  if (hex.length === 3) hex = hex.replace(/(\w)/g, "$1$1");
  return "rgb(" + Array2.map(hex.match(/(\w\w)/g), _parseInt16).join(", ") + ")";
};

// =========================================================================
// dom/style/ViewCSS.js
// =========================================================================

// http://www.w3.org/TR/DOM-Level-2-Style/css.html#CSS-ViewCSS

var ViewCSS = Module.extend({
  "@!(document.defaultView.getComputedStyle)": {
    getComputedStyle: function(view, element, pseudoElement) {
      // pseudoElement parameter is not supported
      var currentStyle  = element.currentStyle,
          computedStyle = _CSSStyleDeclaration_ReadOnly.bind({});

      for (var propertyName in currentStyle) {
        if (_METRICS.test(propertyName) || _COLOR.test(propertyName)) {
          computedStyle[propertyName] = this.getComputedPropertyValue(view, element, propertyName);
        } else if (propertyName.indexOf("ruby") !== 0) {
          computedStyle[propertyName] = currentStyle[propertyName];
        }
      }
      for (var i = 0; propertyName = _CALCULATED_STYLE_PROPERTIES[i]; i++) {
        computedStyle[propertyName] = this.getComputedPropertyValue(view, element, propertyName);
      }
      return computedStyle;
    }
  },

  "@(getComputedStyle(document.documentElement,null).color.charAt(0)==='#')": {
    getComputedStyle: function(view, element, pseudoElement) {
      var computedStyle = this.base(view, element, pseudoElement),
          fixedStyle = pcopy(computedStyle);
      for (var propertyName in computedStyle) {
        if (_COLOR.test(propertyName)) {
          fixedStyle[propertyName] = _toRGB(computedStyle[propertyName]);
        } else if (typeof computedStyle[propertyName] == "function") {
          fixedStyle[propertyName] = bind(propertyName, computedStyle);
        }
      }
      return fixedStyle;
    }
  }
}, {
  prefix: "",
  "@Gecko":  {prefix: "Moz"},
  "@KHTML":  {prefix: "Khtml"},
  "@Webkit": {prefix: "Webkit"},
  "@Opera":  {prefix: "O"},
  "@MSIE":   {prefix: "Ms"},

  getComputedPropertyValue: function(view, element, propertyName) {
    var value = CSSStyleDeclaration.getPropertyValue(this.getComputedStyle(view, element, null), propertyName);
    if (_COLOR.test(propertyName)) value = _toRGB(value);
    return value;
  },

  "@!(document.defaultView.getComputedStyle)": {
    getComputedPropertyValue: function(view, element, propertyName) {
      var currentStyle = element.currentStyle,
          value = currentStyle[propertyName];

      if (value == null) {
        propertyName = _getPropertyName(propertyName);
        value = currentStyle[propertyName] || "";
      }

      switch (propertyName) {
        case "float":
        case "cssFloat":
          return currentStyle.cssFloat || currentStyle.styleFloat || "";

        case "cursor":
          return value === "hand" ? "pointer" : value;

        case "opacity":
          return value === "" ? "1" : value;

        case "clip":
          return "rect(" + [
            currentStyle.clipTop,
            currentStyle.clipRight,
            currentStyle.clipBottom,
            currentStyle.clipLeft
          ].join(", ") + ")";

        case "backgroundPosition":
          return currentStyle.backgroundPositionX + " " + currentStyle.backgroundPositionY;

        case "boxSizing":
          return value === ""
            ? /^CSS/.test(Traversal.getDocument(element).compatMode)
              ? "content-box"
              : "border-box"
            : value;
      }

      if (value.indexOf(" ") > 0) return value;

      if (_METRICS.test(propertyName)) {
        if (_PIXEL.test(value)) return value;
        if (value === "auto") return "0px";
        if (propertyName.indexOf("border") === 0) {
          if (currentStyle[propertyName.replace("Width", "Style")] === "none") return "0px";
          value = _NAMED_BORDER_WIDTH[value] || value;
          if (typeof value == "number") return value + "px";
        }
        /*@if (@_jscript)
          if (_NUMBER.test(value)) return _MSIE_getPixelValue(element, value);
        /*@end @*/
      } else if (_COLOR.test(propertyName)) {
        if (value === "transparent") return value;
        if (/^(#|rgb)/.test(value)) return _toRGB(value);
        /*@if (@_jscript)
          return _MSIE_getColorValue(value);
        /*@end @*/
      }

      return value;
    }
  }
});

// =========================================================================
// dom/style/CSSStyleDeclaration.js
// =========================================================================

// http://www.w3.org/TR/DOM-Level-2-Style/css.html#CSS-CSSStyleDeclaration

var _CSSStyleDeclaration_ReadOnly = Binding.extend({
  getPropertyValue: function(style, propertyName) {
    if (style[propertyName] == null) propertyName = _getPropertyName(propertyName);
    return style[propertyName] || "";
  },

  "@MSIE5": {
    getPropertyValue: function(style, propertyName) {
      if (style[propertyName] == null) propertyName = _getPropertyName(propertyName);
      var value = style[propertyName];
      if (propertyName == "cursor" && value === "hand") {
        value = "pointer";
      }
      return value || "";
    }
  }
});

var CSSStyleDeclaration = _CSSStyleDeclaration_ReadOnly.extend({
  setProperty: function(style, propertyName, value, priority) {
    if (style[propertyName] == null) propertyName = _getPropertyName(propertyName);
    if (priority) {
      this.base(style, propertyName.replace(_CHAR_UPPER, _dash_lower), value, priority);
    } else {
      style[propertyName] = value;
    }
  },

  "@!(style['setProperty'])": {
    setProperty: function(style, propertyName, value, priority) {
      if (style[propertyName] == null) propertyName = _getPropertyName(propertyName);
      /*@if (@_jscript)
        if (@_jscript_version < 5.6 && propertyName == "cursor" && value == "pointer") {
          value = "hand";
        } else if (propertyName == "opacity") {
          style.zoom = "100%";
          style.filter = "alpha(opacity=" + Math.round(value * 100) + ")";
        }
      /*@end @*/
      if (priority == "important") {
        style.cssText += format(";%1:%2!important;", propertyName.replace(_CHAR_UPPER, _dash_lower), value);
      } else {
        style[propertyName] = String(value);
      }
    }
  }
}, {
  getPropertyName: _getPropertyName,

  setProperties: function(style, properties) {
    properties = extend({}, properties);
    for (var propertyName in properties) {
      var value = properties[propertyName];
      if (style[propertyName] == null) propertyName = _getPropertyName(propertyName);
      if (typeof value == "number" && _METRICS.test(propertyName)) value += "px";
      if (_SPECIAL[propertyName]) {
        this.setProperty(style, propertyName, value, "");
      } else {
        style[propertyName] = value;
      }
    }
  }
});

// =========================================================================
// dom/style/implementations.js
// =========================================================================

AbstractView.implement(ViewCSS);

// =========================================================================
// dom/selectors-api/header.js
// =========================================================================

// Many thanks to Diego Perini for testing and inspiration.
// His NWMatcher is awesome: http://javascript.nwbox.com/NWMatcher/

var _USE_BASE2 = detect("(input.getAttribute('type')=='text')") ? /:visited|\[|\b(object|param)\b/i : /:visited/; // security

var _SORTER = detect("(element.compareDocumentPosition)") ? function(a, b) {
  return (a.compareDocumentPosition(b) & 2) - 1;
} : document.createRange ? function(a, b) { // Stolen shamelessly from jQuery. I'm allowed. ;)
		var document = a.ownerDocument,
        aRange = document.createRange(),
        bRange = document.createRange();
		aRange.selectNode(a);
		aRange.collapse(true);
		bRange.selectNode(b);
		bRange.collapse(true);
		return aRange.compareBoundaryPoints(Range.START_TO_END, bRange);
} : function(a, b) {
  return (Node.compareDocumentPosition(a, b) & 2) - 1;
};

function _SORT_BY_INDEX(a, b) {
  return a.sourceIndex - b.sourceIndex;
};

var _CSS_ESCAPE =           /'(\\.|[^'\\])*'|"(\\.|[^"\\])*"|\\./g,
    _CSS_ESCAPE_TEXT =      /:contains\([^\)]+\)|\[[^\]]+\]/g,
    _CSS_IMPLIED_ASTERISK = /([\s>+~,]|[^(]\+|^)([#.:\[])/g,
    _CSS_IMPLIED_SPACE =    /(^|,)([^\s>+~])/g,
    _CSS_TRIM =             /\s*([\^*~|$]?=|[\s>+~,]|^|$)\s*/g,
    _CSS_LTRIM =            /\s*([\])])/g,
    _CSS_RTRIM =            /([\[(])\s*/g,
    _CSS_UNESCAPE =         /\x01(\d+)\x01/g,
    _CSS_CONTEXT =          /^ \*?/g,
    _QUOTE =                /'/g;

var _COMBINATOR = /^[\s>+~]$/;

var _NOT_XML = _makeSelectorRegExp(":(checked|disabled|enabled|selected|hover|active|focus|link|visited|target)");

// http://dean.edwards.name/weblog/2009/12/getelementsbytagname/
function _getElementsByTagName(node, tagName) {
  var elements = [], i = 0,
      anyTag = tagName === "*",
      next = node.firstChild;
  while ((node = next)) {
    if (
      anyTag
        ? node.nodeType === 1
        /*@if (@_jscript_version < 5.6)
          && node.nodeName !== "!"
        /*@end @*/
        : node.nodeName === tagName
    ) elements[i++] = node;
    next = node.firstChild || node.nextSibling;
    while (!next && (node = node.parentNode)) next = node.nextSibling;
  }
  return elements;
};

function _makeSelectorRegExp(pattern, flags) {
  return new RegExp(pattern.replace(/ID/g, "\\w\u00a1-\ufffe\uffff\\-\\x01"), flags || "");
};

function _nthChild(match, args, position, last, not, and, mod, equals) {
  // Ugly but it works for both CSS and XPath
  last = /last/i.test(match) ? last + "+1-" : "";
  if (!isNaN(args)) args = "0n+" + args;
  else if (args === "even") args = "2n";
  else if (args === "odd") args = "2n+1";
  args = args.split("n");
  var a = ~~(args[0] ? (args[0] === "-") ? -1 : args[0] : 1);
  var b = ~~args[1];
  var negate = a < 0;
  if (negate) {
    a = -a;
    if (a === 1) b++;
  }
  var query = format(a === 0 ? "%3%7" + (last + b) : "(%4%3-(%2))%6%1%70%5%4%3>=%2", a, b, position, last, and, mod, equals);
  if (negate) query = not + "(" + query + ")";
  return query;
};

// IE confuses the name attribute with id for some elements.
// Use document.all to retrieve elements with name/id instead.
var id = "base2_" + Date2.now(),
    root = document.documentElement;
_element.innerHTML = '<a name="' + id + '"></a>';
root.insertBefore(_element, root.firstChild);
var _BUGGY_BY_ID = document.getElementById(id) == _element.firstChild;
root.removeChild(_element);

var _byId = _BUGGY_BY_ID && document.all ? function(document, id) {
  var result = document.all[id] || null;
  // Returns a single element or a collection.
  if (!result || (result.nodeType && _getAttribute(result, "id") === id)) return result;
  // document.all has returned a collection of elements with name/id
  for (var i = 0; i < result.length; i++) {
    if (_getAttribute(result[i], "id") === id) return result[i];
  }
  return null;
} : false;

// Register a node and index its children.
var _indexed = 1,
    _indexes = {};
function _register(element) {
  if (_indexes._indexed != _indexed) {
    _indexes = {_indexed: _indexed};
  }
  var id = _IS_INDEXED ? element.sourceIndex : element.uniqueID || assignID(element);
  if (!_indexes[id]) {
    var indexes = {},
        index = 0,
        child = element.firstChild;
    while (child) {
      if (child.nodeType === 1)
        /*@if (@_jscript_version < 5.6)
          if (child.nodeName !== "!")
        /*@end @*/
        indexes[_IS_INDEXED ? child.sourceIndex : child.uniqueID || assignID(child)] = ++index;
      child = child.nextSibling;
    }
    indexes.length = index;
    _indexes[id] = indexes;
  }
  return _indexes[id];
};

function _spaces(match) {
  return Array(match.length + 1).join(" ");
};

function _throwSelectorError(selector, node) {
  if (Traversal.isDocument(node) || Traversal.isElement(node) || node.nodeType == 11) {
    if (!Traversal.isXML(node) || !_NOT_XML.test(selector)) {
      var error = new SyntaxError(format("'%1' is not a valid CSS selector.", selector));
      error.code = 12; // DOMException.SYNTAX_ERR
      throw error;
    }
  } else {
    throw new TypeError("Invalid argument.");
  }
};

// =========================================================================
// dom/selectors-api/StaticNodeList.js
// =========================================================================

// http://www.w3.org/TR/selectors-api/#staticnodelist

// A wrapper for an array of elements or an XPathResult.

var StaticNodeList = Base.extend({
  constructor: function(nodes) {
    if (nodes) {
      if (nodes._unsorted) {
        if (_IS_INDEXED) {
          // For comma separated selectors on platforms that support sourceIndex,
          // then elements are stored by index to avoid sorting.
          var j = 0;
          for (var i in nodes) if (i - 0 >= 0) this[j++] = nodes[i];
          this.length = j;
          return;
        } else {
          nodes.sort(nodes[0].sourceIndex >= 0 ? _SORT_BY_INDEX : _SORTER);
        }
      }
      i = 0;
      var length = this.length = nodes.length;
      if (length) this[0] = undefined; // fixes a weird bug in Opera
      while (i < length) this[i] = nodes[i++];
    }
  },

  length: 0,

  forEach: function(eacher, context) {
    var length = this.length;
    for (var i = 0; i < length; i++) {
      eacher.call(context, this[i], i, this);
    }
  },

  indexOf: function(element) {
    return Array2.indexOf(this, element);
  },

  item: Array2.prototype.item,

  not: function(test, context) {
    return this.filter(not(test), context);
  },

  slice: function(start, end) {
    return new StaticNodeList(Array2.slice(this, start, end));
  }
});

StaticNodeList.implement(Enumerable);

StaticNodeList.implement({
  every: StaticNodeList_matchesSelector,
  filter: StaticNodeList_matchesSelector,
  not: StaticNodeList_matchesSelector,
  some: StaticNodeList_matchesSelector
});

StaticNodeList.implement({
  filter: function(test, context) {
    return new StaticNodeList(this.base(test, context));
  }
});

function StaticNodeList_matchesSelector(test, context) {
  if (typeof test != "function") {
    test = new Selector(test).toDOMQuery(true);
  }
  return this.base(test, context);
};

// =========================================================================
// dom/selectors-api/NodeSelector.js
// =========================================================================

// http://www.w3.org/TR/selectors-api/#nodeselector

var NodeSelector = Module.extend({
  "@(element.querySelector)": {
    querySelector: function(node, selector) {
      if (!_USE_BASE2.test(selector)) {
        try {
          return this.base(node, selector);
        } catch (x) {
          // assume it's an unsupported selector
        }
      }
      return new Selector(selector).exec(node, true);
    },

    querySelectorAll: function(node, selector) {
      if (!_USE_BASE2.test(selector)) {
        try {
          return StaticNodeList(this.base(node, selector));
        } catch (x) {
          // assume it's an unsupported selector
        }
      }
      return new Selector(selector).exec(node);
    }
  },

  "@!(element.querySelector)": {
    querySelector: function(node, selector) {
      return new Selector(selector).exec(node, true);
    },

    querySelectorAll: function(node, selector) {
      return new Selector(selector).exec(node);
    }
  }
});

// Fix for Safari 3.1/3.2 (http://code.google.com/p/base2/issues/detail?id=100)
if (_element.querySelectorAll) {
  _element.innerHTML = '<a id="X"></a>'; // This should be a browser sniff as the target document may not be in quirks mode -@DRE
  if (_element.querySelectorAll("#X").length == 0) {
    var _CAPS_SELECTOR = _makeSelectorRegExp("[#.][ID]*[A-Z]");
    function _fixQuerySelector(isSingleSelection) {
      return function(node, selector) {
        if (_CAPS_SELECTOR.test(selector) && !/^CSS/.test((node.ownerDocument || node).compatMode)) {
          return new Selector(selector).exec(node, isSingleSelection);
        }
        return this.base(node, selector);
      };
    };
    NodeSelector.implement({
      querySelector:    _fixQuerySelector(true),
      querySelectorAll: _fixQuerySelector()
    });
  }
}

// Automatically bind objects retrieved using the Selectors API on a bound node.
extend(NodeSelector.prototype, {
  querySelector: function(selector) {
    return dom.bind(this.base(selector));
  },

  querySelectorAll: function(selector) {
    var result = this.base(selector),
        i = result.length;
    while (i--) {
      var element = result[i];
      if (!_boundElementIDs[element.uniqueID]) dom.bind(element);
    }
    return result;
  }
});

// =========================================================================
// dom/selectors-api/CSSParser.js
// =========================================================================

var CSSParser = RegGrp.extend({
  constructor: function(items) {
    this.base(items);
    this.cache = {};
  },

  cache: null,
  ignoreCase: true,

  escape: function(selector) {
    // remove strings
    var strings = this._strings = [];
    return String(selector).replace(_CSS_ESCAPE, function(string) {
      if (string.indexOf("\\") !== 0) {
        string = string.slice(1, -1).replace(_QUOTE, "\\'");
      }
      return "\x01" + strings.push(string) + "\x01";
    });
  },

  format: function(selector) {
    return this.normalise(this.escape(selector));
  },

  normalise: function(selector) {
    return selector
      .replace(_CSS_TRIM, "$1")
      .replace(_CSS_LTRIM, "$1")
      .replace(_CSS_RTRIM, "$1")
      .replace(_CSS_IMPLIED_SPACE, "$1 $2")
      .replace(_CSS_IMPLIED_ASTERISK, "$1*$2");
  },

  parse: function(selector) {
    return this.cache[selector] ||
      (this.cache[selector] = this.revert(this.exec(this.format(selector))));
  },

  put: function(pattern, value) {
    return this.base(_makeSelectorRegExp(pattern), value);
  },

  revert: function(selector) {
    return this.unescape(selector);
  },

  unescape: function(selector) {
    // put string values back
    var strings = this._strings;
    return selector.replace(_CSS_UNESCAPE, function(match, index) {
      return strings[index - 1];
    });
  }
});

// =========================================================================
// dom/selectors-api/Selector.js
// =========================================================================

// This object can be instantiated, however it is probably better to use
// the querySelector/querySelectorAll methods on DOM nodes.

// It is analogous to a RegExp for the DOM. ;)

// There is no public standard for this object.

// Usage:
//
// var sel = new Selector("span#example a:first-child");
//
// var elements = sel.exec(document);         // Find all matching elements in the document.
// var elements = sel.exec(element);          // Find all matching elements contained by the element.
// var elements = sel.exec();                 // The host document is the default context.
// var elements = sel.exec(document, true);   // Retrieve a single element.
// var elements = sel.exec(fragment);         // Querying documents fragments is allowed.
// var elements = sel.exec(xmlDocument);      // Querying XML documents/elements is allowed.
//

var Selector = Base.extend({
  constructor: function(selector) {
    this.toString = K(trim(selector));
  },

  exec: function(node, isSingleSelection) {
    return this.toDOMQuery()(node || document, !!isSingleSelection);
  },

  split: function() {
    return Array2.map(String2.csv(this), Selector);
  },

  test: function(element) {
    try {
      return this.toDOMQuery(true)(element);
    } catch (x) {
      _throwSelectorError(this, element); // Not if the error is caused by an invalid XML query
      return false;
    }
  },

  toDOMQuery: function(isTest) {
    var cache = _cachedDOMQueries[isTest ? "test" : "exec"];
    if (!cache[this]) {
      var fn = "",
          args = ["e0,c"],
          states = [],
          vars = (isTest ? "" : "var r=c===true?null:[],l,u,v={},k=0;_query.complete=false;") + "_indexed++;" +
            "var d=e0.nodeType===9?e0:e0.ownerDocument||base2.dom.Traversal.getDocument(e0),gebi=d.getElementById,to=gebi?'toUpperCase':'toString',p0;",
          tags = [],
          caches = [],
          selectors = _parser.format(this).split(","),
          isCommaSeparated = selectors.length > 1,
          group = 0;

      // Parses a single selector in a comma-separated list of selectors.
      function parseSelector(selector, isTest, suppressUniqueID) {
        var block = "",
            combinators = _combinators[isTest ? "test" : "exec"],
            combinator,
            uniqueIDAssigned,
            cache = 0;
        if (isTest) selector = selector.replace(_CSS_CONTEXT, "");
        var tokens = match(selector, _TOKENIZER), token;

        if (isTest) tokens.reverse(); // process backwards when matching

        for (var j = 0; token = tokens[j]; j++) {
          var parsed = "";
          uniqueIDAssigned = false;
          if (_COMBINATOR.test(token)) {
            combinator = token;
            parsed += combinators[combinator];
            if (combinator === " " || combinator === ">") {
              if (!isTest && combinator === " " && tokens[j + 1].indexOf("*") === 0) { // read ahead to fix an IE5 bug
                parsed = parsed.replace(/\bT\b/, "'*'");
              }
              group++;
              cache++;
              if (!isTest) {
                if (!Array2.contains(states, group)) states.push(group);
              }
            }
          } else {
            var parts = match(token, _PARSE_SIMPLE_SELECTOR),
                tagName = parts[1] || "*",
                simpleSelector = parts[2] || "",
                isWildCard = tagName === "*";
            if (!isWildCard) {
              tags.push(tagName);
            }
            if (isTest) {
              if (!isWildCard) {
                parsed += "if(e.nodeName===t){";
              }
            } else {
              if (isWildCard) {
                if (!_SUPPORTS_TRAVERSAL_API && combinator == "~") {
                  parsed += "if(" + _IS_ELEMENT + "){";
                }
                /*@if (@_jscript)
                  if (combinator == " " || combinator == ">") {
                    parsed += "if(e.nodeName!='" + (@_jscript_version < 5.6 ? "!" : "#comment") + "'){";
                  }
                @else @*/
                  if (!_SUPPORTS_CHILDREN && combinator === ">") {
                    parsed += "if(e.nodeType===1){";
                  }
                /*@end @*/
              } else if (combinator != " ") {
                parsed += "if(e.nodeName===t){";
              }
              if ((cache > 1 && combinator === " ") || combinator === "~") {
                parsed += _BREAK_ON_DUPLICATES;
                caches.push(group);
                uniqueIDAssigned = true;
              }
            }
            parsed += _parser.exec(simpleSelector);
          }

          block += parsed.replace(_VARIABLES, function(match, chr, string) {
            if (string) return string;
            return chr === "T" ? "t" + tags.length : chr === "t" ? chr + (tags.length - 1) : chr === "E" ? "e" + (group - 1) : chr + group;
          });
        }
        if (!isTest && isCommaSeparated && !suppressUniqueID) {
          var testDuplicates = "";
          if (!uniqueIDAssigned) {
            testDuplicates = _ASSIGN_ID;
          }
          if (!_IS_INDEXED) {
            if (i == 0) {
              testDuplicates += "v[u]=1;";
            } else {
              testDuplicates += "if(!v[u]){v[u]=1;";
            }
          }
          block += format(testDuplicates, group);
        }
        return block;
      };

      // Process the end of a selector.
      function closeBlock(block, activeGroup) {
        if (isTest) {
          block += "return true;"
        } else {
          var store = "if(c===true)return e%1;";
          if (isCommaSeparated && _IS_INDEXED) {
            // Store elements in the array using sourceIndex, this avoids having to sort later.
            store += "r[u]=e%1;k++;";
          } else {
            store += "r[k++]=e%1;";
          }
          store += "if(k===c){_query.state=[%state%];return r;";
          block += format(store, activeGroup || group);
        }
        block += Array(match(block, /\)\{/g).length + 1).join("}");
        if (isCommaSeparated && !isTest) {
          // Only mark the results as unsorted if this block has added to the results.
          block += "if(c!==true){if(l&&r.length>l)r._unsorted=1;l=r.length;}";
        }
        return block;
      };

      _reg = []; // store for RegExp objects

      // Loop through comma-separated selectors.
      for (var i = 0; i < selectors.length; i++) {
        var selector = selectors[i],
            escapedSelector = selector.replace(_CSS_ESCAPE_TEXT, _spaces),
            currentGroup = group,
            tagsLength   = tags.length,
            statesLength   = states.length;
        function reset() {
          group = currentGroup;
          //tags.length = tagsLength;
          //states.length = statesLength;
        };
        if (i > 0) fn +=  "e" + group + "=e0;";
        if (!isTest) {
          fn += "if(e0!=d){";
          var lastTag = Array2.item(match(escapedSelector, _makeSelectorRegExp("[\\s>+~][ID\\*]+", "g")), -1),
              indexOfLastTag = escapedSelector.lastIndexOf(lastTag),
              block = parseSelector(" " + lastTag.slice(1), false, true),
              activeGroup = group;
          group++;
          block = block.replace(/(e\d+)\.(getElementsByTagName)\((t\d+)\)/, "$1.$2?$1.$2($3):_$2($1,$3)"); // for document fragments
          var matchBy = selector.slice(0, indexOfLastTag + 1) + "*" + selector.slice(indexOfLastTag + lastTag.length);
          if (matchBy !== " *") {
            block += "var e" + group + "=e" + (group - 1) + ";";
            block += parseSelector(matchBy, true);
          }
          group = activeGroup;
          fn += closeBlock(block);
          fn += "}else{";
          reset();
        }
        var indexOfLastID = escapedSelector.lastIndexOf("#");
        if (isTest || indexOfLastID === -1) {
          fn += closeBlock(parseSelector(selector, isTest));
        } else {
          // Query with an ID selector
          var matchBy = selector.slice(0, indexOfLastID),
              parts = match(selector.slice(indexOfLastID), _PARSE_ID_SELECTOR),
              id = parts[1] || "",
              selectBy = parts[2] || "";
          // Use a standard query for XML documents, disconnected elements and
          // platforms with broken getElementById().
          block = parseSelector(selector);
          if (_byId) {
            fn += "if(!gebi){" + closeBlock(block) + "}";
            reset();
            // Now build an optimised query to get the element by ID.
            fn += format("else{var e%1=" + _BY_ID + ";if(e%1&&(e0==d||_contains(e0,e%1))){", ++group, id);
            // Build an inner query to validate the left hand side of the ID selector
            //var query = "";
            block = "";
            if (matchBy.replace(_CSS_CONTEXT, "")) {
              block = parseSelector(matchBy, true);
            }
            // Build the remainder of the query (after the ID part).
            block += parseSelector(selectBy);
            fn += closeBlock(block) + "}}";
          } else {
            fn += closeBlock(block);
          }
        }
        if (!isTest) fn += "}";
      }
      /*@if (@_jscript_version < 5.6)
        fn = fn.replace(/\bgetElementsByTagName\('\*'\)/g, "all");
      /*@end @*/
      if (_reg.length) {
        vars += "var reg=[" + _reg.join(",") + "];";
      }
      if (tags.length) {
        var TAGS = [], processedTags = {};
        forEach (tags, function(name, i) {
          var tag = processedTags[name];
          if (tag == null) {
            var NAME = name.toUpperCase(),
                tag = processedTags[name] = "t" + i;
            TAGS[i] = tag + "='" + NAME + "'";
            tags[i] = tag + "='" + name + "'";
            // Some platforms (MSIE) do not convert tag names to uppercase for the new HTML5 elements.
            name = name.toLowerCase();
            if (_lowerCaseTags[name] == null) {
              var createElement = document.createElement;
              document.createElement = _createElement;
              _lowerCaseTags[name] = document.createElement(name).nodeName != NAME;
              document.createElement = createElement;
            }
            if (_lowerCaseTags[name]) {
              fn = fn.replace(new RegExp("nodeName===" + tag + "\\b", "g"), "nodeName[to]()===" + tag);
            }
          } else {
            tags[i] = undefined;
            fn = fn.replace(new RegExp("\\bt" + i + "\\b", "g"), tag);
          }
        });
        vars += "if(gebi){var " + Array2.filter(TAGS, Boolean).join(",") + ";}else{" + Array2.filter(tags, Boolean).join(",") + ";}";
      }
      forEach (caches, function(group) {
        vars += "var s" + group + "={};";
      });
      forEach (states, function(group, i) {
        states[i] = "i" + group + "?i" + group + "-1:0";
        args.push("a" + group);
      });
      fn = _parser.unescape(vars + fn);
      fn += isTest ? ";return false" : "if(c===true)return null;if(c){_query.state=[%state%];_query.complete=true}return r";
      fn = fn.replace(/%state%/g, ["e0,c"].concat(states).join(","));
      eval("var _query=function(" + args.join(",") + "){" + fn + "}");
      cache[this] = _query;
    }
    return cache[this];
  }
});

// =========================================================================
// dom/selectors-api/_parser.js
// =========================================================================

var _IS_INDEXED              = _element.sourceIndex >= 0,
    _SUPPORTS_CHILDREN       = detect("(element.children)"),
    _SUPPORTS_TRAVERSAL_API  = detect("(element.nextElementSibling)"),
    _ID                      = _IS_INDEXED ? "e.sourceIndex" : "e.uniqueID||assignID(e)",
    _ASSIGN_ID               = "u=" + _ID.replace(/\be\b/g, "e%1") + ";",
    _IS_ELEMENT              = "e.nodeType===1",
    _BREAK_ON_DUPLICATES     = "u=" + _ID + ";if(s[u])break;s[u]=1;",
    _PARSE_SIMPLE_SELECTOR   = _makeSelectorRegExp("^(\\*|[ID]+)?(.*)$"),
    _PARSE_ID_SELECTOR       = _makeSelectorRegExp("^#([ID]+)?(.*)$"),
    _TOKENIZER               = /[^\s>+]+(~=|n\+\d)[^\s>+]+|[^\s>+~]+|[\s>+~]/g,
    _VARIABLES               = /\b([aeEijnpstT])\b|('[^']+')/g,
    _BY_ID                   = _BUGGY_BY_ID ? "_byId(d,'%2')" : "d.getElementById('%2')",
    _DOCUMENT_STATE          = "(_DocumentState[d.base2ID]||_DocumentState.createState(d))";

/*@if (@_jscript_version < 5.6)
  _IS_ELEMENT += "&&e.nodeName!=='!'";
/*@end @*/

// variables used by the parser

var _reg   = [],        // a store for RexExp objects
    _cachedDOMQueries = {exec:{}, test:{}}; // store parsed selectors

var _combinators = {
  exec: extend({}, {
    " ": "var i,e,p,n=E.getElementsByTagName(T);for(i=a||0;e=n[i];i++){",
    ">": "var i,e,p,n=E." + (_SUPPORTS_CHILDREN ? "children" : "childNodes") + ";for(i=a||0;e=n[i];i++){",
    "+": "while((e=e.nextSibling)&&!(" + _IS_ELEMENT + "))continue;if(e){",
    "~": "while((e=e.nextSibling)){",
    "@(element.nextElementSibling)": {
      "+": "e=e.nextElementSibling;if(e){",
      "~": "while((e=e.nextElementSibling)){"
    }
  }),

  test: {
    " ": "var e=E;while((e=e." + _PARENT + ")){",
    ">": "var e=E." + _PARENT + ";if(e){"
  }
};

_combinators.test["+"] = _combinators.exec["+"].replace("next", "previous");
_combinators.test["~"] = _combinators.exec["~"].replace("next", "previous");

var _pseudoClasses = extend({}, {
  "checked":     "e.checked===true",
  "contains":    "e." + _TEXT_CONTENT + ".indexOf('%1')!==-1",
  "disabled":    "e.disabled===true",
  "empty":       "_isEmpty(e)",
  "enabled":     "e.disabled===false",
  "first-child": "!(e.previousSibling&&_getElementSibling(e,'previous'))",
  "last-child":  "!(e.nextSibling&&_getElementSibling(e,'next'))",
  "@(element.nextElementSibling)": {
    "first-child": "!e.previousElementSibling",
    "last-child":  "!e.nextElementSibling"
  },
  "root":        "e==d.documentElement",
  "target":      "gebi&&e.id&&base2.dom.Element.getAttribute(e,'id')==d.location.hash.slice(1)",
  "hover":       _DOCUMENT_STATE + ".isHover(e)",
  "active":      _DOCUMENT_STATE + ".isActive(e)",
  "focus":       _DOCUMENT_STATE + ".hasFocus(e)",
  "link":        "d.links&&base2.Array2.indexOf(d.links,e)!==-1", //-@DRE
  "visited":     "false" // not implemented (security)
// not:          // defined elsewhere
// nth-child:
// nth-last-child:
//"only-child":
});

_pseudoClasses["only-child"] = _pseudoClasses["first-child"] + "&&" + _pseudoClasses["last-child"];

var _operators = {
  "=":  "%1==='%2'",
//"!=": "%1!='%2'", //  not standard but other libraries support it
  "~=": /(^| )%1( |$)/,
  "|=": /^%1(-|$)/,
  "^=": /^%1/,
  "$=": /%1$/,
  "*=": /%1/
};
_operators[""] = "%1";

var _parser = new CSSParser({
  ":not\\((\\*|[ID]+)?(([^\\s>+~]|~=)+)\\)": function(match, tagName, filters) { // :not pseudo class
    var replacement = (tagName && tagName !== "*") ? "if(e.nodeName!=='" + tagName + "'){" : "";
    replacement += _parser.exec(filters).replace(/if\(\(/g, "if(!(");
    return replacement;
  },

  "#([ID]+)": "if(((e.nodeName==='FORM'?base2.dom.Element.getAttribute(e,'id'):e.id)==='$1')){", // ID selector

  "\\.([ID]+)": function(match, className) { // class selector
    // Store RegExp objects - slightly faster on MSIE
    _reg.push(new RegExp("(^|\\s)" + rescape(className) + "(\\s|$)"));
    return "if((e.className&&reg[" + (_reg.length - 1) + "].test(e.className))){";
  },

  ":nth(-last)?-child\\(([^)]+)\\)": function(match, last, args) { // :nth-child pseudo classes
    return "p=_register(e.parentNode);" + format(_ASSIGN_ID, "") +
      "var j=p[u];if((" + _nthChild(match, args, "j", "p.length", "!", "&&", "% ", "===") + ")){";
  },

  ":([a-z\\-]+)(\\(([^)]+)\\))?": function(match, pseudoClass, $2, args) { // other pseudo class selectors
    return "if((" + format(_pseudoClasses[pseudoClass] || "throw", args) + ")){";
  },

  "\\[([ID]+)([^=]?=)?([^\\]]*)\\]": function(match, attr, operator, value) { // attribute selectors
    value = trim(value);
    if (operator.length > 1) {
      var rawValue = this.unescape(value);
      if (!rawValue || operator == "~=" && /\s/.test(rawValue)) return "if((false)){";
    }
    if (attr == "class") {
      var getAttribute = "e.className";
    } else {
      var method = (operator ? "get" : "has") + "Attribute";
      if (Element.prototype[method]) { // base2 does not trust the native method
        getAttribute = "base2.dom.Element." + method + "(e,'" + attr + "')";
      } else { // base2 thinks the native method is spiffing
        getAttribute = "e." + method + "('" + attr + "')";
      }
    }
    var replacement = _operators[operator || ""];
    if (replacement instanceof RegExp) {
      _reg.push(new RegExp(format(replacement.source, rescape(this.unescape(value)))));
      replacement = "reg[%2].test(%1)";
      value = _reg.length - 1;
    }
    return "if((" + format(replacement, getAttribute, value) + ")){";
  }
});

// =========================================================================
// dom/selectors-api/implementations.js
// =========================================================================

Selector.implement({
  exec: function(node, isSingleSelection) {
    try {
      var result = this.base(node || document, isSingleSelection);
    } catch(x) {
      _throwSelectorError(this, node); // Not if the error is caused by an invalid XML query
      result = null;
    }
    return isSingleSelection ? result : new StaticNodeList(result);
  }
});

Element.implement(NodeSelector);
Document.implement(NodeSelector);
DocumentFragment.implement(NodeSelector);

// =========================================================================
// dom/html/ClassList.js
// =========================================================================

// http://www.whatwg.org/specs/web-apps/current-work/#domtokenlist0

// I'm not supporting length/index(). What's the point?

var ClassList = Module.extend({
  add: function(element, token) {
    if (!ClassList.contains(element, token)) {
      element.className += (element.className ? " " : "") + token;
    }
  },

  contains: function(element, token) {
    var regexp = new RegExp("(^|\\s)" + token + "(\\s|$)");
    return regexp.test(element.className || "");
  },

  remove: function(element, token) {
    var regexp = new RegExp("(^|\\s)" + token + "(\\s|$)", "g");
    element.className = trim(element.className.replace(regexp, "$2"));
  },

  toggle: function(element, token) {
    ClassList[ClassList.contains(element, token) ? "remove" : "add"](element, token);
    return true;
  }
});

// =========================================================================
// dom/html/HTMLDocument.js
// =========================================================================

// http://www.whatwg.org/specs/web-apps/current-work/#htmldocument

var HTMLDocument = Document.extend(null, {
  bind: function(document) {
    _DocumentState.createState(document);
    return this.base(document);
  }
});

// =========================================================================
// dom/html/HTMLElement.js
// =========================================================================

var HTMLElement = Element.extend(null, {
  bindings: {},
  tags: "*",

  bind: function(element) {
    var data = element;

    if (!element.ownerDocument) {
      element.ownerDocument = Traversal.getOwnerDocument(element);
    }

    /*@if (@_jscript)
      for (var name, i = 0; name = _PREFIXES[i]; i++) {
        name += "Attribute";
        if (element[name]) element["_" + name] = element[name];
      }
      if (@_jscript_version < 5.7) {
        data = element.uniqueID;
        document[data] = element;
      }
    /*@end @*/

    if (!element.classList) {
      element.classList = new _HTMLElement_ClassList(data);
    }

    this.base(element);

    /*@if (@_jscript) {
      try {
        return element;
      } finally {
        element = null;
      }
    }
    @else @*/
      return element;
    /*@end @*/
  },

  extend: function() {
    // Maintain HTML element bindings.
    // This allows us to map specific interfaces to elements by reference
    // to tag name.
    var binding = this.base.apply(this, arguments);
    forEach.csv(binding.tags, function(tagName) {
      HTMLElement.bindings[tagName.toUpperCase()] = binding;
    });
    return binding;
  }
});

HTMLElement.extend(null, {
  tags: "APPLET,EMBED,OBJECT",
  bind: I // Binding not allowed for these elements.
});

// a constructor that binds ClassList objects to elements
function _HTMLElement_ClassList(data) {
  // For most platforms, data is the element itself.
  // For MSIE5/6, data is a pointer to the element in the document.
  this._data = data;
};

forEach.csv("add,contains,remove,toggle", function(methodName) {
  _HTMLElement_ClassList.prototype[methodName] = new Function("t", format("return base2.dom.ClassList.%1(%2,t)", methodName, _classList_element));
});

// =========================================================================
// dom/html/implementations.js
// =========================================================================

// none

// =========================================================================
// dom/cssom/header.js
// =========================================================================

// Quite a lot of browser sniffing here. It's not really possible to feature
// detect all of the various bugs. Newer browsers mostly get it right though.

var _TABLE_TH_TD  = /^(TABLE|TH|TD)$/,
    _QUIRKS_MODE  = detect("QuirksMode"),
    _MSIE6        = detect("MSIE6"),
    _FIX_BORDER   = detect("Webkit5|KHTML4") ? _TABLE_TH_TD :
                    detect("Opera8") ? {
                      test: function(nodeName) {
                        return !_TABLE_TH_TD.test(nodeName)
                      }
                    } : {
                      test: False
                    };

var _offsets = new Base({
  getBodyClient: function(document) {
    var left = 0,
        top = 0,
        view = document.defaultView,
        body = document.body,
        bodyStyle = ViewCSS.getComputedStyle(view, body, null),
        position = bodyStyle.position,
        isAbsolute = position != "static";

    if (isAbsolute) {
      left += parseInt(bodyStyle.left) + parseInt(bodyStyle.marginLeft);
      top  += parseInt(bodyStyle.top) + parseInt(bodyStyle.marginTop);
      if (position == "relative") {
        var rootStyle = ViewCSS.getComputedStyle(view, document.documentElement, null);
        left += parseInt(rootStyle.paddingLeft) + parseInt(rootStyle.borderLeftWidth);
        top  += parseInt(rootStyle.paddingTop) + parseInt(rootStyle.borderTopWidth);
        // MSIE6 stores the margin but doesn't apply it.
        if (!_MSIE6) {
          left += parseInt(rootStyle.marginLeft);
          top += parseInt(rootStyle.marginTop);
        }
      }
    } else {
      var dummy = document.createElement("div");
      body.insertBefore(dummy, body.firstChild);
      left += dummy.offsetLeft - parseInt(bodyStyle.paddingLeft);
      top += dummy.offsetTop - parseInt(bodyStyle.paddingTop);
      body.removeChild(dummy);
    }

    return {
      position: position,
      isAbsolute: isAbsolute,
      left: left,
      top: top
    };
  },

  getBodyOffset: function(document) {
    var client = this.getBodyClient(document),
        view = document.defaultView,
        body = document.body;

    return {
      isAbsolute: client.isAbsolute,
      left: client.left + parseInt(ViewCSS.getComputedPropertyValue(view, body, "borderLeftWidth")),
      top: client.top + parseInt(ViewCSS.getComputedPropertyValue(view, body, "borderTopWidth"))
    };
  },

  getViewport: function(document) {
    var view = document.defaultView,
        documentElement = document.documentElement;
    return {
      left: parseInt(ViewCSS.getComputedPropertyValue(view, documentElement, "marginLeft")),
      top: parseInt(ViewCSS.getComputedPropertyValue(view, documentElement, "marginTop"))
    };
  },

  getGeckoRoot: function(document) {
    var rootStyle = document.defaultView.getComputedStyle(document.documentElement, null);

    return {
      x: parseInt(rootStyle.marginLeft) + parseInt(rootStyle.borderLeftWidth),
      y: parseInt(rootStyle.marginTop) + parseInt(rootStyle.borderTopWidth)
    };
  },

  "@MSIE.+QuirksMode": {
    getViewport: K({left: 0, top: 0})
  },

  "@(true)": {
    getBodyClient: _memoise(1),
    getBodyOffset: _memoise(2),
    getViewport: _memoise(3),
    getGeckoRoot: _memoise(4)
  }
});

function _memoise(type) {
  return function(document) {
    var key = type + (document.base2ID || assignID(document));
    if (!_memoise[key]) _memoise[key] = this.base(document);
    return _memoise[key];
  };
};

// =========================================================================
// dom/cssom/ElementView.js
// =========================================================================

// http://www.w3.org/TR/cssom-view/#the-elementview

var ElementView = Module.extend({
  "@!(element.getBoundingClientRect)": {
    getBoundingClientRect: function(element) {
      var document = element.ownerDocument;

      switch (element.nodeName) {
        case "HTML":
          var offset = _offsets.getViewport(document);
          break;
        case "BODY":
          offset = _offsets.getBodyClient(document);
          break;
        default:
          var left = element.offsetLeft,
              top = element.offsetTop,
              view = document.defaultView,
              documentElement = document.documentElement,
              computedStyle = view.getComputedStyle(element, null);
              offsetParent = element.offsetParent;

          while (offsetParent && (offsetParent != documentElement || computedStyle.position === "static")) {
            left += offsetParent.offsetLeft - offsetParent.scrollLeft;
            top += offsetParent.offsetTop - offsetParent.scrollTop;

            computedStyle = view.getComputedStyle(offsetParent, null);

            if (_FIX_BORDER.test(offsetParent.nodeName)) {
              if (offsetParent.clientLeft == null) {
                left += parseInt(computedStyle.borderLeftWidth);
                top  += parseInt(computedStyle.borderTopWidth);
              } else {
                left += offsetParent.clientTop;
                top  += offsetParent.clientLeft;
              }
            }
            offsetParent = offsetParent.offsetParent;
          }
          offset = {
            left: left,
            top: top
          };
      }

      return {
        top:    offset.top,
        right:  offset.left + element.clientWidth,
        bottom: offset.top + element.clientHeight,
        left:   offset.left
      };
    },

    "@Webkit5|KHTML4": {
      getBoundingClientRect: function(element) {
        // Tweak the above result for Safari 3.x if the document body is absolutely positioned.

        var clientRect = this.base(element);

        if (element.nodeName != "HTML") {
          var document = element.ownerDocument,
              offset = _offsets.getBodyOffset(document);
          if (!offset.isAbsolute) {
            offset = _offsets.getViewport(document)
          }
          clientRect.left += offset.left;
          clientRect.top += offset.top;
        }

        return clientRect;
      }
    },

    "@(document.getBoxObjectFor)": {
      getBoundingClientRect: function(element) {
        var document = element.ownerDocument,
            view = document.defaultView,
            documentElement = document.documentElement,
            box = document.getBoxObjectFor(element),
            computedStyle = view.getComputedStyle(element, null),
            left = box.x - parseInt(computedStyle.borderLeftWidth),
            top = box.y - parseInt(computedStyle.borderTopWidth),
            parentNode = element.parentNode;

        if (element != documentElement) {
          while (parentNode && parentNode != documentElement) {
            left -= parentNode.scrollLeft;
            top -= parentNode.scrollTop;
            computedStyle = view.getComputedStyle(parentNode, null);
            if (computedStyle.position != "absolute") {
              left += parseInt(computedStyle.borderTopWidth);
              top  += parseInt(computedStyle.borderLeftWidth);
            }
            parentNode = parentNode.parentNode;
          }

          if (computedStyle.position !== "fixed") {
            left -= view.pageXOffset;
            top -= view.pageYOffset;
          }

          var bodyPosition = view.getComputedStyle(document.body, null).position;
          if (bodyPosition === "relative") {
            var offset = document.getBoxObjectFor(documentElement);
          } else if (bodyPosition === "static") {
            offset = _offsets.getGeckoRoot(document);
          }
          if (offset) {
            left += offset.x;
            top += offset.y;
          }
        }

        return {
          top: top,
          right: left + element.clientWidth,
          bottom: top + element.clientHeight,
          left: left
        };
      }
    }
  },

  "@(jscript)": {
    getBoundingClientRect: function(element) {
      // MSIE doesn't bother to calculate client rects for the documentElement.

      var clientRect = this.base(element);

      if (element.nodeName === "HTML") {
        var document = Traversal.getDocument(element),
            viewport = _offsets.getViewport(document),
            documentElement = document.documentElement,
            left = viewport.left - documentElement.scrollLeft,
            top = viewport.left - documentElement.scrollTop;
        clientRect = {
          top: top,
          right: left + clientRect.right - clientRect.left,
          bottom: top + clientRect.bottom - clientRect.top,
          left: left
        };
      }

      return clientRect;
    }
  },

  "@Gecko1\\.9([^\\.]|\\.0)": { // bug in Gecko1.9.0 only
    getBoundingClientRect: function(element) {
      var clientRect = this.base(element);

      // This bug only occurs when the document body is absolutely positioned.
      if (element.nodeName !== "HTML" && _offsets.getBodyClient(element.ownerDocument).position === "absolute") {
        var offset = _offsets.getGeckoRoot(document);
        return {
          top:    clientRect.top - offset.y,
          right:  clientRect.right - offset.x,
          bottom: clientRect.bottom - offset.y,
          left:   clientRect.left - offset.x
        };
      }

      return clientRect;
    }
  }
}, {
  getOffsetFromBody: function(element) {
    var left = 0,
        top = 0;

    if (element.nodeName !== "BODY") {
      var document = Traversal.getOwnerDocument(element),
          view = document.defaultView,
          documentElement = document.documentElement,
          body = document.body,
          clientRect = this.getBoundingClientRect(element);

      left = clientRect.left + Math.max(documentElement.scrollLeft, body.scrollLeft);
      top = clientRect.top + Math.max(documentElement.scrollTop, body.scrollTop);

      var bodyOffset = _offsets.getBodyOffset(document);

      /*@if (@_jscript)
        if (_MSIE6 && body.currentStyle.position !== "relative") {
          left -= documentElement.clientLeft;
          top -= documentElement.clientTop;
        }
        if (@_jscript_version === 5.7 || document.documentMode === 7) {
          var rect = documentElement.getBoundingClientRect();
          left -= rect.left;
          top -= rect.top;
        }
        if (_QUIRKS_MODE) {
          left -= body.clientLeft;
          top -= body.clientTop;
          bodyOffset.isAbsolute = false;
        }
      /*@end @*/

      if (bodyOffset.isAbsolute) {
        left -= bodyOffset.left;
        top -= bodyOffset.top;
      }
    }

    return {
      left: left,
      top: top
    };
  },

  "@!(element.getBoundingClientRect)": {
    "@Webkit5|KHTML4": {
      getOffsetFromBody: function(element) {
        // Tweak the above result for Safari 3.x if the document body is absolutely positioned.

        var elementOffset = this.base(element);

        if (element.nodeName !== "HTML") {
          var document = element.ownerDocument,
              offset = _offsets.getBodyOffset(document);
          if (!offset.isAbsolute) {
            offset = _offsets.getViewport(document)
          }
          elementOffset.left -= offset.left;
          elementOffset.top -= offset.top;
        }

        return elementOffset;
      }
    }
  },

  "@Gecko1\\.([^9]|9(\\.0|[^\\.]))": {
    getOffsetFromBody: function(element) {
      var offset = this.base(element);

      // slightly different rules when the body is absolutley positioned
      if (!_offsets.getBodyClient(element.ownerDocument).isAbsolute) {
        var rootOffset = _offsets.getGeckoRoot(document);
        offset.left -= rootOffset.x;
        offset.top -= rootOffset.y;
      }

      return offset;
    }
  },

  // Manage offsetX/Y.

  getOffsetXY: function(element, clientX, clientY) { // slightly faster if clientLeft/Top are defined
    var clientRect = this.getBoundingClientRect(element);
    return {
      x: clientX - clientRect.left - element.clientLeft,
      y: clientY - clientRect.top - element.clientTop
    }
  },

  "@!(element.clientLeft)": {
    getOffsetXY: function(element, clientX, clientY) {
      var clientRect = this.getBoundingClientRect(element),
          computedStyle = element.ownerDocument.defaultView.getComputedStyle(element, null);
      return {
        x: clientX - clientRect.left - parseInt(computedStyle.borderLeftWidth),
        y: clientY - clientRect.top - parseInt(computedStyle.borderTopWidth)
      }
    }
  }
});

// =========================================================================
// dom/cssom/implementations.js
// =========================================================================

HTMLElement.implement(ElementView);

// =========================================================================
// dom/DocumentState.js
// =========================================================================

// Store some state for HTML documents.
// Used for fixing event handlers and supporting the Selectors API.

var _DocumentState = Base.extend({
  init: function(document) {
    this.document = document;
    this.events = {};
    this._hoverElement = document.documentElement;
    var EVENT_HANDLER = /^on((DOM)?\w+|[a-z]+)$/;
    for (var name in this) {
      if (EVENT_HANDLER.test(name)) {
        this.registerEvent(name.slice(2));
      }
    }
  },

  hasFocus: function(element) {
    return element == this._focusElement;
  },

  isActive: function(element) {
    return Traversal.includes(element, this._activeElement);
  },

  isHover: function(element) {
    return Traversal.includes(element, this._hoverElement);
  },

  handleEvent: function(event) {
    if (!event._userGenerated) {
      this["on" + event.type](event);
    }
  },

  onblur: function(event) {
    delete this._focusElement;
  },

  onmouseover: function(event) {
    this._hoverElement = event.target;
  },

  onmousedown: function(event) {
    this._activeElement = event.target;
  },

  onfocus: function(event) {
    this._focusElement = event.target;
  },

  onmouseup: function(event) {
    delete this._activeElement;
  },

  registerEvent: function(type) {
    EventTarget.addEventListener(this.document, type, this, true);
    this.events[type] = true;
  },

  "@!(document.activeElement)": {
    init: function(document) {
      this.base(document);
      if (_boundElementIDs[document.base2ID]) {
        document.activeElement = document.body;
      }
    },

    onfocus: function(event) {
      this.base(event);
      if (_boundElementIDs[this.document.base2ID]) {
        this.document.activeElement = this._focusElement;
      }
    },

    onblur: function(event) {
      this.base(event);
      var document = this.document;
      if (_boundElementIDs[document.base2ID]) {
        document.activeElement = document.body;
      }
    }
  },

  "@!(element.addEventListener)": {
    init: function(document) {
      this.base(document);
      var dispatcher = new EventDispatcher(this);
      this._dispatch = function(event) {
        event.target = event.target || event.srcElement || document;
        dispatcher.handleEvent(event);
      };
      this.handleEvent = function(event) {
        if (this["on" + event.type]) {
          this["on" + event.type](event);
        }
        return dispatcher.handleEvent(event);
      };
      var forms = {};
      this._registerForm = function(form) {
        var formID = assignID(form);
        if (!forms[formID]) {
          forms[formID] = true;
          _private.attachEvent(form, "onsubmit", this._dispatch);
          _private.attachEvent(form, "onreset", this._dispatch);
        }
      };
      var state = this;
      this._onselect = function(event) {
        if (state._activeElement == event.target) {
          state._selectEvent = copy(event);
        } else {
          state._dispatch(event);
        }
      };
      if (document.readyState === "complete") {
        this.onDOMContentLoaded();
      }
    },

    registerEvent: function(type, target) { //-@DRE
      var events = this.events[type],
          targetIsWindow = target && target.Infinity,
          canDelegate = !targetIsWindow && !_CANNOT_DELEGATE.test(type);
      if (!events || !canDelegate) {
        if (!events) events = this.events[type] = {};
        if (canDelegate || !target) target = this.document;
        if (!target) target = this.document;
        this.addEvent(type, target);
      }
      return events;
    },

    registered: {},

    fireEvent: function(type, event) {
      event = Event.cloneEvent(event);
      event.type = type;
      this.handleEvent(event);
    },

    addEvent: function(type, target) {
      var key = assignID(target) + type;
      if (!this.registered[key] && typeof target["on" + type] != "undefined") {
        this.registered[key] = true;
        var state = this;
        _private.attachEvent(target, "on" + type, function(event) {
          /*@if (@_jscript_version < 5.6)
          if (event.srcElement && !event.srcElement.nodeName) return;
          /*@end @*/
          event.target = event.srcElement || target;
          state.handleEvent(event);
          if (state["after" + type]) {
            state["after" + type](event);
          }
        });
      }
    },

    onDOMContentLoaded: function(event) {
      forEach (this.document.forms, this._registerForm, this);
      this.activate(this.document.activeElement);
    },

    onmousedown: function(event) {
      this.base(event);
      this._button = event.button;
    },

    onmouseup: function(event) {
      this.base(event);
      if (!event._userGenerated && this._button == null) {
        this.fireEvent("mousedown", event);
      }
      delete this._button;
    },

    aftermouseup: function() {
      if (this._selectEvent) {
        this._dispatch(this._selectEvent);
        delete this._selectEvent;
      }
    },

    onfocusin: function(event) {
      this.activate(event.target);
      this.onfocus(event);
    },

    activate: function(element) {
      var change = this.events.change && typeof element.onchange != "undefined",
         select = this.events.select && typeof element.onselect != "undefined";
      if (change || select) {
        var dispatch = this._dispatch, onselect = this._onselect;
        if (change) _private.attachEvent(element, "onchange", dispatch);
        if (select) _private.attachEvent(element, "onselect", onselect);
        var onblur = function() {
          _private.detachEvent(element, "onblur", onblur, true);
          if (change) _private.detachEvent(element, "onchange", dispatch);
          if (select) _private.detachEvent(element, "onselect", onselect);
        };
        _private.attachEvent(element, "onblur", onblur);
      }
    },

    onfocusout: function(event) {
      this.onblur(event);
    },

    onclick: function(event) {
      var target = event.target;
      if (target.form) this._registerForm(target.form);
    },

    ondblclick: function(event) {
      if (!event._userGenerated) this.fireEvent("click", event);
    },

    "@!(element.onfocusin)": {
      init: function(document) {
        this.base(document);
        var state = this, activeElement = document.activeElement;
        _private.attachEvent(document, "onpropertychange", function(event) {
          if (event.propertyName === "activeElement") {
            if (activeElement) {
              _private.attachEvent(activeElement, "onblur", onblur);
            }
            activeElement = document.activeElement;
            if (activeElement) {
              _private.attachEvent(activeElement, "onfocus", onfocus);
              state.activate(activeElement);
            }
          }
        });
        function onfocus(event) {
          _private.detachEvent(event.srcElement, "onfocus", onfocus);
          event.target = event.srcElement;
          state.handleEvent(event);
        };
        function onblur(event) {
          _private.detachEvent(event.srcElement, "onblur", onblur);
          event.target = event.srcElement;
          state.handleEvent(event);
        };
      }
    }
  }
}, {
  createState: function(document) {
    var base2ID = assignID(document);
    var state = this[base2ID];
    if (!state && !Traversal.isXML(document)) {
      state = this[base2ID] = new this();
      state.init(document);
      new DOMContentLoadedEvent(document, state);
    }
    return state;
  },

  getInstance: function(node) {
    var document = node.ownerDocument || Traversal.getDocument(node);
    return this[document.base2ID] || this.createState(document);
  }
});

_DocumentState.createState(document);

// =========================================================================
// dom/package.js
// =========================================================================

var dom = new Package({
  name:    "dom",
  version:  base2.version,

  exports: {
    Binding: Binding,
    Node: Node,
    Element: Element,
    Document: Document,
    DocumentFragment: DocumentFragment,
    Traversal: Traversal,
    AbstractView: AbstractView,
    Event: Event,
    EventTarget: EventTarget,
    DocumentEvent: DocumentEvent,
    ViewCSS: ViewCSS,
    CSSStyleDeclaration: CSSStyleDeclaration,
    Selector: Selector,
    NodeSelector: NodeSelector,
    StaticNodeList: StaticNodeList,
    HTMLDocument: HTMLDocument,
    HTMLElement: HTMLElement,
    ClassList: ClassList,
    ElementView: ElementView
  },

  bind: function(node) {
    // Apply a base2.dom.Binding to a native DOM node.
    /*@if (@_jscript_version < 5.6)
      if (node.getElementById) node.nodeType = 9;
    /*@end @*/
    var nodeType = node.nodeType,
        id = (nodeType === 1 ? node.uniqueID : node.base2ID) || assignID(node);
    if (!_boundElementIDs[id]) {
      _boundElementIDs[id] = true;
      switch (nodeType) {
        case 1:
          if (node.className == null) {
            Element.bind(node);
          } else {
            // It's an HTML element, so use bindings based on tag name.
            (HTMLElement.bindings[node.nodeName.toUpperCase()] || HTMLElement).bind(node);
          }
          break;
        case 9:
          if (node.getElementById == null) {
            Document.bind(node);
          } else {
            HTMLDocument.bind(node);
          }
          break;
        case 11:
          DocumentFragment.bind(node);
          break;
        default:
          Node.bind(node);
      }
    }
    return node;
  }
});

}); // end: package

base2.require("dom", function(namespace) { // begin: package

// =========================================================================
// fx/header.js
// =========================================================================

eval(namespace);

var _DIGITS         = /\d+/g,
    _RGB_VALUE      = /\d+%?/g;

var _INTERVAL       = 20;

var _GENERIC_EVENTS = detect("(document.createEvent('Events'))") ? "Events" : "UIEvents";

var _parseInt16 = partial(parseInt, undefined, 16);

function _split(value, fill) { // uased for splitting multiple CSS values
  if (value == null) return [];
  value = trim(value).split(/\s+/);
  if (fill) {
    if (value.length == 1) value[1] = value[0];
    if (value.length == 2) value[2] = value[0];
    if (value.length == 3) value[3] = value[1];
  }
  return value;
};

// =========================================================================
// fx/timingFunctions.js
// =========================================================================

var timingFunctions = {
  "ease": function(t, b, c, d) {
    if ((t/=d/2) < 1) {
      return c/2*t*t*t*t + b;
    }
    return -c/2 * ((t-=2)*t*t*t - 2) + b;
  },

  "linear": function(t, b, c, d) {
    return c*t/d + b;
  },

  "ease-in": function(t, b, c, d) {
    return c*(t/=d)*t + b;
  },

  "ease-out": function(t, b, c, d) {
    return -c *(t/=d)*(t-2) + b;
  },

  "ease-in-out": function(t, b, c, d) {
    if ((t/=d/2) < 1) {
      return c/2*t*t + b;
    }
    return -c/2 * ((--t)*(t-2) - 1) + b;
  },

  "bounce": function(t, b, c, d) {
    if ((t/=d) < (1/2.75)) {
      return c*(7.5625*t*t) + b;
    } else if (t < (2/2.75)) {
      return c*(7.5625*(t-=(1.5/2.75))*t + .75) + b;
    } else if (t < (2.5/2.75)) {
      return c*(7.5625*(t-=(2.25/2.75))*t + .9375) + b;
    } else {
      return c*(7.5625*(t-=(2.625/2.75))*t + .984375) + b;
    }
  }
};

// =========================================================================
// fx/Animation.js
// =========================================================================

var Animation = Base.extend({
  constructor: function(object, params, styleElement, autostart) {
    var transitions = {}, defaultTransition;

    var createTransition = function(transition, propertyName) {// recurse after we've broken down shorthand properties
      // If the transition is a string then it defines the end point
      // of the transition only.
      if (typeof transition != "object") {
        transition = {end: String(transition)};
      }
      // The first transition in the list defines the default
      // values for duration and delay in subsequent transitions.
      if (!defaultTransition) defaultTransition = transition;
      transition = copy(transition);
      transition.styleElement = styleElement;
      if (transition.delay == null && defaultTransition.delay != null) {
        transition.delay = defaultTransition.delay;
      }
      if (transition.duration == null && defaultTransition.duration != null) {
        transition.duration = defaultTransition.duration;
      }

      // Break shorthand properties into the longhand version.
      // This only parses property names. Values are parsed in Transition.js.
      // Some shorthand properties cannot be parsed.
      // (I may fix backgroundPosition eventually).
      if (/^(font|background(Position)?)$/.test(propertyName)) {
        throw "Cannot animate shorthand property '" + propertyName + "'.";
      } else if (/^border(Top|Right|Bottom|Left)?$/.test(propertyName)) { // shorthand border properties
        var property = propertyName,
            start = _split(transition.start),
            end = _split(transition.end),
            names = ["Width", "Style", "Color"];
        // recurse after we've broken down shorthand properties
        forEach (end, function(end, i) {
          var params = copy(transition);
          params.start = start[i];
          params.end = end;
          createTransition(params, property + names[i]);
        });
      } else if (/^(margin|padding|border(Width|Color|Style))$/.test(propertyName)) { // shorthand rect properties (T,R,B,L)
        var property = propertyName.replace(/Width|Color|Style/, ""),
            name = propertyName.replace(property, "");
        start = _split(transition.start, true);
        end = _split(transition.end, true);
        forEach.csv ("Top,Right,Bottom,Left", function(side, i) {
          var params = copy(transition);
          params.start = start[i];
          params.end = end[i];
          //addTransition(property + side + name, params);
          transitions[property + side + name] = params;
        });
      } else {
        //addTransition(propertyName, transition);
        transitions[propertyName] = transition;
      }
    };

    forEach (params, createTransition);

    function addTransition(propertyName, params) {
      return _queue.add(object, propertyName, params);
    };

    var started = false;

    this.start = function() {
      forEach (transitions, function(params, propertyName) {
        var transition = addTransition(propertyName, params);
        if (!started) {
          params.start = transition.start;
          params.duration = transition.duration;
        }
      });
      started = true;
    };

    this.stop = function() {
      forEach (transitions, function(params, propertyName) {
        _queue.remove(Transition.getKey(object, propertyName, params));
      });
      started = false;
    };

    this.reverse = function(duration) {
      forEach (transitions, function(transition, propertyName) {
        addTransition(propertyName, {
          end: transition.start,
          duration: duration || transition.duration,
          styleElement: styleElement
        });
      });
    };

    this.accelerate = function(rate) {
      forEach (transitions, function(transition, propertyName) {
        transition = _queue.get(transition);
        if (transition) transition.accelerate(rate);
      });
    };

    /*this.pause = function() {
      forEach (transitions, function(transition, propertyName) {
        transition = _queue.get(transition);
        if (transition) transition.pause();
      });
    };*/

    if (autostart != false) this.start();
  },

  // defined in the constructor function
  accelerate: Undefined,
  reverse:    Undefined,
  start:      Undefined/*,
  stop:       Undefined,
  pause:      Undefined*/
});

// =========================================================================
// fx/Transition.js
// =========================================================================

// Special parsing of colours and "clip" are bulking this out. :-(

var Transition = Base.extend({
  constructor: function(object, propertyName, params) {
    extend(this, params);

    this.toString = K(Transition.getKey(object, propertyName, params));

    this.propertyName = propertyName;

    var styleElement = this.styleElement,
        startValue = this.start,
        ease = this.timing;

    if (styleElement) propertyName = CSSStyleDeclaration.getPropertyName(propertyName);

    if (startValue == null) {
      startValue = this.start = object[propertyName] ||
        (styleElement ? ViewCSS.getComputedPropertyValue(document.defaultView, styleElement, propertyName) : "") || "";
    }

    // Parse the start/end values and create the underlying timing function.
    if (/color$/i.test(propertyName)) {
      startValue = this.parseColor(startValue);
      var endValue = this.parseColor(this.end),
          delta = map(startValue, function(value, i) {
            return endValue[i] - value;
          }),
          calculateValue = function(t) {
            return "#" + map(startValue, function(value, i) {
              value = Math.round(ease(t, value, delta[i], duration));
              return (value < 16 ? "0" : "") + value.toString(16);
            }).join("");
          };
    } else if (styleElement && propertyName == "clip") {
      startValue = map(match(startValue, _DIGITS), Number);
      endValue = map(match(this.end, _DIGITS), Number);
      delta = map(startValue, function(value, i) {
        return endValue[i] - value;
      });
      calculateValue = function(t) {
        return "rect(" + map(startValue, function(value, i) {
          return Math.round(ease(t, value, delta[i], duration));
        }).join("px, ") + "px)";
      };
    } else if (/^\-?\.?\d/.test(this.end)) { // Numeric.
      var unit = String(this.end).replace(/^[-.\d]+/, "").toLowerCase();  // strip number
      if (isNaN(parseFloat(startValue))) startValue = this.start = 0 + unit;
      endValue = Number(String(this.end).replace(unit, ""));              // strip unit
      if (styleElement && String(startValue).indexOf(unit) == -1) {
        if (params.start == null) {
          object[propertyName] = this.end;
          var value = parseFloat(ViewCSS.getComputedPropertyValue(document.defaultView, styleElement, propertyName));
          startValue = (endValue / value) * parseFloat(startValue);
          if (unit == "px") startValue = Math.round(startValue);
          object[propertyName] = this.start = startValue + unit;
        } else {
          throw "Incompatible start and end values.";
        }
      } else {
        startValue = Number(String(startValue).replace(unit, ""));          // strip unit
      }
      delta = endValue - startValue;
      calculateValue = function(t) {
        var value = ease(t, startValue, delta, duration);
        if (unit == "px") value = Math.round(value);
        return value + unit;
      };
    } else {
      endValue = this.end || "";
      calculateValue = function(t) { // flip only at the end
        return ease(t, 0, 1, duration) < 1 ? startValue : endValue;
      };
    }

    var timestamp = 0,
        reversed = false,
        started = 0,
        paused = 0,
        delay = ~~(this.delay * 1000),
        duration = ~~(this.duration * 1000),
        speed = 1,
        elapsedTime = 0;

    if (typeof ease != "function") {
      ease = fx.timingFunctions[ease];
    }

    assertType(ease, "function", "Invalid timing function.");

    this.tick = function(now) {
      if (!timestamp) timestamp = now;
      if (!this.complete && !paused) {
        elapsedTime = now - timestamp;
        if (!started && elapsedTime >= delay) {
          started = now;
        }
        if (started) {
          elapsedTime = Math.round(Math.min((now - started) * speed, duration));

          this.complete = elapsedTime >= duration;

          var t = reversed ? duration - elapsedTime : elapsedTime;

          var value = /*this.complete ? endValue :*/ calculateValue(t);

          if (styleElement) {
            CSSStyleDeclaration.setProperty(object, propertyName, value);
          } else {
            object[propertyName] = value;
          }

          if (this.complete) {
            this.elapsedTime = now - timestamp;
          }
        }
      }
    };

    this.reverse = function() {
      var temp = this.start;
      this.start = this.end;
      this.end = temp;
      this.complete = false;
      reversed = !reversed;
      if (started) {
        started = Date2.now() - (duration - elapsedTime) / speed;
      }
    };

    /*this.stop = function() {
      speed = 1;
      paused = 0;
      complete = true;
    };

    this.pause = function() {
      paused = Date2.now();
    };

    this.resume = function() {
      started += Date2.now() - paused;
      paused = 0;
    };*/

    this.setSpeed = function(s) {
      speed = s;
      if (started) {
        started = Date2.now() - elapsedTime / speed;
      }
    };

    this.accelerate = function(rate) {
      this.setSpeed(speed * rate);
    };
  },

  complete: false,
  delay: 0,
  duration: 1, // seconds
  timing: "ease",
  start: null,
  end: null,

  //compare: function(value, position) {
  //  if (/color$/i.test(this.propertyName)) {
  //    return this.parseColor(this[position]).join(",") == this.parseColor(value).join(",");
  //  } else if (this.propertyName == "clip") {
  //    // Stoopid incompatible clip rects:
  //    // http://www.ibloomstudios.com/articles/misunderstood_css_clip/
  //    var COMMAS = /,\s*/g;
  //    return this[position].replace(COMMAS, " ") == value.replace(COMMAS, " ");
  //  }
  //  return this[position] == value;
  //},

  parseColor: function(color) { // return an array of rgb values
    color = color.toLowerCase();
    var colors = Transition.colors, // cache
        value = color,
        rgb = colors[color];
    if (typeof rgb == "string") {
      value = rgb;
      rgb = "";
    }
    if (!rgb) {
      if (/^rgb/.test(value)) {
        rgb = map(value.match(_RGB_VALUE), function(value) {
          return value.indexOf("%") == -1 ?
            ~~value :
            Math.round(2.55 * value.slice(0, -1));
        });
      } else if (value.indexOf("#") == 0) {
        var hex = value.slice(1);
        if (hex.length == 3) hex = hex.replace(/([0-9a-f])/g, "$1$1");
        rgb = map(hex.match(/([0-9a-f]{2})/g), _parseInt16);
      } else {
        // If it's a named colour then use getComputedStyle to parse it.
        // Meh. It's ugly but it's less code than a table of colour names.
        var dummy = Transition._dummy;
        if (!dummy) {
          dummy = Transition._dummy = document.createElement("input");
          dummy.style.cssText = "position:absolute;left:0;top:-9999px;";
        }
        document.body.appendChild(dummy);
        try {
          dummy.style.color = value;
          var computedValue = ViewCSS.getComputedPropertyValue(document.defaultView, dummy, "color");
        } catch (x) {}
        document.body.removeChild(dummy);
        if (computedValue != value) {
          rgb = this.parseColor(computedValue || "#000");
        }
      }
      if (!rgb || rgb.length != 3 || Array2.contains(rgb, NaN)) {
        throw "Invalid color '" + color + "'.";
      }
      colors[color] = rgb;
    }
    return rgb;
  }
}, {
  colors: {}, // a cache for parsed colour values

  getKey: function(object, propertyName, params) {
    var target = params.styleElement || object,
        key = assignID(target);
    if (params.styleElement) key += ".style";
    return key + "." + propertyName;
  }
});

// =========================================================================
// fx/TransitionQueue.js
// =========================================================================

var TransitionQueue = Collection.extend({
  constructor: function(transitions) {
    this.base(transitions);
    this.tick = bind(this.tick, this);
  },

  /*add: function(object, propertyName, params) {
    var key = Transition.getKey(object, propertyName, params),
        transition = this.get(key);
    if (transition) {
      if (transition.duration != params.duration) {
        transition.setSpeed(transition.duration / (params.duration || 1)); // change gears
        if (transition.compare(params.end, "end")) {
          return transition;
        }
      }
      if (transition.compare(params.end, "start")) { // flipped start/end points indicate the reversal of a transition
        transition.reverse();
        return transition;
      }
    }
    transition = this.put(key, object, propertyName, params);
    if (!this._timer) {
      this._timer = setTimeout(this.tick, _INTERVAL);
    }
    return transition;
  },*/

  add: function(object, propertyName, params) {
    var transition = this.put(Transition.getKey(object, propertyName, params), object, propertyName, params);
    if (!this._timer) {
      this._timer = setTimeout(this.tick, _INTERVAL);
    }
    return transition;
  },

  tick: function() {
    this.invoke("tick", Date2.now());

    var complete = this.filter(function(transition) {
      return transition.complete;
    });

    complete.forEach(this.remove, this);

    complete.forEach(function(transition) {
      var element = transition.styleElement;
      if (element) {
        var event = DocumentEvent.createEvent(Traversal.getDocument(element), _GENERIC_EVENTS);
        event.initEvent("transitionend", true, false);
        event.propertyName = transition.propertyName;
        event.elapsedTime = transition.elapsedTime / 1000;
        EventTarget.dispatchEvent(element, event);
      }
    });

    delete this._timer;
    if (this.size() > 0) {
      this._timer = setTimeout(this.tick, _INTERVAL);
    }
  }
}, {
  Item: Transition,

  createItem: function(key, object, propertyName, params) {
    return new this.Item(object, propertyName, params);
  }
});

var _queue = new TransitionQueue;

// =========================================================================
// fx/package.js
// =========================================================================

var fx = new Package({
  name:    "fx",
  version: "0.5",

  exports: {
    Animation: Animation,
    timingFunctions: timingFunctions
  }
});

}); // end: package

base2.require("dom,fx", function(namespace) { // begin: package

// =========================================================================
// jsb/header.js
// =========================================================================

/*@cc_on @*/

eval(namespace);

var _private = $$base2;

var document = global.document;

var _EVENT              = /^on([a-z]{3,}|DOM[A-Z]\w+)$/,
    _EVENT_BUTTON       = /^mouse(up|down)|click$/,
    _EVENT_CLICK        = /click$/,
    _EVENT_MOUSE        = /^mouse|click$/,
    _EVENT_OVER_OUT     = /^mouse(enter|leave|over|out)$/,
    _EVENT_PSEUDO       = /^(attach|detach|(content|document)ready)$/,
    _EVENT_TEXT         = /^(key|text)/,
    _EVENT_USE_CAPTURE  = /^(focus|blur)$/;

var _CANNOT_DELEGATE    = /^(abort|error|load|scroll|DOMAttrModified|mouse(enter|leave)|(readystate|property|filter)change)$/,
    _HTML_BODY          = /^(HTML|BODY)$/,
    _MOUSE_BUTTON_LEFT  = /^[^12]$/;

var _GENERIC_EVENTS     = detect("(document.createEvent('Events'))") ? "Events" : "UIEvents";

var _SCRIPT             = document.createElement("script");

var _allAttachments     = {},
    _privateData        = {},
    _scripts            = {};

var _captureElement = null;

var _SPECIFICITY_ID =    /#/g,
    _SPECIFICITY_CLASS = /[.:\[]/g,
    _SPECIFICITY_TAG =   /^\w|[\s>+~]\w/g;

var _Modification = function(behavior, attributes, modifications) {
  extend(this, attributes);
  this.attach = behavior.attach;
  this._registerModification = function(selector) {
    this._test = selector.toDOMQuery(true);
    this._specificity = getSpecificity(selector);
    modifications.push(this);
    modifications.sort(_by_specificity);
  };
};

function getSpecificity(selector) {
  selector = selector.replace(/(['"])(\\.|[^\1\\])*\1/g, "");
  return match(selector, _SPECIFICITY_ID).length * 10000 +
    match(selector, _SPECIFICITY_CLASS).length * 100 +
    match(selector, _SPECIFICITY_TAG).length;
};

function _getPrivateData(element) {
  var uniqueID = element.uniqueID || assignID(element);
  if (!_privateData[uniqueID]) {
    _privateData[uniqueID] = new Map;
  }
  return _privateData[uniqueID];
};

function _by_specificity(selector1, selector2) {
  return selector2._specificity - selector1._specificity;
};

var _style = document.createElement("span").style;

function _getCurrentHost() {
  var host = location.pathname,
      script = Array2.item(new Selector("script").exec(), -1);

  if (script) host = script.src || host;
  ;;; host = host.replace(/build\.php\?package=([\w\/]+)package\.xml.*$/, "$1");
  return host.replace(/[\?#].*$/, "").replace(/[^\/]*$/, "");
};

// =========================================================================
// jsb/behavior.js
// =========================================================================

var _Behavior = Base.extend({
  attach: Undefined,
  detach: Undefined,
  modify: Null,

  jsbExtendedMouse: false, // allow right and middle button clicks
  jsbUseDelegation: true,  // use event delegation (appropriate events are handled by the document object)
  jsbUseDispatch:   true,  // use event dispatch (not a callback)

  ancestorOf: function(behavior) {
    return behavior instanceof this.constructor;
  },

  extend: function(_interface) {
    // Extend a behavior to create a new behavior.

    if (!_interface) _interface = {};

    // Create the Behavior constructor.
    var Behavior = function(){};
    (Behavior.prototype = new this.constructor).constructor = Behavior;

    // Decorate the prototype.
    var interfaces = _interface["implements"] || [];
    delete _interface["implements"];
    interfaces.push(_interface);
    for (var i = 0; i < interfaces.length; i++) {
      extend(Behavior.prototype, interfaces[i]);
    }

    // Single instance.
    var behavior = new Behavior;

    // Extract event handlers.

    var delegatedEvents = [],
        events,
        eventListener = {
          handleEvent: function(event) {
            eventDispatcher.dispatch(behavior, event.target, event);
          }
        };

    for (var name in behavior) {
      if (typeof behavior[name] == "function" && _EVENT.test(name)) {
        var type = name.slice(2);
        // Store event handlers.
        if (!behavior.jsbUseDelegation || _CANNOT_DELEGATE.test(type)) {
          if (!events) events = [];
          events.push(type);
        } else if (!_EVENT_PSEUDO.test(type)) {
          delegatedEvents.push(type);
        }
      }
    }

    // Maintain attachments.

    var attachments = {behavior: behavior};

    behavior.attach = function(element) {
      var uniqueID = element.uniqueID || assignID(element);

      if (typeof attachments[uniqueID] == "undefined") { // don't attach more than once
        // Maintain attachment state.
        attachments[uniqueID] = true;
        if (!_allAttachments[uniqueID]) _allAttachments[uniqueID] = 0;
        _allAttachments[uniqueID]++;

        // Add event handlers
        if (delegatedEvents) {
          for (var i = 0; type = delegatedEvents[i]; i++) {
            eventDelegator.addEventListener(type, attachments);
          }
          delegatedEvents = null; // we only need to attach these once per document
        }
        if (events) { // these events cannot be delegated
          for (var i = 0; type = events[i]; i++) {
            EventTarget.addEventListener(element, type, eventListener, false);
          }
        }

        // JSB events.
        if (behavior.onattach) {
          _dispatchJSBEvent(behavior, element, "attach");
        }
        if (behavior.oncontentready) {
          if (engine.isContentReady(element)) {
            _dispatchJSBEvent(behavior, element, "contentready");
          } else {
            engine.contentReadyQueue.push({behavior: behavior, element: element});
          }
        }
        if (behavior.ondocumentready) {
          if (engine.ready) {
            _dispatchJSBEvent(behavior, element, "documentready");
          } else {
            engine.documentReadyQueue.push({behavior: behavior, element: element});
          }
        }
        if (behavior.onfocus && element == document.activeElement) {
          behavior.dispatchEvent(element, "focus");
        }
      }
    };

    behavior.detach = function(element) {
      var uniqueID = element.uniqueID;
      if (attachments[uniqueID]) {
        if (arguments[1]) { // events only
          attachments[uniqueID] = false;
        } else {
          delete attachments[uniqueID];
        }
        _allAttachments[uniqueID]--;
        if (events) {
          for (var i = 0; type = events[i]; i++) {
            EventTarget.removeEventListener(element, type, eventListener, false);
          }
        }
      }
    };

    // Maintain modifications.

    var modifications = [];

    Behavior._get = function(element, propertyName) {
      for (var i = 0, modification; modification = modifications[i]; i++) {
        if (typeof modification[propertyName] != "undefined" && modification._test(element)) {
          return modification[propertyName];
        }
      }
      return behavior[propertyName];
    };

    behavior.modify = function(attributes) {
      Behavior._isModified = true;
      return new _Modification(behavior, attributes, modifications);
    };

    return behavior;
  },

  // DOM properties.

  get: function(element, propertyName) {
    // Retrieve a DOM property.

    // special cases
    if (propertyName == "textContent") {
      return element[Traversal.TEXT_CONTENT];
    }

    var defaultValue = this[propertyName];

    if (propertyName != "type") {
      var value = element[propertyName];
    }
    if (typeof value == "undefined") {
      value = this.getAttribute(element, propertyName.toLowerCase());
    }

    if (value == null) {
      var Behavior = this.constructor;
      return Behavior._isModified
        ? Behavior._get(element, propertyName)
        : defaultValue;
    }

    // Cast.
    switch (typeof defaultValue) {
      case "boolean": return value !== false;
      case "number":  return value - 0;
    }
    return value;
  },

  set: function(element, propertyName, value) {
    // Set a DOM property.

    var originalValue = this.get(element, propertyName);

    // special cases
    var isInnerHTML = propertyName == "innerHTML";
    if (isInnerHTML || propertyName == "textContent") {
      Traversal.setTextContent(element, value, isInnerHTML);
    } else {
      if (typeof this[propertyName] == "boolean" && !value) {
        this.removeAttribute(element, propertyName.toLowerCase());
      } else {
        this.setAttribute(element, propertyName.toLowerCase(), value);
      }
    }

    if (typeof value != typeof originalValue) {
      value = this.get(element, propertyName);
    }

    // If the value has changed then dispatch a "propertyset" event.
    if (originalValue !== value) {
      this.dispatchEvent(element, "propertyset", {
        propertyName: propertyName,
        originalValue: originalValue,
        newValue: value
      });
    }
    return value;
  },

  toggle: function(element, propertyName) {
    return this.set(element, propertyName, !this.get(element, propertyName));
  },

  // Private data.

  getPrivateData: function(element, propertyName) {
    return _getPrivateData(element).get(propertyName);
  },

  setPrivateData: function(element, propertyName, value) {
    return _getPrivateData(element).put(propertyName, value);
  },

  // Events.

  // addEventListener/removeEventListener are implemented below

  dispatchEvent: function(node, event, data) {
    if (typeof event == "string") {
      var type = event;
      event = DocumentEvent.createEvent(document, _GENERIC_EVENTS);
      var bubbles = true, cancelable = false;
      if (data) {
        if (data.bubbles != null) bubbles = !!data.bubbles;
        if (data.cancelable != null) cancelable = !!data.cancelable;
        delete data.bubbles;
        delete data.cancelable;
      }
      Event.initEvent(event, type, bubbles, cancelable);
    }
    if (data) extend(event, data);
    event.returnValue = undefined;
    event.cancelBubble = false;
    return EventTarget.dispatchEvent(node, event);
  },

  // Style.

  getStyle: function(element, propertyName) {
    // You should mostly use element.style.
    // Use this to retrieve newer properties like "opacity".
    return CSSStyleDeclaration.getPropertyValue(element.style, propertyName);
  },

  setStyle: function(element, propertyName, value, important) {
    // Setting element.style is quicker but this offers cross-browser safety and the
    // ability to set the !important flag.
    var style = element.style;
    if (arguments.length > 2) {
      CSSStyleDeclaration.setProperty(style, propertyName, value, important ? "important" : "");
    } else {
      CSSStyleDeclaration.setProperties(style, arguments[1]);
    }
  },

  getComputedStyle: function(element, propertyName) {
    var view = document.defaultView;
    if (arguments.length == 1) {
      return ViewCSS.getComputedStyle(view, element, null);
    } else {
      return ViewCSS.getComputedPropertyValue(view, element, propertyName);
    }
  },

  animate: function(element, transitions) {
    if (!base2.fx) throw new ReferenceError("base2.fx is not loaded.");
    return new base2.fx.Animation(element.style, transitions, element, true);
  },

  // For positioning popups.

  getOffsetFromBody: ElementView.getOffsetFromBody,

  // Mouse capture. Useful for drag/drop. Not perfect, but almost always good enough.

  setCapture: function(element) {
    if (element != _captureElement) this.releaseCapture();
    if (!_captureElement) {
      _captureElement = element;
    }
  },

  releaseCapture: function() {
    var element = _captureElement;
    if (element) {
      _captureElement = null;
      this.dispatchEvent(element, "losecapture");
      if (!this.matchesSelector(element, ":hover")) {
        this.dispatchEvent(element, "mouseout");
      }
    }
  }
});

var behavior = _Behavior.prototype;

// Bind timers to behaviors.

forEach.csv ("setInterval,setTimeout", function(name) {
  behavior[name] = function(callback, delay) {
    if (typeof callback == "string") callback = this[callback];
    var args = Array2.slice(arguments, 2);
    var self = this;
    return global[name](function() {
      callback.apply(self, args);
    }, delay || 1);
  };
});

// querySelector/querySelectorAll

forEach.csv ("querySelector,querySelectorAll", function(name) {
  behavior[name] = function(node, selector) {
    if (arguments.length == 1) {
      selector = node;
      node = document;
    }
    return NodeSelector[name](node, selector);
  };
});

// Additional DOM methods (from base2.dom).

forEach ([ // attach generic DOM methods
  EventTarget,
  ElementView,
  Node,
  Element
], function(_interface) {
  _interface.forEach(function(method, name) {
    if (!behavior[name]) behavior[name] = method;
  });
});

// addClass/hasClass/removeClass/toggleClass

ClassList.forEach(function(method, name) {
  if (name === "contains") name = "has";
  behavior[name + "Class"] = method;
});

behavior = new _Behavior; // seal-off

// =========================================================================
// jsb/Rule.js
// =========================================================================

// A Selector associated with a behavior.

var Rule = Base.extend({
  constructor: function(selector, behavior) {
    if (!(selector instanceof Selector)) {
      selector = new Selector(selector);
    }

    if (typeof behavior == "string") { // external resource
      behavior = new External(behavior, function(external) {
        behavior = external;
      });
    } else if (behavior instanceof _Modification) {
      behavior._registerModification(selector);
    } else if (!jsb.behavior.ancestorOf(behavior)) {
      behavior = jsb.behavior.extend(behavior);
    }

    this.toString = selector.toString;

    this.refresh = function() {
      if (typeof behavior.attach == "function") {
        selector.exec(document).forEach(behavior.attach);
      }
    };

    // Split comma separated selectors.
    var selectors = selector.split();

    forEach (selectors, function(selector) {
      engine.addRule(selector, behavior);
    });

    /*this.unload = function() {
      forEach (selectors, function(selector) {
        engine.removeRule(selector, behavior);
      });
    };*/
  },

  // defined in the constructor function
  refresh: Undefined
  //unload:  Undefined
});

// =========================================================================
// jsb/RuleList.js
// =========================================================================

// A collection of Rule objects

var RuleList = Collection.extend({
  put: function(key, value) { // allow feature detection
    key = String(key);
    if (key.indexOf("@") == 0) {
      if (detect(key.slice(1))) this.merge(value);
    } else {
      this.base.apply(this, arguments);
    }
  },

  refresh: function() {
    this.invoke("refresh");
  }/*,

  unload: function() {
    this.invoke("unload");
  }*/
}, {
  Item: Rule
});

// =========================================================================
// jsb/External.js
// =========================================================================

var External = Base.extend({
  constructor: function(url, register) {
    url = url.split("#");
    this.src = url[0];
    this.register = register;
    this.getObject = new Function("try{var o=" + (url[1] || 0) + "}catch(x){}return o");
  },

//id: null,
//src: "",
//script: null,
//getObject: Undefined,

  attach: true,

  load: function() {
    var object = this.getObject();
    if (!object && !this.script) {
      // load the external script
      _SCRIPT.src = this.src;
      if (!_scripts[_SCRIPT.src]) { // only load a script once
        _scripts[_SCRIPT.src] = true;
        this.script = document.createElement("script");
        this.script.src = this.src;
        behavior.querySelector("head").appendChild(this.script);
      }
      object = this.getObject();
    }
    if (object) {
      this.register(object);
      if (!object.attach) this.attach = false;
    }
    return object;
  }
});

// =========================================================================
// jsb/eventDelegator.js
// =========================================================================

var eventDelegator = new Base({
  types: {},

  addEventListener: function(type, attachments) {
    var types = this.types;
    if (!types[type]) {
      types[type] = [];
      EventTarget.addEventListener(document, type, this, _EVENT_USE_CAPTURE.test(type));
    }
    types[type].push(attachments);
  },

  handleEvent: function(event) {
    var target = event.target;

    if (target.nodeType != 1) return;

    var type = event.type,
        isMouseEvent = _EVENT_MOUSE.test(type),
        capture = isMouseEvent && _captureElement;

    // Don't process mouseover/out when using mouse capture.
    if (capture && _EVENT_OVER_OUT.test(type)) return;

    var map = this.types[type];
    if (!map || !map.length) return;

    // Fix offsetX/Y.
    if (isMouseEvent && type != "mousewheel") {
      if (event.offsetX != null) {
        event = Event.cloneEvent(event);
      }
      var offset = ElementView.getOffsetXY(target, event.clientX, event.clientY);
      event.offsetX = offset.x;
      event.offsetY = offset.y;
    }

    var cancelBubble = capture || !event.bubbles,
        element = capture ? _captureElement : target;

    if (!cancelBubble) {
      extend(event, "stopPropagation", function() {
        this.base();
        cancelBubble = true;
      });
    }

    // Dispatch events.
    do {
      var uniqueID = element.uniqueID;
      if (_allAttachments[uniqueID]) {
        for (var i = 0, attachments; attachments = map[i]; i++) {
          // make sure it's an attached element
          if (attachments[uniqueID]) {
            eventDispatcher.dispatch(attachments.behavior, element, event);
          }
        }
      }
      element = element.parentNode;
    } while (element && !cancelBubble);
  }
});

// =========================================================================
// jsb/eventDispatcher.js
// =========================================================================

var eventDispatcher = new Base({
  dispatch: function(behavior, element, event, isPseudoEvent) {
    var type = event.type;
    _jsbEvent.listener = behavior["on" + type];

    if (!_jsbEvent.listener || _jsbEvent.listener == Undefined) return;

    _jsbEvent.behavior = behavior;
    var args = _jsbEvent.args = [element, event];

    // Build the event signature.
    if (_EVENT_MOUSE.test(type)) {
      if (type == "mousewheel") {
        args.push(event.wheelDelta);
      } else {
        if (_EVENT_BUTTON.test(type)) {
          if (behavior.jsbExtendedMouse) {
            args.push(event.button);
          } else {
            if (!_MOUSE_BUTTON_LEFT.test(event.button || 0)) return;
          }
        }
        if (element == event.target) {
          var x = event.offsetX,
              y = event.offsetY;
        } else {
          var offset = ElementView.getOffsetXY(element, event.clientX, event.clientY);
          x = offset.x;
          y = offset.y;
        }
        args.push(x, y, event.screenX, event.screenY);
      }
    } else if (_EVENT_TEXT.test(type)) {
      args.push(event.keyCode, event.shiftKey, event.ctrlKey, event.altKey, event.metaKey);
    } else if (type == "propertychange" || type == "propertyset" || type == "transitionend") {
      args.push(event.propertyName);
      if (type == "propertychange") args.push(event.newValue);
    }

    // Trigger the underlying event.
    // Use the host's event dispatch mechanism so that we get a real
    // execution context.
    if (behavior.jsbUseDispatch && (isPseudoEvent || event.bubbles || event.eventPhase == Event.CAPTURING_PHASE)) {
      if (_fire) {
        _fire.jsbEvents++;
      } else {
        var fire = document.createEvent(_GENERIC_EVENTS);
        fire.initEvent("jsbEvents", false, false);
        document.dispatchEvent(fire);
      }
    } else {
      _jsbEvent.listener.apply(behavior, args);
    }
  }
});

// The dispatch mechanism.
var _jsbEvent = _private.jsbEvent = {};
if (detect.MSIE && !detect("element.dispatchEvent")) {
  var _fire = document.createElement(/^CSS/.test(document.compatMode) ? "meta" : "marquee");

  _fire.jsbEvents = 0;
  _fire.attachEvent("onpropertychange", new Function("e", '\
if(e.propertyName=="jsbEvents"){\
var d=$$base2.jsbEvent;\
d.listener.apply(d.behavior,d.args);\
delete d.listener;delete d.behavior;delete d.args\
}'));

  document.getElementsByTagName("head")[0].appendChild(_fire);
} else {
  document.addEventListener("jsbEvents", function() {
    _jsbEvent.listener.apply(_jsbEvent.behavior, _jsbEvent.args);
  }, false);
}

var _jsbCustomEvent = DocumentEvent.createEvent(document, _GENERIC_EVENTS);
_jsbCustomEvent.initEvent("dummy", false, false);
_jsbCustomEvent = Event.cloneEvent(_jsbCustomEvent);

function _dispatchJSBEvent(behavior, element, type) {
  _jsbCustomEvent.target = element;
  _jsbCustomEvent.type = type;
  eventDispatcher.dispatch(behavior, element, _jsbCustomEvent, true);
};

// =========================================================================
// jsb/engine.js
// =========================================================================

var engine = new Base({
  timestamp: Date2.now(),

  contentReadyQueue: [],
  documentReadyQueue: [],
  liveRules: [],
  rules: [],
  loaded: _private.isReady,

  onDOMContentLoaded: function() {
    engine.loaded = true;
    if (!engine.ready && !engine.rules.length) {
      setTimeout(engine.fireReady, engine.getInterval());
    }
  },

  onblur: function() {
    engine._lastFocusElement = engine._focusElement;
    engine._focusElement = null;
  },

  onfocus: function(event) {
    engine._focusElement = event.target;
  },

  onmousedown: function(event) {
    engine.active = engine.busy = true;
  },

  onmouseup: function() {
    engine.active = engine.busy = false;
  },

  addRule: function(selector, behavior) {
    var rule = {
      query: selector.toDOMQuery(),
      behavior: behavior
    };
    ;;; rule.toString = selector.toString;
    engine.liveRules.push(rule);
    if (!engine.loaded) {
      engine.rules.push(rule);
    }
    if (!engine.started) {
      engine.started = true;
      engine.tick(); // start the timer
    }
  },

  getInterval: function() {
    return engine.busy ? jsb.INTERVAL * 10 : jsb.INTERVAL;
  },

  fireReady: function() {
    if (!engine.ready) {
      engine.ready = true;
      Array2.batch(engine.documentReadyQueue, function(item) {
        _dispatchJSBEvent(item.behavior, item.element, "documentready");
      }, jsb.TIMEOUT, engine.parseComplete);
      engine.documentReadyQueue = [];
    }
  },

  isContentReady: function(element) {
    if (engine.loaded) return true;
    if (_HTML_BODY.test(element.nodeName)) return false;
    while (element && !element.nextSibling) {
      element = element.parentNode;
    }
    return !!element;
  },

  parseComplete: function() {
    engine.rules = Array2.filter(engine.liveRules, function(rule) {
      return !!rule.behavior.attach;// && !rule.disabled;
    });
    engine.tick();
  },

  tick: function(i, j, elements) {
    var timestamp = Date2.now(),
        rules = engine.rules,
        count = rules.length;

    if (!engine.busy && engine.timestamp - timestamp <= jsb.INTERVAL) {
      engine.timestamp = timestamp;

      // Process the contentready queue.
      var contentReadyQueue = engine.contentReadyQueue;
      var now = Date2.now(), start = now, k = 0;
      while (contentReadyQueue.length && (now - start < jsb.TIMEOUT)) {
        var item = contentReadyQueue.shift();
        if (engine.isContentReady(item.element)) {
          _dispatchJSBEvent(item.behavior, item.element, "contentready");
        } else {
          contentReadyQueue.push(item); // add it to the end
        }
        if (k++ < 5 || k % 50 == 0) now = Date2.now();
      }

      // Process attachments.
      while (count && rules.length && (now - start < jsb.TIMEOUT)) {
        if (i == null) i = j = 0;
        var rule = rules[i],
            behavior = rule.behavior;

        if (behavior.attach) {
          // Execute a DOM query.
          var queryComplete = false;
          if (!elements) {
            var query = rule.query;
            elements = query.state
              ? query.apply(null, query.state)
              : query(document, behavior.constructor == External ? 2 : jsb.QUERY_SIZE);
            queryComplete = !!query.complete;
          }

          now = Date2.now(); // update the clock

          var length = elements.length, k = 0;

          if (length && behavior.constructor == External) {
            // Load the external behavior.
            rule.behavior = behavior.load() || behavior;
            delete query.state;
            elements = null;
            i++;
          } else {
            // Attach behaviors.
            while (j < length && (now - start < jsb.TIMEOUT)) {
              behavior.attach(elements[j++]);
              if (k++ < 5 || k % 50 == 0) now = Date2.now();
            }

            // Maintain the loop.
            if (j == length) { // no more elements
              j = 0;
              elements = null;
              if (engine.loaded && queryComplete) { // stop processing after DOMContentLoaded
                rules.splice(i, 1); // rules.removeAt(i);
                delete query.state;
              } else i++;
            }
          }
        } else {
          rules.splice(i, 1); // rules.removeAt(i);
        }
        if (i >= rules.length) i = 0; // at end, loop to first rule
        count--;
      }
    }
    if (rules.length) {
      var callback = function(){engine.tick(i, j, elements)};
    } else {
      if (engine.ready) {
        callback = engine.parseComplete;
      } else {
        callback = engine.fireReady;
      }
    }
    setTimeout(callback, engine.getInterval());
  }
});

for (var i in engine) if (_EVENT.test(i)) {
  EventTarget.addEventListener(document, i.slice(2), engine[i], i != "onDOMContentLoaded");
}

// =========================================================================
// jsb/package.js
// =========================================================================

// JavaScript Behaviors.
var jsb = global.jsb = new Package({
  name:    "jsb",
  version: "0.9.8",

  exports: {
    Rule: Rule,
    RuleList: RuleList,
    behavior: behavior
  },

  host: _getCurrentHost(),

  // Interval between refreshes of the rule engine.
  INTERVAL:  25, // milliseconds

  // Max time for hogging the processor.
  TIMEOUT: 100, // milliseconds

  // Restrict the number of elements returned by a DOM query.
  // This ensures that the tick() function does not run for too long.
  // It also ensures that elements are returned in batches appropriate
  // for consistent rendering.
  QUERY_SIZE: 100,

  // Simple style sheet creation.
  // This is overridden later to provide more complex style sheet creation.

  createStyleSheet: function(cssText) {
    var style = document.createElement("style");
    style.appendChild(document.createTextNode(cssText));
    new Selector("head").exec(document, true).appendChild(style);
  },

  "@(document.createStyleSheet)": {
    createStyleSheet: function(cssText) {
      document.createStyleSheet().cssText = cssText;
    }
  }
});

// =========================================================================
// jsb/createStyleSheet.js
// =========================================================================

extend(jsb, "createStyleSheet", function(cssText) {
  if (typeof cssText != "string") {
    var rules = cssText;

    var styleSheet = {
      toString: function() {
        return reduce(this, function(rules, properties, selector) {
          rules.push(selector + properties);
          return rules;
        }, []).join("\n").replace(/!([^\w])/g, "!important$1");
      }
    };

    var baseRule;

    var createRule = function(properties, selector) {
      if (/,/.test(selector)) {
        forEach (new Selector(selector).split(), partial(createRule, properties));
      } else {
        if (!baseRule) {
          baseRule = selector == "*" ? properties : {};
        }
        if (selector != "*") {
          var rule = styleSheet[selector];
          if (!rule) {
            rule = styleSheet[selector] = extend({toString: function() {
              return " {\n" +
                reduce(this, function(propertyList, value, propertyName) {
                  if (typeof value == "function") value = "none";
                  propertyList.push("  " + propertyName.replace(/[A-Z]/g, function(captialLetter) {
                    return "-" + captialLetter.toLowerCase();
                  }) + ": " + value);
                  return propertyList;
                }, []).join(";\n") +
              "\n}";
            }}, baseRule);
          }
          forEach.detect (properties, function(value, propertyName) {
            if (typeof _style[propertyName] == "undefined") {
              propertyName = CSSStyleDeclaration.getPropertyName(propertyName);
            }
            if (typeof _style[propertyName] != "undefined") {
              if (value == "initial") {
                forEach (rule, function(initialPropertyValue, initialPropertyName) {
                  if (initialPropertyName.indexOf(propertyName) == 0) {
                    delete rule[initialPropertyName];
                  }
                });
                delete rule[propertyName];
              } else {
                /*@if (@_jscript_version < 5.6)
                if (propertyName == "cursor" && value == "pointer") value = "hand";
                /*@end @*/
                rule[propertyName] = value;
              }
            }
          });
        }
      }
    };

    forEach.detect (rules, createRule);

    cssText = styleSheet.toString();
  }

  // This shouldn't really be here.
  // JSB shouldn't really know about Chrome. Oh well.
  cssText = cssText.replace(/%theme%/g, "themes/" + jsb.theme);

  var URL = /(url\s*\(\s*['"]?)([\w\.]+[^:\)]*['"]?\))/gi;
  this.base(cssText.replace(URL, "$1" + _getCurrentHost() + "$2"));

  return cssText;
});

// =========================================================================
// jsb/init.js
// =========================================================================

// release capture

EventTarget.addEventListener(window, "blur", function(event) {
  var element = _captureElement;
  if (element && document.body == engine._lastFocusElement) {
    behavior.releaseCapture();
    if (behavior.matchesSelector(element, ":hover")) {
      behavior.dispatchEvent(element, "mouseout");
    }
  }
}, false);

ClassList.add(document.documentElement, "jsb-enabled");

}); // end: package
