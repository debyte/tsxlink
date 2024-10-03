"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeMissingFiles = exports.writeFiles = exports.absPath = exports.hasExtension = exports.zipFiles = exports.dirFiles = exports.removeFile = exports.writeTextFile = exports.readTextFile = exports.writeFile = exports.readFile = exports.fileExists = void 0;
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const unzipper_1 = __importDefault(require("unzipper"));
const fileExists = async (filePath) => {
    try {
        const stats = await promises_1.default.stat(filePath);
        return { isDirectory: stats.isDirectory() };
    }
    catch {
        return null;
    }
};
exports.fileExists = fileExists;
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
const dirFiles = async (dirPath, onlyExtension) => {
    const end = extensionEnding(onlyExtension);
    return (await promises_1.default.readdir(dirPath)).filter(name => !end || name.toLowerCase().endsWith(end)).map(name => ({
        baseName: name,
        buffer: promises_1.default.readFile(path_1.default.join(dirPath, name)),
    }));
};
exports.dirFiles = dirFiles;
const zipFiles = async (filePath, onlyExtension) => {
    const end = extensionEnding(onlyExtension);
    return (await unzipper_1.default.Open.file(filePath)).files.filter(file => !end || file.path.toLowerCase().endsWith(end)).map(file => ({
        baseName: path_1.default.basename(file.path),
        buffer: file.buffer(),
    }));
};
exports.zipFiles = zipFiles;
const extensionEnding = (extension) => extension ? `.${extension.toLowerCase()}` : null;
const hasExtension = (filePath, extension) => path_1.default.extname(filePath).toLowerCase() === `.${extension.toLowerCase()}`;
exports.hasExtension = hasExtension;
const absPath = (pathName, baseName, extension) => path_1.default.resolve(path_1.default.join(pathName || ".", extension ? `${baseName}.${extension.toLowerCase()}` : baseName));
exports.absPath = absPath;
const writeFiles = async (dirPath, files) => {
    await promises_1.default.mkdir(dirPath, { recursive: true });
    return files.map(async (file) => {
        const path = (0, exports.absPath)(dirPath, file.baseName);
        if (file.buffer !== undefined) {
            await (0, exports.writeFile)(path, await file.buffer);
        }
        else {
            await (0, exports.writeTextFile)(path, file.content || "");
        }
        return file.baseName;
    });
};
exports.writeFiles = writeFiles;
const removeMissingFiles = async (dirPath, keepFileNames) => (await (0, exports.dirFiles)(dirPath)).filter(file => !keepFileNames.includes(file.baseName)).map(async (file) => {
    await (0, exports.removeFile)(path_1.default.join(dirPath, file.baseName));
    return file.baseName;
});
exports.removeMissingFiles = removeMissingFiles;
