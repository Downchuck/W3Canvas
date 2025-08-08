"use strict";
colorjack.textbox.ui.cursor.DummyCursor = function () {
    var noOp = function () { };
    return {
        'init': noOp,
        'startBlink': noOp,
        'stopBlink': noOp,
        'showCursor': noOp,
        'hideCursor': noOp,
        'drawCursor': noOp
    };
};
colorjack.textbox.ui.cursor.Cursor = function () {
    //----------------------------------------------------------------------
    var context = null;
    var cursorPosition = null;
    var textBoxId = -1;
    var visualTextBox = null; // to get the style for coloring the cursor
    var init = function (vars) {
        try {
            cursorPosition = vars.cursorPosition;
            context = vars.context;
            textBoxId = vars.textBoxId;
            visualTextBox = vars.visualTextBox;
            colorjack.debug.checkNull("Cursor", [cursorPosition, context, textBoxId, visualTextBox]);
        }
        catch (e) {
            colorjack.debug.programmerPanic("Cursor. Initialization error: " + e.name + " = " + e.message);
        }
    };
    var getContext = function () { return context; };
    //----------------------------------------------------------------------
    var prevOverlapCursorImage = null;
    var prevOverlapCursorPos = null;
    var cursorDrawn = false;
    var getCursorWidth = function () {
        return visualTextBox.getBoxStyle().cursorWidth;
    };
    var graphicsLib = colorjack.graphicsLib;
    var drawCursor = function () {
        if (cursorDrawn) {
            return;
        }
        var ctx = getContext();
        ctx.save();
        var style = visualTextBox.getBoxStyle();
        ctx.fillStyle = style.cursorColor; // cursorColor must be defined
        ctx.strokeStyle = 'rgba(0,0,0,0)';
        var tmp = cursorPosition.getCursorXY();
        var w = getCursorWidth();
        var h = Math.round(tmp[2] - 2);
        // TODO? Adjust the cursor position a little to the left IF it's not the first character in the line.
        //		tmp[0] = tmp[0] - w/2;
        var x = Math.round(tmp[0]);
        var y = Math.round(tmp[1]);
        prevOverlapCursorPos = tmp;
        prevOverlapCursorImage = graphicsLib.createBufferImage(x, y, w, h, ctx.canvas);
        //console.log('drawCursor: ' + x + ',' + y + ' ' + w + 'x' + h);
        ctx.fillRect(x, y, w, h);
        ctx.restore();
        cursorDrawn = 1;
    };
    var hideCursor = function () {
        if (!cursorDrawn) {
            return;
        }
        if (prevOverlapCursorImage) {
            var tmp = prevOverlapCursorPos;
            var w = getCursorWidth();
            var h = tmp[2] - 2;
            var x = tmp[0];
            var y = tmp[1];
            var ctx = getContext();
            ctx.clearRect(x, y, w, h);
            graphicsLib.restoreBufferImage(ctx, prevOverlapCursorImage, x, y, w, h);
            prevOverlapCursorImage = null;
        }
        cursorDrawn = 0;
    };
    // -----------------------------------------------------------------------------
    var cursorInterval = 600;
    var cursorTimer = null;
    var cursorTimers = [];
    var blinkCursor = function () {
        var self = "colorjack.textBoxFactory.getTextBox(" + textBoxId + ")";
        var cmd = self + '.showCursor()';
        cursorTimers.push(cursorTimer = setTimeout(cmd, cursorInterval));
    };
    var showCursor = function (forceDraw) {
        if (forceDraw) {
            hideCursor();
            drawCursor();
            return;
        }
        if (!cursorTimer) {
            return;
        }
        while (cursorTimers.length) {
            clearTimeout(cursorTimers.pop());
        }
        clearTimeout(cursorTimer);
        if (cursorDrawn) {
            hideCursor();
        }
        else {
            hideCursor();
            drawCursor();
        }
        var textFocusManager = colorjack.textFocusManager;
        var focusedId = textFocusManager.getCurrentTextBoxId();
        if (focusedId === textBoxId) {
            blinkCursor();
        }
    };
    var startBlink = function () { hideCursor(); drawCursor(); blinkCursor(); };
    var stopBlink = function () { hideCursor(); clearTimeout(cursorTimer); cursorTimer = null; };
    return {
        'init': init,
        'startBlink': startBlink,
        'stopBlink': stopBlink,
        'showCursor': showCursor,
        'hideCursor': hideCursor,
        'drawCursor': drawCursor
    };
};
colorjack.textbox.ui.cursor.CursorPosition = function () {
    //----------------------------------------------------------------------
    var basicModel = null;
    var inputScrolling = null;
    var visualTextBox = null;
    var visualSelection = null;
    var context; //haipt: add this to measure text!
    var init = function (vars) {
        try {
            basicModel = vars.basicModel;
            inputScrolling = vars.inputScrolling;
            visualTextBox = vars.visualTextBox;
            visualSelection = vars.visualSelection;
            context = vars.context;
            colorjack.debug.checkNull("CursorPosition", [basicModel, inputScrolling, visualTextBox, visualSelection, context]);
        }
        catch (e) {
            colorjack.debug.programmerPanic("CursorPosition. Initialization error: " + e.name + " = " + e.message);
        }
    };
    //----------------------------------------------------------------------
    var getCursorWidth = function () {
        return visualTextBox.getBoxStyle().cursorWidth;
    };
    var getWidth = function (str, fontStyle) {
        var saveFont = context.font;
        context.font = fontStyle;
        var width = context.measureText(str).width;
        //restore
        context.font = saveFont;
        return width;
    };
    //convert from x-coordinate to the character position
    var getCursor = function (x, li) {
        var lines = basicModel.getLines();
        var line = lines[li]; //type: LineBox
        var beforeLen = visualTextBox.getBox().x + inputScrolling.getOffset();
        //search for the inline box that contains this x-pos
        var charsCount = 0;
        var offset = -1;
        for (var j = 0; j < line.getBoxes().length; j++) {
            var box = line.getBoxes()[j];
            if (box.x + box.width < x) { //not the inline box that cover the position yet
                //charsCount+=box.contentFragment.content.length;
                charsCount += box.contentFragment.getCharsCount();
                if (box.contentFragment.hasLinefeed())
                    charsCount--; //do not count linefeed!
            }
            else {
                //this is the box that contains the cursor
                var saveFont = context.font;
                var text = box.contentFragment.content;
                context.font = box.contentFragment.style;
                beforeLen += box.x;
                //find the character inside this fragment
                for (var ch = 0; ch < text.length; ch++) {
                    var currentChar = text.charAt(ch);
                    var currentCharWidth = context.measureText(currentChar).width;
                    if (x < beforeLen + currentCharWidth / 2) {
                        offset = ch;
                        break;
                    }
                    beforeLen += currentCharWidth;
                }
                //restore the font
                context.font = saveFont;
                //console.log('text fragment: ' + text + "@offset: " + offset);
                break;
            }
        }
        //console.log('charsCount: ' + charsCount + ' mouse offset: ' + offset);
        if (offset == -1) { //the position is beyond all existing inline boxes
            //offset = 0;
            offset = 0; //we'll add it to charsCount later
        }
        return [li, charsCount + offset];
    };
    //convert from character offset position to x-coordinate
    var getCursorXY = function (li, off) {
        var pos = visualSelection.getEnd();
        var container = (li === undefined) ? pos[0] : li;
        var offset = (off === undefined) ? pos[1] : off;
        var lines = basicModel.getLines();
        var line = lines[container];
        if (!line) {
            line = lines[0];
        }
        var x = 0;
        var y = 0;
        var height = 0;
        //go to the linebox that contains character @offset
        var charsCount = 0;
        for (var i = 0; i < line.getBoxes().length; i++) {
            var box = line.getBoxes()[i];
            var fragmentLength = box.contentFragment.getCharsCount(false);
            /*
            var fragmentLength = box.contentFragment.content.length;

            //some special cases
            if (box.contentFragment.hasLinefeed) fragmentLength++;
            if (box.contentFragment.isImage) fragmentLength = 1;
            */
            //console.log('charsCount: ' + charsCount + ' fragmentLength: ' + fragmentLength + ' offset: ' + offset);
            //if (charsCount + box.contentFragment.content.length + (box.contentFragment.hasLinefeed? 1: 0) >=offset) {
            if (charsCount + fragmentLength >= offset) {
                //var offset = off-charsCount; //offset inside the fragment
                offset -= charsCount;
                x = box.x + inputScrolling.getOffset();
                if (offset) {
                    if (box.contentFragment.isImage)
                        x += box.width;
                    else
                        x += getWidth(box.contentFragment.content.substr(0, offset), box.contentFragment.style);
                }
                y = box.y;
                height = box.height;
                break;
            }
            //charsCount+=box.contentFragment.content.length;
            charsCount += fragmentLength;
        }
        return [x, y, height];
    };
    var verticalCursorX = -1; // Buffer last X position for Arrow Up/Down movement
    var computeVerticalArrowCursorPos = function (container, offset) {
        var xy = getCursorXY(container, offset);
        var x = xy[0] - visualTextBox.getBoxModel().getLeftLength();
        verticalCursorX = x;
    };
    var getVerticalArrowCursorPos = function (container) {
        return getCursor(verticalCursorX, container);
    };
    // Called after a cursor horizontal arrow movement, control -> Word cursor movement. What about selection !?
    // Called after inserting a character, and/or deleting a character
    // It could be more appropriate to set the offset within the visualTextBox.setInputOffset() to make it more consistent with BoxModel_2.
    // This is something to consider.
    var moveToVisiblePosition = function (c, o) {
        if (inputScrolling.isEnabled()) {
            // Assumption: we are only editing a "single" line of text
            // Check whether this cursor position is visible or not.
            var x = getCursorXY(c, o)[0]; // taking care of the offset
            var bm = visualTextBox.getBoxModel();
            var box = bm.getContentBox();
            var isXCoordVisible = function (x) {
                return (box.x < x && x < box.x + box.width);
            };
            var visible = isXCoordVisible(x);
            if (!visible) {
                var line = basicModel.getLines()[0]; // We only care about the single edit line.
                if (line) {
                    var getInputOffset = function (str, offset, x) {
                        var newOffset = 0;
                        var i, incr = (x <= box.x) ? -1 : 1;
                        var jump = 10; // Jump 10 characters whenever we pass the boundaries of the textbox
                        //						throw new Error("x: " + x + " - box.x: " + box.x);
                        var endOfDoc = (offset >= str.length);
                        if (endOfDoc) {
                            var last = Math.max(0, str.length - jump);
                            newOffset = getWidth(str.substr(0, last));
                        }
                        else if (incr > 0) { // Going forward: not from the offset, but the "last" visible char
                            // Get last current visible char
                            var lastVisibleCharOffset = visualSelection.getEnd()[1];
                            var diffStr = str.substring(lastVisibleCharOffset, offset + jump); // could be single char or word movement
                            var w = getWidth(diffStr);
                            newOffset = -inputScrolling.getOffset() + box.x + w + getCursorWidth(); // Make the cursor visible
                        }
                        else { // Going backward
                            for (i = Math.max(0, offset - jump); i >= 0; i--) {
                                var newX = getWidth(str.substr(0, i));
                                visible = isXCoordVisible(newX + inputScrolling.getOffset());
                                //info("newX: " + newX + " : " + visible);
                                if (!visible) {
                                    newOffset = newX;
                                    break;
                                }
                            }
                        }
                        return newOffset;
                    };
                    var newOffset = getInputOffset(line.content, o, x);
                    //info("New offset: " + newOffset);
                    inputScrolling.setOffset(-newOffset); // offset is always negative, never positive except 0.
                    visualTextBox.drawBox();
                }
            }
        }
    };
    var setPosition = function (c, o) {
        // Following line has been commented out because calling clearMarkedSelection(true) here could corrupt the visual model,
        // because in a deletion operation, clearMarkedSelection might restore cached glyphs that has been already deleted.
        //visualSelection.clearMarkedSelection(true); // Do this before resetting the values of the visualSelection
        moveToVisiblePosition(c, o);
        visualSelection.setStart(c, o);
        visualSelection.setEnd(c, o);
    };
    var getPosition = function () {
        var p = visualSelection.getEnd();
        return [p[0], p[1]];
    };
    return {
        'init': init,
        'getCursor': getCursor,
        'getCursorXY': getCursorXY,
        'setPosition': setPosition,
        'getPosition': getPosition,
        'getVerticalArrowCursorPos': getVerticalArrowCursorPos,
        'moveToVisiblePosition': moveToVisiblePosition,
        'computeVerticalArrowCursorPos': computeVerticalArrowCursorPos
    };
};
