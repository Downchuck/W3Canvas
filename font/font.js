// css3 text: http://www.w3.org/TR/css3-fonts/
// css3 webfonts: http://www.w3.org/TR/css3-webfonts/
// css3 text layout: http://www.w3.org/Style/CSS/current-work#text-layout
// css3 box model: http://www.w3.org/TR/2002/WD-css3-box-20021024/
// css parser: http://www.senocular.com/pub/javascript/CSS_parse.js
// html fallback: http://osteele.com/sources/javascript/textcanvas.js
// font shaping: http://www.microsoft.com/typography/otfntdev/intro.htm
// arabic shaping: http://www.microsoft.com/typography/otfntdev/arabicot/shaping.htm
// arabic fonts: http://www.arabeyes.org/project.php

var CanvasRenderingContext2DFont = {
  'defaultFontStyle': {
		'fontSize': '12pt', 'fontFamily': 'Arial', 'font': '12pt Arial',
		'lineHeight': '1em', 'strokeWidth':'3', 'lineWidth': null,
		'color': '#000000', 'borderColor': '',
// css3 text
		'letterSpacing': '', 'wordSpacing': '', 'punctuationTrim': '',
		'textDecoration': 'none',
		'textIndent': '0',
		'textWrap': '', 'wordWrap': '',
		'textAlign': 'start', 'textJustify': 'auto',
		'progressionAlign': 'before',
// css3 text layout
		'writing-mode': 'lr-tb',
// css3 webfonts
		'unicodeRange': 'U+0000-00FF', 'fontStyle': 'normal',
		'src': 'local("Arial"), url("arial.t1a") format("type-1")',
		'src': 'local("Arial"), url("Arial.svg") format("svg")'
	}
};

CanvasRenderingContext2DFont = {
// Default font is 12pt sans-sarif
	'mozTextStyle': '12pt Arial',
	'defaultFontStyle': CanvasRenderingContext2DFont.defaultFontStyle,

	'font': {
		'style': CanvasRenderingContext2DFont.defaultFontStyle, 'value': '',
		'cursor': { 'x':0, 'y': 0 },
		'x':0, 'y': 0
	},
	'fontFaces': {},

	'fontQueue': [],
	'fontLoadTimeout': 10000,
	'fontLoadWait': 1000,
	'fontQueueTimer': 0,

// load font
	'loadFont': function(family) {
		if(family in this.fontFaces) {
			return;
		}

		this.fontFaces[family] = { readyState: 1, paths: {}, queue: {} };
		var request = {};

		if(this.style.format == 'type-1') {
  		var reqProperties = {};
  		var req = {};
			request.args = { 'url':'inc/'+family+'.t1a', 'family': family };
			request.onsuccess = function(){this.load(reqProperties.args.family, req.responseText);};
			//ajax('inc/'+family+'.t1a',request);
		}
		else if (this.style.format == 'svg') {
		}
	},

// style description of font
	'getTextStyle': function() { return this.font.style.fontSize + ' ' + this.font.style.fontFamily; },

// check variables / load font style
	'loadFontStyle': function () {
		if(!this.font.style) this.font.style = this.defaultFontStyle;
		if(this.font.style.font) this.mozTextStyle = this.font.style.font;
		if(!this.mozTextStyle.indexOf(' ')) this.mozTextStyle = this.font.style.font = this.getTextStyle();
		this.font.style.font = this.mozTextStyle;

		var a = this.mozTextStyle.split(' ');
		var family = a.pop();
		this.font.style.fontFamily = family;
		if(a.length) {
			var size = a.pop();
			this.font.style.fontSize=parseInt(size) || 'px';
			if(size.indexOf('/')>0) size = size.substr(size.indexOf('/')+1); else size = size * 1.4;
			this.font.style.lineHeight=parseInt(size) || 'px';
		} 

		if(this.fillStyle)   this.font.style.color=this.fillStyle;
		if(this.strokeStyle) this.font.style.borderColor=this.strokeStyle;
		if(this.strokeWidth) this.font.style.borderWidth=this.strokeWidth;
		if(this.lineWidth)   this.font.style.lineWidth=this.lineWidth;
		else if(this.style.fontWeight) this.lineWidth = (this.style.fontWeight*.01) * 5;
  
		this.font.style.scale = 1/(716/parseInt(this.font.style.fontSize));
		this.font.size = parseInt(this.font.style.fontSize);
		if(this.font.style.x) {
			this.font.x = this.font.style.x;
			if(this.font.style.y) this.font.y = this.font.style.y; }
		this.font.style.x = this.font.x;
		this.font.style.y = this.font.y;
		this.font.cursor.x = this.font.style.x;
		this.font.cursor.y = this.font.style.y;

		this.loadFont(this.font.style.fontFamily);
		this.font.style.readyState = (this.font.style.fontFamily in this.fontFaces) ? this.fontFaces[this.font.style.fontFamily].readyState : 1;
		this.font.style.font = this.mozTextStyle;
	},


	'mozDrawText': function(textToDraw) {
		if(textToDraw.length) {
			this.getTextStyle();
			this.font.value = textToDraw;
			this.fontQueue.unshift( [ this.font.value, this.font.style, this.fontLoadWait ] );
		}
		else this.loadFontStyle();
  
		if(this.fontQueue.length) {
			var a = this.fontQueue.shift(); 
			var family = a[1].fontFamily;
			var isLoaded = ((family in this.fontFaces) && this.fontFaces[family].readyState && this.fontFaces[family].readyState>2)?1:0;
			if(isLoaded) { this.font.style = a[1]; this._mozDrawText(this.font.value=a[0]); }
			else if( this.fontLoadTimeout > (a[2]+=this.fontLoadWait) )  this.fontQueue.push( [ a[0], a[1], a[2] ] );
		}
		if(this.fontQueue.length) this.fontQueueTimer = window.setTimeout(this.mozDrawText, this.fontLoadWait);
	},
	'_mozDrawText': function(textToDraw) { this.drawString(textToDraw); },

	'mozPathText': function (textToDraw) { this.mozDrawText(textToDraw); },
	'mozTextAlongPath': function(textToDraw, stroke) {
		if(!stroke) this.mozDrawText(textToDraw);
		else this.mozPathText(textToDraw);
 	},
	'mozMeasureText': function (textToMeasure) {
		var len=0;
		for(var i=0,len=0,x=textToMeasure.length;i<x;i++) {
			if(textToMeasure.charCodeAt(i) in this.font.lettersw)
				len += this.font.lettersw[textToMeasure.charCodeAt(i)];
		}
		return { 'width' : len };
	},

	'drawText': function(textToDraw) { return this.mozDrawText(textToDraw); },
	'measureText': function(textToMeasure) { return this.mozMeasureText(textToMeasure).width; },

	'drawString': function(ctx, text,offset,maxlen) {
		offset = 0; maxlen = text.length;
		var code = 0, lineno = 0;
		var codes = [], widths = [];
		var i = 0;
		for(i=offset;i<maxlen;i++) {
			code = text[i].charCodeAt();
			if(code == 10 || code == 13) continue; // Non-printing characters
			if(!(code in this.font.letter || code in this.font.letters))
				code = '?'.charCodeAt();
			if(!(code in this.font.letter)) 
				this.font.letter[code] = this.loadPath(this.font.letters[code]);
			widths.push(this.font.lettersw[code]*.1);
			codes.push(code);
		}
		var clen = codes.length;
		if(!clen) return;

		ctx.save(); ctx.translate(0, lineno * -200);
        var font = this.font.letter;

		var n = clen / 8;
		var ni = clen % 8;
		i = 0; do {
		switch (ni) {
			case 0: font[codes[i]](); ctx.translate(widths[i],0); i++;
			case 7: font[codes[i]](); ctx.translate(widths[i],0); i++;
			case 6: font[codes[i]](); ctx.translate(widths[i],0); i++;
			case 5: font[codes[i]](); ctx.translate(widths[i],0); i++;
			case 4: font[codes[i]](); ctx.translate(widths[i],0); i++;
			case 3: font[codes[i]](); ctx.translate(widths[i],0); i++;
			case 2: font[codes[i]](); ctx.translate(widths[i],0); i++;
			case 1: font[codes[i]](); ctx.translate(widths[i],0); i++;
		}
		ni = 0;
		} while(--n > 0);
		ctx.restore();
	}

};


