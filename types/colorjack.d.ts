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
    }
}
