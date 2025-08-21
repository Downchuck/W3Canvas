import { test } from 'node:test';
import assert from 'node:assert';
import { HTMLParser } from '../src/dom/parser/html_parser.js';
import { SVGElement } from '../src/dom/svg/dom_svg.js';
import { SVGRectElement } from '../src/dom/svg/dom_svg_rect.js';
import { NODE_TYPE_ELEMENT } from '../src/dom/html/dom_core.js';

test('HTML Parser should handle inline SVG elements', (t) => {
    const html = `
        <svg width="100" height="100">
            <rect x="10" y="10" width="80" height="80" fill="blue"></rect>
        </svg>`;
    const parser = new HTMLParser();
    const doc = parser.parse(html);

    const svg = doc.body.children.find(node => node.nodeType === NODE_TYPE_ELEMENT);
    assert.ok(svg, 'Document body should have an element child');
    assert.strictEqual(svg.tagName, 'svg', 'Element should be an <svg>');
    assert.ok(svg instanceof SVGElement, 'Element should be an instance of SVGElement');

    const rect = svg.children.find(node => node.nodeType === NODE_TYPE_ELEMENT);
    assert.ok(rect, '<svg> should have a child');
    assert.strictEqual(rect.tagName, 'rect', 'Element should be a <rect>');
    assert.ok(rect instanceof SVGRectElement, 'Element should be an instance of SVGRectElement');
    assert.strictEqual(rect.getAttribute('fill'), 'blue', 'Rect should have fill attribute');
});
