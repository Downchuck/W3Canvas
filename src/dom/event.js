export class Event {
    constructor(type) {
        this.type = type;
        this.target = null;
        this.bubbles = true;
        this.cancelable = false;
        this.defaultPrevented = false;
    }

    stopPropagation() {
        this.bubbles = false;
    }

    preventDefault() {
        this.defaultPrevented = true;
    }
}

export class UIEvent extends Event {
    constructor(type, view, detail) {
        super(type);
        this.view = view;
        this.detail = detail;
    }
}

export class MouseEvent extends UIEvent {
    constructor(type, view, detail, screenX, screenY, clientX, clientY, ctrlKey, altKey, shiftKey, metaKey, button, relatedTarget) {
        super(type, view, detail);
        this.screenX = screenX;
        this.screenY = screenY;
        this.clientX = clientX;
        this.clientY = clientY;
        this.ctrlKey = ctrlKey;
        this.altKey = altKey;
        this.shiftKey = shiftKey;
        this.metaKey = metaKey;
        this.button = button;
        this.relatedTarget = relatedTarget;
    }
}

export class KeyboardEvent extends UIEvent {
    constructor(type, view, detail, key, code, location, ctrlKey, altKey, shiftKey, metaKey, keyCode, charCode) {
        super(type, view, detail);
        this.key = key;
        this.code = code;
        this.location = location;
        this.ctrlKey = ctrlKey;
        this.altKey = altKey;
        this.shiftKey = shiftKey;
        this.metaKey = metaKey;
        this.keyCode = keyCode;
        this.charCode = charCode;
    }
}
