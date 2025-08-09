import { controlFactory } from '../html/control_factory.js';

export let automatedTest = true;

export const emptyKeyEvent = {};
export const shiftKeyEvent = {'shiftKey':true};
export const ctrlKeyEvent = {'ctrlKey':true};
export const shiftCtrlKeyEvent = {'ctrlKey':true, 'shiftKey':true};

export const eke = emptyKeyEvent;
export const ske = shiftKeyEvent;
export const cke = ctrlKeyEvent;
export const scke = shiftCtrlKeyEvent;

export let textBox = null;
export let keyboard = null;
export let keyNavig = null;
export let keyEditor = null;

export function setTextBoxAndKeyboard(t,k) {
	textBox = t;
	keyboard = k;
	keyNavig = k.keyNavigator;
	keyEditor = k.keyEditor;
}

export function getCursorPos() {
	return textBox.getCursorPos();
}

export function setCursorPos(container, offset) {
	textBox.setCursorPos(container, offset);
}

export function getSelectionRange() {
	return textBox.getSelectionRange();
}

export function setSelectionRange(startContainer, startOffset, endContainer, endOffset) {
	const range = {
		'startContainer': startContainer,
		'startOffset': startOffset,
		'endContainer': endContainer,
		'endOffset': endOffset
	};
	textBox.setSelectionRange(range);
}

export function insertChar(ch) {
	keyboard.keyEditor.insertChar(ch);
}

export function deleteChar(ch) {
	keyboard.keyEditor.deleteChar(ch);
}

export function insertKey(e) {
	keyboard.keyEditor.insertKey(e);
}

export function enterKey(e) {
	keyboard.keyEditor.enterKey(e);
}

export function deleteKey(e) {
	keyboard.keyEditor.deleteKey(e);
}

export function backspaceKey(e) {
	keyboard.keyEditor.backspaceKey(e);
}

export const drawBoxes = function() {
	const cBox = $('cBox_top');
	const textbox = controlFactory.create('InputText', 'cBox_top');

	const boxStyle = {
		'color' 		: "#555",
		'reverseMode'	: false,
		'cursorWidth'   : 2,
		'cursorColor'	: "#555",
		'showLines'		: true,
		'lineColor'		: 'blue',
		'borderColor'	: "red",
		'selectionColor': "rgba(216,216,255,0.6)"
	};

	const textContent = 'Canvas is an\textremely heavy-duty plain-woven fabric\nused for making sails, tents, marquees, backpacks, and other functions where sturdiness is required. It is also popularly used as a painting surface, typically stretched, and on fashion handbags and shoes.In   the  Wyoming.';
	const cssHack = ":nth-char(0) {font: 14px arial}";

	textbox.setStyle(boxStyle);

	textbox.setValue(textContent, cssHack);

	const kb = textbox.getKeyboard();
	setTextBoxAndKeyboard(textbox, kb);
};

export const loadAndDraw = function() {
	drawBoxes();
}
