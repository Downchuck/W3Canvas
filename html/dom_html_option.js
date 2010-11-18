
colorjack.dom.registerElement("OPTION", "HTMLOptionElement", function(element) {

	var OptionElement = function() {
		var defaultSelected = false;
		var disabled	= false;
		var label 		= "";		// Shorter version than "text", and should be used for display (unless it's not set, usually not set, except for some hierarchical menus)
		var index 		= -1;
		var selected	= false;
		var text		= "";		
		var value		= "";		// For the form control (to the server)
		
		var getDefaultSelected = function() {
			return defaultSelected;
		};
		
		var getDisabled = function() {
			return disabled;
		};
		
		var getIndex = function() {
			return index;
		};
		
		var getLabel = function() {
			return label;
		};
		
		var getSelected = function() {
			return selected;
		};
		
		var getText = function() {
			return text;
		};
		
		var getValue = function() {
			return value;
		};
		
		var setDefaultSelected = function(ds) {
			defaultSelected = ds;
		};
		
		var setDisabled = function(d) {
			disabled = d;
		};
		
		var setLabel = function(c) {
			label = c;
		};
		
		var setSelected = function(s) {
			selected = s;
		};
		
		var setValue = function(v) {
			value = v;
		};
		
		var setIndex = function(idx) {
			index = idx;
		};
		
		return {
			'getDefaultSelected'	: getDefaultSelected,
			'getDisabled'			: getDisabled,
			'getIndex'				: getIndex,
			'getLabel'				: getLabel,
			'getSelected'			: getSelected,
			'getText'				: getText,
			'getValue'				: getValue,
			'setDefaultSelected'	: setDefaultSelected,
			'setDisabled'			: setDisabled,
			'setLabel'				: setLabel,
			'setSelected'			: setSelected,
			'setValue'				: setValue,
			'setIndex'				: setIndex
		};
	};
	var base = new colorjack.dom.HTMLElement(element);
	var optionElement = new OptionElement();
	
	var OptionDisplay = function() {
		var highlight = false;
		
		var getHighlight = function() { return highlight; };
		var setHighlight = function(h) { highlight = h; };
	
		var computeContentSize = function(ctx) {
			var text = optionElement.getLabel();	// ignoring getText()
			var font = base.style.getFont();
			var width = font.measureText(ctx, text);
			var height = font.getTextHeight();

			// Anti-alias on fractional width found here!!
			base.contentArea.width = Math.round(width);		
			base.contentArea.height = Math.round(height);
			
			return {
				'width'  : width,
				'height' : height
			};
		};
		
		var getOptionContentWidth = function() {
			var optionContentWidth = 0;
			if (base.getParent()) {
				var selectWidth = base.getParent().contentArea.width;
				var option = element.getFirstChild();
				if (option) {
					optionContentWidth = selectWidth - option.getLeftLength() - option.getRightLength();
				}
			}
			return optionContentWidth;
		};

		var getState = function() {
			if (optionElement.getDisabled()) {
				return colorjack.dom.ELEMENT_STATE_DISABLED;
			}
			else if (highlight) {
				return colorjack.dom.ELEMENT_STATE_HOVER;
			}
			else {
				return colorjack.dom.ELEMENT_STATE_NORMAL;
			}
		};
		
		var defaultOptionPainter = null;
		var optionPainter = null;
		
		var display = function(ctx) {
			var width = getOptionContentWidth();
			var label = optionElement.getLabel();
			
			var state = {
				'hover' 	: highlight,
				'disabled'	: optionElement.getDisabled(),
				'checked'	: optionElement.getSelected()
			};
			
			if (optionPainter && optionPainter.paintOption) {
				optionPainter.paintOption(ctx, base, state, width, label, this.first, this.last);
			}
			else {
				if (!defaultOptionPainter) {
					var DefaultOptionPainter = function() {
						var painter = new colorjack.css.BoxModelPainter();

						this.paintOption = function(ctx, node, state, width, label) {
							var style = (!state.hover)? node.style : {
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

		return {
			'setOptionPainter'	: function(p) { optionPainter = p; },
			'setHighlight'		: setHighlight,
			'getHighlight'		: getHighlight,
			'computeContentSize': computeContentSize,
			'display'			: display,
			'getState'			: getState,
			'getOptionContentWidth' : getOptionContentWidth
		};
	};
	return colorjack.util.mixin(base, optionElement, new OptionDisplay());
});

	
colorjack.dom.registerElement("OPTGROUP", "HTMLOptGroupElement", function(element) {
	var OptGroupElement = function() {
		this.disabled = true;
		this.label = "";
	};
	var base = new colorjack.dom.HTMLElement(element);
	return colorjack.util.mixin(base, new OptGroupElement());
});
