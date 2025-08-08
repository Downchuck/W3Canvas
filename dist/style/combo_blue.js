"use strict";
var BlueComboBoxPainter = function () {
    var painter = new colorjack.css.BoxModelPainter();
    var gradient = "#cc0";
    var fullBox = null;
    var labelBox = null;
    var iconBox = null;
    /*
     *	initLayout(): This is the right place to initialize any resources such as gradients and images.
     */
    var initLayout = function (box, label, icon) {
        fullBox = box;
        labelBox = label;
        iconBox = icon;
        var createGradient = function (w, h) {
            var canvas = colorjack.currentWindow.createCanvasLayer(w, h);
            var ctx = canvas.getContext('2d');
            var x = 0;
            var y = 0;
            painter.setupLinearGradient(ctx, x, y, w, h, '#ddf', 'blue', true);
            ctx.fillRect(x, y, w, h);
            var pattern = ctx.createPattern(canvas, 'repeat');
            return pattern;
        };
        gradient = createGradient(1, box.height);
    };
    var paintIcon = function (ctx, state) {
        try {
            var box = iconBox;
            var arrowBoxWidth = box.width;
            var scaling = 1.0;
            var color = (state == "over") ? "#afa" : "#7c7";
            // Draw the drop down arrow
            ctx.save();
            ctx.fillStyle = color;
            ctx.translate(labelBox.width, box.height / 5);
            ctx.beginPath();
            var arrowWidth = 40 * scaling;
            var x = 40 * scaling;
            var y = (arrowBoxWidth / 5);
            ctx.moveTo(x, y);
            ctx.lineTo(x + arrowWidth, y);
            ctx.lineTo((2 * x + arrowWidth) / 2, y + arrowWidth / 2);
            ctx.fill();
            ctx.restore();
        }
        catch (e41) {
            throw new Error("Error: " + e41.message);
        }
    };
    var paintComboBox = function (ctx, selectedValue, font) {
        ctx.fillStyle = colorjack.currentWindow.getBackgroundColor();
        ctx.fillRect(0, 0, fullBox.width, fullBox.height);
        painter.paintRoundedTextBox(ctx, fullBox, gradient, selectedValue, font, labelBox);
        paintIcon(ctx, "normal");
    };
    return {
        'initLayout': initLayout,
        'paintIcon': paintIcon,
        'paintComboBox': paintComboBox
    };
};
var LightBlueSelectPainter = function () {
    var painter = new colorjack.css.BoxModelPainter();
    var paintSelectBackground = function (ctx, boxModel, style) {
        var box = boxModel.getMarginBox();
        ctx.fillStyle = document.body.bgColor;
        ctx.fillRect(0, 0, box.width, box.height);
        ctx.fillStyle = "white";
        painter.paintRoundedBox(ctx, box.x, box.y, box.width, box.height, 10, 10);
        ctx.clip();
        ctx.fillRect(box.x, box.y, box.width, box.height);
    };
    var paintOption = function (ctx, node, state, width, label) {
        var style = (!state.hover) ? node.style : {
            'getPaddingColor': function () { return "white"; },
            'getBorderColor': function () { return "#9cb"; },
            'getBackgroundColor': function () { return "#dff"; },
            'getFont': function () { return node.style.getFont(); }
        };
        var boxModel = node;
        painter.paintBox(ctx, boxModel, style, width, label);
    };
    return {
        'paintSelectBackground': paintSelectBackground,
        'paintOption': paintOption
    };
};
var overridePainters = function (comboBox) {
    var useComboBoxPainter = true;
    if (useComboBoxPainter) {
        var bluePainter = new BlueComboBoxPainter();
        comboBox.setComboBoxPainter(bluePainter);
        comboBox.setBoxLayout({
            'setComboBoxModel': function (box) {
                box.padding.top = 5;
            }
        });
    }
    var useSelectPainter = true;
    if (useSelectPainter) {
        var selectPainter = new LightBlueSelectPainter();
        comboBox.getSelectControl().setSelectPainter(selectPainter);
        comboBox.getSelectControl().setBoxLayout({
            'getCollapseBorder': function () {
                return false;
            }
        });
    }
};
