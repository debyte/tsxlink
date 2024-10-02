import { JSDOM } from "jsdom";
export type DocSource = {
    type: "string" | "file";
    data: string;
};
export declare class DocPool {
    sources: DocSource[];
    constructor(sources?: DocSource[]);
    add(source: DocSource): void;
    parseDocs(): Promise<JSDOM>[];
    selectElements(selectors: string): Promise<NodeListOf<Element>>[];
}
