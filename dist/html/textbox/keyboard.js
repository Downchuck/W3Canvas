"use strict";
/*
Event handling for keystrokes
Translates keystrokes to more generic actions (e.g. character input, movement key press). Those generic actions are handled elsewhere.
    1. Keyboard navigations actions are handled in keyboard_nav.js
    2. Editing actions are handled in keyboard_edit.js

This file does so by attaching both onkeydown and onkeypress via tradition event handling.

Keyboard events generate an event object with either charCode or keyCode or both.

References:
    http://www.quirksmode.org/js/keys.html
    https://developer.mozilla.org/en/DOM/event.charCode
    https://developer.mozilla.org/en/DOM/event.keyCode
*/
colorjack.keyboard.Keyboard = function () {
    //----------------------------------------------------------------------
    var keyEditor = new colorjack.keyboard.KeyEditor();
    var navig = new colorjack.keyboard.KeyNavigator();
    var cursor = null;
    var textModel = null;
    var visualSelection = null;
    var visualTextBox = null;
    var init = function (vars) {
        try {
            keyEditor.init(vars);
            navig.init(vars);
            cursor = vars.cursor;
            textModel = vars.textModel;
            visualSelection = vars.visualSelection;
            visualTextBox = vars.visualTextBox;
            colorjack.debug.checkNull("Keyboard", [cursor, textModel, visualSelection, visualTextBox, keyEditor, navig]);
            onkey(document); //onkey(vars.canvasBox); // cannot bind keystrokes against div, only against document
        }
        catch (e) {
            colorjack.debug.programmerPanic("Keyboard. Initialization error: " + e.name + " = " + e.message);
        }
    };
    //----------------------------------------------------------------------
    // Warning: hard coded key values work only against Firefox, not against Webkit
    // Need some kind of "browser" / "javascript" engine mapper:
    // webkit.keys
    // keys object
    // In the keys object, the numbers represent keyCode.
    // These functions are called during onkeydown handler.
    var keys = {
        '10': function (k) {
            keyEditor.enterKey(k);
        },
        '13': function (k) {
            keyEditor.enterKey(k);
        },
        // Commented out because it is not a preferred workaround for Quickfind
        /*'191': function(k) { // forward slash
            return false; // Stop firefox Quickfind
        },
        '222': function(k) { // apostrophe
            return false; // Stop firefox Quickfind
        },*/
        '36': function (k) {
            navig.home(k);
        },
        '35': function (k) {
            navig.end(k);
        },
        '33': function (k) {
            navig.pageUp(k);
        },
        '34': function (k) {
            navig.pageDown(k);
        },
        '37': function (k) {
            navig.arrowLeft(k);
            return false;
        },
        '38': function (k) {
            navig.arrowUp(k);
            return false;
        },
        '39': function (k) {
            navig.arrowRight(k);
            return false;
        },
        '40': function (k) {
            navig.arrowDown(k);
            return false;
        },
        '46': function (k) {
            keyEditor.deleteKey(k);
            return false;
        },
        '45': function (k) {
            keyEditor.insertKey(k);
            return false;
        }
    };
    var keydowned = false;
    var BACKSPACE = 8;
    var TAB = 9;
    /*
    //charcodes
    var CTRL_C = 99;
    var CTRL_X = 120;
    var CTRL_V = 118;
    var CTRL_Z = 122;
    */
    //keycodes (instead of charcodes)
    var CTRL_C = 67; //now we handle it in onkeypress, hence the value is different!
    var CTRL_X = 88;
    var CTRL_V = 86;
    var CTRL_Z = 90;
    // handles 'onkeypress'
    var handleKeyPress = function (e) {
        //info('handleKeyPress keydowned = ' + keydowned);
        e = window.event ? event : e;
        if (e.altKey || e.ctrlKey) {
            return; //do not handle these
        }
        if (e.keyCode == TAB) {
            keyEditor.insertChar('\t');
            e.preventDefault();
            return;
        }
        if (e.charCode) {
            var letter = String.fromCharCode(e.charCode);
            keyEditor.insertChar(letter);
            e.preventDefault();
        }
        return false;
    };
    // handles 'onkeydown'
    // onkeydown handles most of the keystrokes that normally do not generate a character
    var handleKeyDown = function (e) {
        e = window.event ? event : e;
        if (e.keyCode in keys) {
            //info('special key!');
            e.preventDefault();
            keydowned = true;
            return keys[e.keyCode](e);
        }
        else if (e.keyCode == BACKSPACE || e.charCode == 104) {
            keyEditor.backspaceKey(e);
            e.preventDefault();
        }
        else if (e.ctrlKey) { //handle control keys
            if (e.keyCode == CTRL_C) {
                e.preventDefault();
                cursor.hideCursor();
                textModel.copy();
            }
            if (e.keyCode == CTRL_X) {
                e.preventDefault();
                cursor.hideCursor();
                textModel.cut();
                visualSelection.clearMarkedSelection(false);
            }
            if (e.keyCode == CTRL_Z) {
                e.preventDefault();
                cursor.hideCursor();
                textModel.undo();
                visualSelection.showRange();
            }
            if (e.keyCode == CTRL_V) { // Paste
                e.preventDefault();
                cursor.stopBlink();
                cursor.hideCursor();
                // visualSelection.clearMarkedSelection();
                textModel.paste();
                visualSelection.showRange();
                cursor.startBlink();
            }
        }
        //return true;
    };
    // bind the respective keyboard handlers
    var onkey = function (doc) {
        doc.onkeypress = function (e) {
            //info('onkeypress');
            var comp = colorjack.textFocusManager.getCurrentTextBox();
            if (comp !== null) {
                var kb = comp.getKeyboard();
                kb.handleKeyPress(e);
                // Following line has been commented out. Normally, it should be distributed into the individual branch cases,
                // this way unhandled keystrokes (Ctrl-N) would be recognized by the browser.
                //e.preventDefault();
            }
        };
        doc.onkeydown = function (e) {
            var comp = colorjack.textFocusManager.getCurrentTextBox();
            if (comp !== null) {
                var kb = comp.getKeyboard();
                return kb.handleKeyDown(e);
            }
            // Following line has been commented out. Normally, it should be distributed into the individual branch cases,
            // this way unhandled keystrokes (Ctrl-N) would be recognized by the browser.
            //return false;
        };
    };
    return {
        'init': init,
        'handleKeyPress': handleKeyPress,
        'handleKeyDown': handleKeyDown,
        'keyEditor': keyEditor,
        'keyNavigator': navig,
        'bindKeyboard': function (doc) { onkey(doc); }
    };
};
