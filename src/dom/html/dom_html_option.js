import { registerElement, HTMLElement } from './dom_html_basic.js';
import { mixin } from '../lang_util.js';
import * as dom from './dom_core.js';
import { BoxModelPainter } from '../css/box_paint.js';

registerElement("OPTION", "HTMLOptionElement", function(element) {
	const OptionElement = function() {
		this.defaultSelected = false;
		this.disabled	= false;
		this.label 		= "";
		this.index 		= -1;
		this.selected	= false;
		this.text		= "";
		this.value		= "";
		this.getDefaultSelected = () => this.defaultSelected;
		this.getDisabled = () => this.disabled;
		this.getIndex = () => this.index;
		this.getLabel = () => this.label;
		this.getSelected = () => this.selected;
		this.getText = () => this.text;
		this.getValue = () => this.value;
		this.setDefaultSelected = (ds) => this.defaultSelected = ds;
		this.setDisabled = (d) => this.disabled = d;
		this.setLabel = (c) => this.label = c;
		this.setSelected = (s) => this.selected = s;
		this.setValue = (v) => this.value = v;
		this.setIndex = (idx) => this.index = idx;
	};
	const base = new HTMLElement(element);
	const optionElement = new OptionElement();

	const OptionDisplay = function() {
		this.highlight = false;
		this.getHighlight = () => this.highlight;
		this.setHighlight = (h) => this.highlight = h;

		this.computeContentSize = (ctx) => {
			const text = optionElement.getLabel();
			const font = base.style.getFont();
			const width = font.measureText(ctx, text);
			const height = font.getTextHeight();
			base.contentArea.width = Math.round(width);
			base.contentArea.height = Math.round(height);
			return {
				'width'  : width,
				'height' : height
			};
		};

		this.getOptionContentWidth = () => {
			let optionContentWidth = 0;
			if (base.getParent()) {
				const selectWidth = base.getParent().contentArea.width;
				const option = element.getFirstChild();
				if (option) {
					optionContentWidth = selectWidth - option.getLeftLength() - option.getRightLength();
				}
			}
			return optionContentWidth;
		};

		this.getState = () => {
			if (optionElement.getDisabled()) {
				return dom.ELEMENT_STATE_DISABLED;
			}
			else if (this.highlight) {
				return dom.ELEMENT_STATE_HOVER;
			}
			else {
				return dom.ELEMENT_STATE_NORMAL;
			}
		};

		let defaultOptionPainter = null;
		let optionPainter = null;

		this.display = (ctx) => {
			const width = this.getOptionContentWidth();
			const label = optionElement.getLabel();
			const state = {
				'hover' 	: this.highlight,
				'disabled'	: optionElement.getDisabled(),
				'checked'	: optionElement.getSelected()
			};

			if (optionPainter && optionPainter.paintOption) {
				optionPainter.paintOption(ctx, base, state, width, label, this.first, this.last);
			}
			else {
				if (!defaultOptionPainter) {
					const DefaultOptionPainter = function() {
						const painter = new BoxModelPainter();
						this.paintOption = function(ctx, node, state, width, label) {
							const style = (!state.hover)? node.style : {
								'getPaddingColor'		: function() { return "white"; },
								'getBorderColor'		: function() { return "#9cb"; },
								'getBackgroundColor'	: function() { return "#dff"; },
								'getFont'				: function() { return base.style.getFont(); }
							};
							painter.paintBox(ctx, node, style, width, label);
						};
					};
					defaultOptionPainter = new DefaultOptionPainter();
				}
				defaultOptionPainter.paintOption(ctx, base, state, width, label);
			}
		};

		this.setOptionPainter = (p) => { optionPainter = p; };
	};
	return mixin(base, optionElement, new OptionDisplay());
});


registerElement("OPTGROUP", "HTMLOptGroupElement", function(element) {
	const OptGroupElement = function() {
		this.disabled = true;
		this.label = "";
	};
	const base = new HTMLElement(element);
	return mixin(base, new OptGroupElement());
});
