import { BoxModel } from './box_model.js';
import { BoxModelPainter } from './box_paint.js';
import { boxModelFactory } from './box_basic.js';
import * as debug from '../lang_debug.js';

import { LineWrapper } from './text_wrap.js';

export class BoxStyle {
	color = "rgb(200,0,0)";
	reverseMode = false;
	showLines = true;
	lineColor = 'rgba(10,10,120,1)';
	cursorWidth = 4;
	cursorColor = '#555';
	borderColor = "black";
	selectionColor = "rgba(20,40,200,.7)";
}

export class DrawingBoxDebugging {
	showSingleLineBorder = true;
	singleLineBorderColor = 'rgb(0,200,0)';
}

export class VisualTextBox {
	debugging = new DrawingBoxDebugging();
	initialized = false;
	baseLineExtraSpacing = 5;
	basicModel = null;
	box = null;
	boxStyle = new BoxStyle();
	canvasBox = null;
	context = null;
	boxModel = null;
	originalBoxModel = null;
	inputScrolling = null;
	testingMode = false;
	textBoxId = -1;
	images = [];

	getLineHeight() {
		const ctx  = this.getContext();
		const fontHeight = this.getFontHeight(ctx);
		return this.baseLineExtraSpacing + fontHeight;
	}

	getFontHeight(ctx) {
		const tokens = ctx.font.split(' ');
		for (let i = 0; i < tokens.length; i++) {
			const l = tokens[i].length;
			if (l > 2 && tokens[i][l-2]=='p' && tokens[i][l-1]=='x') {
				const str = tokens[i].substr(0, l-2);
				return str*1;
			}
		}
		debug.programmerPanic("VisualTextBox. Cannot find font height!");
	}

	adjustBoxModel(boxModel, canvasBox) {
		const adjusted = new BoxModel();
		adjusted.copyRectFrom(boxModel);
		let w, h;
		if (boxModel.contentArea.width > 0 && boxModel.contentArea.height > 0) {
			w = boxModel.contentArea.width;
			h = boxModel.contentArea.height;
		} else {
			w = canvasBox.width - boxModel.getLeftLength() - boxModel.getRightLength();
			h = canvasBox.height - boxModel.getTopLength() - boxModel.getBottomLength();
		}
		adjusted.setSize(w, h);
		const lineHeight = this.getLineHeight();
		let numLines = 0;
		if (this.inputScrolling.isEnabled()) {
			numLines = 1;
		} else {
			numLines = Math.floor( h / lineHeight );
		}
		let totalLinesHeight = numLines * lineHeight;
		totalLinesHeight += lineHeight;
		const diff = h - totalLinesHeight;
		adjusted.contentArea.height -= diff;
		const balanceToTheMargin = true;
		if (balanceToTheMargin) {
			adjusted.margin.bottom += diff;
		} else {
			adjusted.padding.bottom += diff;
		}
		return adjusted;
	}

	resetBox() {
		this.boxModel = this.adjustBoxModel(this.originalBoxModel, this.canvasBox);
		this.box = boxModelFactory.createBox();
		const offset = this.boxModel.getOffset();
		this.box.x = offset.x;
		this.box.y = offset.y + this.getFontHeight(this.context);
		this.box.width = this.boxModel.contentArea.width - this.box.x - 1;
		this.box.height = this.boxModel.contentArea.height;
		this.box.writingMode = 'lr-tb';
	}

	setFont(f) {
		this.context.font = f;
	}

	init(vars) {
		try {
			if (!this.initialized) {
				this.initialized = true;
				this.basicModel = vars.basicModel;
				this.canvasBox = vars.canvasBox;
				this.context = vars.context;
				this.boxModel = vars.textDomElement;
				this.inputScrolling = vars.inputScrolling;
				this.textBoxId = vars.textBoxId;
				this.originalBoxModel = vars.textDomElement;
				this.resetBox();
				debug.checkNull("VisualTextBox", [this.basicModel, this.box, this.canvasBox, this.context, this.textBoxId]);
			}
		}
		catch (e541) {
			debug.programmerPanic("VisualTextBox. Initialization error: " + e541.name + " = " + e541.message);
		}
		return this.boxModel;
	}

	getContext() { return this.context; }

	drawLine(linebox, boxStyle) {
		const ctx = this.getContext();
		const saveFont = ctx.font;
		ctx.save();
		ctx.save();
		ctx.translate(linebox.getLeft(), linebox.getTop());
		ctx.clearRect(0,0,linebox.getMaxWidth(),linebox.getHeight());

		if (boxStyle.reverseMode) {
			ctx.fillStyle  = boxStyle.color;
			ctx.fillRect(0,0,linebox.getMaxWidth(),linebox.getHeight());
		}

		if (boxStyle.showLines) {
			ctx.strokeStyle = boxStyle.lineColor;
			ctx.strokeRect(0,0,linebox.getMaxWidth(),linebox.getHeight());
		}

		if (this.debugging.showSingleLineBorder) {
			ctx.strokeStyle = this.debugging.singleLineBorderColor;
		}

		ctx.restore();

		for (let i = 0; i < linebox.getBoxes().length; i++) {
			ctx.save();
			const box = linebox.getBoxes()[i];

			if (box.contentFragment.isImage) {
				if (this.images[box.contentFragment.url]== null) {
					const img = new Image();
					img.box = box;
					img.url = box.contentFragment.url;
					img.onload = () => {
						this.images[img.url] = img;
						ctx.drawImage(img, img.box.x, img.box.y, img.box.width, img.box.height);
					}
					img.src = box.contentFragment.url;
				} else {
					ctx.drawImage(this.images[box.contentFragment.url], box.x, box.y, box.width, box.height);
				}
			} else {
				ctx.textBaseline="bottom";
				ctx.translate(box.x, box.y + box.height);
				ctx.fillStyle = boxStyle.color;

				if (box.contentFragment.style!="")
					ctx.font = box.contentFragment.style;

				ctx.fillText(box.contentFragment.content, 0, 0);
				ctx.restore();
			}
		}
		ctx.restore();
		ctx.font = saveFont;
	}

	drawBox() {
		if (!this.initialized) {
			debug.programmerPanic("need to call TextBox.init() first");
			return;
		}
		const outerBox = this.box;
		const textContent = this.basicModel.getTextContent();
		const fragments = this.basicModel.getContentFragments();
		let lineMaxWidth = outerBox.width;
		const frameHeight = outerBox.height;
		let offset = { 'x' : 0,	'y' : 0	};

		if (this.boxModel) {
			lineMaxWidth = this.boxModel.contentArea.width;
			offset.x = this.boxModel.getLeftLength();
			offset.y = this.boxModel.getTopLength();
		}

		const wrapper = new LineWrapper();
		const lineBoxes = wrapper.createLineBoxes(fragments, this.context, this.getLineHeight(), lineMaxWidth, frameHeight, this.baseLineExtraSpacing, offset);

		this.basicModel.setLines(lineBoxes);

		if (!this.testingMode) {
			const ctx = this.getContext();
			ctx.save();

			if (this.boxModel) {
				const style = {
					'getBackgroundColor' : () => null,
					'getBorderColor'     : () => this.boxStyle.borderColor,
					'getFont'            : () => this.context.font
				};
				const painter	= new BoxModelPainter();
				painter.paintBox(ctx, this.boxModel, style);

				const top  = this.boxModel.getTopLength();
				const left = this.boxModel.getLeftLength();
				const w = this.boxModel.contentArea.width;
				const h = this.boxModel.contentArea.height;
				ctx.beginPath();
				ctx.rect(left, top, w, h);
				ctx.clip();
				ctx.clearRect(left, top, w, h);
			}

			for (let i = 0; i < lineBoxes.length; i++) {
				this.drawLine(lineBoxes[i], this.boxStyle);
			}
			ctx.restore();
		}
	}

    setTestingMode(v) { this.testingMode = v; }
    getId() { return this.textBoxId; }
    getBox() { return this.box; }
    getBoxModel() { return this.boxModel; }
    setBoxModel(b) { this.boxModel = b; }
    resetBox() { this.resetBox(); }
    drawBox() { this.drawBox(); }
    setBoxStyle(s) { this.boxStyle = s; }
    getBoxStyle() { return this.boxStyle; }
    setFont(f) { this.setFont(f); }
    getFont() { return this.context.font; }
}
