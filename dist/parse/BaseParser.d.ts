import { DocPool } from "../data/DocPool";
import { Component, FileData } from "../types";
import { NamedComponent } from "./NamedComponent";
import { NamedProp } from "./NamedProp";
export declare class BaseParser {
    docs: DocPool;
    constructor(docs: DocPool);
    getComponents(): Promise<Component[]>;
    getPublicCssFiles(): Promise<FileData[]>;
    getPublicJsFiles(): Promise<FileData[]>;
    parseComponentDesigns(): Promise<NamedComponent[]>;
    protected getComponentSelector(): string;
    parsePropDesigns(design: NamedComponent): NamedProp[];
    protected getPropertySelector(): string;
    protected parseProp(element: Element): NamedProp[];
    exportTemplate(component: NamedComponent, props: NamedProp[]): [template: string, rootVisibility: string | undefined];
}
