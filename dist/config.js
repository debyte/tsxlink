"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeConfig = exports.writeConfig = exports.readConfig = exports.CONFIG_NAME = void 0;
const files_1 = require("./data/files");
exports.CONFIG_NAME = "tsxlink.config";
const readConfig = () => returnFirstConfig([
    [["mjs"], async (filePath) => {
            return eval(`import("${filePath}").then(m => m.default);`);
        }],
    [["cjs", "js"], async (filePath) => {
            // eslint-disable-next-line @typescript-eslint/no-require-imports
            return require(filePath);
        }],
    [["json"], async (filePath) => {
            return JSON.parse(await (0, files_1.readTextFile)(filePath));
        }],
]);
exports.readConfig = readConfig;
const returnFirstConfig = async (attempts) => {
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
};
const writeConfig = async (extension, config) => {
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
};
exports.writeConfig = writeConfig;
const removeConfig = async (extension) => {
    await (0, files_1.removeFile)(confPath(extension));
};
exports.removeConfig = removeConfig;
const confPath = (extension) => (0, files_1.absPath)(".", exports.CONFIG_NAME, extension);
