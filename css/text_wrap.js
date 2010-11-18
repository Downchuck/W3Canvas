//contains one or more several inline boxes
colorjack.boxmodel.LineBox = function(ctx, lineX, lineY, lineMaxWidth, lineHeight) {
	var boxes = []; //inline boxes
	var x = lineX;
	var y = lineY;
	var width = 0; //the actual width of the line box
	var height = lineHeight;	 //height of the line box	
	var maxWidth = lineMaxWidth; //the maximum width of the line box (equal to the element's content space)
	//var maxHeight = 0;
	var context = ctx;
	
	var getFragmentWidth = function(fragment) {		
		if (fragment.isImage)  {
			//info('fragment is image, width = ' + fragment.width);
			return fragment.width;
		}
		else {
			//TODO: do we need to save the font first?
			if (fragment.style!="")
				context.font = fragment.style;			
				
			//measure the width
			var textWidth = context.measureText(fragment.content).width;
			
			return textWidth;
		}
	}
	
	var getFragmentHeight = function(fragment) {
		if (fragment.isImage) return fragment.height;
		else return getTextHeight(fragment.style);
	}
	
	var canAdd = function(contentFragment)	{
		return width + getFragmentWidth(contentFragment) <= maxWidth;
	}

	//also set the positions for the box
	var add = function(box)
	{
		box.x = width;
		box.y = y;
		box.height = height; //this is not important yet, we'll update this value when we advance to next line!
		//box.width = context.measureText(box.contentFragment.content).width;
		box.width = getFragmentWidth(box.contentFragment);
		
		boxes.push(box);
		
		//info('boxes count: ' + boxes.length);
		
		width += box.width;
	}

	
	var getTextHeight = function(fontStyle) {
		//simple: just use only the font's size first, although it might not be correct!!
		var tokens = fontStyle.split(' ');
		var i;
		for (i = 0; i < tokens.length; i++)
		{
			var l = tokens[i].length;
			if (l > 2 && tokens[i][l-2]=='p' && tokens[i][l-1]=='x')
			{
				var str = tokens[i].substr(0, l-2);
				return str*1;
			}
		}
		return 10; //some default value!?
	}		
	
	//get all the text content on the line (including the linefeed character)
	
	var getContent = function() {
		var str = '';
		for (var i = 0; i < boxes.length; i++) {
			str+=boxes[i].contentFragment.content;
		}
		return str;
	}
	
	
	var getTop = function() { return y; }
	var getLeft = function() { return x; }
	var getBottom = function() { return y + height; }
	
	var getHeight = function() { return height; }
		
	var getWidth = function() { //the actual content width of the linebox
		return width; 
	}
	
	var getMaxWidth = function() {  //the maximum width of the linebox (i.e. parent box's width)
		return maxWidth;
	}
	
	//do vertical alignment and advance to next line
	var advance = function() {
		
		var i = 0; 
		var maxHeight = 0;
		for (i = 0; i < boxes.length; i++) { //update height of the inline boxes
			//var h = getLineHeight(boxes[i].contentFragment.style);
			var h = getFragmentHeight(boxes[i].contentFragment);
			if (h > maxHeight) maxHeight = h;				
		}
		height = maxHeight;
		
		for (i = 0; i < boxes.length; i++)
			boxes[i].height = height;			
		
		return	y + height;
		//return box.y + box.height; //don't do anything yet!
	}

	
	
	var getBoxes = function() {
		return boxes;
	}
	
	return { 
		'canAdd': canAdd ,
		'add': add,
		'getContent': getContent,
		'getTop': getTop,
		'getLeft': getLeft,
		'getBottom': getBottom,		
		'getWidth': getWidth,	
		'getMaxWidth' : getMaxWidth,
		'getHeight': getHeight,
		'getBoxes': getBoxes,
		'advance': advance		
	};
};

//haipt's version. Consider various text segments.
colorjack.css.LineWrapper = function() {	

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
	

	//each line box contain one or more inline boxes
	var createLineBoxes = function(fragments, ctx, lineHeight, lineMaxWidth, frameHeight, baseLineExtraSpacing, offset, nobr) {
		var	context = ctx;
		var i = 0;
		var lines = [];
		var linebox = new colorjack.boxmodel.LineBox(ctx, 0, 0, lineMaxWidth, lineHeight); //current line		
		
		lines.push(linebox);
		
		var saveFont = ctx.font; //remember the current font!
		
		var getWidth = function(str)
		{
			return context.measureText(str).width;
		}
		
		var linePos = 0; //y-position of the current line
		
		//info('fragments count: ' + fragments.length);
		
		for (i = 0; i < fragments.length; i++)
		{		
			if (linebox.canAdd(fragments[i])) //can add the whole fragment in
			{
				//InlineBox box = new InlineBox(fragments[i]);
				var box = colorjack.boxModelFactory.createBox();
				box.contentFragment = fragments[i];
				
				linebox.add(box); 
			}
			else
			{
				if (fragments[i].isImage) { //just add it to the new line
					linePos = linebox.advance();
							
					//then add a new line!							
					linebox = new colorjack.boxmodel.LineBox(ctx, 0, linePos, lineMaxWidth, lineHeight);							
				
					var box = colorjack.boxModelFactory.createBox();
					box.contentFragment = fragments[i];
					//TODO: do we need to add an empty inline box to this linebox?
					linebox.add(box);				
				
					lines.push(linebox);								
				}
				else {
					//break the text in this fragment into lines
					//break the fragment into two or more lines!?!
					if (fragments[i].style!="")
						ctx.font = fragments[i].style; //TODO: make sure we only extract things relevant to font
					else ctx.font = saveFont;				
					
					var text = fragments[i].content;
					
					var spaceLen = getWidth(' ');
					var tabLen = getWidth('\t');
					
					var nextLineStartOffset = 0;
					var wordStart = 0;
					var sp = 0;

					while (wordStart < text.length) {
						sp = getNextWhiteSpaceIdx(text, wordStart);					
						if (sp < 0) sp = text.length;  //no more white space -> take until end of string

						var line = text.substring(nextLineStartOffset, wordStart); // incl. ending whitespace
						var word = text.substring(wordStart, sp); //the next word!
						
						var linelen = getWidth(line);
						var wordlen = getWidth(word);
						
						var whitelen = 0;
						
						if (sp < text.length - 1) { //not end of the fragment yet!
							whiteChar = text.substring(sp, sp+1);
							var whitelen = ((whiteChar == '\t')? tabLen : spaceLen);
						}
						
						//info('line = ' + line + ' line len = ' + linelen + ' wordlen=' + wordlen);
						var totalWidth = linebox.getWidth() + linelen + wordlen + whitelen;

						if (linebox.getWidth() + linelen + wordlen + whitelen >= lineMaxWidth) {	//cannot take that word in	
							//info('split at word: ' + word);
							
							//split this text fragment into new (sub) fragments
							//var newFragment = new colorjack.textbox.model.TextFragment(fragments[i].index + nextLineStartOffset, line, fragments[i].style);
							var newFragment = new colorjack.textbox.model.ContentFragment(line, fragments[i].style);
								
							//create the box to wrap this splitted text fragment
							var box = colorjack.boxModelFactory.createBox();
							box.contentFragment = newFragment;

							linebox.add(box);
							
							linePos = linebox.advance();
							
							//then add a new line!							
							linebox = new colorjack.boxmodel.LineBox(ctx, 0, linePos, lineMaxWidth, lineHeight);							
							//linebox.y = linePos;
							
							lines.push(linebox);							
							nextLineStartOffset = wordStart;
						}
						
						wordStart = sp + 1;						
						
					}
					
					if (nextLineStartOffset < text.length) { // Handle the last string content (unbroken by whitespace)					
						var line = text.substr(nextLineStartOffset);					
						//var newFragment = new colorjack.textbox.model.TextFragment(fragments[i].index + nextLineStartOffset, line, fragments[i].style);
						var newFragment = new colorjack.textbox.model.ContentFragment(line, fragments[i].style);
						//newFragment.hasLinefeed = fragments[i].hasLinefeed; //pass the line feed over to this last fragment
						var box = colorjack.boxModelFactory.createBox();
						box.contentFragment = newFragment;
						
						//put it to the current line
						linebox.add(box);
					}
				}
			}	
			
			if (fragments[i].hasLinefeed()) { //forced to enter new line!
				linePos = linebox.advance();
							
				//then add a new line!							
				linebox = new colorjack.boxmodel.LineBox(ctx, 0, linePos, lineMaxWidth, lineHeight);							
				//linebox.y = linePos;
				
				//TODO: do we need to add an empty inline box to this linebox?
				
				
				lines.push(linebox);							
			}
		}
		
		//update the last linebox's height
		linebox.advance();			
		
		ctx.font = saveFont; //restore the original font
		
		return lines;
	}
	
	return {
		'createLineBoxes' : createLineBoxes
	};
}


