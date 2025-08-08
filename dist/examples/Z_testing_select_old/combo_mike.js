"use strict";
var musicSelection = null;
var menuImgs = {
    'menuArrows': new Image(),
    'menuChk': new Image(),
    'menuChkDark': new Image(),
};
menuImgs.menuArrows.src = "data:image/png,%89PNG%0D%0A%1A%0A%00%00%00%0DIHDR%00%00%00%0F%00%00%00%0A%08%06%00%00%00k%1B%04%F9%00%00%00%19tEXtSoftware%00Adobe%20ImageReadyq%C9e%3C%00%00%00lIDATx%DAb%FC%FF%FF%3F%03%14%08%021%0F%10%7F%01%E2%F7%0CD%00%26d%8D%8C%8C%8C%7DP%03%04%89%D5%8C%AC%91%81%14%03%98%905%C2%00%92%01x%01%23%D0%CF%828%14%12%F4%3B%13%03%05%80%05%9B%B3A%00%E8%A2%22bl%FE%02U%88%AE%F1%0BA%ABA%F1%0C%F27%10%CB%02%B9%ABA4%94%CF%40%083R%92H%00%02%0C%00%1EJK%08%E1%7D%8B%2C%00%00%00%00IEND%AEB%60%82";
menuImgs.menuChk.src = "data:image/png,%89PNG%0D%0A%1A%0A%00%00%00%0DIHDR%00%00%00%0C%00%00%00%0B%08%06%00%00%00Kpl_%00%00%00%19tEXtSoftware%00Adobe%20ImageReadyq%C9e%3C%00%00%00%C2IDATx%DAb%60%20%02%ACX%B1%E2%FF%94)S%FE%13%A3%96%A1%A3%A3%03E1%13%3E%C5555%FF%FF%FC%F9%C3%90%93%93%C3H%D0d%90%E2%8A%8A%0A%0Cg%60%B5%A1%A5%A5%E5%FF%9B7o%182220%E4%98%0A%0A%0A%FE%AFY%B3%06n%D2%8C%193%FE%3Fx%F0%80!%22%22%82AAA%01%C3)L_%BE%7Ca%D8%B1c%07%03P%D1%FF%03%07%0E%FC%3Fs%E6%0C%83%81%81%01%83%83%83%03Vw3%81%24A%60%C3%86%0D%0C%40%9B%18888%F0z%92)%24%24%04%CC%B8r%E5%0A%C3%8F%1F%3F%18%60%7C%9C%1A%24%24%24%18MLL%C0%1C%19%19%19%9CNA%017n%DC%F8%0F%8AMb%22%12%20%C0%00%88%20N%AE%CA%22nc%00%00%00%00IEND%AEB%60%82";
menuImgs.menuChkDark.src = "data:image/png,%89PNG%0D%0A%1A%0A%00%00%00%0DIHDR%00%00%00%0C%00%00%00%0B%08%06%00%00%00Kpl_%00%00%00%19tEXtSoftware%00Adobe%20ImageReadyq%C9e%3C%00%00%00%D0IDATx%DAb%F8%FF%FF%3F%03!%3Cy%F2%E4%FF%EB%D7%AF%FF%0Fb%13T%BCw%EF%5E%B8b%82%1AN%9E%3C%F9%FF%E0%C1%83%AF%90%C5%18%C1%BA%B0%80S%A7N%FDgaa%F9kdd%C4%82%2C%CE%84M%F1%A1C%87%FE%0B%0A%0A2%3C%7F%FE%BC%09C%F2%CA%95%2B%3F%7B%7B%7Bm%60V%AEZ%B5%EA%FF%DD%BBw%FF%B7%B4%B4l%C1%E6LF%90%24P%DF%85%EB%D7%AF%DB%5E%B8p%E1ddd%A4%D6%A5K%97%EE%07%04%04(a%B3%9D%11%14%02zzz%0C%40%0D7%95%95%95%D5%81b%DF544%B8%18p%00%26%A0%E7%3E%82%18%9A%9A%9A%EAlll%0Ck%D7%AE-%60%C0%07%90%DD%7D%F4%E8%D1E%84%E2%05L%00%15%A6%01cs11%B1%0E%10%60%00%15%E2%04%DC90%00(%00%00%00%00IEND%AEB%60%82";
var MikeComboBoxPainter = function () {
    var painter = new BoxModelPainter();
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
        iconBox.x = fullBox.width - 20;
        iconBox.height = Math.round(labelBox.height);
        var createGradient = function (w, h) {
            var canvas = WindowsLib.createCanvasLayer(w, h);
            var ctx = canvas.getContext('2d');
            var x = 0;
            var y = 0;
            setupLinearGradient(ctx, x, y, w, h, '#fff', '#888', true);
            ctx.fillRect(x, y, w, h);
            var pattern = ctx.createPattern(canvas, 'repeat');
            return pattern;
        };
        gradient = createGradient(1, box.height);
    };
    var arrowPainted = false; // only paint once: always fixed
    var paintArrow = function (ctx, state) {
        try {
            if (!arrowPainted) {
                //var w = menuImgs.menuArrows.width;
                //var h = menuImgs.menuArrows.height;
                // Center the image within the iconBox
                paintImage(ctx, menuImgs.menuArrows, iconBox, "center", "center");
                arrowPainted = true;
            }
        }
        catch (e41) {
            alert("Error: " + e41.message);
        }
    };
    var paintComboBox = function (ctx, selectedValue, font) {
        ctx.fillStyle = WindowsLib.getBackgroundColor();
        ctx.fillRect(0, 0, fullBox.width, fullBox.height);
        painter.paintRoundedBox(ctx, fullBox, gradient, selectedValue, font, labelBox);
        arrowPainted = false; // repaint arrow!
        paintArrow(ctx, "normal");
    };
    return {
        'initLayout': initLayout,
        'paintArrow': paintArrow,
        'paintComboBox': paintComboBox
    };
};
var MikeSelectPainter = function (color) {
    var painter = new BoxModelPainter();
    var topColor = color || "white";
    var paintSelectBackground = function (ctx, boxModel, style) {
        var box = boxModel.getMarginBox();
        ctx.fillStyle = WindowsLib.getBackgroundColor();
        ctx.fillRect(0, 0, box.width, box.height);
        ctx.save();
        ctx.fillStyle = topColor;
        round_rectangle(ctx, box.x, box.y, box.width, box.height, 6, 6);
        ctx.clip();
        ctx.fillRect(box.x, box.y, box.width, box.height);
        ctx.restore();
    };
    var paintOption = function (ctx, node, state, width, label, isFirst, isLast) {
        var style = (!state.hover) ? {
            'getPaddingColor': function () { return "white"; },
            'getBorderColor': function () { return "#aaa"; },
            'getBackgroundColor': function () { return "white"; },
            'getFont': function () { return node.style.getFont(); }
        } : {
            'getPaddingColor': function () { return "white"; },
            'getBorderColor': function () { return "#aaa"; },
            'getBackgroundColor': function () { return "#aaa"; },
            'getFont': function () { return node.style.getFont(); }
        };
        var boxModel = clone(node);
        if (isFirst) {
            boxModel.border.top = 0;
        }
        else if (isLast) {
            boxModel.border.bottom = 0;
        }
        painter.paintBox(ctx, boxModel, style, width, label);
        var img = (state.hover) ? menuImgs.menuChkDark : menuImgs.menuChk;
        var box = boxModel.getPaddingBox();
        box.x += 4;
        if (state.checked) {
            paintImage(ctx, img, box);
        }
    };
    return {
        'paintSelectBackground': paintSelectBackground,
        'paintOption': paintOption
    };
};
var colorCnt = 0;
var overrideMikePainters = function (comboBox) {
    var useComboBoxPainter = true;
    if (useComboBoxPainter) {
        var bluePainter = new MikeComboBoxPainter();
        comboBox.setComboBoxPainter(bluePainter);
        var MikeComboBoxLayout = function () {
            this.setComboBoxModel = function (box) {
                box.setMargin(0);
                box.setBorder(0);
                box.setPadding(1);
                box.padding.top = 2;
            };
            this.setTextBoxModel = function (box) {
                box.setMargin(0);
                box.setBorder(0);
                box.padding.left = 20;
                box.padding.top = 3;
                box.padding.right = 50;
                box.padding.bottom = 3;
            };
            this.setArrowBoxModel = function (box) {
                box.setMargin(0);
                box.setBorder(1);
                box.setPadding(0);
                box.contentArea.width = 20;
                box.contentArea.height = 20;
            };
        };
        comboBox.setBoxLayout(new MikeComboBoxLayout());
    }
    var useSelectPainter = true;
    if (useSelectPainter) {
        var MikeSelectLayout = function () {
            this.setOptionBoxSize = function (box) {
                box.setMargin(0);
                box.setBorder(1);
                box.border.right = 0;
                box.border.left = 0;
                box.padding.top = 4;
                box.padding.right = 40; // enough for the arrow box!
                box.padding.bottom = 2;
                box.padding.left = 20;
            };
            this.setSelectBoxSize = function (box) {
                box.setMargin(0);
                box.setBorder(0);
                box.setPadding(0);
                box.padding.top = 4;
                box.padding.bottom = 4;
            };
            this.getSelectTopOffset = function (top, comboHeight, scrollOffset) {
                // alert("Scroll: " + window.pageYOffset);
                // return top + comboHeight;
                // return top;
                var topOffset = Math.max(window.pageYOffset, top - scrollOffset);
                // alert("Top offset: " + topOffset);
                return topOffset;
            };
        };
        var selectControl = comboBox.getSelectControl();
        selectControl.setBoxLayout(new MikeSelectLayout());
        var color = (colorCnt % 2 === 0) ? "red" : "white";
        var selectPainter = new MikeSelectPainter(color);
        selectControl.setSelectPainter(selectPainter);
        colorCnt++;
    }
};
