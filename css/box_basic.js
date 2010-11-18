
colorjack.css = {};
    
colorjack.css.boxModelFactory = (function() {

  var DEFAULT_BOX_WIDTH	= 150;
  var DEFAULT_BOX_HEIGHT	= 300;

  function DOMPoint(x,y) {
  	this.x = x || 0;
  	this.y = y || 0;
  	this.toString = function() {
  		return "[Point -> x:"+this.x+", y:"+this.y+"]";
  	};
  };

  function DOMSize(w, h) {
  	this.width	= w || 0;
  	this.height = h || 0;
  	this.toString = function() {
  		return "[Size -> w:"+this.width+", h:"+this.height+"]";
  	};
  };

  function DOMBox(x,y,w,h) { // implements: Size, Point. [Box: this is what we really need for painting boxes]
  	this.x		= x || 0;
  	this.y		= y || 0;
  	this.width	= w || DEFAULT_BOX_WIDTH;
  	this.height	= h || DEFAULT_BOX_HEIGHT;

  	this.isPointInsideBox = function(xx, yy) {
  		var inside = (this.x <= xx && xx < this.x + this.width) &&
  					 (this.y <= yy && yy < this.y + this.height);
  		return inside;
  	};
  	this.toString = function() {
  		return "[Box -> x:"+this.x+", y:"+this.y+", w:"+this.width+", h:"+this.height+"]";
  	};
  };

  function DOMRect(t,r,b,l) { // Used for margin, border and padding
  	this.top	= t || 0;
  	this.right	= r || 0;
  	this.bottom = b || 0;
  	this.left	= l || 0;
  	this.toString = function() {
  		return "[Rect -> t:"+this.top+",r:"+this.right+",b:"+this.bottom+",l:"+this.left+"]";
  	};
  };
  
  return {
  	createPoint	: function(x,y)		{ return new DOMPoint(); },
  	createRect	: function(t,r,b,l)	{ return new DOMRect(t,r,b,l); },
  	createSize	: function(w,h)		{ return new DOMSize(w,h); },
  	createBox	: function(x,y,w,h)	{ return new DOMBox(x,y,w,h); }
  };
	
})();
