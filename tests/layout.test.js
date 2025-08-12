import { CanvasRenderingContext2D } from '../src/core/canvas/CanvasRenderingContext2D.js';
import { HTMLDivElement, HTMLSpanElement } from '../src/dom/html/dom_html_basic.js';
import { TextNode } from '../src/dom/html/dom_core.js';

// TODO: This test requires a DOM environment (like jsdom) to provide a 'document' object
// for the text measuring functions used in doLayout. The default node:test runner does not
// provide this. Skipping for now.
test('Layout engine creates line boxes for a div with multiple spans', () => {
    const ctx = new CanvasRenderingContext2D(200, 100);
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

    expect(div.lineBoxes).toBeDefined();
    expect(div.lineBoxes.length).toBe(1);
    const line = div.lineBoxes[0];
    expect(line.getBoxes().length).toBe(2);
    expect(line.getContent()).toBe('Hello world');
});
