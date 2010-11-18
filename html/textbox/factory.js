// ----------------------------------------------------------------------------------------------------------------
// Global singletons
//

colorjack.textbox.ui.graphics.GraphicsLib = function() {
	var DEBUG_GRAPHICS = false;
	
	var testingMode = false;	// It should be at the canvas-level: DummyCanvas (no-op for testing)

	var createBufferImage = function(x,y,w,h,image) {
  	var result = null;
		try {
  		if (testingMode) {	return {}; }

  		if (DEBUG_GRAPHICS && w > 4) { // Don't show the cursor size
  			info("createBufferImage(): " + x + "," + y + " - " + w + "," + h);
  		}

  		var canvas = document.createElement('canvas');
  		canvas.width = w;
  		canvas.height = h;
  		canvas.style.width = w + "px";
  		canvas.style.height = h + "px";

  		var context = canvas.getContext('2d');

  //		x = Math.round(x); // negative value or conflict with clip area!
  //		y = Math.round(y);
  //		w = Math.round(w);
  //		h = Math.round(h);

  		if (context && x >= 0 && y >= 0 && w > 0 && h > 0) {
  			context.drawImage(image, x,y,w,h, 0,0,w,h);
  			result = context.canvas;
  		} else if (DEBUG_GRAPHICS) {
  			throw new Error("createBufferImage(): Some negative value?! Probably some values are not integer!");
  		}
		} catch (e225) {
			throw new Error("createBufferImage() " + e225.message);
		}
  	return result;
	};
	
	var restoreBufferImage = function(ctx,buffer,x,y,w,h) {
		if (testingMode) { return false; }
		
		var result = false;
		
		try {
  		if (DEBUG_GRAPHICS && w > 4) { // Don't show the cursor size
  			info("restoreBufferImage(): " + x + "," + y + " - " + w + "," + h);
  		}

  		if (ctx && buffer && x >= 0 && y >= 0 && w > 0 && h > 0) {
  			ctx.save();
  			ctx.globalCompositeOperation = "copy";
  //			x = Math.round(x);
  //			y = Math.round(y);
  //			w = Math.round(w);
  //			h = Math.round(h);
  			ctx.drawImage(buffer, 0, 0, w, h, x, y, w, h);
  			ctx.restore();
  			result = true;
  		}	else if (DEBUG_GRAPHICS) {
  			throw new Error("restoreBufferImage(): Some negative value! Probably some values are not integer!");
  		}
		} catch (e226) {
			throw new Error("restoreBufferImage() " + e226.message);
		}
		
		return result;
	};

	return {
		'setTestingMode':		function(t) { testingMode = t; },
		'restoreBufferImage':	restoreBufferImage,
		'createBufferImage':	createBufferImage
	};
};

colorjack.boxmodel.Factory = function() {
	return {
		'createBox'					: function() 	{ return new colorjack.boxmodel.Box(); },
		'createRange'				: function() 	{ return new colorjack.boxmodel.Range(); },
		'createNode'				: function(id) 	{ return new colorjack.boxmodel.Node(id); },
		'createDocumentFragment'	: function(c,r)	{ return new colorjack.boxmodel.DocumentFragment(c,r); },
		'createDocumentTree'		: function(c) 	{ return new colorjack.boxmodel.DocumentTree(c); },
		'createBoxTree'				: function() 	{ return new colorjack.boxmodel.BoxTree(); }
	};
};

colorjack.component.TextBoxFactory = function() {
	var textBoxes = [];
	var uniqueId = 0;
	
	var createTextBox = function(canvasBox, domElement) {		
		var t = new colorjack.component.TextBox(canvasBox, domElement, uniqueId, false /* automated Test (Stop drawing and deactivate blinking activity) */);
		//colorjack.debug.programmerPanic('createTextBox.2');
		uniqueId++;
		textBoxes.push(t);
		return t;
	};
	
	var getTextBox = function(id) {
		if (0 <= id && id < textBoxes.length) {
			return textBoxes[id];
		}
		else {
			return null;
		}
	};
	
	return {
		'createTextBox':	createTextBox,
		'getTextBox':		getTextBox
	};
};

colorjack.component.TextFocusManager = function(tbf) {
	var textBoxFactory = tbf;
	var currentTextBoxId = -1; // ID of the TextBox with the keyboard focus, -1: none with focus
	
	var getCurrentTextBox = function() {
		var t = textBoxFactory.getTextBox(currentTextBoxId);
		return t;
	};
	
	var getCurrentTextBoxId = function() {
		return currentTextBoxId;
	};
	
	var unsetCurrentTextBoxId = function(id) {
		currentTextBoxId = -1;
	};

	var setFocusedTextBoxId = function(id) {
		if (id != currentTextBoxId) {
			var textbox = null;
			
			if (currentTextBoxId != -1) {
				textbox = getCurrentTextBox();
				textbox.blur(); // lose the focus (show cursor but stop blinking)
			}
			currentTextBoxId = id;
			textbox = getCurrentTextBox();
			textbox.focus(); // start blinking
		}
	};
	
	return {
		'setFocusedTextBoxId' : setFocusedTextBoxId,
		'unsetCurrentTextBoxId' : unsetCurrentTextBoxId,
		'getCurrentTextBoxId' : getCurrentTextBoxId,
		'getCurrentTextBox' : getCurrentTextBox
	};
};

colorjack.component.ClipboardService = function() {
	var clipboardText = "";	// Last text buffer ("selection copy" or last "selection delete", except for char operations: Del, Backspace)
	var styles = [];
	
	var setClipboardText = function(t) {
		clipboardText = t;
	};

	var getClipboardText = function() {
		return clipboardText;
	};
	
	
	//remember the style of the text as well!
	var setClipboardStyles = function(s) { 	
		styles = s;
	}
	
	var getClipboardStyles = function() {
		return styles;
	}
	
	var isEmpty = function() {
		var empty = (clipboardText === null || clipboardText === "");
		return empty;
	};
	
	return {
		'setClipboardText' : setClipboardText,
		'getClipboardText' : getClipboardText,
		'setClipboardStyles': setClipboardStyles,
		'getClipboardStyles': getClipboardStyles,
		'isEmpty' : isEmpty
	};
};

// Global singletons (factories and global services) Could use JSON format to enforce Singleton pattern, but that's not necessary.

colorjack.graphicsLib		= new colorjack.textbox.ui.graphics.GraphicsLib();
colorjack.clipboardService	= new colorjack.component.ClipboardService();
colorjack.boxModelFactory	= new colorjack.boxmodel.Factory();
colorjack.textBoxFactory	= new colorjack.component.TextBoxFactory();
colorjack.textFocusManager	= new colorjack.component.TextFocusManager(colorjack.textBoxFactory);

//-------------------------------------------------------------------------------------------------------
/*
function isWordSeparator(ch) {
	return (ch == ' ' || ch == '\t' || ch == '\n' || ch == ',' || ch == ';' || ch == '.');
}

function debuginfo(v) {
	if (typeof(v) == 'object') {
		var z='';
		for (var i = 0; i < v.length; i++) {
			z+=i+':'+v[i]+', ';
		}
		z=z.substr(0,z.length-2);
		return z;
	}
	return "v is not an object";
}

function programmerPanic(msg) {
	info("PANIC: " + msg);
}


function checkNull(fn, args) {
	if (args.length > 0) {
		for (var j = 0; j < args.length; j++) {
			if (args[j] === null) {
				throw new Error("Arg[" + j + "] is null in " + fn + ".init()");
			}
		}
	}
}
*/