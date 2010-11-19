
colorjack.dom.SVGAnimatable = function(element) {
 return {};
//	element.onbegin
//	element.onend
//	element.onrepeat
}

colorjack.dom.SVGElement = function(element) {
  var SVGElement = function() {
    var id      = "";
    return {
      'setId'      : function(d) { id = d; },
      'getId'     : function()  { return id; },
      'setClassName'  : function(c) { className = c; },
      'getClassName'  : function()  { return className; }
    };
  };

  element.style = new ElementStyle(new CssStyle(), new SVGElement()); // SVGStyleable(Element)
  var SVGStyleable = function() {
    var fill      = "";
    var stroke      = "";
    var currentColor = function(color) {
	if(color && color != 'currentColor') return color;
	if(typeof(element.style) != 'undefined') return element.style.getColor();
	return '';
    }
    return {
      'setStroke'      : function(s) { stroke = s; },
      'getStroke'     : function()  { return currentColor(stroke); },
      'setFill'      : function(f) { fill = f; },
      'getFill'     : function()  { return currentColor(fill); }
    };
  };
  element = mixin(element, new SVGStyleable());

  var box = new BoxModel(); // not used
  element.getBoundingRect = function() { return box.getBorderBox(); };
  return mixin(element, box);
};

colorjack.dom.registerElement("svg:rect", "SVGRectElement", function(element) {
  var RectElement = function() {
   var width = 0;
   var height = 0;
   var x = 0;
   var y = 0;
   var rx = 0;
   var ry = 0;
   return {
      'getX'    : function()  { return x; },
      'setX'   : function(newX) { x = newX; },
      'getY'    : function()  { return y; },
      'setY'   : function(newX) { y = newY; },
      'getRy'    : function()  { return ry; },
      'setRy'   : function(newRy) { y = newRy; },
      'getRx'    : function()  { return rx; },
      'setRx'   : function(newRx) { x = newRx; },
      'getHeight'    : function()  { return height; },
      'setHeight'   : function(h) { height = h; },
      'getWidth'    : function()  { return width; },
      'setWidth'    : function(w) { width = w; }
    };
  };
  var base = new colorjack.dom.SVGElement(element);
  return mixin(base, new RectElement());
});

colorjack.controlFactory.Rectangle = function(layer) {

var rectEl = HtmlDoc.createElement("svg:rect");
var ctx = layer.getContext('2d');

var RectDisplay = function() {
 var RectDom = function (rect,fn) {
        // get specified geometry attributes' values or revert to default
        var w = rect.hasAttribute('width') ? Number(rect.getAttribute('width')) : 0;
        var h = rect.hasAttribute('height') ? Number(rect.getAttribute('height')) : 0;
        var x = rect.hasAttribute('x') ? Number(rect.getAttribute('x')) : 0;
        var y = rect.hasAttribute('y') ? Number(rect.getAttribute('y')) : 0;
        var rx = rect.hasAttribute('rx') ? Number(rect.getAttribute('rx')) : 0;
        var ry = rect.hasAttribute('ry') ? Number(rect.getAttribute('ry')) : 0;
        if(w <= 0 || h <= 0) return;
        // check rx and ry values to match if one is 0
        if ((rx == 0 || ry == 0) && !(rx == 0 && ry == 0)) {
                rx = (rx == 0) ? ry : rx;
                ry = (ry == 0) ? rx : ry;
        }
// from antoine: need to match cx and cy in case one is missing and clip values if great than half w/h
	if(typeof(fn) != 'function') fn = RectReflectString;
        return fn(x,y,w,h,rx,ry);
 };

 var RectReflectString = function (x,y,w,h,rx,ry) {
        if(!rx) return ['M'+x,y,'H'+(x+w),'L'+(h+y),'H'+x,'L'+y,'z'].join(',');
        return ['M'+x,y, // Rounded rectangle
                        'H'+(x+w),'C'+[x+w,y,x+w,y+ry,x+w,y+ry].join(','),
                        'L'+(h+y),'C'+[x+w,y+h,x+w-rx,y+h,x+w-rx,y+h].join(','),
                        'H'+x,'C'+[x,y+h,x,y+h-ry,x,y+h-ry].join(','),
                        'L'+y,'C'+[x,y,x+rx,y,x+rx,y].join(','),'z'].join(',');
 };

 var RectPainter = function (x,y,w,h,rx,ry) {
        if(!rx) {
                ctx.beginPath();
                ctx.rect(x,y,w,h);
                ctx.closePath();
                return;
        }
        ctx.beginPath();
        ctx.moveTo(x+rx,y);
        ctx.lineTo(x+w-rx,y);
        ctx.bezierCurveTo(x+w,y,x+w,y+ry,x+w,y+ry);
        ctx.lineTo(x+w,y+h-ry);
        ctx.bezierCurveTo(x+w,y+h,x+w-rx,y+h,x+w-rx,y+h);
        ctx.lineTo(x+rx,y+h);
        ctx.bezierCurveTo(x,y+h,x,y+h-ry,x,y+h-ry);
        ctx.lineTo(x,y+ry);
        ctx.bezierCurveTo(x,y,x+rx,y,x+rx,y);
        ctx.closePath();
 };

 var repaint = function() {
   ctx = layer.getContext('2d');
   layer.width = 200; layer.height = 200;
//   RectPainter(this.getX()||0,this.getY()||0,this.getWidth()||300,this.getHeight||150,this.getRx(),this.getRy());
   rectEl.setFill('blue');
   RectPainter(this.getX()||0,this.getY()||0,this.getWidth()||300,this.getHeight()||150,this.getRx(),this.getRy());
   ctx.fillStyle = this.getFill();
   ctx.strokeStyle = this.getStroke();
   ctx.fill();
   ctx.stroke();
 };
	
 return {
	'repaint': repaint,
	'getPainter'             : RectPainter,
	'getDom'             : RectDom,
	'getString'             : RectReflectString
 };

 };

 return mixin(rectEl, new RectDisplay());

};

