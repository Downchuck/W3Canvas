colorjack.textbox.model.CopyPasteUndo = function() {
	//----------------------------------------------------------------------
	var basicModel = null;
	var textModel = null;
	var visualSelection = null;
	var visualTextBox = null;
	
	var init = function(vars) {
		try {
			basicModel = vars.basicModel;
			textModel = vars.textModel;
			visualSelection = vars.visualSelection;
			visualTextBox = vars.visualTextBox;
			
			colorjack.debug.checkNull("CopyPasteUndo", [basicModel, textModel, visualSelection, visualTextBox]);
		}
		catch (e) {
			colorjack.debug.programmerPanic("CopyPasteUndo. Initialization error: " + e.name + " = " + e.message);
		}
	};
	//----------------------------------------------------------------------

	// Cheap support for 1-level Undo (could use some Stack of 'undoDocumentFragment')
	var undoDocumentFragment = null;

	var saveDocumentText = function() {
		var doc = colorjack.boxModelFactory.createDocumentFragment();
		doc.content = basicModel.getTextContent();
		doc.range = visualSelection.getSelection();
		undoDocumentFragment = doc;
	};

	var restoreDocumentText = function() {
		if (undoDocumentFragment) {
			var doc = undoDocumentFragment;
			basicModel.setTextContent(doc.content);
			visualTextBox.drawBox();

			var r = doc.range;
			visualSelection.setStart(r.startContainer, r.startOffset);
			visualSelection.setEnd(r.endContainer, r.endOffset);	
			undoDocumentFragment = null;
		}
	};

	//---------------------------------------------------------------------------------------------------

	var getCharOffset = function(container, offset) {	
		return textModel.getOffsetFromModel(container, offset);
	};
	
	var setClipboardText = function(t) {
		colorjack.clipboardService.setClipboardText(t);		
	};
	
	var getClipboardText = function() {
		return colorjack.clipboardService.getClipboardText();
	};
	
	var clipboardHasSomething = function() {
		var isEmpty = colorjack.clipboardService.isEmpty();
		return !isEmpty;
	};
	
	var copyRange = function(range) {	// Clipboard to store text
		var start = getCharOffset(range.startContainer, range.startOffset);
		var end = getCharOffset(range.endContainer, range.endOffset);

		var backwardSelection = (end < start);

		if (backwardSelection) { /* swap */	var tmp = start; start = end; end = tmp; }

		var t = basicModel.getTextContent().substring(start, end);
		setClipboardText(t);

		return [start, end, backwardSelection]; // return only needed for deleteRange()
	};

	var deleteRange = function(range) {
		var result = [0,0];

		if (range !== null && range !== undefined) {
			saveDocumentText();
			
			var offsets = copyRange(range);
			var start = offsets[0];
			var end   = offsets[1];
			var backward = offsets[2];
			
			if (start != end) {
				var text = basicModel.getTextContent();
				basicModel.setTextContent(text.substring(0, start) + text.substring(end));
				visualTextBox.drawBox();
			}
			result = (backward)?
				[range.endContainer, range.endOffset] : [range.startContainer, range.startOffset];
		}
		return result;
	};

	var pasteFromClipboard = function(container, offset) {
		var canPaste = clipboardHasSomething();
		if (canPaste) {
			saveDocumentText();
			
			var c = getClipboardText();

			var pos = getCharOffset(container, offset);
			var text = basicModel.getTextContent();
			basicModel.setTextContent(text.substring(0, pos) + c + text.substring(pos));
			visualTextBox.drawBox();

			var nextCursorPos = pos + c.length; // always larger
			
			var editLineModel = textModel.getEditLineModel();		
			var start = editLineModel.getPosition(pos);
			var end = editLineModel.getPosition(nextCursorPos);

			var visualLineModel = textModel.getVisualLineModel();
			var lastPos = visualLineModel.getLastPosition();
			
			//info("LastPos: " + lastPos[0] + "," + lastPos[1]);
			//info("Start: " + start[0] + "," + start[1]);
			//info("End: " + end[0] + "," + end[1]);
			
			var startOutOfRange = (start[0] > lastPos[0]) ||
				(start[0] === lastPos[0] && start[1] > lastPos[1]);
			
			var endOutOfRange = (end[0] > lastPos[0]) ||
				(end[0] === lastPos[0] && end[1] > lastPos[1]);

			if (startOutOfRange || endOutOfRange) {
				debug("Start/End: out of range");
			}
			else {
				// Check if past the end of the visible canvas for "end"
				//info("copyPaste.visualSelection.set");
				visualSelection.setStart(start[0], start[1]);
				//info("copyPaste.setEnd");
				visualSelection.setEnd(end[0], end[1]);
				//info("end of copyPaste.visualSelection.set");
			}
		}
		//info("end of PasteFromClipboard");
	};
	
	return {
		'init'					: init,
		'restoreDocumentText'	: restoreDocumentText,
		'copyRange'				: copyRange,
		'deleteRange'			: deleteRange,
		'pasteFromClipboard'	: pasteFromClipboard
	};
};

