import { CopyFile } from "../types";
import { DomTransform } from "./DomTransform";
export declare class DomFilterAndEdit extends DomTransform {
    dropAttributes: RegExp[];
    renameAttributes: {
        [name: string]: string | undefined;
    };
    assetsPath: string;
    copy: CopyFile[];
    static runWithCopyFiles(root: Element, assetsPath: string, dropAttributes: RegExp[], renameAttributes: [from: string, to: string][]): [xml: Element, copyFromTo: CopyFile[]];
    constructor(root: Element, assetsPath: string, dropAttributes: RegExp[], renameAttributes: [from: string, to: string][]);
    filterAttribute(_element: Element, attribute: Attr): boolean;
    renameAttribute(_element: Element, attribute: Attr): string | null;
    changeAttribute(element: Element, attribute: Attr): string | null;
    fixUrl(attr: string, value: string): string;
    rewritePossibleUrl(url: string | null): string | null;
    fixStyle(value: string): string;
}
