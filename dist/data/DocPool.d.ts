import { JSDOM } from "jsdom";
import { CopyFile, DocSource, FileData } from "../types";
export declare class DocPool {
    source?: DocSource;
    ignore: RegExp[];
    constructor(source?: DocSource, ignore?: string[]);
    parseDocs(): Promise<Promise<JSDOM>[]>;
    private parseDoms;
    selectElements(selectors: string): Promise<Promise<NodeListOf<Element>>[]>;
    selectFiles(opt: {
        extension?: string;
        names?: string[];
    }): Promise<FileData[]>;
    copyFiles(copy: CopyFile[], dirName?: string): Promise<FileData[]>;
}
