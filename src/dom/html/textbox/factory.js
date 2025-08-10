import { Box, Range, Node, DocumentFragment, DocumentTree, BoxTree } from '../../css/line_basic.js';
import { TextBox } from './textbox_comp.js';

class GraphicsLib {
	constructor() {
		const DEBUG_GRAPHICS = false;
		let testingMode = false;

		this.createBufferImage = (x,y,w,h,image) => {
			let result = null;
			try {
				if (testingMode) {	return {}; }
				if (DEBUG_GRAPHICS && w > 4) {
					info("createBufferImage(): " + x + "," + y + " - " + w + "," + h);
				}
				const canvas = document.createElement('canvas');
				canvas.width = w;
				canvas.height = h;
				canvas.style.width = w + "px";
				canvas.style.height = h + "px";
				const context = canvas.getContext('2d');
				if (context && x >= 0 && y >= 0 && w > 0 && h > 0) {
					context.drawImage(image, x,y,w,h, 0,0,w,h);
					result = context.canvas;
				} else if (DEBUG_GRAPHICS) {
					throw new Error("createBufferImage(): Some negative value?! Probably some values are not integer!");
				}
			} catch (e225) {
				throw new Error("createBufferImage() " + e225.message);
			}
			return result;
		};

		this.restoreBufferImage = (ctx,buffer,x,y,w,h) => {
			if (testingMode) { return false; }
			let result = false;
			try {
				if (DEBUG_GRAPHICS && w > 4) {
					info("restoreBufferImage(): " + x + "," + y + " - " + w + "," + h);
				}
				if (ctx && buffer && x >= 0 && y >= 0 && w > 0 && h > 0) {
					ctx.save();
					ctx.globalCompositeOperation = "copy";
					ctx.drawImage(buffer, 0, 0, w, h, x, y, w, h);
					ctx.restore();
					result = true;
				}	else if (DEBUG_GRAPHICS) {
					throw new Error("restoreBufferImage(): Some negative value! Probably some values are not integer!");
				}
			} catch (e226) {
				throw new Error("restoreBufferImage() " + e226.message);
			}
			return result;
		};

		this.setTestingMode = (t) => { testingMode = t; };
	}
}

class Factory {
	createBox() { return new Box(); }
	createRange() { return new Range(); }
	createNode(id) { return new Node(id); }
	createDocumentFragment(c,r)	{ return new DocumentFragment(c,r); }
	createDocumentTree(c) { return new DocumentTree(c); }
	createBoxTree() { return new BoxTree(); }
}

class TextBoxFactory {
	constructor() {
		this.textBoxes = [];
		this.uniqueId = 0;
	}
	createTextBox(canvasBox, domElement) {
		const t = new TextBox(canvasBox, domElement, this.uniqueId, false);
		this.uniqueId++;
		this.textBoxes.push(t);
		return t;
	}
	getTextBox(id) {
		if (0 <= id && id < this.textBoxes.length) {
			return this.textBoxes[id];
		}
		else {
			return null;
		}
	}
}

class TextFocusManager {
	constructor(tbf) {
		this.textBoxFactory = tbf;
		this.currentTextBoxId = -1;
	}
	getCurrentTextBox() {
		return this.textBoxFactory.getTextBox(this.currentTextBoxId);
	}
	getCurrentTextBoxId() {
		return this.currentTextBoxId;
	}
	unsetCurrentTextBoxId(id) {
		this.currentTextBoxId = -1;
	}
	setFocusedTextBoxId(id) {
		if (id != this.currentTextBoxId) {
			let textbox = null;
			if (this.currentTextBoxId != -1) {
				textbox = this.getCurrentTextBox();
				textbox.blur();
			}
			this.currentTextBoxId = id;
			textbox = this.getCurrentTextBox();
			textbox.focus();
		}
	}
}

class ClipboardService {
	constructor() {
		this.clipboardText = "";
		this.styles = [];
	}
	setClipboardText(t) {
		this.clipboardText = t;
	}
	getClipboardText() {
		return this.clipboardText;
	}
	setClipboardStyles(s) {
		this.styles = s;
	}
	getClipboardStyles() {
		return this.styles;
	}
	isEmpty() {
		return (this.clipboardText === null || this.clipboardText === "");
	}
}

export const graphicsLib = new GraphicsLib();
export const clipboardService = new ClipboardService();
export const boxModelFactory = new Factory();
export const textBoxFactory = new TextBoxFactory();
export const textFocusManager = new TextFocusManager(textBoxFactory);