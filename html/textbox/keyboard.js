
colorjack.keyboard.Keyboard = function() {
	//----------------------------------------------------------------------
	var keyEditor = new colorjack.keyboard.KeyEditor();
	var navig = new colorjack.keyboard.KeyNavigator();

	var cursor = null;
	var textModel = null;
	var visualSelection = null;
	var visualTextBox = null;
	
	var init = function(vars) {
		try {
			keyEditor.init(vars);
			navig.init(vars);
			
			cursor = vars.cursor;
			textModel = vars.textModel;
			visualSelection = vars.visualSelection;
			visualTextBox = vars.visualTextBox;
			
			colorjack.debug.checkNull("Keyboard", [cursor, textModel, visualSelection, visualTextBox, keyEditor, navig]);
			
			onkey(document); //onkey(vars.canvasBox); // cannot bind keystrokes against div, only against document
		}
		catch (e) {
			colorjack.debug.programmerPanic("Keyboard. Initialization error: " + e.name + " = " + e.message);
		}
	};
	//----------------------------------------------------------------------

	// Warning: hard coded key values work only against Firefox, not against Webkit
	// Need some kind of "browser" / "javascript" engine mapper:
	// webkit.keys

	var keys = {
		'10': function(k) { // carriage return
			keyEditor.enterKey(k);
		},
		'13': function(k) { // new line
			keyEditor.enterKey(k);
		},
		'191': function(k) { // forward slash
			return false; // Stop firefox Quickfind
		},
		'222': function(k) { // apostrophe
			return false; // Stop firefox Quickfind
		},
		'36': function(k) {
			navig.home(k);
		},
		'35': function(k) {
			navig.end(k);
		},
		'33': function(k) {
			navig.pageUp(k);
		},
		'34': function(k) {
			navig.pageDown(k);
		},
		'37': function(k) {
			navig.arrowLeft(k);			
			return false;
		},
		'38': function(k) {
			navig.arrowUp(k);
			return false;
		},
		'39': function(k) {
			navig.arrowRight(k);
			return false;
		},
		'40': function(k) {
			navig.arrowDown(k);				
			return false;
		},
		'46': function(k) {
			keyEditor.deleteKey(k);
			return false;
		},
		'45': function(k) {
			keyEditor.insertKey(k);
			return false;
		}
	};

	var keydowned = false;
	var BACKSPACE = 8;
	var TAB = 9;
	var CTRL_C = 99;
	var CTRL_X = 120;
	var CTRL_V = 118;
	var CTRL_Z = 122;
	
	var handleKeyPress = function(e) {
		e = window.event || e;

		if (keydowned) {
			keydowned = false;
			if(e.charCode != 32) {
				return false;
			}
		}
		
		if (e.keyCode == TAB) { keyEditor.insertChar('\t'); e.preventDefault(); }
		
		if (e.ctrlKey) {		
			// info("Ctrl + Char code: " + e.charCode);
			// Chrome Webkit: using different charCode... Ctrl+copy: 24!
		
			// Control-Edit keys
			if (e.charCode == CTRL_C) { cursor.hideCursor(); textModel.copy(); }
			if (e.charCode == CTRL_X) { cursor.hideCursor(); textModel.cut(); visualSelection.clearMarkedSelection(false); }
			if (e.charCode == CTRL_Z) { cursor.hideCursor(); textModel.undo(); visualSelection.showRange(); }

			if (e.charCode == CTRL_V) { // Paste
				cursor.stopBlink();

				/* TODO: if there is a previous selection, delete it */
				if (0 && visualSelection.doesRangeExist()) { // 
					cursor.hideCursor();
					textModel.cut(); // TODO: need to buffer somewhere else! conflict with next paste()
					visualSelection.clearMarkedSelection(false);
				}
				visualSelection.clearMarkedSelection();
				textModel.paste();
				visualSelection.showRange();
			}
			if (e.charCode === 32) { textModel.showLines(); } // Debug command: Ctrl+space	/*DBG*/
		}

		if (e.ctrlKey || e.altKey) {
			return true;
		}
		
		var font = visualTextBox.getFont();
		var fontLetters = font.getFontLetters();
		
		if (e.charCode && e.charCode in fontLetters) {				
			var letter = String.fromCharCode(e.charCode);
			keyEditor.insertChar(letter);
		}
		
		return false;
	};
	
	var handleKeyDown = function(e) {
		e = window.event || e;

		if (!(e.shiftKey || e.ctrlKey)) {
			visualSelection.clearMarkedSelection();
		}
		if (e.keyCode in keys) {
			e.preventDefault();
			keydowned = true;
			return keys[e.keyCode](e); 
		}		
		else if (e.keyCode == BACKSPACE || e.charCode == 104) {
			keyEditor.backspaceKey(e);
			e.preventDefault();
		}
		return true;
	};

	var onkey = function(doc) {
		doc.onkeypress = function(e) {
			var comp = colorjack.textFocusManager.getCurrentTextBox();
			if (comp !== null) {
				var kb = comp.getKeyboard();
				kb.handleKeyPress(e);
				e.preventDefault();
			}
		};
		doc.onkeydown = function(e) {
			var comp = colorjack.textFocusManager.getCurrentTextBox();
			if (comp !== null) {
				var kb = comp.getKeyboard();
				return kb.handleKeyDown(e);
			}
			return false;
		};
	};
	
	return {
		'init'				: init,
		'handleKeyPress'	: handleKeyPress,
		'handleKeyDown'		: handleKeyDown,
		'keyEditor'			: keyEditor,
		'keyNavigator'		: navig,
		'bindKeyboard'		: function(doc) { onkey(doc); }
	};
};
