"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDocPool = createDocPool;
const DocPool_1 = require("./DocPool");
const files_1 = require("./files");
async function createDocPool(source, ignore) {
    if (source.match(/^https?:\/\/\w+/)) {
        return new DocPool_1.DocPool({ type: "url", data: source }, ignore);
    }
    const stats = await (0, files_1.fileExists)(source);
    if (stats === null) {
        return null;
    }
    if (stats.isDirectory) {
        return new DocPool_1.DocPool({ type: "dir", data: source }, ignore);
    }
    if ((0, files_1.hasExtension)(source, "zip")) {
        return new DocPool_1.DocPool({ type: "zip", data: source }, ignore);
    }
    return new DocPool_1.DocPool({ type: "file", data: source }, ignore);
}
;
