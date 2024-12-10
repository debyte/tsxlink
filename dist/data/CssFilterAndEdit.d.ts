import { CopyFile } from "../types";
import { CssTransform } from "./CssTransform";
export declare class CssFilterAndEdit extends CssTransform {
    select: (selector: string) => boolean;
    urlPath: (name: string) => string;
    copy: CopyFile[];
    static runWithCopyFiles(src: string, select: (selector: string) => boolean, urlPath?: (name: string) => string): [css: string, copyFromTo: CopyFile[]];
    static runSingleValue(value: string, urlPath: (name: string) => string): [value: string, copyFromTo: CopyFile[]];
    constructor(src: string, select: (selector: string) => boolean, urlPath?: (name: string) => string);
    value(value: string | undefined): string | undefined;
    filterSelectors(selector: string): boolean;
    filterAtRule(atRule: string): boolean;
    fixUrl(value: string): string;
    stripPossibleQuotes(val: string): string;
}
