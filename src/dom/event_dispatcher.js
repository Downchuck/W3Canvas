import { Event, MouseEvent, KeyboardEvent } from './event.js';
import { HTMLOptionElement } from './html/dom_html_basic.js';

const view = (typeof window !== 'undefined') ? window : {
    screenX: 0,
    screenY: 0,
    clientX: 0,
    clientY: 0,
    ctrlKey: false,
    altKey: false,
    shiftKey: false,
    metaKey: false,
    button: 0,
    relatedTarget: null,
    key: '',
    code: '',
    location: 0,
    keyCode: 0,
    charCode: 0
};

export class EventDispatcher {
    constructor(canvas, rootElement) {
        this.canvas = canvas;
        this.rootElement = rootElement;
        this.focusedElement = rootElement; // Default focus to the root
        this.mousedownTarget = null;
    }

    init() {
        this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.canvas.addEventListener('mouseup', (e) => this.handleMouseUp(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        window.addEventListener('keydown', (e) => this.handleKeyDown(e));
        window.addEventListener('keypress', (e) => this.handleKeyPress(e));
    }

    handleMouseDown(e) {
        const target = this.rootElement.hitTest(e.clientX, e.clientY);
        this.mousedownTarget = target;
        if (target) {
            if (target instanceof HTMLOptionElement) {
                const select = target.parent;
                const index = Array.from(select.options).indexOf(target);
                select.selectedIndex = index;
                select.isOpen = false;
                select.requestRepaint();
            } else {
                if (this.focusedElement !== target) {
                    if (this.focusedElement) {
                        this.focusedElement.dispatchEvent(new Event('blur'));
                    }
                    this.focusedElement = target;
                    this.focusedElement.dispatchEvent(new Event('focus'));
                }
            }

            const event = new MouseEvent(
                'mousedown', view, 1, e.screenX, e.screenY, e.clientX, e.clientY,
                e.ctrlKey, e.altKey, e.shiftKey, e.metaKey, e.button, null
            );
            target.dispatchEvent(event);
        }
    }

    handleMouseUp(e) {
        const target = this.rootElement.hitTest(e.clientX, e.clientY);
        if (target) {
            const event = new MouseEvent(
                'mouseup', view, 1, e.screenX, e.screenY, e.clientX, e.clientY,
                e.ctrlKey, e.altKey, e.shiftKey, e.metaKey, e.button, null
            );
            target.dispatchEvent(event);

            if (target === this.mousedownTarget) {
                const clickEvent = new MouseEvent(
                    'click', view, 1, e.screenX, e.screenY, e.clientX, e.clientY,
                    e.ctrlKey, e.altKey, e.shiftKey, e.metaKey, e.button, null
                );
                target.dispatchEvent(clickEvent);
            }
        }
        this.mousedownTarget = null;
    }

    handleMouseMove(e) {
        const target = this.rootElement.hitTest(e.clientX, e.clientY);
        if (target) {
            const event = new MouseEvent(
                'mousemove', view, 1, e.screenX, e.screenY, e.clientX, e.clientY,
                e.ctrlKey, e.altKey, e.shiftKey, e.metaKey, e.button, null
            );
            target.dispatchEvent(event);
        }
    }

    handleKeyDown(e) {
        if (this.focusedElement) {
            const event = new KeyboardEvent(
                'keydown', view, 1, e.key, e.code, e.location,
                e.ctrlKey, e.altKey, e.shiftKey, e.metaKey, e.keyCode, e.charCode
            );
            this.focusedElement.dispatchEvent(event);
        }
    }

    handleKeyPress(e) {
        if (this.focusedElement) {
            const event = new KeyboardEvent(
                'keypress', view, 1, e.key, e.code, e.location,
                e.ctrlKey, e.altKey, e.shiftKey, e.metaKey, e.keyCode, e.charCode
            );
            this.focusedElement.dispatchEvent(event);
        }
    }
}
