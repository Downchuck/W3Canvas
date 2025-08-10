export class Box {
	x = 0;
	y = 0;
	width = 0;
	height = 0;
	minWidth = 0;
	minHeight = 0;
	maxWidth = 0;
	maxHeight = 0;
};

export class Node {
	id: any;
	boxes = [];
	linenum: any;
	constructor(id) {
		this.id = id;
		this.linenum = id;
	}
	addBox(box) { this.boxes.push(box); }
};

export class Range {
	startContainer = 0;
	startOffset = 0;
	endContainer = 0;
	endOffset = 0;
	setStart(node, offset) { this.startContainer = node; this.startOffset = offset;	}
	setEnd(node, offset) { this.endContainer = node; this.endOffset = offset; }
};

export class DocumentFragment {
	content: any;
	range: any;
	cssHack = '';
	constructor(content, range) {
		this.content = content;
		this.range = range;
	}
};

export class DocumentTree {
	textContent: any;
	nodes = [];
	constructor(content) {
		this.textContent = content;
	}
};

export class BoxTree {
	boxes = [];
};
