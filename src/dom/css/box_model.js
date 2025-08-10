import { boxModelFactory, DOMPoint, DOMRect, DOMSize, DOMBox } from './box_basic.js';

export class BoxModel {
    constructor() {
        this.offset = boxModelFactory.createPoint();
        this.deltaOffset = boxModelFactory.createPoint();
        this.margin = boxModelFactory.createRect();
        this.border = boxModelFactory.createRect();
        this.padding = boxModelFactory.createRect();
        this.contentArea = boxModelFactory.createSize();
    }

    getOffset() {
        return this.offset;
    }

    getTotalWidth() {
        return this.contentArea.width +
            this.padding.right + this.padding.left +
            this.border.right + this.border.left +
            this.margin.right + this.margin.left;
    }

    getTotalHeight() {
        return this.contentArea.height +
            this.padding.top + this.padding.bottom +
            this.border.top + this.border.bottom +
            this.margin.top + this.margin.bottom;
    }

    getMarginBox() {
        const box = boxModelFactory.createBox();
        box.x = this.offset.x + this.deltaOffset.x;
        box.y = this.offset.y + this.deltaOffset.y;
        box.width = this.getTotalWidth();
        box.height = this.getTotalHeight();
        return box;
    }

    getBorderBox() {
        const box = this.getMarginBox();
        box.x = box.x + this.margin.left;
        box.y = box.y + this.margin.top;
        box.width	= box.width - this.margin.left - this.margin.right;
        box.height	= box.height - this.margin.top - this.margin.bottom;
        return box;
    }

    getPaddingBox() {
        const box = this.getBorderBox();
        box.x = box.x + this.border.left;
        box.y = box.y + this.border.top;
        box.width	= box.width - this.border.left - this.border.right;
        box.height	= box.height - this.border.top - this.border.bottom;
        return box;
    }

    getContentBox() {
        const box = this.getPaddingBox();
        box.x = box.x + this.padding.left;
        box.y = box.y + this.padding.top;
        box.width	= this.contentArea.width;
        box.height	= this.contentArea.height;
        return box;
    }

    setMargin(s) {
        this.margin.top = s;
        this.margin.right = s;
        this.margin.bottom = s;
        this.margin.left = s;
    }

    setPadding(p) {
        this.padding.top = p;
        this.padding.right = p;
        this.padding.bottom = p;
        this.padding.left = p;
    }

    setBorder(b) {
        this.border.top = b;
        this.border.right = b;
        this.border.bottom = b;
        this.border.left = b;
    }

    setSize(w, h) {
        this.contentArea.width = w;
        this.contentArea.height = h;
    }

    setOffset(x, y) {
        this.offset.x = x;
        this.offset.y = y;
    }

    setDeltaOffset(x, y) {
        this.deltaOffset.x = x;
        this.deltaOffset.y = y;
    }

    getComputedOffset() {
         const p = boxModelFactory.createPoint();
         p.x = this.offset.x + this.deltaOffset.x;
         p.y = this.offset.y + this.deltaOffset.y;
         return p;
    }

    getTopLength() {
        return this.margin.top + this.border.top + this.padding.top;
    }

    getRightLength() {
        return this.margin.right + this.border.right + this.padding.right;
    }

    getBottomLength() {
        return this.margin.bottom + this.border.bottom + this.padding.bottom;
    }

    getLeftLength() {
        return this.margin.left + this.border.left + this.padding.left;
    }

    isPointInsideBorder(x, y) {
        const box = this.getBorderBox();
        const inside = box.isPointInsideBox(x, y);
        return inside;
    }

    isPointInsideContent(x, y) {
        const box = this.getContentBox();
        const inside = box.isPointInsideBox(x, y);
        return inside;
    }

    copyRectFrom(src) {
        this.margin.top 		= src.margin.top;
        this.margin.right	= src.margin.right;
        this.margin.bottom	= src.margin.bottom;
        this.margin.left		= src.margin.left;

        this.border.top 		= src.border.top;
        this.border.right	= src.border.right;
        this.border.bottom	= src.border.bottom;
        this.border.left		= src.border.left;

        this.padding.top 	= src.padding.top;
        this.padding.right	= src.padding.right;
        this.padding.bottom	= src.padding.bottom;
        this.padding.left	= src.padding.left;
    }
}
