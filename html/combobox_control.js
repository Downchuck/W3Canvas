
(function() {

  var ComboBoxLayoutManager = function(textLayer) {
  	// For a fixed-width label box: make these two values the same
  	var TEXTBOX_MIN_WIDTH = 50;
  	var TEXTBOX_MAX_WIDTH = 500;

  	var dynamicWidth = false;

  	var DefaultBoxLayout = function() {
  		this.setComboBoxModel = function(box) {
  			box.setMargin(0);
  			box.setBorder(0);
  			box.setPadding(2);
  			box.padding.top = 14;
  		};
  		this.setTextBoxModel = function(box) {
  			box.setMargin(0);
  			box.setBorder(0);
  			box.padding.left = 20;
  			box.padding.top = 3;
  			box.padding.right = 50;
  			box.padding.bottom = 3;

  		};
  		this.setIconBoxModel = function(box) {
  			box.setMargin(0);
  			box.setBorder(1);
  			box.setPadding(0);
  			box.contentArea.width = 20;
  			box.contentArea.height = 20;
  		};
  	};

  	var defaultBoxLayout = new DefaultBoxLayout();
  	var boxLayout = null;

  	var getIconBoxWidth = function(font) {
  		var getScaling = function(font) {
  			return font.getScaleFactor() * 5;
  		};
  		var scaling = getScaling(font);
  		var arrowBoxWidth = 100 * scaling;
  		return arrowBoxWidth;
  	};

  	var manageBoxLayout = function(fullBox, labelBox, arrowBox, textWidth, font) {
  		var h = font.getTextHeight();

  		defaultBoxLayout.setComboBoxModel(fullBox);
  		defaultBoxLayout.setTextBoxModel(labelBox);
  		defaultBoxLayout.setIconBoxModel(arrowBox);

  		if (boxLayout) { // override defaults
  			if (boxLayout.setComboBoxModel) {
  				boxLayout.setComboBoxModel(fullBox);
  			}
  			if (boxLayout.setTextBoxModel) {
  				boxLayout.setTextBoxModel(labelBox);
  			}
  			if (boxLayout.setIconBoxModel) {
  				boxLayout.setIconBoxModel(arrowBox);
  			}
  		}
  		labelBox.contentArea.width = textWidth;
  		labelBox.contentArea.height = h;

  		var x = labelBox.getTotalWidth() - arrowBox.getTotalWidth() + arrowBox.getLeftLength();
  		arrowBox.setOffset(x, fullBox.getTopLength());

  		var labelTotalHeight = labelBox.getTotalHeight();

  		var arrowBoxWidth = getIconBoxWidth(font);
  		var totalWidth = textWidth + arrowBoxWidth;

  		//fullBox.contentArea.width = totalWidth;	// Do not over-write width (already computed from the selectLayer)
  		fullBox.contentArea.height = labelTotalHeight;

  		var x = fullBox.getLeftLength();
  		var y = fullBox.getTopLength();
  		labelBox.setOffset(x, y);
  	};

  	var measureText = function(str, font) {
  		if (!font) {
  			throw new ReferenceError("ComboBoxLayoutManager.measureText(): Missing font!");
  		}
  		var ctx = textLayer.getContext('2d');
  		return font.measureText(ctx, str);
  	};

  	var getMaximumTextWidth = function(options, font) {
  		var w = TEXTBOX_MIN_WIDTH;
  		for (var j = 0; j < options.length; j++) {
  			w = Math.max(w, measureText(options[j].label, font)); // TODO: 'label' to String[]
  		}
  		return w;
  	};

  	var getTextWidth = function(text, font) {
  		var w = Math.min(TEXTBOX_MAX_WIDTH,
  				Math.max(TEXTBOX_MIN_WIDTH,
  					measureText(text, font)
  				));
  		return w;
  	};

  	return {
  		'setBoxLayout'			: function(b) { boxLayout = b; },
  		'manageBoxLayout' 		: manageBoxLayout,
  		'getTextWidth' 			: getTextWidth,
  		'isDynamicWidth'		: function() { return dynamicWidth; },
  		'getMaximumTextWidth'	: getMaximumTextWidth
  	};
  };


  var DefaultComboBoxPainter = function() {
  	var painter		= new colorjack.css.BoxModelPainter();
  	var gradient	= "#cc0";
  	var fullBox		= null;
  	var labelBox	= null;
  	var iconBox		= null;

  	/*
  	 *	initLayout(): This is the right place to initialize any resources such as gradients and images.
  	 */
  	var initLayout = function(box, label, icon) {
  		fullBox = box;
  		labelBox = label;
  		iconBox = icon;

  		iconBox.x = fullBox.width-40;
  		iconBox.height = Math.round(labelBox.height);

  		var createGradient = function(w, h) {
  			var canvas = colorjack.currentWindow.createCanvasLayer(w, h);
  			var ctx = canvas.getContext('2d');

  			var x = 0;
  			var y = 0;
  			painter.setupLinearGradient(ctx, x, y, w, h, '#ddd', '#777', true);
  			ctx.fillRect(x, y, w, h);

  			var pattern = ctx.createPattern(canvas, 'repeat');
  			return pattern;
  		};
  		gradient = createGradient(1, box.height);
  	};

  	var paintIcon = function(ctx, state) {
  		try {
  			var box = iconBox;

  			// throw new Error("IconBox: " + iconBox);

  			var color = (state == "over")? "#ccc" : "#777";

  			// Draw the drop down arrow
  			ctx.save();

  				ctx.fillStyle = color;
  				ctx.fillRect(box.x, box.y, box.width, box.height);

  				ctx.fillStyle = "red";
  				var arrowWidth = box.width;

  				ctx.translate(0, iconBox.y);

  				ctx.beginPath();

  				var x = iconBox.x;
  				var y = (arrowWidth/2);

  				ctx.moveTo(x, y);
  				ctx.lineTo(x + arrowWidth, y);
  				ctx.lineTo((2*x + arrowWidth)/2, y + arrowWidth/2);
  				ctx.closePath();

  				ctx.fill();

  			ctx.restore();
  		}
  		catch (e41) {
  			throw new Error("Error: " + e41.message);
  		}
  	};

  	var paintComboBox = function(ctx, selectedValue, font) {
  		ctx.fillStyle = colorjack.currentWindow.getBackgroundColor();
  		ctx.fillRect(0, 0, fullBox.width, fullBox.height);

  		painter.paintRoundedTextBox(ctx, fullBox, gradient, selectedValue, font, labelBox);
  		paintIcon(ctx, "normal");
  	};

  	return {
  		'initLayout'	: initLayout,
  		'paintIcon'		: paintIcon,
  		'paintComboBox'	: paintComboBox
  	};
  };


  colorjack.controlFactory.ComboBox = function(textLayer) {
  	var font				= null;
  	var selectControl		= new colorjack.controlFactory.Select();
  	var selectLayerShown	= false;
  	var comboBoxModel		= new colorjack.css.BoxModel();
  	var labelBoxStyle		= new colorjack.css.BoxStyle(4,5,0);
  	var iconBoxStyle		= new colorjack.css.BoxStyle(4,4,4);
  	var textWidth = 0;

  	var comboBoxLayoutManager = new ComboBoxLayoutManager(textLayer);

  	var getContext = function() {
  		return textLayer.getContext('2d');
  	};

  	var setFont = function(f) { font = f; selectControl.setFont(f); };

  	var getFont = function() {
  		if (!font) { throw new Error("colorjack.controlFactory.ComboBox.getFont(): Need to set font first"); }
  		return font;
  	};

  	var defaultComboBoxPainter = new DefaultComboBoxPainter();
  	var comboBoxPainter = null;

  	var paintIcon = function(ctx, state) {
  		if (comboBoxPainter && comboBoxPainter.paintIcon) {
  			comboBoxPainter.paintIcon(ctx, state);
  		}
  		else {
  			defaultComboBoxPainter.paintIcon(ctx, state);
  		}
  	};

  	textLayer.onmouseover = function(e) {
  		var ctx = getContext();
  		paintIcon(ctx, "over");
  	};

  	textLayer.onmouseout = function(e) {
  		if (!selectLayerShown) {
  			var ctx = getContext();
  			paintIcon(ctx, "normal");
  		}
  	};

  	var startLayout = function(options) {
  		var textWidth = 0;
  		var dynamicWidth = comboBoxLayoutManager.isDynamicWidth();
  		if (dynamicWidth) {
  			var selectedValue = getChoice();
  			textWidth = comboBoxLayoutManager.getTextWidth(selectedValue, getFont());
  		}
  		else {
  			textWidth = comboBoxLayoutManager.getMaximumTextWidth(options, getFont());
  		}
  		comboBoxLayoutManager.manageBoxLayout(comboBoxModel, labelBoxStyle, iconBoxStyle, textWidth, getFont());
  	};

  	var finishLayout = function() {
  		var thisFont = getFont();

  		labelBoxStyle.setFont(thisFont);
  		iconBoxStyle.setFont(thisFont);

  		textLayer.style.background = thisFont.getTextColor(); // Font color (background, otherwise it's white)

  		var fullBox	 = comboBoxModel.getMarginBox();
  		var labelBox = labelBoxStyle.getContentBox();
  		var iconBox	 = iconBoxStyle.getContentBox();

  		defaultComboBoxPainter.initLayout(fullBox, labelBox, iconBox);
  		if (comboBoxPainter && comboBoxPainter.initLayout) {
  			comboBoxPainter.initLayout(fullBox, labelBox, iconBox);
  		}

  		var dynamicWidth = comboBoxLayoutManager.isDynamicWidth();
  		if (!dynamicWidth) {
  			colorjack.currentWindow.setCanvasSize(textLayer, fullBox.width, fullBox.height);
  		}
  	};

  	var getChoice = function() { // Get the label of the selected option
  		var selectedValue = selectControl.getValue();
  		var selectedOption = selectControl.getSelectedIndex();
  		if (selectedOption > -1) {
  			var option = selectControl.getOptions().item(selectedOption);
  			selectedValue = option.getLabel();
  		}
  		return selectedValue;
  	};

  	var paintSelectedChoice = function() {
  		var box = null;

  		var dynamicWidth = comboBoxLayoutManager.isDynamicWidth();
  		if (dynamicWidth) {
  			//layout();
  			box = comboBoxModel.getMarginBox();
  			colorjack.currentWindow.setCanvasSize(textLayer, box.width, box.height); // this will clear the graphics too.
  		}
  		else {
  			box = comboBoxModel.getMarginBox(); // could be constant since layout()
  		}
  		var selectedValue = getChoice();
  		var ctx = getContext();

  		if (comboBoxPainter && comboBoxPainter.paintComboBox) {
  			comboBoxPainter.paintComboBox(ctx, selectedValue, getFont());
  		}
  		else {
  			defaultComboBoxPainter.paintComboBox(ctx, selectedValue, getFont());
  		}
  	};

  	var setSelectionCallback = function(callback) {
  		var newCallback = function(value, label) {
  			paintSelectedChoice();
  			selectLayerShown = false;
  			if (callback) {
  				callback(value, label);
  			}
  		};
  		selectControl.setSelectionCallback(newCallback);
  	};

  	var setHoverCallback = function(c) {
  		selectControl.setHoverCallback(c);
  	};

  	var setOptions = function(options) {
			selectControl.setOptions(options);

			startLayout(options); // set the box sizes

			var offset = comboBoxModel.getOffset();
			var left = textLayer.offsetLeft;
			var top = textLayer.offsetTop;
			var totalHeight = comboBoxModel.getTotalHeight();

			var selectLayerSize = selectControl.setLayoutOffset(left, top, totalHeight);

			var sides = comboBoxModel.getLeftLength() + comboBoxModel.getRightLength();

			comboBoxModel.contentArea.width = selectLayerSize.width - sides;

			finishLayout();

			setSelectionCallback(null); // Set default callback

			textLayer.onclick = function(e) {
				selectLayerShown = !selectLayerShown;
				selectControl.setOffset(textLayer.offsetLeft, textLayer.offsetTop);
				selectControl.updateHighlight();
				selectControl.setVisible(selectLayerShown, e);
			};
			paintSelectedChoice();
  	};

  	var setSize = function(s) {
  		selectControl.setSize(s);
  	};

  	var getSelectControl = function() {
  		return selectControl;
  	};

  	return {
  		'setComboBoxPainter'	: function(d) { comboBoxPainter = d; },
  		'setBoxLayout'			: function(b) { comboBoxLayoutManager.setBoxLayout(b); },
  		'setOptions'			: setOptions,
  		'setSize'				: setSize,
  		'setSelectionCallback'	: setSelectionCallback,
  		'setHoverCallback'		: setHoverCallback,
  		'getSelectControl'		: getSelectControl,
  		'setFont'				: setFont
  	};
  };

})();