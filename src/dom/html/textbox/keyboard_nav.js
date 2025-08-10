import * as debug from '../../lang_debug.js';
import { isWordSeparator } from '../../lang_util.js';

class KeyNavigatorImpl {
	constructor() {
		let basicModel = null;
		let cursor = null;
		let cursorPosition = null;
		let	editLineModel = null;
		let textModel = null;
		let visualSelection = null;
		let	visualLineModel = null;
		const pageSize = 5;
		const wordpadMode = true;

		this.init = (vars) => {
			try {
				basicModel		= vars.basicModel;
				cursor			= vars.cursor;
				cursorPosition	= vars.cursorPosition;
				textModel		= vars.textModel;
				editLineModel	= textModel.getEditLineModel();
				visualLineModel = textModel.getVisualLineModel();
				visualSelection = vars.visualSelection;
				debug.checkNull("KeyNavigatorImpl", [basicModel, cursor, cursorPosition, editLineModel, textModel, visualLineModel, visualSelection]);
			}
			catch (e) {
				debug.programmerPanic("KeyNavigatorImpl. Initialization error: " + e.name + " = " + e.message);
			}
		};

		const getCursorPos = () => {
			return cursorPosition.getPosition();
		};

		const moveOrSelectTo = (container, offset, selectionMode) => {
			const safeContainer = Math.max(0, Math.min(basicModel.getLineCount() - 1, container));
			const safeOffset = Math.min( visualLineModel.getLastOffset(safeContainer), offset );
			if (safeContainer != container) {
				debug.programmerPanic("Out of range: container: " + container + ", safe: " + safeContainer);
			}
			if (safeOffset != offset) {
				debug.programmerPanic("Out of range: offset: " + offset + ", safe: " + safeOffset);
			}
			if (selectionMode) {
				cursor.stopBlink();
				visualSelection.clearMarkedSelection();
				visualSelection.setEnd(safeContainer, safeOffset);
				cursorPosition.moveToVisiblePosition(safeContainer, safeOffset);
				visualSelection.showRange();
				cursor.startBlink();
			}
			else {
				cursorPosition.setPosition(safeContainer, safeOffset);
				visualSelection.clearMarkedSelection();
			}
		};

		this.moveToHome = (k) => {
			let linenum;
			let offset;
			if (k.ctrlKey) {
				linenum = 0;
				offset = 0;
			}
			else {
				linenum = getCursorPos()[0];
				offset = 0;
			}
			moveOrSelectTo(linenum, offset, k.shiftKey);
			cursorPosition.computeVerticalArrowCursorPos(linenum, offset);
		};

		this.moveToEnd = (k) => {
			let linenum;
			let offset;
			if (k.ctrlKey) {
				const last = visualLineModel.getLastPosition();
				linenum = last[0];
				offset = last[1];
			}
			else {
				linenum = getCursorPos()[0];
				offset = visualLineModel.getLastOffset(linenum);
			}
			moveOrSelectTo(linenum, offset, k.shiftKey);
			cursorPosition.computeVerticalArrowCursorPos(linenum, offset);
		};

		const getLineCount = () => {
			return basicModel.getLineCount();
		};

		this.movePage = (pageDown, k) => {
			let canMove;
			let linenum;
			const line = getCursorPos()[0];
			if (pageDown) {
				canMove = (line + pageSize < getLineCount());
				linenum = line + pageSize;
			}
			else {
				canMove = (line >= pageSize);
				linenum = line - pageSize;
			}
			if (canMove) {
				const charTarget = getCursorPos()[1];
				const offset = Math.min(charTarget, visualLineModel.getLastOffset(linenum));
				moveOrSelectTo(linenum, offset, k.shiftKey);
			}
		};

		this.moveArrowVertical = (arrowDown, k) => {
			const normal = true;
			if (normal) {
				let pos = getCursorPos();
				let linenum = pos[0] + ((arrowDown)? 1:-1);
				const canMove = (0 <= linenum && linenum < getLineCount());
				if (canMove) {
					pos = cursorPosition.getVerticalArrowCursorPos(linenum);
					const offset = pos[1];
					moveOrSelectTo(linenum, offset, k.shiftKey);
				}
				else if (k.shiftKey && wordpadMode) {
					let offset;
					if (linenum < 0) {
						linenum = 0;
						offset = 0;
					}
					else if (linenum >= getLineCount()) {
						const last = visualLineModel.getLastPosition();
						linenum = last[0];
						offset = last[1];
					}
					moveOrSelectTo(linenum, offset, k.shiftKey);
				}
			}
		};

		const getNextWordPos = (text, linenum, offset, step) => {
			const p = [linenum, offset];
			if (step > 0 && p[0] > basicModel.getLineCount()) {
				return [0,0,false];
			}
			const start = editLineModel.getExtendedOffset(p[0], p[1]);
			offset = start;
			text = text + "\n";
			let i;
			for (i = start+step; i > 0 && i < text.length; i+=step) {
				const previous = text.charAt(i-1);
				const current = text.charAt(i);
				const startToken = (isWordSeparator(previous) && !isWordSeparator(current));
				if (startToken) {
					offset = i;
					break;
				}
			}
			let canMove = true;
			const lastPos = visualLineModel.getLastPosition();
			if (offset != start) {
				let pos = editLineModel.getPosition(offset);
				linenum = pos[0];
				offset = pos[1];
				canMove =  (linenum < basicModel.getLineCount());
				if (!canMove) {
					pos = lastPos;
					linenum = pos[0];
					offset = pos[1];
					canMove = true;
				}
			}
			else {
				if (i <= 0) {
					linenum = 0;
					offset = 0;
				}
				else if (i>=text.length) {
					const last = visualLineModel.getLastPosition();
					linenum = last[0];
					offset = last[1];
				}
				else {
					canMove = false;
				}
			}
			return [linenum, offset, canMove];
		};

		this.moveArrowHorizontal = (arrowRight, k) => {
			let pos = getCursorPos();
			let linenum = pos[0];
			let offset = pos[1];
			const step = ((arrowRight)?1:-1);
			let canMove = false;
			const wordMovement = k.ctrlKey;
			if (wordMovement) {
				const wordPos = getNextWordPos(basicModel.getExtendedContent(), linenum, offset, step);
				linenum = wordPos[0];
				offset = wordPos[1];
				canMove = wordPos[2];
			}
			else {
				let lastOffset = visualLineModel.getLastOffset(linenum);
				offset += step;
				if (arrowRight) {
					if (offset > lastOffset) {
						linenum++;
						offset = 0;
					}
				}
				else if (offset < 0) {
					linenum--;
					if (linenum >= 0) {
						offset += editLineModel.getLineLength(linenum, true);
					}
				}
				const withinLines = (linenum >= 0 && linenum < visualLineModel.getLineCount());
				if (withinLines) {
					lastOffset = visualLineModel.getLastOffset(linenum);
				}
				const withinLine = (0 <= offset && offset <= lastOffset);
				canMove = (withinLines && withinLine);
			}
			if (canMove) {
				moveOrSelectTo(linenum, offset, k.shiftKey);
				cursorPosition.computeVerticalArrowCursorPos(linenum, offset);
			}
		};
	}
}

export class KeyNavigator {
	constructor() {
		const keyNavigator = new KeyNavigatorImpl();
		let cursor = null;

		this.init = (vars) => {
			try {
				keyNavigator.init(vars);
				cursor = vars.cursor;
				debug.checkNull("KeyNavigator", [cursor]);
			}
			catch (e) {
				debug.programmerPanic("KeyNavigator. Initialization error: " + e.name + " = " + e.message);
			}
		};

		this.home = (k) => {
			cursor.stopBlink();
			keyNavigator.moveToHome(k);
			cursor.startBlink();
		};
		this.end = (k) => {
			cursor.stopBlink();
			keyNavigator.moveToEnd(k);
			cursor.startBlink();
		};
		this.pageUp = (k) => {
			cursor.stopBlink();
			keyNavigator.movePage(false, k);
			cursor.startBlink();
		};
		this.pageDown = (k) => {
			cursor.stopBlink();
			keyNavigator.movePage(true, k);
			cursor.startBlink();
		};
		this.arrowUp = (k) => {
			cursor.stopBlink();
			keyNavigator.moveArrowVertical(false, k);
			cursor.startBlink();
		};
		this.arrowDown = (k) => {
			cursor.stopBlink();
			keyNavigator.moveArrowVertical(true, k);
			cursor.startBlink();
		};
		this.arrowLeft = (k) => {
			cursor.stopBlink();
			keyNavigator.moveArrowHorizontal(false, k);
			cursor.startBlink();
		};
		this.arrowRight = (k) => {
			cursor.stopBlink();
			keyNavigator.moveArrowHorizontal(true, k);
			cursor.startBlink();
		};
	}
}
