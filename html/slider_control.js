import { currentDocument } from './dom_html_doc.js';
import { jsb } from '../jsb/jsb.js';

export class InputRange {
	constructor(layer) {
		const input = currentDocument.createElement("input");
		input.setType("range");

		const thumb = new Image();
		thumb.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAsAAAAKCAYAAABi8KSDAAABEUlEQVQYlWWPsYrCQBCG5xofwMouZpdd1Je0DxgUo6BNVthi41Qp0oRUqQM+0ndFvDvwpvuZ7xvmF5nnS0QWIrIUkWy1WiEi2Tsv3vt/oDPGcDgcMMYgIu5T+AW997Rty36/p21bvPefwh84DAPH45Hr9crpdGIYhk9BrHOOvu85n8+EEIgxEkKgqir6vsc5h4hYybIMVaUsSx6PByklmqYhpUQIgbIsUVXW6zVijKHrOi6XCzFGns8nqkrTNMQYqaqKruvmwlmWkVKiKAru9zt1XRNCoK5rbrcbRVGQUpovi4i11qKqjOPINE28Xi+maWIcR1QVa+3887ulzfMc7z2bzYbdbsd2u8U5R57nP+DyG04Ht3Cng64/AAAAAElFTkSuQmCC";

		layer.style.cursor = "crosshair";

		let min = 0;
		let max = 100;
		let step = 1;

		const width = layer.getAttribute("width") - 0;
		const height = layer.getAttribute("height") - 0;

		const isVertical = height > width;

		const w = width - thumb.width;
		const h = height - thumb.height;
		const x0 = thumb.width / 2;
		const y0 = thumb.height / 2;

		this.getValue = function() {
			return input.getValue();
		};

		this.setValue = function(value) {
			if (isNaN(value)) value = 0;
			value = value > max ? max : value < min ? min : value;
			value = Math.round((value / step) * step);
			input.setValue(value);
			this.repaint();
		};

		const getRelativeValue = () => {
			return ((parseFloat(this.getValue()) || 0) - min) / (max - min);
		};

		const setRelativeValue = (relativeValue) => {
			this.setValue((max - min) * relativeValue);
		};

		this.repaint = () => {
			const c = layer.getContext("2d");
			c.fillStyle = '#000';
			c.fillRect(0, 0, width, height);
			c.fillStyle = '#333';
			let g;
			let x;
			let y;
			if (isVertical) {
				x = 4 + width / 2;
				c.moveTo(x - 5, y0);
				c.lineTo(x - 1.5, y0 + 0.5);
				c.lineTo(x - 1.5, h + y0);
				c.lineTo(x - 5, h + y0);
				g = c.createLinearGradient(x - 5, 0, x - 1.5, 0);
			} else {
				y = 4 + height / 2;
				c.moveTo(x0, y - 5);
				c.lineTo(x0 + 0.5, y - 1.5);
				c.lineTo(w + x0, y - 1.5);
				c.lineTo(w + x0, y - 5);
				g = c.createLinearGradient(0, y - 5, 0, y - 1.5);
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
			let small = 0;
			const maxDashes = (isVertical ? h : w) - 3;
			for(let n = 0; n <= maxDashes; n += (maxDashes / 10)) {
				if (isVertical) {
					y = y0 + Math.round(n) + 1.5;
					c.moveTo(x - 7, y);
					c.lineTo(x - (small % 5 ? 9 : 10), y);
				} else {
					x = x0 + Math.round(n) + 1.5;
					c.moveTo(x, y - 7);
					c.lineTo(x, y - (small % 5 ? 9 : 10));
				}
				c.strokeStyle = "#ccc";
				c.stroke();
				c.beginPath();
				small ++;
			}
			if (isVertical) {
				c.drawImage(thumb, x - 9, h - getRelativeValue() * h);
			} else {
				c.drawImage(thumb, getRelativeValue() * w, y - 9);
			}
		};

		layer.addEventListener("mousedown", (event) => {
			const oldValue = this.getValue();
			const clientRect = layer.getBoundingClientRect();
			if (isVertical) {
				const offsetY = event.clientY - clientRect.top - layer.clientTop;
				setRelativeValue((h - offsetY + y0) / h);
			} else {
				const offsetX = event.clientX - clientRect.left - layer.clientLeft;
				setRelativeValue((offsetX - x0) / w);
			}
			if (this.getValue() != oldValue) {
				jsb.behavior.dispatchEvent(layer, "change");
			}
		}, true);

		this.getName = () => input.getName();
		this.setName = (n) => input.setName(n);
		this.getMin = () => min;
		this.setMin = (v) => { min = v - 0; this.repaint();};
		this.getMax = () => max;
		this.setMax = (v) => { max = v - 0; this.repaint(); };
		this.getStep = () => step;
		this.setStep = (v) => { step = v - 0; this.repaint(); };
	}
}
