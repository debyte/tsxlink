"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.run = run;
const config_1 = require("./config");
const data_1 = require("./data");
const files_1 = require("./data/files");
const paths_1 = require("./data/paths");
const init_1 = require("./init");
const parse_1 = require("./parse");
const render_1 = require("./render");
async function run() {
    pr(",=0=0=0=0=(__    T  S  X    L  I  N  K    __)=0=0=0=0='");
    const isUsage = ["help", "--help", "-h"].some(arg => process.argv.includes(arg));
    const isInit = process.argv.includes("init");
    const storedConfig = isUsage ? null : await (0, config_1.readConfig)();
    // Usage
    if (isUsage || (storedConfig === null && !isInit)) {
        pr("Link components from HTML design systems to presentation TSX in React.", "Read more at https://github.com/debyte/tsxlink", "Usage:", "  Run `tsxlink help` to show this usage.", "  Run `tsxlink init` to interactively configure the link.", "  Once configured, run `tsxlink [source]` to synchronize changes.");
        if (!isUsage && storedConfig === null) {
            pr("No configuration found at `tsxlink.config.(mjs|cjs|js|json)`.");
        }
        process.exit(0);
    }
    // Configure
    if (isInit) {
        const newConfig = {
            version: 1,
            ...await (0, init_1.runInteractiveInit)(storedConfig || {}),
        };
        const ext = newConfig.configExtension;
        newConfig.configExtension = undefined;
        if ((storedConfig === null || storedConfig === void 0 ? void 0 : storedConfig.configExtension) && ext !== storedConfig.configExtension) {
            await (0, config_1.removeConfig)(storedConfig.configExtension);
        }
        const filePath = await (0, config_1.writeConfig)(ext, newConfig);
        pr(`Configuration succesfully written to ${filePath}`);
        process.exit(0);
    }
    const config = (0, init_1.applyDefaults)(storedConfig);
    // Check source
    const source = process.argv.length > 2 ? process.argv[2] : config.source;
    if (source === undefined) {
        pr("Provide data source as a command line argument (or in configuration).");
        process.exit(0);
    }
    const docs = await (0, data_1.createDocPool)(source, config.ignoreFiles);
    if (docs === null) {
        pr("The provided source is not an existing path or a valid HTTP URL.");
        process.exit(0);
    }
    // Process
    pr("Parsing and synchronizing.");
    const parser = (0, parse_1.selectParser)(docs, config);
    const [componentFiles, assetFiles] = await updateComponents(parser, config);
    assetFiles.push(...await updateAssets(parser, config));
    await Promise.all([
        ...await removeAndLogFiles(config.componentDir, componentFiles),
        ...await removeAndLogFiles(config.assetsDir, assetFiles),
    ]);
    const n = componentFiles.length + assetFiles.length;
    pr(`Synchronized ${n} linked files.`);
}
async function updateComponents(parser, config) {
    const componentFileNamePromises = [];
    const assetFileNamePromises = [];
    let writeLib = false;
    for (const component of await parser.getComponents()) {
        const [componentFile, assetFiles, usesLib] = await (0, render_1.renderComponent)(config, parser.docs, component);
        componentFileNamePromises.push(...await writeAndLogFiles(config.componentDir, [componentFile]));
        assetFileNamePromises.push(...await writeAndLogFiles(config.assetsDir, assetFiles));
        writeLib = writeLib || usesLib;
    }
    if (writeLib) {
        componentFileNamePromises.push(...await writeAndLogFiles(config.componentDir, [{
                baseName: "tsxlinkLib.ts",
                buffer: (0, files_1.readFile)((0, paths_1.filePath)(__dirname, "tsxlinkLib.ts")),
            }]));
    }
    return [
        await Promise.all(componentFileNamePromises),
        await Promise.all(assetFileNamePromises),
    ];
}
async function updateAssets(parser, config) {
    const fileNamePromises = [];
    if (config.exportStyleElements) {
        fileNamePromises.push(...await writeAndLogFiles(config.assetsDir, await parser.getStyleElements()));
    }
    if (config.copyMarkedFiles) {
        fileNamePromises.push(...await writeAndLogFiles(config.assetsDir, await parser.getAssetFiles()));
    }
    if (config.copyCssFiles) {
        for (const writeAndCopy of await parser.getSeparateCssFiles()) {
            fileNamePromises.push(...await writeAndLogFiles(config.assetsDir, await writeAndCopy));
        }
    }
    if (config.copyJsFiles) {
        fileNamePromises.push(...await writeAndLogFiles(config.assetsDir, await parser.getSeparateJsFiles()));
    }
    return await Promise.all(fileNamePromises);
}
async function writeAndLogFiles(dirPath, files) {
    return prNamePromises(await (0, files_1.writeFiles)(dirPath, files), name => ` + ${name}`);
}
async function removeAndLogFiles(dirPath, keepFileNames) {
    return prNamePromises(await (0, files_1.removeMissingFiles)(dirPath, keepFileNames), name => `  - ${name}`);
}
function prNamePromises(promises, format) {
    return promises.map(async (namePromise) => {
        const name = await namePromise;
        pr(format(name));
        return name;
    });
}
const pr = (...lines) => console.log(lines.join("\n"));
