import { DocPool } from "../data/DocPool";
import { Component, FileData, RuntimeConfig } from "../types";
import { NamedComponent } from "./NamedComponent";
import { NamedProp } from "./NamedProp";
export declare class BaseParser {
    docs: DocPool;
    config: RuntimeConfig;
    cssIgnore: RegExp[];
    constructor(docs: DocPool, config: RuntimeConfig);
    getComponents(): Promise<Component[]>;
    getStyleElements(): Promise<FileData[]>;
    getSeparateCssFiles(): Promise<Promise<FileData[]>[]>;
    getSeparateJsFiles(): Promise<FileData[]>;
    parseComponentDesigns(): Promise<NamedComponent[]>;
    parsePropDesigns(design: NamedComponent): Promise<NamedProp[]>;
    protected parseProp(element: Element): NamedProp[];
    protected getComponentSelector(): string;
    protected getPropertySelector(): string;
    cleanComponentElement(c: Component): void;
    protected rewriteCss(data: FileData): Promise<FileData[]>;
}
