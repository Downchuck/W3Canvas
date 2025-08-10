import { ComboBox } from './combobox_control.js';
import { Button } from './button_control.js';
import { TextArea } from './textarea_control.js';
import { Image } from './image_control.js';
import { InputText } from './input_text.js';
import { InputCheckBox } from './checkbox_control.js';
import { InputRadio } from './radio_control.js';
import { InputRange } from './slider_control.js';
import { currentDocument } from './dom_html_doc.js';
import { textBoxFactory } from './textbox/factory.js';

export const controlFactory = {
  create: function(type, canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas || !canvas.getContext) {
      throw new ReferenceError("w3canvas.controlFactory.create(): canvas not found for: " + canvasId);
    }

    const Control = this[type];

    if (typeof Control == "function") {
	   const control = new Control(canvas);
	   return control;
    } else {
      throw new ReferenceError("w3canvas.controlFactory.create(): control type not recognized: " + type);
    }
  },

  createLayout: function(element, layer) {
    if (typeof layer == 'undefined') {
      layer = this;
    }

    switch (element.tagName) {
      case "SELECT":
        return new ComboBox(layer, element);

      case "A":
        if (!(element.textContent && element.textContent.length)) break;

      case "BUTTON":
        return new Button(layer, element);

      case "TEXTAREA":
        return new TextArea(layer, element);

      case "IMG":
        return new Image(layer, element);

      case "INPUT":
        switch(element.type) {
          case 'text':
            return new InputText(layer, element);

          case 'checkbox':
            return new InputCheckBox(layer, element);

          case 'radio':
            return new InputRadio(layer, element);

          case 'range':
            return new InputRange(layer, element);
        }
    }

    return null;
  }
};

export const TextAreaFactory = function(layer, textarea) {
  if (textBoxFactory && textBoxFactory.createTextBox) {
    if (typeof textarea == 'undefined') {
      textarea = currentDocument.createElement("textarea");
      textarea.setMargin(20);
      textarea.setPadding(5);
      textarea.setBorder(7);
    }
    return textBoxFactory.createTextBox(layer, textarea);
  } else {
    throw new ReferenceError("w3canvas.controlFactory.TextArea. Undefined: w3canvas.textBoxFactory.createTextBox");
  }
};

export const InputTextFactory = function(layer,input) {
  if (textBoxFactory && textBoxFactory.createTextBox) {
    if (typeof input == 'undefined') {
      input = currentDocument.createElement("input");
      input.setType("text");
    }
    return textBoxFactory.createTextBox(layer, input);
  } else {
    throw new ReferenceError("w3canvas.controlFactory.InputText. Undefined: w3canvas.textBoxFactory.createTextBox");
  }
};
