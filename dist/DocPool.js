"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocPool = void 0;
const jsdom_1 = require("jsdom");
const files_1 = require("./files");
class DocPool {
    constructor(source) {
        this.source = source;
    }
    async parseDocs() {
        if (this.source === undefined) {
            return [];
        }
        if (this.source.type === "zip") {
            return this.parseDoms(await (0, files_1.zipFiles)(this.source.data, "html"));
        }
        if (this.source.type === "dir") {
            return this.parseDoms(await (0, files_1.dirFiles)(this.source.data, "html"));
        }
        if (this.source.type === "file") {
            return this.parseDoms([(0, files_1.readFile)(this.source.data)]);
        }
        return [Promise.resolve(new jsdom_1.JSDOM(this.source.data))];
    }
    parseDoms(buffers) {
        return buffers.map(async (buf) => new jsdom_1.JSDOM(await buf));
    }
    async selectElements(selectors) {
        const docs = await this.parseDocs();
        return docs.map(async (dom) => {
            return (await dom).window.document.querySelectorAll(selectors);
        });
    }
}
exports.DocPool = DocPool;
