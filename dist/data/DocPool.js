"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocPool = void 0;
const jsdom_1 = require("jsdom");
const files_1 = require("./files");
class DocPool {
    constructor(source, ignore) {
        this.source = source;
        this.ignore = ignore !== undefined
            ? ignore.map(i => (0, files_1.wildcardRegexp)(i))
            : [];
    }
    async parseDocs() {
        if (this.source === undefined) {
            return [];
        }
        if (["url", "zip", "dir"].includes(this.source.type)) {
            return this.parseDoms(await this.selectFiles({ extension: "html" }));
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
    async selectFiles(opt) {
        if (this.source !== undefined) {
            let select = () => true;
            if (opt.extension) {
                const end = (0, files_1.ext)(opt.extension);
                const ign = this.ignore;
                select = n => ((!end || n.toLowerCase().endsWith(end)) && ign.every(i => !i.test(n)));
            }
            else if (opt.names) {
                const names = opt.names;
                select = n => names.includes(n);
            }
            if (this.source.type === "url") {
                throw new Error("TODO implement url docs");
            }
            if (this.source.type === "zip") {
                return await (0, files_1.zipFiles)(this.source.data, select);
            }
            if (this.source.type === "dir") {
                return await (0, files_1.dirFiles)(this.source.data, select);
            }
        }
        return [];
    }
    async copyFiles(copy, dirName) {
        const files = await this.selectFiles({ names: copy.map(cp => cp.from) });
        return copy.map(cp => {
            const from = files.find(f => f.baseName === cp.from);
            return {
                baseName: cp.to,
                buffer: from === null || from === void 0 ? void 0 : from.buffer,
                content: from === null || from === void 0 ? void 0 : from.content,
                dirName
            };
        });
    }
}
exports.DocPool = DocPool;
