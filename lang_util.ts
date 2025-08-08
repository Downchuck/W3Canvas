colorjack.util = (function() {
	function mixin(...objects: any[]): any {
		const result: any = {};
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

	function extend(object1: any, object2: any): any {
		for (var i in object2) {
		  object1[i] = object2[i];
		}
		return object1;
	 };

	function debuginfo(obj: any): string {
		var z = '';
		for (var x in obj) {
			//if (obj.hasOwnProperty(x)) {
				z += x + ":" + obj[x] + ",";
			//}
		}
		z = (z.length > 2)? z.substring(0, z.length-3) : '';
		return z;
	}

	function clone<T>(obj: T): T { // http://keithdevens.com/weblog/archive/2007/Jun/07/javascript.clone
		if(obj == null || typeof(obj) != 'object') {
			return obj;
		}

		var temp = new (obj as any).constructor(); // changed (twice)

		for (var key in obj) {
			temp[key] = clone(obj[key]);
		}
		return temp;
	}
	 function isWordSeparator(ch: string): boolean {
	return (ch == ' ' || ch == '\t' || ch == '\n' || ch == ',' || ch == ';' || ch == '.');
  };

  return {
    mixin: mixin,
    extend: extend,
    clone: clone,
    isWordSeparator: isWordSeparator
  };

 })();