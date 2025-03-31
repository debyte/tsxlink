import { JSDOM } from "jsdom";
import { CopyFile } from "../types";
import { DomTransform } from "./DomTransform";
export declare class DomFilterAndEdit extends DomTransform {
    dropTags: RegExp[];
    dropAttributes: RegExp[];
    limitAttributes: {
        [name: string]: string[] | undefined;
    };
    renameAttributes: {
        [name: string]: string | undefined;
    };
    assetsPath: string;
    copy: CopyFile[];
    static runWithCopyFiles(root: Element, assetsPath: string, dropTags: RegExp[], dropAttr: RegExp[], limitAttr: {
        [attr: string]: string[];
    }, renameAttr: [from: string, to: string][]): [xml: JSDOM, root: Element, copyFromTo: CopyFile[]];
    constructor(root: Element, assetsPath: string, dropTags: RegExp[], dropAttr: RegExp[], limitAttr: {
        [attr: string]: string[];
    }, renameAttr: [from: string, to: string][]);
    filterElement(_elem: Element, tag: string): boolean;
    filterAttribute(_elem: Element, tag: string, attr: Attr): boolean;
    renameAttribute(_elem: Element, _tag: string, attr: Attr): string | null;
    changeAttribute(_elem: Element, tag: string, attr: Attr): string | null;
    fixUrl(attr: string, value: string): string;
    rewritePossibleUrl(url: string | null): string | null;
    fixStyle(value: string): string;
}
