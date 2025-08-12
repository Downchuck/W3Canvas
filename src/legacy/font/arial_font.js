const FONT_COLOR = "#555";

let arialFontLib = null;

window.loadFont = function(callback) {
	try {
		const r = new XMLHttpRequest();

		const loadArial = function(_) {
			if(r.readyState != 4) { return; }

			arialFontLib = new base2.Package({
				name: "svgfont",
				version: "0.91",
				exports: "load,drawText,measureText"
			});
			arialFontLib.extend(CanvasRenderingContext2DPath);
			arialFontLib.extend(CanvasRenderingContext2DFont);
			arialFontLib.extend(CanvasRenderingContext2DFont_svg);
			arialFontLib = base2.svgfont;
			arialFontLib.load('Arial',r.responseText);
			if (callback) {
				callback();
			}
		};
		r.open("GET", 'examples/Arial.svg', true);
		r.onreadystatechange = loadArial; r.send(null);
	}
	catch (e) {
		alert("Error Loading Font: " + e.message);
	}
}


window.ArialFont = function() {
	if (!arialFontLib) {
		console.log("Cannot use ArialFont... lib is null");
	}
	const fontLetters = arialFontLib.font.letters;

	let scaleFactor	= 0.2;
	let textColor = FONT_COLOR;

	const getTextColor = function() {
		return textColor;
	};

	const setTextColor = function(c) {
		textColor = c;
	};

	const setScaleFactor = function(f) {
		scaleFactor = f;
	};
	const getScaleFactor = function() { return scaleFactor; };

	const drawString = function(ctx, str) {
		try {
			arialFontLib.ctx = ctx;

			const sc = scaleFactor;
			ctx.scale(sc, -sc);
			ctx.globalCompositeOperation = 'xor';

			arialFontLib.drawString(ctx, str);

			ctx.globalCompositeOperation = 'source-over';
		}
		catch (e) {
			debug("Error: " + e.message);
		}
	};

	const fillText = function(ctx, text, x, y, maxWidth) {
		ctx.save();
		const path = getTextPath(text);
		if (x && y) {
			ctx.translate(x, y);
		}
		const sc = scaleFactor;
		ctx.scale(sc, -sc);
		ctx.fill(path);
		ctx.restore();
	};

	const measureText = function(ctx, str) {
		if (str === undefined) {
			alert("Missing string");
		}

		if (str === "") {
			return 0;
		}

		arialFontLib.ctx = ctx;

		const m = scaleFactor * 0.1 * arialFontLib.measureText(str);
		return m;
	};

	const getBaseLine = function() {
		return 160 * scaleFactor;
	};

	const getTextHeight = function() {
		return 220 * scaleFactor;
	};

	const getTextPath = function(text) {
		let path = new Path2D();
		let currentX = 0;
		for (let i = 0; i < text.length; i++) {
			const charCode = text.charCodeAt(i);
			if (fontLetters[charCode]) {
				const charPath = new Path2D(fontLetters[charCode]);
				const matrix = new DOMMatrix([1, 0, 0, 1, currentX, 0]);
				path.addPath(charPath, matrix);
				currentX += arialFontLib.font.lettersw[charCode] || 0;
			}
		}
		return path;
	};

	return {
		'getFontLetters': function() { return fontLetters; },
		'measureText'	: measureText,
		'fillText'		: fillText,
		'getTextHeight'	: getTextHeight,
		'getBaseLine'	: getBaseLine,
		'loadFont'		: loadFont,
		'drawString'	: drawString,
		'getTextColor'	: getTextColor,
		'setTextColor'	: setTextColor,
		'setScaleFactor': setScaleFactor,
		'getScaleFactor': getScaleFactor,
		'getTextPath'   : getTextPath
	};
};
