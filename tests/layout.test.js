import { test } from 'node:test';
import assert from 'node:assert';
import { JSDOM } from 'jsdom';
import { CanvasRenderingContext2D } from '../src/core/canvas/CanvasRenderingContext2D.js';
import { HTMLDivElement, HTMLSpanElement } from '../src/dom/html/dom_html_basic.js';
import { TextNode } from '../src/dom/html/dom_core.js';

test('Layout engine creates line boxes for a div with multiple spans', () => {
    const dom = new JSDOM();
    const document = dom.window.document;

    const ctx = new CanvasRenderingContext2D(200, 100);
    ctx.setDocument(document);

    const div = new HTMLDivElement();

    const span1 = new HTMLSpanElement();
    span1.id = 'span1';
    const text1 = new TextNode('Hello ');
    span1.appendChild(text1);

    const span2 = new HTMLSpanElement();
    span2.id = 'span2';
    const text2 = new TextNode('world');
    span2.appendChild(text2);

    div.appendChild(span1);
    div.appendChild(span2);

    div.boxModel.setOffset(10, 10);
    div.boxModel.setSize(180, 80);

    div.doLayout(ctx);

    assert.ok(div.lineBoxes, 'lineBoxes should be created');
    assert.strictEqual(div.lineBoxes.length, 1, 'There should be one line box');
    const line = div.lineBoxes[0];
    assert.strictEqual(line.getBoxes().length, 2, 'The line should have two boxes (for the two spans)');
    assert.strictEqual(line.getContent(), 'Hello world', 'The content of the line should be correct');
});

test('Layout engine handles text-align: center', () => {
    const dom = new JSDOM();
    const document = dom.window.document;

    const ctx = new CanvasRenderingContext2D(200, 100);
    ctx.setDocument(document);

    const div = new HTMLDivElement();
    div.style.setProperty('text-align', 'center');

    const span = new HTMLSpanElement();
    const text = new TextNode('Hello');
    span.appendChild(text);
    div.appendChild(span);

    div.boxModel.setOffset(10, 10);
    div.boxModel.setSize(180, 80);

    div.doLayout(ctx);

    assert.ok(div.lineBoxes, 'lineBoxes should be created');
    assert.strictEqual(div.lineBoxes.length, 1, 'There should be one line box');
    const line = div.lineBoxes[0];
    assert.strictEqual(line.getBoxes().length, 1, 'The line should have one box');
    const box = line.getBoxes()[0];
    assert.ok(box.x > 0, 'The x position of the box should be greater than 0');
});
