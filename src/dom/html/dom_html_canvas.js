import { HTMLElement, registerElement } from './dom_html_basic.js';
import { CanvasRenderingContext2D } from '../../core/canvas/CanvasRenderingContext2D.js';
import { OffscreenCanvas } from '../../core/canvas/OffscreenCanvas.js';
import { stbi_write_png_to_mem } from '../../stb-image/png_write.js';
import { Buffer } from 'node:buffer';

class HTMLCanvasElement extends HTMLElement {
  constructor() {
    super('CANVAS');
    this.width = 0;
    this.height = 0;
    this.context = null;
    this._isControlTransferred = false;
  }

  getContext(contextId) {
    if (this._isControlTransferred) {
      return null;
    }
    if (contextId === '2d') {
      if (!this.context) {
        this.context = new CanvasRenderingContext2D(this.width, this.height);
        this.context.canvas = this;
      }
      return this.context;
    }
    return null;
  }

  transferControlToOffscreen() {
    if (this._isControlTransferred) {
      // Not specified in MDN, but throwing an error seems reasonable
      // if called more than once.
      throw new Error("DOMException: The control of this canvas has already been transferred.");
    }
    this._isControlTransferred = true;
    const offscreenCanvas = new OffscreenCanvas(this.width, this.height);
    // In a real browser, the link between the OffscreenCanvas and the
    // original canvas is more direct, allowing for frames to be committed back.
    // This part of the implementation is simplified for now.
    return offscreenCanvas;
  }

  getWidth() {
    return this.width;
  }

  setWidth(w) {
    this.width = w;
    if (this.context) {
      this.context.width = w;
      this.context.imageData.width = w;
    }
  }

  getHeight() {
    return this.height;
  }

  setHeight(h) {
    this.height = h;
    if (this.context) {
      this.context.height = h;
      this.context.imageData.height = h;
    }
  }

  toDataURL(type = 'image/png') {
    if (type.toLowerCase() !== 'image/png') {
      // For now, we only support PNG. In the future, we could support JPEG, etc.
      return null;
    }

    const { data, width, height } = this.context.imageData;
    const out_len = { value: 0 };
    const n = 4; // RGBA
    const stride_bytes = width * n;

    const png_data = stbi_write_png_to_mem(data, stride_bytes, width, height, n, out_len);

    if (!png_data || out_len.value === 0) {
      return null;
    }

    const base64_data = Buffer.from(png_data).toString('base64');
    return `data:image/png;base64,${base64_data}`;
  }
}

registerElement("CANVAS", "HTMLCanvasElement", HTMLCanvasElement);
