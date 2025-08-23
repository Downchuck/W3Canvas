global.EventTarget = class {
    constructor() {
        this.listeners = {};
    }

    addEventListener(type, callback) {
        if (!(type in this.listeners)) {
            this.listeners[type] = [];
        }
        this.listeners[type].push(callback);
    }

    removeEventListener(type, callback) {
        if (!(type in this.listeners)) {
            return;
        }
        const stack = this.listeners[type];
        for (let i = 0, l = stack.length; i < l; i++) {
            if (stack[i] === callback) {
                stack.splice(i, 1);
                return;
            }
        }
    }

    dispatchEvent(event) {
        if (!(event.type in this.listeners)) {
            return true;
        }
        const stack = this.listeners[event.type].slice();
        for (let i = 0, l = stack.length; i < l; i++) {
            stack[i].call(this, event);
        }
        return !event.defaultPrevented;
    }
}

global.HTMLElement = class extends EventTarget {
    constructor() {
        super();
    }
};

global.Image = class extends HTMLElement {
    constructor() {
        super();
        this._src = '';
        this.onload = null;
        this.onerror = null;
    }

    set src(value) {
        this._src = value;
        // Simulate async loading.
        setTimeout(() => {
            if (this.onload) {
                this.onload();
            }
        }, 0);
    }

    get src() {
        return this._src;
    }
};
