
// Reorder the API: canvasID, elem, type, more values/attributes parameters for init()?

colorjack.controlFactory = {
  create: function(type, canvasId) {  // For consistency, we pass a canvasId for construction.
    var canvas = document.getElementById(canvasId);
    if (!canvas || !canvas.getContext) {
      throw new ReferenceError("colorjack.controlFactory.create(): canvas not found for: " + canvasId);
    }
    
    var Control = this[type];
	
    if (typeof Control == "function") {
	   var control = new Control(canvas);	   
	   return control;
      //return new Control(canvas);	  
    } else {
      throw new ReferenceError("colorjack.controlFactory.create(): control type not recognized: " + type);
    }
  },

  createLayout: function(element, layer) {
    if (typeof layer == 'undefined') {
      //layer = typeof _ == 'undefined' ? this : _;
      layer = this;
    }

    switch (element.tagName) {
      case "SELECT":
        return new this.ComboBox(layer, element);

      case "A":
        if (!(element.textContent && element.textContent.length)) break;

      case "BUTTON":
        return new this.Button(layer, element);

      case "TEXTAREA":
        return new this.TextArea(layer, element);

      case "IMG":
        return new this.Image(layer, element);

      case "INPUT":
        switch(element.type) {
          case 'text':
            return new this.InputText(layer, element);

          case 'checkbox':
            return new this.InputCheckBox(layer, element);

          case 'radio':
            return new this.InputRadio(layer, element);

          case 'range':
            return new this.InputRange(layer, element);
        }
    }
    
    return null;
  }
};

// How to pass style information to the element?

colorjack.controlFactory.TextArea = function(layer, textarea) {
  if (colorjack && colorjack.textBoxFactory && colorjack.textBoxFactory.createTextBox) {
    if (typeof textarea == 'undefined') {
      textarea = colorjack.currentDocument.createElement("textarea");
      textarea.setMargin(20);
      textarea.setPadding(5);
      textarea.setBorder(7);
    }
    return colorjack.textBoxFactory.createTextBox(layer, textarea);
  } else {
    throw new ReferenceError("colorjack.controlFactory.TextArea. Undefined: colorjack.textBoxFactory.createTextBox");
  }
};

// Note: Radio/CheckBox are also of "input" type... we need to specify the "type"
// type="text", or something else... type="radio" / type="checkbox"

colorjack.controlFactory.InputText = function(layer,input) {  
  if (colorjack && colorjack.textBoxFactory && colorjack.textBoxFactory.createTextBox) {
    if (typeof input == 'undefined') {
      input = colorjack.currentDocument.createElement("input");
      input.setType("text");
    }	
    return colorjack.textBoxFactory.createTextBox(layer, input);
  } else {
    throw new ReferenceError("colorjack.controlFactory.InputText. Undefined: colorjack.textBoxFactory.createTextBox");
  }
};
