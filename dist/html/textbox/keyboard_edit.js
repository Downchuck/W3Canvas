"use strict";
colorjack.keyboard.KeyEditor = function () {
    //----------------------------------------------------------------------
    var cursor = null;
    var cursorPosition = null;
    var inputScrolling = null;
    var textModel = null;
    var visualSelection = null;
    var visualTextBox = null;
    var init = function (vars) {
        try {
            cursor = vars.cursor;
            cursorPosition = vars.cursorPosition;
            textModel = vars.textModel;
            inputScrolling = vars.inputScrolling;
            visualSelection = vars.visualSelection;
            visualTextBox = vars.visualTextBox;
            colorjack.debug.checkNull("KeyEditor", [cursor, cursorPosition, inputScrolling, textModel, visualSelection, visualTextBox]);
        }
        catch (e) {
            colorjack.debug.programmerPanic("KeyEditor. Initialization error: " + e.name + " = " + e.message);
        }
    };
    //----------------------------------------------------------------------
    var refreshBox = function () {
        cursor.stopBlink(); // restore destroyed cursor
        visualTextBox.drawBox();
    };
    // Insert one letter or replace selection if there was one
    var insertChar = function (letter) {
        if (visualSelection.doesRangeExist()) { // Delete selection
            cursor.hideCursor();
            textModel.deleteRange();
            visualSelection.clearMarkedSelection(false);
        }
        var prevOffset = textModel.getOffsetFromModel();
        textModel.insertChar(prevOffset, letter);
        refreshBox();
        textModel.setNextPosition(prevOffset + 1, (letter == '\n'));
        cursor.startBlink();
    };
    // Delete selection or delete one character
    var deleteChar = function (offset) {
        if (visualSelection.doesRangeExist()) { // Delete selection
            cursor.hideCursor();
            textModel.deleteRange();
            visualSelection.clearMarkedSelection(false);
        }
        else { // Single char deletion (without anything selected)
            //var textLen = textModel.getTextContent().length;
            var textLen = textModel.getExtendedContent().length;
            var withinRange = (0 <= offset && offset < textLen);
            if (withinRange && textLen > 0) {
                textModel.deleteChar(offset);
                refreshBox();
                textModel.setNextPosition(offset, true);
            }
        }
    };
    //----------------------------------------------------------------------------------------------
    // Insert a newline
    var enterKey = function (k) {
        if (!inputScrolling.isEnabled()) {
            insertChar("\n");
        }
    };
    // handles Shift-Insert which is paste in the Common User Access standard
    // Shift-Insert (Paste in CUA) does not appear to be handled
    var insertKey = function (k) {
        if (k.shiftKey) { // Shift+Insert: Paste
            cursor.stopBlink();
            // TODO: if there is a previous selection, delete it
            visualSelection.clearMarkedSelection();
            textModel.paste();
            visualSelection.showRange();
        }
    };
    // handles Delete (delete character) and Ctrl-Delete (delete word)
    // Shift-Delete (Cut in CUA) does not appear to be handled
    var deleteKey = function (k) {
        var offset = textModel.getOffsetFromModel();
        if (k.ctrlKey) {
            var pos = cursorPosition.getPosition();
            var r = textModel.getWordRange(pos[0], pos[1]);
            var wordFound = (r !== null);
            if (wordFound) {
                // info("Start: " + r.startContainer + "/" + r.startOffset + " up to " + pos[0] + "/" + pos[1]); /*DBG*/
                visualSelection.setStart(pos[0], pos[1]);
                visualSelection.setEnd(r.endContainer, r.endOffset);
            }
            else { // Special case: cursor at white space: just delete remaining white space (Wordpad)
                // REVIEW
                // Do nothing?
            }
        }
        deleteChar(offset);
        cursor.startBlink();
    };
    // handles Backspace and Ctrl-Backspace (backspace word)
    var backspaceKey = function (k) {
        var normal = !k.ctrlKey;
        if (normal) {
            var offset = textModel.getOffsetFromModel();
            deleteChar(offset - 1);
        }
        else {
            // Delete to the start of the word
            var pos = cursorPosition.getPosition();
            // debug("Pos: " + pos[0] + "/" + pos[1]);	/*DBG*/
            var r = textModel.getWordRange(pos[0], pos[1]);
            var wordFound = (r !== null);
            if (wordFound) {
                // info("Start: " + r.startContainer + "/" + r.startOffset + " up to " + pos[0] + "/" + pos[1]); /*DBG*/
                visualSelection.setStart(r.startContainer, r.startOffset);
                visualSelection.setEnd(pos[0], pos[1]);
                cursor.hideCursor();
                textModel.cut();
                visualSelection.clearMarkedSelection(false);
            }
            else { // Handle whitespace deletion: highly inconsistent among editors
                // Ctrl+Backspace:
                // Wordpad mode: delete white space only (if distance is = 1 or 0, delete previous word as well)
                // Special case when TAB is the deleted character: normal backspace operation
                // OpenOffice Writer: delete prev word
                // Notepad: no deletion, weird character inserted (bug?)
                // REVIEW: Implementing Wordpad mode
                // Do nothing?
            }
        }
        cursor.startBlink();
    };
    return {
        'init': init,
        'insertChar': insertChar,
        'deleteChar': deleteChar,
        'enterKey': enterKey,
        'insertKey': insertKey,
        'deleteKey': deleteKey,
        'backspaceKey': backspaceKey
    };
};
