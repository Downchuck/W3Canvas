declare namespace colorjack {
    namespace dom {
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
