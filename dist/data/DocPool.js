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
        if (["url", "zip", "dir"].includes(this.source.type)) {
            return this.parseDoms(await this.filesByExtension("html"));
        }
        if (this.source.type === "file") {
            return this.parseDoms([
                { baseName: "", buffer: (0, files_1.readFile)(this.source.data) },
            ]);
        }
        return [Promise.resolve(new jsdom_1.JSDOM(this.source.data))];
    }
    parseDoms(data) {
        return data.map(async ({ buffer }) => new jsdom_1.JSDOM(await buffer));
    }
    async selectElements(selectors) {
        const docs = await this.parseDocs();
        return docs.map(async (dom) => {
            return (await dom).window.document.querySelectorAll(selectors);
        });
    }
    async filesByExtension(extension) {
        if (this.source !== undefined) {
            if (this.source.type === "url") {
                throw new Error("TODO implement url docs");
            }
            if (this.source.type === "zip") {
                return await (0, files_1.zipFiles)(this.source.data, extension);
            }
            if (this.source.type === "dir") {
                return await (0, files_1.dirFiles)(this.source.data, extension);
            }
        }
        return [];
    }
}
exports.DocPool = DocPool;
