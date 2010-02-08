
// BasicModel: contains the real data (content, lines) and few simple functions
// doesn't handle line lengths (different versions for different uses:
//
//   VisualLineModel: lastOffset (past the content of the line)
//	 EditLineModel: getLastOffset () returns a real index within the line.content

colorjack.textbox.model.BasicModel = function() {
	var lines = [];
	var textDomElement = null;
	var emptyDocLines = null;

	var init = function(vars) {
		textDomElement = vars.textDomElement;
	};
	
	var getContent = function() {
		return textDomElement.getValue();
	};
	
	var setContent = function(c) {
		textDomElement.setValue(c);
	};
	
	var getLines = function() { return lines; };	
	var setLines = function(s) { lines = s; };
	
	var getLineCount = function() {
		return lines.length;
	};

	var getLine = function(container) {
		if (container < 0 || container >= getLineCount()) {
			colorjack.debug.programmerPanic(
				'Perhaps not a big deal.... getLine(): invalid line beyond current size: '
				+ container + "/" + getLineCount()
			);
			return null;
		}
		return lines[container];
	};
	
	var isEmptyDocument = function() {
		return (getContent().length === 0);
	};
	
	var setEmptyDocLines = function(d) {
		emptyDocLines = d;
	};

	var getLastLine = function() {
		return isEmptyDocument()? null: getLine(getLineCount()-1);
	};
	
	var getVisibleLength = function() {
		var sum = 0;
		for (var i = 0; i < lines.length; i++) {
			sum += lines[i].content.length;
		}
		return sum;
	};

	var hasHardBreak = function(container) {
		var getLastCharInLine = function(container) {
			var line = getLine(container);		
			var str = line.content;
			var ch = (str.length === 0)? null : str.substr(str.length-1);
			return ch;
		};
		var ch = getLastCharInLine(container);
		var hard = (ch == '\n');
		return hard;
	};

	return {
		'init'				: init,
		'getContent'		: getContent,
		'getLines'			: getLines,
		'setLines'			: setLines,
		'setEmptyDocLines'	: setEmptyDocLines,
		'getTextContent'	: function() { return getContent(); },
		'setTextContent'	: function(t) { setContent(t); },
		'getLineCount'		: getLineCount,
		'getLine'			: getLine,
		'getLastLine'		: getLastLine,
		'getVisibleLength'	: getVisibleLength,
		'hasHardBreak'		: hasHardBreak,
		'isEmptyDocument'	: isEmptyDocument
	};
};



colorjack.textbox.model.EditLineModel = function() {
	var basicModel = null;

	var init = function(vars) {
		try {
			basicModel = vars.basicModel;
			
			colorjack.debug.checkNull("EditLineModel", [basicModel]);
		}
		catch (e) {
			colorjack.debug.programmerPanic("EditLineModel. Initialization error: " + e.name + " = " + e.message);
		}
	};
	
	var getLine = function(c) { return basicModel.getLine(c); };

	var getLineLength = function(container) {
		if (container === undefined) { colorjack.debug.programmerPanic("getLineLength(): Need container!"); }		
		var len = 0;

		var line = getLine(container);
		if (line) {
			len = line.content.length;
		}		
		return len;
	};

	// Note: getTextOffset(c,o) is the inverse of getPosition(charOffset)
	//
	//	charOffset = getTextOffset(container, offset) 
	//	[container,offset] = getPosition(charOffset)

	var getTextOffset = function(container, offset) {
		var idx = 0;
		//info("getTextOffset() " + container + "/" + offset);
		
		if (!basicModel.isEmptyDocument()) {	
			if ((container < 0 || container >= basicModel.getLineCount()) ||
				(offset < 0 || offset > getLineLength(container))) {
				colorjack.debug.programmerPanic("getTextOffset(): invalid pos: " + container + "/" + offset);
			}			
			var sum = 0;			
			for (var i = 0; i < container; i++) {
				sum += getLineLength(i);
			}
			idx = sum + offset;
		}		
		return idx;
	};
	
	var getPosition = function(charOffset) {
		var pos = [0,0];  // container, offset: always point to a valid text position.
		
		if (!basicModel.isEmptyDocument()) {
			var text = basicModel.getTextContent();			
			if (charOffset > text.length) { // We shouldn't get to this stage
				colorjack.debug.programmerPanic("EditLineModel.getPosition(): We are way off! " + charOffset);
			}
			else {
				var offset = charOffset;
				var container = 0;
				var len = 0;
				
				for (var i = 0; i < basicModel.getLineCount(); i++) {
					len = getLineLength(i);
					if (offset < len) {
						container = i;
						break;
					}
					offset -= len;
					container++;
					//debug("Ith: " + i + " : " + container + " : " + offset);
				}
				pos = [container,offset];
			}
		}
		return pos;
	};
	
	return {
		'init'			: init,
		'getLineLength'	: getLineLength,
		'getTextOffset'	: getTextOffset,
		'getPosition'	: getPosition
	};
};


colorjack.textbox.model.VisualLineModel = function() {
	var basicModel = null;

	var init = function(vars) {
		try {
			basicModel = vars.basicModel;
			
			colorjack.debug.checkNull("VisualLineModel", [basicModel]);
		}
		catch (e) {
			colorjack.debug.programmerPanic("VisualLineModel. Initialization error: " + e.name + " = " + e.message);
		}
	};
	
	var getLine = function(c) { return basicModel.getLine(c); };

	//------------------------------------- Same as before... not changed at all!!
	
	// +1
	var getLineLength = function(container) {
		if (container === undefined) { colorjack.debug.programmerPanic("getLineLength(): Need container!"); }
		
		var len = 0;
		var line = getLine(container);
		if (line) {
			len = line.content.length;
			if (basicModel.hasHardBreak(container)) {
				len--; // Skip the "newlines", visually they don't show up.
			}
		}
		return len;
	};

	// Much needed for navigation
	var getLastOffset = function(container) {
		var len = getLineLength(container);
		return (len===0)?0:len;
	};	
	
	// Much needed for navigation
	var getLastPosition = function() {
		var last = [0,0];
		if (!basicModel.isEmptyDocument()) {
			var lastLine = basicModel.getLineCount()-1;			
			var ch = getLastOffset(lastLine);
			last = [lastLine, ch];	// equivalent to "end of document"
		}
		return last;
	};
	
	var convertPositionFromViewToEdit = function(container, offset, ignoreWrapping) {
		if (container === undefined || offset === undefined) {
			colorjack.debug.programmerPanic("convertPositionFromViewToEdit(): need two parameters!");
		}
		var len = getLineLength(container);
		if (offset < 0 || offset > len) {
			colorjack.debug.programmerPanic("convertPositionFromViewToEdit: " + container + "/" + offset + "Length:" + len);
		}
		var c = container;
		var o = offset;
		
		var wrapToNextLine = (!ignoreWrapping && offset == len);
		if (wrapToNextLine) {
			c++;
			o = 0;
		}
		return [c,o];
	};

	return {
		'init'				: init,
		'getLineCount'		: function() { return basicModel.getLineCount(); },
		'getLastOffset'		: getLastOffset,
		'getLastPosition'	: getLastPosition,
		'getLineLength'		: getLineLength,
		'convertPositionFromViewToEdit'	: convertPositionFromViewToEdit
	};
};
