import * as debug from '../../lang_debug.js';

export class KeyEditor {
	constructor() {
		let cursor = null;
		let cursorPosition = null;
		let inputScrolling = null;
		let textModel = null;
		let visualSelection = null;
		let visualTextBox = null;

		this.init = (vars) => {
			try {
				cursor = vars.cursor;
				cursorPosition = vars.cursorPosition;
				textModel = vars.textModel;
				inputScrolling = vars.inputScrolling;
				visualSelection = vars.visualSelection;
				visualTextBox = vars.visualTextBox;
				debug.checkNull("KeyEditor", [cursor, cursorPosition, inputScrolling, textModel, visualSelection, visualTextBox]);
			}
			catch (e) {
				debug.programmerPanic("KeyEditor. Initialization error: " + e.name + " = " + e.message);
			}
		};

		const refreshBox = () => {
			cursor.stopBlink();
			visualTextBox.drawBox();
		};

		this.insertChar = (letter) => {
			if (visualSelection.doesRangeExist()) {
				cursor.hideCursor();
				textModel.deleteRange();
				visualSelection.clearMarkedSelection(false);
			}
			const prevOffset = textModel.getOffsetFromModel();
			textModel.insertChar(prevOffset, letter);
			refreshBox();
			textModel.setNextPosition(prevOffset + 1, (letter == '\n'));
			cursor.startBlink();
		};

		const deleteChar = (offset) => {
			if (visualSelection.doesRangeExist()) {
				cursor.hideCursor();
				textModel.deleteRange();
				visualSelection.clearMarkedSelection(false);
			}
			else {
				const textLen = textModel.getExtendedContent().length;
				const withinRange = (0 <= offset && offset < textLen);
				if (withinRange && textLen > 0) {
					textModel.deleteChar(offset);
					refreshBox();
					textModel.setNextPosition(offset, true);
				}
			}
		};

		this.enterKey = (k) => {
			if (!inputScrolling.isEnabled()) {
				this.insertChar("\n");
			}
		};

		this.insertKey = (k) => {
			if (k.shiftKey) {
				cursor.stopBlink();
				visualSelection.clearMarkedSelection();
				textModel.paste();
				visualSelection.showRange();
			}
		};

		this.deleteKey = (k) => {
			const offset = textModel.getOffsetFromModel();
			if (k.ctrlKey) {
				const pos = cursorPosition.getPosition();
				const r = textModel.getWordRange(pos[0], pos[1]);
				if (r !== null) {
					visualSelection.setStart(pos[0], pos[1]);
					visualSelection.setEnd(r.endContainer, r.endOffset);
				}
			}
			deleteChar(offset);
			cursor.startBlink();
		};

		this.backspaceKey = (k) => {
			const normal = !k.ctrlKey;
			if (normal) {
				const offset = textModel.getOffsetFromModel();
				deleteChar(offset-1);
			}
			else {
				const pos = cursorPosition.getPosition();
				const r = textModel.getWordRange(pos[0], pos[1]);
				if (r !== null) {
					visualSelection.setStart(r.startContainer, r.startOffset);
					visualSelection.setEnd(pos[0], pos[1]);
					cursor.hideCursor();
					textModel.cut();
					visualSelection.clearMarkedSelection(false);
				}
			}
			cursor.startBlink();
		};
	}
}
