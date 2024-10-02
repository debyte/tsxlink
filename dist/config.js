"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeConfig = exports.writeConfig = exports.readConfig = exports.CONFIG_NAME = void 0;
const files_1 = require("./files");
exports.CONFIG_NAME = "tsxlink.config";
const readConfig = () => returnFirstConfig([
    () => tryToLoadConfig(["mjs"], async (filePath) => {
        return eval(`import("${filePath}").then(m => m.default);`);
    }),
    () => tryToLoadConfig(["cjs", "js"], async (filePath) => {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        return require(filePath);
    }),
    () => tryToLoadConfig(["json"], async (filePath) => {
        return JSON.parse(await (0, files_1.readTextFile)(filePath));
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
const tryToLoadConfig = async (extensions, loader) => {
    for (const ext of extensions) {
        const filePath = confPath(ext);
        if (await (0, files_1.fileExists)(filePath)) {
            const config = await loader(filePath);
            config.configExtension = ext;
            return config;
        }
    }
    return null;
};
const writeConfig = async (ext, config) => {
    const json = JSON.stringify(config, null, 2);
    if (ext === "mjs") {
        await (0, files_1.writeTextFile)(confPath(ext), `export default ${json}\n`);
    }
    else if (ext === "cjs" || ext === "js") {
        await (0, files_1.writeTextFile)(confPath(ext), `module.exports = ${json};\n`);
    }
    else if (ext === "json") {
        await (0, files_1.writeTextFile)(confPath(ext), `${json}\n`);
    }
};
exports.writeConfig = writeConfig;
const removeConfig = async (ext) => {
    await (0, files_1.removeFile)(confPath(ext));
};
exports.removeConfig = removeConfig;
const confPath = (extension) => (0, files_1.absPath)([".", exports.CONFIG_NAME], extension);
