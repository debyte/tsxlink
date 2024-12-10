import { JSDOM } from "jsdom";
export declare class DomTransform {
    root: Element;
    xml: JSDOM;
    xmlRoot: Element;
    constructor(root: Element);
    element(parent: Element, element: Element): void;
    text(parent: Element, text: Text): void;
    comment(parent: Element, comment: Comment): void;
    tagName(node: Element): string | null;
    attribute(element: Element, attribute: Attr): [string | null, string | null];
    filterAttribute(_element: Element, _attribute: Attr): boolean;
    renameAttribute(_element: Element, attribute: Attr): string | null;
    changeAttribute(_element: Element, attribute: Attr): string | null;
}
