import { MouseEvent, KeyboardEvent } from './event.js';

export class EventDispatcher {
    constructor(canvas, rootElement) {
        this.canvas = canvas;
        this.rootElement = rootElement;
        this.focusedElement = rootElement; // Default focus to the root
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
        if (target) {
            this.focusedElement = target;
            const event = new MouseEvent(
                'mousedown', window, 1, e.screenX, e.screenY, e.clientX, e.clientY,
                e.ctrlKey, e.altKey, e.shiftKey, e.metaKey, e.button, null
            );
            target.dispatchEvent(event);
        }
    }

    handleMouseUp(e) {
        const target = this.rootElement.hitTest(e.clientX, e.clientY);
        if (target) {
            const event = new MouseEvent(
                'mouseup', window, 1, e.screenX, e.screenY, e.clientX, e.clientY,
                e.ctrlKey, e.altKey, e.shiftKey, e.metaKey, e.button, null
            );
            target.dispatchEvent(event);
        }
    }

    handleMouseMove(e) {
        const target = this.rootElement.hitTest(e.clientX, e.clientY);
        if (target) {
            const event = new MouseEvent(
                'mousemove', window, 1, e.screenX, e.screenY, e.clientX, e.clientY,
                e.ctrlKey, e.altKey, e.shiftKey, e.metaKey, e.button, null
            );
            target.dispatchEvent(event);
        }
    }

    handleKeyDown(e) {
        if (this.focusedElement) {
            const event = new KeyboardEvent(
                'keydown', window, 1, e.key, e.code, e.location,
                e.ctrlKey, e.altKey, e.shiftKey, e.metaKey, e.keyCode, e.charCode
            );
            this.focusedElement.dispatchEvent(event);
        }
    }

    handleKeyPress(e) {
        if (this.focusedElement) {
            const event = new KeyboardEvent(
                'keypress', window, 1, e.key, e.code, e.location,
                e.ctrlKey, e.altKey, e.shiftKey, e.metaKey, e.keyCode, e.charCode
            );
            this.focusedElement.dispatchEvent(event);
        }
    }
}
