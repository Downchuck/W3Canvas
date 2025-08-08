"use strict";
colorjack.controlFactory.InputRange = function (layer) {
    var input = colorjack.currentDocument.createElement("input");
    input.setType("range");
    var thumb = new Image();
    thumb.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAsAAAAKCAYAAABi8KSDAAABEUlEQVQYlWWPsYrCQBCG5xofwMouZpdd1Je0DxgUo6BNVthi41Qp0oRUqQM+0ndFvDvwpvuZ7xvmF5nnS0QWIrIUkWy1WiEi2Tsv3vt/oDPGcDgcMMYgIu5T+AW997Rty36/p21bvPefwh84DAPH45Hr9crpdGIYhk9BrHOOvu85n8+EEIgxEkKgqir6vsc5h4hYybIMVaUsSx6PByklmqYhpUQIgbIsUVXW6zVijKHrOi6XCzFGns8nqkrTNMQYqaqKruvmwlmWkVKiKAru9zt1XRNCoK5rbrcbRVGQUpovi4i11qKqjOPINE28Xi+maWIcR1QVa+3887ulzfMc7z2bzYbdbsd2u8U5R57nP+DyG04Ht3Cng64/AAAAAElFTkSuQmCC";
    layer.style.cursor = "crosshair";
    /*
    // Testing the Box Model
    input.setMargin(10);
    input.setBorder(15);
    input.setPadding(20);
    input.contentArea.width = 500;
    input.contentArea.height = 40;
    */
    var min = 0;
    var max = 100;
    var step = 1;
    var width = layer.getAttribute("width") - 0;
    var height = layer.getAttribute("height") - 0;
    var isVertical = height > width;
    var w = width - thumb.width;
    var h = height - thumb.height;
    var x0 = thumb.width / 2;
    var y0 = thumb.height / 2;
    var getValue = function () {
        return input.getValue();
    };
    var setValue = function (value) {
        if (isNaN(value))
            value = 0;
        value = value > max ? max : value < min ? min : value;
        // round to step
        value = Math.round((value / step) * step);
        input.setValue(value);
        repaint();
    };
    var getRelativeValue = function () {
        return ((parseFloat(getValue()) || 0) - min) / (max - min);
    };
    var setRelativeValue = function (relativeValue) {
        setValue((max - min) * relativeValue);
    };
    var repaint = function () {
        var c = layer.getContext("2d");
        // clear
        c.fillStyle = '#000';
        c.fillRect(0, 0, width, height);
        // draw slider-background
        c.fillStyle = '#333';
        if (isVertical) {
            var x = 4 + width / 2;
            c.moveTo(x - 5, y0);
            c.lineTo(x - 1.5, y0 + 0.5);
            c.lineTo(x - 1.5, h + y0);
            c.lineTo(x - 5, h + y0);
            var g = c.createLinearGradient(x - 5, 0, x - 1.5, 0);
        }
        else {
            var y = 4 + height / 2;
            c.moveTo(x0, y - 5);
            c.lineTo(x0 + 0.5, y - 1.5);
            c.lineTo(w + x0, y - 1.5);
            c.lineTo(w + x0, y - 5);
            var g = c.createLinearGradient(0, y - 5, 0, y - 1.5);
        }
        c.fill();
        c.lineWidth = 1;
        c.strokeStyle = '#151515';
        c.stroke();
        c.globalAlpha = 0.4;
        g.addColorStop(0, "#aaa");
        g.addColorStop(1, "#000");
        c.fillStyle = g;
        c.fill();
        c.globalAlpha = 1;
        c.beginPath();
        // draw dashes
        var small = 0, max = (isVertical ? h : w) - 3;
        for (var n = 0; n <= max; n += (max / 10)) {
            if (isVertical) {
                var y = y0 + Math.round(n) + 1.5;
                c.moveTo(x - 7, y);
                c.lineTo(x - (small % 5 ? 9 : 10), y);
            }
            else {
                var x = x0 + Math.round(n) + 1.5;
                c.moveTo(x, y - 7);
                c.lineTo(x, y - (small % 5 ? 9 : 10));
            }
            c.strokeStyle = "#ccc";
            c.stroke();
            c.beginPath();
            small++;
        }
        // draw thumb
        if (isVertical) {
            c.drawImage(thumb, x - 9, h - getRelativeValue() * h);
        }
        else {
            c.drawImage(thumb, getRelativeValue() * w, y - 9);
        }
    };
    layer.addEventListener("mousedown", function (event) {
        var oldValue = getValue();
        var clientRect = layer.getBoundingClientRect();
        if (isVertical) {
            var offsetY = event.clientY - clientRect.top - layer.clientTop;
            setRelativeValue((h - offsetY + y0) / h);
        }
        else {
            var offsetX = event.clientX - clientRect.left - layer.clientLeft;
            setRelativeValue((offsetX - x0) / w);
        }
        if (getValue() != oldValue) {
            jsb.behavior.dispatchEvent(layer, "change");
        }
    }, true);
    return {
        'repaint': repaint,
        'getName': function () { return input.getName(); },
        'setName': function (n) { input.setName(n); },
        'getMin': function () { return min; },
        'setMin': function (v) { min = v - 0; repaint(); },
        'getMax': function () { return max; },
        'setMax': function (v) { max = v - 0; repaint(); },
        'getStep': function () { return step; },
        'setStep': function (v) { step = v - 0; repaint(); },
        'getValue': getValue,
        'setValue': setValue
    };
};
