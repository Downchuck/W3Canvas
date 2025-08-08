"use strict";
colorjack.css.BoxModelPainter = function () {
    // 3D CSS Box Model
    // http://www.hicksdesign.co.uk/boxmodel/
    // http://redmelon.net/tstme/box_model/
    // http://www.w3.org/TR/CSS2/box.html
    var fillRect = function (ctx, x, y, width, height) {
        ctx.fillRect(Math.round(x), Math.round(y), Math.round(width), Math.round(height)); // To make sure to get rid of anti-aliasing
        ctx.fillRect(x, y, width, height);
    };
    var rect = function (ctx, x, y, width, height) {
        ctx.rect(Math.round(x), Math.round(y), Math.round(width), Math.round(height)); // // To make sure to get rid of anti-aliasing
        //ctx.rect(x, y, width, height);
    };
    var paintTextGeneral = function (ctx, boxModel, contentBox, text, font) {
        ctx.save();
        // Clip text within the contentBox so that we don't write in the padding area
        var box = contentBox;
        clipToArea(ctx, box);
        if (boxModel) {
            var left = boxModel.getLeftLength();
            var top = boxModel.getTopLength();
            var offset = boxModel.getComputedOffset();
            ctx.translate(offset.x + left, offset.y + top);
        }
        else {
            ctx.translate(box.x, box.y);
        }
        var baseline = font.getBaseLine(); // Less than TextHeight
        ctx.translate(0, baseline);
        font.fillText(ctx, text);
        ctx.restore();
    };
    var paintText = function (ctx, contentBox, text, font) {
        paintTextGeneral(ctx, null, contentBox, text, font);
    };
    var paintBox = function (ctx, baseBoxModel, style, maxContentWidth, text) {
        ctx.save();
        var boxModel = (maxContentWidth) ? colorjack.util.clone(baseBoxModel) : baseBoxModel;
        if (maxContentWidth) {
            boxModel.contentArea.width = maxContentWidth; // we are changing the clone.
        }
        // We don't paint in the margin (this is actually our clip area)
        // 1. Paint the Margin (clear out), and "clip" area to the margin
        // 2. Paint the Background color (inside the margin): "background-color"
        // 3. Paint the Background image on top of it: "background-image"
        // 4. Paint the Padding/ContentArea
        // 5. Paint the ContentArea (text)
        // 6. Paint the Border (on top of everything else)
        var marginColor = null; //"white"; //style.getMarginColor();
        var bgColor = style.getBackgroundColor();
        //var bgImage = style.getBackgroundImage();
        var borderColor = style.getBorderColor();
        // --- Margin -----------------------------------------
        var marginBox = boxModel.getMarginBox();
        var box = marginBox;
        if (marginColor !== null) { // margin "is" transparent
            //ctx.fillStyle = marginColor;
            //ctx.fillRect(box.x, box.y, box.width, box.height);
        }
        // --- Clip inside the Margin (Border+Padding+Content) -----------
        var borderBox = boxModel.getBorderBox();
        box = borderBox;
        clipToArea(ctx, box);
        // --- Paint Background ------------------------------------------
        if (bgColor) {
            var paddingBox = boxModel.getPaddingBox();
            box = paddingBox;
            ctx.fillStyle = bgColor;
            fillRect(ctx, box.x, box.y, box.width, box.height);
        }
        // --- Paint Content ------------------------------------------
        var contentBox = boxModel.getContentBox();
        box = contentBox; // where to draw
        var showPaddingForTesting = 0;
        if (showPaddingForTesting) {
            var optionPaddingColor = "#cc9";
            ctx.fillStyle = optionPaddingColor;
            fillRect(ctx, box.x, box.y, box.width, box.height);
        }
        if (text && text.length > 0) {
            var font = style.getFont();
            paintTextGeneral(ctx, boxModel, contentBox, text, font);
        }
        // Fill the border (For later: it should be the last step and perhaps using different border styles)
        ctx.fillStyle = borderColor;
        // fillRect(ctx, box.x, box.y, box.width, box.height);
        var b = boxModel.border;
        var x, thickness;
        if (b.top > 0) {
            fillRect(ctx, borderBox.x, borderBox.y, borderBox.width, b.top);
        }
        if (b.right > 0) {
            thickness = b.right;
            x = borderBox.x + borderBox.width - thickness;
            fillRect(ctx, x, borderBox.y, thickness, borderBox.height);
        }
        if (b.bottom > 0) {
            thickness = b.bottom;
            fillRect(ctx, borderBox.x, borderBox.y + borderBox.height - thickness, borderBox.width, thickness);
        }
        if (b.left > 0) {
            thickness = b.left;
            fillRect(ctx, borderBox.x, borderBox.y, thickness, borderBox.height);
        }
        ctx.restore();
    };
    var paintRoundedBoxGradient = function (ctx, box, gradient) {
        ctx.save();
        paintRoundedBox(ctx, box.x, box.y, box.width, box.height);
        ctx.clip();
        ctx.drawImage(gradient, box.x, box.y);
        ctx.restore();
    };
    var paintRoundedTextBox = function (ctx, box, fillStyle, text, font, textBox) {
        ctx.save();
        paintRoundedBox(ctx, box.x, box.y, box.width, box.height);
        ctx.clip();
        ctx.fillStyle = fillStyle;
        fillRect(ctx, box.x, box.y, box.width, box.height);
        if (text && text.length > 0) {
            paintText(ctx, textBox, text, font);
        }
        ctx.restore();
    };
    // DRAW ROUNDED RECTANGLE
    var paintRoundedBox = function (ctx, x, y, w, h, squareX, squareY) {
        if (!h) {
            throw new Error("paintRoundedBox(): Missing arguments!");
        }
        var squareness = Math.max(7, Math.min(h / 4, 60));
        var rad_X = squareX || squareness;
        var rad_Y = squareY || squareness;
        // init vars
        var theta = 0;
        var angle = 0;
        var cx = 0;
        var cy = 0;
        var px = 0;
        var py = 0;
        // make sure that w + h are larger than 2*rad_X
        if (rad_X > Math.min(w, h) / 2) {
            rad_X = Math.min(w, h) / 2;
        }
        if (rad_Y > Math.min(w, h) / 2) {
            rad_Y = Math.min(w, h) / 2;
        }
        // theta = 45 degrees in radians
        theta = Math.PI / 4;
        // draw top line
        ctx.beginPath();
        ctx.moveTo(x + rad_X, y);
        ctx.lineTo(x + w - rad_X, y);
        //angle is currently 90 degrees
        angle = -Math.PI / 2;
        // draw tr corner in two parts
        cx = x + w - rad_X + (Math.cos(angle + (theta / 2)) * rad_X / Math.cos(theta / 2));
        cy = y + rad_Y + (Math.sin(angle + (theta / 2)) * rad_Y / Math.cos(theta / 2));
        px = x + w - rad_X + (Math.cos(angle + theta) * rad_X);
        py = y + rad_Y + (Math.sin(angle + theta) * rad_Y);
        ctx.quadraticCurveTo(cx, cy, px, py);
        angle += theta;
        cx = x + w - rad_X + (Math.cos(angle + (theta / 2)) * rad_X / Math.cos(theta / 2));
        cy = y + rad_Y + (Math.sin(angle + (theta / 2)) * rad_Y / Math.cos(theta / 2));
        px = x + w - rad_X + (Math.cos(angle + theta) * rad_X);
        py = y + rad_Y + (Math.sin(angle + theta) * rad_Y);
        ctx.quadraticCurveTo(cx, cy, px, py);
        // draw right line
        ctx.lineTo(x + w, y + h - rad_Y);
        // draw br corner
        angle += theta;
        cx = x + w - rad_X + (Math.cos(angle + (theta / 2)) * rad_X / Math.cos(theta / 2));
        cy = y + h - rad_Y + (Math.sin(angle + (theta / 2)) * rad_Y / Math.cos(theta / 2));
        px = x + w - rad_X + (Math.cos(angle + theta) * rad_X);
        py = y + h - rad_Y + (Math.sin(angle + theta) * rad_Y);
        ctx.quadraticCurveTo(cx, cy, px, py);
        angle += theta;
        cx = x + w - rad_X + (Math.cos(angle + (theta / 2)) * rad_X / Math.cos(theta / 2));
        cy = y + h - rad_Y + (Math.sin(angle + (theta / 2)) * rad_Y / Math.cos(theta / 2));
        px = x + w - rad_X + (Math.cos(angle + theta) * rad_X);
        py = y + h - rad_Y + (Math.sin(angle + theta) * rad_Y);
        ctx.quadraticCurveTo(cx, cy, px, py);
        // draw bottom line
        ctx.lineTo(x + rad_X, y + h);
        // draw bl corner
        angle += theta;
        cx = x + rad_X + (Math.cos(angle + (theta / 2)) * rad_X / Math.cos(theta / 2));
        cy = y + h - rad_Y + (Math.sin(angle + (theta / 2)) * rad_Y / Math.cos(theta / 2));
        px = x + rad_X + (Math.cos(angle + theta) * rad_X);
        py = y + h - rad_Y + (Math.sin(angle + theta) * rad_Y);
        ctx.quadraticCurveTo(cx, cy, px, py);
        angle += theta;
        cx = x + rad_X + (Math.cos(angle + (theta / 2)) * rad_X / Math.cos(theta / 2));
        cy = y + h - rad_Y + (Math.sin(angle + (theta / 2)) * rad_Y / Math.cos(theta / 2));
        px = x + rad_X + (Math.cos(angle + theta) * rad_X);
        py = y + h - rad_Y + (Math.sin(angle + theta) * rad_Y);
        ctx.quadraticCurveTo(cx, cy, px, py);
        // draw left line
        ctx.lineTo(x, y + rad_Y);
        // draw tl corner
        angle += theta;
        cx = x + rad_X + (Math.cos(angle + (theta / 2)) * rad_X / Math.cos(theta / 2));
        cy = y + rad_Y + (Math.sin(angle + (theta / 2)) * rad_Y / Math.cos(theta / 2));
        px = x + rad_X + (Math.cos(angle + theta) * rad_X);
        py = y + rad_Y + (Math.sin(angle + theta) * rad_Y);
        ctx.quadraticCurveTo(cx, cy, px, py);
        angle += theta;
        cx = x + rad_X + (Math.cos(angle + (theta / 2)) * rad_X / Math.cos(theta / 2));
        cy = y + rad_Y + (Math.sin(angle + (theta / 2)) * rad_Y / Math.cos(theta / 2));
        px = x + rad_X + (Math.cos(angle + theta) * rad_X);
        py = y + rad_Y + (Math.sin(angle + theta) * rad_Y);
        ctx.quadraticCurveTo(cx, cy, px, py);
        ctx.closePath();
    };
    /*var gradient_round_rectangle = function(ctx, x, y, w, h, startColor, endColor, shadowColor) {
      var s = 2;

      ctx.save();

      if (shadowColor) {
        ctx.fillStyle = shadowColor;
        ctx.fillRect(x-s, y-s, w+2*s, h+2*s);
      }
      paintRoundedBox(ctx, x, y, w, h);
      setupLinearGradient(ctx, x, y, w, h, startColor, endColor);
      ctx.clip();
      ctx.fill();

      ctx.restore();
    };*/
    var paintImage = function (ctx, img, box, halign, valign) {
        halign = halign || "left";
        valign = valign || "center";
        if (!halign || !valign) {
            throw new Error("paintImage(): Missing halign, valign");
        }
        var x = box.x;
        var y = box.y;
        var availWidth = Math.max(0, box.width - img.width);
        if (halign == "left") {
            // do nothing
        }
        else if (halign == "center") {
            x = box.x + availWidth / 2;
        }
        else if (halign == "right") {
            x = box.x + availWidth;
        }
        var availHeight = Math.max(0, box.height - img.height);
        if (valign == "top") {
            // do nothing
        }
        else if (valign == "center") {
            y = box.y + availHeight / 2;
        }
        else if (valign == "bottom") {
            y = box.y + availHeight;
        }
        ctx.save();
        clipToArea(ctx, box);
        ctx.drawImage(img, x, y);
        ctx.restore();
    };
    var setupLinearGradient = function (ctx, x, y, w, h, startColor, endColor, topDown) {
        var lingrad = (topDown) ? ctx.createLinearGradient(x, y, x, y + h) :
            ctx.createLinearGradient(x, y, x + w, y);
        lingrad.addColorStop(0, startColor);
        lingrad.addColorStop((topDown) ? 1.0 : 0.7, endColor);
        ctx.fillStyle = lingrad;
    };
    function clipToArea(ctx, box) {
        ctx.beginPath();
        ctx.rect(box.x, box.y, box.width, box.height);
        ctx.closePath();
        ctx.clip();
    }
    ;
    return {
        paintBox: paintBox,
        paintRoundedBox: paintRoundedBox,
        paintText: paintText,
        paintRoundedTextBox: paintRoundedTextBox,
        paintRoundedBoxGradient: paintRoundedBoxGradient,
        paintImage: paintImage,
        setupLinearGradient: setupLinearGradient
    };
};
