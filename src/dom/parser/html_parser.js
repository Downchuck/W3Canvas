import { HTMLTokenizer } from './html_tokenizer.js';
import { Document, Element, TextNode, NODE_TYPE_TEXT } from '../html/dom_core.js';

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
                // Whitespace-only text nodes are significant in HTML.
                if (token.data.length > 0) {
                    const lastChild = currentNode.children[currentNode.children.length - 1];
                    if (lastChild && lastChild.nodeType === NODE_TYPE_TEXT) {
                        lastChild.setData(lastChild.getData() + token.data);
                    } else {
                        const textNode = new TextNode(token.data);
                        currentNode.appendChild(textNode);
                    }
                }
                break;

            case 'Comment':
                const commentNode = this.doc.createComment(token.data);
                currentNode.appendChild(commentNode);
                break;

            case 'Doctype':
                this.doc.doctype = token.data;
                break;

            case 'EOF':
                // End of file, do nothing
                break;
        }
    }
}
