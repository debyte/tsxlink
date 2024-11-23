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
    protected getComponentSelector(): string;
    parsePropDesigns(design: NamedComponent): Promise<NamedProp[]>;
    protected getPropertySelector(): string;
    protected parseProp(element: Element): NamedProp[];
    protected formatTemplate(component: NamedComponent, props: NamedProp[]): Promise<[template: string, rootVisibilityProp: string | undefined]>;
    protected formatCss(data: FileData): Promise<FileData[]>;
}
