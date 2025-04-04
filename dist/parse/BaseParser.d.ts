import { DocPool } from "../data/DocPool";
import { Component, FileData, RuntimeConfig } from "../types";
import { NamedComponent } from "./NamedComponent";
import { NamedProp } from "./NamedProp";
export declare const COMPONENT_ATTRIBUTE = "data-tsx";
export declare const PROPERTY_ATTRIBUTE = "data-tsx-prop";
export declare const SLOT_ATTRIBUTE = "data-tsx-slot";
export declare const REPLACE_ATTRIBUTE = "data-tsx-replace";
export declare const ASSET_ATTRIBUTE = "data-tsx-asset";
export declare const DROP_ATTRIBUTE = "data-tsx-drop";
export declare class BaseParser {
    docs: DocPool;
    config: RuntimeConfig;
    dropCss: RegExp[];
    constructor(docs: DocPool, config: RuntimeConfig);
    getComponents(): Promise<Component[]>;
    getAssetFiles(): Promise<FileData[]>;
    dropElements(): Promise<void>;
    getStyleElements(): Promise<FileData[]>;
    getSeparateCssFiles(): Promise<Promise<FileData[]>[]>;
    getSeparateJsFiles(): Promise<FileData[]>;
    parseComponentDesigns(): Promise<NamedComponent[]>;
    parsePropDesigns(design: NamedComponent): Promise<NamedProp[]>;
    protected parseProp(element: Element): NamedProp[];
    protected getComponentSelector(): string;
    protected getPropertySelector(): string;
    protected getAssetSelector(): string;
    protected getDropSelector(): string;
    cleanComponentElement(c: Component): void;
    protected rewriteCss(data: FileData): Promise<FileData[]>;
}
