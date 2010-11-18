
colorjack.dom.registerElement("SELECT", "HTMLSelectElement", function(element) {

	var SelectElement = function() {
		var disabled	= false;
		var multiple	= false;
		var name		= "";
		var size		= 5;	// Number of visible rows (without showing a scrollBar)
		var tabIndex	= -1;
		var inFocus		= false;
		
		var add = function(node, before) {
			if (!before) {
				element.appendChild(node);
			}
			else {
				throw new ReferenceError("HTMLSelectElement.add() : insertBefore() is not implemented!");
			}
		};
		
		var blur = function() {	// May want to "draw/signal" the keyboard focus
			inFocus = false;
		};
		
		var focus = function() {// May want to "draw/signal" the keyboard focus
			inFocus = true;
		};
		
		var getDisabled = function() {
			return disabled;
		};
		
		var getLength = function() {
			return getOptions().length;
		};
		
		var getMultiple = function() {
			return multiple;
		};
		
		var getName = function() {
			return name;
		};
		
		var getOptions = function() {
			var first = element.getFirstChild();
			var iterator = new colorjack.dom.HTMLCollection(first);
			return iterator;
		};
		
		var getSelectedIndex = function() {
			// http://java.sun.com/j2se/1.4.2/docs/guide/plugin/dom/org/w3c/dom/html/HTMLSelectElement.html#getSelectedIndex()
			// The ordinal index of the selected option, starting from 0. 
			// The value -1 is returned if no element is selected. If multiple options are selected, the index of the first selected option is returned. 		
			var selectedIndex = -1;
			
			// Traverse through children to see "which one" is the first selected option			
			var options = getOptions();
			for (var i = 0; i < options.length; i++) {
				var option = options.item(i);
				if (option.getSelected && option.getSelected()) {
					selectedIndex = i;
					break;
				}
			}
			return selectedIndex;
		};
		
		var getSize = function() {
			return size;
		};
		
		var getTabIndex = function() {
			return tabIndex;
		};
		
		var getType = function() {
			return (multiple)? "select-multiple" : "select-one";
		};
		
		var getValue = function() {
			var value = "";
			var selected = getSelectedIndex();
			if (selected > -1) {
				var options = getOptions();
				var option = options.item(selected);
				value = option.getValue();
			}
			return value;
		};
		
		var	remove = function(i) {
			throw new ReferenceError("HTMLSelectElement.remove(): not implemented.");
			if (i < getLength()) {
			}
		};
		
		var setMultiple = function(m) {
			multiple = m;
		};
		
		var setName = function(n) {
			name = n;
		};
		
		var setSelectedIndex = function(si) {
			var options = getOptions();
			
			if (!multiple) { // set everything else to false
				for (var j = 0; j < options.length; j++) {
					options.item(j).setSelected(false);
				}
			}
			
			if (si >= 0 && si < getLength()) {
				var option = options.item(si);
				option.setSelected(true);
			}
		};
		
		var setSize = function(s) {
			size = s;
		};
		
		var setTabIndex = function(t) {
			tabIndex = t;
		};
		
		var setValue = function(v) {			
			// Traverse through the children: and set "selected" and selectedIndex
			throw new ReferenceError("HTMLSelectElement.setValue(): Not implemented");
		};
		
		return {
			'add'				: add,
			'blur'				: blur,
			'focus'				: focus,
			'getDisabled'		: getDisabled,
			'getLength'			: getLength,
			'getMultiple'		: getMultiple,
			'getName'			: getName,
			'getOptions'		: getOptions,
			'getSelectedIndex'	: getSelectedIndex,
			'getSize'			: getSize,
			'getTabIndex'		: getTabIndex,
			'getType'			: getType,
			'getValue'			: getValue,
			'remove'			: remove,
			'setDisabled'		: getDisabled,
			'setMultiple'		: setMultiple,
			'setName'			: setName,
			'setSelectedIndex'	: setSelectedIndex,
			'setSize'			: setSize,
			'setTabIndex'		: setTabIndex,
			'setValue'			: setValue
		};
	};
	
	var base = new colorjack.dom.HTMLElement(element);
	var selectElement = colorjack.util.mixin(base, new SelectElement());
	
	var SelectDisplay = function() {
		var defaultSelectPainter = null;
		var selectPainter = null;
		var viewport = new colorjack.css.Viewport();

		viewport.needsVerticalScrollbar = function() { // Override method (This is our preferred way to override methods: simpler than the OO-approach)
			var needs = selectElement.getLength() > selectElement.getSize();
			return needs;			
		};
		
		var setSelectPainter = function(p) {
			selectPainter = p;
			
			if (p.paintOption) {
				var option = element.getFirstChild();
				while (option) {
					option.setOptionPainter(p);
					option = option.getNextSibling();
				}
			}
		};
		
		var getSelectPainter = function() {
			return selectPainter;
		};
		
		var display = function(ctx) {
		
			var computeFirstAndLast = function(first) { // Find out first and last options
				var option = first;
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
			
			var paintBackground = function(ctx) {
				if (selectPainter && selectPainter.paintSelectBackground) {
					selectPainter.paintSelectBackground(ctx, base, base.style);
				}
				else {
					if (!defaultSelectPainter) {
						var DefaultSelectPainter = function() {
							var painter = new colorjack.css.BoxModelPainter();

							this.paintSelectBackground = function(ctx, boxModel, style) {
								// Paint this box and paint each children	
								painter.paintBox(ctx, boxModel, style);
								//painter.paintRoundedTextBox( ctx, boxModel.getMarginBox(), style.getBackgroundColor() );
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
					// Paint the scrollBars in the 'right' padding area
					viewport.displayVerticalScrollbar(ctx);
				}
				// Setup clipping area before painting the options
				viewport.clipToTargetRegion(ctx);

				var highlighted = [];
				var offset = viewport.getOffset();
				var option = element.getFirstChild();
				
				computeFirstAndLast(option);
				
				while (option) {
					option.setDeltaOffset(-Math.round(offset.x), -Math.round(offset.y)); // round() to get rid of the anti-alias.
					if (option.getHighlight()) {
						highlighted.push(option);
					}
					else {
						option.display(ctx);
					}
					option = option.getNextSibling();
				}
				// Note: paint the borders properly when overlapping bounding rectangles
				for (var i = 0; i < highlighted.length; i++) {
					var h = highlighted[i];
					h.display(ctx);
				}				
				ctx.restore();					
			}
			catch (e57) {
				throw new Error("Error: " + e57.message);
			}
		};
		
		var isInsideOption = function(i, x, y) { 
			var options = selectElement.getOptions();			
			var option = options.item(i);
			var box = option.getBorderBox();
			return box.isPointInsideBox(x, y);
		};
		
		return {
			'display'			: display,
			'viewport'			: viewport,
			'setSelectPainter'	: setSelectPainter,
			'getSelectPainter'	: getSelectPainter,
			'isInsideOption'	: isInsideOption
		};
	};	
	return colorjack.util.mixin(selectElement, new SelectDisplay());
});
