import { test } from 'node:test';
import assert from 'node:assert';
import { HTMLParser } from '../src/dom/parser/html_parser.js';
import { NODE_TYPE_DOCUMENT, NODE_TYPE_ELEMENT, NODE_TYPE_TEXT, NODE_TYPE_COMMENT } from '../src/dom/html/dom_core.js';

test('HTML Parser should correctly parse a simple HTML string', () => {
    const html = '<p>Hello</p>';
    const parser = new HTMLParser();
    const doc = parser.parse(html);

    assert.strictEqual(doc.nodeType, NODE_TYPE_DOCUMENT, 'Root node should be a document');
    const p = doc.body.getFirstChild();
    assert.ok(p, 'Document body should have a child');
    assert.strictEqual(p.nodeType, NODE_TYPE_ELEMENT, 'Child should be an element');
    assert.strictEqual(p.tagName, 'p', 'Element should be a <p>');

    const text = p.getFirstChild();
    assert.ok(text, '<p> tag should have a child');
    assert.strictEqual(text.nodeType, NODE_TYPE_TEXT, 'Child of <p> should be a text node');
    assert.strictEqual(text.getData(), 'Hello', 'Text node should contain "Hello"');
});

test('HTML Parser should parse attributes', () => {
    const html = '<p id="intro" class="main">Hello</p>';
    const parser = new HTMLParser();
    const doc = parser.parse(html);

    const p = doc.body.getFirstChild();
    assert.ok(p, 'Document body should have a child');
    assert.strictEqual(p.tagName, 'p', 'Element should be a <p>');
    assert.strictEqual(p.id, 'intro', 'id attribute should be set correctly');
    assert.strictEqual(p.attributes['class'], 'main', 'class attribute should be set correctly');
});

test('HTML Parser should handle nested elements', () => {
    const html = '<div><span>World</span></div>';
    const parser = new HTMLParser();
    const doc = parser.parse(html);

    const div = doc.body.getFirstChild();
    assert.strictEqual(div.tagName, 'div', 'First element should be a <div>');

    const span = div.getFirstChild();
    assert.ok(span, '<div> should have a child');
    assert.strictEqual(span.tagName, 'span', 'Child of <div> should be a <span>');

    const text = span.getFirstChild();
    assert.ok(text, '<span> should have a child');
    assert.strictEqual(text.getData(), 'World', 'Text node should contain "World"');
});

test('HTML Parser should handle self-closing tags', () => {
    const html = '<p>Hello<br/>World</p>';
    const parser = new HTMLParser();
    const doc = parser.parse(html);

    const p = doc.body.getFirstChild();
    assert.strictEqual(p.tagName, 'p', 'First element should be a <p>');
    assert.strictEqual(p.children.length, 3, '<p> should have three children');

    const text1 = p.children[0];
    assert.strictEqual(text1.nodeType, NODE_TYPE_TEXT, 'First child should be a text node');
    assert.strictEqual(text1.getData(), 'Hello', 'First text node should be "Hello"');

    const br = p.children[1];
    assert.strictEqual(br.nodeType, NODE_TYPE_ELEMENT, 'Second child should be an element');
    assert.strictEqual(br.tagName, 'br', 'Second element should be a <br>');
    assert.strictEqual(br.hasChildNodes(), false, '<br> should have no children');

    const text2 = p.children[2];
    assert.strictEqual(text2.nodeType, NODE_TYPE_TEXT, 'Third child should be a text node');
    assert.strictEqual(text2.getData(), 'World', 'Third text node should be "World"');
});

test('HTML Parser should handle comments and doctypes', () => {
    const html = '<!DOCTYPE html><!-- a comment --><p>text</p>';
    const parser = new HTMLParser();
    const doc = parser.parse(html);

    assert.strictEqual(doc.doctype, 'html', 'Doctype should be parsed correctly');

    const comment = doc.body.getFirstChild();
    assert.ok(comment, 'Document body should have a child');
    assert.strictEqual(comment.nodeType, NODE_TYPE_COMMENT, 'First child of body should be a comment node');
    assert.strictEqual(comment.data, ' a comment ', 'Comment data should be correct');

    const p = comment.getNextSibling();
    assert.ok(p, 'Comment should have a sibling');
    assert.strictEqual(p.tagName, 'p', 'Second child should be a <p> element');
});

test('HTML Parser should handle raw text elements like <style>', () => {
    const html = '<style>p { color: red; }</style>';
    const parser = new HTMLParser();
    const doc = parser.parse(html);

    const style = doc.body.getFirstChild();
    assert.ok(style, 'Document should have a child');
    assert.strictEqual(style.tagName, 'style', 'Element should be a <style>');
    assert.strictEqual(style.children.length, 1, '<style> should have one child');

    const text = style.getFirstChild();
    assert.strictEqual(text.nodeType, NODE_TYPE_TEXT, 'Child should be a text node');
    assert.strictEqual(text.getData(), 'p { color: red; }', 'Text content should be correct');
});

test('HTML Parser should decode HTML entities', () => {
    const html = '<p>Hello &amp; World &copy; &#8364; &#x20AC; &notanentity;</p>';
    const parser = new HTMLParser();
    const doc = parser.parse(html);

    const p = doc.body.getFirstChild();
    assert.ok(p, 'Document should have a child');
    assert.strictEqual(p.tagName, 'p', 'Element should be a <p>');

    let textData = '';
    for (const child of p.children) {
        if (child.nodeType === NODE_TYPE_TEXT) {
            textData += child.getData();
        }
    }
    assert.strictEqual(textData, 'Hello & World © € € &notanentity;', 'Text node should contain decoded entities');
});
