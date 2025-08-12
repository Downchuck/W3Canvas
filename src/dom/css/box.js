const DEFAULT_BOX_WIDTH	= 150;
const DEFAULT_BOX_HEIGHT	= 300;

export class DOMPoint {
  x;
  y;

  constructor(x, y) {
    this.x = x || 0;
    this.y = y || 0;
  }

  toString() {
    return "[Point -> x:" + this.x + ", y:" + this.y + "]";
  }
}

export class DOMSize {
  width;
  height;

  constructor(w, h) {
    this.width	= w || 0;
    this.height = h || 0;
  }

  toString() {
    return "[Size -> w:" + this.width + ", h:" + this.height + "]";
  }
}

export class DOMBox {
  x;
  y;
  width;
  height;

  constructor(x, y, w, h) {
    this.x		= x || 0;
    this.y		= y || 0;
    this.width	= w || DEFAULT_BOX_WIDTH;
    this.height	= h || DEFAULT_BOX_HEIGHT;
  }

  isPointInsideBox(xx, yy) {
    const inside = (this.x <= xx && xx < this.x + this.width) &&
           (this.y <= yy && yy < this.y + this.height);
    return inside;
  }

  toString() {
    return "[Box -> x:" + this.x + ", y:" + this.y + ", w:" + this.width + ", h:" + this.height + "]";
  }
}

export class DOMRect {
  top;
  right;
  bottom;
  left;

  constructor(t, r, b, l) {
    this.top	= t || 0;
    this.right	= r || 0;
    this.bottom = b || 0;
    this.left	= l || 0;
  }

  toString() {
    return "[Rect -> t:" + this.top + ",r:" + this.right + ",b:" + this.bottom + ",l:" + this.left + "]";
  }
}
