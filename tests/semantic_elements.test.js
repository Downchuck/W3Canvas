import { test } from 'node:test';
import assert from 'node:assert';
import { HTMLParser } from '../src/dom/parser/html_parser.js';
import { NODE_TYPE_ELEMENT } from '../src/dom/html/dom_core.js';

test('HTML Parser should handle semantic elements', (t) => {
    const html = `
        <article>
            <header>Header</header>
            <section>Section</section>
            <nav>Nav</nav>
            <aside>Aside</aside>
            <main>Main</main>
            <footer>Footer</footer>
        </article>`;
    const parser = new HTMLParser();
    const doc = parser.parse(html);

    const bodyChildren = doc.body.children.filter(node => node.nodeType === NODE_TYPE_ELEMENT);
    const article = bodyChildren[0];
    assert.strictEqual(article.tagName, 'article', 'Element should be an <article>');
    assert.strictEqual(article.style.getDisplay(), 'block', 'Article should have display: block');

    const articleChildren = article.children.filter(node => node.nodeType === NODE_TYPE_ELEMENT);

    const header = articleChildren[0];
    assert.strictEqual(header.tagName, 'header', 'Element should be a <header>');
    assert.strictEqual(header.style.getDisplay(), 'block', 'Header should have display: block');

    const section = articleChildren[1];
    assert.strictEqual(section.tagName, 'section', 'Element should be a <section>');
    assert.strictEqual(section.style.getDisplay(), 'block', 'Section should have display: block');

    const nav = articleChildren[2];
    assert.strictEqual(nav.tagName, 'nav', 'Element should be a <nav>');
    assert.strictEqual(nav.style.getDisplay(), 'block', 'Nav should have display: block');

    const aside = articleChildren[3];
    assert.strictEqual(aside.tagName, 'aside', 'Element should be an <aside>');
    assert.strictEqual(aside.style.getDisplay(), 'block', 'Aside should have display: block');

    const main = articleChildren[4];
    assert.strictEqual(main.tagName, 'main', 'Element should be a <main>');
    assert.strictEqual(main.style.getDisplay(), 'block', 'Main should have display: block');

    const footer = articleChildren[5];
    assert.strictEqual(footer.tagName, 'footer', 'Element should be a <footer>');
    assert.strictEqual(footer.style.getDisplay(), 'block', 'Footer should have display: block');
});
