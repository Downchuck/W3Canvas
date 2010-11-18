// http://www.w3.org/TR/DOM-Level-2-Style/css.html#CSS-CSS2Properties

/*
var CSS2Properties = function() {
	this.azimuth = '';
	this.background = '';
	this.backgroundAttachment = '';
	this.backgroundColor = '';
	this.backgroundImage = '';
	this.backgroundPosition = '';
	this.backgroundRepeat = '';
	this.border = '';
	this.borderCollapse = '';
	this.borderColor = '';
	this.borderSpacing = '';
	this.borderStyle = '';
	this.borderTop = '';
	this.borderRight = '';
	this.borderBottom = '';
	this.borderLeft = '';
	this.borderTopColor = '';
	this.borderRightColor = '';
	this.borderBottomColor = '';
	this.borderLeftColor = '';
	this.borderTopStyle = '';
	this.borderRightStyle = '';
	this.borderBottomStyle = '';
	this.borderLeftStyle = '';
	this.borderTopWidth = '';
	this.borderRightWidth = '';
	this.borderBottomWidth = '';
	this.borderLeftWidth = '';
	this.borderWidth = '';
	this.bottom = '';
	this.captionSide = '';
	this.clear = '';
	this.clip = '';
	this.color = '';
	this.content = '';
	this.counterIncrement = '';
	this.counterReset = '';
	this.cue = '';
	this.cueAfter = '';
	this.cueBefore = '';
	this.cursor = '';
	this.direction = '';
	this.display = '';
	this.elevation = '';
	this.emptyCells = '';
	this.cssFloat = '';
	this.font = '';
	this.fontFamily = '';
	this.fontSize = '';
	this.fontSizeAdjust = '';
	this.fontStretch = '';
	this.fontStyle = '';
	this.fontVariant = '';
	this.fontWeight = '';
	this.height = '';
	this.left = '';
	this.letterSpacing = '';
	this.lineHeight = '';
	this.listStyle = '';
	this.listStyleImage = '';
	this.listStylePosition = '';
	this.listStyleType = '';
	this.margin = '';
	this.marginTop = '';
	this.marginRight = '';
	this.marginBottom = '';
	this.marginLeft = '';
	this.markerOffset = '';
	this.marks = '';
	this.maxHeight = '';
	this.maxWidth = '';
	this.minHeight = '';
	this.minWidth = '';
	this.orphans = '';
	this.outline = '';
	this.outlineColor = '';
	this.outlineStyle = '';
	this.outlineWidth = '';
	this.overflow = '';
	this.padding = '';
	this.paddingTop = '';
	this.paddingRight = '';
	this.paddingBottom = '';
	this.paddingLeft = '';
	this.page = '';
	this.pageBreakAfter = '';
	this.pageBreakBefore = '';
	this.pageBreakInside = '';
	this.pause = '';
	this.pauseAfter = '';
	this.pauseBefore = '';
	this.pitch = '';
	this.pitchRange = '';
	this.playDuring = '';
	this.position = '';
	this.quotes = '';
	this.richness = '';
	this.right = '';
	this.size = '';
	this.speak = '';
	this.speakHeader = '';
	this.speakNumeral = '';
	this.speakPunctuation = '';
	this.speechRate = '';
	this.stress = '';
	this.tableLayout = '';
	this.textAlign = '';
	this.textDecoration = '';
	this.textIndent = '';
	this.textShadow = '';
	this.textTransform = '';
	this.top = '';
	this.unicodeBidi = '';
	this.verticalAlign = '';
	this.visibility = '';
	this.voiceFamily = '';
	this.volume = '';
	this.whiteSpace = '';
	this.widows = '';
	this.width = '';
	this.wordSpacing = '';
	this.zIndex = '';
};

*/

colorjack.css.CSSStyleDeclaration = function() {
	var shortProps = [];
	var cssProps = [];
	var cssText = "";	// Full declaration of the style
	var propertyPriority = 0;
	
	var getPropertyValue = function(name) {	// only used for "shorthand" properties
		return shortProps[name];
	};
	
	var getPropertyCSSValue = function(name) { // Return a CSSValue
		return cssProps[name];
	};
	
	var removeProperty = function(name) {
		cssProps[name] = null;	// Not the best solution for iterating through explicit items()
	};
	
	var getPropertyPriority = function() {
		return propertyPriority;
	};
	
	var isShorthandProperty = function(name) {
		return false;	// TODO: overwrite properly
	};
	
	var setProperty = function(name, value, priority) {
		if (isShorthandProperty(name)) {
			shortProps[name] = value;
		}
		else {
			cssProps[name] = value;
		}
		propertyPriority = priority;
	};
	
	var getLength = function() {
		return cssProps.length + shortProps.length; // "explicitly" set in this declaration block.
	};
	
	var item = function(idx) {
		var result = "";
		if (idx < cssProps.length) {
			result = cssProps[idx];
		}
		else {
			result = shortProps[idx];
		}
		return result;
	};
	
	var getParentRule = function() {
		throw new Error("getParentRule() not implemented");
	};
	
	return {
		'cssText'				: cssText,
		'getPropertyValue'		: getPropertyValue,
		'getPropertyCSSValue'	: getPropertyCSSValue,
		'removeProperty'		: removeProperty,
		'getPropertyPriority'	: getPropertyPriority,
		'setProperty'			: setProperty,
		'getLength'				: getLength,
		'item'					: item,
		'getParentRule'			: getParentRule
	};
};


colorjack.css.CssStyle = function() {
	var properties = [];
	
	var getProperty = function(prop) {
		return properties[prop];
	};
	
	var setProperty = function(prop, val) {
		properties[prop] = val;
	};
	
	var clearProperty = function(prop) {
		properties[prop] = null;
	};

	return {
		'clearProperty'	: clearProperty,
		'getProperty'	: getProperty,
		'setProperty'	: setProperty
	};
};

colorjack.css.ElementStyle = function(style, element) {
	var font = null;
	var marginColor = "#ddd";
	
	style.setProperty("background-color: hover", "#8c2");
	style.setProperty("background-color: active", "blue");
	style.setProperty("background-color", "white");
	
	style.setProperty("border-color: hover", "#7c7");
	style.setProperty("border-color: active", "red");
	style.setProperty("border-color", "white");
	
	var setFont = function(f) { font = f; };	
	var getFont = function() { return font;	};
	
	var getState = function() {
		var state = 0;
		if (element && element.getState) {
			state = element.getState();
		}
		return state;
	};

	var getBackgroundColor = function() {	// This section is not working unfortunately.
		var color = null;
		var state = getState();
		
		if (state == colorjack.dom.ELEMENT_STATE_HOVER) {
		 	color = style.getProperty("background-color: hover");
		}
		else if (state == colorjack.dom.ELEMENT_STATE_ACTIVE) {
		 	color = style.getProperty("background-color: active");
		}
		else {
			color = style.getProperty("background-color");
		}
		return color;
	};
	
	var getBackgroundImage = function() {
		var prop = style.getProperty("background-image");
		return prop;
	};
	
	var getBorderColor = function() {
		var color = null;
		var state = getState();
		
		if (state == colorjack.dom.ELEMENT_STATE_HOVER) {
		 	color = style.getProperty("border-color: hover");
		}
		else if (state == colorjack.dom.ELEMENT_STATE_ACTIVE) {
		 	color = style.getProperty("border-color: active");
		}
		else {
			color = style.getProperty("border-color");
		}
		return color;
	};
	
	var getMarginColor = function() {
		return marginColor;	// We want transparent usually.
	};
	
	var setBackgroundColor = function(b, h, a) {
		if (b) {
			style.setProperty("background-color", b);
		}
		if (h) {
		 	style.setProperty("background-color: hover", h);
		}
		if (a) {
		 	style.setProperty("background-color: active", a);
		}
	};
	
	var setBorderColor = function(b, h, a) {
		if (b) {
			style.setProperty("border-color", b);
		}
		if (h) {
		 	style.setProperty("border-color: hover", h);
		}
		if (a) {
		 	style.setProperty("border-color: active", a);
		}
	};
	
	var setMarginColor = function(m) {
		marginColor = m;
	};
	
	return {
		'setFont'				: setFont,
		'getFont'				: getFont,
		'getMarginColor'		: getMarginColor,
		'getBackgroundColor'	: getBackgroundColor,
		'getBackgroundImage'	: getBackgroundImage,
		'getBorderColor'		: getBorderColor,
		'setBackgroundColor'	: setBackgroundColor,
		'setBorderColor'		: setBorderColor
	};
};
