import { boxModelFactory } from './box_basic.js';
import { BoxModel } from './box_model.js';
import { BoxModelPainter } from './box_paint.js';
import * as currentWindow from '../canvas_lib.js';
import { mixin } from '../lang_util.js';

const SB_VERTICAL		= 1;
const SB_HORIZONTAL	= 2;
const SB_AS_NEEDED	= 3;
const SB_ALWAYS		= 4;
const SB_NEVER		= 5;

class ScrollbarData {
	constructor(o) {
		this.orientation	= o || SB_VERTICAL;
		this.percentValue	= 0;
		this.minimum		= 0;
		this.maximum		= 0;
		this.visibleAmount	= 0;
		this.unitIncrement	= 50;
		this.blockIncrement	= 100;
	}
}

class DragInfo {
	constructor() {
		this.start	= boxModelFactory.createPoint();
		this.end	= boxModelFactory.createPoint();
		this.moved	= boxModelFactory.createPoint();
		this.percentStart = 0;
		this.dragging = false;
		this.active = false;
	}
}

class ScrollbarModel {
	constructor(orientation) {
		let valueAdjustmentListener = null;
		const data = new ScrollbarData(orientation);

		const getScrollingRange = () => {
			return (data.maximum - data.minimum - data.visibleAmount);
		};

		this.getRange = () => {
			return data.maximum - data.minimum;
		};

		this.getPercentValue = () => {
			return data.percentValue;
		};

		this.getValue = () => {
			return this.getPercentValue() * getScrollingRange();
		};

		this.setPercentValue = (percent) => {
			const p = Math.max(0.0, Math.min(1.0, percent));
			data.percentValue = p;
		};

		this.setValue = (v) => {
			if (v < data.minimum) {
				v = data.minimum;
			}
			const max = data.maximum;
			if (v >= max) {
				v = max;
			}
			if (data.minimum <= v && v <= max) {
				const p = v / getScrollingRange();
				this.setPercentValue(p);
			}
			else {
				throw new Error("ScrollbarModel.setValue(): Invalid param:" + v);
			}
		};

		this.setSpan = (min, max, visible) => {
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

		this.setUnitIncrement = (inc) => {
			data.unitIncrement = inc;
		};

		this.getUnitIncrement = () => {
			return data.unitIncrement;
		};

		this.getBlockIncrement = () => {
			return data.blockIncrement;
		};

		this.setBlockIncrement = (inc) => {
			data.blockIncrement = inc;
		};

		this.setValueAdjustmentListener = (f) => {
			valueAdjustmentListener = f;
		};

		this.getVisibleAmount = () => {
			return data.visibleAmount;
		};
	}
}

export class VerticalScrollbar {
	constructor() {
		const drag = new DragInfo();

		const VerticalScrollbarModel = function() {
			const scrollBarModel = new ScrollbarModel(SB_VERTICAL);
			let test = 0;

			this.getValue = () => {
				return scrollBarModel.getValue();
			};

			this.getPercentValue = () => {
				return scrollBarModel.getPercentValue();
			};

			this.scrollUp = () => {
				if (test) {
					scrollBarModel.setPercentValue(0.0);
				}
				else {
					const current = this.getValue();
					const inc = scrollBarModel.getUnitIncrement();
					scrollBarModel.setValue(current - inc);
				}
			};

			this.scrollDown = () => {
				if (test) {
					scrollBarModel.setPercentValue(1.0);
				}
				else {
					const current = this.getValue();
					const inc = scrollBarModel.getUnitIncrement();
					scrollBarModel.setValue(current + inc);
				}
			};

			this.scrollTo = (percent) => {
				scrollBarModel.setPercentValue(percent);
			};

			this.setSpan = (min, max, visible) => {
				scrollBarModel.setSpan(min, max, visible);
			};

			this.setIncrement = (unitInc, blockInc) => {
				scrollBarModel.setUnitIncrement(unitInc);
				scrollBarModel.setBlockIncrement(blockInc);
			};

			this.setValueAdjustmentListener = (f) => {
				scrollBarModel.setValueAdjustmentListener(f);
			};

			this.getRange = () => {
				return scrollBarModel.getRange();
			};

			this.getVisibleAmount = () => {
				return scrollBarModel.getVisibleAmount();
			};

			this.setPercentValue = (p) => {
				if (p < 0) {
					p = 0.0;
				}
				else if (p > 1.0) {
					p = 1.0;
				}
				scrollBarModel.setPercentValue(p);
			};

			this.getUnitIncrement = () => {
				return scrollBarModel.getUnitIncrement();
			};

			this.drag = drag;
		};

		const verticalScrollbarModel = new VerticalScrollbarModel();
		const SCROLLBAR_WIDGET_WIDTH = 30;

		const ScrollbarDisplayer = function() {
			const painter = new BoxModelPainter();
			const scrollBarBox	= new BoxModel();
			const scrollThumbBox	= new BoxModel();
			let scrollingBox = null;
			let scrollingHeight = 0;
			let availableScrollingHeight = 0;

			const getScrollingHeight = () => {
				return scrollBarBox.contentArea.height - scrollThumbBox.getTopLength() - scrollThumbBox.getBottomLength();
			};

			this.getAvailableScrollingHeight = () => {
				return availableScrollingHeight;
			};

			this.getScrollbarWidth = () => {
				return SCROLLBAR_WIDGET_WIDTH;
			};

			let darkThumbCanvas, lightThumbCanvas;

			const createScrollThumbGradients = (left) => {
				const w = 20;
				const h = 500;
				darkThumbCanvas = currentWindow.createCanvasLayer(w, h);
				const darkThumbCtx = darkThumbCanvas.getContext('2d');
				painter.setupLinearGradient(darkThumbCtx, 0, 0, w, h, '#999', '#777');
				darkThumbCtx.fillRect(0, 0, w, h);
				lightThumbCanvas = currentWindow.createCanvasLayer(w, h);
				const lightThumbCtx = lightThumbCanvas.getContext('2d');
				painter.setupLinearGradient(lightThumbCtx, 0, 0, w, h, '#bbb', '#999');
				lightThumbCtx.fillRect(0, 0, w, h);
			};

			this.layout = (x, y, width, height) => {
				try {
					const box = scrollBarBox;
					box.setOffset(x, y);
					const sideMargin	  = 5;
					box.margin.right  = sideMargin;
					box.margin.left   = sideMargin;
					box.margin.top	  = height * 0.05;
					box.margin.bottom = height * 0.05;
					box.setBorder(1);
					box.setPadding(2);
					box.contentArea.width = width - box.getLeftLength() - box.getRightLength();
					box.contentArea.height = height - box.getTopLength() - box.getBottomLength();
					const sb		= verticalScrollbarModel;
					const visible = sb.getVisibleAmount();
					const range	= sb.getRange();
					const visiblePercent	= visible/range;
					const stBox = scrollThumbBox;
					const thumbMargin		= 1;
					stBox.margin.right	= thumbMargin;
					stBox.margin.left	= thumbMargin;
					stBox.margin.top	= 0;
					stBox.margin.bottom	= 0;
					stBox.setBorder(0);
					stBox.setPadding(0);
					stBox.contentArea.width = box.contentArea.width - stBox.getLeftLength() - stBox.getRightLength();
					scrollingHeight = getScrollingHeight();
					const thumbHeight = visiblePercent * scrollingHeight;
					stBox.contentArea.height = thumbHeight;
					const posPercent = sb.getPercentValue();
					availableScrollingHeight = (scrollingHeight-thumbHeight);
					const thumbOffsetTop = posPercent * availableScrollingHeight;
					const left = x + box.getLeftLength();
					const top  = y + box.getTopLength();
					stBox.setOffset(left, top + thumbOffsetTop);
					scrollingBox = scrollBarBox.getContentBox();
					createScrollThumbGradients(left);
				}
				catch (e22) {
					throw new Error("Error: " + e22.message);
				}
			};

			this.isInsideScrollThumb = (x, y) => {
				return scrollThumbBox.isPointInsideBorder(x, y);
			};

			this.isInsideScrollBar = (x, y) => {
				return scrollBarBox.isPointInsideBorder(x, y);
			};

			this.display = (ctx, x, y, width, height) => {
				this.layout(x, y, width, height);
				const scrollBarStyle = drag.dragging || drag.active ? {
					'getBackgroundColor': function() { return "#aee"; },
					'getBorderColor'	: function() { return "#aaa"; }
				} :	{
					'getBackgroundColor': function() { return "#9cc"; },
					'getBorderColor'	: function() { return "white"; }
				};
				const scrollThumbStyle = drag.dragging || drag.active ? {
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
				const b = scrollBarBox.getBorderBox();
				const bb = scrollThumbBox.getBorderBox();
				painter.paintRoundedTextBox(ctx, b, "#333");
				const gradient = (drag.active)? lightThumbCanvas : darkThumbCanvas;
				painter.paintRoundedBoxGradient(ctx, bb, gradient);
				ctx.restore();
			};

			this.isAboveThumb = (x, y) => {
				const m = scrollThumbBox.getMarginBox();
				return (y < m.y);
			};

			this.isBelowThumb = (x, y) => {
				const m = scrollThumbBox.getMarginBox();
				return (y > m.y + m.height);
			};

			this.scrollToCoordinates = (x, y) => {
				const inside = (scrollingBox.y < y && y < scrollingBox.y + scrollingBox.height);
				if (inside) {
					const diff = y - scrollingBox.y;
					let percent = diff / scrollingHeight;
					const unit = verticalScrollbarModel.getUnitIncrement();
					if (diff < unit) {
						percent = 0.0;
					}
					else if (diff > scrollingHeight-unit) {
						percent = 1.0;
					}
					verticalScrollbarModel.scrollTo(percent);
				}
			};
		};
		mixin(this, verticalScrollbarModel, new ScrollbarDisplayer());
	}
}
