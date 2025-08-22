import assert from 'assert';
import { HTMLParser } from '../src/dom/parser/html_parser.js';
import { EventDispatcher } from '../src/dom/event_dispatcher.js';
import { HTMLInputElement } from '../src/dom/html/dom_html_input.js';
import { HTMLSelectElement } from '../src/dom/html/dom_html_select.js';
import { HTMLOptionElement } from '../src/dom/html/dom_html_option.js';
import { KeyboardEvent, MouseEvent } from '../src/dom/event.js';

describe('HTML Form Elements', () => {
    let parser, doc, dispatcher;

    beforeEach(() => {
        parser = new HTMLParser();
        const html = `
            <form>
                <input type="text" id="myinput" value="initial">
                <select id="myselect">
                    <option value="a">A</option>
                    <option value="b" selected>B</option>
                    <option value="c">C</option>
                </select>
            </form>
        `;
        doc = parser.parse(html);
        const canvas = {
            addEventListener: () => {}
        };
        dispatcher = new EventDispatcher(canvas, doc.body);
    });

    it('should parse and create input element correctly', () => {
        const input = doc.getElementById('myinput');
        assert(input instanceof HTMLInputElement, 'input should be an instance of HTMLInputElement');
        assert.strictEqual(input.value, 'initial', 'input should have correct initial value');
    });

    it('should parse and create select and option elements correctly', () => {
        const select = doc.getElementById('myselect');
        assert(select instanceof HTMLSelectElement, 'select should be an instance of HTMLSelectElement');
        assert.strictEqual(select.options.length, 3, 'select should have 3 options');
        assert(select.options.item(0) instanceof HTMLOptionElement, 'option should be an instance of HTMLOptionElement');
        assert.strictEqual(select.selectedIndex, -1, 'select should have correct initial selectedIndex');
    });

    it('should update input value on keydown', () => {
        const input = doc.getElementById('myinput');
        dispatcher.focusedElement = input;
        dispatcher.handleKeyDown({ key: 't', code: 'KeyT' });
        dispatcher.handleKeyDown({ key: 'e', code: 'KeyE' });
        assert.strictEqual(input.value, 'initialte', 'input value should be updated');
    });

    it('should update select selectedIndex on mousedown', () => {
        const select = doc.getElementById('myselect');
        const option = select.options.item(2); // Click on the third option
        const event = { clientX: 0, clientY: 0 };

        // Mock hitTest to return the option
        doc.body.hitTest = (x, y) => option;

        dispatcher.handleMouseDown(event);
        assert.strictEqual(select.selectedIndex, 2, 'select selectedIndex should be updated');
        assert.strictEqual(select.isOpen, false, 'select should be closed after selection');
    });
});
