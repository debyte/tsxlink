"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocPool = void 0;
const jsdom_1 = require("jsdom");
const path_1 = __importDefault(require("path"));
const files_1 = require("./files");
const paths_1 = require("./paths");
class DocPool {
    constructor(source, ignore) {
        this.source = source;
        this.ignore = ignore !== undefined
            ? ignore.map(i => (0, paths_1.wildcardFileRegexp)(i))
            : [];
    }
    async parseDocs() {
        if (this.source === undefined) {
            return [];
        }
        if (["url", "zip", "dir"].includes(this.source.type)) {
            return await this.parseDoms(await this.selectFiles({ extension: "html" }));
        }
        if (this.source.type === "file") {
            return await this.parseDoms([
                { baseName: "", buffer: (0, files_1.readFile)(this.source.data) },
            ]);
        }
        return [new jsdom_1.JSDOM(this.source.data)];
    }
    async parseDoms(data) {
        const doms = [];
        for (const { buffer } of data) {
            doms.push(new jsdom_1.JSDOM(await buffer));
        }
        return doms;
    }
    async selectElements(selectors) {
        if (this.cache === undefined) {
            this.cache = await this.parseDocs();
        }
        const elements = [];
        for (const dom of this.cache) {
            elements.push(...dom.window.document.querySelectorAll(selectors));
        }
        return elements;
    }
    async selectFiles(opt) {
        if (this.source !== undefined) {
            let select = () => true;
            if (opt.extension) {
                const end = (0, paths_1.ext)(opt.extension);
                const ign = this.ignore;
                select = n => ((!end || n.toLowerCase().endsWith(end))
                    && ign.every(i => n.match(i) === null));
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
            if (this.source.type === "string" && opt.names) {
                return (0, files_1.emptyFiles)(opt.names); // For tests
            }
        }
        return [];
    }
    async copyFiles(relDir, copy) {
        const names = copy.map(({ from }) => from.startsWith("/") ? from.slice(1) : path_1.default.join(relDir, from));
        const out = [];
        for (const file of await this.selectFiles({ names })) {
            const i = names.findIndex(name => name === path_1.default.join(file.dirName || ".", file.baseName));
            if (i >= 0) {
                out.push((0, files_1.copyFile)(file, copy[i].to));
            }
        }
        return out;
    }
}
exports.DocPool = DocPool;
