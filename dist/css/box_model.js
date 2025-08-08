"use strict";
// For painting any box: all the info needed: x, y, width, height
// 3D CSS Box Model
// http://www.hicksdesign.co.uk/boxmodel/
// http://redmelon.net/tstme/box_model/
// http://www.w3.org/TR/CSS2/box.html
colorjack.css.BoxModel = function () {
    var boxModelFactory = colorjack.css.boxModelFactory;
    var offset = boxModelFactory.createPoint(); // offset + deltaOffset: where to draw in the canvas
    var deltaOffset = boxModelFactory.createPoint(); // deltaOffset: for the Viewport computations without affecting the original offset
    var margin = boxModelFactory.createRect();
    var border = boxModelFactory.createRect();
    var padding = boxModelFactory.createRect();
    var contentArea = boxModelFactory.createSize();
    var getOffset = function () {
        return offset;
    };
    var getTotalWidth = function () {
        var total = contentArea.width +
            padding.right + padding.left +
            border.right + border.left +
            margin.right + margin.left;
        return total;
    };
    var getTotalHeight = function () {
        var total = contentArea.height +
            padding.top + padding.bottom +
            border.top + border.bottom +
            margin.top + margin.bottom;
        return total;
    };
    var getMarginBox = function () {
        var box = boxModelFactory.createBox(); // always create a new instance
        box.x = offset.x + deltaOffset.x;
        box.y = offset.y + deltaOffset.y;
        box.width = getTotalWidth();
        box.height = getTotalHeight();
        return box;
    };
    var getBorderBox = function () {
        var box = getMarginBox();
        box.x = box.x + margin.left;
        box.y = box.y + margin.top;
        box.width = box.width - margin.left - margin.right;
        box.height = box.height - margin.top - margin.bottom;
        return box;
    };
    var getPaddingBox = function () {
        var box = getBorderBox();
        box.x = box.x + border.left;
        box.y = box.y + border.top;
        box.width = box.width - border.left - border.right;
        box.height = box.height - border.top - border.bottom;
        return box;
    };
    var getContentBox = function () {
        var box = getPaddingBox();
        box.x = box.x + padding.left;
        box.y = box.y + padding.top;
        box.width = contentArea.width; // = box.width - padding.left - padding.right;
        box.height = contentArea.height; // = box.height - padding.top - padding.bottom;
        return box;
    };
    // Convenient functions
    var setMargin = function (s) {
        margin.top = s;
        margin.right = s;
        margin.bottom = s;
        margin.left = s;
    };
    var setPadding = function (p) {
        padding.top = p;
        padding.right = p;
        padding.bottom = p;
        padding.left = p;
    };
    var setBorder = function (b) {
        border.top = b;
        border.right = b;
        border.bottom = b;
        border.left = b;
    };
    var setSize = function (w, h) {
        contentArea.width = w;
        contentArea.height = h;
    };
    var setOffset = function (x, y) {
        offset.x = x;
        offset.y = y;
    };
    var setDeltaOffset = function (x, y) {
        deltaOffset.x = x;
        deltaOffset.y = y;
    };
    var getComputedOffset = function () {
        var p = boxModelFactory.createPoint();
        p.x = offset.x + deltaOffset.x;
        p.y = offset.y + deltaOffset.y;
        return p;
    };
    var getTopLength = function () {
        return margin.top + border.top + padding.top;
    };
    var getRightLength = function () {
        return margin.right + border.right + padding.right;
    };
    var getBottomLength = function () {
        return margin.bottom + border.bottom + padding.bottom;
    };
    var getLeftLength = function () {
        return margin.left + border.left + padding.left;
    };
    var isPointInsideBorder = function (x, y) {
        var box = getBorderBox();
        var inside = box.isPointInsideBox(x, y);
        return inside;
    };
    var isPointInsideContent = function (x, y) {
        var box = getContentBox();
        var inside = box.isPointInsideBox(x, y);
        return inside;
    };
    var copyRectFrom = function (src) {
        margin.top = src.margin.top;
        margin.right = src.margin.right;
        margin.bottom = src.margin.bottom;
        margin.left = src.margin.left;
        border.top = src.border.top;
        border.right = src.border.right;
        border.bottom = src.border.bottom;
        border.left = src.border.left;
        padding.top = src.padding.top;
        padding.right = src.padding.right;
        padding.bottom = src.padding.bottom;
        padding.left = src.padding.left;
    };
    return {
        'margin': margin,
        'border': border,
        'padding': padding,
        'copyRectFrom': copyRectFrom,
        'contentArea': contentArea,
        'getPaddingBox': getPaddingBox,
        'getMarginBox': getMarginBox,
        'getBorderBox': getBorderBox,
        'getContentBox': getContentBox,
        'setMargin': setMargin,
        'setPadding': setPadding,
        'setBorder': setBorder,
        'setSize': setSize,
        'setOffset': setOffset,
        'setDeltaOffset': setDeltaOffset,
        'getTotalWidth': getTotalWidth,
        'getTotalHeight': getTotalHeight,
        'getTopLength': getTopLength,
        'getRightLength': getRightLength,
        'getBottomLength': getBottomLength,
        'getLeftLength': getLeftLength,
        'getOffset': getOffset,
        'getComputedOffset': getComputedOffset,
        'isPointInsideBorder': isPointInsideBorder,
        'isPointInsideContent': isPointInsideContent
    };
};
