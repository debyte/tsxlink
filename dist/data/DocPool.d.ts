import { JSDOM } from "jsdom";
import { DocSource, FileData } from "../types";
export declare class DocPool {
    source?: DocSource;
    constructor(source?: DocSource);
    parseDocs(): Promise<Promise<JSDOM>[]>;
    private parseDoms;
    selectElements(selectors: string): Promise<Promise<NodeListOf<Element>>[]>;
    filesByExtension(extension: string): Promise<FileData[]>;
}
