"use strict";
colorjack.util = (function () {
    function mixin() {
        var objects = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            objects[_i] = arguments[_i];
        }
        var result = {};
        for (var _a = 0, objects_1 = objects; _a < objects_1.length; _a++) {
            var obj = objects_1[_a];
            if (obj) {
                for (var key in obj) {
                    if (Object.prototype.hasOwnProperty.call(obj, key)) {
                        result[key] = obj[key];
                    }
                }
            }
        }
        return result;
    }
    ;
    function extend(object1, object2) {
        for (var i in object2) {
            object1[i] = object2[i];
        }
        return object1;
    }
    ;
    function debuginfo(obj) {
        var z = '';
        for (var x in obj) {
            //if (obj.hasOwnProperty(x)) {
            z += x + ":" + obj[x] + ",";
            //}
        }
        z = (z.length > 2) ? z.substring(0, z.length - 3) : '';
        return z;
    }
    function clone(obj) {
        if (obj == null || typeof (obj) != 'object') {
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
    }
    ;
    return {
        mixin: mixin,
        extend: extend,
        clone: clone,
        isWordSeparator: isWordSeparator
    };
})();
