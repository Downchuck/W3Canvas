import { HTMLTokenizer } from './html_tokenizer.js';
import { Document, Element, TextNode } from '../html/dom_core.js';

export class HTMLParser {
    constructor() {
        this.stack = [];
        this.doc = new Document();
        this.stack.push(this.doc);
    }

    parse(html) {
        const tokenizer = new HTMLTokenizer(html);

        let token;
        do {
            token = tokenizer.nextToken();
            this.processToken(token);
        } while (token.type !== 'EOF');

        return this.doc;
    }

    processToken(token) {
        const currentNode = this.stack[this.stack.length - 1];

        switch (token.type) {
            case 'StartTag':
                const element = new Element(token.tagName);
                for (const [name, value] of Object.entries(token.attributes)) {
                    element.setAttribute(name, value);
                }
                currentNode.appendChild(element);
                if (!token.selfClosing) {
                    this.stack.push(element);
                }
                break;

            case 'EndTag':
                if (currentNode.tagName.toLowerCase() === token.tagName) {
                    this.stack.pop();
                } else {
                    // Basic error handling: ignore mismatched closing tags
                    console.warn(`Mismatched closing tag: expected </${currentNode.tagName.toLowerCase()}> but got </${token.tagName}>`);
                }
                break;

            case 'Text':
                if (token.data.trim().length > 0) {
                    const textNode = new TextNode(token.data);
                    currentNode.appendChild(textNode);
                }
                break;

            case 'EOF':
                // End of file, do nothing
                break;
        }
    }
}
