import { Component } from "../types";
import { StyleObject } from "./styles";
export declare function rewriteTemplateDom(component: Component): {
    rootVisibilityProp?: string;
    styles: StyleObject[];
};
export declare function rewriteTemplateHtml(template: string): string;
