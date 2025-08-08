"use strict";
colorjack.css.BoxStyle = function (margin, border, padding) {
    var boxModel = new colorjack.css.BoxModel();
    boxModel.setMargin(margin || 0);
    boxModel.setBorder(border || 0);
    boxModel.setPadding(padding || 0);
    var SimpleModel = function () {
        return {
            'getMargin': function () { return boxModel.margin.left; },
            'getBorder': function () { return boxModel.border.left; },
            'getPadding': function () { return boxModel.padding.left; }
        };
    };
    return colorjack.util.mixin(boxModel, new SimpleModel(), new colorjack.css.ElementStyle(new colorjack.css.CssStyle()));
};
colorjack.css.Viewport = function () {
    var boxModelFactory = colorjack.css.boxModelFactory;
    var verticalScrollbar = new colorjack.css.VerticalScrollbar();
    var drag = verticalScrollbar.drag;
    var verticalScrollbarBox = null;
    var targetClipRegion = null;
    var needsVerticalScrollbar = function () { return false; }; // to be overriden
    var needsHorizontalScrollbar = function () { return false; }; // to be overriden
    var isInsideScrollbar = function (x, y) {
        var inside = false;
        if (verticalScrollbarBox) {
            var b = verticalScrollbarBox;
            inside = (b.x < x && x < b.x + b.width) &&
                (b.y < y && y < b.y + b.height);
        }
        return inside;
    };
    var getVerticalScrollbarWidth = function () {
        return verticalScrollbar.getScrollbarWidth();
    };
    var getOffsetX = function () {
        return 0; // could use a horizontalScrollbar
    };
    var getOffsetY = function () {
        return verticalScrollbar.getValue();
    };
    var getOffset = function () {
        var point = boxModelFactory.createPoint();
        point.x = getOffsetX();
        point.y = getOffsetY();
        return point;
    };
    var setVerticalSpan = function (min, max, visible) {
        verticalScrollbar.setSpan(min, max, visible);
    };
    var setVerticalIncrement = function (unitInc, blockInc) {
        verticalScrollbar.setIncrement(unitInc, blockInc);
    };
    var setVerticalScrollbarBox = function (x, y, width, height) {
        verticalScrollbarBox = boxModelFactory.createBox(x, y, width, height);
    };
    var displayVerticalScrollbar = function (ctx) {
        var box = verticalScrollbarBox;
        if (box) {
            verticalScrollbar.display(ctx, box.x, box.y, box.width, box.height);
        }
        else {
            throw new Error("displayVerticalScrollbar: vertical scrollBar box has not been set!");
        }
    };
    var setValueAdjustmentListener = function (f) {
        verticalScrollbar.setValueAdjustmentListener(f);
    };
    var scrollUp = function () {
        verticalScrollbar.scrollUp();
    };
    var scrollDown = function () {
        verticalScrollbar.scrollDown();
    };
    var verticalScrollTo = function (percent) {
        verticalScrollbar.scrollTo(percent);
    };
    var layout = function () {
        verticalScrollbar.layout();
    };
    var isInsideScrollThumb = function (x, y) {
        return verticalScrollbar.isInsideScrollThumb(x, y);
    };
    var isInsideScrollBar = function (x, y) {
        return verticalScrollbar.isInsideScrollBar(x, y);
    };
    var dragTo = function () {
        //var percentInc = (drag.end.y - drag.start.y) / verticalScrollbar.getAvailableScrollingHeight();
        var percentInc = (drag.end.y - drag.start.y) / verticalScrollbar.getScrollingHeight();
        var p = drag.percentStart + percentInc * 1.2; // make it a larger increase
        verticalScrollTo(p);
        drag.moved.x = drag.end.x;
        drag.moved.y = drag.end.y;
    };
    var isAboveThumb = function (x, y) {
        return verticalScrollbar.isAboveThumb(x, y);
    };
    var isBelowThumb = function (x, y) {
        return verticalScrollbar.isBelowThumb(x, y);
    };
    var setTargetClipRegion = function (box) {
        targetClipRegion = box;
    };
    var clipToTargetRegion = function (ctx) {
        var box = targetClipRegion;
        if (box) {
            ctx.beginPath();
            ctx.rect(box.x, box.y, box.width, box.height);
            ctx.clip();
        }
        else if (needsVerticalScrollbar()) {
            throw new Error("clipToTarget(): Need to initialize the targetClipRegion box");
        }
    };
    var scrollToCoordinates = function (x, y) {
        verticalScrollbar.scrollToCoordinates(x, y);
    };
    var setDragStart = function (x, y) {
        drag.start.x = x;
        drag.start.y = y;
        drag.percentStart = verticalScrollbar.getPercentValue();
        drag.dragging = true;
        drag.active = true;
        document.documentElement.style.cursor = "pointer";
    };
    var setDragStop = function () {
        drag.dragging = false;
        drag.active = false;
        document.documentElement.style.cursor = "default"; //crosshair"; // hand, move
    };
    // TODO: sort in alphabetical order
    return {
        'displayVerticalScrollbar': displayVerticalScrollbar,
        'setTargetClipRegion': setTargetClipRegion,
        'clipToTargetRegion': clipToTargetRegion,
        'getOffset': getOffset,
        'setDragStart': setDragStart,
        'setDragStop': setDragStop,
        'drag': verticalScrollbar.drag,
        'layout': layout,
        'isAboveThumb': isAboveThumb,
        'isBelowThumb': isBelowThumb,
        'isInsideScrollbar': isInsideScrollbar,
        'isInsideScrollThumb': isInsideScrollThumb,
        'getVerticalScrollbarWidth': getVerticalScrollbarWidth,
        'needsVerticalScrollbar': needsVerticalScrollbar,
        'needsHorizontalScrollbar': needsHorizontalScrollbar,
        'setVerticalSpan': setVerticalSpan,
        'setVerticalIncrement': setVerticalIncrement,
        'setVerticalScrollbarBox': setVerticalScrollbarBox,
        'scrollUp': scrollUp,
        'scrollDown': scrollDown,
        'dragTo': dragTo,
        'verticalScrollTo': verticalScrollTo,
        'isInsideScrollBar': isInsideScrollBar,
        'scrollToCoordinates': scrollToCoordinates,
        'setValueAdjustmentListener': setValueAdjustmentListener
    };
};
