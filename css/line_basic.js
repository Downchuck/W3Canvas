
// Namespaces

//var colorjack = {}; // now defined in lang_util.js
	//colorjack.debug = {};
    colorjack.boxmodel = {};
    colorjack.component = {};
    colorjack.textbox = {};
	colorjack.textbox.model = {};
	colorjack.keyboard = {};
    colorjack.textbox.mouse = {};
    colorjack.textbox.ui = {};
    colorjack.textbox.ui.graphics = {};
    colorjack.textbox.ui.cursor = {};

// display: block-inline;

// Useful as a css linebox
colorjack.boxmodel.Box = function() {
	this.x = 0;
	this.y = 0;
	this.width = 0;
	this.height = 0;
	this.minWidth = 0;
	this.minHeight = 0;
	this.maxWidth = 0;
	this.maxHeight = 0;
};

// NOTE: colorjack.boxmodel.Node: not used at all yet! For future use
// could be useful for multiple text nodes
colorjack.boxmodel.Node = function(id) {
	this.id = id;
	this.boxes = []; // This takes over the app.visualTextBox.getLines()[] box array into bunch of Nodes.boxes, but in practice we always have a single box.
	this.addBox = function(box) { this.boxes.push(box); }; // CSS3 Box model: each node points to 0, 1 or more boxes
	this.linenum = id; // Ok, this is really a hack and not part of the CSS specs
};


// see visual_selection for Selection

colorjack.boxmodel.Range = function() {
	this.startContainer = 0; //new colorjack.boxmodel.Node(0); ?
	this.startOffset = 0;
	this.endContainer = 0; //new colorjack.boxmodel.Node(0); ?
	this.endOffset = 0;
	// this.collapsed = true;
	// commonAncestorContainer [ parentNode containing both start and endContainer ]
	this.setStart = function(node, offset) { this.startContainer = node; this.startOffset = offset;	};	
	this.setEnd = function(node, offset) { this.endContainer = node; this.endOffset = offset; };
};

colorjack.boxmodel.DocumentFragment = function(content, range) { // interface for copy/paste/cut and perhaps undo ops!
	this.content = content;	
	this.range = range;
	
	this.cssHack = '';	
};

// A DocumentTree gets parsed into a BoxTree

colorjack.boxmodel.DocumentTree = function(content) {
	this.textContent = content;
	this.nodes = []; // Implementation note: our tree is kind of flat at the moment (sufficient for our needs)
	// BoxTree parseDocument(textContent, lineMaxWidth) // whenever there's editing
};

colorjack.boxmodel.BoxTree = function() {
	this.boxes = []; // Implementation note: our tree is kind of flat at the moment (sufficient for our needs)
};

//-------------------------------------------------------------------------------------------------------
