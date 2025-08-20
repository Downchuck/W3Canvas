import { NAMED_CHARACTER_REFERENCES } from './entities.js';

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
const COMMENT_STATE = 'CommentState';
const DOCTYPE_STATE = 'DoctypeState';
const RAWTEXT_STATE = 'RAWTEXTState';
const CHARACTER_REFERENCE_STATE = 'CharacterReferenceState';

export class HTMLTokenizer {
    constructor(html) {
        this.html = html;
        this.pos = 0;
        this.state = DATA_STATE;
        this.currentToken = null;
        this.currentAttribute = null;
        this.lastStartTagName = null;
    }

    nextToken() {
        if (this.pos >= this.html.length) {
            return { type: 'EOF' };
        }

        while (this.pos < this.html.length) {
            const char = this.html[this.pos];

            switch (this.state) {
                case DATA_STATE: {
                    const textEnd = this.html.indexOf('<', this.pos);
                    const ampEnd = this.html.indexOf('&', this.pos);

                    let firstChar = -1;
                    if (textEnd !== -1 && ampEnd !== -1) {
                        firstChar = Math.min(textEnd, ampEnd);
                    } else if (textEnd !== -1) {
                        firstChar = textEnd;
                    } else {
                        firstChar = ampEnd;
                    }

                    if (firstChar === -1) {
                        const text = this.html.substring(this.pos);
                        this.pos = this.html.length;
                        if (text) return { type: 'Text', data: text };
                        break;
                    }
                    if (firstChar > this.pos) {
                        const text = this.html.substring(this.pos, firstChar);
                        this.pos = firstChar;
                        return { type: 'Text', data: text };
                    }

                    if (this.html[this.pos] === '<') {
                        this.state = TAG_OPEN_STATE;
                        this.pos++; // Consume '<'
                    } else if (this.html[this.pos] === '&') {
                        this.state = CHARACTER_REFERENCE_STATE;
                    }
                    break;
                }

                case CHARACTER_REFERENCE_STATE: {
                    this.pos++; // consume '&'
                    let consumed = '&';
                    let result = '&';

                    if (this.html[this.pos] === '#') {
                        this.pos++;
                        consumed += '#';
                        let digits = '';
                        let isHex = false;
                        if (this.html[this.pos] === 'x' || this.html[this.pos] === 'X') {
                            isHex = true;
                            this.pos++;
                            consumed += 'x';
                            const hexMatch = this.html.substring(this.pos).match(/^[0-9a-fA-F]+/);
                            if (hexMatch) {
                                digits = hexMatch[0];
                                this.pos += digits.length;
                                consumed += digits;
                            }
                        } else {
                            const decMatch = this.html.substring(this.pos).match(/^[0-9]+/);
                            if (decMatch) {
                                digits = decMatch[0];
                                this.pos += digits.length;
                                consumed += digits;
                            }
                        }

                        if (this.html[this.pos] === ';') {
                            this.pos++;
                            consumed += ';';
                        }

                        if (digits) {
                            const num = parseInt(digits, isHex ? 16 : 10);
                            result = String.fromCodePoint(num);
                        } else {
                            result = consumed;
                        }

                    } else {
                        const namedMatch = this.html.substring(this.pos).match(/^[a-zA-Z0-9]+;?/);
                        if (namedMatch) {
                            const entityName = namedMatch[0];
                            if (NAMED_CHARACTER_REFERENCES.has(entityName)) {
                                result = NAMED_CHARACTER_REFERENCES.get(entityName);
                                this.pos += entityName.length;
                            } else {
                                result = consumed + entityName;
                                this.pos += entityName.length;
                            }
                        }
                    }

                    this.state = DATA_STATE;
                    return { type: 'Text', data: result };
                }

                case TAG_OPEN_STATE: {
                    if (this.html[this.pos] === '!') {
                        this.pos++; // Consume '!'
                        if (this.html.substring(this.pos, this.pos + 2) === '--') {
                            this.pos += 2; // Consume '--'
                            this.state = COMMENT_STATE;
                        } else if (this.html.substring(this.pos, this.pos + 7).toUpperCase() === 'DOCTYPE') {
                            this.pos += 7; // Consume 'DOCTYPE'
                            this.state = DOCTYPE_STATE;
                        } else {
                            this.state = DATA_STATE; // Error
                        }
                    } else if (this.html[this.pos] === '/') {
                        this.pos++; // Consume '/'
                        this.state = END_TAG_OPEN_STATE;
                    } else {
                        this.state = TAG_NAME_STATE;
                    }
                    break;
                }

                case COMMENT_STATE: {
                    const commentEnd = this.html.indexOf('-->', this.pos);
                    if (commentEnd === -1) {
                        const comment = this.html.substring(this.pos);
                        this.pos = this.html.length;
                        return { type: 'Comment', data: comment };
                    }
                    const comment = this.html.substring(this.pos, commentEnd);
                    this.pos = commentEnd + 3; // Consume '-->'
                    this.state = DATA_STATE;
                    return { type: 'Comment', data: comment };
                }

                case DOCTYPE_STATE: {
                    const doctypeEnd = this.html.indexOf('>', this.pos);
                    if (doctypeEnd === -1) {
                        this.state = DATA_STATE; // Error
                        break;
                    }
                    const doctype = this.html.substring(this.pos, doctypeEnd).trim();
                    this.pos = doctypeEnd + 1;
                    this.state = DATA_STATE;
                    return { type: 'Doctype', data: doctype };
                }

                case TAG_NAME_STATE:
                case END_TAG_OPEN_STATE: {
                    const isEndTag = this.state === END_TAG_OPEN_STATE;
                    const tagEndMatch = this.html.substring(this.pos).match(/^([a-zA-Z0-9]+)/);
                    if (tagEndMatch) {
                        const tagName = tagEndMatch[0].toLowerCase();
                        this.pos += tagName.length;
                        if (isEndTag) {
                            // Simplified: does not handle attributes on end tags, just finds the >
                            const tagEnd = this.html.indexOf('>', this.pos);
                            if (tagEnd !== -1) this.pos = tagEnd;
                            this.state = DATA_STATE;
                            this.pos++; // Consume '>'
                            return { type: 'EndTag', tagName };
                        } else {
                            this.currentToken = { type: 'StartTag', tagName, attributes: {}, selfClosing: false };
                            this.lastStartTagName = tagName;
                            this.state = BEFORE_ATTRIBUTE_NAME_STATE;
                        }
                    } else {
                        this.state = DATA_STATE; // Error
                    }
                    break;
                }

                case BEFORE_ATTRIBUTE_NAME_STATE: {
                    const char = this.html[this.pos];
                    if (/\s/.test(char)) {
                        this.pos++;
                    } else if (char === '/') {
                        this.state = SELF_CLOSING_START_TAG_STATE;
                        this.pos++;
                    } else if (char === '>') {
                        this.pos++;
                        if (this.lastStartTagName === 'script' || this.lastStartTagName === 'style') {
                            this.state = RAWTEXT_STATE;
                        } else {
                            this.state = DATA_STATE;
                        }
                        return this.currentToken;
                    } else {
                        this.state = ATTRIBUTE_NAME_STATE;
                        this.currentAttribute = { name: '', value: '' };
                    }
                    break;
                }

                case ATTRIBUTE_NAME_STATE: {
                    const nameMatch = this.html.substring(this.pos).match(/^([^=\s/>]+)/);
                    if (nameMatch) {
                        this.currentAttribute.name = nameMatch[0].toLowerCase();
                        this.pos += this.currentAttribute.name.length;
                        this.state = AFTER_ATTRIBUTE_NAME_STATE;
                    } else {
                        this.state = DATA_STATE;
                    }
                    break;
                }

                case AFTER_ATTRIBUTE_NAME_STATE: {
                    const char = this.html[this.pos];
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
                }

                case BEFORE_ATTRIBUTE_VALUE_STATE: {
                    const char = this.html[this.pos];
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
                }

                case ATTRIBUTE_VALUE_QUOTED_STATE: {
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
                }

                case SELF_CLOSING_START_TAG_STATE: {
                    if (this.html[this.pos] === '>') {
                        this.currentToken.selfClosing = true;
                        this.pos++;
                        this.state = DATA_STATE;
                        const token = this.currentToken;
                        this.currentToken = null;
                        return token;
                    } else {
                        this.state = DATA_STATE; // Error
                    }
                    break;
                }

                case RAWTEXT_STATE: {
                    const endTag = `</${this.lastStartTagName}>`;
                    const endTagIndex = this.html.indexOf(endTag, this.pos);
                    if (endTagIndex === -1) {
                        const text = this.html.substring(this.pos);
                        this.pos = this.html.length;
                        this.state = DATA_STATE;
                        return { type: 'Text', data: text };
                    } else {
                        const text = this.html.substring(this.pos, endTagIndex);
                        this.pos = endTagIndex;
                        this.state = DATA_STATE;
                        return { type: 'Text', data: text };
                    }
                }

                default:
                    throw new Error(`Unknown tokenizer state: ${this.state}`);
            }
        }
        return { type: 'EOF' };
    }
}
