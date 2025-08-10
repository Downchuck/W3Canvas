import { currentDocument } from './dom_html_doc.js';
import { mixin } from '../../lang_util.js';
import * as currentWindow from '../../canvas_lib.js';

export class ImageControl {
	constructor(layer) {
		const imageEl = currentDocument.createElement("img");
		const ImageDisplay = function() {
			this.borderColor = "black";
			this.img = new Image();

			this.hasPredefinedWidthAndHeight = () => {
				return (imageEl.getWidth() > 0 && imageEl.getHeight() > 0);
			};

			this.paintImage = () => {
				const ctx = layer.getContext('2d');
				const b = imageEl.getBorderBox();
				ctx.fillStyle = this.borderColor;
				ctx.fillRect(b.x, b.y, b.width, b.height);
				const c = imageEl.getContentBox();
				ctx.drawImage(this.img, 0, 0, this.img.width, this.img.height, c.x, c.y, c.width, c.height);
			};

			this.setSource = (src) => {
				const resizeLayer = () => {
					const w = imageEl.getTotalWidth();
					const h = imageEl.getTotalHeight();
					currentWindow.setCanvasSize(layer, w, h);
				};

				this.img.onload = () => {
					if (!this.hasPredefinedWidthAndHeight()) {
						imageEl.setSize(this.img.width, this.img.height);
						resizeLayer();
					}
					this.paintImage();
				};
				this.img.src = src;

				if (this.hasPredefinedWidthAndHeight()) {
					resizeLayer();
				}
			};

			this.setBorderSize = (t,r,l,b) => {
				if (!t) {
					throw new Error("setBorderSize() Missing parameters");
				}
				const border = imageEl.border;
				border.top		= t;
				border.right	= r || t;
				border.bottom	= b || t;
				border.left		= l || t;
			};

			this.setBorderColor = (c) => {
				this.borderColor = c;
			};
		};
		return mixin(imageEl, new ImageDisplay());
	}
}
