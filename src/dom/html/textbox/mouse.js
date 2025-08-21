import * as debug from '../../lang_debug.js';
import { textFocusManager } from './factory.js';

export class Mouse {
	constructor() {
		let basicModel = null;
		let canvasBox = null;
		let cursor = null;
		let cursorPosition = null;
		let textBoxId = -1;
		let textModel = null;
		let visualSelection = null;
		let visualTextBox = null;
		let mouseDown = false;
		let leftOffset = 0;
		let topOffset = 0;
		let width = 0;
		let height = 0;

		this.init = (vars) => {
			try {
				basicModel		= vars.basicModel;
				canvasBox		= vars.canvasBox;
				cursor			= vars.cursor;
				cursorPosition	= vars.cursorPosition;
				textBoxId		= vars.textBoxId;
				textModel		= vars.textModel;
				visualSelection = vars.visualSelection;
				visualTextBox	= vars.visualTextBox;
				debug.checkNull("Mouse", [basicModel, canvasBox, cursor, cursorPosition, textBoxId, textModel, visualSelection, visualTextBox]);

                width = canvasBox.width;
                height = canvasBox.height;
                leftOffset = canvasBox.offsetLeft;
                topOffset = canvasBox.offsetTop;

                const textDomElement = vars.textDomElement;
                textDomElement.addEventListener('mousedown', this.handleMouseDown);
                textDomElement.addEventListener('mouseup', this.handleMouseUp);
                textDomElement.addEventListener('mousemove', handleMouseMove);
                textDomElement.addEventListener('dblclick', this.handleMouseDoubleClick);
			}
			catch (e) {
				debug.programmerPanic("Mouse. Initialization error: " + e.name + " = " + e.message);
			}
		};

		const getCursorFromMouse = (e) => {
			const x = e.clientX - leftOffset;
			const y = e.clientY - topOffset;
			const bm = visualTextBox.getBoxModel();
			const xOffset = bm.getLeftLength();
			const withinContentArea = (xOffset <= x && x < xOffset+bm.contentArea.width && 0 <= y && y < height);
			const withinBox = (0 <= x && x < width && 0 <= y && y < height);
			if (!withinBox) {
				debug.programmerPanic("getCursorFromMouse(): Out of the box!!!");
				visualSelection.clearMarkedSelection();
				mouseDown = false;
				return null;
			}
			else if (withinContentArea) {
				const box = visualTextBox.getBoxModel();
				const newX = x - box.getLeftLength();
				const lines = basicModel.getLines();
				for (let i = 0; i < lines.length; i++) {
					if (y <= lines[i].getBottom()) {
						return cursorPosition.getCursor(newX,i);
					}
				}
				if (basicModel.isEmptyDocument()) {
					return [0,0];
				}
				else {
					const lastLine = basicModel.getLineCount()-1;
					if (lastLine >= 0) {
						const line = lines[lastLine];
						if (y > line.y + line.height/2) {
							const endOfDocumentPos = [lastLine, line.content.length-1];
							return endOfDocumentPos;
						}
						else if (y > line.getTop()) {
							return cursorPosition.getCursor(newX, lastLine);
						}
					}
				}
				return [0,0];
			}
			else {
				return null;
			}
		};

		const setFocus = () => {
			textFocusManager.setFocusedTextBoxId(textBoxId);
		};

		this.handleMouseDown = (e) => {
			setFocus();
			const clearSel = !e.ctrlKey;
			cursor.stopBlink();
			if (clearSel) { visualSelection.clearMarkedSelection(); }
			const p = getCursorFromMouse(e);
			if (p) {
				cursorPosition.setPosition(p[0],p[1]);
				mouseDown = true;
			}
			if (clearSel) { visualSelection.clearMarkedSelection(); }
		};

		this.handleMouseUp = (e) => {
			const p = getCursorFromMouse(e);
			if (p) {
				visualSelection.setEnd(p[0],p[1]);
				cursor.startBlink();
				mouseDown = false;
				cursorPosition.computeVerticalArrowCursorPos(p[0], p[1]);
			}
		};

		const handleMouseMove = (e) => {
			if (mouseDown) {
				const p = getCursorFromMouse(e);
				if (p) {
					visualSelection.setEnd(p[0],p[1]);
					if (visualSelection.doesRangeExist()) {
						visualSelection.showRange(e.ctrlKey);
					}
				}
			}
		};

		this.handleMouseDoubleClick = (e) => {
			const p = getCursorFromMouse(e);
			if (p) {
				cursor.stopBlink();
				const range = textModel.getWordRange(p[0], p[1]);
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
	}
}
