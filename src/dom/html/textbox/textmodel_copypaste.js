import * as debug from '../../lang_debug.js';
import { boxModelFactory, clipboardService } from './factory.js';

export class CopyPasteUndo {
	constructor() {
		let basicModel = null;
		let textModel = null;
		let visualSelection = null;
		let visualTextBox = null;
		let undoDocumentFragment = null;

		this.init = (vars) => {
			try {
				basicModel = vars.basicModel;
				textModel = vars.textModel;
				visualSelection = vars.visualSelection;
				visualTextBox = vars.visualTextBox;
				debug.checkNull("CopyPasteUndo", [basicModel, textModel, visualSelection, visualTextBox]);
			}
			catch (e) {
				debug.programmerPanic("CopyPasteUndo. Initialization error: " + e.name + " = " + e.message);
			}
		};

		const saveDocumentText = () => {
			const doc = boxModelFactory.createDocumentFragment();
			doc.content = basicModel.getTextContent();
			doc.cssHack = basicModel.getCssHack();
			doc.range = visualSelection.getSelection();
			undoDocumentFragment = doc;
		};

		this.restoreDocumentText = () => {
			if (undoDocumentFragment) {
				const doc = undoDocumentFragment;
				basicModel.setTextContent(doc.content);
				basicModel.setCssHack(doc.cssHack);
				visualTextBox.drawBox();
				const r = doc.range;
				visualSelection.setStart(r.startContainer, r.startOffset);
				visualSelection.setEnd(r.endContainer, r.endOffset);
				undoDocumentFragment = null;
			}
		};

		const getCharOffset = (container, offset) => {
			return textModel.getOffsetFromModel(container, offset);
		};

		const setClipboardText = (t) => {
			clipboardService.setClipboardText(t);
		};

		const setClipboardStyles = (s) => {
			clipboardService.setClipboardStyles(s);
		}

		const getClipboardText = () => {
			return clipboardService.getClipboardText();
		};

		const getClipboardStyles = () => {
			return clipboardService.getClipboardStyles();
		}

		const clipboardHasSomething = () => {
			return !clipboardService.isEmpty();
		};

		this.copyRange = (range) => {
			let start = getCharOffset(range.startContainer, range.startOffset);
			let end = getCharOffset(range.endContainer, range.endOffset);
			const backwardSelection = (end < start);
			if (backwardSelection) { let tmp = start; start = end; end = tmp; }
			const t = basicModel.copyText(start, end);
			const s = basicModel.copyStyles(start, end);
			setClipboardText(t);
			setClipboardStyles(s);
			return [start, end, backwardSelection];
		};

		this.deleteRange = (range, copyToClipboard) => {
			let result = [0,0];
			if (range !== null && range !== undefined) {
				saveDocumentText();
				let start, end, backward;
				if (copyToClipboard) {
					const offsets = this.copyRange(range);
					start = offsets[0];
					end = offsets[1];
					backward = offsets[2];
				}
				else {
					start = getCharOffset(range.startContainer, range.startOffset);
					end = getCharOffset(range.endContainer, range.endOffset);
					backward = (end < start);
					if (backward) { let tmp = start; start = end; end = tmp; }
				}
				if (start != end) {
					basicModel.deleteContent(start, end);
					visualTextBox.drawBox();
				}
				result = (backward)?
					[range.endContainer, range.endOffset] : [range.startContainer, range.startOffset];
			}
			return result;
		};

		this.pasteFromClipboard = (container, offset) => {
			if (clipboardHasSomething()) {
				saveDocumentText();
				const c = getClipboardText();
				const s = getClipboardStyles();
				const pos = getCharOffset(container, offset);
				basicModel.insertContent(pos, c, s);
				visualTextBox.drawBox();
				const nextCursorPos = pos + c.length;
				const editLineModel = textModel.getEditLineModel();
				const start = editLineModel.getPosition(pos);
				const end = editLineModel.getPosition(nextCursorPos);
				const visualLineModel = textModel.getVisualLineModel();
				const lastPos = visualLineModel.getLastPosition();
				const startOutOfRange = (start[0] > lastPos[0]) ||
					(start[0] === lastPos[0] && start[1] > lastPos[1]);
				const endOutOfRange = (end[0] > lastPos[0]) ||
					(end[0] === lastPos[0] && end[1] > lastPos[1]);
				if (startOutOfRange || endOutOfRange) {
					visualSelection.setStart(lastPos[0], lastPos[1]);
					visualSelection.setEnd(lastPos[0], lastPos[1]);
				}
				else {
					visualSelection.setStart(end[0], end[1]);
					visualSelection.setEnd(end[0], end[1]);
				}
			}
		};
	}
}
