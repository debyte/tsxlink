"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeFile = exports.writeTextFile = exports.readTextFile = exports.writeFile = exports.readFile = void 0;
exports.fileExists = fileExists;
exports.dirFiles = dirFiles;
exports.zipFiles = zipFiles;
exports.emptyFiles = emptyFiles;
exports.writeFiles = writeFiles;
exports.copyFile = copyFile;
exports.removeMissingFiles = removeMissingFiles;
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const unzipper_1 = __importDefault(require("unzipper"));
const paths_1 = require("./paths");
async function fileExists(filePath) {
    try {
        const stats = await promises_1.default.stat(filePath);
        return { isDirectory: stats.isDirectory() };
    }
    catch {
        return null;
    }
}
const readFile = (filePath) => promises_1.default.readFile(filePath);
exports.readFile = readFile;
const writeFile = (filePath, content) => promises_1.default.writeFile(filePath, content);
exports.writeFile = writeFile;
const readTextFile = (filePath) => promises_1.default.readFile(filePath, "utf8");
exports.readTextFile = readTextFile;
const writeTextFile = (filePath, content) => promises_1.default.writeFile(filePath, content, "utf8");
exports.writeTextFile = writeTextFile;
const removeFile = (filePath) => promises_1.default.unlink(filePath);
exports.removeFile = removeFile;
async function dirFiles(dirPath, select) {
    const files = [];
    for (const filePath of await promises_1.default.readdir(dirPath, { recursive: true })) {
        const p = path_1.default.join(dirPath, filePath);
        if (select(filePath, p) && (await promises_1.default.lstat(p)).isFile()) {
            files.push({
                dirName: path_1.default.dirname(filePath),
                baseName: path_1.default.basename(filePath),
                buffer: promises_1.default.readFile(p),
            });
        }
    }
    return files;
}
async function zipFiles(filePath, select) {
    const files = [];
    for (const file of (await unzipper_1.default.Open.file(filePath)).files) {
        if (select(file.path, file.path)) {
            files.push({
                dirName: path_1.default.dirname(file.path),
                baseName: path_1.default.basename(file.path),
                buffer: file.buffer(),
            });
        }
    }
    return files;
}
function emptyFiles(names) {
    return names.map(p => ({
        dirName: path_1.default.dirname(p),
        baseName: path_1.default.basename(p),
        content: "",
    }));
}
async function writeFiles(dirPath, files) {
    const subDirs = new Set(files.map(f => f.dirName || ""));
    for (const dirName of subDirs) {
        await promises_1.default.mkdir(path_1.default.join(dirPath, dirName), { recursive: true });
    }
    return files.map(async (file) => {
        const p = (0, paths_1.filePath)(dirPath, file.baseName, undefined, file.dirName);
        if (file.buffer !== undefined) {
            await (0, exports.writeFile)(p, await file.buffer);
        }
        else {
            await (0, exports.writeTextFile)(p, file.content || "");
        }
        return p;
    });
}
;
function copyFile(src, filePath) {
    const dirName = path_1.default.dirname(filePath);
    const baseName = path_1.default.basename(filePath);
    return src.buffer !== undefined
        ? { baseName, buffer: src.buffer, dirName }
        : { baseName, content: src.content || "", dirName };
}
async function removeMissingFiles(dirPath, keepFilePaths) {
    return (await dirFiles(dirPath, (_, p) => !keepFilePaths.includes(p))).map(async (file) => {
        const p = (0, paths_1.filePath)(dirPath, file.baseName, undefined, file.dirName);
        await (0, exports.removeFile)(p);
        return p;
    });
}
