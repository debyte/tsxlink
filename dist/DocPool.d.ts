import { JSDOM } from "jsdom";
export type DocSource = {
    type: "string" | "file" | "zip" | "dir";
    data: string;
};
export declare class DocPool {
    source?: DocSource;
    constructor(source?: DocSource);
    parseDocs(): Promise<Promise<JSDOM>[]>;
    private parseDoms;
    selectElements(selectors: string): Promise<Promise<NodeListOf<Element>>[]>;
}
