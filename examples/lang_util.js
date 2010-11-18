// API use: mixin(base, more specialized subclass, much more specialized subclass)
//
// mixin: properties are overwritten by subsequent prop, prop2

function mixin(obj1, prop, prop2, prop3) {
	var result = {};
	result.prototype = obj1.prototype;	// Should we just use the Object.prototype?
	
	for (var x in obj1) {
		result[x] = obj1[x];
	}
	for (var y in prop) {
		result[y] = prop[y];
	}
	if (prop2 !== undefined) {
		for (var z in prop2) {
			result[z] = prop2[z];
		}
	}
	if (prop3 !== undefined) {
		for (var a in prop3) {
			result[a] = prop3[a];
		}
	}
	return result;
}

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