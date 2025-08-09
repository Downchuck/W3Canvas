export class VerticalLayout {
	collapseBorders: any;

	constructor(collapseBorders) {
		this.collapseBorders = collapseBorders;
	}

	setup(ctx, parent, itemBoxStyle, parentBoxStyle, viewport) {
		let maxContentWidth = 0;
		let node = parent.getFirstChild();
		while (node) {
			if (node.computeContentSize) {
				node.computeContentSize(ctx);
			}
			else {
				throw new Error("node.computeContentSize() not defined");
			}
			node.copyRectFrom(itemBoxStyle);
			maxContentWidth = Math.max(maxContentWidth, node.contentArea.width);
			node = node.getNextSibling();
		}

		node = parent.getFirstChild();
		while (node) {
			node.contentArea.width = maxContentWidth;
			node = node.getNextSibling();
		}
		parent.copyRectFrom(parentBoxStyle);

		if (viewport && viewport.needsVerticalScrollbar()) {
			parent.padding.right += viewport.getVerticalScrollbarWidth();
		}
		return maxContentWidth;
	}

	computeLayout(ctx, parent, itemBoxStyle, parentBoxStyle) {
		const maxContentWidth = this.setup(ctx, parent, itemBoxStyle, parentBoxStyle, parent.viewport);
		const maxBlockCount = (parent.getSize)? parent.getSize() : 911;
		const leftOffset = parent.getLeftLength();
		let topOffset = parent.getTopLength();
		let scrollingHeight = topOffset;
		let parentContentHeight = topOffset;
		let itemWidth = 0;
		let itemCount = 0;
		let current = null;

		const first = parent.getFirstChild();
		if (first) {
			first.setOffset(leftOffset, topOffset);
			itemCount = 1;
			let adjust;

			current = first;
			let next = current.getNextSibling();
			while (next) {
				if (this.collapseBorders) {
					adjust = - current.border.bottom - next.margin.top;
					topOffset += current.getTotalHeight() - current.margin.bottom + adjust;
				}
				else {
					const inBetweenMargin = Math.max(current.margin.bottom, next.margin.top);
					adjust = inBetweenMargin - next.margin.top;
					topOffset += current.getTotalHeight() - current.margin.bottom + adjust;
				}
				next.setOffset(leftOffset, topOffset);

				if (itemCount < maxBlockCount) {
					parentContentHeight = topOffset;
				}
				scrollingHeight = topOffset;

				itemCount++;
				current = next;
				next = current.getNextSibling();
			}
			itemWidth = current.getLeftLength() + maxContentWidth + current.getRightLength();

			adjust = current.getTotalHeight() - parent.getTopLength();
			if (this.collapseBorders) {
				adjust -= (current.margin.bottom);
			}
			scrollingHeight = scrollingHeight + adjust;
			parentContentHeight = parentContentHeight + adjust;

			parent.contentArea.width  = itemWidth;
			parent.contentArea.height = parentContentHeight;

			const viewport = parent.viewport;
			if (viewport && viewport.needsVerticalScrollbar()) {
				let unitIncr = current.getTotalHeight() - current.margin.bottom;
				if (this.collapseBorders) {
					unitIncr = unitIncr - current.margin.bottom - current.border.bottom;
				}
				viewport.setVerticalSpan(0, scrollingHeight, parentContentHeight);
				viewport.setVerticalIncrement(unitIncr, unitIncr * (parent.getSize() - 1));

				const x = parent.getLeftLength() + parent.contentArea.width;
				const y = parent.getTopLength();
				const width	= viewport.getVerticalScrollbarWidth();
				const height = parent.contentArea.height;

				viewport.setVerticalScrollbarBox(x, y, width, height);

				const clipBox = parent.getContentBox();
				if (this.collapseBorders) {
					clipBox.y += current.margin.bottom;
					clipBox.height -= current.margin.bottom;
				}
				viewport.setTargetClipRegion(clipBox);
			}
		}
		return {
			'width'	: parent.getTotalWidth(),
			'height': parent.getTotalHeight()
		};
	}
}
