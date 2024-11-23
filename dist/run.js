"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.run = run;
const config_1 = require("./config");
const data_1 = require("./data");
const files_1 = require("./data/files");
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
    const tsxFiles = await syncComponents(parser, config);
    const assetsFiles = await syncAssets(parser, config);
    pr(`Synchronized ${tsxFiles.length + assetsFiles.length} linked files.`);
}
async function syncComponents(parser, config) {
    const components = await parser.getComponents();
    const fileNames = await Promise.all(await writeAndLogFiles(config.componentDir, components.map(component => ({
        baseName: `${component.name}.tsx`,
        content: (0, render_1.renderFC)(component),
    }))));
    await Promise.all(await removeAndLogFiles(config.componentDir, fileNames));
    return fileNames;
}
async function syncAssets(parser, config) {
    const fileNamePromises = [];
    if (config.exportStyleElements) {
        fileNamePromises.push(...await writeAndLogFiles(config.assetsDir, await parser.getStyleElements()));
    }
    if (config.copyCssFiles) {
        for (const writeAndCopy of await parser.getSeparateCssFiles()) {
            fileNamePromises.push(...await writeAndLogFiles(config.assetsDir, await writeAndCopy));
        }
    }
    if (config.copyJsFiles) {
        fileNamePromises.push(...await writeAndLogFiles(config.assetsDir, await parser.getSeparateJsFiles()));
    }
    const fileNames = await Promise.all(fileNamePromises);
    await Promise.all(await removeAndLogFiles(config.assetsDir, fileNames));
    return fileNames;
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
