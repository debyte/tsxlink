"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.wildcardRegexp = exports.hasExtension = exports.ext = exports.zipFiles = exports.dirFiles = exports.removeFile = exports.writeTextFile = exports.readTextFile = exports.writeFile = exports.readFile = void 0;
exports.fileExists = fileExists;
exports.filePath = filePath;
exports.writeFiles = writeFiles;
exports.copyFile = copyFile;
exports.removeMissingFiles = removeMissingFiles;
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const unzipper_1 = __importDefault(require("unzipper"));
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
const dirFiles = async (dirPath, select) => (await promises_1.default.readdir(dirPath, { recursive: true }))
    .filter(name => select(name, path_1.default.join(dirPath, name)))
    .map(name => ({
    dirName: path_1.default.dirname(name),
    baseName: path_1.default.basename(name),
    buffer: promises_1.default.readFile(path_1.default.join(dirPath, name)),
}));
exports.dirFiles = dirFiles;
const zipFiles = async (filePath, select) => (await unzipper_1.default.Open.file(filePath)).files
    .filter(file => select(file.path, file.path))
    .map(file => ({
    dirName: path_1.default.dirname(file.path),
    baseName: path_1.default.basename(file.path),
    buffer: file.buffer(),
}));
exports.zipFiles = zipFiles;
const ext = (extension) => extension ? `.${extension.toLowerCase()}` : null;
exports.ext = ext;
const hasExtension = (filePath, extension) => path_1.default.extname(filePath).toLowerCase() === (0, exports.ext)(extension);
exports.hasExtension = hasExtension;
const wildcardRegexp = (ignore) => new RegExp(`^${wcPre(ignore)}${wcPattern(ignore)}${wcPost(ignore)}$`);
exports.wildcardRegexp = wildcardRegexp;
const wcPre = (i) => i.includes("/") ? "" : "(.*/)?";
const wcPattern = (src) => src
    .replace("?", "[^/]?")
    .replace(/(?<!\*)\*(?!\*)/g, "[^/]*")
    .replace("**/", ".*");
const wcPost = (i) => i.endsWith("/") ? "(.*)?" : "(/.*)?";
function filePath(pathName, baseName, extension, dirName) {
    const p = pathName || ".";
    const f = extension ? `${baseName}${(0, exports.ext)(extension)}` : baseName;
    return path_1.default.join(p, dirName || "", f);
}
async function writeFiles(dirPath, files) {
    const subDirs = new Set(files.map(f => f.dirName || ""));
    for (const dirName of subDirs) {
        await promises_1.default.mkdir(path_1.default.join(dirPath, dirName), { recursive: true });
    }
    return files.map(async (file) => {
        const p = filePath(dirPath, file.baseName, undefined, file.dirName);
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
    return (await (0, exports.dirFiles)(dirPath, (_, p) => !keepFilePaths.includes(p))).map(async (file) => {
        const p = filePath(dirPath, file.baseName, undefined, file.dirName);
        await (0, exports.removeFile)(p);
        return p;
    });
}
