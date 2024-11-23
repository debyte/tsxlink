"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.copyFile = exports.wildcardRegexp = exports.hasExtension = exports.ext = exports.zipFiles = exports.dirFiles = exports.removeFile = exports.writeTextFile = exports.readTextFile = exports.writeFile = exports.readFile = void 0;
exports.fileExists = fileExists;
exports.absPath = absPath;
exports.writeFiles = writeFiles;
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
const dirFiles = async (dirPath, select) => (await promises_1.default.readdir(dirPath))
    .filter(name => select(name))
    .map(name => ({
    baseName: name,
    buffer: promises_1.default.readFile(path_1.default.join(dirPath, name)),
}));
exports.dirFiles = dirFiles;
const zipFiles = async (filePath, select) => (await unzipper_1.default.Open.file(filePath)).files
    .filter(file => select(file.path))
    .map(file => ({
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
function absPath(pathName, baseName, extension, dirName) {
    const p = pathName || ".";
    const f = extension ? `${baseName}${(0, exports.ext)(extension)}` : baseName;
    return path_1.default.resolve(dirName ? path_1.default.join(p, dirName, f) : path_1.default.join(p, f));
}
async function writeFiles(dirPath, files) {
    await promises_1.default.mkdir(dirPath, { recursive: true });
    return files.map(async (file) => {
        if (file.dirName !== undefined) {
            await promises_1.default.mkdir(path_1.default.join(dirPath, file.dirName), { recursive: true });
        }
        const filePath = absPath(dirPath, file.baseName, undefined, file.dirName);
        if (file.buffer !== undefined) {
            await (0, exports.writeFile)(filePath, await file.buffer);
        }
        else {
            await (0, exports.writeTextFile)(filePath, file.content || "");
        }
        return file.baseName;
    });
}
;
const copyFile = (src, baseName, dirName) => (src.buffer !== undefined
    ? { baseName, buffer: src.buffer, dirName }
    : { baseName, content: src.content || "", dirName });
exports.copyFile = copyFile;
async function removeMissingFiles(dirPath, keepFileNames) {
    return (await (0, exports.dirFiles)(dirPath, n => !keepFileNames.includes(n))).map(async (file) => {
        await (0, exports.removeFile)(path_1.default.join(dirPath, file.baseName));
        return file.baseName;
    });
}
