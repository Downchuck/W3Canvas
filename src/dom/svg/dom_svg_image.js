import { SVGElement } from './dom_svg_base.js';
import { registerElement } from '../html/dom_html_basic.js';
import { loadImageFromMemorySync } from '../../stb-image/index.js';
import fs from 'fs';

export class SVGImageElement extends SVGElement {
    constructor() {
        super('svg:image');
        this.href = '';
        this.x = 0;
        this.y = 0;
        this.width = 0;
        this.height = 0;
        this.imgData = null; // To hold the loaded image data from stb-image
        this.onload = null;
    }

    getHref() { return this.href; }
    setHref(val) {
        this.href = val;
        // The responsibility of getting the buffer is here
        if (typeof window === 'undefined') {
            const buffer = fs.readFileSync(val);
            this._loadImage(buffer, loadImageFromMemorySync);
        } else {
            fetch(val)
                .then(response => {
                    if (!response.ok) throw new Error(`Failed to fetch image: ${response.statusText}`);
                    return response.arrayBuffer();
                })
                .then(buffer => {
                    this._loadImage(buffer, loadImageFromMemorySync);
                })
                .catch(error => console.error(`Error loading SVG image ${val}:`, error));
        }
    }
    getX() { return this.x; }
    setX(val) { this.x = val; }
    getY() { return this.y; }
    setY(val) { this.y = val; }
    getWidth() { return this.width; }
    setWidth(val) { this.width = val; }
    getHeight() { return this.height; }
    setHeight(val) { this.height = val; }

    // This method is now synchronous and only cares about the buffer
    _loadImage(buffer, imageLoader) {
        try {
            const image = imageLoader(buffer);
            if (image) {
                this.imgData = image;
                if (this.onload) {
                    this.onload();
                }
            } else {
                throw new Error('Failed to decode image');
            }
        } catch (error) {
            console.error(`Error loading SVG image:`, error);
        }
    }
}

export class Image extends SVGImageElement {
    constructor() {
        super();
        this.ctx = null;

        // When the image loads, we need to repaint
        this.onload = () => {
            this.repaint();
        };
    }

    repaint(ctx) {
        if (!ctx) {
			// Fallback for tests that don't pass a context
			let parent = this.getParent();
			while(parent && parent.tagName !== 'CANVAS') {
				parent = parent.getParent();
			}
			if (parent && parent.tagName === 'CANVAS') {
				ctx = parent.getContext('2d');
			}
		}
        if (!ctx) {
            // Can't repaint yet, but don't log an error as the canvas might just not be ready.
            // It will be called again when the parent repaints.
            return;
        }
        this.ctx = ctx;

        if (this.imgData) {
            ctx.save();
            this.applyTransform(ctx);

            // Adapt the stb-image object to what drawImage expects
            const imageForCanvas = {
                data: this.imgData.data,
                width: this.imgData.w,
                height: this.imgData.h
            };

            const x = this.getX() || 0;
            const y = this.getY() || 0;
            const width = this.getWidth() || imageForCanvas.width;
            const height = this.getHeight() || imageForCanvas.height;

            this.ctx.drawImage(imageForCanvas, x, y, width, height);

            ctx.restore();
        }
    }
}

registerElement("svg:image", "SVGImageElement", Image);
