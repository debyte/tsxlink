import { JSDOM } from "jsdom";
import { CopyFile, DocSource, FileData } from "../types";
export declare class DocPool {
    source?: DocSource;
    cache?: JSDOM[];
    ignore: RegExp[];
    constructor(source?: DocSource, ignore?: string[]);
    parseDocs(): Promise<JSDOM[]>;
    private parseDoms;
    selectElements(selectors: string): Promise<Element[]>;
    selectFiles(opt: {
        extension?: string;
        names?: string[];
    }): Promise<FileData[]>;
    copyFiles(relDir: string, copy: CopyFile[]): Promise<FileData[]>;
}
