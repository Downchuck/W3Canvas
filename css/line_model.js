
colorjack.css.VerticalLayout = function(collapseBorders) {

	var setup = function(ctx, parent, itemBoxStyle, parentBoxStyle, viewport) {
		var maxContentWidth = 0;
		
		var node = parent.getFirstChild();
		while (node) {
			if (node.computeContentSize) {
				node.computeContentSize(ctx);	// use the String measure()
			}
			else {
				throw new Error("node.computeContentSize() not defined");
			}			
			node.copyRectFrom(itemBoxStyle);	
			
			maxContentWidth = Math.max(maxContentWidth, node.contentArea.width);
			node = node.getNextSibling();
		}
		
		// Resize all nodes to the maximum width		
		node = parent.getFirstChild();
		while (node) { 
			node.contentArea.width = maxContentWidth;
			node = node.getNextSibling();
		}
		parent.copyRectFrom(parentBoxStyle);
		
		if (viewport && viewport.needsVerticalScrollbar()) {
			// Make sure to have enough space for the vertical scrollBar within the padding area
			
			// Allocate extra space for the vertical scrollBar within the "padding" area
			parent.padding.right += viewport.getVerticalScrollbarWidth();
			// parent.padding.bottom += viewport.getHorizontalScrollbarWidth();
		}		
		return maxContentWidth;
	};

	var computeLayout = function(ctx, parent, itemBoxStyle, parentBoxStyle) {
		// Get the box model information from the given styles
		var maxContentWidth     = setup(ctx, parent, itemBoxStyle, parentBoxStyle, parent.viewport);
		
        var maxBlockCount       = (parent.getSize)? parent.getSize() : 911;
		
		var leftOffset          = parent.getLeftLength();
		var topOffset           = parent.getTopLength();
		var scrollingHeight     = topOffset;
		var parentContentHeight = topOffset;
		var itemWidth           = 0;
		var itemCount           = 0;
		var current             = null;
		
		var first = parent.getFirstChild();
		if (first) {
			first.setOffset(leftOffset, topOffset);
			itemCount = 1;
			var adjust;

			current = first;
			var next = current.getNextSibling();
			while (next) {
				if (collapseBorders) {
					adjust = - current.border.bottom - next.margin.top;
					topOffset += current.getTotalHeight() - current.margin.bottom + adjust;
				}
				else {
					// Collapse in-between (bottom/top) margins with the greatest one.
					var inBetweenMargin = Math.max(current.margin.bottom, next.margin.top);
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
			if (collapseBorders) {
				adjust -= (current.margin.bottom);
			}
			scrollingHeight = scrollingHeight + adjust;
			parentContentHeight = parentContentHeight + adjust;
	
			parent.contentArea.width  = itemWidth;
			parent.contentArea.height = parentContentHeight;
		
			var viewport = parent.viewport;
			if (viewport && viewport.needsVerticalScrollbar()) {
				var unitIncr = current.getTotalHeight() - current.margin.bottom;
				if (collapseBorders) {
					unitIncr = unitIncr - current.margin.bottom - current.border.bottom;
				}
				viewport.setVerticalSpan(0, scrollingHeight, parentContentHeight);				
				viewport.setVerticalIncrement(unitIncr, unitIncr * (parent.getSize() - 1));
				
				// Setup Vertical Scrollbar Box within the 'right' padding area
				var x		= parent.getLeftLength() + parent.contentArea.width;
				var y		= parent.getTopLength();
				var width	= viewport.getVerticalScrollbarWidth();
				var height	= parent.contentArea.height;
				
				viewport.setVerticalScrollbarBox(x, y, width, height);
				
				var clipBox = parent.getContentBox();
				if (collapseBorders) {
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
	};
	
	return {
		'computeLayout'	: computeLayout
	};
};

