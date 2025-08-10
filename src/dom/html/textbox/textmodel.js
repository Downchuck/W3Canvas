import { CopyPasteUndo } from './textmodel_copypaste.js';
import { EditLineModel, VisualLineModel } from './basic_model.js';
import * as debug from '../../lang_debug.js';
import { isWordSeparator } from '../../lang_util.js';
import { boxModelFactory } from './factory.js';

export class TextModel {
	constructor() {
		const copyPasteUndo = new CopyPasteUndo();
		const editLineModel = new EditLineModel();
		const visualLineModel = new VisualLineModel();
		let cursorPosition = null;
		let visualSelection = null;
		let visualTextBox = null;
		let basicModel = null;

		this.init = (vars) => {
			try {
				copyPasteUndo.init(vars);
				editLineModel.init(vars);
				visualLineModel.init(vars);
				basicModel = vars.basicModel;
				cursorPosition = vars.cursorPosition;
				visualSelection = vars.visualSelection;
				visualTextBox = vars.visualTextBox;
				debug.checkNull("TextModel", [basicModel, copyPasteUndo, cursorPosition, visualSelection, visualTextBox]);
			}
			catch (e) {
				debug.programmerPanic("TextModel. Initialization error: " + e.name + " = " + e.message);
			}
		};

		this.setTextContent = (t) => { basicModel.setTextContent(t); };
		this.setCssHack = (css) => { basicModel.setCssHack(css); };
		this.getTextContent = () => { return basicModel.getTextContent(); };
		this.getExtendedContent = () => { return basicModel.getExtendedContent(); };

		this.getWordRange = (container, offset) => {
			let result = null;
			if (container === -1) { return result; }
			const line = basicModel.getLine(container).getContent();
			if (!isWordSeparator(line.charAt(offset))) {
				let start = 0;
				for (let i = offset; i > 0; i--) {
					if (isWordSeparator(line.charAt(i))) { start = i + 1; break; }
				}
				let end = line.length;
				for (let u = offset; u < line.length; u++) {
					if (isWordSeparator(line.charAt(u))) { end = u; break;	}
				}
				const range = boxModelFactory.createRange();
				range.setStart(container, start);
				range.setEnd(container, end);
				result = range;
			}
			return result;
		};

		this.getOffsetFromModel = (container, offset) => {
			if (container === undefined) {
				const pos = cursorPosition.getPosition();
				container = pos[0];
				offset = pos[1];
			}
			const exOffset = editLineModel.getExtendedOffset(container, offset);
			return exOffset;
		};

		this.setNextPosition = (editOffset, wrap) => {
			let nextPos = editLineModel.getPosition(editOffset);
			const pastEndOfDoc = (nextPos[0] >= basicModel.getLineCount());
			if (pastEndOfDoc) {
				nextPos = visualLineModel.getLastPosition();
			}
			else {
				const canKeepInsertingOnSameLine = (!wrap && nextPos[1] === 0 && nextPos[0] > 0);
				if (canKeepInsertingOnSameLine) {
					nextPos[0]--;
					nextPos[1] = visualLineModel.getLastOffset(nextPos[0]);
				}
			}
			const linenum = nextPos[0];
			const offset = nextPos[1];
			cursorPosition.setPosition(linenum,offset);
		};

		this.copy = () => {
			if (visualSelection.doesRangeExist())
			{
				const range = visualSelection.getSelection();
				copyPasteUndo.copyRange(range);
			}
		};

		this.paste = () => {
			if (copyPasteUndo.clipboardHasSomething())
			{
				if (visualSelection.doesRangeExist()) {
					this.deleteRange();
					visualSelection.clearMarkedSelection(false);
					visualSelection.showRange();
				}
				const range = visualSelection.getSelection();
				visualSelection.clearMarkedSelection();
				copyPasteUndo.pasteFromClipboard(visualSelection.getLeft()[0], visualSelection.getLeft()[1]);
			}
		};

		this.cut = () => {
			if (visualSelection.doesRangeExist())
			{
				const range = visualSelection.getSelection();
				const editpos = this.getOffsetFromModel(visualSelection.getLeft()[0], visualSelection.getLeft()[1]);
				copyPasteUndo.deleteRange(range, true);
				this.setNextPosition(editpos, true);
			}
		};

		this.undo = () => {
			copyPasteUndo.restoreDocumentText();
		};

		this.deleteRange = () => {
			if (visualSelection.doesRangeExist())
			{
				const range = visualSelection.getSelection();
				const editpos = this.getOffsetFromModel(visualSelection.getLeft()[0], visualSelection.getLeft()[1]);
				copyPasteUndo.deleteRange(range);
				this.setNextPosition(editpos, true);
			}
		};

		this.insertChar = (offset, letter) => {
			basicModel.insertChar(offset, letter);
		};

		this.deleteChar = (offset) => {
			basicModel.deleteChar(offset);
		};

		this.showLines = () => {
			info("+++++++++++++++++++++++++++++++++++++++++++++++++");
			const lines = basicModel.getLines();
			for (let i = 0; i < lines.length; i++) {
				const content = lines[i].content;
				const showLine = content.replace(/\n/g, "\\n").replace(/\t/g, "\\t");
				info(showLine);
			}
			info("+++++++++++++++++++++++++++++++++++++++++++++++++");
			let pos = visualSelection.getStart();
			info("Pos Start: " + pos[0] + "," + pos[1]);
			pos = visualSelection.getEnd();
			info("Pos End: " + pos[0] + "," + pos[1]);
			pos = cursorPosition.getPosition();
			info("Pos Cursor: " + pos[0] + "," + pos[1]);
			info("Full Text: " + basicModel.getTextContent());
			info("Clipboard: " + basicModel.getTextContent());
			info("+++++++++++++++++++++++++++++++++++++++++++++++++");
		};

		this.getEditLineModel = () => editLineModel;
		this.getVisualLineModel = () => visualLineModel;
	}
}
