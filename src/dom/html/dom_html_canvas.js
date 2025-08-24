import { HTMLElement, registerElement } from './dom_html_basic.js';
import { CanvasRenderingContext2D } from '../../core/canvas/CanvasRenderingContext2D.js';
import { stbi_write_png_to_mem } from '../../stb-image/png_write.js';
import { Buffer } from 'node:buffer';

class HTMLCanvasElement extends HTMLElement {
  constructor() {
    super('CANVAS');
    this.width = 0;
    this.height = 0;
    this.context = null;
  }

  getContext(contextId) {
    if (contextId === '2d') {
      if (!this.context) {
        this.context = new CanvasRenderingContext2D(this.width, this.height);
        this.context.canvas = this;
      }
      return this.context;
    }
    return null;
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
