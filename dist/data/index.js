"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDocPool = void 0;
const DocPool_1 = require("./DocPool");
const files_1 = require("./files");
const createDocPool = async (source) => {
    if (source.match(/^https?:\/\/\w+/)) {
        return new DocPool_1.DocPool({ type: "url", data: source });
    }
    const stats = await (0, files_1.fileExists)(source);
    if (stats === null) {
        return null;
    }
    if (stats.isDirectory) {
        return new DocPool_1.DocPool({ type: "dir", data: source });
    }
    if ((0, files_1.hasExtension)(source, "zip")) {
        return new DocPool_1.DocPool({ type: "zip", data: source });
    }
    return new DocPool_1.DocPool({ type: "file", data: source });
};
exports.createDocPool = createDocPool;
