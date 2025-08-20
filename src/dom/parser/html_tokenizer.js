const DATA_STATE = 'DataState';
const TAG_OPEN_STATE = 'TagOpenState';
const TAG_NAME_STATE = 'TagNameState';
const END_TAG_OPEN_STATE = 'EndTagOpenState';

export class HTMLTokenizer {
    constructor(html) {
        this.html = html;
        this.pos = 0;
        this.state = DATA_STATE;
    }

    nextToken() {
        if (this.pos >= this.html.length) {
            return { type: 'EOF' };
        }

        switch (this.state) {
            case DATA_STATE:
                const textEnd = this.html.indexOf('<', this.pos);
                if (textEnd === -1) {
                    const text = this.html.substring(this.pos);
                    this.pos = this.html.length;
                    return { type: 'Text', data: text };
                }
                if (textEnd > this.pos) {
                    const text = this.html.substring(this.pos, textEnd);
                    this.pos = textEnd;
                    return { type: 'Text', data: text };
                }
                this.state = TAG_OPEN_STATE;
                this.pos++; // Consume '<'
                return this.nextToken(); // Re-run in new state

            case TAG_OPEN_STATE:
                if (this.html[this.pos] === '/') {
                    this.pos++; // Consume '/'
                    this.state = END_TAG_OPEN_STATE;
                } else {
                    this.state = TAG_NAME_STATE;
                }
                return this.nextToken();

            case TAG_NAME_STATE:
            case END_TAG_OPEN_STATE:
                const isEndTag = this.state === END_TAG_OPEN_STATE;
                const tagEnd = this.html.indexOf('>', this.pos);
                if (tagEnd === -1) {
                    // Malformed, treat as text
                    this.state = DATA_STATE;
                    return { type: 'Text', data: this.html.substring(this.pos - (isEndTag ? 2 : 1)) };
                }
                // Simplified: doesn't handle attributes
                const tagName = this.html.substring(this.pos, tagEnd).toLowerCase();
                this.pos = tagEnd + 1; // Consume '>'
                this.state = DATA_STATE;
                return { type: isEndTag ? 'EndTag' : 'StartTag', tagName };

            default:
                throw new Error(`Unknown tokenizer state: ${this.state}`);
        }
    }
}
