export class Font {
    family = 'Arial';
    size = 12;
    color = 'black';
    scaleFactor = 0.2;

    constructor(family, size, color) {
        if (family) this.family = family;
        if (size) this.size = size;
        if (color) this.color = color;
    }

    getFontFamily() {
        return this.family;
    }

    getFontSize() {
        return this.size;
    }

    getTextColor() {
        return this.color;
    }

    getScaleFactor() {
        return this.scaleFactor;
    }

    setScaleFactor(s) {
        this.scaleFactor = s;
    }

    setTextColor(c) {
        this.color = c;
    }
}
