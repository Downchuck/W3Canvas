import { currentDocument } from './html/dom_html_doc.js';

export function getWindowView() {
  return currentDocument.defaultView.window;
}

export function createCanvasLayer(w,h) {
  const layer = currentDocument.createElement('canvas');
  layer.style.position = "absolute";
  layer.style.visibility = "hidden";
  if (w && h) {
    setCanvasSize(layer, w, h);
  }
  return layer;
}

export function setCanvasSize(layer,w,h) {
  layer.setAttribute('width', w);
  layer.setAttribute('height', h);
}

export function setBorder(layer, width, color, style) {
  let border = width + "px " + color;
  if (style !== undefined) {
    border += " solid";
  }
  layer.style.border = border;
}

export function getBackgroundColor() {
  let bg;
  try {
    bg = currentDocument.body.bgColor;
  }	catch (ignore) {}
  return bg || 'white';
}

export function createBufferImage(x,y,w,h,image) {
  const canvas = currentDocument.createElement('canvas');
  canvas.setAttribute('width', w);
  canvas.setAttribute('height', h);

  const context = canvas.getContext('2d');

  x = Math.round(x);
  y = Math.round(y);
  w = Math.round(w);
  h = Math.round(h);

  context.drawImage(image, x,y,w,h, 0,0,w,h);
  const result = context.canvas;
  return result;
}

export function restoreBufferImage(ctx,buffer,x,y,w,h) {
  ctx.save();
  ctx.globalCompositeOperation = "copy";
  ctx.drawImage(buffer, 0, 0, w, h, x, y, w, h);
  ctx.restore();
}
