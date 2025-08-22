import { test } from 'node:test';
import assert from 'node:assert';

global.Image = class {
    constructor() {
        // Mock Image class
    }
};
import { HTMLParser } from '../src/dom/parser/html_parser.js';
import { EventDispatcher } from '../src/dom/event_dispatcher.js';
import { HTMLDetailsElement, HTMLSummaryElement, HTMLProgressElement, HTMLMeterElement, HTMLTimeElement, HTMLMarkElement, HTMLFigureElement, HTMLFigCaptionElement } from '../src/dom/html/dom_html_basic.js';

test('should toggle details element on summary click', () => {
    const parser = new HTMLParser();
    const html = `
        <details>
            <summary>Title</summary>
            <p>Content</p>
        </details>
    `;
    const doc = parser.parse(html);
    const details = doc.getElementsByTagName('details').item(0);
    const summary = doc.getElementsByTagName('summary').item(0);

    assert.strictEqual(details.open, false, 'details should be initially closed');

    const event = { clientX: 0, clientY: 0 };
    const canvas = { addEventListener: () => {} };
    const dispatcher = new EventDispatcher(canvas, doc.body);
    doc.body.hitTest = (x, y) => summary;

    dispatcher.handleMouseDown(event);
    dispatcher.handleMouseUp(event);

    assert.strictEqual(details.open, true, 'details should be open after click');
});

test('should parse progress element with attributes', () => {
    const parser = new HTMLParser();
    const html = `<progress id="myprogress" value="70" max="100"></progress>`;
    const doc = parser.parse(html);
    const progress = doc.getElementById('myprogress');
    assert.strictEqual(progress.value, 70, 'progress value should be 70');
    assert.strictEqual(progress.max, 100, 'progress max should be 100');
});

test('should parse meter element with attributes', () => {
    const parser = new HTMLParser();
    const html = `<meter id="mymeter" value="2" min="0" max="10" low="3" high="8" optimum="6"></meter>`;
    const doc = parser.parse(html);
    const meter = doc.getElementById('mymeter');
    assert.strictEqual(meter.value, 2, 'meter value should be 2');
    assert.strictEqual(meter.min, 0, 'meter min should be 0');
    assert.strictEqual(meter.max, 10, 'meter max should be 10');
    assert.strictEqual(meter.low, 3, 'meter low should be 3');
    assert.strictEqual(meter.high, 8, 'meter high should be 8');
    assert.strictEqual(meter.optimum, 6, 'meter optimum should be 6');
});

test('should parse time and mark elements', () => {
    const parser = new HTMLParser();
    const html = `<p>The concert is at <time id="mytime">20:00</time>. Do not forget to buy <mark id="mymark">milk</mark> today.</p>`;
    const doc = parser.parse(html);
    const time = doc.getElementById('mytime');
    const mark = doc.getElementById('mymark');
    assert.strictEqual(time.tagName, 'time', 'time element should be parsed');
    assert.strictEqual(mark.tagName, 'mark', 'mark element should be parsed');
});

test('should parse figure and figcaption elements', () => {
    const parser = new HTMLParser();
    const html = `
        <figure id="myfigure">
            <p>A cute cat.</p>
            <figcaption id="myfigcaption">Fig.1 - A cat, probably plotting something.</figcaption>
        </figure>
    `;
    const doc = parser.parse(html);
    const figure = doc.getElementById('myfigure');
    const figcaption = doc.getElementById('myfigcaption');
    assert.strictEqual(figure.tagName, 'figure', 'figure element should be parsed');
    assert.strictEqual(figcaption.tagName, 'figcaption', 'figcaption element should be parsed');
    assert.strictEqual(figure.children.includes(figcaption), true, 'figcaption should be a child of figure');
});

test('should parse time and datetime-local input types', () => {
    const parser = new HTMLParser();
    const html = `
        <input type="time" id="mytime" value="13:30">
        <input type="datetime-local" id="mydatetime" value="2025-08-21T19:30">
    `;
    const doc = parser.parse(html);
    const timeInput = doc.getElementById('mytime');
    const datetimeInput = doc.getElementById('mydatetime');
    assert.strictEqual(timeInput.type, 'time', 'time input type should be correct');
    assert.strictEqual(timeInput.value, '13:30', 'time input value should be correct');
    assert.strictEqual(datetimeInput.type, 'datetime-local', 'datetime-local input type should be correct');
    assert.strictEqual(datetimeInput.value, '2025-08-21T19:30', 'datetime-local input value should be correct');
});
