"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.run = void 0;
const config_1 = require("./config");
const data_1 = require("./data");
const files_1 = require("./data/files");
const init_1 = require("./init");
const parse_1 = require("./parse");
const render_1 = require("./render");
const run = async () => {
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
    const docs = await (0, data_1.createDocPool)(source);
    if (docs === null) {
        pr("The provided source is not an existing path or a valid HTTP URL.");
        process.exit(0);
    }
    // Process
    pr("Parsing and synchronizing.");
    const parser = (0, parse_1.selectParser)(docs, config.sourceType);
    const components = await parser.getComponents();
    const tsxFileNames = await Promise.all(await writeAndLogFiles(true, config.targetDir, components.map(component => ({
        baseName: `${component.name}.tsx`,
        content: (0, render_1.renderFC)(component),
    }))));
    await Promise.all(await removeAndLogFiles(config.targetDir, tsxFileNames));
    const publicFileNames = await Promise.all([
        ...await writeAndLogFiles(config.writeCssFiles, config.targetPublicDir, await parser.getPublicCssFiles()),
        ...await writeAndLogFiles(config.writeJsFiles, config.targetPublicDir, await parser.getPublicJsFiles()),
    ]);
    await Promise.all(await removeAndLogFiles(config.targetPublicDir, publicFileNames));
    const n = tsxFileNames.length + publicFileNames.length;
    pr(`Synchronized ${n} linked files.`);
};
exports.run = run;
const writeAndLogFiles = async (writeFlag, dirPath, files) => (writeFlag
    ? prNamePromises(await (0, files_1.writeFiles)(dirPath, files), name => `  + ${name}`)
    : []);
const removeAndLogFiles = async (dirPath, keepFileNames) => prNamePromises(await (0, files_1.removeMissingFiles)(dirPath, keepFileNames), name => `  - ${name}`);
const prNamePromises = (promises, format) => promises.map(async (namePromise) => {
    const name = await namePromise;
    pr(format(name));
    return name;
});
const pr = (...lines) => console.log(lines.join("\n"));
