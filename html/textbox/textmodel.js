// Handle text edit operations: in particular text selection, copy, paste, undos

/*----------------------------------------------------------------------------------------------------------
 *
 *
 *									Programming Design Concepts
 *
 *
 *
 *	
 *  Range/selection
 *	---------------
 *
 *	[x] A Range (or selection) is delimited by [startContainer, startOffsett] and [endContainer, endOffset]
 *  	- startContainer: container number in app.visualTextBox.getLines()[]
 *  	- startOffset: char offset within the startContainer container
 *  	- endContainer: container number in app.visualTextBox.getLines()[]
 *  	- endOffset: char offset within the endContainer container
 *
 *  [x] app.visualTextBox.getLines()[] contains all the soft/hard broken lines of app.visualTextBox.getTextContent()
 *  	The hardbreak lines are delimited by "\n" at the end of app.visualTextBox.getLines()[i]
 *  	[Exc: The last container contains a "\n" (implementation: we never reach a case with "no lines" to draw)]
 *
 *
 *  Directional selection
 *  ----------------------
 *
 *		We are allowing endContainer to be less than startContainer.
 *  	So that we can differentiate left-to-right selection from right-to-left selection.
 *  	This differentiation is important when we start doing cursor selection navigation (up/down arrows)
 *
 *  	[x] getSelection() returns the unmodified range [startContainer, startOffset, endContainer, endOffset]
 *			whereas getSortedSelection() returns the left-to-right range of getSelection()
 *
 *		In the original design, most cursor operations relied on getStart().
 *  	In the current design, most cursor operations rely on getEnd(), since conceptually
 *  	we always want to work with the last cursor position and not with the first one.
 *		We have to switch into thinking with CursorPosEnd all the time.
 *		Use CursorPosStart only for selection operations in which we really require the "start".
 *
 *
 *	Cut/copy/paste Notes
 *	--------------------
 *
 *	[x] clipboardText: used for buffering cut/copy/paste selections
 *
 *  [x] saveDocument(), restoreDocument(): used for undo (get/set full textDocument and documentTextCursor)
 *
 *
 *	Other notes:
 *
 *	[x] Ctrl+Space will display the model
 *	[x] getWordRange(container, offset) is used for the selection of the closest word after a dblclick
 *		But it has been a great visual tool for testing/debugging and find out character offset positioning.
 *
 *	TODO-list:
 *  [x] Character operations (delete/backspace, insert) do not support undo operations currently.
 *  [x] "Undo" handles simple scenarios and it's only 1-level undo support
 *
 *	[x] Adapt many interfaces to the DOM CSS specs (but first use a better object model)
 *		Change setStart() to setStart(), once we can use a distinct object model and not a global app.setStart()
 *
 *	setStart() -> setStart(), if we can code like: range.setStart(node, offset) and not app.setStart(node, offset)
 *	With a global scope of "type", it will become more confusing. With a proper object scope, the change will be clearer.
 
Range needs to be associated with the Document object for this API call to happen:

TextModel

	DocumentFragment	Range.cloneContents();
	DocumentFragment	extractContents()

void deleteContents()

Range.deleteContents(), deleting stuff into the document (strange OO way to alter the document)

 *----------------------------------------------------------------------------------------------------------
 */

colorjack.textbox.model.TextModel = function() {
	//----------------------------------------------------------------------
	var copyPasteUndo = new colorjack.textbox.model.CopyPasteUndo();
	var editLineModel = new colorjack.textbox.model.EditLineModel();
	var visualLineModel = new colorjack.textbox.model.VisualLineModel();
	
	var cursorPosition = null;
	var visualSelection = null;
	var visualTextBox = null;
	var basicModel = null;
	
	var init = function(vars) {
		try {
			copyPasteUndo.init(vars);
			editLineModel.init(vars);
			visualLineModel.init(vars);
			
			basicModel = vars.basicModel;
			cursorPosition = vars.cursorPosition;			
			visualSelection = vars.visualSelection;
			visualTextBox = vars.visualTextBox;
			
			colorjack.debug.checkNull("TextModel", [basicModel, copyPasteUndo, cursorPosition, visualSelection, visualTextBox]);
		}
		catch (e) {
			colorjack.debug.programmerPanic("TextModel. Initialization error: " + e.name + " = " + e.message);
		}
	};
	
	var setTextContent = function(t) { basicModel.setTextContent(t); };
	
	//haipt
	var setCssHack = function(css) { basicModel.setCssHack(css); }; 
	
	var getTextContent = function() { return basicModel.getTextContent(); };
	
	var getExtendedContent = function() { return basicModel.getExtendedContent(); };

	//---------------------------------------------------------------------------------------------------
	
	var getWordRange = function(container, offset) { // used for the selection of the closest word after a dblclick
		var result = null;	
		if (container === -1) { return result; }
		
		//var line = basicModel.getLine(container).content;
		var line = basicModel.getLine(container).getContent();
		
		if (!colorjack.util.isWordSeparator(line.charAt(offset))) {
			var start = 0;
			for (var i = offset; i > 0; i--) {
				if (colorjack.util.isWordSeparator(line.charAt(i))) { start = i + 1; break; }
			}
			var end = line.length;
			for (var u = offset; u < line.length; u++) {
				if (colorjack.util.isWordSeparator(line.charAt(u))) { end = u; break;	}
			}
			
			//account for shift in generated content:
			//var offset1 = editLineModel.getTextOffset(container, start);
			//var pos1 = editLineModel.getPosition(offset1);
			
			info("===> Word selected: |||" + line.substring(start, end) + "|||");		/*DBG*/			
			var range = colorjack.boxModelFactory.createRange();
			range.setStart(container, start);
			range.setEnd(container, end);			
			result = range;			
		}
		
		return result;
	};
		
	//---------------------------------------------------------------------------------------------------
	//get the offset in the extended text from the current model
	var getOffsetFromModel = function(container, offset) {
		if (container === undefined) {
			var pos = cursorPosition.getPosition();
			container = pos[0];
			offset = pos[1];
		}
		//var p = visualLineModel.convertPositionFromViewToEdit(container, offset, true);
		//var editOffset = editLineModel.getTextOffset(p[0], p[1]);
		var exOffset = editLineModel.getExtendedOffset(container, offset);
		return exOffset;
	};
	
	
	var setNextPosition = function(editOffset, wrap) {		
		//info("Edit: " + editOffset);
		var nextPos = editLineModel.getPosition(editOffset);
		//info("nextPos: " + debuginfo(nextPos));
		//info('setNextPosition: ' + nextPos[0] + ',' + nextPos[1]);

		var pastEndOfDoc = (nextPos[0] >= basicModel.getLineCount());
		if (pastEndOfDoc) {
			nextPos = visualLineModel.getLastPosition();
		}
		else {
			var canKeepInsertingOnSameLine = (!wrap && nextPos[1] === 0 && nextPos[0] > 0);
			if (canKeepInsertingOnSameLine) {
				nextPos[0]--;
				nextPos[1] = visualLineModel.getLastOffset(nextPos[0]);
			}
			//debug("setNextPosition.nextPos: " + nextPos);
		}			
		var linenum = nextPos[0];
		var offset = nextPos[1];				
		cursorPosition.setPosition(linenum,offset);
	};
		
	//---------------------------------------------------------------------------------------------------
	
	var copy = function() {
		// only performs cut request if selection is not empty
		if (visualSelection.doesRangeExist())
		{
			var range = visualSelection.getSelection();
			copyPasteUndo.copyRange(range);
		}
	};
	
	var paste = function() {
		// only paste if there is something to paste
		if (copyPasteUndo.clipboardHasSomething())
		{
			// if there is a previous selection, delete it
			if (visualSelection.doesRangeExist()) {
				deleteRange();
				visualSelection.clearMarkedSelection(false);
				visualSelection.showRange();
			}

			// cursorPosition is not sufficient, use visualSelection instead
			// if user had a selection, we need visualSelection to figure out whether to paste before or paste after
			var range = visualSelection.getSelection();
			visualSelection.clearMarkedSelection();

			// if the deleted selection was a forward selection, then we can just paste at the start of the selection offset
			/*
			if ((range.endContainer >= range.startContainer) && (range.endOffset >= range.startOffset)) {
				copyPasteUndo.pasteFromClipboard(range.startContainer, range.startOffset);
			}
			// if the deleted selection was a reverse selection, then we have to paste at the end of the selection offset
			else {
				copyPasteUndo.pasteFromClipboard(range.endContainer, range.endOffset);
			}
			*/
			copyPasteUndo.pasteFromClipboard(visualSelection.getLeft()[0], visualSelection.getLeft()[1]);
		}
	};	
	
	var cut = function() {
		// only performs cut request if selection is not empty
		if (visualSelection.doesRangeExist())
		{
			var range = visualSelection.getSelection();

			// calculate the text position within the text block
			// we cannot use visual positional data because they might change during a delete operation (e.g. thru reflow)
			/*
			if ((range.endContainer >= range.startContainer) && (range.endOffset >= range.startOffset)) {
				var editpos = getOffsetFromModel(range.startContainer, range.startOffset);
			}
			else {
				var editpos = getOffsetFromModel(range.endContainer, range.endOffset);
			}
			*/
			var editpos = getOffsetFromModel(visualSelection.getLeft()[0], visualSelection.getLeft()[1]);

			// delete range
			var nextPos = copyPasteUndo.deleteRange(range, true);

			// restore cursor position
			setNextPosition(editpos, true);
			//cursorPosition.setPosition(nextPos[0],nextPos[1]);
		}
	};
	
	var undo = function() {
		copyPasteUndo.restoreDocumentText();
	};
	
	var deleteRange = function () {
		// only performs delete request if selection is not empty
		if (visualSelection.doesRangeExist())
		{
			var range = visualSelection.getSelection();

			// calculate the text position within the text block
			// we cannot use visual positional data because they might change during a delete operation (e.g. thru reflow)		
			var editpos = getOffsetFromModel(visualSelection.getLeft()[0], visualSelection.getLeft()[1]);

			// delete range
			var nextPos = copyPasteUndo.deleteRange(range);

			// restore cursor position
			setNextPosition(editpos, true);
		}
	};

	var insertChar = function(offset, letter) {
		
		basicModel.insertChar(offset, letter);		
	};
	
	var deleteChar = function(offset) {		
		basicModel.deleteChar(offset);	
	};
	
	//---------------------------------------------------------------------------------------------------
	
/*DBG*/	var showLines = function() {	// Ctrl+Space to showLines()
/*DBG*/
/*DBG*/		info("+++++++++++++++++++++++++++++++++++++++++++++++++");
/*DBG*/		var lines = basicModel.getLines();		
/*DBG*/		for (var i = 0; i < lines.length; i++) {
/*DBG*/			var content = lines[i].content;
/*DBG*/			var showLine = content.replace(/\n/g, "\\n").replace(/\t/g, "\\t");
/*DBG*/			info(showLine);
/*DBG*/		}
/*DBG*/		info("+++++++++++++++++++++++++++++++++++++++++++++++++");
/*DBG*/		var pos = visualSelection.getStart();
/*DBG*/		info("Pos Start: " + pos[0] + "," + pos[1]);
/*DBG*/		pos = visualSelection.getEnd();
/*DBG*/		info("Pos End: " + pos[0] + "," + pos[1]);
/*DBG*/		pos = cursorPosition.getPosition();
/*DBG*/		info("Pos Cursor: " + pos[0] + "," + pos[1]);
/*DBG*/		info("Full Text: " + basicModel.getTextContent());
/*DBG*/		info("Clipboard: " + basicModel.getTextContent());
/*DBG*/		info("+++++++++++++++++++++++++++++++++++++++++++++++++");
/*DBG*/	};

	return {
		'init'				: init,
		'setTextContent'	: setTextContent, // should be accessible from the TextModel
		'getTextContent'	: getTextContent,
		'getExtendedContent': getExtendedContent,
		
		'setCssHack'		: setCssHack,

		'getEditLineModel'	: function() { return editLineModel; },
		'getVisualLineModel': function() { return visualLineModel; },
		'setNextPosition'	: setNextPosition,
		'getOffsetFromModel': getOffsetFromModel,

		'getWordRange'		: getWordRange,		
		'copy'				: copy,
		'cut'				: cut,
		'paste'				: paste,
		'undo'				: undo,
		'deleteRange'		: deleteRange,
		'insertChar'		: insertChar,
		'deleteChar'		: deleteChar,
		'showLines' 		: showLines
	};
};

