import { BoxModel } from './box_model.js';
import { ElementStyle, CssStyle } from './css_style.js';
import { mixin } from '../lang_util.js';
import { VerticalScrollbar } from './scrollbar.js';
import { boxModelFactory } from './box_basic.js';

export class BoxStyle extends BoxModel {
	constructor(margin, border, padding) {
		super();
		this.setMargin(margin || 0);
		this.setBorder(border || 0);
		this.setPadding(padding || 0);
		const SimpleModel = function() {
			this.getMargin = () => this.margin.left;
			this.getBorder = () => this.border.left;
			this.getPadding = () => this.padding.left;
		};
		return mixin(this, new SimpleModel(), new ElementStyle(new CssStyle()));
	}
}

export class Viewport {
	constructor() {
		const verticalScrollbar = new VerticalScrollbar();
		this.drag = verticalScrollbar.drag;
		let verticalScrollbarBox = null;
		let targetClipRegion = null;
		this.needsVerticalScrollbar = () => false;
		this.needsHorizontalScrollbar = () => false;
		this.isInsideScrollbar = (x, y) => {
			let inside = false;
			if (verticalScrollbarBox) {
				const b = verticalScrollbarBox;
				inside = (b.x < x && x < b.x + b.width) &&
						 (b.y < y && y < b.y + b.height);
			}
			return inside;
		};
		this.getVerticalScrollbarWidth = () => {
			return verticalScrollbar.getScrollbarWidth();
		};
		const getOffsetX = () => {
			return 0;
		};
		const getOffsetY = () => {
			return verticalScrollbar.getValue();
		};
		this.getOffset = () => {
			const point = boxModelFactory.createPoint();
			point.x = getOffsetX();
			point.y = getOffsetY();
			return point;
		};
		this.setVerticalSpan = (min, max, visible) => {
			verticalScrollbar.setSpan(min, max, visible);
		};
		this.setVerticalIncrement = (unitInc, blockInc) => {
			verticalScrollbar.setIncrement(unitInc, blockInc);
		};
		this.setVerticalScrollbarBox = (x, y, width, height) => {
			verticalScrollbarBox = boxModelFactory.createBox(x, y, width, height);
		};
		this.displayVerticalScrollbar = (ctx) => {
			const box = verticalScrollbarBox;
			if (box) {
				verticalScrollbar.display(ctx, box.x, box.y, box.width, box.height);
			}
			else {
				throw new Error("displayVerticalScrollbar: vertical scrollBar box has not been set!");
			}
		};
		this.setValueAdjustmentListener = (f) => {
			verticalScrollbar.setValueAdjustmentListener(f);
		};
		this.scrollUp = () => {
			verticalScrollbar.scrollUp();
		};
		this.scrollDown = () => {
			verticalScrollbar.scrollDown();
		};
		this.verticalScrollTo = (percent) => {
			verticalScrollbar.scrollTo(percent);
		};
		this.layout = () => {
			verticalScrollbar.layout();
		};
		this.isInsideScrollThumb = (x, y) => {
			return verticalScrollbar.isInsideScrollThumb(x, y);
		};
		this.isInsideScrollBar = (x, y) => {
			return verticalScrollbar.isInsideScrollBar(x, y);
		};
		this.dragTo = () => {
			const percentInc = (this.drag.end.y - this.drag.start.y) / verticalScrollbar.getScrollingHeight();
			const p = this.drag.percentStart + percentInc * 1.2;
			this.verticalScrollTo(p);
			this.drag.moved.x = this.drag.end.x;
			this.drag.moved.y = this.drag.end.y;
		};
		this.isAboveThumb = (x, y) => {
			return verticalScrollbar.isAboveThumb(x, y);
		};
		this.isBelowThumb = (x, y) => {
			return verticalScrollbar.isBelowThumb(x, y);
		};
		this.setTargetClipRegion = (box) => {
			targetClipRegion = box;
		};
		this.clipToTargetRegion = (ctx) => {
			const box = targetClipRegion;
			if (box) {
				ctx.beginPath();
				ctx.rect(box.x, box.y, box.width, box.height);
				ctx.clip();
			}
			else if (this.needsVerticalScrollbar()) {
				throw new Error("clipToTarget(): Need to initialize the targetClipRegion box");
			}
		};
		this.scrollToCoordinates = (x, y) => {
			verticalScrollbar.scrollToCoordinates(x, y);
		};
		this.setDragStart = (x, y) => {
			this.drag.start.x = x;
			this.drag.start.y = y;
			this.drag.percentStart = verticalScrollbar.getPercentValue();
			this.drag.dragging = true;
			this.drag.active = true;
			document.documentElement.style.cursor = "pointer";
		};
		this.setDragStop = () => {
			this.drag.dragging = false;
			this.drag.active = false;
			document.documentElement.style.cursor = "default";
		};
	}
}
