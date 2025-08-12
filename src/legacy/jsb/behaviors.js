import { controlFactory } from '../html/control_factory.js';
import { overrideMikePainters } from '../style/combo_mike.js';

const STYLES = {};

base2.forEach.csv("border,padding,margin", function(property) {
  base2.forEach.csv("Top,Right,Bottom,Left", function(side) {
    if (property == "border") {
      base2.forEach.csv("Color,Style,Width", function(type) {
        STYLES[property + side + type] = true;
      });
    } else {
      STYLES[property + side] = true;
    }
  });
});

const control = jsb.behavior.extend({
  controlType: "",
  width: 0,
  height: 0,
  styles: STYLES,

  ondocumentready: function(element) {
    const canvas = document.createElement("canvas");
    canvas.id = element.id || jsb.assignID(canvas, "id");
    canvas.className = this.controlType;
    canvas.width = Math.max(element.clientWidth, this.width);
    canvas.height = Math.max(element.clientHeight, this.height);
    this.setStyles(element, canvas);
    element.parentNode.replaceChild(canvas, element);
    const control = controlFactory.create(this.controlType, canvas.id);
    this.setAttributes(element, canvas, control);
    this.setPrivateData(canvas, "control", control);
  },

  setAttributes: base2.Undefined,

  setStyles: function(element, canvas) {
    const canvasStyle = canvas.style;
    const elementStyle = this.getComputedStyle(element);
    for (const propertyName in this.styles) {
      canvasStyle[propertyName] = elementStyle[propertyName];
    }
  }
});

const img = control.extend({
  controlType: "Image",

  setAttributes: function(element, canvas, control) {
    control.setSource(element.src);
    control.setSize(canvas.width, canvas.height);
  }
});

const select = control.extend({
  controlType: "ComboBox",

  setAttributes: function(element, canvas, control) {
		const smallFont = {
            _scale: 0.06,
            _color: 'black',
            getScaleFactor: function() { return this._scale; },
            getTextColor: function() { return this._color; },
            setTextColor: function(c) { this._color = c; },
            setScaleFactor: function(s) { this._scale = s; }
        };
		control.setFont(smallFont);

		overrideMikePainters(control);

    control.setOptions(this.querySelectorAll(element, "option").map(function(option) {
      return {
        id: option.value,
        label: option.textContent
      };
    }));
  }
});

const input = control.extend({
  width: 200,
  height: 24
});

input.text = input.extend({
  controlType: "InputText",
  height: 124,

  setAttributes: function(element, canvas, control) {
    control.setInput("text");

	const textContent = 'Canvas\n\n\nis an\textremely heavy-duty plain-woven fabric      used for making sails, tents, marquees, backpacks, and other functions where sturdiness is required. It is also popularly used as a painting surface, typically stretched, and on fashion handbags and shoes.In   the  Wyoming.';
	const boxStyle = {
  		'color' 		: "#555",
  		'reverseMode'	: false,
  		'cursorWidth'   : 2,
  		'cursorColor'	: "#555",
  		'showLines'		: true,
  		'lineColor'		: 'blue',
  		'borderColor'	: "red",
  		'selectionColor': "rgba(216,216,255,0.6)"
  	};
  	control.setStyle(boxStyle);
	const smallFont = {
        _scale: 0.06,
        _color: 'black',
        getScaleFactor: function() { return this._scale; },
        getTextColor: function() { return this._color; },
        setTextColor: function(c) { this._color = c; },
        setScaleFactor: function(s) { this._scale = s; }
    };

  	control.setValue(textContent);
  }
});

const bool = {
  setAttributes: function(element, canvas, control) {
    control.setName(element.name);
    control.setChecked(element.checked);
    let label;
    if (element.id) {
      label = this.querySelector("label[for=" + element.id + "]");
    }
    if (!label) {
      const parentNode = element.parentNode;
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

  setAttributes: function(element, canvas, control) {
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
