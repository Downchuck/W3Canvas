"use strict";
colorjack.textbox.mouse.Mouse = function () {
    //----------------------------------------------------------------------
    var basicModel = null;
    var canvasBox = null;
    var cursor = null;
    var cursorPosition = null;
    var textBoxId = -1;
    var textModel = null;
    var visualSelection = null;
    var visualTextBox = null;
    var init = function (vars) {
        try {
            basicModel = vars.basicModel;
            canvasBox = vars.canvasBox;
            cursor = vars.cursor;
            cursorPosition = vars.cursorPosition;
            textBoxId = vars.textBoxId;
            textModel = vars.textModel;
            visualSelection = vars.visualSelection;
            visualTextBox = vars.visualTextBox;
            colorjack.debug.checkNull("Mouse", [basicModel, canvasBox, cursor, cursorPosition, textBoxId, textModel, visualSelection, visualTextBox]);
            onmouse(canvasBox);
        }
        catch (e) {
            colorjack.debug.programmerPanic("Mouse. Initialization error: " + e.name + " = " + e.message);
        }
    };
    //----------------------------------------------------------------------
    var mouseDown = false;
    var leftOffset = 0;
    var topOffset = 0;
    // width, height: These were fixed... but it should come from VisualTextBox!!!
    var width = 0;
    var height = 0;
    var getCursorFromMouse = function (e) {
        var x = e.clientX - leftOffset;
        var y = e.clientY + window.pageYOffset - topOffset;
        // Reset
        var bm = visualTextBox.getBoxModel(); // Reset width, height to the visualTextBox.boxModel
        //		width = bm.getTotalWidth();
        //		height = bm.getTotalHeight();
        var xOffset = bm.getLeftLength();
        var withinContentArea = (xOffset <= x && x < xOffset + bm.contentArea.width && 0 <= y && y < height);
        // REVIEW: not working: out of canvas box: reset selection (or at least detect the mouse down)
        var withinBox = (0 <= x && x < width && 0 <= y && y < height);
        if (!withinBox) {
            colorjack.debug.programmerPanic("getCursorFromMouse(): Out of the box!!!");
            visualSelection.clearMarkedSelection();
            divBox.mousemove = false;
            mouseDown = false;
            return null;
        }
        else if (withinContentArea) {
            var box = visualTextBox.getBoxModel();
            x = x - box.getLeftLength(); // x is fine
            var lines = basicModel.getLines();
            //for (var i in lines) {
            for (var i = 0; i < lines.length; i++) {
                if (y <= lines[i].getBottom()) {
                    return cursorPosition.getCursor(x, i);
                }
            }
            // Special case at the bottom of the text
            if (basicModel.isEmptyDocument()) {
                return [0, 0];
            }
            else {
                var lastLine = basicModel.getLineCount() - 1;
                if (lastLine >= 0) {
                    var line = lines[lastLine];
                    if (y > line.y + line.height / 2) {
                        var endOfDocumentPos = [lastLine, line.content.length - 1];
                        return endOfDocumentPos;
                    }
                    else if (y > line.getTop()) {
                        return cursorPosition.getCursor(x, lastLine);
                    }
                }
            }
            return [0, 0];
        }
        else {
            // DO NOTHING FOR NOW
            // TODO: mouseMove -> We could scroll depending on the side of the border + direction of the mouse
            return null;
        }
    };
    var setFocus = function () {
        var textFocusManager = colorjack.textFocusManager;
        textFocusManager.setFocusedTextBoxId(textBoxId);
    };
    var handleMouseDown = function (e) {
        setFocus(); // This textbox wants to get the attention!
        var clearSel = !e.ctrlKey;
        cursor.stopBlink();
        if (clearSel) {
            visualSelection.clearMarkedSelection();
        }
        var p = getCursorFromMouse(e);
        if (p) {
            cursorPosition.setPosition(p[0], p[1]);
            mouseDown = true;
        }
        if (clearSel) {
            visualSelection.clearMarkedSelection();
        }
    };
    var handleMouseUp = function (e) {
        var p = getCursorFromMouse(e);
        if (p) {
            visualSelection.setEnd(p[0], p[1]);
            cursor.startBlink();
            mouseDown = false;
            cursorPosition.computeVerticalArrowCursorPos(p[0], p[1]);
        }
    };
    var handleMouseMove = function (e) {
        if (mouseDown) {
            var p = getCursorFromMouse(e);
            if (p) {
                visualSelection.setEnd(p[0], p[1]);
                if (visualSelection.doesRangeExist()) {
                    visualSelection.showRange(e.ctrlKey);
                }
            }
        }
        else {
            divBox.onmousemove = null;
        }
    };
    var handleMouseDoubleClick = function (e) {
        var p = getCursorFromMouse(e); // [line, char_off]
        if (p) {
            cursor.stopBlink();
            //info("Mouse Pos: " + p[0] + "/" + p[1]);
            var range = textModel.getWordRange(p[0], p[1]);
            if (range !== null) {
                visualSelection.setStart(range.startContainer, range.startOffset);
                visualSelection.setEnd(range.endContainer, range.endOffset);
                visualSelection.showRange();
            }
            if (!visualSelection.doesRangeExist()) {
                cursor.startBlink();
            }
        }
    };
    var onmouse = function (box) {
        width = box.width;
        height = box.height;
        leftOffset = box.offsetLeft;
        topOffset = box.offsetTop;
        box.onmousedown = function (e) {
            handleMouseDown(e);
            box.onmousemove = function (e) {
                if (mouseDown) {
                    handleMouseMove(e);
                }
            };
        };
        box.onmouseup = function (e) {
            handleMouseUp(e);
            box.onmousemove = null;
        };
        box.ondblclick = function (e) {
            handleMouseDoubleClick(e);
            e.preventDefault();
        };
    };
    return {
        'init': init,
        'handleMouseDown': handleMouseDown,
        'handleMouseUp': handleMouseUp,
        'handleMouseDoubleClick': handleMouseDoubleClick
        //'handleMouseMove' : handleMouseMove	 // for automated tests, we are not going to do mouseMoves, it's hard to see.
    };
};
