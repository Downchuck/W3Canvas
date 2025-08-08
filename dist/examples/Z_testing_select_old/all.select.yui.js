"use strict";
function mixin(c, b, e, d) { var k = {}; k.prototype = c.prototype; for (var j in c) {
    k[j] = c[j];
} for (var g in b) {
    k[g] = b[g];
} if (e !== undefined) {
    for (var f in e) {
        k[f] = e[f];
    }
} if (d !== undefined) {
    for (var h in d) {
        k[h] = d[h];
    }
} return k; }
function debuginfo(b) { var c = ""; for (var a in b) {
    c += a + ":" + b[a] + ",";
} c = (c.length > 2) ? c.substring(0, c.length - 3) : ""; return c; }
function clone(c) { if (c == null || typeof (c) != "object") {
    return c;
} var a = new c.constructor(); for (var b in c) {
    a[b] = clone(c[b]);
} return a; }
var WindowsLib = { getWindowView: function () { return document.defaultView.window; }, createCanvasLayer: function (a, c) { var b = document.createElement("canvas"); b.style.position = "absolute"; b.style.visibility = "hidden"; if (a && c) {
        WindowsLib.setCanvasSize(b, a, c);
    } return b; }, setCanvasSize: function (b, a, c) { b.setAttribute("width", a); b.setAttribute("height", c); }, setBorder: function (c, e, a, d) { var b = e + "px " + a; if (d !== undefined) {
        b += " solid";
    } c.style.border = b; }, getBackgroundColor: function () { var b = "white"; try {
        b = document.body.bgColor;
    }
    catch (a) { } return b; } };
var GraphicsLib = function () { var b = function (d, l, e, j, k) { var f = document.createElement("canvas"); f.setAttribute("width", e); f.setAttribute("height", j); var g = f.getContext("2d"); d = Math.round(d); l = Math.round(l); e = Math.round(e); j = Math.round(j); g.drawImage(k, d, l, e, j, 0, 0, e, j); var c = g.canvas; return c; }; var a = function (f, e, c, j, d, g) { f.save(); f.globalCompositeOperation = "copy"; f.drawImage(e, 0, 0, d, g, c, j, d, g); f.restore(); }; return { restoreBufferImage: a, createBufferImage: b }; };
var round_rectangle = function (r, o, m, q, g, j, f) { if (!g) {
    alert("round_rectangle(): Missing arguments!");
} var a = Math.max(7, Math.min(g / 4, 60)); var l = j || a; var k = f || a; var b = 0; var d = 0; var e = 0; var c = 0; var p = 0; var n = 0; if (l > Math.min(q, g) / 2) {
    l = Math.min(q, g) / 2;
} if (k > Math.min(q, g) / 2) {
    k = Math.min(q, g) / 2;
} b = Math.PI / 4; r.beginPath(); r.moveTo(o + l, m); r.lineTo(o + q - l, m); d = -Math.PI / 2; e = o + q - l + (Math.cos(d + (b / 2)) * l / Math.cos(b / 2)); c = m + k + (Math.sin(d + (b / 2)) * k / Math.cos(b / 2)); p = o + q - l + (Math.cos(d + b) * l); n = m + k + (Math.sin(d + b) * k); r.quadraticCurveTo(e, c, p, n); d += b; e = o + q - l + (Math.cos(d + (b / 2)) * l / Math.cos(b / 2)); c = m + k + (Math.sin(d + (b / 2)) * k / Math.cos(b / 2)); p = o + q - l + (Math.cos(d + b) * l); n = m + k + (Math.sin(d + b) * k); r.quadraticCurveTo(e, c, p, n); r.lineTo(o + q, m + g - k); d += b; e = o + q - l + (Math.cos(d + (b / 2)) * l / Math.cos(b / 2)); c = m + g - k + (Math.sin(d + (b / 2)) * k / Math.cos(b / 2)); p = o + q - l + (Math.cos(d + b) * l); n = m + g - k + (Math.sin(d + b) * k); r.quadraticCurveTo(e, c, p, n); d += b; e = o + q - l + (Math.cos(d + (b / 2)) * l / Math.cos(b / 2)); c = m + g - k + (Math.sin(d + (b / 2)) * k / Math.cos(b / 2)); p = o + q - l + (Math.cos(d + b) * l); n = m + g - k + (Math.sin(d + b) * k); r.quadraticCurveTo(e, c, p, n); r.lineTo(o + l, m + g); d += b; e = o + l + (Math.cos(d + (b / 2)) * l / Math.cos(b / 2)); c = m + g - k + (Math.sin(d + (b / 2)) * k / Math.cos(b / 2)); p = o + l + (Math.cos(d + b) * l); n = m + g - k + (Math.sin(d + b) * k); r.quadraticCurveTo(e, c, p, n); d += b; e = o + l + (Math.cos(d + (b / 2)) * l / Math.cos(b / 2)); c = m + g - k + (Math.sin(d + (b / 2)) * k / Math.cos(b / 2)); p = o + l + (Math.cos(d + b) * l); n = m + g - k + (Math.sin(d + b) * k); r.quadraticCurveTo(e, c, p, n); r.lineTo(o, m + k); d += b; e = o + l + (Math.cos(d + (b / 2)) * l / Math.cos(b / 2)); c = m + k + (Math.sin(d + (b / 2)) * k / Math.cos(b / 2)); p = o + l + (Math.cos(d + b) * l); n = m + k + (Math.sin(d + b) * k); r.quadraticCurveTo(e, c, p, n); d += b; e = o + l + (Math.cos(d + (b / 2)) * l / Math.cos(b / 2)); c = m + k + (Math.sin(d + (b / 2)) * k / Math.cos(b / 2)); p = o + l + (Math.cos(d + b) * l); n = m + k + (Math.sin(d + b) * k); r.quadraticCurveTo(e, c, p, n); r.closePath(); };
var setupLinearGradient = function (k, g, f, j, d, e, b, c) { var a = (c) ? k.createLinearGradient(g, f, g, f + d) : k.createLinearGradient(g, f, g + j, f); a.addColorStop(0, e); a.addColorStop((c) ? 1 : 0.7, b); k.fillStyle = a; };
var s = 2;
var gradient_round_rectangle = function (c, a, j, b, d, g, e, f) { c.save(); if (f) {
    c.fillStyle = f;
    c.fillRect(a - s, j - s, b + 2 * s, d + 2 * s);
} round_rectangle(c, a, j, b, d); setupLinearGradient(c, a, j, b, d, g, e); c.clip(); c.fill(); c.restore(); };
var paintImage = function (j, a, b, d, f) { d = d || "left"; f = f || "center"; if (!d || !f) {
    alert("paintImage(): Missing halign, valign");
} var g = b.x; var e = b.y; var c = Math.max(0, b.width - a.width); if (d == "left") { }
else {
    if (d == "center") {
        g = b.x + c / 2;
    }
    else {
        if (d == "right") {
            g = b.x + c;
        }
    }
} var h = Math.max(0, b.height - a.height); if (f == "top") { }
else {
    if (f == "center") {
        e = b.y + h / 2;
    }
    else {
        if (f == "bottom") {
            e = b.y + h;
        }
    }
} j.save(); clipToArea(j, b); j.drawImage(a, g, e); j.restore(); };
var base2 = { name: "base2", version: "1.0 (beta 2)", exports: "Base,Package,Abstract,Module,Enumerable,Map,Collection,RegGrp,assert,assertArity,assertType,assignID,copy,detect,extend,forEach,format,global,instanceOf,match,rescape,slice,trim,typeOf,I,K,Undefined,Null,True,False,bind,delegate,flip,not,unbind", global: this, detect: new function (_) {
        var global = _;
        var jscript = NaN;
        var java = _.java ? true : false;
        if (_.navigator) {
            var MSIE = /MSIE[\d.]+/g;
            var element = document.createElement("span");
            var userAgent = navigator.userAgent.replace(/([a-z])[\s\/](\d)/gi, "$1$2");
            if (!jscript) {
                userAgent = userAgent.replace(MSIE, "");
            }
            if (MSIE.test(userAgent)) {
                userAgent = userAgent.match(MSIE)[0] + " " + userAgent.replace(MSIE, "");
            }
            userAgent = navigator.platform + " " + userAgent;
            java &= navigator.javaEnabled();
        }
        return function (a) { var r = false; var b = a.charAt(0) == "!"; if (b) {
            a = a.slice(1);
        } if (a.charAt(0) == "(") {
            try {
                eval("r=!!" + a);
            }
            catch (e) { }
        }
        else {
            r = new RegExp("(" + a + ")", "i").test(userAgent);
        } return !!(b ^ r); };
    }(this) };
new function (_) {
    var _0 = "function base(o,a){return o.base.apply(o,a)};";
    eval(_0);
    var detect = base2.detect;
    var Undefined = K(), Null = K(null), True = K(true), False = K(false);
    var _1 = /%([1-9])/g;
    var _2 = /^\s\s*/;
    var _3 = /\s\s*$/;
    var _4 = /([\/()[\]{}|*+-.,^$?\\])/g;
    var _5 = /eval/.test(detect) ? /\bbase\s*\(/ : /.*/;
    var _6 = ["constructor", "toString", "valueOf"];
    var _7 = detect("(jscript)") ? new RegExp("^" + rescape(isNaN).replace(/isNaN/, "\\w+") + "$") : { test: False };
    var _8 = 1;
    var _9 = Array.prototype.slice;
    var slice = Array.slice || function (a) { return _9.apply(a, _9.call(arguments, 1)); };
    _10();
    var _11 = function (a, b) { base2.__prototyping = this.prototype; var c = new this; extend(c, a); delete base2.__prototyping; var d = c.constructor; function e() { if (!base2.__prototyping) {
        if (this.constructor == arguments.callee || this.__constructing) {
            this.__constructing = true;
            d.apply(this, arguments);
            delete this.__constructing;
        }
        else {
            return extend(arguments[0], c);
        }
    } return this; } c.constructor = e; for (var i in Base) {
        e[i] = this[i];
    } e.ancestor = this; e.base = Undefined; e.init = Undefined; extend(e, b); e.prototype = c; e.init(); return e; };
    var Base = _11.call(Object, { constructor: function () { if (arguments.length > 0) {
            this.extend(arguments[0]);
        } }, base: function () { }, extend: delegate(extend) }, Base = { ancestorOf: delegate(_12), extend: _11, forEach: delegate(_10), implement: function (a) { if (typeof a == "function") {
            if (_12(Base, a)) {
                a(this.prototype);
            }
        }
        else {
            extend(this.prototype, a);
        } return this; } });
    var Package = Base.extend({ constructor: function (d, e) { this.extend(e); if (this.init) {
            this.init();
        } if (this.name != "base2") {
            if (!this.parent) {
                this.parent = base2;
            }
            this.parent.addName(this.name, this);
            this.namespace = format("var %1=%2;", this.name, String(this).slice(1, -1));
        } var f = /[^\s,]+/g; if (d) {
            d.imports = Array2.reduce(this.imports.match(f), function (a, b) { eval("var ns=base2." + b); assert(ns, format("Package not found: '%1'.", b), ReferenceError); return a += ns.namespace; }, _0 + base2.namespace + JavaScript.namespace);
            d.exports = Array2.reduce(this.exports.match(f), function (a, b) { var c = this.name + "." + b; this.namespace += "var " + b + "=" + c + ";"; return a += "if(!" + c + ")" + c + "=" + b + ";"; }, "", this);
        } }, exports: "", imports: "", name: "", namespace: "", parent: null, addName: function (a, b) { if (!this[a]) {
            this[a] = b;
            this.exports += "," + a;
            this.namespace += format("var %1=%2.%1;", a, this.name);
        } }, addPackage: function (a) { this.addName(a, new Package(null, { name: a, parent: this })); }, toString: function () { return format("[%1]", this.parent ? String(this.parent).slice(1, -1) + "." + this.name : this.name); } });
    var Abstract = Base.extend({ constructor: function () { throw new TypeError("Class cannot be instantiated."); } });
    var Module = Abstract.extend(null, { extend: function (a, b) { var c = this.base(); c.implement(this); c.implement(a); extend(c, b); c.init(); return c; }, implement: function (d) { var e = this; if (typeof d == "function") {
            if (!_12(d, e)) {
                this.base(d);
            }
            if (_12(Module, d)) {
                forEach(d, function (a, b) { if (!e[b]) {
                    if (typeof a == "function" && a.call && d.prototype[b]) {
                        a = function () { return d[b].apply(d, arguments); };
                    }
                    e[b] = a;
                } });
            }
        }
        else {
            extend(e, d);
            _10(Object, d, function (b, c) { if (c.charAt(0) == "@") {
                if (detect(c.slice(1))) {
                    forEach(b, arguments.callee);
                }
            }
            else {
                if (typeof b == "function" && b.call) {
                    e.prototype[c] = function () { var a = _9.call(arguments); a.unshift(this); return e[c].apply(e, a); };
                }
            } });
        } return e; } });
    var Enumerable = Module.extend({ every: function (c, d, e) { var f = true; try {
            this.forEach(c, function (a, b) { f = d.call(e, a, b, c); if (!f) {
                throw StopIteration;
            } });
        }
        catch (error) {
            if (error != StopIteration) {
                throw error;
            }
        } return !!f; }, filter: function (d, e, f) { var i = 0; return this.reduce(d, function (a, b, c) { if (e.call(f, b, c, d)) {
            a[i++] = b;
        } return a; }, []); }, invoke: function (b, c) { var d = _9.call(arguments, 2); return this.map(b, (typeof c == "function") ? function (a) { return (a == null) ? undefined : c.apply(a, d); } : function (a) { return (a == null) ? undefined : a[c].apply(a, d); }); }, map: function (c, d, e) { var f = [], i = 0; this.forEach(c, function (a, b) { f[i++] = d.call(e, a, b, c); }); return f; }, pluck: function (b, c) { return this.map(b, function (a) { return (a == null) ? undefined : a[c]; }); }, reduce: function (c, d, e, f) { var g = arguments.length > 2; this.forEach(c, function (a, b) { if (g) {
            e = d.call(f, e, a, b, c);
        }
        else {
            e = a;
            g = true;
        } }); return e; }, some: function (a, b, c) { return !this.every(a, not(b), c); } }, { forEach: forEach });
    var _13 = "#";
    var Map = Base.extend({ constructor: function (a) { this.merge(a); }, copy: delegate(copy), forEach: function (a, b) { for (var c in this) {
            if (c.charAt(0) == _13) {
                a.call(b, this[c], c.slice(1), this);
            }
        } }, get: function (a) { return this[_13 + a]; }, getKeys: function () { return this.map(flip(I)); }, getValues: function () { return this.map(I); }, has: function (a) {
            /*@cc_on@*/
            /*@if(@_14<5.5)return $Legacy.has(this,_13+a);@else@*/
            return _13 + a in this;
            /*@end@*/
        }, merge: function (b) { var c = flip(this.put); forEach(arguments, function (a) { forEach(a, c, this); }, this); return this; }, remove: function (a) { delete this[_13 + a]; }, put: function (a, b) { if (arguments.length == 1) {
            b = a;
        } this[_13 + a] = b; }, size: function () { var a = 0; for (var b in this) {
            if (b.charAt(0) == _13) {
                a++;
            }
        } return a; }, union: function (a) { return this.merge.apply(this.copy(), arguments); } });
    Map.implement(Enumerable);
    var _15 = "~";
    var Collection = Map.extend({ constructor: function (a) { this[_15] = new Array2; this.base(a); }, add: function (a, b) { assert(!this.has(a), "Duplicate key '" + a + "'."); this.put.apply(this, arguments); }, copy: function () { var a = this.base(); a[_15] = this[_15].copy(); return a; }, forEach: function (a, b) { var c = this[_15]; var d = c.length; for (var i = 0; i < d; i++) {
            a.call(b, this[_13 + c[i]], c[i], this);
        } }, getAt: function (a) { if (a < 0) {
            a += this[_15].length;
        } var b = this[_15][a]; return (b === undefined) ? undefined : this[_13 + b]; }, getKeys: function () { return this[_15].concat(); }, indexOf: function (a) { return this[_15].indexOf(String(a)); }, insertAt: function (a, b, c) { assert(Math.abs(a) < this[_15].length, "Index out of bounds."); assert(!this.has(b), "Duplicate key '" + b + "'."); this[_15].insertAt(a, String(b)); this[_13 + b] == null; this.put.apply(this, _9.call(arguments, 1)); }, item: function (a) { return this[typeof a == "number" ? "getAt" : "get"](a); }, put: function (a, b) { if (arguments.length == 1) {
            b = a;
        } if (!this.has(a)) {
            this[_15].push(String(a));
        } var c = this.constructor; if (c.Item && !instanceOf(b, c.Item)) {
            b = c.create.apply(c, arguments);
        } this[_13 + a] = b; }, putAt: function (a, b) { assert(Math.abs(a) < this[_15].length, "Index out of bounds."); arguments[0] = this[_15].item(a); this.put.apply(this, arguments); }, remove: function (a) { if (this.has(a)) {
            this[_15].remove(String(a));
            delete this[_13 + a];
        } }, removeAt: function (a) { var b = this[_15].removeAt(a); delete this[_13 + b]; }, reverse: function () { this[_15].reverse(); return this; }, size: function () { return this[_15].length; }, sort: function (c) { if (c) {
            var d = this;
            this[_15].sort(function (a, b) { return c(d[_13 + a], d[_13 + b], a, b); });
        }
        else {
            this[_15].sort();
        } return this; }, toString: function () { return String(this[_15]); } }, { Item: null, create: function (a, b) { return this.Item ? new this.Item(a, b) : b; }, extend: function (a, b) { var c = this.base(a); c.create = this.create; extend(c, b); if (!c.Item) {
            c.Item = this.Item;
        }
        else {
            if (typeof c.Item != "function") {
                c.Item = (this.Item || Base).extend(c.Item);
            }
        } c.init(); return c; } });
    var _16 = /\\(\d+)/g, _17 = /\\./g, _18 = /\(\?[:=!]|\[[^\]]+\]/g, _19 = /\(/g, _20 = /\$(\d+)/, _21 = /^\$\d+$/;
    var RegGrp = Collection.extend({ constructor: function (a, b) { this.base(a); if (typeof b == "string") {
            this.global = /g/.test(b);
            this.ignoreCase = /i/.test(b);
        } }, global: true, ignoreCase: false, exec: function (f, g) { var h = (this.global ? "g" : "") + (this.ignoreCase ? "i" : ""); f = String(f) + ""; if (arguments.length == 1) {
            var j = this;
            var k = this[_15];
            g = function (a) { if (a) {
                var b, c = 1, i = 0;
                while ((b = j[_13 + k[i++]])) {
                    var d = c + b.length + 1;
                    if (arguments[c]) {
                        var e = b.replacement;
                        switch (typeof e) {
                            case "function": return e.apply(j, _9.call(arguments, c, d));
                            case "number": return arguments[c + e];
                            default: return e;
                        }
                    }
                    c = d;
                }
            } return ""; };
        } return f.replace(new RegExp(this, h), g); }, insertAt: function (a, b, c) { if (instanceOf(b, RegExp)) {
            arguments[1] = b.source;
        } return base(this, arguments); }, test: function (a) { return this.exec(a) != a; }, toString: function () { var e = 0; return "(" + this.map(function (c) { var d = String(c).replace(_16, function (a, b) { return "\\" + (1 + Number(b) + e); }); e += c.length + 1; return d; }).join(")|(") + ")"; } }, { IGNORE: "$0", init: function () { forEach("add,get,has,put,remove".split(","), function (b) { _22(this, b, function (a) { if (instanceOf(a, RegExp)) {
            arguments[0] = a.source;
        } return base(this, arguments); }); }, this.prototype); }, Item: { constructor: function (a, b) { if (typeof b == "number") {
                b = String(b);
            }
            else {
                if (b == null) {
                    b = "";
                }
            } if (typeof b == "string" && _20.test(b)) {
                if (_21.test(b)) {
                    b = parseInt(b.slice(1));
                }
                else {
                    var Q = /'/.test(b.replace(/\\./g, "")) ? '"' : "'";
                    b = b.replace(/\n/g, "\\n").replace(/\r/g, "\\r").replace(/\$(\d+)/g, Q + "+(arguments[$1]||" + Q + Q + ")+" + Q);
                    b = new Function("return " + Q + b.replace(/(['"])\1\+(.*)\+\1\1$/, "$1") + Q);
                }
            } this.length = RegGrp.count(a); this.replacement = b; this.toString = K(String(a)); }, length: 0, replacement: "" }, count: function (a) { a = String(a).replace(_17, "").replace(_18, ""); return match(a, _19).length; } });
    var JavaScript = { name: "JavaScript", version: base2.version, exports: "Array2,Date2,String2", namespace: "", bind: function (c) { forEach(this.exports.match(/\w+/g), function (a) { var b = a.slice(0, -1); extend(c[b], this[a]); this[a](c[b].prototype); }, this); return this; } };
    if ((new Date).getYear() > 1900) {
        Date.prototype.getYear = function () { return this.getFullYear() - 1900; };
        Date.prototype.setYear = function (a) { return this.setFullYear(a + 1900); };
    }
    Function.prototype.prototype = {};
    if ("".replace(/^/, K("$$")) == "$") {
        extend(String.prototype, "replace", function (a, b) { if (typeof b == "function") {
            var c = b;
            b = function () { return String(c.apply(null, arguments)).split("$").join("$$"); };
        } return this.base(a, b); });
    }
    var Array2 = _23(Array, Array, "concat,join,pop,push,reverse,shift,slice,sort,splice,unshift", [Enumerable, { combine: function (d, e) { if (!e) {
                e = d;
            } return this.reduce(d, function (a, b, c) { a[b] = e[c]; return a; }, {}); }, contains: function (a, b) { return this.indexOf(a, b) != -1; }, copy: function (a) { var b = _9.call(a); if (!b.swap) {
                this(b);
            } return b; }, flatten: function (c) { var d = 0; return this.reduce(c, function (a, b) { if (this.like(b)) {
                this.reduce(b, arguments.callee, a, this);
            }
            else {
                a[d++] = b;
            } return a; }, [], this); }, forEach: _24, indexOf: function (a, b, c) { var d = a.length; if (c == null) {
                c = 0;
            }
            else {
                if (c < 0) {
                    c = Math.max(0, d + c);
                }
            } for (var i = c; i < d; i++) {
                if (a[i] === b) {
                    return i;
                }
            } return -1; }, insertAt: function (a, b, c) { this.splice(a, b, 0, c); return c; }, item: function (a, b) { if (b < 0) {
                b += a.length;
            } return a[b]; }, lastIndexOf: function (a, b, c) { var d = a.length; if (c == null) {
                c = d - 1;
            }
            else {
                if (c < 0) {
                    c = Math.max(0, d + c);
                }
            } for (var i = c; i >= 0; i--) {
                if (a[i] === b) {
                    return i;
                }
            } return -1; }, map: function (c, d, e) { var f = []; this.forEach(c, function (a, b) { f[b] = d.call(e, a, b, c); }); return f; }, remove: function (a, b) { var c = this.indexOf(a, b); if (c != -1) {
                this.removeAt(a, c);
            } return b; }, removeAt: function (a, b) { return this.splice(a, b, 1); }, swap: function (a, b, c) { if (b < 0) {
                b += a.length;
            } if (c < 0) {
                c += a.length;
            } var d = a[b]; a[b] = a[c]; a[c] = d; return a; } }]);
    Array2.reduce = Enumerable.reduce;
    Array2.like = function (a) { return !!(a && typeof a == "object" && typeof a.length == "number"); };
    var _25 = /^((-\d+|\d{4,})(-(\d{2})(-(\d{2}))?)?)?T((\d{2})(:(\d{2})(:(\d{2})(\.(\d{1,3})(\d)?\d*)?)?)?)?(([+-])(\d{2})(:(\d{2}))?|Z)?$/;
    var _26 = { FullYear: 2, Month: 4, Date: 6, Hours: 8, Minutes: 10, Seconds: 12, Milliseconds: 14 };
    var _27 = { Hectomicroseconds: 15, UTC: 16, Sign: 17, Hours: 18, Minutes: 20 };
    var _28 = /(((00)?:0+)?:0+)?\.0+$/;
    var _29 = /(T[0-9:.]+)$/;
    var Date2 = _23(Date, function (a, b, c, h, m, s, d) { switch (arguments.length) {
        case 0: return new Date;
        case 1: return new Date(a);
        default: return new Date(a, b, arguments.length == 2 ? 1 : c, h || 0, m || 0, s || 0, d || 0);
    } }, "", [{ toISOString: function (c) { var d = "####-##-##T##:##:##.###"; for (var e in _26) {
                d = d.replace(/#+/, function (a) { var b = c["getUTC" + e](); if (e == "Month") {
                    b++;
                } return ("000" + b).slice(-a.length); });
            } return d.replace(_28, "").replace(_29, "$1Z"); } }]);
    Date2.now = function () { return (new Date).valueOf(); };
    Date2.parse = function (a, b) { if (arguments.length > 1) {
        assertType(b, "number", "defaultDate should be of type 'number'.");
    } var c = String(a).match(_25); if (c) {
        if (c[_26.Month]) {
            c[_26.Month]--;
        }
        if (c[_27.Hectomicroseconds] >= 5) {
            c[_26.Milliseconds]++;
        }
        var d = new Date(b || 0);
        var e = c[_27.UTC] || c[_27.Hours] ? "UTC" : "";
        for (var f in _26) {
            var g = c[_26[f]];
            if (!g) {
                continue;
            }
            d["set" + e + f](g);
            if (d["get" + e + f]() != c[_26[f]]) {
                return NaN;
            }
        }
        if (c[_27.Hours]) {
            var h = Number(c[_27.Sign] + c[_27.Hours]);
            var i = Number(c[_27.Sign] + (c[_27.Minutes] || 0));
            d.setUTCMinutes(d.getUTCMinutes() + (h * 60) + i);
        }
        return d.valueOf();
    }
    else {
        return Date.parse(a);
    } };
    var String2 = _23(String, function (a) { return new String(arguments.length == 0 ? "" : a); }, "charAt,charCodeAt,concat,indexOf,lastIndexOf,match,replace,search,slice,split,substr,substring,toLowerCase,toUpperCase", [{ trim: trim }]);
    function _23(c, constructor, d, e) { var f = Module.extend(); forEach(d.match(/\w+/g), function (a) { f[a] = unbind(c.prototype[a]); }); forEach(e, f.implement, f); var g = function () { return f(this.constructor == f ? constructor.apply(null, arguments) : arguments[0]); }; g.prototype = f.prototype; forEach(f, function (a, b) { if (c[b]) {
        f[b] = c[b];
        delete f.prototype[b];
    } g[b] = f[b]; }); g.ancestor = Object; delete g.extend; if (c != Array) {
        delete g.forEach;
    } return g; }
    function extend(a, b) { if (a && b) {
        if (arguments.length > 2) {
            var c = b;
            b = {};
            b[c] = arguments[2];
        }
        var d = (typeof b == "function" ? Function : Object).prototype;
        var i = _6.length, c;
        if (base2.__prototyping) {
            while (c = _6[--i]) {
                var e = b[c];
                if (e != d[c]) {
                    if (_5.test(e)) {
                        _22(a, c, e);
                    }
                    else {
                        a[c] = e;
                    }
                }
            }
        }
        for (c in b) {
            if (d[c] === undefined) {
                var e = b[c];
                if (c.charAt(0) == "@") {
                    if (detect(c.slice(1))) {
                        arguments.callee(a, e);
                    }
                    continue;
                }
                var f = a[c];
                if (f && typeof e == "function") {
                    if (e != f && (!f.method || !_12(e, f))) {
                        if (_5.test(e)) {
                            _22(a, c, e);
                        }
                        else {
                            e.ancestor = f;
                            a[c] = e;
                        }
                    }
                }
                else {
                    a[c] = e;
                }
            }
        }
    } return a; }
    function _12(a, b) { while (b) {
        if (!b.ancestor) {
            return false;
        }
        b = b.ancestor;
        if (b == a) {
            return true;
        }
    } return false; }
    function _22(c, d, e) { var f = c[d]; var g = base2.__prototyping; if (g && f != g[d]) {
        g = null;
    } function h() { var a = this.base; this.base = g ? g[d] : f; var b = e.apply(this, arguments); this.base = a; return b; } h.ancestor = f; c[d] = h; }
    if (typeof StopIteration == "undefined") {
        StopIteration = new Error("StopIteration");
    }
    function forEach(a, b, c, d) { if (a == null) {
        return;
    } if (!d) {
        if (typeof a == "function" && a.call) {
            d = Function;
        }
        else {
            if (typeof a.forEach == "function" && a.forEach != arguments.callee) {
                a.forEach(b, c);
                return;
            }
            else {
                if (typeof a.length == "number") {
                    _24(a, b, c);
                    return;
                }
            }
        }
    } _10(d || Object, a, b, c); }
    function _24(a, b, c) {
        if (a == null) {
            return;
        }
        var d = a.length, i;
        if (typeof a == "string") {
            for (i = 0; i < d; i++) {
                b.call(c, a.charAt(i), i, a);
            }
        }
        else {
            for (i = 0; i < d; i++) {
                /*@cc_on@*/
                /*@if(@_14<5.2)if($Legacy.has(a,i))@else@*/
                if (i in a) {
                    /*@end@*/
                    b.call(c, a[i], i, a);
                }
            }
        }
    }
    function _10(g, h, j, k) { var l = function () { this.i = 1; }; l.prototype = { i: 1 }; var m = 0; for (var i in new l) {
        m++;
    } _10 = (m > 1) ? function (a, b, c, d) { var e = {}; for (var f in b) {
        if (!e[f] && a.prototype[f] === undefined) {
            e[f] = true;
            c.call(d, b[f], f, b);
        }
    } } : function (a, b, c, d) { for (var e in b) {
        if (a.prototype[e] === undefined) {
            c.call(d, b[e], e, b);
        }
    } }; _10(g, h, j, k); }
    function typeOf(a) { var b = typeof a; switch (b) {
        case "object": return a === null ? "null" : typeof a.call == "function" || _7.test(a) ? "function" : b;
        case "function": return typeof a.call == "function" ? b : "object";
        default: return b;
    } }
    function instanceOf(a, b) {
        if (typeof b != "function") {
            throw new TypeError("Invalid 'instanceOf' operand.");
        }
        if (a == null) {
            return false;
            /*@cc_on if(typeof a.constructor!="function"){return typeOf(a)==typeof b.prototype.valueOf()}@*/
            /*@if(@_14<5.1)if($Legacy.instanceOf(a,b))return true;@else@*/
        }
        if (a instanceof b) {
            return true;
            /*@end@*/
        }
        if (Base.ancestorOf == b.ancestorOf) {
            return false;
        }
        if (Base.ancestorOf == a.constructor.ancestorOf) {
            return b == Object;
        }
        switch (b) {
            case Array: return !!(typeof a == "object" && a.join && a.splice);
            case Function: return typeOf(a) == "function";
            case RegExp: return typeof a.constructor.$1 == "string";
            case Date: return !!a.getTimezoneOffset;
            case String:
            case Number:
            case Boolean: return typeof a == typeof b.prototype.valueOf();
            case Object: return true;
        }
        return false;
    }
    function assert(a, b, c) { if (!a) {
        throw new (c || Error)(b || "Assertion failed.");
    } }
    function assertArity(a, b, c) { if (b == null) {
        b = a.callee.length;
    } if (a.length < b) {
        throw new SyntaxError(c || "Not enough arguments.");
    } }
    function assertType(a, b, c) { if (b && (typeof b == "function" ? !instanceOf(a, b) : typeOf(a) != b)) {
        throw new TypeError(c || "Invalid type.");
    } }
    function assignID(a) { if (!a.base2ID) {
        a.base2ID = "b2_" + _8++;
    } return a.base2ID; }
    function copy(a) { var b = function () { }; b.prototype = a; return new b; }
    function format(c) { var d = arguments; var e = new RegExp("%([1-" + arguments.length + "])", "g"); return String(c).replace(e, function (a, b) { return d[b]; }); }
    function match(a, b) { return String(a).match(b) || []; }
    function rescape(a) { return String(a).replace(_4, "\\$1"); }
    function trim(a) { return String(a).replace(_2, "").replace(_3, ""); }
    function I(i) { return i; }
    function K(k) { return function () { return k; }; }
    function bind(a, b) { var c = _9.call(arguments, 2); return c.length == 0 ? function () { return a.apply(b, arguments); } : function () { return a.apply(b, c.concat.apply(c, arguments)); }; }
    function delegate(b, c) { return function () { var a = _9.call(arguments); a.unshift(this); return b.apply(c, a); }; }
    function flip(a) { return function () { return a.apply(this, Array2.swap(arguments, 0, 1)); }; }
    function not(a) { return function () { return !a.apply(this, arguments); }; }
    function unbind(b) { return function (a) { return b.apply(a, _9.call(arguments, 1)); }; }
    base2 = new Package(this, base2);
    eval(this.exports);
    base2.extend = extend;
    forEach(Enumerable, function (a, b) { if (!Module[b]) {
        base2.addName(b, bind(a, Enumerable));
    } });
    JavaScript = new Package(this, JavaScript);
    eval(this.exports);
};
var CanvasRenderingContext2DFont = { mozTextStyle: "12pt Arial", defaultFontStyle: { fontSize: "12pt", fontFamily: "Arial", font: "12pt Arial", lineHeight: "1em", strokeWidth: "3", lineWidth: null, color: "#000000", borderColor: "", letterSpacing: "", wordSpacing: "", punctuationTrim: "", textDecoration: "none", textIndent: "0", textWrap: "", wordWrap: "", textAlign: "start", textJustify: "auto", progressionAlign: "before", "writing-mode": "lr-tb", unicodeRange: "U+0000-00FF", fontStyle: "normal", src: 'local("Arial"), url("arial.t1a") format("type-1")', src: 'local("Arial"), url("Arial.svg") format("svg")' }, font: { style: this.defaultFontStyle, value: "", cursor: { x: 0, y: 0 }, x: 0, y: 0 }, fontFaces: {}, fontQueue: [], fontLoadTimeout: 10000, fontLoadWait: 1000, fontQueueTimer: 0, loadFont: function (a) { if (a in this.fontFaces) {
        return;
    } this.fontFaces[a] = { readyState: 1, paths: {}, queue: {} }; var b = {}; if (1 || this.style.format == "type-1") {
        b.args = { url: "inc/" + a + ".t1a", family: a };
        b.onsuccess = function () { this.load(reqProperties.args.family, req.responseText); };
        ajax("inc/" + a + ".t1a", b);
    }
    else {
        if (this.style.format == "svg") { }
    } }, getTextStyle: function () { return this.font.style.fontSize + " " + this.font.style.fontFamily; }, loadFontStyle: function () { if (!this.font.style) {
        this.font.style = this.defaultFontStyle;
    } if (this.font.style.font) {
        this.mozTextStyle = this.font.style.font;
    } if (!this.mozTextStyle.indexOf(" ")) {
        this.mozTextStyle = this.font.style.font = this.getTextStyle();
    } this.font.style.font = this.mozTextStyle; var b = this.mozTextStyle.split(" "); var d = b.pop(); this.font.style.fontFamily = d; if (b.length) {
        var c = b.pop();
        this.font.style.fontSize = parseInt(c) || "px";
        if (c.indexOf("/") > 0) {
            c = c.substr(c.indexOf("/") + 1);
        }
        else {
            c = c * 1.4;
        }
        this.font.style.lineHeight = parseInt(c) || "px";
    } if (this.fillStyle) {
        this.font.style.color = this.fillStyle;
    } if (this.strokeStyle) {
        this.font.style.borderColor = this.strokeStyle;
    } if (this.strokeWidth) {
        this.font.style.borderWidth = this.strokeWidth;
    } if (this.lineWidth) {
        this.font.style.lineWidth = this.lineWidth;
    }
    else {
        if (this.style.fontWeight) {
            this.lineWidth = (this.style.fontWeight * 0.01) * 5;
        }
    } this.font.style.scale = 1 / (716 / parseInt(this.font.style.fontSize)); this.font.size = parseInt(this.font.style.fontSize); if (this.font.style.x) {
        this.font.x = this.font.style.x;
        if (this.font.style.y) {
            this.font.y = this.font.style.y;
        }
    } this.font.style.x = this.font.x; this.font.style.y = this.font.y; this.font.cursor.x = this.font.style.x; this.font.cursor.y = this.font.style.y; this.loadFont(this.font.style.fontFamily); this.font.style.readyState = (this.font.style.fontFamily in this.fontFaces) ? this.fontFaces[this.font.style.fontFamily].readyState : 1; this.font.style.font = this.mozTextStyle; }, mozDrawText: function (e) { if (e.length) {
        this.getTextStyle();
        this.font.value = e;
        this.fontQueue.unshift([this.font.value, this.font.style, this.fontLoadWait]);
    }
    else {
        this.loadFontStyle();
    } if (this.fontQueue.length) {
        var c = this.fontQueue.shift();
        var d = c[1].fontFamily;
        var b = ((d in this.fontFaces) && this.fontFaces[d].readyState && this.fontFaces[d].readyState > 2) ? 1 : 0;
        if (b) {
            this.font.style = c[1];
            this._mozDrawText(this.font.value = c[0]);
        }
        else {
            if (this.fontLoadTimeout > (c[2] += this.fontLoadWait)) {
                this.fontQueue.push([c[0], c[1], c[2]]);
            }
        }
    } if (this.fontQueue.length) {
        this.fontQueueTimer = setTimeout(this.mozDrawText, this.fontLoadWait);
    } }, _mozDrawText: function (a) { this.drawString(a); }, mozPathText: function (a) { this.mozDrawText(a); }, mozTextAlongPath: function (b, a) { if (!a) {
        this.mozDrawText(b);
    }
    else {
        this.mozPathText(b);
    } }, mozMeasureText: function (d) { for (var c = 0, b = 0, a = d.length; c < a; c++) {
        if (d.charCodeAt(c) in this.font.lettersw) {
            b += this.font.lettersw[d.charCodeAt(c)];
        }
    } return b; }, drawText: function (a) { return this.mozDrawText(a); }, measureText: function (a) { return this.mozMeasureText(a); }, drawString: function (o, m, j, g) { j = 0; g = m.length; var b = 0, d = 0; var a = [], h = []; var k = 0; for (k = j; k < g; k++) {
        b = m[k].charCodeAt();
        if (b == 10 || b == 13) {
            continue;
        }
        if (!(b in this.font.letter || b in this.font.letters)) {
            b = "?".charCodeAt();
        }
        if (!(b in this.font.letter)) {
            this.font.letter[b] = this.loadPath(this.font.letters[b]);
        }
        h.push(this.font.lettersw[b] * 0.1);
        a.push(b);
    } var l = a.length; if (!l) {
        return;
    } o.save(); o.translate(0, d * -200); var f = this.font.letter; var e = l / 8; var c = l % 8; k = 0; do {
        switch (c) {
            case 0:
                f[a[k]]();
                o.translate(h[k], 0);
                k++;
            case 7:
                f[a[k]]();
                o.translate(h[k], 0);
                k++;
            case 6:
                f[a[k]]();
                o.translate(h[k], 0);
                k++;
            case 5:
                f[a[k]]();
                o.translate(h[k], 0);
                k++;
            case 4:
                f[a[k]]();
                o.translate(h[k], 0);
                k++;
            case 3:
                f[a[k]]();
                o.translate(h[k], 0);
                k++;
            case 2:
                f[a[k]]();
                o.translate(h[k], 0);
                k++;
            case 1:
                f[a[k]]();
                o.translate(h[k], 0);
                k++;
        }
        c = 0;
    } while (--e > 0); o.restore(); } };
var CanvasRenderingContext2DFont_svg = { ctx: null, fontFaces: {}, font: {}, load: function (B, r) { if ((B in this.fontFaces) && ("readyState" in this.fontFaces[B]) && (this.fontFaces[B].readyState == 4)) {
        this.font = this.fontFaces[B];
        return;
    } this.fontFaces[B] = { readyState: 2, letter: {}, letters: {}, lettersw: {}, lettersn: {}, kern: [], kernw: [], kerns: [] }; var G = this.fontFaces[B]; var q = { "<font": ["horiz-adv-x"], "<font-face": ["font-family", "units-per-em", "panose-1", "ascent", "descent", "baseline"], "<missing-glyph": ["horiz-adv-x", "d"], "<glyph": ["unicode", "horiz-adv-x", "d"], "<hkern": ["g1", "g2", "k"] }; var z = 0, t = 0, m = r.length; var w = ""; m = r.indexOf("</font"); z = r.indexOf("defs"); if (!z) {
        return false;
    } z = r.indexOf("<font", z); w = r.substring(t, r.indexOf(">", t)); w = w.split('" '); var h = 0, b = null; for (var o = 0; o < w.length; o++) {
        if (w[o].substr(0, 4) == 'id="') {
            b = w[o].substr(4);
        }
        else {
            if (w[o].substr(0, 13) == 'horiz-adv-x="') { }
        }
        h = w[o].substr(13);
    } z = r.indexOf("<font-family"); w = r.substring(t, r.indexOf(">", t)); w = w.split('" '); var v = 1000, B = B; var j = v, F = 0; var e = { fontWeight: "all", fontStretch: "all", fontStyle: "all", fontVariant: "normal", panose1: "0 0 0 0 0 0 0 0 0 0", slope: 0, ascent: null, descent: null, unicodeRange: null }; for (var o = 0; o < w.length; o++) {
        if (w[o].substr(0, 14) == 'units-per-em="') {
            v = parseInt(w[o].substr(14));
        }
        else {
            if (w[o].substr(0, 8) == 'ascent="') {
                j = parseInt(w[o].substr(8));
            }
            else {
                if (w[o].substr(0, 9) == 'descent="') {
                    F = parseInt(w[o].substr(9));
                }
            }
        }
    } var I = "<glyph"; var n, h, C, p; while (z < m && 0 < (t = r.indexOf(I, z))) {
        w = r.substring(t, r.indexOf(">", t));
        z = t + 1;
        w = w.replace(/=" /g, '="&#x20;');
        w = w.substr(w.indexOf(" ") + 1).split('" ');
        n = h = C = p = "";
        for (var o = 0; o < w.length; o++) {
            if (w[o].substr(w[o].length - 3, 3) == '"/>') {
                w[o] = w[o].substr(0, w[o].length - 3);
            }
            if (w[o].substr(0, 9) == 'unicode="') {
                n = w[o].substr(9);
                if (n.length > 1 && n.substr(0, 1) == "&") {
                    var E = document.createElement("div");
                    E.innerHTML = n;
                    n = E.textContent;
                }
                if (n.length > 1) { }
                n = n.charCodeAt();
            }
            else {
                if (w[o].substr(0, 13) == 'horiz-adv-x="') {
                    h = parseInt(w[o].substr(13));
                }
                else {
                    if (w[o].substr(0, 3) == 'd="') {
                        C = w[o].substr(3);
                    }
                    else {
                        if (w[o].substr(0, 12) == 'glyph-name="') {
                            p = w[o].substr(12);
                        }
                    }
                }
            }
        }
        if (!n) {
            continue;
        }
        G.letters[n] = C;
        if (h) {
            G.lettersw[n] = parseInt(h);
        }
        if (p) {
            (p in G.lettersn) ? G.lettersn[p].push(n) : (G.lettersn[p] = [n]);
        }
    } if (32 in G.lettersw) {
        var f = 9;
        G.letters[f] = "";
        G.lettersw[f] = G.lettersw[32] * 4;
        G.lettersn.tab = [f];
    }
    else { } I = "<hkern"; var u = 0; var a, H, A, y, x, C; var n, h; var D; var g = []; var c = []; while (u < m && 0 < (t = r.indexOf(I, u))) {
        w = r.substring(t, r.indexOf(">", t));
        u = t + 1;
        w = w.substr(w.indexOf(" ") + 1).split('" ');
        n = h = C = "";
        a = H = A = y = x = "";
        for (var o = 0; o < w.length; o++) {
            if (w[o].substr(0, 4) == 'g1="') {
                a = w[o].substr(4);
            }
            else {
                if (w[o].substr(0, 4) == 'g2="') {
                    H = w[o].substr(4);
                }
                else {
                    if (w[o].substr(0, 3) == 'k="') {
                        x = w[o].substr(3);
                    }
                    else {
                        if (w[o].substr(0, 4) == 'u1="') {
                            A = w[o].substr(4);
                        }
                        else {
                            if (w[o].substr(0, 4) == 'u2="') {
                                y = w[o].substr(4);
                            }
                        }
                    }
                }
            }
        }
        if (!((a || A) && (H || y))) {
            continue;
        }
        var g = [];
        if (a) {
            a = a.split(",");
            for (z in a) {
                if (a[z] in G.lettersn) {
                    for (o in G.lettersn[a[z]]) {
                        g.push(G.lettersn[a[z]][o]);
                    }
                }
            }
        }
        if (A) {
            A = A.split(",");
            for (z in A) {
                g.push(A);
            }
        }
        var c = [];
        if (H) {
            H = H.split(",");
            for (z in H) {
                if (H[z] in G.lettersn) {
                    for (o in G.lettersn[H[z]]) {
                        c.push(G.lettersn[H[z]][o]);
                    }
                }
            }
        }
        if (y) {
            y = y.split(",");
            for (z in y) {
                c.push(y);
            }
        }
        if (!(g.length && c.length)) {
            continue;
        }
        D = G.kerns.length;
        for (z in g) {
            G.kern[g[z]] = D;
        }
        G.kerns.push(c);
        G.kernw.push(x);
    } this.fontFaces[B].readyState = 4; this.font = this.fontFaces[B]; } };
var CanvasRenderingContext2DPath = { ctx: null, closePathStroke: function () { if (this.ctx) {
        this.ctx.closePath();
        this.ctx.fill();
        if (0) {
            this.ctx.stroke();
        }
    } return ["Z"]; }, _map: { arcAbs: ["A", "rx,ry,xAxisRotation,largeArcFlag,sweepFlag,x,y"], arcRel: ["a", "rx,ry,xAxisRotation,largeArcFlag,sweepFlag,x,y"], curvetoCubicAbs: ["C", "x1,y1,x2,y2,x,y"], curvetoCubicRel: ["c", "x1,y1,x2,y2,x,y"], linetoHorizontalAbs: ["H", "x"], linetoHorizontalRel: ["h", "x"], linetoAbs: ["L", "x,y"], linetoRel: ["l", "x,y"], movetoAbs: ["M", "x,y"], movetoRel: ["m", "x,y"], curvetoQuadraticAbs: ["Q", "x1, y1, x, y"], curvetoQuadraticRel: ["q", "x1, y1, x, y"], curvetoCubicSmoothAbs: ["S", "x2, y2, x, y"], curvetoCubicSmoothRel: ["s", "x2, y2, x, y"], curvetoQuadraticSmoothAbs: ["T", "x, y"], curvetoQuadraticSmoothRel: ["t", "x, y"], linetoVerticalAbs: ["V", "y"], linetoVerticalRel: ["v", "y"], closePathStroke: ["Z", "", "closePathStroke"], closePathStroke: ["Z", "", "closePathStroke"] }, _path_: { A: 7, C: 6, H: 1, L: 2, M: 2, Q: 4, S: 4, T: 2, V: 1, Z: 0 }, _path: {}, cp: [0, 0], cc: [0, 0], scale: 0.1, loadPath: function (m) { var p; if (!this._path.length) {
        for (p in this._map) {
            this._path[this._map[p][0]] = p;
        }
    } if (!m.length) {
        return new Function("", 'return [""];');
    } var e = ""; for (p in this._path) {
        e += p;
    } var c = new RegExp("[^0-9\\-\\.\\ " + e + "+]", "g"); var t = new RegExp("(\\-[0-9.]+)", "g"); var o = new RegExp("(\\.[0-9]+)", "g"); var j = new RegExp("\\ *([" + e + "])\\ *", "g"); m = m.replace(c, " ").replace(t, " $1 ").replace(o, "$1 ").replace(j, " $1 ").replace(/\ +/g, ","); var r = m.length; var n, q, k, l; var a = ""; var p, h, b, d; p = h = b = d = 0; while (p < r) {
        n = m.charAt(p);
        p++;
        if (n in this._path) {
            while (p < r && m.charAt(p) == ",") {
                p++;
            }
            q = n;
            k = this._path[q];
            l = this._path_[q];
        }
        else {
            if (!q) {
                continue;
            }
        }
        b = p;
        h = 0;
        while ((h < l) && (p < r) && (p = m.indexOf(",", p))) {
            d = p;
            h++;
            p++;
        }
        if (l) {
            if (p < 0 || h < l) {
                continue;
            }
        }
        var g = m.substr(b, d - b).split(",");
        var f;
        for (f in g) {
            g[f] = g[f] * this.scale;
        }
        a += "arialFontLib." + k + "(" + g.join(",") + "),";
    } return new Function("", "return [" + a + '""];'); }, arcAbs: function (r, o, d, t, m, w, v) { if (!this.ctx) {
        return ["A", r, o, d, t, m, w, v];
    } var G = w; var k = v; var F = r + w; var h = o + v; if (G == F && k == h) {
        return;
    } if (r == 0 || yx == 0) {
        this.lineTo(F, h);
        return;
    } var g = (G - F) / 2; var e = (k - h) / 2; var H = d * (Math.PI / 180); var l = Math.sin(H); var q = Math.cos(H); var a = (q * g) + (l * e); var C = -(l * g) + (q * e); r = r > 0 ? r : r * -1; o = o > 0 ? o : o * -1; var z = (a * a) / (r * r) + (C * C) / (o * o); if (z > 1) {
        var p = Math.sqrt(z);
        r *= p;
        o *= p;
    } var n = r * r; var E = o * o; var I = a * a; var b = C * C; var B = (n * E) - (n * b) - (E * I); if (B < 0) {
        var J = 0;
    }
    else {
        var u = (n * b) + (E * I);
        var J = sqrt(B / u);
    } var n = r * r; var E = o * o; var I = a * a; var b = C * C; var B = (n * E) - (n * b) - (E * I); if (B < 0) {
        var J = 0;
    }
    else {
        var u = (n * b) + (E * I);
        var J = sqrt(B / u);
    } if (t == m) {
        J = J * -1;
    } var A = J * ((r * C) / o); var K = J * (-(o * a) / r); var j = (q * A) - (l * K) + (G + F) / 2; var f = (l * A) + (q * K) + (k + h) / 2; var g = (a - A) / r; var e = (C - K) / o; if (!this.calc_angle) {
        this.calc_angle = function (x, c, R, P) { var Q, O, M, N, y; Q = x * R + c * P; O = Math.sqrt(x * x + c * c); M = Math.sqrt(R * R + P * P); N = Q / (O * M); if (N >= 1) {
            y = 0;
        } if (N <= -1) {
            y = Math.PI;
        }
        else {
            y = Math.acos(N);
        } if (x * P - c * R < 0) {
            y = y * -1;
        } return y; };
    } var L = this.calc_angle(1, 0, g, e); var D = this.calc_angle(g, e, (-a - A) / r, (-C - K) / o); if (m == 0 && D > 0) {
        D -= 2 * Math.PI;
    }
    else {
        if (m == 1 && D < 0) {
            D += 2 * Math.PI;
        }
    } J.save(); J.translate(j, f); J.rotate(H); J.scale(r, o); if (D > 0) {
        J.arc(0, 0, 1, L, L + D, 1);
    }
    else {
        J.arc(0, 0, 1, L, L + D);
    } J.restore(); }, arcRel: function (f, d, b, e, c, a, g) { a += this.cp[0]; g += this.cp[1]; return this.arcAbs(f, d, b, e, c, a, g); }, curvetoCubicAbs: function (c, e, b, d, a, f) { this.bezierCurveTo(c, e, b, d, a, f); this.cp = [a, f]; this.cc = [b, d]; return ["Q", c, e, b, d, a, f]; }, curvetoCubicRel: function (c, e, b, d, a, f) { c += this.cp[0]; e += this.cp[1]; b += this.cp[0]; d += this.cp[1]; a += this.cp[0]; f += this.cp[1]; if (this.ctx) {
        this.ctx.bezierCurveTo(c, e, b, d, a, f);
    } this.cp = [a, f]; this.cc = [b, d]; return ["Q", c, e, b, d, a, f]; }, curvetoCubicSmoothAbs: function (b, d, a, f) { var c = this.cp[0] * 2 - this.cc[0]; var e = this.cp[1] * 2 - this.cc[1]; if (this.ctx) {
        this.ctx.bezierCurveTo(c, e, b, d, a, f);
    } this.cp = [a, f]; this.cc = [b, d]; return ["Q", c, e, b, d, a, f]; }, curvetoCubicSmoothRel: function (b, d, a, f) { var c = this.cp[0] * 2 - this.cc[0]; var e = this.cp[1] * 2 - this.cc[1]; b += this.cp[0]; d += this.cp[1]; a += this.cp[0]; f += this.cp[1]; if (this.ctx) {
        this.ctx.bezierCurveTo(c, e, b, d, a, f);
    } this.cp = [a, f]; this.cc = [b, d]; return ["Q", c, e, b, d, a, f]; }, linetoHorizontalAbs: function (a) { var b = this.cp[1]; if (this.ctx) {
        this.ctx.lineTo(a, b);
    } this.cp = [a, b]; this.cc = [a, b]; return ["L", a, b]; }, linetoHorizontalRel: function (a) { a += this.cp[0]; var b = this.cp[1]; if (this.ctx) {
        this.ctx.lineTo(a, b);
    } this.cp = [a, b]; this.cc = [a, b]; return ["L", a, b]; }, linetoAbs: function (a, b) { if (this.ctx) {
        this.ctx.lineTo(a, b);
    } this.cp = [a, b]; this.cc = [a, b]; return ["L", a, b]; }, linetoRel: function (a, b) { a += this.cp[0]; b += this.cp[1]; if (this.ctx) {
        this.ctx.lineTo(a, b);
    } this.cp = [a, b]; this.cc = [a, b]; return ["L", a, b]; }, movetoAbs: function (a, b) { if (this.ctx) {
        this.ctx.beginPath();
        this.ctx.moveTo(a, b);
    } this.cp = [a, b]; this.cc = [a, b]; return ["M", a, b]; }, movetoRel: function (a, b) { if (this.ctx) {
        this.ctx.movetoAbs(this.cp[0] + a, this.cp[1] + b);
    } return ["M", this.cp[0] + a, this.cp[1] + b]; }, curvetoQuadraticAbs: function (b, c, a, d) { if (this.ctx) {
        this.ctx.quadraticCurveTo(b, c, a, d);
    } this.cp = [a, d]; this.cc = [b, c]; return ["C", b, c, a, d]; }, curvetoQuadraticRel: function (b, c, a, d) { b += this.cp[0]; c += this.cp[1]; a += this.cp[0]; d += this.cp[1]; if (this.ctx) {
        this.ctx.quadraticCurveTo(b, c, a, d);
    } this.cp = [a, d]; this.cc = [b, c]; return ["C", b, c, a, d]; }, curvetoQuadraticSmoothAbs: function (a, d) { var b = this.cp[0] * 2 - this.cc[0]; var c = this.cp[1] * 2 - this.cc[1]; if (this.ctx) {
        this.ctx.quadraticCurveTo(b, c, a, d);
    } this.cp = [a, d]; this.cc = [b, c]; return ["C", b, c, a, d]; }, curvetoQuadraticSmoothRel: function (a, d) { var b = this.cp[0] * 2 - this.cc[0]; var c = this.cp[1] * 2 - this.cc[1]; a += this.cp[0]; d += this.cp[1]; if (this.ctx) {
        this.ctx.quadraticCurveTo(b, c, a, d);
    } this.cp = [a, d]; this.cc = [b, c]; return ["C", b, c, a, d]; }, linetoVerticalAbs: function (b) { var a = this.cp[0]; if (this.ctx) {
        this.ctx.lineTo(a, b);
    } this.cp = [a, b]; this.cc = [a, b]; return ["L", a, b]; }, linetoVerticalRel: function (b) { var a = this.cp[0]; b += this.cp[1]; if (this.ctx) {
        this.ctx.lineTo(a, b);
    } this.cp = [a, b]; this.cc = [a, b]; return ["L", a, b]; } };
var FONT_COLOR = "#444";
var arialFontLib = null;
function loadFont(callback) { try {
    var r = new XMLHttpRequest();
    var loadArial = function (_) { if (r.readyState != 4) {
        return;
    } arialFontLib = new base2.Package(this, { name: "svgfont", version: "0.91", exports: "load,drawText,measureText" }); eval(this.imports); arialFontLib.extend(CanvasRenderingContext2DPath); arialFontLib.extend(CanvasRenderingContext2DFont); arialFontLib.extend(CanvasRenderingContext2DFont_svg); eval(this.exports); arialFontLib = base2.svgfont; arialFontLib.load("Arial", r.responseText); if (callback) {
        callback();
    } };
    r.open("GET", "Arial.svg", true);
    r.onreadystatechange = loadArial;
    r.send(null);
}
catch (e) {
    alert("Error Loading Font: " + e.message);
} }
var ArialFont = function () { if (!arialFontLib) {
    alert("Cannot use ArialFont... lib is null");
} var k = 0.2; var l = FONT_COLOR; var f = function () { return l; }; var a = function (n) { l = n; }; var g = function (n) { k = n; }; var m = function () { return k; }; var b = function (n, q) { try {
    arialFontLib.ctx = n;
    var p = k;
    n.scale(p, -p);
    n.globalCompositeOperation = "xor";
    arialFontLib.drawString(n, q);
    n.globalCompositeOperation = "source-over";
}
catch (o) {
    debug("Error: " + o.message);
} }; var j = true; var h = function (q, t, o, u, r) { q.save(); if (j) {
    b(q, t);
}
else {
    var p = o || 0;
    var n = u || 0;
    q.fillText(t, p, n, r);
} q.restore(); }; var d = function (o, p) { if (!p) {
    alert("Missing string");
} arialFontLib.ctx = o; var n = (j) ? k * 0.1 * arialFontLib.measureText(p) : o.measureText(p); return n; }; var e = function () { return 160 * k; }; var c = function () { return 220 * k; }; return { measureText: d, fillText: h, getTextHeight: c, getBaseLine: e, loadFont: loadFont, drawString: b, getTextColor: f, setTextColor: a, setScaleFactor: g, getScaleFactor: m }; };
var NODE_TYPE_ELEMENT = 1;
var NODE_TYPE_TEXT = 2;
var Node = function (m) { if (!m) {
    alert("Node: Need valid nodeType in the constructor.");
} var e = m; var j = -1; var n = null; var a = []; var g = function () { return (a.length > 0); }; var o = function () { return e; }; var b = function () { return (g() ? a[0] : null); }; var h = function () { var p = null; if (n) {
    var q = n.getChildren();
    if (j >= 0 && j < q.length - 1) {
        p = q[j + 1];
    }
} return p; }; var c = function (p) { a.push(p); p.setParent(this); p.setChildNodeIdx(a.length - 1); }; var l = function () { return a; }; var f = function (p) { j = p; }; var k = function (q) { n = q; }; var d = function () { return n; }; return { getNodeType: o, hasChildNodes: g, appendChild: c, getFirstChild: b, getNextSibling: h, getParent: d, setChildNodeIdx: f, setParent: k, getChildren: l }; };
var Element = function (a) { if (!a) {
    alert("Element(): missing tag");
} var b = new Node(NODE_TYPE_ELEMENT); b.tagName = a; return b; };
var TextNode = function (b) { var c = function () { var g = (b === undefined) ? "" : b; var f = function (h) { g = h; }; var e = function () { return g; }; return { setData: f, getData: e }; }; var a = new Node(NODE_TYPE_TEXT); var d = new c(); return mixin(a, d); };
var DOMDocument = function () { var a = function (c) { return new Element(c); }; var b = function (c) { return new TextNode(c); }; return { createElement: a, createTextNode: b }; };
var NodeIterator = function (c, e) { var b = e; var a = c; var d = function (f) { if (f) {
    b(f);
    if (f.hasChildNodes()) {
        var g = f.getFirstChild();
        while (g) {
            d(g);
            g = g.getNextSibling();
        }
    }
} }; return { traverse: function () { d(a); } }; };
var ELEMENT_STATE_NORMAL = 1;
var ELEMENT_STATE_HOVER = 2;
var ELEMENT_STATE_ACTIVE = 3;
var ELEMENT_STATE_DISABLED = 4;
var HTMLCollection = function (c) { if (c === undefined) {
    alert("HTMLCollection(): Missing firstChild parameter");
} var a = []; var b = c; while (b !== null) {
    a.push(b);
    b = b.getNextSibling();
} return { length: a.length, item: function (d) { return a[d]; }, namedItem: function (d) { alert("HTMLCollection.namedItem(): not implemented"); } }; };
var HTMLElement = function (b) { var a = function () { this.id = ""; this.title = ""; this.lang = ""; this.dir = ""; this.className = ""; this.getState = function () { return ELEMENT_STATE_NORMAL; }; }; var c = new BoxModel(); b.style = new ElementStyle(new CssStyle(), new a()); b.getBoundingRect = function () { return c.getBorderBox(); }; return mixin(b, c); };
var HTMLBodyElement = function (a) { var c = function () { this.aLink = ""; this.background = ""; this.bgColor = ""; this.link = ""; this.text = ""; this.vLink = ""; }; var b = new HTMLElement(a); return mixin(b, new c()); };
var HTMLDivElement = function (a) { var c = function () { var d = ""; return { getAlign: function () { return d; }, setAlign: function (e) { d = e; } }; }; var b = new HTMLElement(a); return mixin(b, new c()); };
var HTMLInputElement = function (a) { var c = function () { this.defaultValue = ""; this.defaultChecked = false; this.accept = ""; this.accessKey = ""; this.align = ""; this.alt = ""; this.checked = false; this.disabled = false; this.maxLength = 0; this.name = ""; this.readOnly = false; this.size = 0; this.src = ""; this.tabIndex = 0; this.type = ""; this.useMap = ""; this.value = ""; this.blur = function () { }; this.focus = function () { }; this.select = function () { }; this.click = function () { }; }; var b = new HTMLElement(a); return mixin(b, new c()); };
var HTMLImageElement = function (a) { var c = function () { this.name = ""; this.align = ""; this.alt = ""; this.border = ""; this.height = 0; this.hspace = 0; this.isMap = false; this.longDesc = ""; this.src = ""; this.useMap = ""; this.vspace = 0; this.width = 0; }; var b = new HTMLElement(a); return mixin(b, new c()); };
var DEFAULT_BOX_WIDTH = 150;
var DEFAULT_BOX_HEIGHT = 300;
var Point = function (a, b) { this.x = a || 0; this.y = b || 0; this.toString = function () { return "[Point -> x:" + this.x + ", y:" + this.y + "]"; }; };
var Size = function (a, b) { this.width = a || 0; this.height = b || 0; this.toString = function () { return "[Size -> w:" + this.width + ", h:" + this.height + "]"; }; };
var Box = function (a, d, b, c) { this.x = a || 0; this.y = d || 0; this.width = b || DEFAULT_BOX_WIDTH; this.height = c || DEFAULT_BOX_HEIGHT; this.isPointInsideBox = function (f, g) { var e = (this.x <= f && f < this.x + this.width) && (this.y <= g && g < this.y + this.height); return e; }; this.toString = function () { return "[Box -> x:" + this.x + ", y:" + this.y + ", w:" + this.width + ", h:" + this.height + "]"; }; };
var Rect = function (d, e, a, c) { this.top = d || 0; this.right = e || 0; this.bottom = a || 0; this.left = c || 0; this.toString = function () { return "[Rect -> t:" + this.top + ",r:" + this.right + ",b:" + this.bottom + ",l:" + this.left + "]"; }; };
var boxModelFactory = { createPoint: function (a, b) { return new Point(); }, createRect: function (d, e, a, c) { return new Rect(d, e, a, c); }, createSize: function (a, b) { return new Size(a, b); }, createBox: function (a, d, b, c) { return new Box(a, d, b, c); } };
var BoxModel = function () { var f = boxModelFactory.createPoint(); var l = boxModelFactory.createPoint(); var r = boxModelFactory.createRect(); var w = boxModelFactory.createRect(); var q = boxModelFactory.createRect(); var n = boxModelFactory.createSize(); var c = function () { return f; }; var k = function () { var D = n.width + q.right + q.left + w.right + w.left + r.right + r.left; return D; }; var a = function () { var D = n.height + q.top + q.bottom + w.top + w.bottom + r.top + r.bottom; return D; }; var d = function () { var D = boxModelFactory.createBox(); D.x = f.x + l.x; D.y = f.y + l.y; D.width = k(); D.height = a(); return D; }; var v = function () { var D = d(); D.x = D.x + r.left; D.y = D.y + r.top; D.width = D.width - r.left - r.right; D.height = D.height - r.top - r.bottom; return D; }; var p = function () { var D = v(); D.x = D.x + w.left; D.y = D.y + w.top; D.width = D.width - w.left - w.right; D.height = D.height - w.top - w.bottom; return D; }; var g = function () { var D = p(); D.x = D.x + q.left; D.y = D.y + q.top; D.width = n.width; D.height = n.height; return D; }; var e = function (D) { r.top = D; r.right = D; r.bottom = D; r.left = D; }; var u = function (D) { q.top = D; q.right = D; q.bottom = D; q.left = D; }; var h = function (D) { w.top = D; w.right = D; w.bottom = D; w.left = D; }; var z = function (D, E) { n.width = D; n.height = E; }; var C = function (D, E) { f.x = D; f.y = E; }; var b = function (D, E) { l.x = D; l.y = E; }; var m = function () { var D = boxModelFactory.createPoint(); D.x = f.x + l.x; D.y = f.y + l.y; return D; }; var A = function () { return r.top + w.top + q.top; }; var o = function () { return r.right + w.right + q.right; }; var B = function () { return r.bottom + w.bottom + q.bottom; }; var t = function () { return r.left + w.left + q.left; }; var x = function (E, G) { var F = v(); var D = F.isPointInsideBox(E, G); return D; }; var y = function (E, G) { var F = g(); var D = F.isPointInsideBox(E, G); return D; }; var j = function (D) { r.top = D.margin.top; r.right = D.margin.right; r.bottom = D.margin.bottom; r.left = D.margin.left; w.top = D.border.top; w.right = D.border.right; w.bottom = D.border.bottom; w.left = D.border.left; q.top = D.padding.top; q.right = D.padding.right; q.bottom = D.padding.bottom; q.left = D.padding.left; }; return { margin: r, border: w, padding: q, copyRectFrom: j, contentArea: n, getPaddingBox: p, getMarginBox: d, getBorderBox: v, getContentBox: g, setMargin: e, setPadding: u, setBorder: h, setSize: z, setOffset: C, setDeltaOffset: b, getTotalWidth: k, getTotalHeight: a, getTopLength: A, getRightLength: o, getBottomLength: B, getLeftLength: t, getOffset: c, getComputedOffset: m, isPointInsideBorder: x, isPointInsideContent: y }; };
var CSSStyleDeclaration = function () { var d = []; var j = []; var g = ""; var a; var b = function (o) { return d[o]; }; var m = function (o) { return j[o]; }; var c = function (o) { j[o] = null; }; var e = function () { return a; }; var h = function (o) { return false; }; var f = function (o, q, p) { if (h(o)) {
    d[o] = q;
}
else {
    j[o] = q;
} a = p; }; var l = function () { return j.length + d.length; }; var n = function (p) { var o = ""; if (p < j.length) {
    o = j[p];
}
else {
    o = d[p];
} return o; }; var k = function () { alert("getParentRule() not implemented"); }; return { cssText: g, getPropertyValue: b, getPropertyCSSValue: m, removeProperty: c, getPropertyPriority: e, setProperty: f, getLength: l, item: n, getParentRule: k }; };
var CssStyle = function () { var b = []; var a = function (e) { return b[e]; }; var d = function (f, e) { b[f] = e; }; var c = function (e) { b[e] = null; }; return { clearProperty: c, getProperty: a, setProperty: d }; };
var ElementStyle = function (a, f) { var d = null; var o = "#ddd"; a.setProperty("background-color: hover", "#8c2"); a.setProperty("background-color: active", "blue"); a.setProperty("background-color", "white"); a.setProperty("border-color: hover", "#7c7"); a.setProperty("border-color: active", "red"); a.setProperty("border-color", "white"); var m = function (p) { d = p; }; var c = function () { return d; }; var j = function () { var p = 0; if (f && f.getState) {
    p = f.getState();
} return p; }; var k = function () { var p = null; var q = j(); if (q == ELEMENT_STATE_HOVER) {
    p = a.getProperty("background-color: hover");
}
else {
    if (q == ELEMENT_STATE_ACTIVE) {
        p = a.getProperty("background-color: active");
    }
    else {
        p = a.getProperty("background-color");
    }
} return p; }; var h = function () { var p = a.getProperty("background-image"); return p; }; var e = function () { var p = null; var q = j(); if (q == ELEMENT_STATE_HOVER) {
    p = a.getProperty("border-color: hover");
}
else {
    if (q == ELEMENT_STATE_ACTIVE) {
        p = a.getProperty("border-color: active");
    }
    else {
        p = a.getProperty("border-color");
    }
} return p; }; var b = function () { return o; }; var g = function (p, r, q) { if (p) {
    a.setProperty("background-color", p);
} if (r) {
    a.setProperty("background-color: hover", r);
} if (q) {
    a.setProperty("background-color: active", q);
} }; var n = function (p, r, q) { if (p) {
    a.setProperty("border-color", p);
} if (r) {
    a.setProperty("border-color: hover", r);
} if (q) {
    a.setProperty("border-color: active", q);
} }; var l = function (p) { o = p; }; return { setFont: m, getFont: c, getMarginColor: b, getBackgroundColor: k, getBackgroundImage: h, getBorderColor: e, setBackgroundColor: g, setBorderColor: n }; };
var clipToArea = function (a, b) { a.beginPath(); a.rect(b.x, b.y, b.width, b.height); a.closePath(); a.clip(); };
var BoxModelPainter = function () { var b = function (k, j, m, l, h) { k.fillRect(Math.round(j), Math.round(m), Math.round(l), Math.round(h)); k.fillRect(j, m, l, h); }; var e = function (k, j, m, l, h) { k.rect(Math.round(j), Math.round(m), Math.round(l), Math.round(h)); }; var a = function (r, p, n, q, h) { r.save(); var l = n; clipToArea(r, l); if (p) {
    var j = p.getLeftLength();
    var o = p.getTopLength();
    var k = p.getComputedOffset();
    r.translate(k.x + j, k.y + o);
}
else {
    r.translate(l.x, l.y);
} var m = h.getBaseLine(); r.translate(0, m); h.fillText(r, q); r.restore(); }; var f = function (j, h, l, k) { a(j, null, h, l, k); }; var d = function (y, m, B, w, t) { y.save(); var D = (w) ? clone(m) : m; if (w) {
    D.contentArea.width = w;
} var l = null; var n = B.getBackgroundColor(); var k = B.getBorderColor(); var j = D.getMarginBox(); var q = j; if (l !== null) { } var r = D.getBorderBox(); q = r; clipToArea(y, q); var z = D.getPaddingBox(); q = z; y.fillStyle = n; b(y, q.x, q.y, q.width, q.height); var u = D.getContentBox(); q = u; var o = 0; if (o) {
    var A = "#cc9";
    y.fillStyle = A;
    b(y, q.x, q.y, q.width, q.height);
} if (t && t.length > 0) {
    var v = B.getFont();
    a(y, D, u, t, v);
} y.fillStyle = k; var C = D.border; var p, h; if (C.top > 0) {
    b(y, r.x, r.y, r.width, C.top);
} if (C.right > 0) {
    h = C.right;
    p = r.x + r.width - h;
    b(y, p, r.y, h, r.height);
} if (C.bottom > 0) {
    h = C.bottom;
    b(y, r.x, r.y + r.height - h, r.width, h);
} if (C.left > 0) {
    h = C.left;
    b(y, r.x, r.y, h, r.height);
} y.restore(); }; var g = function (h, j, k) { h.save(); round_rectangle(h, j.x, j.y, j.width, j.height); h.clip(); h.drawImage(k, j.x, j.y); h.restore(); }; var c = function (h, l, k, n, j, m) { h.save(); round_rectangle(h, l.x, l.y, l.width, l.height); h.clip(); h.fillStyle = k; b(h, l.x, l.y, l.width, l.height); if (n && n.length > 0) {
    f(h, m, n, j);
} h.restore(); }; return { paintBox: d, paintText: f, paintRoundedBox: c, paintRoundedBoxGradient: g }; };
var BoxStyle = function (c, a, d) { var b = new BoxModel(); b.setMargin(c || 0); b.setBorder(a || 0); b.setPadding(d || 0); var e = function () { return { getMargin: function () { return b.margin.left; }, getBorder: function () { return b.border.left; }, getPadding: function () { return b.padding.left; } }; }; return mixin(b, new e(), new ElementStyle(new CssStyle())); };
var SB_VERTICAL = 1;
var SB_HORIZONTAL = 2;
var SB_AS_NEEDED = 3;
var SB_ALWAYS = 4;
var SB_NEVER = 5;
var ScrollbarData = function (a) { this.orientation = a || SB_VERTICAL; this.percentValue = 0; this.minimum = 0; this.maximum = 0; this.visibleAmount = 0; this.unitIncrement = 50; this.blockIncrement = 100; };
var DragInfo = function () { this.start = boxModelFactory.createPoint(); this.end = boxModelFactory.createPoint(); this.moved = boxModelFactory.createPoint(); this.percentStart = 0; this.dragging = false; this.active = false; };
var ScrollbarModel = function (c) { var l = null; var h = new ScrollbarData(c); var b = function () { return (h.maximum - h.minimum - h.visibleAmount); }; var a = function () { return h.maximum - h.minimum; }; var p = function () { return h.percentValue; }; var g = function () { return p() * b(); }; var q = function (r) { var t = Math.max(0, Math.min(1, r)); h.percentValue = t; }; var e = function (t) { if (t < h.minimum) {
    t = h.minimum;
} var r = h.maximum; if (t >= r) {
    t = r;
} if (h.minimum <= t && t <= r) {
    var u = t / b();
    q(u);
}
else {
    alert("ScrollbarModel.setValue(): Invalid param:" + t);
} }; var f = function (t, r, u) { if (t < r && 0 < u && u <= r) {
    h.minimum = t;
    h.maximum = r;
    h.visibleAmount = u;
}
else {
    alert("Invalid span parameters: " + t + "," + r + "," + u);
} }; var o = function (r) { h.unitIncrement = r; }; var n = function () { return h.unitIncrement; }; var j = function () { return h.blockIncrement; }; var m = function (r) { h.blockIncrement = r; }; var k = function (r) { l = r; }; var d = function () { return h.visibleAmount; }; return { getBlockIncrement: j, getRange: a, getUnitIncrement: n, setValue: e, setPercentValue: q, setBlockIncrement: m, setUnitIncrement: o, setSpan: f, getValue: g, getPercentValue: p, getVisibleAmount: d, setValueAdjustmentListener: k }; };
var drag = new DragInfo();
var VerticalScrollbar = function () { var a = function () { var o = new ScrollbarModel(SB_VERTICAL); var k = function () { return o.getValue(); }; var q = function () { return o.getPercentValue(); }; var n = 0; var h = function () { if (n) {
    o.setPercentValue(0);
}
else {
    var v = k();
    var u = o.getUnitIncrement();
    o.setValue(v - u);
} }; var r = function () { if (n) {
    o.setPercentValue(1);
}
else {
    var v = k();
    var u = o.getUnitIncrement();
    o.setValue(v + u);
} }; var l = function (u) { o.setPercentValue(u); }; var j = function (v, u, w) { o.setSpan(v, u, w); }; var f = function (u, v) { o.setUnitIncrement(u); o.setBlockIncrement(v); }; var m = function (u) { o.setValueAdjustmentListener(u); }; var e = function () { return o.getRange(); }; var g = function () { return o.getVisibleAmount(); }; var t = function (u) { if (u < 0) {
    u = 0;
}
else {
    if (u > 1) {
        u = 1;
    }
} o.setPercentValue(u); }; var p = function () { return o.getUnitIncrement(); }; return { drag: drag, getValue: k, getPercentValue: q, setPercentValue: t, getRange: e, getVisibleAmount: g, scrollDown: r, scrollUp: h, setIncrement: f, getUnitIncrement: p, setSpan: j, scrollTo: l, setValueAdjustmentListener: m }; }; var b = new a(); var c = 30; var d = function () { var v = new BoxModel(); var m = new BoxModel(); var h = null; var y = 0; var e = 0; var j = function () { return v.contentArea.height - m.getTopLength() - m.getBottomLength(); }; var q = function () { return e; }; var l = function () { return c; }; var f, r; var t, n; var A = function (C) { var I, D; I = 20; D = 500; f = WindowsLib.createCanvasLayer(I, D); var E = f.getContext("2d"); var B = f; var J = E; var H = 0; var F = 0; setupLinearGradient(J, H, F, I, D, "#999", "#777"); J.fillRect(H, F, I, D); r = WindowsLib.createCanvasLayer(I, D); var G = r.getContext("2d"); setupLinearGradient(G, 0, 0, I, D, "#bbb", "#999"); J = G; J.fillRect(0, 0, I, D); t = E.getImageData(0, 0, I, D); n = G.getImageData(0, 0, I, D); }; var w = function (J, I, O, N) { try {
    var K = v;
    K.setOffset(J, I);
    var R = 5;
    K.margin.right = R;
    K.margin.left = R;
    K.margin.top = N * 0.05;
    K.margin.bottom = N * 0.05;
    K.setBorder(1);
    K.setPadding(2);
    K.contentArea.width = O - K.getLeftLength() - K.getRightLength();
    K.contentArea.height = N - K.getTopLength() - K.getBottomLength();
    var B = b;
    var C = B.getVisibleAmount();
    var L = B.getRange();
    var Q = C / L;
    var S = m;
    var D = 1;
    S.margin.right = D;
    S.margin.left = D;
    S.margin.top = 0;
    S.margin.bottom = 0;
    S.setBorder(0);
    S.setPadding(0);
    S.contentArea.width = K.contentArea.width - S.getLeftLength() - S.getRightLength();
    y = j();
    var F = Q * y;
    S.contentArea.height = F;
    var H = B.getPercentValue();
    e = (y - F);
    var E = H * e;
    var G = J + K.getLeftLength();
    var M = I + K.getTopLength();
    S.setOffset(G, M + E);
    h = v.getContentBox();
    A(G);
}
catch (P) {
    alert("Error: " + P.message);
} }; var o = function (B, C) { return m.isPointInsideBorder(B, C); }; var z = function (B, C) { return v.isPointInsideBorder(B, C); }; var x = new BoxModelPainter(); var u = function (K, I, F, B, J) { w(I, F, B, J); var C = drag.dragging || drag.active ? { getBackgroundColor: function () { return "#aee"; }, getBorderColor: function () { return "#aaa"; } } : { getBackgroundColor: function () { return "#9cc"; }, getBorderColor: function () { return "white"; } }; var D = drag.dragging || drag.active ? { getBackgroundColor: function () { return "#aae"; }, getBorderColor: function () { return "white"; } } : { getBackgroundColor: function () { return "#99c"; }, getBorderColor: function () { return "white"; } }; K.save(); K.beginPath(); K.rect(I, F, B, J); K.clip(); var G = v.getBorderBox(); var E = m.getBorderBox(); x.paintRoundedBox(K, G, "#333"); var H = (drag.active) ? r : f; x.paintRoundedBoxGradient(K, E, H); K.restore(); }; var p = function (C, D) { var B = m.getMarginBox(); return (D < B.y); }; var g = function (C, D) { var B = m.getMarginBox(); return (D > B.y + B.height); }; var k = function (C, G) { var B = (h.y < G && G < h.y + h.height); if (B) {
    var F = G - h.y;
    var E = F / y;
    var D = b.getUnitIncrement();
    if (F < D) {
        E = 0;
    }
    else {
        if (F > y - D) {
            E = 1;
        }
    }
    b.scrollTo(E);
} }; return { layout: w, display: u, getScrollbarWidth: l, getScrollingHeight: j, isBelowThumb: g, isAboveThumb: p, scrollToCoordinates: k, isInsideScrollBar: z, isInsideScrollThumb: o, getAvailableScrollingHeight: q }; }; return mixin(b, new d()); };
var Viewport = function () { var o = new VerticalScrollbar(); var A = null; var p = null; var f = function () { return false; }; var a = function () { return false; }; var w = function (H, I) { var G = false; if (A) {
    var F = A;
    G = (F.x < H && H < F.x + F.width) && (F.y < I && I < F.y + F.height);
} return G; }; var m = function () { return o.getScrollbarWidth(); }; var e = function () { return 0; }; var c = function () { return o.getValue(); }; var h = function () { var F = boxModelFactory.createPoint(); F.x = e(); F.y = c(); return F; }; var k = function (G, F, H) { o.setSpan(G, F, H); }; var y = function (F, G) { o.setIncrement(F, G); }; var n = function (G, I, H, F) { A = boxModelFactory.createBox(G, I, H, F); }; var u = function (F) { var G = A; if (G) {
    o.display(F, G.x, G.y, G.width, G.height);
}
else {
    alert("displayVerticalScrollbar: vertical scrollBar box has not been set!");
} }; var g = function (F) { o.setValueAdjustmentListener(F); }; var q = function () { o.scrollUp(); }; var D = function () { o.scrollDown(); }; var z = function (F) { o.scrollTo(F); }; var B = function () { o.layout(); }; var r = function (F, G) { return o.isInsideScrollThumb(F, G); }; var C = function (F, G) { return o.isInsideScrollBar(F, G); }; var j = function () { var F = (drag.end.y - drag.start.y) / o.getScrollingHeight(); var G = drag.percentStart + F * 1.2; z(G); drag.moved.x = drag.end.x; drag.moved.y = drag.end.y; }; var t = function (F, G) { return o.isAboveThumb(F, G); }; var d = function (F, G) { return o.isBelowThumb(F, G); }; var x = function (F) { p = F; }; var E = function (F) { var G = p; if (G) {
    F.beginPath();
    F.rect(G.x, G.y, G.width, G.height);
    F.clip();
}
else {
    if (f()) {
        alert("clipToTarget(): Need to initialize the targetClipRegion box");
    }
} }; var l = function (F, G) { o.scrollToCoordinates(F, G); }; var v = function (F, G) { drag.start.x = F; drag.start.y = G; drag.percentStart = o.getPercentValue(); drag.dragging = true; drag.active = true; document.documentElement.style.cursor = "pointer"; }; var b = function () { drag.dragging = false; drag.active = false; document.documentElement.style.cursor = "default"; }; return { displayVerticalScrollbar: u, setTargetClipRegion: x, clipToTargetRegion: E, getOffset: h, setDragStart: v, setDragStop: b, drag: o.drag, layout: B, isAboveThumb: t, isBelowThumb: d, isInsideScrollbar: w, isInsideScrollThumb: r, getVerticalScrollbarWidth: m, needsVerticalScrollbar: f, needsHorizontalScrollbar: a, setVerticalSpan: k, setVerticalIncrement: y, setVerticalScrollbarBox: n, scrollUp: q, scrollDown: D, dragTo: j, verticalScrollTo: z, isInsideScrollBar: C, scrollToCoordinates: l, setValueAdjustmentListener: g }; };
var HTMLOptionElement = function (c) { var e = function () { var A = false; var m = false; var p = ""; var n = -1; var t = false; var q = ""; var u = ""; var l = function () { return A; }; var k = function () { return m; }; var w = function () { return n; }; var z = function () { return p; }; var r = function () { return t; }; var f = function () { return q; }; var h = function () { return u; }; var j = function (B) { A = B; }; var o = function (B) { m = B; }; var y = function (B) { p = B; }; var x = function (B) { t = B; }; var g = function (B) { u = B; }; var v = function (B) { n = B; }; return { getDefaultSelected: l, getDisabled: k, getIndex: w, getLabel: z, getSelected: r, getText: f, getValue: h, setDefaultSelected: j, setDisabled: o, setLabel: y, setSelected: x, setValue: g, setIndex: v }; }; var d = new HTMLElement(c); var b = new e(); var a = function () { var f = false; var l = function () { return f; }; var g = function (p) { f = p; }; var h = function (q) { var u = b.getLabel(); var r = d.style.getFont(); var t = r.measureText(q, u); var p = r.getTextHeight(); d.contentArea.width = Math.round(t); d.contentArea.height = Math.round(p); return { width: t, height: p }; }; var n = function () { var r = 0; if (d.getParent()) {
    var p = d.getParent().contentArea.width;
    var q = c.getFirstChild();
    if (q) {
        r = p - q.getLeftLength() - q.getRightLength();
    }
} return r; }; var k = function () { if (b.getDisabled()) {
    return ELEMENT_STATE_DISABLED;
}
else {
    if (f) {
        return ELEMENT_STATE_HOVER;
    }
    else {
        return ELEMENT_STATE_NORMAL;
    }
} }; var m = null; var o = null; var j = function (p) { var r = n(); var q = b.getLabel(); var t = { hover: f, disabled: b.getDisabled(), checked: b.getSelected() }; if (o && o.paintOption) {
    o.paintOption(p, d, t, r, q, this.first, this.last);
}
else {
    if (!m) {
        var u = function () { var v = new BoxModelPainter(); this.paintOption = function (w, A, B, z, x) { var y = (!B.hover) ? A.style : { getPaddingColor: function () { return "white"; }, getBorderColor: function () { return "#9cb"; }, getBackgroundColor: function () { return "#dff"; }, getFont: function () { return d.style.getFont(); } }; v.paintBox(w, A, y, z, x); }; };
        m = new u();
    }
    m.paintOption(p, d, t, r, q);
} }; return { setOptionPainter: function (q) { o = q; }, setHighlight: g, getHighlight: l, computeContentSize: h, display: j, getState: k, getOptionContentWidth: n }; }; return mixin(d, b, new a()); };
var HTMLOptGroupElement = function (a) { var c = function () { this.disabled = true; this.label = ""; }; var b = new HTMLElement(a); return mixin(b, new c()); };
var HTMLSelectElement = function (c) { var e = function () { var p = false; var E = false; var G = ""; var y = 5; var q = -1; var k = false; var x = function (H, I) { if (!I) {
    c.appendChild(H);
}
else {
    alert("HTMLSelectElement.add() : insertBefore() is not implemented!");
} }; var B = function () { k = false; }; var z = function () { k = true; }; var n = function () { return p; }; var j = function () { return v().length; }; var D = function () { return E; }; var w = function () { return G; }; var v = function () { var I = c.getFirstChild(); var H = new HTMLCollection(I); return H; }; var g = function () { var H = -1; var I = v(); for (var J = 0; J < I.length; J++) {
    var K = I.item(J);
    if (K.getSelected && K.getSelected()) {
        H = J;
        break;
    }
} return H; }; var m = function () { return y; }; var o = function () { return q; }; var A = function () { return (E) ? "select-multiple" : "select-one"; }; var l = function () { var K = ""; var J = g(); if (J > -1) {
    var H = v();
    var I = H.item(J);
    K = I.getValue();
} return K; }; var F = function (H) { alert("HTMLSelectElement.remove(): not implemented."); if (H < j()) { } }; var f = function (H) { E = H; }; var r = function (H) { G = H; }; var t = function (J) { var I = v(); if (!E) {
    for (var H = 0; H < I.length; H++) {
        I.item(H).setSelected(false);
    }
} if (J >= 0 && J < j()) {
    selectedIndex = J;
    var K = I.item(selectedIndex);
    K.setSelected(true);
} }; var C = function (H) { y = H; }; var u = function (H) { q = H; }; var h = function (H) { alert("Not implemented"); }; return { add: x, blur: B, focus: z, getDisabled: n, getLength: j, getMultiple: D, getName: w, getOptions: v, getSelectedIndex: g, getSize: m, getTabIndex: o, getType: A, getValue: l, remove: F, setDisabled: n, setMultiple: f, setName: r, setSelectedIndex: t, setSize: C, setTabIndex: u, setValue: h }; }; var d = new HTMLElement(c); var b = mixin(d, new e()); var a = function () { var k = null; var g = null; var f = new Viewport(); f.needsVerticalScrollbar = function () { var n = b.getLength() > b.getSize(); return n; }; var h = function (o) { g = o; if (o.paintOption) {
    var n = c.getFirstChild();
    while (n) {
        n.setOptionPainter(o);
        n = n.getNextSibling();
    }
} }; var m = function () { return g; }; var l = function (w) { var v = function (y) { var x = y; if (x) {
    x.first = true;
    while (x) {
        if (!x.getNextSibling()) {
            x.last = true;
        }
        x = x.getNextSibling();
    }
} }; var q = function (y) { if (g && g.paintSelectBackground) {
    g.paintSelectBackground(y, d, d.style);
}
else {
    if (!k) {
        var x = function () { var z = new BoxModelPainter(); this.paintSelectBackground = function (A, B, C) { z.paintBox(A, B, C); }; };
        k = new x();
    }
    k.paintSelectBackground(y, d, d.style);
} }; try {
    w.save();
    q(w);
    if (f.needsVerticalScrollbar()) {
        f.displayVerticalScrollbar(w);
    }
    f.clipToTargetRegion(w);
    var o = [];
    var p = f.getOffset();
    var t = c.getFirstChild();
    v(t);
    while (t) {
        t.setDeltaOffset(-Math.round(p.x), -Math.round(p.y));
        if (t.getHighlight()) {
            o.push(t);
        }
        else {
            t.display(w);
        }
        t = t.getNextSibling();
    }
    for (var r = 0; r < o.length; r++) {
        var u = o[r];
        u.display(w);
    }
    w.restore();
}
catch (n) {
    alert("Error: " + n.message);
} }; var j = function (p, n, t) { var o = b.getOptions(); var q = o.item(p); var r = q.getBorderBox(); return r.isPointInsideBox(n, t); }; return { display: l, viewport: f, setSelectPainter: h, getSelectPainter: m, isInsideOption: j }; }; return mixin(b, new a()); };
var HTMLDocument = function (b) { var c = (b) ? b : new DOMDocument(); var a = function () { var e = []; var g = function (h) { var j = c.createElement(h); if (b === window.document) { }
else {
    if (h == "body") {
        j = new HTMLBodyElement(j);
    }
    else {
        if (h == "div") {
            j = new HTMLDivElement(j);
        }
        else {
            if (h == "option") {
                j = new HTMLOptionElement(j);
            }
            else {
                if (h == "optgroup") {
                    j = new HTMLOptGroupElement(j);
                }
                else {
                    if (h == "select") {
                        j = new HTMLSelectElement(j);
                    }
                    else {
                        alert("HTMLDocument.createElement() doesn't support for this tag yet.");
                    }
                }
            }
        }
    }
} e.push(j); return j; }; var d = g("body"); var f = function (h) { return null; }; return { body: d, createElement: g, getElementsByName: f }; }; return mixin(c, new a()); };
var SelectionLayout = function (c) { var a = function (g, f, e, j, d) { var k = 0; var h = f.getFirstChild(); while (h) {
    if (h.computeContentSize) {
        h.computeContentSize(g);
    }
    else {
        alert("node.computeContentSize() not defined");
    }
    h.copyRectFrom(e);
    k = Math.max(k, h.contentArea.width);
    h = h.getNextSibling();
} h = f.getFirstChild(); while (h) {
    h.contentArea.width = k;
    h = h.getNextSibling();
} f.copyRectFrom(j); if (d.needsVerticalScrollbar()) {
    f.padding.right += d.getVerticalScrollbarWidth();
} return k; }; var b = function (A, t, d, n) { var u = a(A, t, d, n, t.viewport); var e = t.getSize(); var m = t.getLeftLength(); var C = t.getTopLength(); var E = C; var p = C; var r = 0; var g = 0; var z = null; var j = t.getFirstChild(); if (j) {
    j.setOffset(m, C);
    g = 1;
    var B;
    z = j;
    var v = z.getNextSibling();
    while (v) {
        if (c) {
            B = -z.border.bottom - v.margin.top;
            C += z.getTotalHeight() - z.margin.bottom + B;
        }
        else {
            var f = Math.max(z.margin.bottom, v.margin.top);
            B = f - v.margin.top;
            C += z.getTotalHeight() - z.margin.bottom + B;
        }
        v.setOffset(m, C);
        if (g < e) {
            p = C;
        }
        E = C;
        g++;
        z = v;
        v = z.getNextSibling();
    }
    r = z.getLeftLength() + u + z.getRightLength();
    B = z.getTotalHeight() - t.getTopLength();
    if (c) {
        B -= (z.margin.bottom);
    }
    E = E + B;
    p = p + B;
    t.contentArea.width = r;
    t.contentArea.height = p;
    var D = t.viewport;
    if (D.needsVerticalScrollbar()) {
        var h = z.getTotalHeight() - z.margin.bottom;
        if (c) {
            h = h - z.margin.bottom - z.border.bottom;
        }
        D.setVerticalSpan(0, E, p);
        D.setVerticalIncrement(h, h * (t.getSize() - 1));
        var l = t.getLeftLength() + t.contentArea.width;
        var k = t.getTopLength();
        var w = D.getVerticalScrollbarWidth();
        var q = t.contentArea.height;
        D.setVerticalScrollbarBox(l, k, w, q);
        var o = t.getContentBox();
        if (c) {
            o.y += z.margin.bottom;
            o.height -= z.margin.bottom;
        }
        D.setTargetClipRegion(o);
    }
} return { width: t.getTotalWidth(), height: t.getTotalHeight() }; }; return { computeLayout: b }; };
var deactivate = function (a) { if (a.preventDefault) {
    a.preventDefault();
}
else {
    a.returnValue = false;
} return false; };
var SelectControl = function () { var h = null; var n = null; var l = null; var j = true; var p = null; var t = 0; var y = function (H) { p = H; }; var c = function () { if (!p) {
    alert("SelectControl.getFont(): Need to set font first");
} return p; }; var G = new HTMLDocument(); var o = G.createElement("select"); var b = function () { var H = h.getContext("2d"); o.display(H); }; var u = function (I, L, K, J, H) { I.style.left = L + "px"; I.style.top = K + "px"; t = K; I.style.background = p.getTextColor(); if (j) {
    I.style.visibility = "hidden";
} document.body.appendChild(I); WindowsLib.setCanvasSize(I, J, H); return I; }; var g = 0; var B = function () { this.setOptionBoxSize = function (H) { }; this.setSelectBoxSize = function (H) { }; this.getSelectTopOffset = function (I, H, J) { return I + H; }; this.getCollapseBorder = function () { return true; }; }; var e = new B(); var r = null; var E = function (M, L) { var N; if (r && r.getSelectTopOffset) {
    var H = o.getSelectedIndex();
    var I = o.getOptions();
    var K = I.item(H);
    var J = K.getOffset().y;
    N = r.getSelectTopOffset(L, g, J);
}
else {
    N = e.getSelectTopOffset(L, g, J);
} h.style.left = M + "px"; h.style.top = N + "px"; }; var x = function (I) { var M = o.getSelectPainter(); for (var J = 0; J < I.length; J++) {
    var L = I[J];
    var K = G.createElement("option");
    K.id = L.id;
    K.setValue(L.id);
    K.setLabel(L.label);
    K.setIndex(J);
    K.style.setFont(c());
    K.style.setBackgroundColor("white", "#dff", "43a");
    K.style.setBorderColor("white", "#9cb", "#14a");
    if (M && M.paintOption) {
        K.setOptionPainter(M);
    }
    o.appendChild(K);
} if (I.length > 0) {
    var H = o.getSelectedIndex();
    if (H === -1) {
        o.setSelectedIndex(0);
    }
} }; var A = function (H) { r = H; }; var z = function (H, I) { e.setOptionBoxSize(H); e.setSelectBoxSize(I); if (r) {
    if (r.setOptionBoxSize) {
        r.setOptionBoxSize(H);
    }
    if (r.setSelectBoxSize) {
        r.setSelectBoxSize(I);
    }
} }; var d = -1; var v = function (J) { var K = o.getOptions(); var H = 1; var I = function (N) { var M = (N.which === H); return M; }; J.onmousedown = function (P) { try {
    var M = P.layerX;
    var Q = P.layerY;
    var O = o.viewport;
    if (O.isInsideScrollThumb(M, Q)) {
        O.setDragStart(M, Q);
        b();
    }
}
catch (N) {
    alert("Error: " + N.message);
} }; J.onmouseup = function (O) { try {
    var N = o.viewport;
    N.setDragStop();
    b();
}
catch (M) {
    alert("Error: " + M.message);
} }; var L = o.getContentBox(); J.onclick = function (P) { try {
    var T = P.layerX;
    var R = P.layerY;
    var V = o.viewport;
    if (V.isInsideScrollBar(T, R)) {
        V.scrollToCoordinates(T, R);
    }
    else {
        if (L.isPointInsideBox(T, R)) {
            for (var N = 0; N < K.length; N++) {
                var O = K.item(N);
                var M = o.isInsideOption(N, T, R);
                O.setSelected(M);
                if (M) {
                    o.setSelectedIndex(N);
                    if (j) {
                        J.style.visibility = "hidden";
                    }
                    if (n) {
                        var W = K.item(N);
                        var U = W.getValue();
                        var S = W.getLabel();
                        n(U, S);
                    }
                }
            }
        }
    }
    b();
}
catch (Q) {
    alert("Error: " + Q.message);
} }; J.onmousemove = function (Q) { try {
    var V = Q.layerX;
    var T = Q.layerY;
    var Y = o.viewport;
    if (Y.drag.dragging && I(Q)) {
        Y.drag.end.x = V;
        Y.drag.end.y = T;
        var X = Math.abs(Y.drag.end.y - Y.drag.moved.y);
        var Z = 4;
        if (X > Z) {
            Y.dragTo(Y.drag);
            b();
            deactivate(Q);
        }
    }
    else {
        Y.drag.dragging = false;
    }
    var M = -1;
    var N, O;
    if (L.isPointInsideBox(V, T)) {
        var ab = o.getOptions();
        for (N = 0; N < ab.length; N++) {
            O = ab.item(N);
            O.setHighlight(false);
        }
        for (N = 0; N < ab.length; N++) {
            var P = o.isInsideOption(N, V, T);
            if (P) {
                O = ab.item(N);
                O.setHighlight(P);
                M = N;
                break;
            }
        }
        if (d !== M) {
            var aa = J.getContext("2d");
            aa.save();
            if (d > -1 || M > -1) {
                Y.clipToTargetRegion(aa);
            }
            if (d > -1) {
                ab.item(d).display(aa);
            }
            if (M > -1) {
                var S = ab.item(M);
                S.display(aa);
                if (l) {
                    var W = S.getValue();
                    var U = S.getLabel();
                    l(W, U);
                }
            }
            aa.restore();
        }
        d = M;
    }
}
catch (R) {
    debug("Error: " + R.message);
} }; b(); }; var C = function (K, I, M) { g = M; var J = new BoxStyle(6, 2, 10); var O = new BoxStyle(2, 10, 10); z(J, O); J.setFont(c()); O.setFont(c()); var T = o.getOptions(); var N = WindowsLib.createCanvasLayer(); var R = N.getContext("2d"); var H = 400; var Q = 320; if (T.length > 0) {
    var P = (r && r.getCollapseBorder) ? r.getCollapseBorder() : true;
    var L = new SelectionLayout(P);
    var S = L.computeLayout(R, o, J, O);
    H = S.width;
    Q = S.height;
}
else {
    debug("Select control is empty!");
} u(N, K, I, H, Q); h = N; if (!N) {
    alert("Error: selectLayer was not created!!!");
} v(N); return { width: H, height: Q }; }; var m = function (H) { n = H; }; var q = function (H) { l = H; }; var w = function (H, M) { h.style.visibility = (H) ? "visible" : "hidden"; if (H) {
    var J = h.style.top;
    var K = J.substr(0, J.length - 2);
    var L = parseInt(K, 10);
    var I = { layerX: M.layerX, layerY: M.layerY - L };
    h.onmousemove(I);
} }; var k = function () { try {
    o.viewport.scrollUp();
    b();
}
catch (H) {
    alert("Error: " + H.message);
} }; var F = function () { try {
    o.viewport.scrollDown();
    b();
}
catch (H) {
    alert("Error: " + H.message);
} }; var a = function (I) { try {
    o.viewport.verticalScrollTo(I);
    b();
}
catch (H) {
    alert("Error: " + H.message);
} }; var f = function () { var H = o.getOptions(); for (i = 0; i < H.length; i++) {
    option = H.item(i);
    option.setHighlight(false);
} var I = o.getSelectedIndex(); if (I >= 0) {
    H.item(I).setHighlight(true);
    d = I;
}
else {
    d = -1;
} b(); }; var D = function () { return { setFont: y, setOptions: x, setBoxLayout: A, setOffset: E, setLayoutOffset: C, setVisible: w, setSelectionCallback: m, setHoverCallback: q, scrollTo: a, scrollUp: k, scrollDown: F, updateHighlight: f }; }; return mixin(o, new D()); };
var ComboBoxLayoutManager = function (a) { var f = 50; var e = 500; var l = true; var j = false; var h = function () { this.setComboBoxModel = function (o) { o.setMargin(0); o.setBorder(0); o.setPadding(2); o.padding.top = 14; }; this.setTextBoxModel = function (o) { o.setMargin(0); o.setBorder(0); o.padding.left = 20; o.padding.top = 3; o.padding.right = 50; o.padding.bottom = 3; }; this.setArrowBoxModel = function (o) { o.setMargin(0); o.setBorder(1); o.setPadding(0); o.contentArea.width = 20; o.contentArea.height = 20; }; }; var m = new h(); var d = null; var k = function (o) { var q = function (t) { return t.getScaleFactor() * 5; }; var p = q(o); var r = 100 * p; return r; }; var g = function (q, B, t, w, r) { var v = r.getTextHeight(); m.setComboBoxModel(q); m.setTextBoxModel(B); m.setArrowBoxModel(t); if (d) {
    if (d.setComboBoxModel) {
        d.setComboBoxModel(q);
    }
    if (d.setTextBoxModel) {
        d.setTextBoxModel(B);
    }
    if (d.setArrowBoxModel) {
        d.setArrowBoxModel(t);
    }
} B.contentArea.width = w; B.contentArea.height = v; var A = B.getTotalWidth() - t.getTotalWidth() + t.getLeftLength(); t.setOffset(A, q.getTopLength()); var p = B.getTotalHeight(); var o = k(r); var u = w + o; q.contentArea.height = p; var A = q.getLeftLength(); var z = q.getTopLength(); B.setOffset(A, z); }; var c = function (q, p) { if (!p) {
    alert("ComboBoxLayoutManager.measureText(): Missing font!");
} var o = a.getContext("2d"); return p.measureText(o, q); }; var n = function (r, p) { var o = f; for (var q = 0; q < r.length; q++) {
    o = Math.max(o, c(r[q].label, p));
} return o; }; var b = function (q, p) { var o = Math.min(e, Math.max(f, c(q, p))); return o; }; return { setBoxLayout: function (o) { d = o; }, manageBoxLayout: g, getTextWidth: b, isDynamicWidth: function () { return j; }, getMaximumTextWidth: n }; };
var DefaultComboBoxPainter = function () { var a = new BoxModelPainter(); var f = "#cc0"; var d = null; var c = null; var h = null; var e = function (l, j, k) { d = l; c = j; h = k; h.x = d.width - 40; h.height = Math.round(c.height); var m = function (p, r) { var q = WindowsLib.createCanvasLayer(p, r); var o = q.getContext("2d"); var n = 0; var u = 0; setupLinearGradient(o, n, u, p, r, "#ddd", "#777", true); o.fillRect(n, u, p, r); var t = o.createPattern(q, "repeat"); return t; }; f = m(1, l.height); }; var g = function (k, p) { try {
    var o = h;
    var n = (p == "over") ? "#ccc" : "#777";
    k.save();
    k.fillStyle = n;
    k.fillRect(o.x, o.y, o.width, o.height);
    k.fillStyle = "red";
    var m = o.width;
    k.translate(0, h.y);
    k.beginPath();
    var j = h.x;
    var q = (m / 2);
    k.moveTo(j, q);
    k.lineTo(j + m, q);
    k.lineTo((2 * j + m) / 2, q + m / 2);
    k.closePath();
    k.fill();
    k.restore();
}
catch (l) {
    alert("Error: " + l.message);
} }; var b = function (j, l, k) { j.fillStyle = WindowsLib.getBackgroundColor(); j.fillRect(0, 0, d.width, d.height); a.paintRoundedBox(j, d, f, l, k, c); g(j, "normal"); }; return { initLayout: e, paintArrow: g, paintComboBox: b }; };
var ComboBoxControl = function (l) { var n = null; var y = new SelectControl(); var k = false; var a = new BoxModel(); var p = new BoxStyle(4, 5, 0); var b = new BoxStyle(4, 4, 4); var d = 0; var e = new ComboBoxLayoutManager(l); var h = function () { return l.getContext("2d"); }; var u = function (A) { n = A; y.setFont(A); }; var c = function () { if (!n) {
    alert("ComboBoxControl.getFont(): Need to set font first");
} return n; }; var w = new DefaultComboBoxPainter(); var f = null; var z = function (A, B) { if (f && f.paintArrow) {
    f.paintArrow(A, B);
}
else {
    w.paintArrow(A, B);
} }; l.onmouseover = function (B) { var A = h(); z(A, "over"); }; l.onmouseout = function (B) { if (!k) {
    var A = h();
    z(A, "normal");
} }; var j = function (A) { var D = 0; var C = e.isDynamicWidth(); if (C) {
    var B = g();
    D = e.getTextWidth(B, c());
}
else {
    D = e.getMaximumTextWidth(A, c());
} e.manageBoxLayout(a, p, b, D, c()); }; var q = function () { var A = c(); p.setFont(A); b.setFont(A); l.style.background = A.getTextColor(); var C = a.getMarginBox(); var B = p.getContentBox(); var E = b.getContentBox(); w.initLayout(C, B, E); if (f && f.initLayout) {
    f.initLayout(C, B, E);
} var D = e.isDynamicWidth(); if (!D) {
    WindowsLib.setCanvasSize(l, C.width, C.height);
} }; var g = function () { var A = y.getValue(); var C = y.getSelectedIndex(); if (C > -1) {
    var B = y.getOptions().item(C);
    A = B.getLabel();
} return A; }; var x = function () { var C = null; var D = e.isDynamicWidth(); if (D) {
    layout();
    C = a.getMarginBox();
    WindowsLib.setCanvasSize(l, C.width, C.height);
}
else {
    C = a.getMarginBox();
} var B = g(); var A = h(); if (f && f.paintComboBox) {
    f.paintComboBox(A, B, c());
}
else {
    w.paintComboBox(A, B, c());
} }; var m = function (B) { var A = function (D, C) { x(); k = false; if (B) {
    B(D, C);
} }; y.setSelectionCallback(A); }; var o = function (A) { y.setHoverCallback(A); }; var t = function (A) { try {
    y.setOptions(A);
    j(A);
    var H = a.getOffset();
    var G = l.offsetLeft;
    var F = l.offsetTop;
    var C = a.getTotalHeight();
    var E = y.setLayoutOffset(G, F, C);
    var D = a.getLeftLength() + a.getRightLength();
    a.contentArea.width = E.width - D;
    q();
    m(null);
    l.onclick = function (I) { k = !k; y.setOffset(l.offsetLeft, l.offsetTop); y.updateHighlight(); y.setVisible(k, I); };
    x();
}
catch (B) {
    debug("Error: " + B.message);
} }; var v = function (A) { y.setSize(A); }; var r = function () { return y; }; return { setComboBoxPainter: function (A) { f = A; }, setBoxLayout: function (A) { e.setBoxLayout(A); }, setOptions: t, setSize: v, setSelectionCallback: m, setHoverCallback: o, getSelectControl: r, setFont: u }; };
