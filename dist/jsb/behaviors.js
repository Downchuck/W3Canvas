"use strict";
base2.require("jsb", function (namespace) {
    eval(namespace);
    var STYLES = {};
    forEach.csv("border,padding,margin", function (property) {
        forEach.csv("Top,Right,Bottom,Left", function (side) {
            if (property == "border") {
                forEach.csv("Color,Style,Width", function (type) {
                    STYLES[property + side + type] = true;
                });
            }
            else {
                STYLES[property + side] = true;
            }
        });
    });
    var control = jsb.behavior.extend({
        controlType: "",
        width: 0,
        height: 0,
        styles: STYLES,
        ondocumentready: function (element) {
            // create the canvas element
            var canvas = document.createElement("canvas");
            canvas.id = element.id || assignID(canvas, "id");
            canvas.className = this.controlType;
            canvas.width = Math.max(element.clientWidth, this.width);
            canvas.height = Math.max(element.clientHeight, this.height);
            this.setStyles(element, canvas);
            element.parentNode.replaceChild(canvas, element);
            // create the w3canvas control
            var control = colorjack.controlFactory.create(this.controlType, canvas.id);
            this.setAttributes(element, canvas, control);
            this.setPrivateData(canvas, "control", control);
        },
        setAttributes: Undefined,
        setStyles: function (element, canvas) {
            var canvasStyle = canvas.style, elementStyle = this.getComputedStyle(element);
            for (var propertyName in this.styles) {
                canvasStyle[propertyName] = elementStyle[propertyName];
            }
        }
    });
    var img = control.extend({
        controlType: "Image",
        setAttributes: function (element, canvas, control) {
            control.setSource(element.src);
            control.setSize(canvas.width, canvas.height);
        }
    });
    var select = control.extend({
        controlType: "ComboBox",
        setAttributes: function (element, canvas, control) {
            var smallFont = new ArialFont(arialFontLib);
            smallFont.setScaleFactor(0.06);
            control.setFont(smallFont);
            overrideMikePainters(control); // huh?
            control.setOptions(this.querySelectorAll(element, "option").map(function (option) {
                return {
                    id: option.value,
                    label: option.textContent
                };
            }));
        }
    });
    var input = control.extend({
        width: 200,
        height: 24
    });
    input.text = input.extend({
        controlType: "InputText",
        height: 124,
        setAttributes: function (element, canvas, control) {
            control.setInput("text");
            var textContent = 'Canvas\n\n\nis an\textremely heavy-duty plain-woven fabric      used for making sails, tents, marquees, backpacks, and other functions where sturdiness is required. It is also popularly used as a painting surface, typically stretched, and on fashion handbags and shoes.In   the  Wyoming.';
            //var textContent = 'used as a painting surface, typically stretched, and on fashion handbags and shoes.In   the  Wyoming.';
            //var textContent = 'and on handbagsand shoes.Inthessss Wyoming.';
            var boxStyle = {
                'color': "#555",
                'reverseMode': false,
                'cursorWidth': 2,
                'cursorColor': "#555",
                'showLines': true,
                'lineColor': 'blue',
                'borderColor': "red",
                'selectionColor': "rgba(216,216,255,0.6)"
            };
            control.setStyle(boxStyle);
            var smallFont = new ArialFont(arialFontLib);
            smallFont.setScaleFactor(0.06);
            //textbox.setFont(smallFont);
            control.setValue(textContent);
        }
    });
    var bool = {
        setAttributes: function (element, canvas, control) {
            control.setName(element.name);
            control.setChecked(element.checked);
            if (element.id) {
                var label = this.querySelector("label[for=" + element.id + "]");
            }
            if (!label) {
                var parentNode = element.parentNode;
                label = parentNode.nodeName == "LABEL" ? parentNode : null;
            }
            if (label) {
                control.setLabel(this.get(label, "textContent"));
                label.parentNode.removeChild(label);
            }
        }
    };
    input.checkbox = input.extend({
        "implements": [bool],
        controlType: "InputCheckBox"
    });
    input.radio = input.extend({
        "implements": [bool],
        controlType: "InputRadio"
    });
    input.range = input.extend({
        controlType: "InputRange",
        width: 0,
        height: 0,
        setAttributes: function (element, canvas, control) {
            control.setMin(element.getAttribute("min") || 0);
            control.setMax(element.getAttribute("max") || 100);
            control.setStep(element.getAttribute("step") || 1);
        }
    });
    new jsb.RuleList({
        "img.w3canvas": img,
        "input[type=text].w3canvas": input.text,
        "input[type=checkbox].w3canvas": input.checkbox,
        "input[type=radio].w3canvas": input.radio,
        "input[type=range].w3canvas": input.range,
        "select.w3canvas": select
    });
}); // end: closure
