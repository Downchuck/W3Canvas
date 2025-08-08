"use strict";
colorjack.alg.drawArc = function (ctx, cx, cy, radius, startAngle, endAngle) {
    var steps = 100;
    var angleStep = (endAngle - startAngle) / steps;
    var prevX = cx + radius * Math.cos(startAngle);
    var prevY = cy + radius * Math.sin(startAngle);
    for (var i = 1; i <= steps; i++) {
        var angle = startAngle + i * angleStep;
        var x = cx + radius * Math.cos(angle);
        var y = cy + radius * Math.sin(angle);
        colorjack.alg.bresenham(ctx, prevX, prevY, x, y);
        prevX = x;
        prevY = y;
    }
};
