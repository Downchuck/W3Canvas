declare namespace colorjack {
    const currentDocument: dom.Document;
    const currentWindow: any;

    namespace util {
        function mixin(base: any, ...mixins: any[]): any;
    }

    namespace css {
        class BoxModel {}
        class ElementStyle {
            constructor(style: CssStyle, element: any);
        }
        class CssStyle {}
    }

    namespace dom {
        function registerElement(tagName: string, name: string, constructorFunction: (element: Element) => any): void;
        const tags: { [key: string]: (element: Element) => any };
        interface Node {
            getNodeType(): number;
            hasChildNodes(): boolean;
            appendChild(newChild: Node): void;
            getFirstChild(): Node | null;
            getNextSibling(): Node | null;
            getParent(): Node | null;
            setChildNodeIdx(idx: number): void;
            setParent(p: Node): void;
            getChildren(): Node[];
            tagName?: string;
            addEventListener(type: string, listener: (event: any) => void): void;
            removeEventListener(type: string, listener: (event: any) => void): void;
            dispatchEvent(event: any): void;
        }

        interface Element extends Node {
            style: any; // Will be replaced with a proper style interface
            getBoundingRect(): any; // Will be replaced with a proper rect interface
        }

        interface TextNode extends Node {
            setData(content: string): void;
            getData(): string;
        }

        interface Document {
            createElement(tagName: string): Element;
            createTextNode(content: string): TextNode;
            body: Element;
            getElementsByName(name: string): any; // Replace with a proper collection type
        }
    }
}
