import { CopyFile } from "../types";
import { CssTransform } from "./CssTransform";
import { NamedComponent } from "./NamedComponent";
import { NamedProp } from "./NamedProp";
export declare function rewriteTemplate(component: NamedComponent, props: NamedProp[]): [template: string, rootVisibilityProp: string | undefined];
export declare class CssFix extends CssTransform {
    imageDir: string;
    select: (selector: string) => boolean;
    copy: CopyFile[];
    static runWithCopyFiles(src: string, imageDir: string, select: (selector: string) => boolean): [css: string, copyFromTo: CopyFile[]];
    constructor(src: string, imageDir: string, select: (selector: string) => boolean);
    value(value: string | undefined): string | undefined;
    filterSelectors(selector: string): boolean;
    filterAtRule(atRule: string): boolean;
    fixUrl(value: string): string;
    stripPossibleQuotes(val: string): string;
}
