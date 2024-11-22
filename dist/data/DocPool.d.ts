import { JSDOM } from "jsdom";
import { DocSource, FileData } from "../types";
export declare class DocPool {
    source?: DocSource;
    ignore: RegExp[];
    constructor(source?: DocSource, ignore?: string[]);
    parseDocs(): Promise<Promise<JSDOM>[]>;
    private parseDoms;
    selectElements(selectors: string): Promise<Promise<NodeListOf<Element>>[]>;
    filesByExtension(extension: string): Promise<FileData[]>;
}
