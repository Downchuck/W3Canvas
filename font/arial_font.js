// Why do we have the font color tied to the background? XOR-related issue?

//var FONT_COLOR = "#333"; //"#333"; // "black"; // "#79c";
//var FONT_COLOR = "black"; //"#333"; // "black"; // "#79c";
//var FONT_COLOR = "red";	// "#79c";

var FONT_COLOR = "#555";


var arialFontLib = null;

function loadFont(callback) {
	try {
		//throw new Error("loading font....");
		var r = new XMLHttpRequest();

		var loadArial = function(_) {
			if(r.readyState != 4) return;
			arialFontLib = {
				name: "svgfont",
				version: "0.91",
				exports: "load,drawText,measureText"
			};
			colorjack.util.extend(arialFontLib, CanvasRenderingContext2DPath);
			colorjack.util.extend(arialFontLib, CanvasRenderingContext2DFont);
			colorjack.util.extend(arialFontLib, CanvasRenderingContext2DFont_svg);
			arialFontLib.load('Arial',r.responseText);
			if (callback) callback();
		};
		r.open("GET", 'Arial.svg', true);
		r.onreadystatechange = loadArial; r.send(null);
		
		//throw new Error("Finished the call to loadFont");
	}
	catch (e) {
		throw new Error("Error Loading Font: " + e.message);
	}
}


var ArialFont = function(scaleFactor) {
	if (!arialFontLib) {
		throw new Error("Cannot use ArialFont... lib is null");
	}
	var fontLetters = arialFontLib.font.letters; // Funny dependency for the keyboard

	if (!scaleFactor) scaleFactor	= 0.2;
	var textColor = FONT_COLOR;
	
	var getTextColor = function() {
		return textColor;
	};
	
	var setTextColor = function(c) {
		textColor = c;
	};

	var setScaleFactor = function(f) {
		scaleFactor = f;
	};
	var getScaleFactor = function() { return scaleFactor; };
	
	var drawString = function(ctx, str) {
		try {
			arialFontLib.ctx = ctx;	// font.js/path.js needs this 'global' setting.

			//ctx.lineWidth='32';
			var sc = scaleFactor;
			ctx.scale(sc, -sc);
			ctx.globalCompositeOperation = 'xor';
			
			// ctx.fillStyle = "red";			
			arialFontLib.drawString(ctx, str);
			
			ctx.globalCompositeOperation = 'source-over'; // back to default painting.			
		}
		catch (e) {
			throw new Error("Error: " + e.message);
		}
	};
	
	var useCustomFontPainter = true; // Otherwise use Firefox 3.1 text drawing functions (need to set/get the font on the document)
	
	var fillText = function(ctx, text, x, y, maxWidth) {
		ctx.save();
		
		if (useCustomFontPainter) {
			// TODO: setup a clipping region with maxWidth
			ctx.stroke = '';
			if (x && y) {
				ctx.translate(x, y);
			}
			drawString(ctx, text);
		}
		else {
			var a = x || 0;
			var b = y || 0;
			ctx.fillText(text, a, b, maxWidth);
		}
		
		ctx.restore();
	};
	
	var measureText = function(ctx, str) {
		if (str === undefined) {
			throw new Error("Missing string");
		}
		
		if (str === "") {
			return 0;
		}
		
		arialFontLib.ctx = ctx;	// font.js/path.js needs this 'global' setting.

		var m = (useCustomFontPainter)? scaleFactor * 0.1 * arialFontLib.measureText(str) : ctx.measureText(str);
		return m;
	};
	
	var getBaseLine = function() {
		return 160 * scaleFactor;
	};
	
	var getTextHeight = function() {
		return 220 * scaleFactor;
	};
	
	return {
		'getFontLetters': function() { return fontLetters; },	// Funny dependency on the keyboard
		'measureText'	: measureText,
		'fillText'		: fillText,
		'getTextHeight'	: getTextHeight,
		'getBaseLine'	: getBaseLine,
		'loadFont'		: loadFont,
		'drawString'	: drawString,	// Call: ctx.scale(scaleFactor,-scaleFactor); before calling arialFont.drawString(ctx)
		'getTextColor'	: getTextColor,
		'setTextColor'	: setTextColor,
		'setScaleFactor': setScaleFactor,
		'getScaleFactor': getScaleFactor
	};
};

