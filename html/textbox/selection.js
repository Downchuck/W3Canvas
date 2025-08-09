import * as debug from '../../lang_debug.js';
import { boxModelFactory, graphicsLib } from './factory.js';

export class VisualSelection {
	constructor() {
		let basicModel		= null;
		let context			= null;
		let cursor			= null;
		let cursorPosition	= null;
		let inputScrolling	= null;
		let textModel		= null;
		let visualTextBox	= null;
		let testingMode		= false;
		let visualLineModel = null;
		let box				= null;
		const range = boxModelFactory.createRange();
		const selectedRegions = [];

		this.init = (vars) => {
			try {
				basicModel		= vars.basicModel;
				context			= vars.context;
				cursor			= vars.cursor;
				cursorPosition	= vars.cursorPosition;
				inputScrolling	= vars.inputScrolling;
				textModel		= vars.textModel;
				visualTextBox	= vars.visualTextBox;
				visualLineModel =  textModel.getVisualLineModel();
				box = visualTextBox.getBox();
				debug.checkNull("VisualSelection", [basicModel, context, cursor, cursorPosition, inputScrolling, textModel, visualTextBox]);
			}
			catch (e) {
				debug.programmerPanic("VisualSelection. Initialization error: " + e.name + " = " + e.message);
			}
		};

		const getContext = () => context;

		this.setStart = (i,x) => {
			if (i < 0 || i >= basicModel.getLines().length) {
				debug.programmerPanic("Invalid cursor pos: " + i);
			}
			range.setStart(i,x);
		};

		this.setEnd = (i,x) => {
			range.setEnd(i,x);
		};

		this.getStart = () => {
			return [range.startContainer, range.startOffset];
		};

		this.getEnd = () => {
			return [range.endContainer, range.endOffset];
		};

		this.getLeft = () => {
			if (range.endContainer > range.startContainer || (range.endContainer == range.startContainer && range.endOffset > range.startOffset))
				return this.getStart();
			else 		return this.getEnd();
		};

		this.displayRange = () => {
			const r = range;
			info("[" + r.startContainer + "," + r.startOffset + "," + r.endContainer + "," + r.endOffset + "]");
		};

		this.doesRangeExist = () => {
			const r = range;
			return !(r.startContainer == r.endContainer && r.startOffset == r.endOffset);
		};

		const copyRange = (x, i, xx, ii) => {
			const r = boxModelFactory.createRange();
			r.setStart(x, i);
			r.setEnd(xx, ii);
			return r;
		};

		this.getSelection = () => {
			const r = range;
			return  copyRange(r.startContainer, r.startOffset,
								r.endContainer, r.endOffset);
		};

		const getSortedSelection = () => {
			const s = this.getSelection();
			let diff = (s.endContainer - s.startContainer);
			if (diff === 0) {
				diff = s.endOffset - s.startOffset;
			}
			const sorted = (diff >= 0) ? s :
				copyRange(s.endContainer, s.endOffset,
							s.startContainer, s.startOffset);
			return sorted;
		};

		const	markSelection = (x, y, width, height) => {
			const ctx = getContext();
			const bm = visualTextBox.getBoxModel();
			const left = bm.getLeftLength();
			if (!testingMode) {
				const maxWidth = bm.contentArea.width;
				const startX   = bm.getLeftLength();
				const offset = inputScrolling.getOffset();
				if (inputScrolling.isEnabled()) {
					const sel = getSortedSelection();
					const startOffset = sel.startOffset;
					const endOffset = sel.endOffset;
					const fullStr = basicModel.getContent();
					const startLen = visualTextBox.getWidth(fullStr.substring(0, startOffset)) + offset;
					if (startLen < 0) {
						const lostWidth = 0 - startLen;
						width = width - lostWidth;
					}
				}
				x = Math.max(startX, Math.round(x));
				y = Math.round(y);
				width = Math.min(maxWidth, Math.round(width));
				height = Math.round(height);
				const buffer = graphicsLib.createBufferImage(x, y, width, height, ctx.canvas);
				if (buffer) {
					selectedRegions.push([buffer, x, y, width, height]);
					ctx.fillRect(x, y, width, height);
				}
			}
		};

		this.clearMarkedSelection = (restore) => {
			while (selectedRegions.length > 0) {
				const r = selectedRegions.pop();
				const dontIgnoreRestore = (restore === undefined || restore);
				if (dontIgnoreRestore) {
					const ctx = getContext();
					const image = r[0];
					const x = r[1];
					const y = r[2];
					const w = r[3];
					const h = r[4];
					if (!graphicsLib.restoreBufferImage(ctx, image, x, y, w, h)) {
						alert("Couldn't restoreBufferImage");
					}
				}
			}
		};

		this.showRange = () => {
			const selectionColor = visualTextBox.getBoxStyle().selectionColor;
			cursor.hideCursor();
			this.clearMarkedSelection();
			if (!this.doesRangeExist()) { return; }
			const rng = getSortedSelection();
			const i = rng.startContainer;
			const x = rng.startOffset;
			const ii = rng.endContainer;
			const xx = rng.endOffset;
			const markSelected = (li, off1, off2) => {
				const line = basicModel.getLines()[li];
				if (off2 == null)
					off2 = visualLineModel.getLineLength(li);
				const box1 = cursorPosition.getCursorXY(li, off1);
				const box2 = cursorPosition.getCursorXY(li, off2);
				const w = box2[0] - box1[0];
				markSelection(box1[0], line.getTop(), w, line.getHeight());
			}
			const ctx = getContext();
			ctx.save(); ctx.fillStyle= selectionColor;
			ctx.globalCompositeOperation = "xor";
			const sameLine = (i == ii);
			if (sameLine && x != xx) {
				markSelected(i, x, xx);
			}
			else if (!sameLine && i < ii) {
				markSelected(i, x);
				for (let j = i+1; j < ii; j++) {
					markSelected(j, 0);
				}
				markSelected(ii, 0, xx);
			}
			ctx.restore();
			cursor.showCursor();
		};

		this.selectAll = () => {
			const last = textModel.getLastCursorPos();
			this.setStart(0, 0);
			this.setEnd(last[0], last[1]);
			this.showRange();
		};

		this.setTestingMode = (t) => { testingMode = t; };
	}
}
