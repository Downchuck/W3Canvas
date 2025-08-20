const DATA_STATE = 'DataState';
const TAG_OPEN_STATE = 'TagOpenState';
const TAG_NAME_STATE = 'TagNameState';
const END_TAG_OPEN_STATE = 'EndTagOpenState';
const BEFORE_ATTRIBUTE_NAME_STATE = 'BeforeAttributeNameState';
const ATTRIBUTE_NAME_STATE = 'AttributeNameState';
const AFTER_ATTRIBUTE_NAME_STATE = 'AfterAttributeNameState';
const BEFORE_ATTRIBUTE_VALUE_STATE = 'BeforeAttributeValueState';
const ATTRIBUTE_VALUE_QUOTED_STATE = 'AttributeValueQuotedState';
const SELF_CLOSING_START_TAG_STATE = 'SelfClosingStartTagState';

export class HTMLTokenizer {
    constructor(html) {
        this.html = html;
        this.pos = 0;
        this.state = DATA_STATE;
        this.currentToken = null;
        this.currentAttribute = null;
    }

    nextToken() {
        while (this.pos < this.html.length) {
            const char = this.html[this.pos];

            switch (this.state) {
                case DATA_STATE:
                    const textEnd = this.html.indexOf('<', this.pos);
                    if (textEnd === -1) {
                        const text = this.html.substring(this.pos);
                        this.pos = this.html.length;
                        if (text) return { type: 'Text', data: text };
                        break;
                    }
                    if (textEnd > this.pos) {
                        const text = this.html.substring(this.pos, textEnd);
                        this.pos = textEnd;
                        return { type: 'Text', data: text };
                    }
                    this.state = TAG_OPEN_STATE;
                    break;

                case TAG_OPEN_STATE:
                    this.pos++; // Consume '<'
                    if (this.html[this.pos] === '/') {
                        this.pos++; // Consume '/'
                        this.state = END_TAG_OPEN_STATE;
                    } else {
                        this.state = TAG_NAME_STATE;
                    }
                    break;

                case TAG_NAME_STATE:
                case END_TAG_OPEN_STATE: {
                    const isEndTag = this.state === END_TAG_OPEN_STATE;
                    const tagEndMatch = this.html.substring(this.pos).match(/^([a-zA-Z0-9]+)/);
                    if (tagEndMatch) {
                        const tagName = tagEndMatch[0].toLowerCase();
                        this.pos += tagName.length;
                        if (isEndTag) {
                            this.state = DATA_STATE;
                            const tagEnd = this.html.indexOf('>', this.pos);
                            this.pos = tagEnd + 1;
                            return { type: 'EndTag', tagName };
                        } else {
                            this.currentToken = { type: 'StartTag', tagName, attributes: {}, selfClosing: false };
                            this.state = BEFORE_ATTRIBUTE_NAME_STATE;
                        }
                    } else {
                        this.state = DATA_STATE; // Error
                    }
                    break;
                }

                case BEFORE_ATTRIBUTE_NAME_STATE:
                    if (/\s/.test(char)) {
                        this.pos++;
                    } else if (char === '/') {
                        this.state = SELF_CLOSING_START_TAG_STATE;
                        this.pos++;
                    } else if (char === '>') {
                        this.pos++;
                        this.state = DATA_STATE;
                        return this.currentToken;
                    } else {
                        this.state = ATTRIBUTE_NAME_STATE;
                        this.currentAttribute = { name: '', value: '' };
                    }
                    break;

                case ATTRIBUTE_NAME_STATE:
                    const nameMatch = this.html.substring(this.pos).match(/^([^=\s>]+)/);
                    if (nameMatch) {
                        this.currentAttribute.name = nameMatch[0].toLowerCase();
                        this.pos += this.currentAttribute.name.length;
                        this.state = AFTER_ATTRIBUTE_NAME_STATE;
                    } else {
                        this.state = DATA_STATE;
                    }
                    break;

                case AFTER_ATTRIBUTE_NAME_STATE:
                    if (/\s/.test(char)) {
                        this.pos++;
                    } else if (char === '=') {
                        this.pos++;
                        this.state = BEFORE_ATTRIBUTE_VALUE_STATE;
                    } else {
                        this.currentToken.attributes[this.currentAttribute.name] = "";
                        this.state = BEFORE_ATTRIBUTE_NAME_STATE;
                    }
                    break;

                case BEFORE_ATTRIBUTE_VALUE_STATE:
                    if (/\s/.test(char)) {
                        this.pos++;
                    } else if (char === '"' || char === "'") {
                        this.state = ATTRIBUTE_VALUE_QUOTED_STATE;
                        this.quoteChar = char;
                        this.pos++;
                    } else {
                        this.state = DATA_STATE;
                    }
                    break;

                case ATTRIBUTE_VALUE_QUOTED_STATE:
                    const valueEnd = this.html.indexOf(this.quoteChar, this.pos);
                    if (valueEnd === -1) {
                        this.state = DATA_STATE;
                    } else {
                        this.currentAttribute.value = this.html.substring(this.pos, valueEnd);
                        this.pos = valueEnd + 1;
                        this.currentToken.attributes[this.currentAttribute.name] = this.currentAttribute.value;
                        this.state = BEFORE_ATTRIBUTE_NAME_STATE;
                    }
                    break;

                case SELF_CLOSING_START_TAG_STATE:
                    if (char === '>') {
                        this.currentToken.selfClosing = true;
                        this.pos++;
                        this.state = DATA_STATE;
                        return this.currentToken;
                    } else {
                        this.state = DATA_STATE; // Error
                    }
                    break;

                default:
                    throw new Error(`Unknown tokenizer state: ${this.state}`);
            }
        }
        return { type: 'EOF' };
    }
}
