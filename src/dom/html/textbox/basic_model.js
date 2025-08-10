import * as debug from '../../../lang_debug.js';

var info;

export class ContentFragment {
	content: any;
	style: any;
	isImage: boolean;
	url: any;
	width: any;
	height: any;

	constructor(content, fontStyle, imgUrl?, width?, height?) {
		this.content = content;
		this.style = fontStyle;

		if (imgUrl!=null && imgUrl.length > 0) {
			this.content = ' ';
			this.isImage = true;
			this.url = imgUrl;
			this.width = width;
			this.height = height;
		}
	}

	hasLinefeed() {
		if (this.content!=null && this.content!='') {
			return this.content[this.content.length-1] == '\n';
		}
		else return false;
	}

	getCharsCount() {
		return this.content.length;
	}
}

export class FragmentStyles {
	index: any;
	exOffset = 0;
	pseudo: any;
	fontStyle = "";
	width = 0;
	height = 0;
	isImage = false;
	url = "";
	css: any;
	content: any;

	constructor(ind, pseudoElem, css) {
		this.index = ind;
		this.pseudo = pseudoElem;
		this.css = css;

		const styles = css.split(';');
		for (let i = 0; i < styles.length; i++) {
			const style = styles[i];
			let matched = false;
			let groups = /^\s*content:(.*)$/.exec(style);
			if (groups) {
				matched = true;
				this.content = groups[1];
				groups = /^\s*url\('(.*)'\)/.exec(this.content);
				if (groups) {
					this.isImage = true;
					this.url = groups[1];
				}
			}
			if (!matched) {
				groups = /^\s*font:\s*(.*)$/.exec(style);
				if (groups) {
					matched = true;
					this.fontStyle = groups[1];
				}
			}
			if (!matched) {
				groups = /^\s*width:\s*(.*)$/.exec(style);
				if (groups) {
					this.width = parseInt(groups[1]);
					matched = true;
				}
			}
			if (!matched) {
				groups = /^\s*height:\s*(.*)$/.exec(style);
				if (groups) {
					this.height = parseInt(groups[1]);
					matched = true;
				}
			}
		}
	}

	isInsertBefore() {
		return this.pseudo.substring(0, 7) == ":before";
	}

	isInsertAfter() {
		return this.pseudo.substring(0, 6) == ":after";
	}

	isGeneratedContent() {
		return this.isInsertBefore() || this.isInsertAfter();
	}

	getCss() {
		let css =  ':nth-char(' + this.index + ')' + this.pseudo + '{';
		if (this.content!="") {
			css+='content:' + this.content +';';
		}
		if (this.fontStyle!="") {
			css+='font:' + this.fontStyle +';';
		}
		css+='}';
		return css;
	}
}

export class BasicModel {
	lines = [];
	textDomElement = null;
	emptyDocLines = null;
	cssHack = null;
	styles = [];
	exContent = '';
	defaultFontStyle = '12px arial';

	getDefaultCssStyle() {
		return 'font:' + this.defaultFontStyle;
	}

	init(vars) {
		this.textDomElement = vars.textDomElement;
	}

	getContent() {
		return this.textDomElement.getValue();
	}

	setContent(c) {
		this.textDomElement.setValue(c);
	}

	setCssHack(css) {
		this.cssHack = css;
		this.parseCss(css);
	}

	getCssHack() {
		return this.cssHack;
	}

	getLines() { return this.lines; }
	setLines(s) {
		this.lines = s;
		this.exContent = '';
		for (let i = 0; i < this.lines.length; i++) this.exContent+=this.lines[i].getContent();
	}

	getExtendedContent() { return this.exContent; }

	getLineCount() {
		return this.lines.length;
	}

	getLine(container) {
		if (container < 0 || container >= this.getLineCount()) {
			debug.programmerPanic(
				'Perhaps not a big deal.... getLine(): invalid line beyond current size: '
				+ container + "/" + this.getLineCount()
			);
			return null;
		}
		return this.lines[container];
	}

	parseCss(css) {
		if(info) info('parse css: ' + css);
		this.styles = [];
		let groups = [];
		const reg = /:nth-char\(\s*(\d*)\s*\)([^\{]*)\{([^}]*)}/g;
		while (groups) {
			groups = reg.exec(this.cssHack);
			if (groups) {
				const ind = parseInt(groups[1], 10);
				this.styles.push(new FragmentStyles(ind, groups[2], groups[3]));
			}
		}
	}

	splitHardLines(fragments) {
		const res = [];
		for (let i = 0; i < fragments.length; i++) {
			const hardlines = fragments[i].content.split('\n');
			if (hardlines.length == 1) {
				res.push(fragments[i]);
			} else {
				for (let j = 0; j < hardlines.length; j++) {
					const line = hardlines[j] + (j < hardlines.length -1? "\n" : "");
					const newFragment = new ContentFragment( line, fragments[i].style);
					res.push(newFragment);
				}
			}
		}
		return res;
	}

	getContentFragments()	{
		const fragments = [];
		const content = this.getContent();
		let exOffset = 0;

		if (this.styles.length == 0) {
			fragments.push(new ContentFragment(content, this.defaultFontStyle));
		} else {
			if (this.styles[0].index > 0) {
				let nextInd = this.styles[0].index;
				if (this.styles[0].isInsertAfter()) nextInd++;
				const frag = new ContentFragment(content.substring(0, nextInd), this.defaultFontStyle);
				fragments.push(frag);
				exOffset+=frag.getCharsCount();
			}

			for (let i = 0; i < this.styles.length; i++) {
				this.styles[i].exOffset = exOffset;
				if (this.styles[i].isGeneratedContent()) {
					const text = this.styles[i].content;
					let fontStyle = this.styles[i].fontStyle;
					if (fontStyle=="") {
						let j = i-1;
						while (j >= 0 && this.styles[j].isGeneratedContent()) j--;
						if (j>=0) fontStyle = this.styles[j].fontStyle;
						else fontStyle = this.defaultFontStyle;
					}
					const frag = new ContentFragment(text, fontStyle, this.styles[i].url, this.styles[i].width, this.styles[i].height);
					fragments.push( frag);
					exOffset+=frag.getCharsCount();
				}

				let nextInd;
				if (i + 1 < this.styles.length) {
					nextInd = this.styles[i+1].index;
					if (this.styles[i+1].isInsertAfter()) {
						nextInd++;
					}
				} else {
					nextInd = content.length;
				}

				const text = content.substring(this.styles[i].isInsertAfter()? this.styles[i].index + 1: this.styles[i].index, nextInd);
				let fontStyle = this.styles[i].fontStyle;
				if (this.styles[i].isGeneratedContent()) {
					let j = i-1;
					while (j >= 0 && this.styles[j].isGeneratedContent()) j--;
					if (j>=0) fontStyle = this.styles[j].fontStyle;
					else fontStyle = this.defaultFontStyle;
				}
				const frag = new ContentFragment(text, fontStyle);
				fragments.push( frag);
				exOffset+=frag.getCharsCount();
			}
		}
		return this.splitHardLines(fragments);
	}

	isEmptyDocument() {
		return (this.getContent().length === 0);
	}

	setEmptyDocLines(d) {
		this.emptyDocLines = d;
	}

	getLastLine() {
		return this.isEmptyDocument()? null: this.getLine(this.getLineCount()-1);
	}

	hasHardBreak(container) {
		const getLastCharInLine = (container) => {
			const line = this.getLine(container);
			const str = line.getContent();
			const ch = (str.length === 0)? null : str.substr(str.length-1);
			return ch;
		};
		const ch = getLastCharInLine(container);
		return (ch == '\n');
	}

	insertChar(exOffset, letter) {
		for (let i = 0; i < this.styles.length; i++) {
			if (this.styles[i].exOffset >= exOffset) this.styles[i].index++;
		}
		const offset = this.getOriginalOffset(exOffset);
		const text = this.getContent();
		const result = text.substring(0, offset) + letter + text.substring(offset);
		this.setContent(result);
	}

	getStyles() {
		return this.styles;
	}

	displayStyles() {
		for (let i = 0; i < this.styles.length; i++) {
			info('style[' + i + '] = ' + this.styles[i].index + ' isImage? ' + this.styles[i].isImage);
		}
	}

	removeStyle(ind) {
		const s = [];
		for (let i = 0; i < this.styles.length; i++)
			if (i!=ind) s.push(this.styles[i]);
		this.styles = s;
	}

	deleteChar(exOffset) {
		for (let i = 0; i < this.styles.length; i++) {
			if (this.styles[i].exOffset > exOffset) {
				this.styles[i].index--;
			} else if (this.styles[i].exOffset == exOffset && this.styles[i].isImage) {
				this.removeStyle(i);
				return;
			}
		}
		const offset = this.getOriginalOffset(exOffset);
		const text = this.getContent();
		const result = text.substring(0, offset) + text.substring(offset+1);
		this.setContent(result);
	}

	insertContent(exOffset, content, s) {
		const text = this.getContent();
		const offset = this.getOriginalOffset(exOffset);
		const result = text.substring(0, offset) + content + text.substring(offset);
		this.setContent(result);

		const newStyles = [];
		for (let i = 0; i < this.styles.length; i++) {
			if (this.styles[i].exOffset < exOffset) {
				newStyles.push(this.styles[i]);
				let nextInd;
				if (i < this.styles.length - 1) nextInd = this.styles[i+1].exOffset;
				else nextInd = result.length;

				if (nextInd >= offset) {
					for (let j = 0; j < s.length; j++) {
						newStyles.push(new FragmentStyles(s[j].index + offset, s[j].pseudo, s[j].css));
					}
					if (nextInd > offset)
						newStyles.push(new FragmentStyles(offset + content.length, this.styles[i].pseudo, this.styles[i].css));
				}
			} else {
				this.styles[i].index+=content.length;
				newStyles.push(this.styles[i]);
			}
		}
		this.styles = newStyles;
	}

	deleteContent(exStart, exEnd) {
		const start = this.getOriginalOffset(exStart);
		const end = this.getOriginalOffset(exEnd);
		const text = this.getContent();
		const result = text.substring(0, start) + text.substring(end);
		this.setContent(result);

		const newStyles = [];
		for (let i = 0; i < this.styles.length; i++) {
			if (this.styles[i].index < start) {
				newStyles.push(this.styles[i]);
			} else if (this.styles[i].index < end) {
				let nextInd;
				if (i < this.styles.length - 1) nextInd = this.styles[i+1].index;
				else nextInd = text.length;
				if (nextInd > end) {
					newStyles.push(new FragmentStyles(start, this.styles[i].pseudo, this.styles[i].css));
				}
			} else {
				this.styles[i].index-=(end-start);
				newStyles.push(this.styles[i]);
			}
		}
		this.styles = newStyles;
	}

	copyText(exStart, exEnd) {
		const start = this.getOriginalOffset(exStart);
		const end = this.getOriginalOffset(exEnd);
		return this.getContent().substring(start, end);
	}

	copyStyles(exStart, exEnd) {
		const s = [];
		const start = this.getOriginalOffset(exStart);
		for (let i = 0; i < this.styles.length; i++) {
			if (s.length == 0) {
				if (this.styles[i].exOffset > exStart)
					if (i > 0)
						s.push(new FragmentStyles(0, this.styles[i-1].pseudo, this.styles[i-1].css));
					else
						s.push(new FragmentStyles(0, "", this.getDefaultCssStyle()));
			}
			if (this.styles[i].exOffset >=exStart && this.styles[i].exOffset < exEnd) {
				s.push(new FragmentStyles(this.styles[i].index - start, this.styles[i].pseudo, this.styles[i].css));
			}
		}
		return s;
	}

	getOriginalOffset(exOffset) {
		let offset = exOffset;
		for (let i = 0; i < this.styles.length; i++) {
			if (this.styles[i].exOffset >= exOffset) break;
			else if (this.styles[i].isGeneratedContent()) {
				offset--;
			}
		}
		return offset;
	}
}

export class EditLineModel {
	basicModel: BasicModel;

	init(vars) {
		try {
			this.basicModel = vars.basicModel;
			debug.checkNull("EditLineModel", [this.basicModel]);
		}
		catch (e) {
			debug.programmerPanic("EditLineModel. Initialization error: " + e.name + " = " + e.message);
		}
	}

	getLine(c) { return this.basicModel.getLine(c); }

	getLineLength(container) {
		if (container === undefined) { debug.programmerPanic("getLineLength(): Need container!"); }
		let len = 0;
		const line = this.getLine(container);
		if (line) {
			len = line.getContent().length;
		}
		return len;
	}

	getExtendedOffset(container, offset) {
		let idx = 0;
		if (!this.basicModel.isEmptyDocument()) {
			if ((container < 0 || container >= this.basicModel.getLineCount()) ||
				(offset < 0 || offset > this.getLineLength(container))) {
				debug.programmerPanic("getTextOffset(): invalid pos: " + container + "/" + offset);
			}
			let sum = 0;
			for (let i = 0; i < container; i++) {
				sum += this.getLineLength(i);
			}
			idx = sum+ offset;
		}
		return idx;
	}

	getPosition(exOffset) {
		let pos = [0,0];
		if (!this.basicModel.isEmptyDocument()) {
			const text = this.basicModel.getExtendedContent();
			if (exOffset > text.length) {
				debug.programmerPanic("EditLineModel.getPosition(): We are way off! " + exOffset);
			} else {
				if (exOffset == text.length) {
					const li = this.basicModel.getLineCount()-1;
					const off = this.getLineLength(li);
					return [li, off];
				}
				let offset = exOffset;
				let container = 0;
				let len = 0;
				for (let i = 0; i < this.basicModel.getLineCount(); i++) {
					len = this.getLineLength(i);
					if (offset < len) {
						container = i;
						break;
					}
					offset -= len;
					container++;
				}
				if (offset < 0) {
					debug.programmerPanic("EditLineModel.getPosition(): We are way off! " + exOffset);
				}
				pos = [container,offset];
			}
		}
		return pos;
	}
}

export class VisualLineModel {
	basicModel: BasicModel;

	init(vars) {
		try {
			this.basicModel = vars.basicModel;
			debug.checkNull("VisualLineModel", [this.basicModel]);
		}
		catch (e) {
			debug.programmerPanic("VisualLineModel. Initialization error: " + e.name + " = " + e.message);
		}
	}

	getLine(c) { return this.basicModel.getLine(c); }

	getLineLength(container) {
		if (container === undefined) { debug.programmerPanic("getLineLength(): Need container!"); }
		let len = 0;
		const line = this.getLine(container);
		if (line) {
			len = line.getContent().length;
			if (this.basicModel.hasHardBreak(container)) {
				len--;
			}
		}
		return len;
	}

	getLastOffset(container) {
		const len = this.getLineLength(container);
		return (len===0)?0:len;
	}

	getLastPosition() {
		let last = [0,0];
		if (!this.basicModel.isEmptyDocument()) {
			const lastLine = this.basicModel.getLineCount()-1;
			const ch = this.getLastOffset(lastLine);
			last = [lastLine, ch];
		}
		return last;
	}
}
