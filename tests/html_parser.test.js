import { test } from 'node:test';
import assert from 'node:assert';
import { HTMLParser } from '../src/dom/parser/html_parser.js';
import { NODE_TYPE_DOCUMENT, NODE_TYPE_ELEMENT, NODE_TYPE_TEXT } from '../src/dom/html/dom_core.js';

test('HTML Parser should correctly parse a simple HTML string', () => {
    const html = '<p>Hello</p>';
    const parser = new HTMLParser();
    const doc = parser.parse(html);

    // The document itself is the root
    assert.strictEqual(doc.nodeType, NODE_TYPE_DOCUMENT, 'Root node should be a document');

    // The first child should be the <p> element
    // NOTE: A proper parser would create an <html> and <body>, so this is a simplification for now.
    const p = doc.getFirstChild();
    assert.ok(p, 'Document should have a child');
    assert.strictEqual(p.nodeType, NODE_TYPE_ELEMENT, 'Child should be an element');
    assert.strictEqual(p.tagName, 'p', 'Element should be a <p>');

    // The <p> element should have one child, a text node
    const text = p.getFirstChild();
    assert.ok(text, '<p> tag should have a child');
    assert.strictEqual(text.nodeType, NODE_TYPE_TEXT, 'Child of <p> should be a text node');
    assert.strictEqual(text.getData(), 'Hello', 'Text node should contain "Hello"');
});

test('HTML Parser should handle nested elements', () => {
    const html = '<div><span>World</span></div>';
    const parser = new HTMLParser();
    const doc = parser.parse(html);

    const div = doc.getFirstChild();
    assert.strictEqual(div.tagName, 'div', 'First element should be a <div>');

    const span = div.getFirstChild();
    assert.ok(span, '<div> should have a child');
    assert.strictEqual(span.tagName, 'span', 'Child of <div> should be a <span>');

    const text = span.getFirstChild();
    assert.ok(text, '<span> should have a child');
    assert.strictEqual(text.getData(), 'World', 'Text node should contain "World"');
});
