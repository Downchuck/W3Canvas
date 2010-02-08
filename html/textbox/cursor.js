colorjack.textbox.ui.cursor.DummyCursor = function() { // For testing framework
	var noOp = function() {};

	return {
		'init'		 : noOp,
		'startBlink' : noOp,
		'stopBlink'  : noOp,
		'showCursor' : noOp,
		'hideCursor' : noOp,
		'drawCursor' : noOp
	};
};


colorjack.textbox.ui.cursor.Cursor = function() {
	//----------------------------------------------------------------------
	var context = null;
	var cursorPosition = null;
	var textBoxId = -1;
	var visualTextBox = null; // to get the style for coloring the cursor
	
	var init = function(vars) {
		try {
			cursorPosition		= vars.cursorPosition;
			context				= vars.context;
			textBoxId			= vars.textBoxId;
			visualTextBox		= vars.visualTextBox;
			
			colorjack.debug.checkNull("Cursor", [cursorPosition, context, textBoxId, visualTextBox]);
		}
		catch (e) {
			colorjack.debug.programmerPanic("Cursor. Initialization error: " + e.name + " = " + e.message);
		}
	};
	
	var getContext = function() { return context; };
	//----------------------------------------------------------------------

	var prevOverlapCursorImage = null;
	var prevOverlapCursorPos = null;
	var cursorDrawn = false;
	
	var getCursorWidth = function() {
		return visualTextBox.getBoxStyle().cursorWidth;
	};
	
	var graphicsLib = colorjack.graphicsLib;
	
	var drawCursor = function() {
		if (cursorDrawn) { return; }

		var ctx = getContext();
		
		ctx.save();
		
		var style = visualTextBox.getBoxStyle();
		ctx.fillStyle = style.cursorColor;			// cursorColor must be defined
		ctx.strokeStyle='rgba(0,0,0,0)';
		var tmp = cursorPosition.getCursorXY();

		var w = getCursorWidth();
		var h = Math.round(tmp[2]-2);

// TODO? Adjust the cursor position a little to the left IF it's not the first character in the line.		
//		tmp[0] = tmp[0] - w/2;
		var x = Math.round(tmp[0]);
		var y = Math.round(tmp[1]);

		prevOverlapCursorPos = tmp;
		prevOverlapCursorImage = graphicsLib.createBufferImage(x, y, w, h, ctx.canvas);

		ctx.fillRect(x, y, w, h);

		ctx.restore();
		cursorDrawn = 1;
	};

	var hideCursor = function() {
		if (!cursorDrawn) { return; }
		
		if (prevOverlapCursorImage) {
			var tmp = prevOverlapCursorPos;

			var w = getCursorWidth();
			var h = tmp[2]-2;
			var x = tmp[0];
			var y = tmp[1];

			var ctx = getContext();
			ctx.clearRect(x, y, w, h);

			graphicsLib.restoreBufferImage(ctx, prevOverlapCursorImage, x,y,w,h);
			prevOverlapCursorImage = null;
		}
		cursorDrawn = 0;
	};

	// -----------------------------------------------------------------------------
	
	var cursorInterval = 600;
	var cursorTimer = null;
	var cursorTimers = [];
	
	var blinkCursor = function() {
		var self = "colorjack.textBoxFactory.getTextBox(" + textBoxId + ")";
		var cmd = self + '.showCursor()';
		cursorTimers.push(
			cursorTimer = setTimeout(cmd, cursorInterval)
		);
	};

	var showCursor = function(forceDraw) {
		if (forceDraw) {
			hideCursor();
			drawCursor();
			return;
		}
		if (!cursorTimer) { return; }
		
		while (cursorTimers.length) {
			clearTimeout(cursorTimers.pop());
		}
		clearTimeout(cursorTimer);
		if (cursorDrawn) {
			hideCursor();
		} else {
			hideCursor();
			drawCursor();
		}
		
		var textFocusManager = colorjack.textFocusManager;
		var focusedId = textFocusManager.getCurrentTextBoxId();
		if (focusedId === textBoxId) {
			blinkCursor();
		}
	};

	var startBlink = function() { hideCursor(); drawCursor(); blinkCursor(); };
	var stopBlink = function() { hideCursor(); clearTimeout(cursorTimer); cursorTimer = null; };
	
	return {
		'init'		 : init,
		'startBlink' : startBlink,
		'stopBlink'  : stopBlink,
		'showCursor' : showCursor,
		'hideCursor' : hideCursor,
		'drawCursor' : drawCursor
	};
};


colorjack.textbox.ui.cursor.CursorPosition = function() {
	//----------------------------------------------------------------------
	var basicModel = null;
	var inputScrolling = null;	
	var visualTextBox = null;
	var visualSelection = null;
	
	var init = function(vars) {
		try {
			basicModel		= vars.basicModel;
			inputScrolling	= vars.inputScrolling;
			visualTextBox	= vars.visualTextBox;
			visualSelection = vars.visualSelection;
			
			colorjack.debug.checkNull("CursorPosition", [basicModel, inputScrolling, visualTextBox, visualSelection]);
		}
		catch (e) {
			colorjack.debug.programmerPanic("CursorPosition. Initialization error: " + e.name + " = " + e.message);
		}
	};
	//----------------------------------------------------------------------
	
	var getCursorWidth = function() {
		return visualTextBox.getBoxStyle().cursorWidth;
	};
	
	var getWidth = function(str) {
		return visualTextBox.getWidth(str);
	};
	
	var getCursor = function(x,i) {	// [x, line i]
		var container = parseInt(i, 10);
		var offset = -1;

		var lines = basicModel.getLines();		

		if(!(container in lines)) {
			container = (container > lines.length) ? lines.length-1 : 0;
		}
		var line = lines[container];
		var text = line.content;

		var beforeLen = visualTextBox.getBox().x + inputScrolling.getOffset();
		
		for (var ch = 0; ch < text.length; ch++) {
			var currentChar = text.charAt(ch);			
			var currentCharWidth = getWidth(currentChar);
			var currentCharHalfWidth = currentCharWidth / 2;

			if (x < beforeLen + currentCharHalfWidth) {
				offset = ch;
				break;
			}
			beforeLen += currentCharWidth;
		}

		if (offset == -1) { // Not assigned yet: end of line
			offset = text.length;
			var hasNewLine = (text.substr(text.length-1, 1) == "\n");
			if (hasNewLine) {
				offset--;	// We don't want to include newlines in the result
			}
		}
		return [container, offset];
	};

	var getCursorXY = function(li,off) {
		var pos			= visualSelection.getEnd();
		var container	= (li === undefined)? pos[0] : li;
		var offset		= (off === undefined)? pos[1] : off;
		var lines		= basicModel.getLines();
		
		var line = lines[container];
		if (!line) {
			line = lines[0];
		}
		var x = line.x;
		if (offset) {
			x += getWidth(line.content.substr(0,offset)) + inputScrolling.getOffset();
		}
		var y = line.y - line.height; y++;
		x = Math.round(x);
		y = Math.round(y);
		return [x,y,line.height];
	};
	
	var verticalCursorX = -1; // Buffer last X position for Arrow Up/Down movement

	var computeVerticalArrowCursorPos = function(container, offset) { // vertical arrow movement
		var xy = getCursorXY(container, offset);
		var x = xy[0] - visualTextBox.getBoxModel().getLeftLength();
		verticalCursorX = x;
	};
	
	var getVerticalArrowCursorPos = function(container) {
		return getCursor(verticalCursorX, container);
	};

	// Called after a cursor horizontal arrow movement, control -> Word cursor movement. What about selection !?
	// Called after inserting a character, and/or deleting a character
	
	// It could be more appropriate to set the offset within the visualTextBox.setInputOffset() to make it more consistent with BoxModel_2.
	// This is something to consider.
	
	var moveToVisiblePosition = function(c,o) {
		if (inputScrolling.isEnabled()) {
			// Assumption: we are only editing a "single" line of text
			
			// Check whether this cursor position is visible or not.
			var x   = getCursorXY(c,o)[0]; 			// taking care of the offset
			var bm  = visualTextBox.getBoxModel();
			var box = bm.getContentBox();
			
			var isXCoordVisible = function(x) {
				return (box.x < x && x < box.x + box.width);
			};
			
			var visible = isXCoordVisible(x);

			if (!visible) {
				var line = basicModel.getLines()[0]; // We only care about the single edit line.
				if (line) {
				
					var getInputOffset = function(str, offset, x) {
						var newOffset = 0;						
						var i, incr = (x <= box.x)? -1 : 1;
						var jump = 10; // Jump 10 characters whenever we pass the boundaries of the textbox
						
//						throw new Error("x: " + x + " - box.x: " + box.x);
						
						var endOfDoc = (offset >= str.length);
						if (endOfDoc) {
							var last = Math.max(0, str.length - jump);
							newOffset = getWidth(str.substr(0,last));
						}
						else
						if (incr > 0) { // Going forward: not from the offset, but the "last" visible char
							// Get last current visible char
							var lastVisibleCharOffset = visualSelection.getEnd()[1];							
							var diffStr = str.substring(lastVisibleCharOffset, offset + jump); // could be single char or word movement
							var w = getWidth(diffStr);
							newOffset = -inputScrolling.getOffset() + box.x + w + getCursorWidth();	// Make the cursor visible
						}
						else { // Going backward
							for (i = Math.max(0, offset-jump); i >= 0; i--) {
								var newX = getWidth(str.substr(0,i));							
								visible = isXCoordVisible(newX + inputScrolling.getOffset());
								//info("newX: " + newX + " : " + visible);								
								if (!visible) {
									newOffset = newX;
									break;
								}
							}
						}
						return newOffset;
					};
					var newOffset = getInputOffset(line.content, o, x);					
					//info("New offset: " + newOffset);
					inputScrolling.setOffset(-newOffset); // offset is always negative, never positive except 0.
					visualTextBox.drawBox();
				}
			}
		}
	};
	
	var setPosition = function(c,o) {
		visualSelection.clearMarkedSelection(true); // Do this before resetting the values of the visualSelection
	
		moveToVisiblePosition(c,o);
		visualSelection.setStart(c,o);
		visualSelection.setEnd(c,o);
	};
	
	var getPosition = function() { // always in sync with the visualSelection
		var p = visualSelection.getEnd();
		return [p[0],p[1]];
	};
	
	return {
		'init'			: init,
		'getCursor' 	: getCursor,
		'getCursorXY'	: getCursorXY,
		'setPosition'	: setPosition,
		'getPosition'	: getPosition,
		'getVerticalArrowCursorPos' : getVerticalArrowCursorPos,
		'moveToVisiblePosition'		: moveToVisiblePosition,
		'computeVerticalArrowCursorPos' : computeVerticalArrowCursorPos
	};
};

