import { BoxModelPainter } from '../css/box_paint.js';
import * as currentWindow from '../canvas_lib.js';

export function BlueComboBoxPainter() {
	const painter		= new BoxModelPainter();
	let gradient	= "#cc0";
	let fullBox		= null;
	let labelBox	= null;
	let iconBox		= null;

	this.initLayout = function(box, label, icon) {
		fullBox = box;
		labelBox = label;
		iconBox = icon;

		const createGradient = function(w, h) {
			const canvas = currentWindow.createCanvasLayer(w, h);
			const ctx = canvas.getContext('2d');

			const x = 0;
			const y = 0;
			painter.setupLinearGradient(ctx, x, y, w, h, '#ddf', 'blue', true);
			ctx.fillRect(x, y, w, h);

			const pattern = ctx.createPattern(canvas, 'repeat');
			return pattern;
		};
		gradient = createGradient(1, box.height);
	};

	this.paintIcon = function(ctx, state) {
		try {
			const box = iconBox;
			const arrowBoxWidth = box.width;
			const scaling = 1.0;

			const color = (state == "over")? "#afa" : "#7c7";

			ctx.save();
			ctx.fillStyle = color;
			ctx.translate(labelBox.width, box.height/5);
			ctx.beginPath();

			const arrowWidth = 40 * scaling;
			const x = 40 * scaling;
			const y = (arrowBoxWidth/5);
			ctx.moveTo(x, y);
			ctx.lineTo(x + arrowWidth, y);
			ctx.lineTo((2*x + arrowWidth)/2, y + arrowWidth/2);
			ctx.fill();
			ctx.restore();
		}
		catch (e41) {
			throw new Error("Error: " + e41.message);
		}
	};

	this.paintComboBox = function(ctx, selectedValue, font) {
		ctx.fillStyle = currentWindow.getBackgroundColor();
		ctx.fillRect(0, 0, fullBox.width, fullBox.height);

		painter.paintRoundedTextBox(ctx, fullBox, gradient, selectedValue, font, labelBox);
		this.paintIcon(ctx, "normal");
	};
}

export function LightBlueSelectPainter() {
	const painter = new BoxModelPainter();

	this.paintSelectBackground = function(ctx, boxModel, style) {
		const box = boxModel.getMarginBox();
		ctx.fillStyle = document.body.bgColor;
		ctx.fillRect(0, 0, box.width, box.height);

		ctx.fillStyle = "white";
		painter.paintRoundedBox(ctx, box.x, box.y, box.width, box.height, 10, 10);
		ctx.clip();
		ctx.fillRect(box.x, box.y, box.width, box.height);
	};

	this.paintOption = function(ctx, node, state, width, label) {
		const style = (!state.hover)? node.style : {
			'getPaddingColor'		: function() { return "white"; },
			'getBorderColor'		: function() { return "#9cb"; },
			'getBackgroundColor'	: function() { return "#dff"; },
			'getFont'				: function() { return node.style.getFont(); }
		};
		const boxModel = node;
		painter.paintBox(ctx, boxModel, style, width, label);
	};
}

export function overridePainters(comboBox) {
	const useComboBoxPainter = true;
	if (useComboBoxPainter) {
		const bluePainter = new BlueComboBoxPainter();
		comboBox.setComboBoxPainter(bluePainter);

		comboBox.setBoxLayout({
			'setComboBoxModel' : function(box) {
				box.padding.top = 5;
			}
		});
	}

	const useSelectPainter = true;
	if (useSelectPainter) {
		const selectPainter = new LightBlueSelectPainter();
		comboBox.getSelectControl().setSelectPainter(selectPainter);
		comboBox.getSelectControl().setBoxLayout({
			'getCollapseBorder' : function() {
				return false;
			}
		});
	}
}
