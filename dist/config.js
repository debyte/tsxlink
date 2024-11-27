"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.readConfig = exports.CONFIG_NAME = void 0;
exports.writeConfig = writeConfig;
exports.removeConfig = removeConfig;
const path_1 = __importDefault(require("path"));
const files_1 = require("./data/files");
const paths_1 = require("./data/paths");
exports.CONFIG_NAME = "tsxlink.config";
const readConfig = () => returnFirstConfig([
    [["mjs"], async (filePath) => {
            const p = path_1.default.resolve(filePath);
            return eval(`import("${p}").then(m => m.default);`);
        }],
    [["cjs", "js"], async (filePath) => {
            const p = path_1.default.resolve(filePath);
            // eslint-disable-next-line @typescript-eslint/no-require-imports
            return require(p);
        }],
    [["json"], async (filePath) => {
            return JSON.parse(await (0, files_1.readTextFile)(filePath));
        }],
]);
exports.readConfig = readConfig;
async function returnFirstConfig(attempts) {
    for (const [extensions, loader] of attempts) {
        for (const ext of extensions) {
            const filePath = confPath(ext);
            if (await (0, files_1.fileExists)(filePath)) {
                const config = await loader(filePath);
                config.configExtension = ext;
                return config;
            }
        }
    }
    return null;
}
async function writeConfig(extension, config) {
    const filePath = confPath(extension);
    const json = JSON.stringify(config, null, 2);
    if (extension === "mjs") {
        await (0, files_1.writeTextFile)(filePath, `const tsxlinkConfig = ${json};\n\nexport default tsxlinkConfig;\n`);
    }
    else if (extension === "cjs" || extension === "js") {
        await (0, files_1.writeTextFile)(filePath, `module.exports = ${json};\n`);
    }
    else if (extension === "json") {
        await (0, files_1.writeTextFile)(filePath, `${json}\n`);
    }
    return filePath;
}
async function removeConfig(extension) {
    await (0, files_1.removeFile)(confPath(extension));
}
const confPath = (extension) => (0, paths_1.filePath)(".", exports.CONFIG_NAME, extension);
