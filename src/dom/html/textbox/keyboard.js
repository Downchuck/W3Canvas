import { KeyEditor } from './keyboard_edit.js';
import { KeyNavigator } from './keyboard_nav.js';
import * as debug from '../../lang_debug.js';
import { textFocusManager } from './factory.js';

export class Keyboard {
	constructor() {
		const keyEditor = new KeyEditor();
		const navig = new KeyNavigator();
		let cursor = null;
		let textModel = null;
		let visualSelection = null;
		let visualTextBox = null;

		this.init = (vars) => {
			try {
				keyEditor.init(vars);
				navig.init(vars);
				cursor = vars.cursor;
				textModel = vars.textModel;
				visualSelection = vars.visualSelection;
				visualTextBox = vars.visualTextBox;
				debug.checkNull("Keyboard", [cursor, textModel, visualSelection, visualTextBox, keyEditor, navig]);

                const textDomElement = vars.textDomElement;
                textDomElement.addEventListener('keydown', this.handleKeyDown);
                textDomElement.addEventListener('keypress', this.handleKeyPress);
			}
			catch (e) {
				debug.programmerPanic("Keyboard. Initialization error: " + e.name + " = " + e.message);
			}
		};

		const keys = {
			'10': (k) => { keyEditor.enterKey(k); },
			'13': (k) => { keyEditor.enterKey(k); },
			'36': (k) => { navig.home(k); },
			'35': (k) => { navig.end(k); },
			'33': (k) => { navig.pageUp(k); },
			'34': (k) => { navig.pageDown(k); },
			'37': (k) => { navig.arrowLeft(k); return false; },
			'38': (k) => { navig.arrowUp(k); return false; },
			'39': (k) => { navig.arrowRight(k); return false; },
			'40': (k) => { navig.arrowDown(k); return false; },
			'46': (k) => { keyEditor.deleteKey(k); return false; },
			'45': (k) => { keyEditor.insertKey(k); return false; }
		};

		const BACKSPACE = 8;
		const TAB = 9;
		const CTRL_C = 67;
		const CTRL_X = 88;
		const CTRL_V = 86;
		const CTRL_Z = 90;

		this.handleKeyPress = (e) => {
			if (e.altKey || e.ctrlKey) {
				return;
			}
			if (e.keyCode == TAB) {
				keyEditor.insertChar('\t');
				e.preventDefault();
				return;
			}
			if (e.charCode) {
				const letter = String.fromCharCode(e.charCode);
				keyEditor.insertChar(letter);
				e.preventDefault();
			}
			return false;
		};

		this.handleKeyDown = (e) => {
			if (e.keyCode in keys) {
				e.preventDefault();
				return keys[e.keyCode](e);
			}
			else if (e.keyCode == BACKSPACE || e.charCode == 104) {
				keyEditor.backspaceKey(e);
				e.preventDefault();
			}
			else if (e.ctrlKey) {
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
				if (e.keyCode == CTRL_V) {
					e.preventDefault();
					cursor.stopBlink();
					cursor.hideCursor();
					textModel.paste();
					visualSelection.showRange();
					cursor.startBlink();
				}
			}
		};

		this.keyEditor = keyEditor;
		this.keyNavigator = navig;
	}
}
