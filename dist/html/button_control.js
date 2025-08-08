"use strict";
// Conceptually, in most GUI toolkits, "check", "radio", "button" are part of the same family.
// Likewise, for the "a href", we can think of it as a button too.
// Check: colorjack.controlFactory.ComboBox (to refactor here and consolidate too)
// Dynamic width:  according to the size of the font
// Dynamic height: according to the height of the font.
// BoxModel for both: full box, icon box, label box... layout: align.LEFT for the icon
(function () {
    var buttonIcons = {
        'blankIcon': new Image(),
        'checkedRadioIcon': new Image(),
        'uncheckedRadioIcon': new Image(),
        'checkedCheckBoxIcon': new Image(),
        'uncheckedCheckBoxIcon': new Image()
    };
    buttonIcons.blankIcon.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAIAAABvFaqvAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAgY0hSTQAAeiYAAICEAAD6AAAAgOgAAHUwAADqYAAAOpgAABdwnLpRPAAAADVJREFUOE9j/P//PwNVANAgqgAGqpgC8taoQQRDYDSMCAbRaDoiHESjYTQaRkSEAGElVCuPAAbjdOFsJI7xAAAAAElFTkSuQmCC";
    buttonIcons.checkedRadioIcon.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAIAAABvFaqvAAAABGdBTUEAALGPC/xhBQAAAG5JREFUOE9jZGZmZqAKABpEFcBAFVNA3hqZBv1HBfgDAWcYoZkC4eIxC7tBWE3BbxYBg+BOgBuNy1FYDELWw9DQAEFA/fjNGhIGYfUFOWGEbBBm9JEQ2BCl1ElHWM0iM2WTWiqM0GKEpGAafGEEAEBa8MJv2SpKAAAAAElFTkSuQmCC";
    buttonIcons.uncheckedRadioIcon.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAIAAABvFaqvAAAABGdBTUEAALGPC/xhBQAAAGpJREFUOE/l1N0KABAMBtBp7//MTErYj6ZdkF1RnOYjCREhpAgKKQhR6rH+hPJcdghqRovSpoYlQ6JiWxuot9BprSkBGvdoY849AVHbPJGTjEaIX58j7LY05h2J1uHL9v4Kn34jrpjuy6gALDQCtk6jFH4AAAAASUVORK5CYII=";
    buttonIcons.checkedCheckBoxIcon.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAIAAABvFaqvAAAABGdBTUEAALGPC/xhBQAAAIhJREFUOE/N1OsKgDAIBWBjL+6blzEwcZuXMpj0032chu5orUFJEVRSUKLcv1UPYb5kiCcROWemqH8DCBD7R9FfJmKiKz7EffK6RiUEKWuqRCG2VooPUYc8LG9XzYZ/2SM0HS8fUqFWQ5qDjFEPQRyqBrI3L5rI3V8Lyj4k8+3/+ML98ELukugCcyd7G9ldrsQAAAAASUVORK5CYII=";
    buttonIcons.uncheckedCheckBoxIcon.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAIAAABvFaqvAAAABGdBTUEAALGPC/xhBQAAAElJREFUOE9jZGZmZqAKABpEFcBAFVNA3qK+QQ2kA2RHIFwENOc/KQCoftQgAgE2GkaEU9RoGA2SMCK1IMGe+yks4WhQQg4WFwEAizzaizrcI/MAAAAASUVORK5CYII=";
    var InputRadioGroup = function () {
        var allRadios = [];
        var registerRadio = function (radio) {
            allRadios.push(radio);
        };
        var getRadioGroup = function (name) {
            var result = [];
            for (var i = 0; i < allRadios.length; i++) {
                if (allRadios[i].getName() === name) {
                    result.push(allRadios[i]);
                }
            }
            return result;
        };
        var getCheckedRadio = function (name) {
            var group = getRadioGroup(name);
            var radio = null;
            for (var i = 0; i < group.length; i++) {
                if (group[i].isChecked()) {
                    radio = group[i];
                    break;
                }
            }
            return radio;
        };
        return {
            'registerRadio': registerRadio,
            'getCheckedRadio': getCheckedRadio
        };
    };
    var inputRadioGroup = new InputRadioGroup();
    // Interface: ClickHandler
    // TODO: This should abstract the common functionality of all the Buttons: check, radio, button, hyperlink
    var BasicButton = function (layer, el) {
        var font = new ArialFont(0.10);
        var label = "LABEL";
        var w = layer.getAttribute("width"); // - el.getLeftLength() - el.getRightLength();
        var h = layer.getAttribute("height"); // - el.getTopLength() - el.getBottomLength();
        el.setSize(w, h);
        var painter = new colorjack.css.BoxModelPainter();
        var getImage = function (domElement) {
            return buttonIcons.blankIcon;
        };
        var getLabel = function () {
            return label;
        };
        var repaint = function () {
            var ctx = layer.getContext('2d');
            var img = getImage(el);
            var label = getLabel(el);
            var contentBox = el.getContentBox(); // not taking into account the space for the icon
            ctx.save();
            //ctx.fillStyle = "white";
            ctx.clearRect(contentBox.x, contentBox.y, contentBox.width, contentBox.height);
            painter.paintImage(ctx, img, contentBox);
            ctx.fillStyle = "red";
            contentBox.x += 20;
            contentBox.y += 4;
            painter.paintText(ctx, contentBox, label, font);
            ctx.restore();
        };
        return {
            'repaint': repaint,
            'setImageFn': function (f) { getImage = f; },
            'getLabel': function () { return label; },
            'setLabel': function (l) { label = l; },
            'setFont': function (f) { font = f; },
            'getFont': function () { return font; }
        };
    };
    colorjack.controlFactory.InputRadio = function (layer) {
        var input = colorjack.currentDocument.createElement("input");
        input.setType("radio");
        // Testing the Box Model
        //input.setMargin(15);
        //input.setBorder(10);
        //input.setPadding(25);
        // throw new Error("Input.contentArea:" + input.contentArea);
        input.contentArea.width = layer.getAttribute("width") - 0;
        input.contentArea.height = layer.getAttribute("height") - 0;
        var button = new BasicButton(layer, input);
        var getImage = function (el) {
            var img = el.isChecked() ? buttonIcons.checkedRadioIcon : buttonIcons.uncheckedRadioIcon;
            return img;
        };
        button.setImageFn(getImage);
        var repaint = function () {
            button.repaint();
        };
        layer.onclick = function (e) {
            var name = input.getName();
            if (name) {
                var radio = inputRadioGroup.getCheckedRadio(name);
                if (radio) { // Uncheck previous selection
                    radio.setChecked(false);
                    radio.repaint();
                }
            }
            input.setChecked(true);
            repaint();
        };
        var setName = function (name) {
            input.setName(name);
            inputRadioGroup.registerRadio(input); // TODO: unregister when changing name
        };
        var getLabel = function (domElement) {
            return button.getLabel();
        };
        var setLabel = function (la) {
            button.setLabel(la);
            repaint();
        };
        var result = {
            'repaint': repaint,
            'setFont': function (f) { input.setFont(f); },
            'getFont': function () { return input.getFont(); },
            'setName': function (n) { input.setName(n); },
            'getName': function () { return input.getName(); },
            'setLabel': setLabel,
            'getLabel': getLabel,
            'isChecked': function () { return input.isChecked(); },
            'setChecked': function (c) { input.setChecked(c); }
        };
        inputRadioGroup.registerRadio(result);
        return result;
    };
    colorjack.controlFactory.InputCheckBox = function (layer) {
        var input = colorjack.currentDocument.createElement("input");
        input.setType("checkbox");
        input.contentArea.width = layer.getAttribute("width") - 0;
        input.contentArea.height = layer.getAttribute("height") - 0;
        //input.setSize(500, 40);
        // -> input.setSize() -> HTMLInputElement.size !== BoxModel.setSize() is overriden!
        var button = new BasicButton(layer, input);
        var getImage = function (el) {
            var img = el.isChecked() ? buttonIcons.checkedCheckBoxIcon : buttonIcons.uncheckedCheckBoxIcon;
            return img;
        };
        button.setImageFn(getImage);
        var repaint = function () {
            button.repaint();
        };
        layer.onclick = function (e) {
            var checked = input.isChecked();
            input.setChecked(!checked);
            repaint();
        };
        var getLabel = function (domElement) {
            return button.getLabel();
        };
        var setLabel = function (la) {
            button.setLabel(la);
            repaint();
        };
        return {
            'repaint': repaint,
            'setFont': function (f) { input.setFont(f); },
            'getFont': function () { return input.getFont(); },
            'setName': function (n) { input.setName(n); },
            'getName': function () { return input.getName(); },
            'setLabel': setLabel,
            'getLabel': getLabel,
            'isChecked': function () { return input.isChecked(); },
            'setChecked': function (c) { input.setChecked(c); }
        };
    };
    /*

    colorjack.controlFactory.Button = function(layer) {
      var button = colorjack.currentDocument.createElement("button"); // could also be an "input" with type "button"|"submit"|"reset"
    };

    */
})();
