
// BasicModel: contains the real data (content, lines) and few simple functions
// doesn't handle line lengths (different versions for different uses:
//
//   VisualLineModel: lastOffset (past the content of the line)
//	 EditLineModel: getLastOffset () returns a real index within the line.content


//haipt: new type: ContentFragment, which contains a fragment of the text content, with the same text style across the fragments

// @param editPos is the position in the final text (after generated content has been inserted in). This allows us to handle deletion/insertion content correctly


colorjack.textbox.model.ContentFragment = function(content, fontStyle, imgUrl, width, height) {		
	this.content = content;	
	this.style = fontStyle;		
	
	if (imgUrl!=null && imgUrl.length > 0) {		
		this.content = ' '; //put a special 1-character for the content, so that the cursor can move to before & after the image
		//this.content = '';
		this.isImage = true;
		this.url = imgUrl;
		this.width = width;
		this.height = height;	
	}
	
	this.hasLinefeed = function() {
		if (this.content!=null && this.content!='') {
			return this.content[this.content.length-1] == '\n';
		}
		else return false;
	}
	
	
	//count the characters of content. 
	//We put this into a function so that we can easily update the logic later!
	this.getCharsCount = function() {
		return this.content.length;
	}
	
}

//pseudoElem could be null, :before or :after
//we call it style, as it might contain one or more css style.
colorjack.textbox.model.FragmentStyles = function(ind, pseudoElem, css) {
	this.index = ind; //class member
	this.exOffset = 0; //offset in the extended text, function getContentFragments will set this later!

	this.pseudo = pseudoElem;
	//this.content = "";
	this.fontStyle = "";
	this.width = 0;
	this.height = 0;
	
	//for images
	this.isImage = false;
	this.url = "";
	
	this.css = css; //remember this!
	
	//info('FragmentStyles: ' + ind + ' pseudo:' + this.pseudo + ' css:' + css);

	//then parse the css
	var styles = css.split(';');
	var i;
	for (i = 0; i < styles.length; i++) {
		var style = styles[i];
		
		var matched = false;
		
		//check if this is content style
		var groups = /^\s*content:(.*)$/.exec(style);
		if (groups) {
			matched = true;
			this.content = groups[1];		

			groups = /^\s*url\('(.*)'\)/.exec(this.content);
			if (groups) {
				this.isImage = true;
				this.url = groups[1];				
			}	
			//info('content string: ' + this.content);			
		}		
		if (!matched) {		
			groups = /^\s*font:\s*(.*)$/.exec(style);
			if (groups) {
				matched = true;
				this.fontStyle = groups[1];				
				//info('font style: ' + this.fontStyle);
			}
		}
		if (!matched) {			
			groups = /^\s*width:\s*(.*)$/.exec(style);
			if (groups) {				
				this.width = parseInt(groups[1]);
				matched = true;				
			}			
		}
		if (!matched) {
			groups = /^\s*height:\s*(.*)$/.exec(style);
			if (groups) {
				this.height = parseInt(groups[1]);
				matched = true;				
			}
		}		
	}
	
	//if (this.isImage) info('image url: ' + this.url + ' size: ' + this.width + ' x ' + this.height);
	
	//TODO
	//this.clone = function() {
	//	colorjack.textbox.model.FragmentStyles s = new colorjack.textbox.model.FragmentStyles();
	//}
	
	this.isInsertBefore = function() {
		var res =   this.pseudo.substring(0, 7) == ":before";		
		return res;
	}
	
	this.isInsertAfter = function() {		
		return this.pseudo.substring(0, 6) == ":after";
	}
	
	this.isGeneratedContent = function() {
		return this.isInsertBefore() || this.isInsertAfter();
	}

	//get css representing this fragment style!
	this.getCss = function() {
		var css =  ':nth-char(' + this.index + ')' + this.pseudo + '{';
		if (this.content!="") {
			css+='content:' + this.content +';';
		}
		if (this.fontStyle!="") {
			css+='font:' + this.fontStyle +';';
		}
		css+='}';
		return css;
	}	
}

// BasicModel is used by VisualLineModel and EditLineModel as a property. 
colorjack.textbox.model.BasicModel = function() {
	var lines = []; //the line boxes, which contains inline boxes. The lines will be set by the text wrapper
	var textDomElement = null; //hold the text content
	var emptyDocLines = null;
	
	var cssHack = null;
	//var styles = []; //css styles, after parsing
	var styles = []; //array of fragment style
	
	
	var exContent = ''; //extended content, after adding in the generated content
	
	var defaultFontStyle = '12px arial';


	var getDefaultCssStyle = function() {
		return 'font:' + defaultFontStyle;
	}	


	var init = function(vars) {
		textDomElement = vars.textDomElement;
	};
	
	var getContent = function() {
		return textDomElement.getValue();
	};
	
	var setContent = function(c) {
		textDomElement.setValue(c);
	};
	
	//css pseudo 
	var setCssHack = function(css) { 
		cssHack = css;
		parseCss(css);		
	}
	
	var getCssHack = function() {
		return cssHack;
	}
	
	var getLines = function() { return lines; };	
	var setLines = function(s) { 
		lines = s; 
		exContent = '';
		for (var i = 0; i < lines.length; i++) exContent+=lines[i].getContent();
	};
	
	var getExtendedContent = function( ) { return exContent; }
	
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
	
	
	//parse the css string into array of styles
	//param content is used just to get the content length
	var parseCss = function(css) { 	
		info('parse css: ' + css);

		styles = []; //clear the style array (parent's scope)
			
		var groups = [];
		//var reg = /:nth-char\(\s*(\d*)\s*\)\s*\{([^}]*)}/g;			
		var reg = /:nth-char\(\s*(\d*)\s*\)([^\{]*)\{([^}]*)}/g;			
		var count = 0;
		
		//assume that the index are already sorted
		while (groups) 	{
			groups = reg.exec(cssHack);
			if (groups)
			{
				var ind = parseInt(groups[1], 10);									
				styles.push(new colorjack.textbox.model.FragmentStyles(ind, groups[2], groups[3]));
				
				
			}
		}
	}
	
	//split the fragments by carriage return (if any)
	var splitHardLines = function(fragments) {
		var res = [];
		var i, j;
		for (i = 0; i < fragments.length; i++)  {
			//split the fragments into hardlines (separated by carriage return)			
			var hardlines = fragments[i].content.split('\n');
			
			//info('content = ' + fragments[i].content + ' hard lines count: ' + hardlines.length);
			
			if (hardlines.length == 1) {
				res.push(fragments[i]);
			}
			else { //more than one line!				
				for (j = 0; j < hardlines.length; j++) {
					//info('\t line length = ' + hardlines[j].length);	
					var line = hardlines[j] + (j < hardlines.length -1? "\n" : ""); //add back the linefeed
					var newFragment = new colorjack.textbox.model.ContentFragment( line, fragments[i].style); 														
					res.push(newFragment);
				}	
			}			
		}
		
		return res;
	}
	
	//haipt
	//break the text into fragments based on pseudo-selectors AND then new-line character
	var getContentFragments = function()	{
		var fragments = [];
		
		var content = getContent();		
		
		var exOffset = 0;
		
		if (styles.length == 0) //no fragment at all!?
		{
			//TODO: handle this correctly!
			fragments.push(content);			
		}
		else
		{
			//first, split by the css pseudo code
			
			//make an Default style for the first fragment
			if (styles[0].index > 0)
			{
				var nextInd = styles[0].index;
				if (styles[0].isInsertAfter()) nextInd++;				
				var frag = new colorjack.textbox.model.ContentFragment(content.substring(0, nextInd), defaultFontStyle);
				fragments.push(frag); //default?
				exOffset+=frag.getCharsCount();
			}
			
			var i;
			
			for (i = 0; i < styles.length; i++)
			{
				styles[i].exOffset = exOffset;
				
				if (styles[i].isGeneratedContent()) {					
					var text = styles[i].content;
					//info('insert: '  + text +  ' style = ' + styles[i].fontStyle);
					
					var fontStyle = styles[i].fontStyle;
					if (fontStyle=="") { //no font style specified for this -> use the current (non-generated) one!
						//if (i > 0) fontStyle = styles[i-1].fontStyle;
						var j = i-1;
						while (j >= 0 && styles[j].isGeneratedContent()) j--;
						if (j>=0) fontStyle = styles[j].fontStyle;
						else fontStyle = defaultFontStyle;
					}		
					frag = new colorjack.textbox.model.ContentFragment(text, fontStyle, styles[i].url, styles[i].width, styles[i].height);
					fragments.push( frag);
					exOffset+=frag.getCharsCount();
				}
				
				//then from this to the next fragment				
				var nextInd;
				
				if (i + 1 < styles.length) {
					nextInd = styles[i+1].index;
					if (styles[i+1].isInsertAfter()) {
						nextInd++;
					}
				}
				else nextInd = content.length; //last fragment!
				
								
				var text = content.substring(styles[i].isInsertAfter()? styles[i].index + 1: styles[i].index, nextInd);									
				//info('isInsertAfter? ' + styles[i].isInsertAfter() + ' text fragment: ' + text);
				var fontStyle = styles[i].fontStyle;				
				if (styles[i].isGeneratedContent()) {
					//resume the style before that!
					var j = i-1;
					while (j >= 0 && styles[j].isGeneratedContent()) j--;
					if (j>=0) fontStyle = styles[j].fontStyle; 
					else fontStyle = defaultFontStyle;
					
				}
				
				frag = new colorjack.textbox.model.ContentFragment(text, fontStyle);
				fragments.push( frag);
				exOffset+=frag.getCharsCount();
				
			}									
		}
		
		
		
		//then we split the fragments by carriage return
		return splitHardLines(fragments);		
	}
	
	var isEmptyDocument = function() {
		return (getContent().length === 0);
	};
	
	// function unused, and emptyDocLines undefined
	var setEmptyDocLines = function(d) {
		emptyDocLines = d;
	};

	var getLastLine = function() {
		return isEmptyDocument()? null: getLine(getLineCount()-1);
	};
	
	/*
	var getVisibleLength = function() {
		var sum = 0;
		for (var i = 0; i < lines.length; i++) {
			//sum += lines[i].content.length;
			sum+=lines[i].getContent().length;
		}
		return sum;
	};
	*/

	var hasHardBreak = function(container) {
		var getLastCharInLine = function(container) {
			var line = getLine(container);					
			var str = line.getContent();
			var ch = (str.length === 0)? null : str.substr(str.length-1);
			return ch;
		};
		var ch = getLastCharInLine(container);
		var hard = (ch == '\n');
		return hard;
	};
	
	//haipt new function
	//move the insert char here so that we can shift the css styles position as well!
	var insertChar = function(exOffset, letter) { 
		//info('insertChar pos = ' + pos);
		//first, shift the style
		var i;
		for (i = 0; i < styles.length; i++) {
			if (styles[i].exOffset >= exOffset) styles[i].index++;
		}
		
		var offset = getOriginalOffset(exOffset);
		var text = getContent();
		var result = text.substring(0, offset) + letter + text.substring(offset);
		setContent(result);
		
		//then shift the css styles accordingly
		//var styles = parseCss(cssHack);
		/*
		var i = 0;
		for (i = 0; i < styles.length; i++) { 
			if (styles[i].index >= pos) 
				styles[i].index++;
		}
		*/		
		//displayStyles();
	}
	
	var getStyles = function() {
		return styles;
	}
	
	//display the styles array!
	var displayStyles = function() {
		for (var i = 0; i < styles.length; i++) {
			info('style[' + i + '] = ' + styles[i].index + ' isImage? ' + styles[i].isImage);
		}
	}
	
	//remove a style given its index
	var removeStyle = function(ind) {
		var s = [];
		for (i = 0; i < styles.length; i++) 
			if (i!=ind) s.push(styles[i]);
		styles = s;
	}
	
	//haipt new function
	//move the delete char here so that we can shift the css styles position as well!
	var deleteChar = function (exOffset) { 
			//first, shift the css style!
			var i;
			for (i = 0; i < styles.length; i++) {
				if (styles[i].exOffset > exOffset) {
					styles[i].index--;
				}
				else if (styles[i].exOffset == exOffset && styles[i].isImage) {
					//delete the whole thing!
					removeStyle(i);
					return;
				}
			}
			
			var offset = getOriginalOffset(exOffset);
			var text = getContent();
			var result = text.substring(0, offset) + text.substring(offset+1);
			setContent(result);
	}
	
	//insert a string (content) into a given position. We use this for copy/paste operation so we need to copy the style of the original text as well.
	//param s is the styles for the content
	var insertContent = function(exOffset, content, s) {
		var text = getContent();
		
		var offset = getOriginalOffset(exOffset);
		var result = text.substring(0, offset) + content + text.substring(offset);
		setContent(result);
		
		//then insert the styles array!
		var newStyles = [];
		var i;
		var inserted = false;
		for (i = 0; i < styles.length; i++) {
			if (styles[i].exOffset < exOffset) {
				newStyles.push(styles[i]);	
				
				var nextInd;
				if (i < styles.length - 1) nextInd = styles[i+1].exOffset;
				else nextInd = result.length; //end of the new text //TODO: check this!
				
				if (nextInd >= offset) {
					//insert all the new styles in here!
					var j;
					for (j = 0; j < s.length; j++) {
						newStyles.push(new colorjack.textbox.model.FragmentStyles(s[j].index + offset, s[j].pseudo, s[j].css)); //TODO: should use clone instead!
					}
					
					if (nextInd > offset)
						//resume back to current format after new styles
						newStyles.push(new colorjack.textbox.model.FragmentStyles(offset + content.length, styles[i].pseudo, styles[i].css)); //TODO: should use clone instead!
				}
			}
			else {
				styles[i].index+=content.length;
				newStyles.push(styles[i]);				
			}
			/*
			else { //equal pos
				//We just take it out first (i.e. do not add it back to the styles array)
				//TODO: consider case of generated content!
			}
			*/
		}
		
		styles = newStyles;	
	}	
	
	//delete the content given the start & end extended offset
	var deleteContent = function(exStart, exEnd) {
		//info('delete content from: ' + exStart + ' -> ' + exEnd);
				
		var start = getOriginalOffset(exStart);
		var end = getOriginalOffset(exEnd);
		
		//update the text content!
		var text = getContent();
		var result = text.substring(0, start) + text.substring(end);
		setContent(result);
		
		//remove the styles in between
		var newStyles = [];
		var i;
		var inserted = false;
		for (i = 0; i < styles.length; i++) {
			if (styles[i].index < start) {
				newStyles.push(styles[i]);
			}
			else if (styles[i].index < end) { //in between!
				var nextInd;
				if (i < styles.length - 1) nextInd = styles[i+1].index;
				else nextInd = text.length; //length of the original text
				if (nextInd > end) {
					//use this style for the text from start position
					newStyles.push(new colorjack.textbox.model.FragmentStyles(start, styles[i].pseudo, styles[i].css));
				}
			}
			else { //shift it!
				styles[i].index-=(end-start);
				newStyles.push(styles[i]);				
			}
		}
		styles = newStyles;		
	}
	
	var copyText = function(exStart, exEnd) {
		var start = getOriginalOffset(exStart);
		var end = getOriginalOffset(exEnd);
		return getContent().substring(start, end);
	}
	
	
	var copyStyles = function(exStart, exEnd) {
		var s = [];
		var i;
		var start = getOriginalOffset(exStart);
		
		for (i = 0; i < styles.length; i++) {			
			if (s.length == 0) { //no style found yet -> we start from somewhere in the  middle of the style
				if (styles[i].exOffset > exStart) //put the previous style in as the starting style					
					if (i > 0)
						s.push(new colorjack.textbox.model.FragmentStyles(0, styles[i-1].pseudo, styles[i-1].css));
					else
						s.push(new colorjack.textbox.model.FragmentStyles(0, "", getDefaultCssStyle()));
			}
			
			if (styles[i].exOffset >=exStart && styles[i].exOffset < exEnd) {
				s.push(new colorjack.textbox.model.FragmentStyles(styles[i].index - start, styles[i].pseudo, styles[i].css));		
			}			
		}		
		return s;
	}
	
	//convert from the extended offset to the original text offset, used in insertion/deletion
	//extended offset includes length of generated content, whereas original offset does not
	var getOriginalOffset = function(exOffset) {
		var i;		
		var actual = 0;
		var len = 0;
		
		var offset = exOffset;
		var i;
		for (i = 0; i < styles.length; i++) {
			if (styles[i].exOffset >= exOffset) break;
			else if (styles[i].isGeneratedContent()) {
				offset--;
			}
		}
		
		return offset;	
	}
	
	
	return {
		'init'				: init,
		'getContent'		: getContent,
		'getLines'			: getLines,
		'setLines'			: setLines,
		'setEmptyDocLines'	: setEmptyDocLines,
		'getTextContent'	: function() { return getContent(); },
		'setTextContent'	: function(t) { setContent(t); },
		'getExtendedContent' : getExtendedContent,
		//haipt
		'setCssHack'		: setCssHack,
		'getCssHack'		: getCssHack,
		'getContentFragments'	: getContentFragments,		
		'getLineCount'		: getLineCount,
		'getLine'			: getLine,
		'getLastLine'		: getLastLine,
		//'getVisibleLength'	: getVisibleLength,
		'hasHardBreak'		: hasHardBreak,
		'isEmptyDocument'	: isEmptyDocument,
		'copyText'			: copyText,
		'copyStyles'		: copyStyles,
		//'extractStyles'		: extractStyles,
		'insertChar'		: insertChar,
		'deleteChar'		: deleteChar,
		'insertContent'		: insertContent,
		'deleteContent'		: deleteContent,
		'getStyles'			: getStyles,
		'getOriginalOffset'		: getOriginalOffset
	};
};


//use to convert cursor position to the actual position in the content text.
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
			len = line.getContent().length;		
		}			
		return len;
	};
	
	//return the offset in the extended text (after inserting generated content)
	var getExtendedOffset = function(container, offset) {
		var idx = 0;
		if (!basicModel.isEmptyDocument()) {	
			if ((container < 0 || container >= basicModel.getLineCount()) ||
				(offset < 0 || offset > getLineLength(container))) {
				colorjack.debug.programmerPanic("getTextOffset(): invalid pos: " + container + "/" + offset);
			}			
			var sum = 0;
			var	i;
			for (i = 0; i < container; i++) {
				sum += getLineLength(i);
			}			
			idx = sum+ offset;
		}
		return idx;
	};
	
	//get position in the textbox from the extended offset
	var getPosition = function(exOffset) {
		var pos = [0,0]; 
		if (!basicModel.isEmptyDocument()) {
		
			var text = basicModel.getExtendedContent();			
			if (exOffset > text.length) { // We shouldn't get to this stage
				colorjack.debug.programmerPanic("EditLineModel.getPosition(): We are way off! " + charOffset);
			}
			else {		
				if (exOffset == text.length) { //end of text
					var li = basicModel.getLineCount()-1;
					var off = getLineLength(li);
					return [li, off];
				}				
				var offset = exOffset;
				var container = 0;
				var len = 0;
				
				var i;
				for (i = 0; i < basicModel.getLineCount(); i++) {
					len = getLineLength(i);
					if (offset < len) {
						container = i;
						break;
					}
					offset -= len;
					container++;
					//debug("Ith: " + i + " : " + container + " : " + offset);
				}
				
				if (offset < 0) { //we run outside
					colorjack.debug.programmerPanic("EditLineModel.getPosition(): We are way off! " + exOffset);
				}
				
				pos = [container,offset];
			}
		}
		return pos;
	};
	
	return {
		'init'			: init,
		'getLineLength'	: getLineLength,		
		'getExtendedOffset'	: getExtendedOffset,
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
	//count all characters on a line except the linefeed character (as it does not show up)
	var getLineLength = function(container) {
		if (container === undefined) { colorjack.debug.programmerPanic("getLineLength(): Need container!"); }
		
		var len = 0;
		var line = getLine(container);
		if (line) {
			len = line.getContent().length;
			if (basicModel.hasHardBreak(container)) {
				len--; // Skip the "newlines", visually they don't show up.
			}
		}
		return len;
	};

	// Much needed for navigation
	//get the last offset on a line
	var getLastOffset = function(container) {
		var len = getLineLength(container);
		return (len===0)?0:len;
	};	
	
	// Much needed for navigation
	// Get the last position of the whole text
	var getLastPosition = function() {
		var last = [0,0];
		if (!basicModel.isEmptyDocument()) {
			var lastLine = basicModel.getLineCount()-1;			
			var ch = getLastOffset(lastLine);
			last = [lastLine, ch];	// equivalent to "end of document"
		}
		return last;
	};
	
	/*
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
	*/
	

	return {
		'init'				: init,
		'getLineCount'		: function() { return basicModel.getLineCount(); },
		'getLastOffset'		: getLastOffset,
		'getLastPosition'	: getLastPosition,
		'getLineLength'		: getLineLength
		//'convertPositionFromViewToEdit'	: convertPositionFromViewToEdit		
	};
};
