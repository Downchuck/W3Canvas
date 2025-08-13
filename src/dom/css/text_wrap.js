import { boxModelFactory } from './box_basic.js';
import { ContentFragment } from '../html/textbox/basic_model.js';

export class LineBox {
	boxes = [];
	x;
	y;
	width = 0;
	height;
	maxWidth;
	context;

	constructor(ctx, lineX, lineY, lineMaxWidth, lineHeight) {
		this.context = ctx;
		this.x = lineX;
		this.y = lineY;
		this.maxWidth = lineMaxWidth;
		this.height = lineHeight;
	}

	getFragmentWidth(fragment) {
		if (fragment.isImage)  {
			return fragment.width;
		} else {
			if (fragment.style!="")
				this.context.font = fragment.style;
			return this.context.measureText(fragment.content).width;
		}
	}

	getFragmentHeight(fragment) {
		if (fragment.isImage) return fragment.height;
		else return this.getTextHeight(fragment.style);
	}

	canAdd(contentFragment)	{
		return this.width + this.getFragmentWidth(contentFragment) <= this.maxWidth;
	}

	add(box) {
		box.x = this.width;
		box.y = this.y;
		box.height = this.height;
		box.width = this.getFragmentWidth(box.contentFragment);
		this.boxes.push(box);
		this.width += box.width;
	}

	getTextHeight(fontStyle) {
		const tokens = fontStyle.split(' ');
		for (let i = 0; i < tokens.length; i++) {
			const l = tokens[i].length;
			if (l > 2 && tokens[i][l-2]=='p' && tokens[i][l-1]=='x') {
				const str = tokens[i].substr(0, l-2);
				return str*1;
			}
		}
		return 10;
	}

	getContent() {
		let str = '';
		for (let i = 0; i < this.boxes.length; i++) {
			str+=this.boxes[i].contentFragment.content;
		}
		return str;
	}

	getTop() { return this.y; }
	getLeft() { return this.x; }
	getBottom() { return this.y + this.height; }
	getHeight() { return this.height; }
	getWidth() { return this.width; }
	getMaxWidth() { return this.maxWidth; }

	advance() {
		let maxHeight = 0;
		for (let i = 0; i < this.boxes.length; i++) {
			const h = this.getFragmentHeight(this.boxes[i].contentFragment);
			if (h > maxHeight) maxHeight = h;
		}
		this.height = maxHeight;
		for (let i = 0; i < this.boxes.length; i++)
			this.boxes[i].height = this.height;
		return	this.y + this.height;
	}

	getBoxes() {
		return this.boxes;
	}

    align(textAlign) {
        const remainingSpace = this.maxWidth - this.width;
        if (remainingSpace > 0) {
            if (textAlign === 'right') {
                for (const box of this.boxes) {
                    box.x += remainingSpace;
                }
            } else if (textAlign === 'center') {
                for (const box of this.boxes) {
                    box.x += remainingSpace / 2;
                }
            }
        }
    }
}

export class LineWrapper {

	getNextWhiteSpaceIdx(str, from) {
		for (let i = from; i < str.length; i++) {
			const ch = str.charCodeAt(i);
			if (ch == 9 || ch == 10 || ch == 13 || ch == 32) {
				return i;
			}
		}
		return -1;
	}

	createLineBoxes(fragments, ctx, lineHeight, lineMaxWidth, frameHeight, offsetX, offsetY, nobr) {
		const context = ctx;
		const lines = [];
		let linebox = new LineBox(ctx, offsetX, offsetY, lineMaxWidth, lineHeight);
		lines.push(linebox);
		const saveFont = ctx.font;
		const getWidth = (str) => context.measureText(str).width;
		let linePos = offsetY;

		for (let i = 0; i < fragments.length; i++) {
			if (linebox.canAdd(fragments[i])) {
				const box = boxModelFactory.createBox();
				box.contentFragment = fragments[i];
				linebox.add(box);
			} else {
				if (fragments[i].isImage) {
					linePos = linebox.advance();
					linebox = new LineBox(ctx, offsetX, linePos, lineMaxWidth, lineHeight);
					const box = boxModelFactory.createBox();
					box.contentFragment = fragments[i];
					linebox.add(box);
					lines.push(linebox);
				} else {
					if (fragments[i].style!="")
						ctx.font = fragments[i].style;
					else ctx.font = saveFont;

					const text = fragments[i].content;
					const spaceLen = getWidth(' ');
					const tabLen = getWidth('\t');
					let nextLineStartOffset = 0;
					let wordStart = 0;
					let sp = 0;

					while (wordStart < text.length) {
						sp = this.getNextWhiteSpaceIdx(text, wordStart);
						if (sp < 0) sp = text.length;

						const line = text.substring(nextLineStartOffset, wordStart);
						const word = text.substring(wordStart, sp);
						const linelen = getWidth(line);
						const wordlen = getWidth(word);
						let whitelen = 0;

						if (sp < text.length - 1) {
							const whiteChar = text.substring(sp, sp+1);
							whitelen = ((whiteChar == '\t')? tabLen : spaceLen);
						}

						if (linebox.getWidth() + linelen + wordlen + whitelen >= lineMaxWidth) {
							const newFragment = new ContentFragment(line, fragments[i].style);
							const box = boxModelFactory.createBox();
							box.contentFragment = newFragment;
							linebox.add(box);
							linePos = linebox.advance();
							linebox = new LineBox(ctx, offsetX, linePos, lineMaxWidth, lineHeight);
							lines.push(linebox);
							nextLineStartOffset = wordStart;
						}
						wordStart = sp + 1;
					}
					if (nextLineStartOffset < text.length) {
						const line = text.substr(nextLineStartOffset);
						const newFragment = new ContentFragment(line, fragments[i].style);
						const box = boxModelFactory.createBox();
						box.contentFragment = newFragment;
						linebox.add(box);
					}
				}
			}
			if (fragments[i].hasLinefeed()) {
				linePos = linebox.advance();
				linebox = new LineBox(ctx, offsetX, linePos, lineMaxWidth, lineHeight);
				lines.push(linebox);
			}
		}
		linebox.advance();
		ctx.font = saveFont;
		return lines;
	}
}
