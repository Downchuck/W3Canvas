import { currentDocument } from './dom_html_doc.js';
import { BoxModelPainter } from '../../css/box_paint.js';
const buttonIcons = {
	'blankIcon'				: new Image(),
	'checkedRadioIcon'	    : new Image(),
	'uncheckedRadioIcon' 	: new Image(),
	'checkedCheckBoxIcon'	: new Image(),
	'uncheckedCheckBoxIcon' : new Image()
};

buttonIcons.blankIcon.src             = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAIAAABvFaqvAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAgY0hSTQAAeiYAAICEAAD6AAAAgOgAAHUwAADqYAAAOpgAABdwnLpRPAAAADVJREFUOE9j/P//PwNVANAgqgAGqpgC8taoQQRDYDSMCAbRaDoiHESjYTQaRkSEAGElVCuPAAbjdOFsJI7xAAAAAElFTkSuQmCC";
buttonIcons.checkedRadioIcon.src      = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAIAAABvFaqvAAAABGdBTUEAALGPC/xhBQAAAG5JREFUOE9jZGZmZqAKABpEFcBAFVNA3hqZBv1HBfgDAWcYoZkC4eIxC7tBWE3BbxYBg+BOgBuNy1FYDELWw9DQAEFA/fjNGhIGYfUFOWGEbBBm9JEQ2BCl1ElHWM0iM2WTWiqM0GKEpGAafGEEAEBa8MJv2SpKAAAAAElFTkSuQmCC";
buttonIcons.uncheckedRadioIcon.src    = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAIAAABvFaqvAAAABGdBTUEAALGPC/xhBQAAAGpJREFUOE/l1N0KABAMBtBp7//MTErYj6ZdkF1RnOYjCREhpAgKKQhR6rH+hPJcdghqRovSpoYlQ6JiWxuot9BprSkBGvdoY849AVHbPJGTjEaIX58j7LY05h2J1uHL9v4Kn34jrpjuy6gALDQCtk6jFH4AAAAASUVORK5CYII=";
buttonIcons.checkedCheckBoxIcon.src   = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAIAAABvFaqvAAAABGdBTUEAALGPC/xhBQAAAIhJREFUOE/N1OsKgDAIBWBjL+6blzEwcZuXMpj0032chu5orUFJEVRSUKLcv1UPYb5kiCcROWemqH8DCBD7R9FfJmKiKz7EffK6RiUEKWuqRCG2VooPUYc8LG9XzYZ/2SM0HS8fUqFWQ5qDjFEPQRyqBrI3L5rI3V8Lyj4k8+3/+ML98ELukugCcyd7G9ldrsQAAAAASUVORK5CYII=";
buttonIcons.uncheckedCheckBoxIcon.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAIAAABvFaqvAAAABGdBTUEAALGPC/xhBQAAAElJREFUOE9jZGZmZqAKABpEFcBAFVNA3qK+QQ2kA2RHIFwENOc/KQCoftQgAgE2GkaEU9RoGA2SMCK1IMGe+yks4WhQQg4WFwEAizzaizrcI/MAAAAASUVORK5CYII=";

class InputRadioGroup {
	allRadios = [];

	registerRadio(radio) {
		this.allRadios.push(radio);
	}

	getRadioGroup(name) {
		const result = [];
		for (let i = 0; i < this.allRadios.length; i++) {
			if (this.allRadios[i].getName() === name) {
				result.push(this.allRadios[i]);
			}
		}
		return result;
	}

	getCheckedRadio(name) {
		const group = this.getRadioGroup(name);
		let radio = null;
		for (let i = 0; i < group.length; i++) {
			if (group[i].isChecked()) {
				radio = group[i];
				break;
			}
		}
		return radio;
	}
}

const inputRadioGroup = new InputRadioGroup();

class BasicButton {
	constructor(layer, el) {
		const font = {
            _scale: 0.10,
            _color: 'black',
            getScaleFactor: function() { return this._scale; },
            getTextColor: function() { return this._color; },
            setTextColor: function(c) { this._color = c; },
            setScaleFactor: function(s) { this._scale = s; }
        };
		let label  = "LABEL";
		const w = layer.getAttribute("width");
		const h = layer.getAttribute("height");
		el.setSize(w, h);
		const painter = new BoxModelPainter();
		let getImage = (domElement) => buttonIcons.blankIcon;
		const getLabel = () => label;
		this.repaint = () => {
			const ctx = layer.getContext('2d');
			const img = getImage(el);
			const label = getLabel(el);
			const contentBox = el.getContentBox();
			ctx.save();
			ctx.clearRect(contentBox.x, contentBox.y, contentBox.width, contentBox.height);
			painter.paintImage(ctx, img, contentBox);
			ctx.fillStyle = "red";
			contentBox.x += 20;
			contentBox.y += 4;
			painter.paintText(ctx, contentBox, label, font);
			ctx.restore();
		};
		this.setImageFn = (f) => { getImage = f; };
		this.getLabel   = () => label;
		this.setLabel   = (l) => { label = l; };
		this.setFont    = (f) => { font = f; };
		this.getFont    = () => font;
	}
}

export class InputRadio {
	constructor(layer) {
		const input = currentDocument.createElement("input");
		input.setType("radio");
		input.contentArea.width = layer.getAttribute("width") - 0;
		input.contentArea.height = layer.getAttribute("height") - 0;
		const button = new BasicButton(layer, input);
		const getImage = (el) => {
			return el.isChecked()? buttonIcons.checkedRadioIcon : buttonIcons.uncheckedRadioIcon;
		};
		button.setImageFn(getImage);
		const repaint = () => {
			button.repaint();
		};
		layer.onclick = (e) => {
			const name = input.getName();
			if (name) {
				const radio = inputRadioGroup.getCheckedRadio(name);
				if (radio) {
					radio.setChecked(false);
					radio.repaint();
				}
			}
			input.setChecked(true);
			repaint();
		};
		const setName = (name) => {
			input.setName(name);
			inputRadioGroup.registerRadio(this);
		};
		this.repaint   = repaint;
		this.setFont   = (f) => { input.setFont(f); };
		this.getFont   = () => input.getFont();
		this.setName   = (n) => { setName(n); };
		this.getName   = () => input.getName();
		this.setLabel  = (la) => { button.setLabel(la); repaint(); };
		this.getLabel  = () => button.getLabel();
		this.isChecked = () => input.isChecked();
		this.setChecked= (c) => { input.setChecked(c); };
		inputRadioGroup.registerRadio(this);
	}
}

export class InputCheckBox {
	constructor(layer) {
		const input = currentDocument.createElement("input");
		input.setType("checkbox");
		input.contentArea.width = layer.getAttribute("width") - 0;
		input.contentArea.height = layer.getAttribute("height") - 0;
		const button = new BasicButton(layer, input);
		const getImage = (el) => {
			return el.isChecked()? buttonIcons.checkedCheckBoxIcon : buttonIcons.uncheckedCheckBoxIcon;
		};
		button.setImageFn(getImage);
		const repaint = () => {
			button.repaint();
		};
		layer.onclick = (e) => {
			const checked = input.isChecked();
			input.setChecked(!checked);
			repaint();
		};
		this.repaint   = repaint;
		this.setFont   = (f) => { input.setFont(f); };
		this.getFont   = () => input.getFont();
		this.setName   = (n) => { input.setName(n); };
		this.getName   = () => input.getName();
		this.setLabel  = (la) => { button.setLabel(la); repaint(); };
		this.getLabel  = () => button.getLabel();
		this.isChecked = () => input.isChecked();
		this.setChecked= (c) => { input.setChecked(c); };
	}
}