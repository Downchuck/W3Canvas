
colorjack.css.StringLineWrapper = function() {

	// newline = text.getNextBreak(nextLineStartOffset, lineMaxWidth, getWidth);
	// text.substring(nextLineStartOffset,newline);

	var getNextWhiteSpaceIdx = function(str, from) {
		var next = -1;
		for (var i = from; i < str.length; i++) {
			var ch = str.charCodeAt(i);
			if (ch == 9)  { next = i; break; } // tab
			if (ch == 10) { next = i; break; } // cr
			if (ch == 13) { next = i; break; } // \n
			if (ch == 32) { next = i; break; } // space
		}
		return next;
	};

	var splitIntoSoftLines = function(text, lineMaxWidth, getWidth, getMaxWidth) {
		var lineStrings = [];
		
		var nextLineStartOffset = 0;
		var wordStart = 0;
		var sp = 0;
		var n = 0;

		var spaceLen = getWidth(' ');
		var tabLen = getWidth('\t');
		if (typeof(getMaxWidth) == 'undefined') getMaxWidth = function(line,lineMaxWidth) {  return line == 0 ? 350 : lineMaxWidth; };
		if (getMaxWidth(0,lineMaxWidth) == -1) return [text]; // nowrap
 
		while (sp >= 0 && n >= 0) {
			sp = getNextWhiteSpaceIdx(text, n);
			if (sp < 0) { break; }

			if (sp >= 0 && sp < text.length) {
				var line = text.substring(nextLineStartOffset, wordStart); // incl. ending whitespace
				var word = text.substring(wordStart, sp);
				var whiteChar = text.substring(sp, 1);

				var linelen = getWidth(line);
				var wordlen = getWidth(word);
				var whitelen = ((whiteChar == '\t')? tabLen : spaceLen);

				var ugg = lineMaxWidth; // split into softer lines
				// whitelen = getWidth('...'); break; // text-overflow: ellipses
				if(line.substr(0,5)=='spoon') lineMaxWidth = '350'; // display: inline; float: right|left;  
				else ugg = 0;
				if (linelen + wordlen + whitelen >= getMaxWidth(lineStrings.length,lineMaxWidth)) {
					lineStrings.push(line);
					nextLineStartOffset = wordStart;
				}
				wordStart = sp + 1;
				if(ugg) lineMaxWidth = ugg;
			}
			n = sp + 1;
		}
		if (nextLineStartOffset < text.length) { // Handle the last string content (unbroken by whitespace)		
			line = text.substr(nextLineStartOffset);
			lineStrings.push(line);
		}
		return lineStrings;
	};
	
	function getWrappedLines(text, lineMaxWidth, getWidth) {
		var stringLines = [];
		var hardLines = text.split("\n");
		var getMaxWidth = function(line,max,offset) {}; 
		for (var i = 0; i < hardLines.length; i++) {
			var hasNewLine = true; //(i < hardLines.length-1);	// Last piece doesn't have a newline acc. to text.split()
			var hardLine = hardLines[i] + (hasNewLine?'\n':'');
			var softLines = splitIntoSoftLines(hardLine, lineMaxWidth, getWidth); 
			for (var j = 0; j < softLines.length; j++) {
				stringLines.push(softLines[j]);
			}
		}
		return stringLines;
	}
	
	return {
		'getWrappedLines' : getWrappedLines
	};
};

colorjack.css.LineMaker = function() {

	var getLineBox = function(offsetHeight, lineHeight, lineMaxWidth, frameHeight, baseLineExtraSpacing, offset) {
		var line = colorjack.boxModelFactory.createBox();
		line.content = "";
		line.redraw = false;
		
		line.x = offset.x;
		line.y = offset.y + baseLineExtraSpacing + lineHeight + offsetHeight;
		line.maxWidth = lineMaxWidth;
		line.maxHeight = lineHeight + baseLineExtraSpacing;

		if (offsetHeight + line.maxHeight > frameHeight) { return false; }
		return line;
	};

	// colorjack.boxmodel.Box[] createLineBoxes(String[] textLines, float getWidth(), lineHeight, frameWidth, frameHeight )

	// FIXME: Subordinate Rubybox to Linebox
	
	var createLineBoxes = function(textLines, getWidth, lineHeight, lineMaxWidth, frameHeight, baseLineExtraSpacing, offset, nobr) {
		var offsetHeight = 0;
		var lines = [];
		if (typeof(nobr) == 'undefined') nobr = null;
		for (var j = 0, ilen = 0, ihi=0; j < textLines.length; j++) {
			var line = getLineBox(offsetHeight, lineHeight, lineMaxWidth, frameHeight, baseLineExtraSpacing,offset);
			if (line) {
				// convert to anonymous inline box
				if(line && nobr && j in nobr) {
					line.x += ilen;
					line.y -= ihi; 
					offsetHeight -= line.height;
					line.maxWidth -= ilen;
				} else ilen = 0;
				line.content = textLines[j];
				ilen += Math.round(getWidth(line.content)); // Actual Value from Used Value
				ihi = Math.round(line.maxHeight);
				line.width = ilen;
				line.minWidth = ilen;
				line.height = ihi;
				line.redraw = true;
				lines.push(line);
				offsetHeight += line.height;
			}
		}
		return lines;
	};
	
	return {
		'createLineBoxes' : createLineBoxes
	};
};
