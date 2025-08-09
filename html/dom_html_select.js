import { registerElement, HTMLElement, HTMLCollection } from './dom_html_basic.js';
import { mixin } from '../../lang_util.js';
import { Viewport } from '../../css/viewport.js';
import { BoxModelPainter } from '../../css/box_paint.js';

registerElement("SELECT", "HTMLSelectElement", function(element) {
	const SelectElement = function() {
		this.disabled	= false;
		this.multiple	= false;
		this.name		= "";
		this.size		= 5;
		this.tabIndex	= -1;
		this.inFocus		= false;

		this.add = (node, before) => {
			if (!before) {
				element.appendChild(node);
			}
			else {
				throw new ReferenceError("HTMLSelectElement.add() : insertBefore() is not implemented!");
			}
		};
		this.blur = () => { this.inFocus = false; };
		this.focus = () => { this.inFocus = true; };
		this.getDisabled = () => this.disabled;
		this.getLength = () => this.getOptions().length;
		this.getMultiple = () => this.multiple;
		this.getName = () => this.name;
		this.getOptions = () => {
			const first = element.getFirstChild();
			const iterator = new HTMLCollection(first);
			return iterator;
		};
		this.getSelectedIndex = () => {
			let selectedIndex = -1;
			const options = this.getOptions();
			for (let i = 0; i < options.length; i++) {
				const option = options.item(i);
				if (option.getSelected && option.getSelected()) {
					selectedIndex = i;
					break;
				}
			}
			return selectedIndex;
		};
		this.getSize = () => this.size;
		this.getTabIndex = () => this.tabIndex;
		this.getType = () => (this.multiple)? "select-multiple" : "select-one";
		this.getValue = () => {
			let value = "";
			const selected = this.getSelectedIndex();
			if (selected > -1) {
				const options = this.getOptions();
				const option = options.item(selected);
				value = option.getValue();
			}
			return value;
		};
		this.remove = (i) => {
			throw new ReferenceError("HTMLSelectElement.remove(): not implemented.");
		};
		this.setMultiple = (m) => { this.multiple = m; };
		this.setName = (n) => { this.name = n; };
		this.setSelectedIndex = (si) => {
			const options = this.getOptions();
			if (!this.multiple) {
				for (let j = 0; j < options.length; j++) {
					options.item(j).setSelected(false);
				}
			}
			if (si >= 0 && si < this.getLength()) {
				const option = options.item(si);
				option.setSelected(true);
			}
		};
		this.setSize = (s) => { this.size = s; };
		this.setTabIndex = (t) => { this.tabIndex = t; };
		this.setValue = (v) => {
			throw new ReferenceError("HTMLSelectElement.setValue(): Not implemented");
		};
	};

	const base = new HTMLElement(element);
	const selectElement = mixin(base, new SelectElement());

	const SelectDisplay = function() {
		let defaultSelectPainter = null;
		let selectPainter = null;
		const viewport = new Viewport();

		viewport.needsVerticalScrollbar = () => {
			return selectElement.getLength() > selectElement.getSize();
		};

		this.setSelectPainter = (p) => {
			selectPainter = p;
			if (p.paintOption) {
				let option = element.getFirstChild();
				while (option) {
					option.setOptionPainter(p);
					option = option.getNextSibling();
				}
			}
		};

		this.getSelectPainter = () => selectPainter;

		this.display = (ctx) => {
			const computeFirstAndLast = (first) => {
				let option = first;
				if (option) {
					option.first = true;
					while (option) {
						if (!option.getNextSibling()) {
							option.last = true;
						}
						option = option.getNextSibling();
					}
				}
			};

			const paintBackground = (ctx) => {
				if (selectPainter && selectPainter.paintSelectBackground) {
					selectPainter.paintSelectBackground(ctx, base, base.style);
				}
				else {
					if (!defaultSelectPainter) {
						const DefaultSelectPainter = function() {
							const painter = new BoxModelPainter();
							this.paintSelectBackground = function(ctx, boxModel, style) {
								painter.paintBox(ctx, boxModel, style);
							};
						};
						defaultSelectPainter = new DefaultSelectPainter();
					}
					defaultSelectPainter.paintSelectBackground(ctx, base, base.style);
				}
			};

			try {
				ctx.save();
				paintBackground(ctx);
				if (viewport.needsVerticalScrollbar()) {
					viewport.displayVerticalScrollbar(ctx);
				}
				viewport.clipToTargetRegion(ctx);

				const highlighted = [];
				const offset = viewport.getOffset();
				let option = element.getFirstChild();

				computeFirstAndLast(option);

				while (option) {
					option.setDeltaOffset(-Math.round(offset.x), -Math.round(offset.y));
					if (option.getHighlight()) {
						highlighted.push(option);
					}
					else {
						option.display(ctx);
					}
					option = option.getNextSibling();
				}
				for (let i = 0; i < highlighted.length; i++) {
					const h = highlighted[i];
					h.display(ctx);
				}
				ctx.restore();
			}
			catch (e57) {
				throw new Error("Error: " + e57.message);
			}
		};

		this.isInsideOption = (i, x, y) => {
			const options = selectElement.getOptions();
			const option = options.item(i);
			const box = option.getBorderBox();
			return box.isPointInsideBox(x, y);
		};

		this.viewport = viewport;
	};
	return mixin(selectElement, new SelectDisplay());
});
