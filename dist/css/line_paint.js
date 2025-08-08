"use strict";
// Debug
colorjack.component.BoxStyle = function () {
    this.color = "rgb(200,0,0)";
    this.reverseMode = false;
    this.showLines = true;
    this.lineColor = 'rgba(10,10,120,1)';
    this.cursorWidth = 4;
    this.cursorColor = '#555';
    this.borderColor = "black";
    this.selectionColor = "rgba(20,40,200,.7)"; // used in VisualSelection.showRange()
};
colorjack.component.DrawingBoxDebugging = function () {
    this.showSingleLineBorder = true; // to see the border lines
    this.singleLineBorderColor = 'rgb(0,200,0)';
};
// http://www.w3.org/TR/css3-linebox
// lineStacking (within block element)
colorjack.textbox.VisualTextBox = function () {
    var debugging = new colorjack.component.DrawingBoxDebugging();
    var initialized = false;
    // -------------------------------------------------------------------------------
    var baseLineExtraSpacing = 5;
    var basicModel = null;
    var box = null; // Canvas box size
    var boxStyle = new colorjack.component.BoxStyle(); // Default style
    var canvasBox = null;
    var context = null;
    var boxModel = null;
    var originalBoxModel = null;
    var inputScrolling = null;
    var testingMode = false;
    var textBoxId = -1;
    var images = []; //cache images to be drawn!
    // Instead of expanding the original box model, we choose to shrink the box model.
    // And the rest increase the bottom margin area... OR the bottom padding area.
    // For the width, we shouldn't have problems expanding to the maximum.
    var getLineHeight = function () {
        //return baseLineExtraSpacing + font.getTextHeight();
        var ctx = getContext();
        var fontHeight = getFontHeight(ctx);
        return baseLineExtraSpacing + fontHeight;
    };
    //get the current font height of canvas's context by analyzing the font's CSS text
    var getFontHeight = function (ctx) {
        var tokens = ctx.font.split(' ');
        var i;
        for (i = 0; i < tokens.length; i++) {
            var l = tokens[i].length;
            if (l > 2 && tokens[i][l - 2] == 'p' && tokens[i][l - 1] == 'x') {
                var str = tokens[i].substr(0, l - 2);
                return str * 1;
            }
        }
        colorjack.debug.programmerPanic("VisualTextBox. Cannot find font height!");
        //return 0; //cannot find -> return some random value!?
    };
    // HTMLTextAreaElement
    var adjustBoxModel = function (boxModel, canvasBox) {
        var adjusted = new colorjack.css.BoxModel();
        adjusted.copyRectFrom(boxModel);
        var w, h;
        // The DOM Element takes precedence in terms of content size.
        if (boxModel.contentArea.width > 0 &&
            boxModel.contentArea.height > 0) {
            w = boxModel.contentArea.width;
            h = boxModel.contentArea.height;
        }
        else {
            w = canvasBox.width - boxModel.getLeftLength() - boxModel.getRightLength();
            h = canvasBox.height - boxModel.getTopLength() - boxModel.getBottomLength();
        }
        adjusted.setSize(w, h);
        // single textContent block
        // Now adjust the height so that it fits for visible # of lines within "h"
        //		debug("lineHeight: " + lineHeight + ", " + totalLinesHeight);
        var lineHeight = getLineHeight();
        var numLines = 0;
        if (inputScrolling.isEnabled()) {
            numLines = 1;
        }
        else {
            numLines = Math.floor(h / lineHeight);
        }
        var totalLinesHeight = numLines * lineHeight;
        //		throw new Error("Number of Lines: " + numLines + ", " + lineHeight + ", " + totalLinesHeight);
        totalLinesHeight += lineHeight;
        var diff = h - totalLinesHeight;
        adjusted.contentArea.height -= diff;
        //		throw new Error("Adjusted height: " + adjusted.contentArea.height);
        var balanceToTheMargin = true;
        if (balanceToTheMargin) {
            adjusted.margin.bottom += diff;
        }
        else {
            adjusted.padding.bottom += diff;
        }
        //else { // Enable for debugging
        //	adjusted.border.bottom += diff;
        //}
        //		throw new Error("Adjusted width: " + adjusted.contentArea.width);
        //		throw new Error("Adjusted height: " + adjusted.contentArea.height);
        return adjusted;
    };
    var resetBox = function () {
        boxModel = adjustBoxModel(originalBoxModel, canvasBox);
        box = colorjack.boxModelFactory.createBox();
        var offset = boxModel.getOffset();
        box.x = offset.x;
        //box.y = offset.y + font.getTextHeight();
        box.y = offset.y + getFontHeight(context);
        box.width = boxModel.contentArea.width - box.x - 1;
        box.height = boxModel.contentArea.height;
        box.writingMode = 'lr-tb';
    };
    var setFont = function (f) {
        context.font = f;
    };
    var init = function (vars) {
        try {
            if (!initialized) {
                initialized = true;
                basicModel = vars.basicModel;
                canvasBox = vars.canvasBox; // We can resize() the "canvasBox".
                context = vars.context;
                boxModel = vars.textDomElement;
                inputScrolling = vars.inputScrolling;
                textBoxId = vars.textBoxId;
                originalBoxModel = vars.textDomElement;
                resetBox();
                //				throw new Error("InitAdjusted: " + boxModel.contentArea.width);
                colorjack.debug.checkNull("VisualTextBox", [basicModel, box, canvasBox, context, textBoxId]);
            }
        }
        catch (e541) {
            colorjack.debug.programmerPanic("VisualTextBox. Initialization error: " + e541.name + " = " + e541.message);
        }
        return boxModel;
    };
    var getContext = function () { return context; };
    var painter = new colorjack.css.BoxModelPainter();
    var wrapper = new colorjack.css.LineWrapper();
    var drawLine = function (linebox, boxStyle) {
        var ctx = getContext();
        var saveFont = ctx.font;
        ctx.save();
        var i = 0;
        //erase the whole line
        ctx.save();
        ctx.translate(linebox.getLeft(), linebox.getTop()); // text-baseline: bottom
        ctx.clearRect(0, 0, linebox.getMaxWidth(), linebox.getHeight());
        if (boxStyle.reverseMode) {
            ctx.fillStyle = boxStyle.color;
            ctx.fillRect(0, 0, line.getMaxWidth(), line.getHeight());
        }
        if (boxStyle.showLines) {
            ctx.strokeStyle = boxStyle.lineColor;
            ctx.strokeRect(0, 0, linebox.getMaxWidth(), linebox.getHeight());
        }
        if (debugging.showSingleLineBorder) {
            ctx.strokeStyle = debugging.singleLineBorderColor;
            //ctx.strokeRect(0,line.maxHeight-line.height,line.getMaxWidth(),line.getHeight());
        }
        ctx.restore();
        //draw the inline boxes
        for (i = 0; i < linebox.getBoxes().length; i++) {
            ctx.save();
            var box = linebox.getBoxes()[i];
            if (box.contentFragment.isImage) {
                //draw the image
                if (images[box.contentFragment.url] == null) { //not in the cache yet!
                    //load it
                    var img = new Image();
                    //customized properties
                    img.box = box;
                    img.url = box.contentFragment.url; //original url, we remember this to put the image into cache later!
                    img.onload = function () {
                        //info('image loaded: ' + img.src);
                        images[img.url] = img;
                        ctx.drawImage(img, img.box.x, img.box.y, img.box.width, img.box.height);
                    };
                    img.src = box.contentFragment.url;
                }
                else {
                    //fill some place-holder rect first
                    /*
                    ctx.save();
                    ctx.beginPath();
                    ctx.rect(box.x, box.y, box.width, box.height);
                    ctx.fillStyle = "#007f00"; //dark green
                    ctx.fill();
                    ctx.restore();
                    */
                    //info('image found in cache');
                    //just draw the image in the cache
                    ctx.drawImage(images[box.contentFragment.url], box.x, box.y, box.width, box.height);
                }
            }
            else {
                ctx.textBaseline = "bottom"; //put the anchor point at the bottom of the linebox
                ctx.translate(box.x, box.y + box.height); //temporarily hardcode!
                ctx.fillStyle = boxStyle.color;
                if (box.contentFragment.style != "")
                    ctx.font = box.contentFragment.style;
                //info('fillText: ' + box.contentFragment.content + 'font: ' + ctx.font + " pos: " + box.x + "," + box.y);
                ctx.fillText(box.contentFragment.content, 0, 0);
                ctx.restore();
            }
        }
        ctx.restore();
        ctx.font = saveFont; //restore
    };
    //	adjustLineBox [ reflow lines, re-apply styles]
    var drawBox = function () {
        //alert('drawBox');
        if (!initialized) {
            colorjack.debug.programmerPanic("need to call TextBox.init() first");
            return;
        }
        var outerBox = box;
        var textContent = basicModel.getTextContent();
        var fragments = basicModel.getContentFragments();
        var lineMaxWidth = outerBox.width;
        var frameHeight = outerBox.height;
        var offset = { 'x': 0, 'y': 0 };
        if (boxModel) {
            lineMaxWidth = boxModel.contentArea.width;
            offset.x = boxModel.getLeftLength();
            offset.y = boxModel.getTopLength();
        }
        var lineBoxes = wrapper.createLineBoxes(fragments, context, getLineHeight(), lineMaxWidth, frameHeight, baseLineExtraSpacing, offset);
        basicModel.setLines(lineBoxes);
        if (!testingMode) {
            //var drawText = font.drawString;
            var ctx = getContext();
            var drawText = ctx.fillText;
            ctx.save();
            if (boxModel) {
                // Just want to paint the border
                var style = {
                    'getBackgroundColor': function () { return null; }, // Just want to paint the border
                    'getBorderColor': function () { return boxStyle.borderColor; },
                    'getFont': function () { return font; }
                };
                painter.paintBox(ctx, boxModel, style);
                // BoxModel clipping area: ok for TextArea
                var top = boxModel.getTopLength();
                var left = boxModel.getLeftLength();
                var w = boxModel.contentArea.width;
                var h = boxModel.contentArea.height;
                ctx.beginPath();
                ctx.rect(left, top, w, h);
                ctx.clip();
                ctx.clearRect(left, top, w, h);
            }
            for (i = 0; i < lineBoxes.length; i++) {
                drawLine(lineBoxes[i], boxStyle);
            }
            ctx.restore();
        }
    };
    return {
        'init': init,
        'setTestingMode': function (v) { testingMode = v; },
        'getId': function () { return textBoxId; },
        'getBox': function () { return box; },
        'getBoxModel': function () { return boxModel; },
        'setBoxModel': function (b) { boxModel = b; },
        'resetBox': resetBox,
        'drawBox': drawBox,
        'setBoxStyle': function (s) { boxStyle = s; },
        'getBoxStyle': function () { return boxStyle; },
        'setFont': setFont,
        'getFont': function () { return context.font; }
    };
};
