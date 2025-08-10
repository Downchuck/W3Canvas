import { drawArc } from './alg/arc.js';

export class CustomCanvasRenderingContext2D {
  constructor(canvas, Rectangle) {
    this.canvas = canvas;
    this.Rectangle = Rectangle;
    this.fillStyle = 'black';
    this.imageData = {
      data: new Uint8ClampedArray(canvas.width * canvas.height * 4),
      width: canvas.width,
      height: canvas.height,
    };
  }

  getImageData(x, y, w, h) {
    return this.imageData;
  }

  putImageData(imageData, x, y) {
    this.imageData = imageData;
  }

  fillRect(x, y, width, height) {
    const rect = new this.Rectangle(this.canvas);
    rect.setX(x);
    rect.setY(y);
    rect.setWidth(width);
    rect.setHeight(height);
    rect.fill = this.fillStyle;
    rect.repaint();
  }

  arc(x, y, radius, startAngle, endAngle) {
    console.log('arc called');
    drawArc(this, x, y, radius, startAngle, endAngle);
  }
}
