"use strict";
colorjack.controlFactory.Image = function (layer) {
    var imageEl = colorjack.currentDocument.createElement("img");
    var ImageDisplay = function () {
        var borderColor = "black";
        var img = new Image();
        var hasPredefinedWidthAndHeight = function () {
            var has = (imageEl.getWidth() > 0 && imageEl.getHeight() > 0); // Both attributes must be defined.
            return has;
        };
        var paintImage = function () {
            // Paint the BoxModel: margin/border/padding. Padding = 0
            var ctx = layer.getContext('2d');
            // Border
            var b = imageEl.getBorderBox();
            ctx.fillStyle = borderColor;
            ctx.fillRect(b.x, b.y, b.width, b.height);
            // Content: image
            var c = imageEl.getContentBox();
            ctx.drawImage(img, 0, 0, img.width, img.height, c.x, c.y, c.width, c.height);
        };
        // Note: Make sure to call it last after setting all the other options.
        var setSource = function (src) {
            var resizeLayer = function () {
                var w = imageEl.getTotalWidth();
                var h = imageEl.getTotalHeight();
                colorjack.currentWindow.setCanvasSize(layer, w, h);
            };
            img.onload = function () {
                if (!hasPredefinedWidthAndHeight()) {
                    imageEl.setSize(img.width, img.height);
                    resizeLayer();
                }
                paintImage();
            };
            img.src = src; // start loading the image
            if (hasPredefinedWidthAndHeight()) { // Resize while loading the image
                resizeLayer();
            }
        };
        var setBorderSize = function (t, r, l, b) {
            if (!t) {
                throw new Error("setBorderSize() Missing parameters");
            }
            var border = imageEl.border;
            border.top = t;
            border.right = r || t;
            border.bottom = b || t;
            border.left = l || t;
        };
        var setBorderColor = function (c) {
            borderColor = c;
        };
        return {
            'setBorderColor': setBorderColor,
            'setBorderSize': setBorderSize,
            'setSource': setSource
        };
    };
    return colorjack.util.mixin(imageEl, new ImageDisplay());
};
