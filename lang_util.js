// API use: mixin(base, more specialized subclass, much more specialized subclass)
//
// mixin: properties are overwritten by subsequent prop, prop2

var colorjack = {
  window: window,
  document: window.document
};


colorjack.util = (function() {
	function mixin(obj1, prop, prop2, prop3) {
		var result = {};
		result.prototype = obj1.prototype;	// Should we just use the Object.prototype?
		
		extend(result, obj1);
		extend(result, prop);
		extend(result, prop2);
		extend(result, prop3);
		
		return result;
	  };
	  
	function extend(object1, object2) {
		for (var i in object2) {
		  object1[i] = object2[i];
		}
		return object1;
	 };

	function debuginfo(obj) {
		var z = '';
		for (var x in obj) {
			//if (obj.hasOwnProperty(x)) {
				z += x + ":" + obj[x] + ",";
			//}
		}
		z = (z.length > 2)? z.substring(0, z.length-3) : '';
		return z;
	}

	function clone(obj) { // http://keithdevens.com/weblog/archive/2007/Jun/07/javascript.clone
		if(obj == null || typeof(obj) != 'object') {
			return obj;
		}

		var temp = new obj.constructor(); // changed (twice)

		for (var key in obj) {
			temp[key] = clone(obj[key]);
		}
		return temp;
	}
	 function isWordSeparator(ch) {
  	return (ch == ' ' || ch == '\t' || ch == '\n' || ch == ',' || ch == ';' || ch == '.');
  };

  return {
    mixin: mixin,
    extend: extend,
    clone: clone,
    isWordSeparator: isWordSeparator
  };
  
 })();