
// Out of date
colorjack.css.Font = function() {
	var fontLetters = arialFontLib.font.letters; // Funny dependency for the keyboard

	return {
		'drawString': function(ctx, str)  { arialFontLib.ctx = ctx; arialFontLib.drawString(ctx, str); },
		'measureText': function(ctx, str) { return arialFontLib.measureText(str).width; },
		'getFontLetters': function()      { return fontLetters; },
		'setFontLetters': function(fl)    { fontLetters = fl; }
	};
};

// Debug 
colorjack.component.BoxStyle = function() {
	this.color = "rgb(200,0,0)";
	
	this.reverseMode = false;
	this.showLines = true;
	this.lineColor = 'rgba(10,10,120,1)';
	this.cursorWidth = 4;
	this.cursorColor = '#555';

	this.borderColor = "black";
	this.selectionColor = "rgba(20,40,200,.7)"; // used in VisualSelection.showRange()
};
colorjack.component.DrawingBoxDebugging = function() {
	this.showSingleLineBorder = true; // to see the border lines
	this.singleLineBorderColor = 'rgb(0,200,0)';
};


// http://www.w3.org/TR/css3-linebox

// lineStacking (within block element)
colorjack.textbox.VisualTextBox = function() {
	var debugging		= new colorjack.component.DrawingBoxDebugging();
	var initialized		= false;
	// -------------------------------------------------------------------------------
	var baseLineExtraSpacing = 5;
	var basicModel		= null;
	var box				= null;		// Canvas box size
	var boxStyle		= new colorjack.component.BoxStyle();	// Default style
	var canvasBox		= null;
	var context			= null;
	var boxModel		= null;
	var originalBoxModel	= null;
	var font			= null;
	var inputScrolling	= null;
	var testingMode		= false;
	var textBoxId		= -1;
	
	// Instead of expanding the original box model, we choose to shrink the box model.
	// And the rest increase the bottom margin area... OR the bottom padding area.
	// For the width, we shouldn't have problems expanding to the maximum.
	
	var getLineHeight = function() {
		return baseLineExtraSpacing + font.getTextHeight();
	};


// HTMLTextAreaElement
	var adjustBoxModel = function(boxModel, canvasBox) {
		var adjusted = new colorjack.css.BoxModel();
		adjusted.copyRectFrom(boxModel);
		var w, h;
		// The DOM Element takes precedence in terms of content size.
		if (boxModel.contentArea.width > 0 &&
			boxModel.contentArea.height > 0) {
				w = boxModel.contentArea.width;
				h = boxModel.contentArea.height;
		}
		else {
			w = canvasBox.width - boxModel.getLeftLength() - boxModel.getRightLength();
			h = canvasBox.height - boxModel.getTopLength() - boxModel.getBottomLength();
		}
		adjusted.setSize(w, h);
// single textContent block
		// Now adjust the height so that it fits for visible # of lines within "h"
//		debug("lineHeight: " + lineHeight + ", " + totalLinesHeight);
		var lineHeight = getLineHeight() ;
		var numLines = 0;		
		if (inputScrolling.isEnabled()) {
			numLines = 1;
		}
		else {
			numLines = Math.floor( h / lineHeight );
		}
		var totalLinesHeight = numLines * lineHeight;
//		throw new Error("Number of Lines: " + numLines + ", " + lineHeight + ", " + totalLinesHeight);
		totalLinesHeight += lineHeight;
		var diff = h - totalLinesHeight;    
		adjusted.contentArea.height -= diff;
//		throw new Error("Adjusted height: " + adjusted.contentArea.height);
		var balanceToTheMargin = true;
		if (balanceToTheMargin) {
			adjusted.margin.bottom += diff;
		}
		else {
			adjusted.padding.bottom += diff;
		}
		//else { // Enable for debugging
		//	adjusted.border.bottom += diff;
		//}
//		throw new Error("Adjusted width: " + adjusted.contentArea.width);
//		throw new Error("Adjusted height: " + adjusted.contentArea.height);
		return adjusted;
	};

	var resetBox = function() {
		boxModel = adjustBoxModel(originalBoxModel, canvasBox);
		box = colorjack.boxModelFactory.createBox();
		var offset = boxModel.getOffset();
		box.x = offset.x;
		box.y = offset.y + font.getTextHeight();
		box.width = boxModel.contentArea.width - box.x - 1;
		box.height = boxModel.contentArea.height;
		box.writingMode = 'lr-tb';
	};
	
	var setFont = function(f) {
		font = f;
		baseLineExtraSpacing = Math.round(font.getTextHeight() / 5); // Make sure to set to an integer value.
		resetBox();
	};
	
	var init = function(vars) {
		
		try {
			if (!initialized) {
				initialized = true;
				basicModel			= vars.basicModel;
				canvasBox			= vars.canvasBox;	// We can resize() the "canvasBox".
				context				= vars.context;
				boxModel			= vars.textDomElement;		
				inputScrolling		= vars.inputScrolling;
				textBoxId			= vars.textBoxId;
				
				originalBoxModel	= vars.textDomElement;

				if (!font) {
					font = new ArialFont();			
				}
				resetBox();

//				throw new Error("InitAdjusted: " + boxModel.contentArea.width);
				
				colorjack.debug.checkNull("VisualTextBox", [basicModel, box, canvasBox, context, font, textBoxId]);
			}
		}
		catch (e541) {
			colorjack.debug.programmerPanic("VisualTextBox. Initialization error: " + e541.name + " = " + e541.message);
		}
		return boxModel;
	};
	
	var getContext = function() { return context; };
	
	// -------------------------------------------------------------------------------

	var drawLine = function(line,drawText,boxStyle) {
		var ctx = getContext();

		// before is actually an array, ::before == before(1),
		// ::before::before == before(1)::before
		// ::before(2) == before(2)
		if(line.content.substr(0,5) == 'spoon') line.before = function(line,ctx,drawText,boxStyle) {
			var n = colorjack.util.mixin(line,{content: '!!!', 'after':null, 'before': null});
			n.maxWidth = n.width = getWidth(n.content);
			line.x += n.width;
			line.maxWidth -= n.width;
			drawLine(n,drawText,boxStyle);
		}

		if(line.before) line.before(line,ctx,font.drawString,boxStyle);
		ctx.save();
		ctx.translate(line.x,line.y);

		// Paint Boundaries

		ctx.save();
		ctx.translate(0, -line.maxHeight); // text-baseline: bottom
		ctx.clearRect(0,0,line.maxWidth,line.maxHeight);
		ctx.beginPath(); ctx.rect(0,0,line.maxWidth,line.maxHeight); ctx.clip();
		if (boxStyle.reverseMode) {
			ctx.fillStyle  = boxStyle.color;
			ctx.fillRect(0,0,line.maxWidth,line.maxHeight);
		}
		if (boxStyle.showLines) {
			ctx.strokeStyle = boxStyle.lineColor;
			ctx.strokeRect(0,0,line.maxWidth,line.maxHeight);
		}
		if (debugging.showSingleLineBorder) {
			ctx.strokeStyle = debugging.singleLineBorderColor;
			ctx.strokeRect(0,line.maxHeight-line.height,line.width,line.height);
		}
		ctx.restore();

		// Paint Content

		ctx.save();
		//ctx.rect(0,-line.height,line.width,line.height); // FIXME: Cheap baseline
		//ctx.clip();
		if (inputScrolling.isEnabled()) {
			// BoxModel String location: BoxModel.contentArea.width
			//ctx.beginPath();
			//ctx.rect(0, 0, boxModel.contentArea.width, line.height);
			//ctx.clip();
			var offset = inputScrolling.getOffset();
			ctx.translate(offset, 0);
		}
		var diff =  font.getBaseLine() - font.getTextHeight();
		ctx.translate(0, diff);
		ctx.fillStyle = boxStyle.color;

		if(line.content.substr(0,5) == 'spoon') line.after = function(line,ctx,drawText,boxStyle) {
			var n = colorjack.util.mixin(line,{content: '!!!', 'after':null, 'before': null});
			n.x += n.width; n.maxWidth = n.width = getWidth(n.content);
			// delete line.after; delete line.before;
			drawLine(n,drawText,boxStyle); 
			var c = document.getElementById("cBox_top");
			var ievent = false;
			if(ievent) {
				ctx.drawImage(c,n.x,n.y-n.maxHeight); // setup events region
				//ctx.delegate(c,n.x,n.y-n.maxHeight);
			} else {
				c.style.position='absolute'; c.style.left = ctx.canvas.offsetLeft + n.x + 'px';
				c.style.top = ctx.canvas.offsetTop + n.y  -n.maxHeight + 'px';
			}
			if(0) { // TEXT_NODE
				ctx.save();
				ctx.translate(line.width+5,0);
				// drawText(ctx,n.content); // drawText("!!!");
				ctx.restore();
			}
		}
		ctx.save(); if(line.content && line.content.length) font.drawString(ctx, line.content); ctx.restore();
		ctx.restore();
		ctx.restore();
		if(line.after) line.after(line,ctx,font.drawString,boxStyle);
	};

	var wrapper = new colorjack.css.StringLineWrapper();
	var m = new colorjack.css.LineMaker();
	var painter	= new colorjack.css.BoxModelPainter();
	
	function getWidth(str) {
		return font.measureText(getContext(), str);
	};

//	adjustLineBox [ reflow lines, re-apply styles]
	var drawBox = function() {
		if (!initialized) {
			colorjack.debug.programmerPanic("need to call TextBox.init() first");
			return;
		}

		var outerBox = box;
		
		var textContent = basicModel.getTextContent();
		
		var lineMaxWidth = outerBox.width;
		var frameHeight = outerBox.height;
		
		var offset = { 'x' : 0,	'y' : 0	};
		
		if (boxModel) {
			lineMaxWidth = boxModel.contentArea.width;
			offset.x = boxModel.getLeftLength();
			offset.y = boxModel.getTopLength();
		}

		// FIXME: line-stacking-strategy,
		// allow mixed inline and block elements
		// allow display: inline (in so much as we can)

		// these take line numbers and return available bounding width, and in the second case, x/y coordinates
		// getMaxWidth uses line number and offset, to allow:
		// css3-text: text-align-last
		// var layout = { getMaxWidth: function(){}, getInlinePosition: function() {} };
		var textLines = inputScrolling.isEnabled()? [textContent] : wrapper.getWrappedLines(textContent, lineMaxWidth, getWidth);
		var lineBoxes = m.createLineBoxes(textLines, getWidth, font.getTextHeight(), lineMaxWidth, frameHeight, baseLineExtraSpacing, offset);

//		basicModel.setLines(lineBoxes);
//	}

//	var drawBox = function() {
//		var lines = basicModel.getLines();
//		var lineBoxes = adjustLineBox(lines);
		var lines = basicModel.getLines();
		if (inputScrolling.isEnabled()) {
			if (lineBoxes[0]) {
				lineBoxes[0].redraw = true;
			}
		}
		else {
			var i;
			for (i = 0; i < lineBoxes.length; i++) {
				var line = lineBoxes[i];
				var withinCurrentLines = (i < lines.length);

				if (withinCurrentLines && line.content === lines[i].content) {
					line.redraw = false;
				}
				else {
					line.redraw = true;
				}
			}
		}
		var oldLines = lines;
		lines = lineBoxes;
		basicModel.setLines(lineBoxes); // comment out
	
		if (!testingMode) {
			var drawText = font.drawString;		
			var ctx = getContext();
			
			ctx.save();

			// Default clipping: whole canvas, clipping again anyway (not needed if using default canvas clipping)
//			ctx.beginPath();
//			ctx.rect(0, 0, canvasBox.width, canvasBox.height); // Full canvas
//			ctx.rect(Math.max(box.x-1, 0), 0, box.width + box.x+1, box.height); // More restricted zone, could reduce more here
//			ctx.clip();

			if (boxModel) {
				// Just want to paint the border
				var style = {
					'getBackgroundColor' : function() { return null; }, // Just want to paint the border
					'getBorderColor'     : function() { return boxStyle.borderColor; },
					'getFont'            : function() { return font; }
				};
				painter.paintBox(ctx, boxModel, style); 

				// BoxModel clipping area: ok for TextArea
				var top  = boxModel.getTopLength();
				var left = boxModel.getLeftLength();
				var w = boxModel.contentArea.width;
				var h = boxModel.contentArea.height;
				ctx.beginPath();
				ctx.rect(left, top, w, h);
				ctx.clip();
			}

			for (i = 0; i < lineBoxes.length; i++) {
				if (lineBoxes[i].redraw) {
					drawLine(lines[i], drawText, boxStyle);
					// i == lineBoxes.length - 1 ? colorjack.util.mixin(boxStyle,{color:'pink'}) : boxStyle);
				}
			}

			// FIXME: Broken and not well thought out.
			if (oldLines.length > lines.length) { // Erase the oldLines if there were there -> draw empty boxes
				for (i = lines.length; i < oldLines.length; i++) {
					oldLines[i].content = "";
					drawLine(oldLines[i], drawText,boxStyle);
				}
			}
			ctx.restore();
		}
	};
	
	return {
		'init'			: init,
		'setTestingMode': function(v) { testingMode = v; },
		'getId'			: function() { return textBoxId; },
		'getBox'		: function() { return box; },
		'getWidth'		: getWidth,
		'getBoxModel'	: function() { return boxModel; },
		'setBoxModel'	: function(b) { boxModel = b; },
		
		'resetBox'		: resetBox,

//		'getBox'		: function() { return box; },
		'drawBox' 		: drawBox,
		'setBoxStyle' 	: function(s) { boxStyle = s; },
		'getBoxStyle' 	: function() { return boxStyle; },
		'setFont'		: setFont,
		'getFont' 		: function() { return font; }	
	};
};

