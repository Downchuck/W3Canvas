import { test } from 'node:test';
import assert from 'node:assert';
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
