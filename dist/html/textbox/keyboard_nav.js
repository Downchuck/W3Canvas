"use strict";
/*
This file handles keyboard navigation.
File contains two interfaces: KeyNavigatorImpl and KeyNavigator.
KeyNavigator simply translates keystrokes to cursor movement concepts implemented in KeyNavigatorImpl.
*/
// Abstract navigation concept interface, e.g. "move to home" "move to next word"
colorjack.keyboard.KeyNavigatorImpl = function () {
    //----------------------------------------------------------------------
    var basicModel = null;
    var cursor = null;
    var cursorPosition = null;
    var editLineModel = null;
    var textModel = null;
    var visualSelection = null;
    var visualLineModel = null;
    var init = function (vars) {
        try {
            basicModel = vars.basicModel;
            cursor = vars.cursor;
            cursorPosition = vars.cursorPosition;
            textModel = vars.textModel;
            editLineModel = textModel.getEditLineModel();
            visualLineModel = textModel.getVisualLineModel();
            visualSelection = vars.visualSelection;
            colorjack.debug.checkNull("KeyNavigatorImpl", [basicModel, cursor, cursorPosition, editLineModel, textModel, visualLineModel, visualSelection]);
        }
        catch (e) {
            colorjack.debug.programmerPanic("KeyNavigatorImpl. Initialization error: " + e.name + " = " + e.message);
        }
    };
    //----------------------------------------------------------------------
    var pageSize = 5;
    var wordpadMode = true;
    var getCursorPos = function () {
        var pos = cursorPosition.getPosition();
        return pos;
    };
    var moveOrSelectTo = function (container, offset, selectionMode) {
        var safeContainer = Math.max(0, Math.min(basicModel.getLineCount() - 1, container));
        var safeOffset = Math.min(visualLineModel.getLastOffset(safeContainer), offset);
        if (safeContainer != container) {
            colorjack.debug.programmerPanic("Out of range: container: " + container + ", safe: " + safeContainer);
        }
        if (safeOffset != offset) {
            colorjack.debug.programmerPanic("Out of range: offset: " + offset + ", safe: " + safeOffset);
        }
        // debug("Numline: " + container + " -> " + safeContainer + "," + offset + " -> " + safeOffset); /*DBG*/
        if (selectionMode) {
            cursor.stopBlink();
            visualSelection.clearMarkedSelection();
            visualSelection.setEnd(safeContainer, safeOffset);
            cursorPosition.moveToVisiblePosition(safeContainer, safeOffset);
            visualSelection.showRange();
            cursor.startBlink();
        }
        else { // just move cursor to new position
            //info('moveTo ' + safeContainer + ' ' + safeOffset);
            //cursorPosition.moveToVisiblePosition(safeContainer, safeOffset);
            cursorPosition.setPosition(safeContainer, safeOffset);
            // since we are not in selection mode, any cursor movement should lead to text deselection.
            visualSelection.clearMarkedSelection();
        }
    };
    var moveToHome = function (k) {
        var linenum;
        var offset;
        if (k.ctrlKey) { // start of whole document
            linenum = 0;
            offset = 0;
        }
        else { // start of line
            linenum = getCursorPos()[0];
            offset = 0;
        }
        moveOrSelectTo(linenum, offset, k.shiftKey);
        cursorPosition.computeVerticalArrowCursorPos(linenum, offset);
    };
    var moveToEnd = function (k) {
        var linenum;
        var offset;
        if (k.ctrlKey) { // end of whole document
            var last = visualLineModel.getLastPosition();
            linenum = last[0];
            offset = last[1];
        }
        else { // end of line
            linenum = getCursorPos()[0];
            offset = visualLineModel.getLastOffset(linenum);
        }
        moveOrSelectTo(linenum, offset, k.shiftKey);
        cursorPosition.computeVerticalArrowCursorPos(linenum, offset);
    };
    var getLineCount = function () {
        return basicModel.getLineCount();
    };
    var movePage = function (pageDown, k) {
        var canMove;
        var linenum;
        var line = getCursorPos()[0];
        if (pageDown) { // pageDown
            canMove = (line + pageSize < getLineCount());
            linenum = line + pageSize;
        }
        else { // pageUp
            canMove = (line >= pageSize);
            linenum = line - pageSize;
        }
        if (canMove) {
            var charTarget = getCursorPos()[1];
            var offset = Math.min(charTarget, visualLineModel.getLastOffset(linenum));
            moveOrSelectTo(linenum, offset, k.shiftKey);
        }
    };
    var moveArrowVertical = function (arrowDown, k) {
        var normal = true; // var normal = !k.ctrlKey; // Ignore control key for vertical arrow selection
        if (normal) {
            var pos = getCursorPos();
            var linenum = pos[0] + ((arrowDown) ? 1 : -1);
            var canMove = (0 <= linenum && linenum < getLineCount());
            if (canMove) {
                pos = cursorPosition.getVerticalArrowCursorPos(linenum);
                var offset = pos[1];
                moveOrSelectTo(linenum, offset, k.shiftKey);
            }
            else if (k.shiftKey && wordpadMode) { // Keep moving selection to start/end of document
                if (linenum < 0) {
                    linenum = 0;
                    offset = 0;
                }
                else if (linenum >= getLineCount()) {
                    var last = visualLineModel.getLastPosition();
                    linenum = last[0];
                    offset = last[1];
                }
                moveOrSelectTo(linenum, offset, k.shiftKey);
            }
        }
    };
    // FIXME: Abstract to css text module
    var getNextWordPos = function (text, linenum, offset, step) {
        //var p = visualLineModel.convertPositionFromViewToEdit(linenum, offset, true);
        var p = [linenum, offset];
        if (step > 0 && p[0] > basicModel.getLineCount()) {
            return [0, 0, false]; // invalid... cannot move further than what's available
        }
        var start = editLineModel.getExtendedOffset(p[0], p[1]);
        offset = start;
        text = text + "\n"; // Hack to handle the last word (Ctrl+Arrow) of text with a wordSeparator
        for (var i = start + step; i > 0 && i < text.length; i += step) {
            var previous = text.charAt(i - 1);
            var current = text.charAt(i);
            var startToken = (colorjack.util.isWordSeparator(previous) && !colorjack.util.isWordSeparator(current));
            if (startToken) {
                offset = i;
                break;
            }
        }
        var canMove = true;
        var lastPos = visualLineModel.getLastPosition();
        if (offset != start) { // we can move to the next word
            var pos = editLineModel.getPosition(offset);
            linenum = pos[0];
            offset = pos[1];
            canMove = (linenum < basicModel.getLineCount());
            if (!canMove) {
                pos = lastPos;
                linenum = pos[0];
                offset = pos[1];
                canMove = true;
            }
        }
        else { // Handle a bunch of special cases
            if (i <= 0) { // start of document
                linenum = 0;
                offset = 0;
            }
            //else if (i >= basicModel.getVisibleLength()) { // end of document
            else if (i >= text.length) {
                var last = visualLineModel.getLastPosition();
                linenum = last[0];
                offset = last[1];
            }
            else {
                canMove = false; // no real change
            }
        }
        return [linenum, offset, canMove];
    };
    var moveArrowHorizontal = function (arrowRight, k) {
        var pos = getCursorPos();
        var linenum = pos[0];
        var offset = pos[1];
        var step = ((arrowRight) ? 1 : -1);
        var canMove = false;
        //info("### linenum: " + linenum);
        //info("### offset: " + offset);
        //info("### canMove: " + canMove);
        var wordMovement = k.ctrlKey;
        if (wordMovement) {
            //var wordPos = getNextWordPos(basicModel.getTextContent(), linenum, offset, step);
            var wordPos = getNextWordPos(basicModel.getExtendedContent(), linenum, offset, step);
            linenum = wordPos[0];
            offset = wordPos[1];
            canMove = wordPos[2];
        }
        else { // single char movement
            var lastOffset = visualLineModel.getLastOffset(linenum);
            offset += step; // could go to different lines!
            //console.log('new offset: ' + offset);
            if (arrowRight) {
                if (offset > lastOffset) {
                    linenum++; // perhaps we cannot move: we check again later below
                    offset = 0;
                }
            }
            else if (offset < 0) {
                linenum--;
                if (linenum >= 0) {
                    offset += editLineModel.getLineLength(linenum, true); // want to count the newlines!, so that it can move to the right of the last character on the previous line. And also include the generated image in the count
                }
            }
            var withinLines = (linenum >= 0 && linenum < visualLineModel.getLineCount());
            if (withinLines) {
                lastOffset = visualLineModel.getLastOffset(linenum);
            }
            var withinLine = (0 <= offset && offset <= lastOffset);
            canMove = (withinLines && withinLine);
            //info(">>> linenum: " + linenum);
            //info(">>> offset: " + offset);
            //info(">>> canMove: " + canMove);
        }
        if (canMove) {
            moveOrSelectTo(linenum, offset, k.shiftKey);
            cursorPosition.computeVerticalArrowCursorPos(linenum, offset);
        }
    };
    return {
        'init': init,
        'moveToHome': moveToHome,
        'moveToEnd': moveToEnd,
        'movePage': movePage,
        'moveArrowVertical': moveArrowVertical,
        'moveArrowHorizontal': moveArrowHorizontal
    };
};
colorjack.keyboard.KeyNavigator = function () {
    var keyNavigator = new colorjack.keyboard.KeyNavigatorImpl();
    var cursor = null;
    var init = function (vars) {
        try {
            keyNavigator.init(vars);
            cursor = vars.cursor;
            colorjack.debug.checkNull("KeyNavigator", [cursor]);
        }
        catch (e) {
            colorjack.debug.programmerPanic("KeyNavigator. Initialization error: " + e.name + " = " + e.message);
        }
    };
    return {
        'init': init,
        'home': function (k) {
            cursor.stopBlink();
            keyNavigator.moveToHome(k);
            cursor.startBlink();
        },
        'end': function (k) {
            cursor.stopBlink();
            keyNavigator.moveToEnd(k);
            cursor.startBlink();
        },
        'pageUp': function (k) {
            cursor.stopBlink();
            keyNavigator.movePage(false, k);
            cursor.startBlink();
        },
        'pageDown': function (k) {
            cursor.stopBlink();
            keyNavigator.movePage(true, k);
            cursor.startBlink();
        },
        'arrowUp': function (k) {
            cursor.stopBlink();
            keyNavigator.moveArrowVertical(false, k);
            cursor.startBlink();
        },
        'arrowDown': function (k) {
            cursor.stopBlink();
            keyNavigator.moveArrowVertical(true, k);
            cursor.startBlink();
        },
        'arrowLeft': function (k) {
            cursor.stopBlink();
            keyNavigator.moveArrowHorizontal(false, k);
            cursor.startBlink();
        },
        'arrowRight': function (k) {
            cursor.stopBlink();
            keyNavigator.moveArrowHorizontal(true, k);
            cursor.startBlink();
        }
    };
};
