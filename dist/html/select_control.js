"use strict";
// This adds "view"/hovering functionality to the plain DOM model for HTMLSelectElement
colorjack.controlFactory.Select = function () {
    var deactivate = function (event) {
        if (event.preventDefault) {
            event.preventDefault();
        }
        else {
            event.returnValue = false;
        }
        return false;
    };
    var widgetSelectLayer = null;
    var selectionCallback = null;
    var hoverCallback = null;
    var dropDownMode = true; // If (dropDownMode), hide after a 'click' selection
    var font = null;
    var selectLayerTop = 0;
    var setFont = function (f) { font = f; };
    var getFont = function () {
        if (!font) {
            throw new Error("colorjack.controlFactory.Select.getFont(): Need to set font first");
        }
        return font;
    };
    var doc = colorjack.currentDocument;
    var selectElement = doc.createElement("select");
    var repaint = function () {
        var ctx = widgetSelectLayer.getContext('2d');
        selectElement.display(ctx); // This should call each option to refresh itself.
    };
    var layoutCanvas = function (selectLayer, offsetLeft, offsetTop, width, height) {
        selectLayer.style.left = offsetLeft + "px";
        selectLayer.style.top = offsetTop + "px";
        //selectLayer.style.border = "1px solid #ddd";	// For debugging
        selectLayer.style.background = font.getTextColor(); // Font color (background, otherwise it's white)
        // if empty, the font is used as a mask
        if (dropDownMode) {
            selectLayer.style.visibility = "hidden";
        }
        document.body.appendChild(selectLayer);
        //info("Canvas size: " + width + "," + height);
        colorjack.currentWindow.setCanvasSize(selectLayer, width, height);
        return selectLayer;
    };
    var comboBoxHeight = 0;
    var DefaultBoxLayout = function () {
        this.setOptionBoxSize = function (box) { };
        this.setSelectBoxSize = function (box) { };
        this.getSelectTopOffset = function (top, comboHeight, scrollPos) {
            return top + comboHeight;
        };
        this.getCollapseBorder = function () { return true; };
    };
    var defaultBoxLayout = new DefaultBoxLayout();
    var boxLayout = null;
    var setOffset = function (offsetLeft, offsetTop) {
        var top;
        if (boxLayout && boxLayout.getSelectTopOffset) {
            var idx = selectElement.getSelectedIndex();
            var options = selectElement.getOptions();
            var option = options.item(idx);
            // TODO: selectLayerTop: how to coordinate with the parent window/viewport and limit the scrolling
            var scrollOffsetY = option.getOffset().y; // Math.min(option.getOffset().y, selectLayerTop);
            top = boxLayout.getSelectTopOffset(offsetTop, comboBoxHeight, scrollOffsetY);
        }
        else {
            top = defaultBoxLayout.getSelectTopOffset(offsetTop, comboBoxHeight, 0);
        }
        widgetSelectLayer.style.left = offsetLeft + "px";
        widgetSelectLayer.style.top = top + "px";
    };
    var setOptions = function (options) {
        var p = selectElement.getSelectPainter();
        for (var i = 0; i < options.length; i++) {
            var current = options[i];
            var option = doc.createElement("option");
            option.id = current.id;
            option.setValue(current.id);
            option.setLabel(current.label);
            option.setIndex(i);
            option.style.setFont(getFont());
            option.style.setBackgroundColor("white", "#dff", "43a");
            option.style.setBorderColor("white", "#9cb", "#14a");
            if (p && p.paintOption) {
                option.setOptionPainter(p);
            }
            selectElement.appendChild(option);
        }
        if (options.length > 0) {
            var idx = selectElement.getSelectedIndex();
            if (idx === -1) {
                // Set default to first element if nothing was previously set
                selectElement.setSelectedIndex(0);
            }
        }
    };
    var setBoxLayout = function (layout) {
        boxLayout = layout;
    };
    var setSelectBoxProperties = function (optionBox, selectBox) {
        defaultBoxLayout.setOptionBoxSize(optionBox);
        defaultBoxLayout.setSelectBoxSize(selectBox);
        if (boxLayout) {
            if (boxLayout.setOptionBoxSize) {
                boxLayout.setOptionBoxSize(optionBox);
            }
            if (boxLayout.setSelectBoxSize) {
                boxLayout.setSelectBoxSize(selectBox);
            }
        }
    };
    var highlight = -1;
    var setEvents = function (selectLayer) {
        var options = selectElement.getOptions();
        var MOZILLA_BUTTON_RIGHT = 1; // Mozilla and (wrong) standard W3C event model
        var isDraggingEvent = function (e) {
            var drag = (e.which === MOZILLA_BUTTON_RIGHT);
            return drag;
        };
        selectLayer.onmousedown = function (e) {
            var x = e.layerX;
            var y = e.layerY;
            var v = selectElement.viewport;
            if (v.isInsideScrollThumb(x, y)) {
                v.setDragStart(x, y);
                repaint();
            }
        };
        selectLayer.onmouseup = function (e) {
            var v = selectElement.viewport;
            v.setDragStop();
            repaint();
        };
        // We do need mouse listener on the actual browser! to catch and handle the "mouseup" properly.
        // Solution!
        // When the DropDown is in the "visible" mode, then we can "capture" all the mouse events handled at the document level!
        // When the DropDown is in the invisible state, we can "release" the handle on the mouse for the whole document.
        var selectContentBounds = selectElement.getContentBox(); // This is constant
        selectLayer.onclick = function (e) {
            var x = e.layerX;
            var y = e.layerY;
            var v = selectElement.viewport;
            if (v.isInsideScrollBar(x, y)) {
                v.scrollToCoordinates(x, y);
            }
            else if (selectContentBounds.isPointInsideBox(x, y)) {
                for (var i = 0; i < options.length; i++) {
                    var option = options.item(i);
                    var selected = selectElement.isInsideOption(i, x, y);
                    option.setSelected(selected);
                    if (selected) {
                        selectElement.setSelectedIndex(i);
                        if (dropDownMode) {
                            selectLayer.style.visibility = "hidden";
                        }
                        if (selectionCallback) {
                            var item = options.item(i);
                            var value = item.getValue();
                            var label = item.getLabel();
                            selectionCallback(value, label);
                        }
                    }
                }
            }
            repaint();
        };
        selectLayer.onmousemove = function (e) {
            var x = e.layerX;
            var y = e.layerY;
            var v = selectElement.viewport;
            if (v.drag.dragging && isDraggingEvent(e)) {
                v.drag.end.x = x;
                v.drag.end.y = y;
                var diff = Math.abs(v.drag.end.y - v.drag.moved.y);
                var smoothScrollingInc = 4; // The higher, the smoother for scrolling, but also the jumpier it is.
                if (diff > smoothScrollingInc) {
                    v.dragTo(v.drag);
                    repaint();
                    deactivate(e);
                }
            }
            else {
                v.drag.dragging = false;
            }
            var newHighlight = -1;
            var i, option;
            if (selectContentBounds.isPointInsideBox(x, y)) {
                var options = selectElement.getOptions();
                for (i = 0; i < options.length; i++) {
                    option = options.item(i);
                    option.setHighlight(false);
                }
                // Select a single hovering item (overlapping borders: mouse cursor could be "inside" two overlapping boxes)
                for (i = 0; i < options.length; i++) {
                    var hover = selectElement.isInsideOption(i, x, y);
                    if (hover) {
                        option = options.item(i);
                        option.setHighlight(hover);
                        newHighlight = i;
                        break;
                    }
                }
                if (highlight !== newHighlight) { // Redraw
                    var ctx = selectLayer.getContext('2d');
                    ctx.save();
                    if (highlight > -1 || newHighlight > -1) {
                        v.clipToTargetRegion(ctx);
                    }
                    if (highlight > -1) {
                        options.item(highlight).display(ctx);
                    }
                    if (newHighlight > -1) {
                        var hoverOption = options.item(newHighlight);
                        hoverOption.display(ctx);
                        if (hoverCallback) {
                            var value = hoverOption.getValue();
                            var label = hoverOption.getLabel();
                            hoverCallback(value, label);
                        }
                    }
                    ctx.restore();
                }
                highlight = newHighlight;
            }
        };
        repaint();
    };
    var setLayoutOffset = function (offsetLeft, offsetTop, comboHeight) {
        comboBoxHeight = comboHeight;
        // --- Layout: compute layout ----
        var optionBoxStyle = new colorjack.css.BoxStyle(6, 2, 10);
        var selectBoxStyle = new colorjack.css.BoxStyle(2, 10, 10);
        setSelectBoxProperties(optionBoxStyle, selectBoxStyle);
        optionBoxStyle.setFont(getFont());
        selectBoxStyle.setFont(getFont());
        var options = selectElement.getOptions();
        var selectLayer = colorjack.currentWindow.createCanvasLayer();
        var ctx = selectLayer.getContext('2d');
        // Default size for empty options[]
        var width = 400;
        var height = 320;
        if (options.length > 0) {
            var collapseBorder = (boxLayout && boxLayout.getCollapseBorder) ? boxLayout.getCollapseBorder() : true;
            var layoutManager = new colorjack.css.VerticalLayout(collapseBorder);
            var size = layoutManager.computeLayout(ctx, selectElement, optionBoxStyle, selectBoxStyle);
            width = size.width;
            height = size.height;
        }
        else {
            throw new Error("Select control is empty!");
        }
        layoutCanvas(selectLayer, offsetLeft, offsetTop, width, height);
        widgetSelectLayer = selectLayer;
        if (!selectLayer) {
            throw new Error("Error: selectLayer was not created!!!");
        }
        setEvents(selectLayer);
        return {
            'width': width,
            'height': height
        };
    };
    var setSelectionCallback = function (f) {
        selectionCallback = f;
    };
    var setHoverCallback = function (f) {
        hoverCallback = f;
    };
    var setVisible = function (v, e) {
        widgetSelectLayer.style.visibility = (v) ? "visible" : "hidden";
        if (v) {
            //repaint();
            // Why I'm simulating a mousemove()?
            // Why? For Mike: So for the dynamic widget, after some option down is "checked", we can update to the new "mouse" position for the selection
            var t = widgetSelectLayer.style.top;
            var tt = t.substr(0, t.length - 2);
            var top = parseInt(tt, 10);
            var fakeE = {
                'layerX': e.layerX,
                'layerY': e.layerY - top
            };
            widgetSelectLayer.onmousemove(fakeE); // We didn't really move the mouse though.
        }
    };
    var scrollUp = function () {
        selectElement.viewport.scrollUp();
        repaint();
    };
    var scrollDown = function () {
        selectElement.viewport.scrollDown();
        repaint();
    };
    var scrollTo = function (percent) {
        selectElement.viewport.verticalScrollTo(percent);
        repaint();
    };
    var updateHighlight = function () {
        var options = selectElement.getOptions();
        for (var i = 0; i < options.length; i++) {
            var option = options.item(i);
            option.setHighlight(false);
        }
        var selected = selectElement.getSelectedIndex();
        if (selected >= 0) {
            options.item(selected).setHighlight(true);
            highlight = selected;
        }
        else {
            highlight = -1;
        }
        repaint();
    };
    var Helper = function () {
        return {
            'setFont': setFont,
            'setOptions': setOptions,
            'setBoxLayout': setBoxLayout,
            'setOffset': setOffset,
            'setLayoutOffset': setLayoutOffset,
            'setVisible': setVisible,
            'setSelectionCallback': setSelectionCallback,
            'setHoverCallback': setHoverCallback,
            'scrollTo': scrollTo,
            'scrollUp': scrollUp,
            'scrollDown': scrollDown,
            'updateHighlight': updateHighlight
        };
    };
    return colorjack.util.mixin(selectElement, new Helper());
};
