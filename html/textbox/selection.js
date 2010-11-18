// text selection: 7.7 

// CursorPosition and VisualSelection are tightly coupled (conceptually too)

// They both must be in sync with the same user click action
// Therefore, cursorPosition.setPosition() will update VisualSelection
// and get the position from VisualSelection

colorjack.textbox.ui.VisualSelection = function() {
	//----------------------------------------------------------------------
	var basicModel		= null;
	var context			= null;
	var cursor			= null;
	var cursorPosition	= null;
	var inputScrolling	= null;
	var textModel		= null;
	var visualTextBox	= null;
	var testingMode		= false;
	var visualLineModel = null;
	
	var box				= null;
	
	var init = function(vars) {
		try {
			basicModel		= vars.basicModel;
			context			= vars.context;
			cursor			= vars.cursor;
			cursorPosition	= vars.cursorPosition;
			inputScrolling	= vars.inputScrolling;
			textModel		= vars.textModel;
			visualTextBox	= vars.visualTextBox;			
			visualLineModel =  textModel.getVisualLineModel();			
			
			
			box = visualTextBox.getBox();
			
			colorjack.debug.checkNull("VisualSelection", [basicModel, context, cursor, cursorPosition, inputScrolling, textModel, visualTextBox]);
		}
		catch (e) {
			colorjack.debug.programmerPanic("VisualSelection. Initialization error: " + e.name + " = " + e.message);
		}
	};

	var getContext = function() { return context; };
	//----------------------------------------------------------------------

	var range = colorjack.boxModelFactory.createRange();
	
	var setStart = function(i,x) {
		
		if (i < 0 || i >= basicModel.getLines().length) {
			colorjack.debug.programmerPanic("Invalid cursor pos: " + i);
		}
		
		range.setStart(i,x);
	};
	
	var setEnd = function(i,x) {
		range.setEnd(i,x);
	};
	
	
		
	var getStart = function() {
		return [range.startContainer, range.startOffset];
	};
	
	var getEnd = function() {
		return [range.endContainer, range.endOffset];
	};
	
	//get the left of the range
	var getLeft = function() {
		if (range.endContainer > range.startContainer || (range.endContainer == range.startContainer && range.endOffset > range.startOffset))
			return getStart();		
		else 		return getEnd();
	};
	//---------------------------------------------------------------------------------------------------
	
/*DBG*/
	var displayRange = function() {
		var r = range;
		info("[" + r.startContainer + "," + r.startOffset + "," + r.endContainer + "," + r.endOffset + "]");
	};
/*END DBG*/
	
	var doesRangeExist = function() {
		var r = range;
		return !(r.startContainer == r.endContainer && r.startOffset == r.endOffset);
	};
	
	//---------------------------------------------------------------------------------------------------
	
	var copyRange = function(x, i, xx, ii) {
		var r = colorjack.boxModelFactory.createRange(); // duplicate range? perhaps use a Clone method
		r.setStart(x, i);
		r.setEnd(xx, ii);
		return r;
	};

	var getSelection = function() {
		var r = range;
		return  copyRange(r.startContainer, r.startOffset,
							r.endContainer, r.endOffset);
	};
	
	var getSortedSelection = function() {	//  left-to-right range of getSelection()
		var s = getSelection();
		
		var diff = (s.endContainer - s.startContainer);
		if (diff === 0) {
			diff = s.endOffset - s.startOffset;
		}
		var sorted = (diff >= 0) ? s :
			copyRange(s.endContainer, s.endOffset,
						s.startContainer, s.startOffset);
		return sorted;
	};

	// --------------------------------------------------------------------------------------------
	var graphicsLib = colorjack.graphicsLib;
	var selectedRegions = [];
	
	var	markSelection = function(x, y, width, height) {
		var ctx = getContext();
		
		// info("markSelection(): " + x + "," + y + " - " + width + "," + height);
		
		var bm = visualTextBox.getBoxModel();
		var left = bm.getLeftLength();
		
		if (!testingMode) {				// Save current un-marked selection
			var maxWidth = bm.contentArea.width;
			var startX   = bm.getLeftLength();

			var offset = inputScrolling.getOffset(); // offset: negative -> start of visible pixel offset of the line
			// info("Offset: " + offset + ", x:" + x + ",y:" + y + ", w:" + width + ",h:" + height);
		
			if (inputScrolling.isEnabled()) {
				var sel = getSortedSelection();
				var startOffset = sel.startOffset;
				var endOffset = sel.endOffset;
				var fullStr = basicModel.getContent();

				var startLen = visualTextBox.getWidth(fullStr.substring(0, startOffset)) + offset;
				var endLen = visualTextBox.getWidth(fullStr.substring(0, endOffset)) + offset;
//				alert("Len: " + startLen + "," + endLen + " offset: " + offset + " - diff: " + (endLen-startLen) );

				if (startLen < 0) {
					var lostWidth = 0 - startLen;
					width = width - lostWidth;
				}
			}

			// TODO: clamp acc. to boxModel

			x = Math.max(startX, Math.round(x));
			y = Math.round(y);
			width = Math.min(maxWidth, Math.round(width));
			height = Math.round(height);

			// debug("FIXED: markSelection(): " + x + "," + y + " - " + width + "," + height);
			
			var buffer = graphicsLib.createBufferImage(x, y, width, height, ctx.canvas);
			if (buffer) {
				selectedRegions.push([buffer, x, y, width, height]);
				ctx.fillRect(x, y, width, height);
			}
			else {
				// Actually, empty lines create "null" buffers
				// alert("markSelection.createBufferImage(): Buffer is empty!");
			}
		}
	};

	var clearMarkedSelection = function(restore) {
		while (selectedRegions.length > 0) {
			var r = selectedRegions.pop();	// region to restore or "uncache" if not needed anymore.
			var dontIgnoreRestore = (restore === undefined || restore);
			if (dontIgnoreRestore) {
				var ctx = getContext();

				var image = r[0];
				var x = r[1];
				var y = r[2];
				var w = r[3];
				var h = r[4];

				if (!graphicsLib.restoreBufferImage(ctx, image, x, y, w, h)) {
					alert("Couldn't restoreBufferImage");
				}
			}
		}
	};
	
	var showRange = function() {
		var selectionColor = visualTextBox.getBoxStyle().selectionColor;
		
		cursor.hideCursor();

		clearMarkedSelection();
		
		if (!doesRangeExist()) { return; } // Nothing to show
		
		var rng = getSortedSelection();
		var i = rng.startContainer;
		var x = rng.startOffset;
		var ii = rng.endContainer;
		var xx = rng.endOffset;
		
		//mark selection on a single line
		var markSelected = function(li, off1, off2) {			
			var line = basicModel.getLines()[li];
			
			if (off2 == null)
				off2 = visualLineModel.getLineLength(li);
			

			var box1 = cursorPosition.getCursorXY(li, off1);
			var box2 = cursorPosition.getCursorXY(li, off2);
			
			var w = box2[0] - box1[0];
			
						
			markSelection(box1[0], line.getTop(), w, line.getHeight());
		}

		var ctx = getContext();
		
		ctx.save(); ctx.fillStyle= selectionColor;
		ctx.globalCompositeOperation = "xor";
		
		var lines = basicModel.getLines();

		var sameLine = (i == ii);
		//info('showRange ' + i + ' ' + x + ' ' + ii + ' ' + xx);
		
		if (sameLine && x != xx) {			// Same line, but not same position (start, end)
			markSelected(i, x, xx);
			
		}
		else if (!sameLine && i < ii) {		// Multi-line selection
			//first line
			markSelected(i, x);

			for (var j = i+1; j < ii; j++) {
				markSelected(j, 0);
			}						
			//last line!
			markSelected(ii, 0, xx);
		}
		ctx.restore();

		cursor.showCursor();
	};
	
	var selectAll = function() {
		var last = textModel.getLastCursorPos();
		setStart(0, 0);
		setEnd(last[0], last[1]);
		showRange();
	};

	return {
		'init'					: init,
		'setTestingMode'		: function(t) { testingMode = t; },
		//-------------------------------------------------------
		'setStart'				: setStart,
		'getStart'				: getStart,
		'getLeft'				: getLeft,
		'setEnd'				: setEnd,
		'getEnd'				: getEnd,
		'doesRangeExist'		: doesRangeExist,
		'getSelection'			: getSelection,
/*DBG*/	'displayRange'			: displayRange,
		//-------------------------------------------------------
		'clearMarkedSelection'	: clearMarkedSelection,
		'showRange'				: showRange,
		'selectAll'				: selectAll
	};
};

