import { Component, CopyFile, RuntimeConfig } from "../types";
import { StyleObject } from "./styles";
export type RewriteResult = {
    rootVisibility?: string;
    hasClasses: boolean;
    hasImages: boolean;
    styles: StyleObject[];
    copyFromTo: CopyFile[];
};
export declare function rewriteTemplateDom(component: Component, config: RuntimeConfig, dropStyles: boolean): RewriteResult;
export declare function rewriteTemplateHtml(template: string, nextImages: boolean, dropAttrs: RegExp[]): string;
