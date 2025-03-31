import { JSDOM } from "jsdom";
export declare class DomTransform {
    root: Element;
    xml: JSDOM;
    xmlRoot: Element;
    constructor(root: Element);
    element(parent: Element, element: Element): void;
    text(parent: Element, text: Text): void;
    comment(parent: Element, comment: Comment): void;
    tagName(element: Element): string | null;
    filterElement(_elem: Element, _tag: string): boolean;
    attribute(element: Element, tag: string, attribute: Attr): [string | null, string | null];
    filterAttribute(_elem: Element, _tag: string, _attr: Attr): boolean;
    renameAttribute(_elem: Element, _tag: string, attr: Attr): string | null;
    changeAttribute(_elem: Element, _tag: string, attr: Attr): string | null;
}
