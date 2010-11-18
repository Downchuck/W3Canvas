
colorjack.css.VerticalScrollbar = (function() {
  var boxModelFactory = colorjack.css.boxModelFactory;

  var SB_VERTICAL		= 1;	// ORIENTATION
  var SB_HORIZONTAL	= 2;

  var SB_AS_NEEDED	= 3;	// POLICY
  var SB_ALWAYS		= 4;
  var SB_NEVER		= 5;

  var ScrollbarData = function(o) { // Inspired on Java JDK java.awt.ScrollPaneAdjustable, value has been changed to a more useful "percentValue"
  	this.orientation	= o || SB_VERTICAL;
  	this.percentValue	= 0;	// always a percentage value, getValue/setValue: changes back to real coordinates
  	this.minimum		= 0;	// Usually 0
  	this.maximum		= 0;	// maximum-minimum = visible + invisible
  	this.visibleAmount	= 0;
  	this.unitIncrement	= 50;
  	this.blockIncrement	= 100;	// Not used in our application
  };

  var DragInfo = function() {
  	this.start	= boxModelFactory.createPoint();
  	this.end	= boxModelFactory.createPoint();
  	this.moved	= boxModelFactory.createPoint();
  	this.percentStart = 0;
  	this.dragging = false;
  	this.active = false;
  };

  var ScrollbarModel = function(orientation) {
  	var valueAdjustmentListener = null;
  	var data = new ScrollbarData(orientation);

  	var getScrollingRange = function() {
  		return (data.maximum - data.minimum - data.visibleAmount);
  	};

  	var getRange = function() {
  		return data.maximum - data.minimum;
  	};

  	var getPercentValue = function() {
  		return data.percentValue;
  	};

  	var getValue = function() {
  		return getPercentValue() * getScrollingRange();
  	};

  	var setPercentValue = function(percent) {
  		var p = Math.max(0.0, Math.min(1.0, percent));
  		data.percentValue = p;
  	};

  	var setValue = function(v) {
  		if (v < data.minimum) {
  			v = data.minimum;
  		}
  		var max = data.maximum;
  		if (v >= max) {
  			v = max;
  		}
  		if (data.minimum <= v && v <= max) {
  			var p = v / getScrollingRange();
  			setPercentValue(p);
  		}
  		else {
  			throw new Error("ScrollbarModel.setValue(): Invalid param:" + v);
  		}
  	};

  	var setSpan = function(min, max, visible) {
  		if (min < max && 0 < visible && visible <= max) {
  			data.minimum = min;
  			data.maximum = max;
  			data.visibleAmount = visible;
  		}
  		else {
        debugger
  			throw new Error("Invalid span parameters: " + min + "," + max + "," + visible);
  		}
  	};

  	var setUnitIncrement = function(inc) {
  		data.unitIncrement = inc;
  	};

  	var getUnitIncrement = function() {
  		return data.unitIncrement;
  	};

  	var getBlockIncrement = function() {
  		return data.blockIncrement;
  	};

  	var setBlockIncrement = function(inc) {
  		data.blockIncrement = inc;
  	};

  	var setValueAdjustmentListener = function(f) {
  		valueAdjustmentListener = f;
  	};

  	var getVisibleAmount = function() {
  		return data.visibleAmount;
  	};

  	return {
  		'getBlockIncrement'	: getBlockIncrement,
  		'getRange'			: getRange,
  		'getUnitIncrement'	: getUnitIncrement,
  		'setValue'			: setValue,
  		'setPercentValue'	: setPercentValue,
  		'setBlockIncrement'	: setBlockIncrement,
  		'setUnitIncrement'	: setUnitIncrement,
  		'setSpan'			: setSpan,
  		'getValue'			: getValue,
  		'getPercentValue'	: getPercentValue,
  		'getVisibleAmount'	: getVisibleAmount,
  		'setValueAdjustmentListener' : setValueAdjustmentListener
  	};
  };

  function VerticalScrollbar() {

    var drag = new DragInfo(); // should be local to VerticalScrollbar

  	var VerticalScrollbarModel = function() {

  		var scrollBarModel = new ScrollbarModel(SB_VERTICAL);

  		var getValue = function() {
  			return scrollBarModel.getValue();
  		};

  		var getPercentValue = function() {
  			return scrollBarModel.getPercentValue();
  		};

  		var test = 0;

  		var scrollUp = function() {
  			if (test) {
  				scrollBarModel.setPercentValue(0.0);	// for testing
  			}
  			else {
  				var current = getValue();
  				var inc = scrollBarModel.getUnitIncrement();
  				scrollBarModel.setValue(current - inc);
  			}
  		};

  		var scrollDown = function() {
  			if (test) {
  				scrollBarModel.setPercentValue(1.0);	// for testing
  			}
  			else {
  				var current = getValue();
  				var inc = scrollBarModel.getUnitIncrement();
  				scrollBarModel.setValue(current + inc);
  			}
  		};

  		var scrollTo = function(percent) {
  			scrollBarModel.setPercentValue(percent);
  		};

  		var setSpan = function(min, max, visible) {
  			scrollBarModel.setSpan(min, max, visible);
  		};

  		var setIncrement = function(unitInc, blockInc) {
  			scrollBarModel.setUnitIncrement(unitInc);
  			scrollBarModel.setBlockIncrement(blockInc);
  		};

  		var setValueAdjustmentListener = function(f) {
  			scrollBarModel.setValueAdjustmentListener(f);
  		};

  		var getRange = function() {
  			return scrollBarModel.getRange();
  		};

  		var getVisibleAmount = function() {
  			return scrollBarModel.getVisibleAmount();
  		};

  		var setPercentValue = function(p) {
  			if (p < 0) {
  				p = 0.0;
  			}
  			else if (p > 1.0) {
  				p = 1.0;
  			}
  			scrollBarModel.setPercentValue(p);
  		};

  		var getUnitIncrement = function() {
  			return scrollBarModel.getUnitIncrement();
  		};

  		return {
  			'drag'				: drag,
  			'getValue'			: getValue,
  			'getPercentValue'	: getPercentValue,
  			'setPercentValue'	: setPercentValue,
  			'getRange'			: getRange,
  			'getVisibleAmount'	: getVisibleAmount,
  			'scrollDown'		: scrollDown,
  			'scrollUp'			: scrollUp,
  			'setIncrement'		: setIncrement,
  			'getUnitIncrement'	: getUnitIncrement,
  			'setSpan'			: setSpan,
  			'scrollTo'			: scrollTo,
  			'setValueAdjustmentListener' : setValueAdjustmentListener
  		};
  	};

  	var verticalScrollbarModel = new VerticalScrollbarModel();
  	var SCROLLBAR_WIDGET_WIDTH = 30;

  	var ScrollbarDisplayer = function() {
  		var painter = new colorjack.css.BoxModelPainter();
  		var scrollBarBox	= new colorjack.css.BoxModel();
  		var scrollThumbBox	= new colorjack.css.BoxModel();
  		var scrollingBox = null;
  		var scrollingHeight = 0;

  		var availableScrollingHeight = 0;

  		var getScrollingHeight = function() {
  			return scrollBarBox.contentArea.height - scrollThumbBox.getTopLength() - scrollThumbBox.getBottomLength();
  		};

  		var getAvailableScrollingHeight = function() {
  			return availableScrollingHeight;
  		};

  		var getScrollbarWidth = function() {
  			return SCROLLBAR_WIDGET_WIDTH;
  		};

  		var darkThumbCanvas, lightThumbCanvas;
  		var darkGradient, lightGradient;

  		var createScrollThumbGradients = function(left) {
  			var w, h;
  			w = 20;
  			h = 500;

  			darkThumbCanvas = colorjack.currentWindow.createCanvasLayer(w, h);
  			var darkThumbCtx = darkThumbCanvas.getContext('2d');
  			var el = darkThumbCanvas;

  			var ctx = darkThumbCtx;
  			var x = 0;
  			var y = 0;
  			painter.setupLinearGradient(ctx, x, y, w, h, '#999', '#777');
  			ctx.fillRect(x, y, w, h);

  			lightThumbCanvas = colorjack.currentWindow.createCanvasLayer(w, h);
  			var lightThumbCtx = lightThumbCanvas.getContext('2d');
  			painter.setupLinearGradient(lightThumbCtx, 0, 0, w, h, '#bbb', '#999');

  			ctx = lightThumbCtx;
  			ctx.fillRect(0, 0, w, h);

  			darkGradient = darkThumbCtx.getImageData(0, 0, w, h);
  			lightGradient = lightThumbCtx.getImageData(0, 0, w, h);
  		};

  		var layout = function(x, y, width, height) { // Start from the total width & height, compute towards inside dimensions
  			try {
  				var box = scrollBarBox;

  				box.setOffset(x, y);

  				var sideMargin	  = 5;
  				box.margin.right  = sideMargin;
  				box.margin.left   = sideMargin;
  				box.margin.top	  = height * 0.05;
  				box.margin.bottom = height * 0.05;

  				box.setBorder(1);
  				box.setPadding(2);

  				box.contentArea.width = width - box.getLeftLength() - box.getRightLength();
  				box.contentArea.height = height - box.getTopLength() - box.getBottomLength();

  				var sb		= verticalScrollbarModel;
  				var visible = sb.getVisibleAmount();
  				var range	= sb.getRange();

  				var visiblePercent	= visible/range;

  				var stBox = scrollThumbBox;

  				var thumbMargin		= 1;
  				stBox.margin.right	= thumbMargin;
  				stBox.margin.left	= thumbMargin;
  				stBox.margin.top	= 0;
  				stBox.margin.bottom	= 0;
  				stBox.setBorder(0);
  				stBox.setPadding(0);

  				stBox.contentArea.width = box.contentArea.width - stBox.getLeftLength() - stBox.getRightLength();
  				scrollingHeight = getScrollingHeight();

  				var thumbHeight = visiblePercent * scrollingHeight;
  				stBox.contentArea.height = thumbHeight;
  				// debug("ThumbScroll Height: " + thumbHeight + ", " + scrollingHeight + " visible % " + visiblePercent);

  				var posPercent = sb.getPercentValue();
  				availableScrollingHeight = (scrollingHeight-thumbHeight);

  				var thumbOffsetTop = posPercent * availableScrollingHeight;

  				var left = x + box.getLeftLength();
  				var top  = y + box.getTopLength();
  				stBox.setOffset(left, top + thumbOffsetTop);

  				scrollingBox = scrollBarBox.getContentBox();

  				createScrollThumbGradients(left);
  			}
  			catch (e22) {
  				throw new Error("Error: " + e22.message);
  			}
  		};

  		var isInsideScrollThumb = function(x, y) {
  			return scrollThumbBox.isPointInsideBorder(x, y);
  		};

  		var isInsideScrollBar = function(x, y) {
  			return scrollBarBox.isPointInsideBorder(x, y);
  		};

  		var display = function(ctx, x, y, width, height) {
  			layout(x, y, width, height);

  			var scrollBarStyle = drag.dragging || drag.active ? {
  				'getBackgroundColor': function() { return "#aee"; },
  				'getBorderColor'	: function() { return "#aaa"; }
  			} :	{
  				'getBackgroundColor': function() { return "#9cc"; },
  				'getBorderColor'	: function() { return "white"; }
  			};

  			var scrollThumbStyle = drag.dragging || drag.active ? {
  				'getBackgroundColor': function() { return "#aae"; },
  				'getBorderColor'	: function() { return "white"; }
  			} :	{
  				'getBackgroundColor': function() { return "#99c"; },
  				'getBorderColor'	: function() { return "white"; }
  			};

  			ctx.save();

  			ctx.beginPath();
  			ctx.rect(x, y, width, height);
  			ctx.clip();

  			var b = scrollBarBox.getBorderBox();
  			var bb = scrollThumbBox.getBorderBox();
  			//paintRoundedRect(ctx, b,  "#1A1B19");
  			painter.paintRoundedTextBox(ctx, b, "#333");

  			//paintRoundedRect(ctx, bb,  "#ddd");
  			var gradient = (drag.active)? lightThumbCanvas : darkThumbCanvas;
  			painter.paintRoundedBoxGradient(ctx, bb, gradient);

  			ctx.restore();
  		};

  		var isAboveThumb = function(x, y) {
  			var m = scrollThumbBox.getMarginBox();
  			return (y < m.y);
  		};

  		var isBelowThumb = function(x, y) {
  			var m = scrollThumbBox.getMarginBox();
  			return (y > m.y + m.height);
  		};

  		var scrollToCoordinates = function(x, y) {
  			// Need more refinement here
  			var inside = (scrollingBox.y < y && y < scrollingBox.y + scrollingBox.height);
  			if (inside) {
  				var diff = y - scrollingBox.y;
  				var percent = diff / scrollingHeight;
  				var unit = verticalScrollbarModel.getUnitIncrement();
  				if (diff < unit) {
  					percent = 0.0;
  				}
  				else if (diff > scrollingHeight-unit) {
  					percent = 1.0;
  				}
  				// Refine the exact location of the thumb
  				verticalScrollbarModel.scrollTo(percent);
  			}
  		};

  		return {
  			'layout'				: layout,
  			'display'				: display,
  			'getScrollbarWidth'		: getScrollbarWidth,
  			'getScrollingHeight'	: getScrollingHeight,
  			'isBelowThumb'			: isBelowThumb,
  			'isAboveThumb'			: isAboveThumb,
  			'scrollToCoordinates'	: scrollToCoordinates,
  			'isInsideScrollBar'		: isInsideScrollBar,
  			'isInsideScrollThumb'	: isInsideScrollThumb,
  			'getAvailableScrollingHeight' : getAvailableScrollingHeight
  		};
  	};
  	return colorjack.util.mixin(verticalScrollbarModel, new ScrollbarDisplayer());
  };

  return VerticalScrollbar;

})();
