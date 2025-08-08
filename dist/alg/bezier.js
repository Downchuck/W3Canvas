"use strict";
colorjack.alg.drawBezier = function (ctx, x0, y0, x1, y1, x2, y2, x3, y3) {
    // x0, y0: start point
    // x1, y1: control point 1
    // x2, y2: control point 2
    // x3, y3: end point
    var steps = 100; // number of line segments to approximate the curve
    var prevX = x0;
    var prevY = y0;
    for (var i = 1; i <= steps; i++) {
        var t = i / steps;
        var t2 = t * t;
        var t3 = t2 * t;
        var mt = 1 - t;
        var mt2 = mt * mt;
        var mt3 = mt2 * mt;
        var x = (mt3 * x0) + (3 * mt2 * t * x1) + (3 * mt * t2 * x2) + (t3 * x3);
        var y = (mt3 * y0) + (3 * mt2 * t * y1) + (3 * mt * t2 * y2) + (t3 * y3);
        colorjack.alg.bresenham(ctx, prevX, prevY, x, y);
        prevX = x;
        prevY = y;
    }
};
