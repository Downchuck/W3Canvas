"use strict";
automatedTest = true;
var emptyKeyEvent = {};
var shiftKeyEvent = { 'shiftKey': true };
var ctrlKeyEvent = { 'ctrlKey': true };
var shiftCtrlKeyEvent = { 'ctrlKey': true, 'shiftKey': true };
// Shortcuts
var eke = emptyKeyEvent;
var ske = shiftKeyEvent;
var cke = ctrlKeyEvent;
var scke = shiftCtrlKeyEvent;
// Global variables used for testing
var textBox = null;
var keyboard = null;
var keyNavig = null;
var keyEditor = null;
function setTextBoxAndKeyboard(t, k) {
    //alert("setTextBox" + debuginfo(t));
    textBox = t;
    keyboard = k;
    keyNavig = k.keyNavigator;
    keyEditor = k.keyEditor;
    /*
        // All the functions are of the form function(key_event)

        KeyEditor:
            'insertChar'
            'deleteChar'
            'enterKey'
            'insertKey'
            'deleteKey'
            'backspaceKey'

        KeyNavigator:
            'home'
            'end'
            'pageUp'
            'pageDown'
            'arrowUp'
            'arrowDown'
            'arrowLeft'
            'arrowRight'
    */
}
// Need to define: linear Text, vs numline Text, vs Other (CSS/DOM) container, offset
// Right now, most important is: (container, offset) pair
function getCursorPos() {
    return textBox.getCursorPos();
}
function setCursorPos(container, offset) {
    textBox.setCursorPos(container, offset);
}
function getSelectionRange() {
    return textBox.getSelectionRange();
}
function setSelectionRange(startContainer, startOffset, endContainer, endOffset) {
    var range = {
        'startContainer': startContainer,
        'startOffset': startOffset,
        'endContainer': endContainer,
        'endOffset': endOffset
    };
    textBox.setSelectionRange(range);
}
function insertChar(ch) {
    keyboard.keyEditor.insertChar(ch);
}
function deleteChar(ch) {
    keyboard.keyEditor.deleteChar(ch);
}
function insertKey(e) {
    keyboard.keyEditor.insertKey(e);
}
function enterKey(e) {
    keyboard.keyEditor.enterKey(e);
}
function deleteKey(e) {
    keyboard.keyEditor.deleteKey(e);
}
function backspaceKey(e) {
    keyboard.keyEditor.backspaceKey(e);
}
var drawBoxes = function () {
    var cBox = $('cBox_top');
    var textbox = colorjack.controlFactory.create('InputText', 'cBox_top');
    var boxStyle = {
        'color': "#555",
        'reverseMode': false,
        'cursorWidth': 2,
        'cursorColor': "#555",
        'showLines': true,
        'lineColor': 'blue',
        'borderColor': "red",
        'selectionColor': "rgba(216,216,255,0.6)"
    };
    var textContent = 'Canvas is an\textremely heavy-duty plain-woven fabric\nused for making sails, tents, marquees, backpacks, and other functions where sturdiness is required. It is also popularly used as a painting surface, typically stretched, and on fashion handbags and shoes.In   the  Wyoming.';
    //var cssHack = ":nth-char(0):before {content: url('test.jpg'); width:100px; height:75px; } :nth-char(0) {font: 14px arial} :nth-char(13){font: bold 24px arial} :nth-char(22){font: italic 20px arial} :nth-char(104):before{content: url('canvas.jpg'); width:160px; height:120px} :nth-char(108) {font: 14px sans-serif} :nth-char(130){font: 32px arial} :nth-char(153){font: 22px sans}"
    var cssHack = ":nth-char(0) {font: 14px arial}";
    textbox.setStyle(boxStyle);
    textbox.setValue(textContent, cssHack);
    var kb = textbox.getKeyboard();
    setTextBoxAndKeyboard(textbox, kb);
};
var loadAndDraw = function () {
    drawBoxes();
};
