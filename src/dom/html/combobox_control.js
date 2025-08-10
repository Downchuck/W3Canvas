
import { BoxModelPainter } from '../../css/box_paint.js';
import * as currentWindow from '../../canvas_lib.js';
import { Select } from './select_control.js';
import { BoxModel } from '../../css/box_model.js';
import { BoxStyle } from '../../css/viewport.js';

class ComboBoxLayoutManager {
	constructor(textLayer) {
		const TEXTBOX_MIN_WIDTH = 50;
		const TEXTBOX_MAX_WIDTH = 500;
		const dynamicWidth = false;
		const DefaultBoxLayout = function() {
			this.setComboBoxModel = function(box) {
				box.setMargin(0);
				box.setBorder(0);
				box.setPadding(2);
				box.padding.top = 14;
			};
			this.setTextBoxModel = function(box) {
				box.setMargin(0);
				box.setBorder(0);
				box.padding.left = 20;
				box.padding.top = 3;
				box.padding.right = 50;
				box.padding.bottom = 3;
			};
			this.setIconBoxModel = function(box) {
				box.setMargin(0);
				box.setBorder(1);
				box.setPadding(0);
				box.contentArea.width = 20;
				box.contentArea.height = 20;
			};
		};
		const defaultBoxLayout = new DefaultBoxLayout();
		let boxLayout = null;
		const getIconBoxWidth = function(font) {
			const getScaling = function(font) {
				return font.getScaleFactor() * 5;
			};
			const scaling = getScaling(font);
			const arrowBoxWidth = 100 * scaling;
			return arrowBoxWidth;
		};
		this.manageBoxLayout = function(fullBox, labelBox, arrowBox, textWidth, font) {
			const h = font.getTextHeight();
			defaultBoxLayout.setComboBoxModel(fullBox);
			defaultBoxLayout.setTextBoxModel(labelBox);
			defaultBoxLayout.setIconBoxModel(arrowBox);
			if (boxLayout) {
				if (boxLayout.setComboBoxModel) {
					boxLayout.setComboBoxModel(fullBox);
				}
				if (boxLayout.setTextBoxModel) {
					boxLayout.setTextBoxModel(labelBox);
				}
				if (boxLayout.setIconBoxModel) {
					boxLayout.setIconBoxModel(arrowBox);
				}
			}
			labelBox.contentArea.width = textWidth;
			labelBox.contentArea.height = h;
			const x = labelBox.getTotalWidth() - arrowBox.getTotalWidth() + arrowBox.getLeftLength();
			arrowBox.setOffset(x, fullBox.getTopLength());
			const labelTotalHeight = labelBox.getTotalHeight();
			const arrowBoxWidth = getIconBoxWidth(font);
			const totalWidth = textWidth + arrowBoxWidth;
			fullBox.contentArea.height = labelTotalHeight;
			const x2 = fullBox.getLeftLength();
			const y = fullBox.getTopLength();
			labelBox.setOffset(x2, y);
		};
		const measureText = function(str, font) {
			if (!font) {
				throw new ReferenceError("ComboBoxLayoutManager.measureText(): Missing font!");
			}
			const ctx = textLayer.getContext('2d');
			return font.measureText(ctx, str);
		};
		this.getMaximumTextWidth = function(options, font) {
			let w = TEXTBOX_MIN_WIDTH;
			for (let j = 0; j < options.length; j++) {
				w = Math.max(w, measureText(options[j].label, font));
			}
			return w;
		};
		this.getTextWidth = function(text, font) {
			const w = Math.min(TEXTBOX_MAX_WIDTH,
					Math.max(TEXTBOX_MIN_WIDTH,
						measureText(text, font)
					));
			return w;
		};
		this.setBoxLayout = (b) => { boxLayout = b; };
		this.isDynamicWidth = () => dynamicWidth;
	}
}

class DefaultComboBoxPainter {
	constructor() {
		const painter = new BoxModelPainter();
		let gradient	= "#cc0";
		let fullBox		= null;
		let labelBox	= null;
		let iconBox		= null;
		this.initLayout = (box, label, icon) => {
			fullBox = box;
			labelBox = label;
			iconBox = icon;
			iconBox.x = fullBox.width-40;
			iconBox.height = Math.round(labelBox.height);
			const createGradient = (w, h) => {
				const canvas = currentWindow.createCanvasLayer(w, h);
				const ctx = canvas.getContext('2d');
				const x = 0;
				const y = 0;
				painter.setupLinearGradient(ctx, x, y, w, h, '#ddd', '#777', true);
				ctx.fillRect(x, y, w, h);
				const pattern = ctx.createPattern(canvas, 'repeat');
				return pattern;
			};
			gradient = createGradient(1, box.height);
		};
		this.paintIcon = (ctx, state) => {
			try {
				const box = iconBox;
				const color = (state == "over")? "#ccc" : "#777";
				ctx.save();
				ctx.fillStyle = color;
				ctx.fillRect(box.x, box.y, box.width, box.height);
				ctx.fillStyle = "red";
				const arrowWidth = box.width;
				ctx.translate(0, iconBox.y);
				ctx.beginPath();
				const x = iconBox.x;
				const y = (arrowWidth/2);
				ctx.moveTo(x, y);
				ctx.lineTo(x + arrowWidth, y);
				ctx.lineTo((2*x + arrowWidth)/2, y + arrowWidth/2);
				ctx.closePath();
				ctx.fill();
				ctx.restore();
			}
			catch (e41) {
				throw new Error("Error: " + e41.message);
			}
		};
		this.paintComboBox = (ctx, selectedValue, font) => {
			ctx.fillStyle = currentWindow.getBackgroundColor();
			ctx.fillRect(0, 0, fullBox.width, fullBox.height);
			painter.paintRoundedTextBox(ctx, fullBox, gradient, selectedValue, font, labelBox);
			this.paintIcon(ctx, "normal");
		};
	}
}

export class ComboBox {
	constructor(textLayer) {
		let font = null;
		const selectControl = new Select();
		let selectLayerShown = false;
		const comboBoxModel = new BoxModel();
		const labelBoxStyle = new BoxStyle(4,5,0);
		const iconBoxStyle = new BoxStyle(4,4,4);
		const comboBoxLayoutManager = new ComboBoxLayoutManager(textLayer);
		const getContext = () => textLayer.getContext('2d');
		this.setFont = (f) => { font = f; selectControl.setFont(f); };
		const getFont = () => {
			if (!font) { throw new Error("w3canvas.controlFactory.ComboBox.getFont(): Need to set font first"); }
			return font;
		};
		const defaultComboBoxPainter = new DefaultComboBoxPainter();
		let comboBoxPainter = null;
		const paintIcon = (ctx, state) => {
			if (comboBoxPainter && comboBoxPainter.paintIcon) {
				comboBoxPainter.paintIcon(ctx, state);
			}
			else {
				defaultComboBoxPainter.paintIcon(ctx, state);
			}
		};
		textLayer.onmouseover = (e) => {
			const ctx = getContext();
			paintIcon(ctx, "over");
		};
		textLayer.onmouseout = (e) => {
			if (!selectLayerShown) {
				const ctx = getContext();
				paintIcon(ctx, "normal");
			}
		};
		const startLayout = (options) => {
			let textWidth = 0;
			const dynamicWidth = comboBoxLayoutManager.isDynamicWidth();
			if (dynamicWidth) {
				const selectedValue = getChoice();
				textWidth = comboBoxLayoutManager.getTextWidth(selectedValue, getFont());
			}
			else {
				textWidth = comboBoxLayoutManager.getMaximumTextWidth(options, getFont());
			}
			comboBoxLayoutManager.manageBoxLayout(comboBoxModel, labelBoxStyle, iconBoxStyle, textWidth, getFont());
		};
		const finishLayout = () => {
			const thisFont = getFont();
			labelBoxStyle.setFont(thisFont);
			iconBoxStyle.setFont(thisFont);
			textLayer.style.background = thisFont.getTextColor();
			const fullBox	 = comboBoxModel.getMarginBox();
			const labelBox = labelBoxStyle.getContentBox();
			const iconBox	 = iconBoxStyle.getContentBox();
			defaultComboBoxPainter.initLayout(fullBox, labelBox, iconBox);
			if (comboBoxPainter && comboBoxPainter.initLayout) {
				comboBoxPainter.initLayout(fullBox, labelBox, iconBox);
			}
			const dynamicWidth = comboBoxLayoutManager.isDynamicWidth();
			if (!dynamicWidth) {
				currentWindow.setCanvasSize(textLayer, fullBox.width, fullBox.height);
			}
		};
		const getChoice = () => {
			let selectedValue = selectControl.getValue();
			const selectedOption = selectControl.getSelectedIndex();
			if (selectedOption > -1) {
				const option = selectControl.getOptions().item(selectedOption);
				selectedValue = option.getLabel();
			}
			return selectedValue;
		};
		const paintSelectedChoice = () => {
			let box = null;
			const dynamicWidth = comboBoxLayoutManager.isDynamicWidth();
			if (dynamicWidth) {
				box = comboBoxModel.getMarginBox();
				currentWindow.setCanvasSize(textLayer, box.width, box.height);
			}
			else {
				box = comboBoxModel.getMarginBox();
			}
			const selectedValue = getChoice();
			const ctx = getContext();
			if (comboBoxPainter && comboBoxPainter.paintComboBox) {
				comboBoxPainter.paintComboBox(ctx, selectedValue, getFont());
			}
			else {
				defaultComboBoxPainter.paintComboBox(ctx, selectedValue, getFont());
			}
		};
		this.setSelectionCallback = (callback) => {
			const newCallback = (value, label) => {
				paintSelectedChoice();
				selectLayerShown = false;
				if (callback) {
					callback(value, label);
				}
			};
			selectControl.setSelectionCallback(newCallback);
		};
		this.setHoverCallback = (c) => {
			selectControl.setHoverCallback(c);
		};
		this.setOptions = (options) => {
			selectControl.setOptions(options);
			startLayout(options);
			const left = textLayer.offsetLeft;
			const top = textLayer.offsetTop;
			const totalHeight = comboBoxModel.getTotalHeight();
			const selectLayerSize = selectControl.setLayoutOffset(left, top, totalHeight);
			const sides = comboBoxModel.getLeftLength() + comboBoxModel.getRightLength();
			comboBoxModel.contentArea.width = selectLayerSize.width - sides;
			finishLayout();
			this.setSelectionCallback(null);
			textLayer.onclick = (e) => {
				selectLayerShown = !selectLayerShown;
				selectControl.setOffset(textLayer.offsetLeft, textLayer.offsetTop);
				selectControl.updateHighlight();
				selectControl.setVisible(selectLayerShown, e);
			};
			paintSelectedChoice();
		};
		this.setSize = (s) => {
			selectControl.setSize(s);
		};
		this.getSelectControl = () => selectControl;
		this.setComboBoxPainter = (d) => { comboBoxPainter = d; };
		this.setBoxLayout = (b) => { comboBoxLayoutManager.setBoxLayout(b); };
	}
}