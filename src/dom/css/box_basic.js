import { DOMPoint, DOMSize, DOMBox, DOMRect } from './box.js';

export { DOMPoint, DOMSize, DOMBox, DOMRect };

export const boxModelFactory = {
  createPoint: function(x,y)		{ return new DOMPoint(x,y); },
  createRect: function(t,r,b,l)	{ return new DOMRect(t,r,b,l); },
  createSize: function(w,h)		{ return new DOMSize(w,h); },
  createBox: function(x,y,w,h)	{ return new DOMBox(x,y,w,h); }
};
