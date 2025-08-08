"use strict";
var WindowsLib = {
    'getWindowView': function () { return document.defaultView.window; },
    'createCanvasLayer': function (w, h) {
        var layer = document.createElement('canvas');
        //selectLayer.style.position = "fixed";		// browser
        layer.style.position = "absolute"; // containing block
        layer.style.visibility = "hidden";
        if (w && h) {
            WindowsLib.setCanvasSize(layer, w, h);
        }
        return layer;
    },
    'setCanvasSize': function (layer, w, h) {
        layer.setAttribute('width', w);
        layer.setAttribute('height', h);
        //layer.width = w;
        //layer.height = h;
        //layer.style.width = w + "px";
        //layer.style.height = h + "px";
    },
    'setBorder': function (layer, width, color, style) {
        var border = width + "px " + color;
        if (style !== undefined) {
            border += " solid";
        }
        layer.style.border = border;
    },
    'getBackgroundColor': function () {
        var bg = "white";
        try {
            bg = document.body.bgColor;
        }
        catch (e99) {
        }
        return bg;
    }
};
var GraphicsLib = function () {
    var createBufferImage = function (x, y, w, h, image) {
        var canvas = document.createElement('canvas');
        //canvas.width = w;
        //canvas.height = h;
        //canvas.style.width = w + "px";
        //canvas.style.height = h + "px";
        canvas.setAttribute('width', w);
        canvas.setAttribute('height', h);
        var context = canvas.getContext('2d');
        x = Math.round(x);
        y = Math.round(y);
        w = Math.round(w);
        h = Math.round(h);
        context.drawImage(image, x, y, w, h, 0, 0, w, h);
        var result = context.canvas;
        return result;
    };
    var restoreBufferImage = function (ctx, buffer, x, y, w, h) {
        ctx.save();
        ctx.globalCompositeOperation = "copy";
        ctx.drawImage(buffer, 0, 0, w, h, x, y, w, h);
        ctx.restore();
    };
    return {
        'restoreBufferImage': restoreBufferImage,
        'createBufferImage': createBufferImage
    };
};
