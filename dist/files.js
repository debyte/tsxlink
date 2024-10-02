"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.absPath = exports.findFirstFile = exports.zipFiles = exports.dirFiles = exports.removeFile = exports.writeTextFile = exports.readTextFile = exports.readFile = exports.fileExists = void 0;
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const unzipper_1 = __importDefault(require("unzipper"));
const fileExists = async (filePath) => {
    try {
        await promises_1.default.stat(filePath);
        return true;
    }
    catch {
        return false;
    }
};
exports.fileExists = fileExists;
const readFile = (filePath) => promises_1.default.readFile(filePath);
exports.readFile = readFile;
const readTextFile = (filePath) => promises_1.default.readFile(filePath, "utf8");
exports.readTextFile = readTextFile;
const writeTextFile = (filePath, content) => promises_1.default.writeFile(filePath, content, "utf8");
exports.writeTextFile = writeTextFile;
const removeFile = (filePath) => promises_1.default.unlink(filePath);
exports.removeFile = removeFile;
const dirFiles = async (dirPath, onlyExtension) => {
    const files = await promises_1.default.readdir(dirPath);
    const end = extensionEnding(onlyExtension);
    return files
        .filter(name => !end || name.endsWith(end))
        .map(name => promises_1.default.readFile(path_1.default.join(dirPath, name)));
};
exports.dirFiles = dirFiles;
const zipFiles = async (filePath, onlyExtension) => {
    const dir = await unzipper_1.default.Open.file(filePath);
    const end = extensionEnding(onlyExtension);
    return dir.files
        .filter(({ path }) => !end || path.endsWith(end))
        .map(file => file.buffer());
};
exports.zipFiles = zipFiles;
const findFirstFile = async (filePaths) => {
    for (const filePath of filePaths) {
        if (await (0, exports.fileExists)(filePath)) {
            return filePath;
        }
    }
    return null;
};
exports.findFirstFile = findFirstFile;
const extensionEnding = (extension) => extension ? `.${extension}` : null;
const absPath = (parts, extension) => parts.length > 0
    ? path_1.default.resolve(path_1.default.join(...parts.slice(0, -1), extension ? `${parts.at(-1)}.${extension}` : parts.at(-1))) : "";
exports.absPath = absPath;
