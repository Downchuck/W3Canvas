// Font object is "owned" by the VisualTextBox.

w3canvas.component.TextBox = function(canvasBox, textDomElement, uniqueId, testing) {
	//----------------------------------------------------------------------
	var initialized = false;
	
	if (canvasBox === undefined || canvasBox === null) {
		w3canvas.debug.programmerPanic("Invalid TextBox() constructor. Missing canvasBox parameter!");
	}
	
	var basicModel		= new w3canvas.textbox.model.BasicModel();
	var cursor			= new w3canvas.textbox.ui.cursor.Cursor();
	var cursorPosition	= new w3canvas.textbox.ui.cursor.CursorPosition();
	//var font			= new w3canvas.textbox.Font();
	var inputScrolling	= new w3canvas.textbox.ui.InputScrolling();
	var keyboard		= new w3canvas.keyboard.Keyboard();
	var mouse			= new w3canvas.textbox.mouse.Mouse();
	var textModel		= new w3canvas.textbox.model.TextModel();
	var visualSelection	= new w3canvas.textbox.ui.VisualSelection();
	var visualTextBox	= new w3canvas.textbox.VisualTextBox();
	
	var textBoxId		= uniqueId;
	
	
	
	if (!textDomElement) {	// For standalone TextBox without an HTMLElement (input/textarea), needed for automated testing
		textDomElement = new w3canvas.css.BoxModel();
		textDomElement.value = "";
		textDomElement.setValue = function(v) { this.value = v; };
		textDomElement.getValue = function()  { return this.value; }
	}
	
	var init = function() {
		if (!initialized) {			
			initialized = true;
			
			/*
			if (font === undefined || font === null) {
				w3canvas.debug.programmerPanic("Need to call TextBox.setFont() before w3canvas.component.TextBox.init()!");
				return;
			}
			*/
			
			if (testing) {
				w3canvas.graphicsLib.setTestingMode(true);
				visualSelection.setTestingMode(true);
				visualTextBox.setTestingMode(true);
				cursor = new w3canvas.textbox.ui.cursor.DummyCursor();
			}			
			var ctx = canvasBox.getContext('2d');
			
			
			var vars = {
				'basicModel'		: basicModel,
				'canvasBox' 		: canvasBox,
				'context'   		: ctx,
				'cursor'    		: cursor,
				'cursorPosition'	: cursorPosition,
				//'drawString'		: font.drawString,
				//'font'				: font,
				'inputScrolling'	: inputScrolling,
				'textBoxId'			: textBoxId,
				'textDomElement'	: textDomElement,
				'textModel'			: textModel,
				'visualSelection'	: visualSelection,
				'visualTextBox'		: visualTextBox
			};

			// First opportunity to change the size of the canvasBox acc. to # visible of lines
			
			vars.boxModel = visualTextBox.init(vars);			
			basicModel.init(vars);
			cursor.init(vars);
			cursorPosition.init(vars);
			inputScrolling.init(vars); 
			keyboard.init(vars);
			mouse.init(vars);
			textModel.init(vars);
			visualSelection.init(vars);
		}
	};
	
	
	init();
	
	
	//----------------------------------------------------------------------
	var getValue = function()	{ return textModel.getTextContent(); };
	var setValue = function(v, cssHack) {
		//alert('textbox setvalue');
		
		//FIXME: restore this!	
		//console.log('FIXME: input scrolling = ' + inputScrolling.isEnabled());	
		
		/*
		if (inputScrolling.isEnabled()) {
			v = v.replace(/\n/g, ""); // Filter out the newlines
		}
		*/
		textModel.setTextContent(v); 
		if (cssHack!=null)
			textModel.setCssHack(cssHack);
		visualTextBox.drawBox();
	};
	
	

	// HTML/Javascript TextArea
	var focus = function() {
		cursor.startBlink();		
		var textFocusManager = w3canvas.textFocusManager;
		textFocusManager.setFocusedTextBoxId(textBoxId);
	};

	var blur = function() {
		visualSelection.clearMarkedSelection(true);
		cursor.stopBlink();
		if (showCursorAfterLosingFocus) {
			cursor.showCursor(true);
		}
		else {
			cursor.hideCursor();
		}
		var textFocusManager = w3canvas.textFocusManager;
		textFocusManager.unsetCurrentTextBoxId(textBoxId);
	};

	var select = function() {			// select all the content
		visualSelection.selectAll();
		visualSelection.showRange();
	};

	
	var setFont = function(f) 
	{
		visualTextBox.setFont(f);
	};
	
	var getFont = function() {
		return visualTextBox.getFont();
	};

	//----------------------------------------------------------------------
	
	return {
		'getId'		: function() { return textBoxId; },
		'getFont'	: getFont,
		'setFont'	: setFont,
		'setInput'	: function(t) { inputScrolling.setEnabled(t); },
	// --------------------------------------------------
		// HTML TextArea: public methods
		'setValue'	: setValue,
		'getValue'	: getValue,		
		'select'	: select,
		'focus'		: focus,
		'blur'		: blur,
	// --------------------------------------------------
		'setStyle'		: function(s) { visualTextBox.setBoxStyle(s); },	// needed for customization
		'showCursor'	: function() { cursor.showCursor(); },			// needed for calling the Timer

		// API needed for testing
		'getMouse'		: function() { return mouse; },
		'getKeyboard'	: function() { return keyboard; },

		'getCursorPos'	: function() { return cursorPosition.getPosition(); },
		'setCursorPos'	: function(container, offset) { cursorPosition.setPosition(container, offset); },

		'setSelectionRange' : function(range) {
			visualSelection.setStart(range.startContainer, range.startOffset);
			visualSelection.setEnd(range.endContainer, range.endOffset);
		},
		'getSelectionRange' : function() { return visualSelection.getSelection(); },

		'cut' 	: function() { textModel.cut(); },
		'copy'	: function() { textModel.copy(); },
		'paste'	: function() { textModel.paste(); }
	};
};
