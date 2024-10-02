"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocPool = void 0;
const promises_1 = __importDefault(require("fs/promises"));
const jsdom_1 = require("jsdom");
class DocPool {
    constructor(sources) {
        this.sources = sources || [];
    }
    add(source) {
        this.sources.push(source);
    }
    parseDocs() {
        return this.sources.map(async (definition) => {
            let src = definition.data;
            if (definition.type === "file") {
                src = await promises_1.default.readFile(definition.data, "utf-8");
            }
            return new jsdom_1.JSDOM(src);
        });
    }
    selectElements(selectors) {
        return this.parseDocs().map(async (dom) => {
            return (await dom).window.document.querySelectorAll(selectors);
        });
    }
}
exports.DocPool = DocPool;
