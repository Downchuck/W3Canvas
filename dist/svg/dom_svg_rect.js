"use strict";
colorjack.dom.SVGAnimatable = function (element) {
    return {};
    //	element.onbegin
    //	element.onend
    //	element.onrepeat
};
colorjack.dom.SVGElement = function (element) {
    var SVGElement = function () {
        var id = "";
        return {
            'setId': function (d) { id = d; },
            'getId': function () { return id; },
            'setClassName': function (c) { className = c; },
            'getClassName': function () { return className; }
        };
    };
    element.style = new ElementStyle(new CssStyle(), new SVGElement()); // SVGStyleable(Element)
    var SVGStyleable = function () {
        var fill = "";
        var stroke = "";
        var currentColor = function (color) {
            if (color && color != 'currentColor')
                return color;
            if (typeof (element.style) != 'undefined')
                return element.style.getColor();
            return '';
        };
        return {
            'setStroke': function (s) { stroke = s; },
            'getStroke': function () { return currentColor(stroke); },
            'setFill': function (f) { fill = f; },
            'getFill': function () { return currentColor(fill); }
        };
    };
    element = mixin(element, new SVGStyleable());
    var box = new BoxModel(); // not used
    element.getBoundingRect = function () { return box.getBorderBox(); };
    return mixin(element, box);
};
colorjack.dom.registerElement("svg:rect", "SVGRectElement", function (element) {
    var RectElement = function () {
        var width = 0;
        var height = 0;
        var x = 0;
        var y = 0;
        var rx = 0;
        var ry = 0;
        return {
            'getX': function () { return x; },
            'setX': function (newX) { x = newX; },
            'getY': function () { return y; },
            'setY': function (newX) { y = newY; },
            'getRy': function () { return ry; },
            'setRy': function (newRy) { y = newRy; },
            'getRx': function () { return rx; },
            'setRx': function (newRx) { x = newRx; },
            'getHeight': function () { return height; },
            'setHeight': function (h) { height = h; },
            'getWidth': function () { return width; },
            'setWidth': function (w) { width = w; }
        };
    };
    var base = new colorjack.dom.SVGElement(element);
    return mixin(base, new RectElement());
});
colorjack.controlFactory.Rectangle = function (layer) {
    var rectEl = HtmlDoc.createElement("svg:rect");
    var ctx = layer.getContext('2d');
    var RectDisplay = function () {
        var RectDom = function (rect, fn) {
            // get specified geometry attributes' values or revert to default
            var w = rect.hasAttribute('width') ? Number(rect.getAttribute('width')) : 0;
            var h = rect.hasAttribute('height') ? Number(rect.getAttribute('height')) : 0;
            var x = rect.hasAttribute('x') ? Number(rect.getAttribute('x')) : 0;
            var y = rect.hasAttribute('y') ? Number(rect.getAttribute('y')) : 0;
            var rx = rect.hasAttribute('rx') ? Number(rect.getAttribute('rx')) : 0;
            var ry = rect.hasAttribute('ry') ? Number(rect.getAttribute('ry')) : 0;
            if (w <= 0 || h <= 0)
                return;
            // check rx and ry values to match if one is 0
            if ((rx == 0 || ry == 0) && !(rx == 0 && ry == 0)) {
                rx = (rx == 0) ? ry : rx;
                ry = (ry == 0) ? rx : ry;
            }
            // from antoine: need to match cx and cy in case one is missing and clip values if great than half w/h
            if (typeof (fn) != 'function')
                fn = RectReflectString;
            return fn(x, y, w, h, rx, ry);
        };
        var RectReflectString = function (x, y, w, h, rx, ry) {
            if (!rx)
                return ['M' + x, y, 'H' + (x + w), 'L' + (h + y), 'H' + x, 'L' + y, 'z'].join(',');
            return ['M' + x, y, // Rounded rectangle
                'H' + (x + w), 'C' + [x + w, y, x + w, y + ry, x + w, y + ry].join(','),
                'L' + (h + y), 'C' + [x + w, y + h, x + w - rx, y + h, x + w - rx, y + h].join(','),
                'H' + x, 'C' + [x, y + h, x, y + h - ry, x, y + h - ry].join(','),
                'L' + y, 'C' + [x, y, x + rx, y, x + rx, y].join(','), 'z'].join(',');
        };
        var RectPainter = function (x, y, w, h, rx, ry) {
            if (!rx) {
                ctx.beginPath();
                ctx.rect(x, y, w, h);
                ctx.closePath();
                return;
            }
            ctx.beginPath();
            ctx.moveTo(x + rx, y);
            ctx.lineTo(x + w - rx, y);
            ctx.bezierCurveTo(x + w, y, x + w, y + ry, x + w, y + ry);
            ctx.lineTo(x + w, y + h - ry);
            ctx.bezierCurveTo(x + w, y + h, x + w - rx, y + h, x + w - rx, y + h);
            ctx.lineTo(x + rx, y + h);
            ctx.bezierCurveTo(x, y + h, x, y + h - ry, x, y + h - ry);
            ctx.lineTo(x, y + ry);
            ctx.bezierCurveTo(x, y, x + rx, y, x + rx, y);
            ctx.closePath();
        };
        var repaint = function () {
            ctx = layer.getContext('2d');
            console.log("Repainting rectangle...");
            var x = this.getX() || 0;
            var y = this.getY() || 0;
            var w = this.getWidth() || 300;
            var h = this.getHeight() || 150;
            var rx = this.getRx() || 0;
            var ry = this.getRy() || 0;
            var fill = this.getFill();
            var stroke = this.getStroke();
            console.log("  - Coords: (".concat(x, ", ").concat(y, ")"));
            console.log("  - Dims: ".concat(w, "x").concat(h));
            console.log("  - Rounded: ".concat(rx, ", ").concat(ry));
            console.log("  - Fill: ".concat(fill));
            console.log("  - Stroke: ".concat(stroke));
            // Fill
            ctx.fillStyle = fill;
            if (fill) {
                if (rx === 0 && ry === 0) {
                    console.log("  - Filling with scanlineFill");
                    colorjack.alg.scanlineFill(ctx, x, y, w, h);
                }
                else {
                    console.log("  - Filling with native fill");
                    RectPainter(x, y, w, h, rx, ry);
                    ctx.fill();
                }
            }
            // Stroke
            ctx.strokeStyle = stroke;
            ctx.fillStyle = stroke;
            if (stroke) {
                console.log("  - Stroking...");
                if (rx === 0 && ry === 0) {
                    colorjack.alg.bresenham(ctx, x, y, x + w, y);
                    colorjack.alg.bresenham(ctx, x + w, y, x + w, y + h);
                    colorjack.alg.bresenham(ctx, x + w, y + h, x, y + h);
                    colorjack.alg.bresenham(ctx, x, y + h, x, y);
                }
                else {
                    colorjack.alg.bresenham(ctx, x + rx, y, x + w - rx, y);
                    colorjack.alg.drawBezier(ctx, x + w - rx, y, x + w, y, x + w, y + ry, x + w, y + ry);
                    colorjack.alg.bresenham(ctx, x + w, y + ry, x + w, y + h - ry);
                    colorjack.alg.drawBezier(ctx, x + w, y + h - ry, x + w, y + h, x + w - rx, y + h, x + w - rx, y + h);
                    colorjack.alg.bresenham(ctx, x + w - rx, y + h, x + rx, y + h);
                    colorjack.alg.drawBezier(ctx, x + rx, y + h, x, y + h, x, y + h - ry, x, y + h - ry);
                    colorjack.alg.bresenham(ctx, x, y + h - ry, x, y + ry);
                    colorjack.alg.drawBezier(ctx, x, y + ry, x, y, x + rx, y, x + rx, y);
                }
            }
        };
        return {
            'repaint': repaint,
            'getPainter': RectPainter,
            'getDom': RectDom,
            'getString': RectReflectString
        };
    };
    return mixin(rectEl, new RectDisplay());
};
