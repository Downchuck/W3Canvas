import { HTMLElement, registerElement } from './dom_html_basic.js';
import { loadImageFromMemorySync } from '../../stb-image/index.js';
import fs from 'fs';

class HTMLImageElement extends HTMLElement {
  constructor() {
    super('IMG');
    this._src = '';
    this.data = null;
    this.width = 0;
    this.height = 0;
    this.onload = null;
    this.onerror = null;
  }

  get src() {
    return this._src;
  }

  set src(url) {
    this._src = url;
    this._loadImage(url);
  }

  async _loadImage(url) {
    try {
      let buffer;
      if (typeof window === 'undefined') {
        // In Node.js, read the file directly from the file system.
        buffer = fs.readFileSync(url);
      } else {
        // In the browser, use fetch to get the image data.
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Failed to fetch image: ${response.statusText}`);
        }
        buffer = await response.arrayBuffer();
      }

      const image = loadImageFromMemorySync(buffer);
      if (image) {
        this.data = image.data;
        this.width = image.w;
        this.height = image.h;
        if (this.onload) {
          this.onload();
        }
      } else {
        throw new Error('Failed to decode image');
      }
    } catch (error) {
      console.error(`Error loading image ${url}:`, error);
      if (this.onerror) {
        this.onerror(error);
      }
    }
  }
}

registerElement('IMG', 'HTMLImageElement', HTMLImageElement);

// We also need to export the class so it can be used directly.
export { HTMLImageElement };
