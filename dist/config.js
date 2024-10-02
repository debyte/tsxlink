"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeConfig = exports.writeConfig = exports.readConfig = void 0;
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const readConfig = (baseName) => returnFirstConfig([
    () => findFiles(baseName, ["mjs"], async (filePath) => {
        return eval(`import("${filePath}").then(m => m.default);`);
    }),
    () => findFiles(baseName, ["cjs", "js"], async (filePath) => {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        return require(filePath);
    }),
    () => findFiles(baseName, ["json"], async (filePath) => {
        return JSON.parse(await promises_1.default.readFile(filePath, "utf-8"));
    }),
]);
exports.readConfig = readConfig;
const returnFirstConfig = async (attempts) => {
    for (const attempt of attempts) {
        const config = await attempt();
        if (config !== null) {
            return config;
        }
    }
    return null;
};
const findFiles = async (baseName, extensions, loader) => {
    for (const ext of extensions) {
        const p = absPath(baseName, ext);
        if (await fileExists(p)) {
            const config = await loader(p);
            config.configExtension = ext;
            return config;
        }
    }
    return null;
};
const fileExists = async (filePath) => {
    try {
        await promises_1.default.stat(filePath);
        return true;
    }
    catch {
        return false;
    }
};
const writeConfig = async (baseName, ext, config) => {
    const json = JSON.stringify(config, null, 2);
    if (ext === "mjs") {
        await writeFile(baseName, ext, `export default ${json}\n`);
    }
    else if (ext === "cjs" || ext === "js") {
        await writeFile(baseName, ext, `module.exports = ${json};\n`);
    }
    else if (ext === "json") {
        await writeFile(baseName, ext, `${json}\n`);
    }
};
exports.writeConfig = writeConfig;
const writeFile = async (baseName, ext, content) => {
    await promises_1.default.writeFile(absPath(baseName, ext), content, "utf-8");
};
const removeConfig = async (baseName, ext) => {
    await promises_1.default.unlink(absPath(baseName, ext));
};
exports.removeConfig = removeConfig;
const absPath = (baseName, ext) => path_1.default.resolve(`./${baseName}.${ext}`);
