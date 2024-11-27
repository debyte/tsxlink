"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.baseName = exports.hasExtension = exports.ext = void 0;
exports.filePath = filePath;
exports.relativePath = relativePath;
exports.urlToFilePath = urlToFilePath;
exports.wildcardRegexp = wildcardRegexp;
exports.wildcardFileRegexp = wildcardFileRegexp;
const path_1 = __importDefault(require("path"));
const ext = (extension) => extension ? `.${extension.toLowerCase()}` : null;
exports.ext = ext;
const hasExtension = (filePath, extension) => path_1.default.extname(filePath).toLowerCase() === (0, exports.ext)(extension);
exports.hasExtension = hasExtension;
const baseName = (filePath) => path_1.default.basename(filePath);
exports.baseName = baseName;
function filePath(pathName, baseName, extension, dirName) {
    const p = pathName || ".";
    const f = extension ? `${baseName}${(0, exports.ext)(extension)}` : baseName;
    return path_1.default.join(p, dirName || "", f);
}
function relativePath(from, to) {
    let p = from;
    let rStart = ".";
    while (!to.startsWith(p) && p !== ".") {
        p = path_1.default.dirname(p);
        rStart = path_1.default.join(rStart, "..");
    }
    const rEnd = p !== "." ? to.substring(p.length + 1) : to;
    return path_1.default.join(rStart, rEnd);
}
function urlToFilePath(url) {
    if (url && !url.startsWith("#") && !url.match(/^\w+:.*/)) {
        const parts = url.match(/^([^?#]+)(.*)$/);
        if (parts && parts[1]) {
            return parts[1];
        }
    }
    return null;
}
function wildcardRegexp(match, preRegExp, postRegExp, flags) {
    const b = preRegExp || "^";
    const m = match
        .replace(/(?<!\\)\?/g, ".?")
        .replace(/(?<!\\)\*/g, ".*");
    const e = postRegExp || "$";
    return new RegExp(`${b}${m}${e}`, flags);
}
function wildcardFileRegexp(match) {
    // If no slashes, match against base name
    const b = match.includes("/") ? "" : "(.*/)?";
    // Wildcard matching
    const m = match
        .replace("?", "[^/]?")
        .replace(/(?<!\*)\*(?!\*)/g, "[^/]*")
        .replace("**/", ".*");
    // Match possible subdirs
    const e = match.endsWith("/") ? ".*" : "(/.*)?";
    return new RegExp(`^${b}${m}${e}$`);
}
