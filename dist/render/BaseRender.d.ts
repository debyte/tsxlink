import { DocPool } from "../data/DocPool";
import { Component, CopyFile, FileData, Prop, RuntimeConfig } from "../types";
export declare class BaseRender {
    docs: DocPool;
    config: RuntimeConfig;
    dropTags: RegExp[];
    dropAttrs: RegExp[];
    limitAttrs: {
        [attr: string]: string[];
    };
    renameAttrs: [from: string, to: string][];
    rootVisibilityProp: string | null;
    hasImages: boolean;
    imageImports: Map<string, string>;
    constructor(docs: DocPool, config: RuntimeConfig);
    render(component: Component): Promise<[component: FileData, assets: FileData[]]>;
    transform(component: Component): [xml: string, copyFromTo: CopyFile[]];
    getDropTags(): RegExp[];
    getDropAttributes(): RegExp[];
    getLimitAttributes(): {
        [attr: string]: string[];
    };
    getRenameAttributes(): [from: string, to: string][];
    sanitizeNames(component: Component): void;
    applyProps(component: Component): void;
    applyClassProp(p: Prop): void;
    applyChanges(xml: Element): void;
    applyImageImports(xml: Element): void;
    commentValue(value: string | null, cut?: boolean): string | undefined;
    prop(id: string): string;
    renderToText(statement: string): string;
    renderToAttribute(statement: string): string;
    renderJsx(component: Component, xml: string): string;
    renderImports(_props: Prop[]): string | false;
    renderProps(name: string, props: Prop[]): string | false;
    renderPropName(p: Prop): string;
    renderPropType(p: Prop): string;
    renderElementType(): string;
    renderMapType(_p: Prop): string;
    renderConsts(_props: Prop[]): string | false;
    renderSignature(name: string, props: Prop[]): string;
    renderComponentNameAndType(name: string, _props: Prop[]): string;
    renderSwitch(propName: string | null): string;
    renderXml(xml: string): string;
    doesUseLib(): boolean;
}
