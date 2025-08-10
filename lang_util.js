export function mixin(...objects) {
	const result = {};
	for (const obj of objects) {
		if (obj) {
			for (const key in obj) {
				if (Object.prototype.hasOwnProperty.call(obj, key)) {
					result[key] = obj[key];
				}
			}
		}
	}
	return result;
};

export function extend(object1, object2) {
	for (var i in object2) {
		object1[i] = object2[i];
	}
	return object1;
};

export function clone(obj) { // http://keithdevens.com/weblog/archive/2007/Jun/07/javascript.clone
	if(obj == null || typeof(obj) != 'object') {
		return obj;
	}

	var temp = new obj.constructor(); // changed (twice)

	for (var key in obj) {
		temp[key] = clone(obj[key]);
	}
	return temp;
}
export function isWordSeparator(ch) {
	return (ch == ' ' || ch == '\t' || ch == '\n' || ch == ',' || ch == ';' || ch == '.');
};