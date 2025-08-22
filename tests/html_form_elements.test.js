import { test } from 'node:test';
import assert from 'node:assert';

global.Image = class {
    constructor() {
        // Mock Image class
    }
};
import { HTMLParser } from '../src/dom/parser/html_parser.js';
import { EventDispatcher } from '../src/dom/event_dispatcher.js';
import { HTMLInputElement, HTMLSelectElement, HTMLOptionElement } from '../src/dom/html/dom_html_basic.js';
import { KeyboardEvent, MouseEvent } from '../src/dom/event.js';

test('should parse and create input element correctly', () => {
    const parser = new HTMLParser();
    const html = `<input type="text" id="myinput" value="initial">`;
    const doc = parser.parse(html);
    const input = doc.getElementById('myinput');
    assert(input instanceof HTMLInputElement, 'input should be an instance of HTMLInputElement');
    assert.strictEqual(input.value, 'initial', 'input should have correct initial value');
});

test('should parse and create select and option elements correctly', () => {
    const parser = new HTMLParser();
    const html = `
        <select id="myselect">
            <option value="a">A</option>
            <option value="b" selected>B</option>
            <option value="c">C</option>
        </select>
    `;
    const doc = parser.parse(html);
    const select = doc.getElementById('myselect');
    assert(select instanceof HTMLSelectElement, 'select should be an instance of HTMLSelectElement');
    assert.strictEqual(select.options.length, 3, 'select should have 3 options');
    assert(select.options.item(0) instanceof HTMLOptionElement, 'option should be an instance of HTMLOptionElement');
    assert.strictEqual(select.selectedIndex, -1, 'select should have correct initial selectedIndex');
});

test('should update input value on keydown', () => {
    const parser = new HTMLParser();
    const html = `<input type="text" id="myinput" value="initial">`;
    const doc = parser.parse(html);
    const input = doc.getElementById('myinput');
    const canvas = { addEventListener: () => {} };
    const dispatcher = new EventDispatcher(canvas, doc.body);
    dispatcher.focusedElement = input;
    input.isFocused = true; // Manually set focus for the test
    dispatcher.handleKeyDown({ key: 't', code: 'KeyT' });
    dispatcher.handleKeyDown({ key: 'e', code: 'KeyE' });
    assert.strictEqual(input.value, 'initialte', 'input value should be updated');
});

test('should update select selectedIndex on mousedown', () => {
    const parser = new HTMLParser();
    const html = `
        <select id="myselect">
            <option value="a">A</option>
            <option value="b">B</option>
            <option value="c">C</option>
        </select>
    `;
    const doc = parser.parse(html);
    const select = doc.getElementById('myselect');
    const option = select.options.item(2); // Click on the third option
    const event = { clientX: 0, clientY: 0 };
    const canvas = { addEventListener: () => {} };
    const dispatcher = new EventDispatcher(canvas, doc.body);

    // Mock hitTest to return the option
    doc.body.hitTest = (x, y) => option;

    dispatcher.handleMouseDown(event);
    assert.strictEqual(select.selectedIndex, 2, 'select selectedIndex should be updated');
    assert.strictEqual(select.isOpen, false, 'select should be closed after selection');
});

test('should toggle checkbox state on click', () => {
    const parser = new HTMLParser();
    const html = `<input type="checkbox" id="mycheckbox" checked>`;
    const doc = parser.parse(html);
    const checkbox = doc.getElementById('mycheckbox');
    assert.strictEqual(checkbox.checked, true, 'checkbox should be initially checked');

    const event = { clientX: 0, clientY: 0 };
    const canvas = { addEventListener: () => {} };
    const dispatcher = new EventDispatcher(canvas, doc.body);
    doc.body.hitTest = (x, y) => checkbox;

    dispatcher.handleMouseDown(event);
    dispatcher.handleMouseUp(event);
    assert.strictEqual(checkbox.checked, false, 'checkbox should be unchecked after first click');

    dispatcher.handleMouseDown(event);
    dispatcher.handleMouseUp(event);
    assert.strictEqual(checkbox.checked, true, 'checkbox should be checked after second click');
});

test('should handle radio button groups correctly', () => {
    const parser = new HTMLParser();
    const html = `
        <input type="radio" name="color" id="red" value="red">
        <input type="radio" name="color" id="green" value="green" checked>
        <input type="radio" name="color" id="blue" value="blue">
    `;
    const doc = parser.parse(html);
    const red = doc.getElementById('red');
    const green = doc.getElementById('green');
    const blue = doc.getElementById('blue');

    assert.strictEqual(red.checked, false, 'red should be initially unchecked');
    assert.strictEqual(green.checked, true, 'green should be initially checked');
    assert.strictEqual(blue.checked, false, 'blue should be initially unchecked');

    const event = { clientX: 0, clientY: 0 };
    const canvas = { addEventListener: () => {} };
    const dispatcher = new EventDispatcher(canvas, doc.body);

    doc.body.hitTest = (x, y) => red;
    dispatcher.handleMouseDown(event);
    dispatcher.handleMouseUp(event);

    assert.strictEqual(red.checked, true, 'red should be checked after click');
    assert.strictEqual(green.checked, false, 'green should be unchecked after red is clicked');
    assert.strictEqual(blue.checked, false, 'blue should be unchecked after red is clicked');
});

test('should dispatch click event on button', () => {
    const parser = new HTMLParser();
    const html = `<input type="button" id="mybutton" value="Click Me">`;
    const doc = parser.parse(html);
    const button = doc.getElementById('mybutton');

    let clicked = false;
    button.addEventListener('click', () => {
        clicked = true;
    });

    const event = { clientX: 0, clientY: 0 };
    const canvas = { addEventListener: () => {} };
    const dispatcher = new EventDispatcher(canvas, doc.body);
    doc.body.hitTest = (x, y) => button;

    dispatcher.handleMouseDown(event);
    dispatcher.handleMouseUp(event);
    assert.strictEqual(clicked, true, 'click event should be dispatched on button');
});
